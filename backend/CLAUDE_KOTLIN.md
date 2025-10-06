# Kotlin Backend Agent Guidelines

**Context**: Manager Mindset Feedback Tool - Kotlin + Ktor + MongoDB backend
**User Note**: Developer is new to Kotlin ecosystem - provide clear explanations

---

## Technology Stack

### Core Framework: Ktor 2.x
- Lightweight Kotlin web framework by JetBrains
- Asynchronous by design (built on coroutines)
- DSL-based routing and configuration
- Plugin-based architecture

### Database: KMongo
- Kotlin wrapper for MongoDB Java driver
- Type-safe DSL for queries
- Built-in coroutines support
- Simplifies CRUD operations

### Serialization: kotlinx.serialization
- Kotlin-native JSON serialization
- Compile-time code generation
- Type-safe (no reflection)
- Use `@Serializable` annotation on data classes

### Testing: Kotest + MockK
- **Kotest**: Kotlin-first testing framework with multiple styles
- **MockK**: Mocking library designed for Kotlin
- Ktor test utilities for HTTP endpoint testing

---

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   ├── Application.kt        # Main entry point
│   │   │   ├── models/               # Data classes (Profile, FeedbackResponse, etc.)
│   │   │   ├── repositories/         # MongoDB data access layer
│   │   │   ├── services/             # Business logic
│   │   │   ├── api/                  # REST endpoints (routes)
│   │   │   └── config/               # Configuration loading
│   │   └── resources/
│   │       ├── application.conf      # Ktor + MongoDB config
│   │       └── traits.json           # Trait questions config
│   └── test/
│       ├── kotlin/
│       │   ├── contract/             # API contract tests
│       │   ├── integration/          # End-to-end tests
│       │   └── unit/                 # Unit tests
│       └── resources/
│           └── application-test.conf # Test configuration
├── build.gradle.kts                  # Gradle build script (Kotlin DSL)
└── gradle.properties
```

---

## Ktor Basics for Beginners

### Application Setup (Application.kt)
```kotlin
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*

fun main() {
    embeddedServer(Netty, port = 8080, module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    configureSerialization()
    configureCORS()
    configureRouting()
    configureMongoDB()
}
```

### Routing DSL
```kotlin
import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import io.ktor.http.*

fun Application.configureRouting() {
    routing {
        route("/api") {
            get("/traits") {
                // Return trait questions
                call.respond(HttpStatusCode.OK, traitsConfig)
            }

            post("/profiles") {
                // Create profile
                val profile = profileService.createProfile()
                call.respond(HttpStatusCode.Created, profile)
            }

            get("/profiles/{feedbackLinkId}") {
                val linkId = call.parameters["feedbackLinkId"]
                    ?: return@get call.respond(HttpStatusCode.BadRequest)

                val profile = profileService.getProfile(linkId)
                if (profile != null) {
                    call.respond(HttpStatusCode.OK, profile)
                } else {
                    call.respond(HttpStatusCode.NotFound)
                }
            }
        }
    }
}
```

### Content Negotiation (JSON)
```kotlin
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

fun Application.configureSerialization() {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
    }
}
```

### CORS Configuration
```kotlin
import io.ktor.server.plugins.cors.routing.*
import io.ktor.http.*

fun Application.configureCORS() {
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        anyHost() // For development only - restrict in production
    }
}
```

---

## Data Models

### Example: Profile Entity
```kotlin
import kotlinx.serialization.Serializable
import org.bson.types.ObjectId
import java.time.Instant

@Serializable
data class Profile(
    val id: String = ObjectId().toString(),
    val feedbackLinkId: String,
    val adminLinkId: String,
    val createdAt: String = Instant.now().toString(),
    val responses: List<FeedbackResponse> = emptyList()
)

@Serializable
data class FeedbackResponse(
    val respondentId: String,
    val respondentName: String = "Anonymous",
    val submittedAt: String,
    val traits: List<TraitRating>
)

@Serializable
data class TraitRating(
    val traitId: String,
    val value: Int // 1-5
) {
    init {
        require(value in 1..5) { "Trait value must be between 1 and 5" }
    }
}
```

**Notes**:
- Use `@Serializable` for JSON serialization
- Use `String` for ObjectId in API responses (convert internally)
- Use `String` for timestamps (ISO 8601) in API layer
- Data classes provide equals(), hashCode(), copy() automatically

---

## MongoDB with KMongo

### Setup Connection
```kotlin
import com.mongodb.kotlin.client.coroutine.MongoClient
import org.litote.kmongo.coroutine.*

object MongoDatabase {
    private val client = MongoClient.create("mongodb://localhost:27017")
    val database = client.getDatabase("mindset_feedback")
    val profiles = database.getCollection<Profile>("profiles")
}
```

### CRUD Operations
```kotlin
class ProfileRepository {
    private val collection = MongoDatabase.profiles

    suspend fun create(profile: Profile): Profile {
        collection.insertOne(profile)
        return profile
    }

    suspend fun findByFeedbackLinkId(linkId: String): Profile? {
        return collection.findOne(Profile::feedbackLinkId eq linkId)
    }

    suspend fun findByAdminLinkId(linkId: String): Profile? {
        return collection.findOne(Profile::adminLinkId eq linkId)
    }

    suspend fun addResponse(feedbackLinkId: String, response: FeedbackResponse): Boolean {
        // Remove existing response with same respondentId
        collection.updateOne(
            Profile::feedbackLinkId eq feedbackLinkId,
            pull(Profile::responses, FeedbackResponse::respondentId eq response.respondentId)
        )

        // Add new response
        val result = collection.updateOne(
            Profile::feedbackLinkId eq feedbackLinkId,
            push(Profile::responses, response)
        )

        return result.modifiedCount > 0
    }
}
```

**KMongo Query DSL**:
- `Profile::feedbackLinkId eq "value"` - Type-safe property reference
- `findOne()` returns nullable result
- `updateOne()` returns result with modifiedCount
- `push()`, `pull()` for array operations

---

## Coroutines Basics

Ktor handlers are `suspend` functions - they can call other suspend functions without blocking:

```kotlin
suspend fun fetchProfile(linkId: String): Profile? {
    return profileRepository.findByFeedbackLinkId(linkId) // Suspends, doesn't block
}

// In route handler
get("/profiles/{id}") {
    val profile = fetchProfile(linkId) // Can call suspend function
    call.respond(profile)
}
```

**Key Points**:
- `suspend fun` can pause and resume without blocking threads
- KMongo functions are `suspend` - they work with coroutines
- No need for callbacks or `.await()` - just call directly
- Ktor handles coroutine context automatically

---

## Testing with Kotest

### Test Structure (StringSpec)
```kotlin
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.ktor.client.request.*
import io.ktor.server.testing.*
import io.ktor.http.*

class ProfileApiTest : StringSpec({
    "POST /api/profiles should create profile with two links" {
        testApplication {
            val response = client.post("/api/profiles")

            response.status shouldBe HttpStatusCode.Created

            val profile = response.body<ProfileCreateResponse>()
            profile.feedbackLinkId shouldStartWith "f_"
            profile.adminLinkId shouldStartWith "a_"
        }
    }

    "GET /api/profiles/{id} should return 404 for non-existent profile" {
        testApplication {
            val response = client.get("/api/profiles/invalid_id")
            response.status shouldBe HttpStatusCode.NotFound
        }
    }
})
```

### Mocking with MockK
```kotlin
import io.mockk.*
import io.kotest.core.spec.style.StringSpec

class ProfileServiceTest : StringSpec({
    val repository = mockk<ProfileRepository>()
    val service = ProfileService(repository)

    "createProfile should generate unique link IDs" {
        coEvery { repository.create(any()) } returns mockProfile

        val profile = service.createProfile()

        profile.feedbackLinkId shouldNotBe profile.adminLinkId
        coVerify { repository.create(any()) }
    }
})
```

**Kotest Matchers**:
- `shouldBe` - Equality check
- `shouldNotBe` - Inequality
- `shouldContain` - Collection contains element
- `shouldStartWith` - String prefix check

---

## Gradle Build Configuration

### build.gradle.kts Basics
```kotlin
plugins {
    kotlin("jvm") version "1.9.20"
    kotlin("plugin.serialization") version "1.9.20"
    id("io.ktor.plugin") version "2.3.5"
}

dependencies {
    // Ktor
    implementation("io.ktor:ktor-server-core")
    implementation("io.ktor:ktor-server-netty")
    implementation("io.ktor:ktor-server-content-negotiation")
    implementation("io.ktor:ktor-serialization-kotlinx-json")
    implementation("io.ktor:ktor-server-cors")

    // MongoDB
    implementation("org.litote.kmongo:kmongo-coroutine:4.11.0")

    // Testing
    testImplementation("io.kotest:kotest-runner-junit5:5.7.2")
    testImplementation("io.kotest:kotest-assertions-core:5.7.2")
    testImplementation("io.ktor:ktor-server-test-host")
    testImplementation("io.mockk:mockk:1.13.8")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```

### Common Gradle Commands
```bash
./gradlew build              # Compile + test + package
./gradlew test               # Run tests only
./gradlew run                # Start server
./gradlew clean              # Delete build artifacts
./gradlew tasks              # List all available tasks
./gradlew dependencies       # Show dependency tree
```

---

## Configuration Management

### application.conf (HOCON format)
```hocon
ktor {
    deployment {
        port = 8080
        host = "0.0.0.0"
    }

    application {
        modules = [ com.example.ApplicationKt.module ]
    }
}

mongodb {
    uri = "mongodb://localhost:27017"
    database = "mindset_feedback"
}
```

### Loading Config in Code
```kotlin
fun Application.configureMongoDB() {
    val mongoUri = environment.config.property("mongodb.uri").getString()
    val dbName = environment.config.property("mongodb.database").getString()

    // Initialize MongoDB connection
}
```

---

## Error Handling Patterns

### Custom Exception Handling
```kotlin
import io.ktor.server.plugins.statuspages.*

fun Application.configureErrorHandling() {
    install(StatusPages) {
        exception<IllegalArgumentException> { call, cause ->
            call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse("Invalid input", "INVALID_INPUT")
            )
        }

        exception<NotFoundException> { call, cause ->
            call.respond(
                HttpStatusCode.NotFound,
                ErrorResponse("Resource not found", "NOT_FOUND")
            )
        }

        exception<Throwable> { call, cause ->
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse("Internal server error", "INTERNAL_ERROR")
            )
        }
    }
}
```

---

## API Response Patterns

### Success Response
```kotlin
@Serializable
data class SuccessResponse<T>(
    val data: T
)

// Usage
call.respond(HttpStatusCode.OK, SuccessResponse(profile))
```

### Error Response
```kotlin
@Serializable
data class ErrorResponse(
    val error: String,
    val code: String
)

// Usage
call.respond(HttpStatusCode.NotFound, ErrorResponse("Profile not found", "PROFILE_NOT_FOUND"))
```

---

## Development Tips for Kotlin Beginners

### Type Inference
```kotlin
// Explicit type (not needed)
val linkId: String = UUID.randomUUID().toString()

// Type inference (preferred)
val linkId = UUID.randomUUID().toString()
```

### Null Safety
```kotlin
// Nullable type (?)
val profile: Profile? = repository.find(id)

// Safe call (?.)
val linkId = profile?.feedbackLinkId

// Elvis operator (?:)
val name = profile?.name ?: "Unknown"

// Non-null assertion (!!) - use sparingly
val id = profile!!.id // Throws if null
```

### Data Class Benefits
```kotlin
data class Profile(val id: String, val name: String)

// Auto-generated methods:
val p1 = Profile("1", "Alice")
val p2 = Profile("1", "Alice")
p1 == p2 // true (equals)
val p3 = p1.copy(name = "Bob") // copy with changes
```

### Extension Functions
```kotlin
// Add methods to existing classes
fun String.toUUID(): String {
    return "f_$this"
}

val linkId = UUID.randomUUID().toString().toUUID()
```

---

## Common Pitfalls to Avoid

1. **Forgetting `suspend`**: If calling MongoDB/async code, function must be `suspend`
2. **Blocking in coroutines**: Don't use blocking I/O (use KMongo suspend functions)
3. **Not handling nulls**: Always check nullability or use safe calls
4. **Mutable collections**: Use `List` (immutable) not `MutableList` unless needed
5. **Ignoring test failures**: Kotest provides clear error messages - read them

---

## Resources

- **Ktor Docs**: https://ktor.io/docs/
- **KMongo Guide**: https://litote.org/kmongo/
- **Kotest Docs**: https://kotest.io/docs/framework/framework.html
- **Kotlin Coroutines**: https://kotlinlang.org/docs/coroutines-overview.html
- **kotlinx.serialization**: https://github.com/Kotlin/kotlinx.serialization

---

## API Contract Reference

See `/specs/001-this-app-is/contracts/api-spec.yaml` for complete API specification.

Key endpoints to implement:
- `POST /api/profiles` - Create profile
- `GET /api/profiles/{feedbackLinkId}` - Get profile
- `POST /api/profiles/{feedbackLinkId}/responses` - Submit feedback
- `GET /api/profiles/{feedbackLinkId}/aggregate` - Get aggregate results
- `GET /api/profiles/{adminLinkId}/results` - Get manager dashboard
- `GET /api/traits` - Get trait questions

---

**Next Steps**:
1. Run `/tasks` command to generate implementation tasks
2. Follow TDD: Write contract tests first, then implement endpoints
3. Refer to `quickstart.md` for setup verification

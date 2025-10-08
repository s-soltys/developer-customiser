import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.http.*
import kotlinx.serialization.json.Json
import com.mongodb.MongoClientSettings
import org.bson.codecs.configuration.CodecRegistries
import config.CustomCodecProvider
import org.litote.kmongo.coroutine.coroutine
import org.litote.kmongo.reactivestreams.KMongo
import plugins.configureAuthentication
import kotlinx.coroutines.runBlocking

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    // MongoDB connection with custom codecs
    val codecRegistry = CodecRegistries.fromRegistries(
        CodecRegistries.fromProviders(CustomCodecProvider()),
        MongoClientSettings.getDefaultCodecRegistry()
    )

    val clientSettings = MongoClientSettings.builder()
        .codecRegistry(codecRegistry)
        .build()

    val mongoClient = KMongo.createClient(clientSettings).coroutine
    val database = mongoClient.getDatabase("howtoworkwithme")

    // Setup database indexes
    runBlocking {
        try {
            setupDatabase(database)
        } catch (e: Exception) {
            environment.log.error("Failed to setup database: ${e.message}")
        }
    }

    // Install authentication
    configureAuthentication()

    // Install ContentNegotiation for JSON
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
            ignoreUnknownKeys = true
            serializersModule = kotlinx.serialization.modules.SerializersModule {
                contextual(models.Category::class, models.CategorySerializer)
                contextual(models.Question::class, models.QuestionSerializer)
            }
        })
    }

    // Install CORS
    install(CORS) {
        allowHost("localhost:5173", schemes = listOf("http"))
        allowHost("127.0.0.1:5173", schemes = listOf("http"))
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)
        allowMethod(HttpMethod.Options)
        allowCredentials = true
        anyHost() // Allow any host during development
    }

    // Configure routing
    configureRouting(database)

    // Log startup
    environment.log.info("Application started on port 8080")
    environment.log.info("MongoDB connected to: howtoworkwithme")
}

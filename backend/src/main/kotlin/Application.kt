import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.http.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.polymorphic
import kotlinx.serialization.modules.subclass
import com.mongodb.kotlin.client.coroutine.MongoClient
import services.QuestionSeeder
import kotlinx.coroutines.runBlocking

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    // MongoDB connection
    val mongoClient = MongoClient.create("mongodb://localhost:27017")
    val database = mongoClient.getDatabase("howtoworkwithme")

    // Seed questions on startup
    runBlocking {
        try {
            val seeder = QuestionSeeder(database)
            seeder.seedQuestions()
        } catch (e: Exception) {
            environment.log.error("Failed to seed questions: ${e.message}")
        }
    }

    // Install ContentNegotiation for JSON
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
            ignoreUnknownKeys = true
            serializersModule = SerializersModule {
                polymorphic(models.ResponseValue::class) {
                    subclass(models.ResponseValue.Text::class)
                    subclass(models.ResponseValue.Choice::class)
                    subclass(models.ResponseValue.MultiChoice::class)
                }
            }
        })
    }

    // Install CORS
    install(CORS) {
        allowHost("localhost:5173")
        allowHost("127.0.0.1:5173")
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)
        allowCredentials = true
    }

    // Configure routing
    configureRouting(database)

    // Log startup
    environment.log.info("Application started on port 8080")
    environment.log.info("MongoDB connected to: howtoworkwithme")
}

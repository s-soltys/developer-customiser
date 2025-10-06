import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.http.*
import kotlinx.serialization.json.Json
import com.mongodb.kotlin.client.coroutine.MongoClient
import com.mongodb.MongoClientSettings
import org.bson.codecs.configuration.CodecRegistries
import config.CustomCodecProvider
import services.QuestionSeeder
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

    val mongoClient = MongoClient.create("mongodb://localhost:27017")
    val database = mongoClient.getDatabase("howtoworkwithme")
        .withCodecRegistry(codecRegistry)

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

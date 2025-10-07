import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import io.ktor.http.*
import org.litote.kmongo.coroutine.CoroutineDatabase
import services.QuestionService
import services.ProfileService
import services.CategoryService
import models.*
import org.bson.types.ObjectId
import api.adminRoutes

fun Application.configureRouting(database: CoroutineDatabase) {
    val questionService = QuestionService(database)
    val profileService = ProfileService(database)
    val categoryService = CategoryService(database)

    routing {
        // Admin routes
        adminRoutes(database)
        get("/") {
            call.respondText("How to Work With Me API - Server is running")
        }

        get("/health") {
            call.respondText("OK")
        }

        // GET /api/questions - Get all active question templates (public API)
        get("/api/questions") {
            try {
                // Only return active questions and categories for public questionnaire
                val questions = questionService.getActiveQuestions()
                call.respond(HttpStatusCode.OK, questions)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Failed to fetch questions: ${e.message}"))
            }
        }

        // POST /api/profiles - Create a new profile
        post("/api/profiles") {
            try {
                val request = call.receive<CreateProfileRequest>()

                if (request.name.isBlank()) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Name cannot be empty"))
                    return@post
                }

                val profile = profileService.createProfile(request.name)
                call.respond(HttpStatusCode.Created, profile)
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse(e.message ?: "Invalid request"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Failed to create profile: ${e.message}"))
            }
        }

        // GET /api/profiles/:id - Get profile by ID
        get("/api/profiles/{id}") {
            try {
                val idString = call.parameters["id"] ?: run {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Profile ID is required"))
                    return@get
                }

                val id = try {
                    ObjectId(idString)
                } catch (e: IllegalArgumentException) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid profile ID format"))
                    return@get
                }

                val profile = profileService.getProfileById(id)
                if (profile == null) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("Profile not found"))
                } else {
                    call.respond(HttpStatusCode.OK, profile)
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Failed to fetch profile: ${e.message}"))
            }
        }

        // PUT /api/profiles/:id - Update profile responses
        put("/api/profiles/{id}") {
            try {
                val idString = call.parameters["id"] ?: run {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Profile ID is required"))
                    return@put
                }

                val id = try {
                    ObjectId(idString)
                } catch (e: IllegalArgumentException) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid profile ID format"))
                    return@put
                }

                val request = call.receive<UpdateProfileRequest>()

                // TODO: Validate all question IDs exist if needed

                val updatedProfile = profileService.updateProfile(id, request.responses)
                if (updatedProfile == null) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("Profile not found"))
                } else {
                    call.respond(HttpStatusCode.OK, updatedProfile)
                }
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse(e.message ?: "Invalid request"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Failed to update profile: ${e.message}"))
            }
        }

        // GET /api/profiles/share/:shareableId - Get profile by shareable ID
        get("/api/profiles/share/{shareableId}") {
            try {
                val shareableId = call.parameters["shareableId"] ?: run {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Shareable ID is required"))
                    return@get
                }

                val profile = profileService.getProfileByShareableId(shareableId)
                if (profile == null) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("Shared profile not found"))
                } else {
                    call.respond(HttpStatusCode.OK, profile)
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Failed to fetch shared profile: ${e.message}"))
            }
        }
    }
}

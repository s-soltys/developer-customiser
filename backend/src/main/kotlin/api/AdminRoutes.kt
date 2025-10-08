package api

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import models.ErrorResponse
import org.bson.types.ObjectId
import org.litote.kmongo.coroutine.CoroutineDatabase
import services.CategoryService
import services.QuestionService

/**
 * Admin API routes for managing questions and categories.
 * All endpoints require authentication via basic auth.
 */
fun Route.adminRoutes(database: CoroutineDatabase) {
    val categoryService = CategoryService(database)
    val questionService = QuestionService(database)

    // T026: POST /api/admin/auth - Authentication endpoint (no auth required)
    post("/api/admin/auth") {
        try {
            val request = call.receive<AuthRequest>()
            val expectedPassword = call.application.environment.config.propertyOrNull("admin.password")?.getString()
                ?: System.getenv("ADMIN_PASSWORD")
                ?: "change-me-in-production"

            if (request.password == expectedPassword) {
                call.respond(HttpStatusCode.OK, AuthResponse(authenticated = true, message = "Authentication successful"))
            } else {
                call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid admin password"))
            }
        } catch (e: Exception) {
            call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid request: ${e.message}"))
        }
    }

    // Protected admin routes (require authentication)
    authenticate("admin-auth") {
        route("/api/admin") {
            // T027: GET /api/admin/categories - List all categories
            get("/categories") {
                try {
                    val categories = categoryService.getAllCategories()
                    call.respond(HttpStatusCode.OK, categories)
                } catch (e: Exception) {
                    call.application.environment.log.error("Failed to fetch categories", e)
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Failed to fetch categories: ${e.message}"))
                }
            }

            // T028: POST /api/admin/categories - Create new category
            post("/categories") {
                try {
                    val request = call.receive<CreateCategoryRequest>()

                    val category = categoryService.createCategory(request.name, request.order)
                    call.respond(HttpStatusCode.Created, category)
                } catch (e: IllegalArgumentException) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse(e.message ?: "Invalid request"))
                } catch (e: IllegalStateException) {
                    call.respond(HttpStatusCode.Conflict, ErrorResponse(e.message ?: "Category name already exists"))
                } catch (e: Exception) {
                    call.application.environment.log.error("Failed to create category", e)
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Failed to create category: ${e.message}"))
                }
            }

            // T029: PUT /api/admin/categories/{id} - Update category
            put("/categories/{id}") {
                try {
                    val idString = call.parameters["id"] ?: run {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Category ID is required"))
                        return@put
                    }

                    val id = try {
                        ObjectId(idString)
                    } catch (e: IllegalArgumentException) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid category ID format"))
                        return@put
                    }

                    val request = call.receive<UpdateCategoryRequest>()

                    val updatedCategory = categoryService.updateCategory(id, request.name, request.order)
                    if (updatedCategory == null) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Category not found"))
                    } else {
                        call.respond(HttpStatusCode.OK, updatedCategory)
                    }
                } catch (e: IllegalStateException) {
                    call.respond(HttpStatusCode.Conflict, ErrorResponse(e.message ?: "Category name already exists"))
                } catch (e: Exception) {
                    call.application.environment.log.error("Failed to update category", e)
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Failed to update category: ${e.message}"))
                }
            }

            // T030: DELETE /api/admin/categories/{id} - Soft delete category
            delete("/categories/{id}") {
                try {
                    val idString = call.parameters["id"] ?: run {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Category ID is required"))
                        return@delete
                    }

                    val id = try {
                        ObjectId(idString)
                    } catch (e: IllegalArgumentException) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid category ID format"))
                        return@delete
                    }

                    val cascade = call.request.queryParameters["cascade"]?.toBoolean() ?: false

                    val deleted = categoryService.softDeleteCategory(id, cascade)
                    if (!deleted) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Category not found"))
                    } else {
                        call.respond(HttpStatusCode.NoContent)
                    }
                } catch (e: IllegalStateException) {
                    call.respond(HttpStatusCode.Conflict, ErrorResponse(e.message ?: "Cannot delete category"))
                } catch (e: Exception) {
                    call.application.environment.log.error("Failed to delete category", e)
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Failed to delete category: ${e.message}"))
                }
            }

            // T031: GET /api/admin/questions - List all questions
            get("/questions") {
                try {
                    val categoryIdString = call.request.queryParameters["categoryId"]
                    val categoryId = categoryIdString?.let {
                        try {
                            ObjectId(it)
                        } catch (e: IllegalArgumentException) {
                            call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid category ID format"))
                            return@get
                        }
                    }

                    val questions = questionService.getAllQuestions(categoryId)
                    call.respond(HttpStatusCode.OK, questions)
                } catch (e: Exception) {
                    call.application.environment.log.error("Failed to fetch questions", e)
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Failed to fetch questions: ${e.message}"))
                }
            }

            // T032: POST /api/admin/questions - Create new question
            post("/questions") {
                try {
                    val request = call.receive<CreateQuestionRequest>()

                    val categoryId = try {
                        ObjectId(request.categoryId)
                    } catch (e: IllegalArgumentException) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid category ID format"))
                        return@post
                    }

                    val question = questionService.createQuestion(request.text, categoryId, request.order)
                    call.respond(HttpStatusCode.Created, question)
                } catch (e: IllegalArgumentException) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse(e.message ?: "Invalid request"))
                } catch (e: IllegalStateException) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse(e.message ?: "Invalid category"))
                } catch (e: Exception) {
                    call.application.environment.log.error("Failed to create question", e)
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Failed to create question: ${e.message}"))
                }
            }

            // T033: PUT /api/admin/questions/{id} - Update question
            put("/questions/{id}") {
                try {
                    val idString = call.parameters["id"] ?: run {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Question ID is required"))
                        return@put
                    }

                    val id = try {
                        ObjectId(idString)
                    } catch (e: IllegalArgumentException) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid question ID format"))
                        return@put
                    }

                    val request = call.receive<UpdateQuestionRequest>()

                    val categoryId = request.categoryId?.let {
                        try {
                            ObjectId(it)
                        } catch (e: IllegalArgumentException) {
                            call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid category ID format"))
                            return@put
                        }
                    }

                    val updatedQuestion = questionService.updateQuestion(id, request.text, categoryId, request.order)
                    if (updatedQuestion == null) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Question not found"))
                    } else {
                        call.respond(HttpStatusCode.OK, updatedQuestion)
                    }
                } catch (e: IllegalStateException) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse(e.message ?: "Invalid category"))
                } catch (e: Exception) {
                    call.application.environment.log.error("Failed to update question", e)
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Failed to update question: ${e.message}"))
                }
            }

            // T033: DELETE /api/admin/questions/{id} - Soft delete question
            delete("/questions/{id}") {
                try {
                    val idString = call.parameters["id"] ?: run {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Question ID is required"))
                        return@delete
                    }

                    val id = try {
                        ObjectId(idString)
                    } catch (e: IllegalArgumentException) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid question ID format"))
                        return@delete
                    }

                    val deleted = questionService.softDeleteQuestion(id)
                    if (!deleted) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Question not found"))
                    } else {
                        call.respond(HttpStatusCode.NoContent)
                    }
                } catch (e: Exception) {
                    call.application.environment.log.error("Failed to delete question", e)
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Failed to delete question: ${e.message}"))
                }
            }
        }
    }
}

// Request/Response DTOs
@Serializable
data class AuthRequest(val password: String)

@Serializable
data class AuthResponse(val authenticated: Boolean, val message: String)

@Serializable
data class CreateCategoryRequest(val name: String, val order: Int)

@Serializable
data class UpdateCategoryRequest(val name: String? = null, val order: Int? = null)

@Serializable
data class CreateQuestionRequest(val text: String, val categoryId: String, val order: Int)

@Serializable
data class UpdateQuestionRequest(val text: String? = null, val categoryId: String? = null, val order: Int? = null)

package contract

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.ktor.server.config.*
import io.ktor.util.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import module

/**
 * Contract tests for POST /api/admin/questions endpoint
 */
class AdminQuestionsPostTest : StringSpec({

    "POST /api/admin/questions with valid request should return 201 Created" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()

            val response = client.post("/api/admin/questions") {
                header(HttpHeaders.Authorization, "Basic $credentials")
                contentType(ContentType.Application.Json)
                setBody("""{"text": "Test question?", "categoryId": "507f1f77bcf86cd799439011", "order": 0}""")
            }

            response.status shouldBe HttpStatusCode.Created

            val json = Json.parseToJsonElement(response.bodyAsText()).jsonObject
            json["id"] shouldNotBe null
            json["text"]?.jsonPrimitive?.content shouldBe "Test question?"
            json["active"]?.jsonPrimitive?.content shouldBe "true"
        }
    }

    "POST /api/admin/questions with empty text should return 400 Bad Request" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()

            val response = client.post("/api/admin/questions") {
                header(HttpHeaders.Authorization, "Basic $credentials")
                contentType(ContentType.Application.Json)
                setBody("""{"text": "", "categoryId": "507f1f77bcf86cd799439011", "order": 0}""")
            }

            response.status shouldBe HttpStatusCode.BadRequest

            val json = Json.parseToJsonElement(response.bodyAsText()).jsonObject
            json["error"] shouldNotBe null
        }
    }

    "POST /api/admin/questions with invalid categoryId should return 400 Bad Request" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()

            val response = client.post("/api/admin/questions") {
                header(HttpHeaders.Authorization, "Basic $credentials")
                contentType(ContentType.Application.Json)
                setBody("""{"text": "Test?", "categoryId": "invalid-id", "order": 0}""")
            }

            response.status shouldBe HttpStatusCode.BadRequest
        }
    }

    "POST /api/admin/questions without auth should return 401 Unauthorized" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val response = client.post("/api/admin/questions") {
                contentType(ContentType.Application.Json)
                setBody("""{"text": "Test?", "categoryId": "507f1f77bcf86cd799439011", "order": 0}""")
            }

            response.status shouldBe HttpStatusCode.Unauthorized
        }
    }

    "POST /api/admin/questions with missing required fields should return 400 Bad Request" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()

            val response = client.post("/api/admin/questions") {
                header(HttpHeaders.Authorization, "Basic $credentials")
                contentType(ContentType.Application.Json)
                setBody("""{"text": "Missing categoryId"}""")
            }

            response.status shouldBe HttpStatusCode.BadRequest
        }
    }
})

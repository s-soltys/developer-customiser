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
 * Contract tests for POST /api/admin/categories endpoint
 * Validates against OpenAPI spec: contracts/admin-api-spec.yaml
 */
class AdminCategoriesPostTest : StringSpec({

    "POST /api/admin/categories with valid request should return 201 Created" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()

            val response = client.post("/api/admin/categories") {
                header(HttpHeaders.Authorization, "Basic $credentials")
                contentType(ContentType.Application.Json)
                setBody("""{"name": "Test Category", "order": 10}""")
            }

            response.status shouldBe HttpStatusCode.Created

            val json = Json.parseToJsonElement(response.bodyAsText()).jsonObject
            json["id"] shouldNotBe null
            json["name"]?.jsonPrimitive?.content shouldBe "Test Category"
            json["order"]?.jsonPrimitive?.content shouldBe "10"
            json["active"]?.jsonPrimitive?.content shouldBe "true"
        }
    }

    "POST /api/admin/categories with empty name should return 400 Bad Request" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()

            val response = client.post("/api/admin/categories") {
                header(HttpHeaders.Authorization, "Basic $credentials")
                contentType(ContentType.Application.Json)
                setBody("""{"name": "", "order": 10}""")
            }

            response.status shouldBe HttpStatusCode.BadRequest

            val json = Json.parseToJsonElement(response.bodyAsText()).jsonObject
            json["error"] shouldNotBe null
            json["message"] shouldNotBe null
        }
    }

    "POST /api/admin/categories with duplicate name should return 409 Conflict" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()

            // Create first category
            client.post("/api/admin/categories") {
                header(HttpHeaders.Authorization, "Basic $credentials")
                contentType(ContentType.Application.Json)
                setBody("""{"name": "Duplicate Test", "order": 20}""")
            }

            // Try to create duplicate
            val response = client.post("/api/admin/categories") {
                header(HttpHeaders.Authorization, "Basic $credentials")
                contentType(ContentType.Application.Json)
                setBody("""{"name": "Duplicate Test", "order": 21}""")
            }

            response.status shouldBe HttpStatusCode.Conflict

            val json = Json.parseToJsonElement(response.bodyAsText()).jsonObject
            json["error"] shouldNotBe null
        }
    }

    "POST /api/admin/categories without auth should return 401 Unauthorized" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val response = client.post("/api/admin/categories") {
                contentType(ContentType.Application.Json)
                setBody("""{"name": "Test", "order": 1}""")
            }

            response.status shouldBe HttpStatusCode.Unauthorized
        }
    }

    "POST /api/admin/categories with missing required fields should return 400 Bad Request" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()

            val response = client.post("/api/admin/categories") {
                header(HttpHeaders.Authorization, "Basic $credentials")
                contentType(ContentType.Application.Json)
                setBody("""{"name": "Missing Order"}""")
            }

            response.status shouldBe HttpStatusCode.BadRequest
        }
    }
})

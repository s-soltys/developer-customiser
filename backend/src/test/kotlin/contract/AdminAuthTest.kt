package contract

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

/**
 * Contract tests for POST /api/admin/auth endpoint
 * Validates against OpenAPI spec: contracts/admin-api-spec.yaml
 */
class AdminAuthTest : StringSpec({

    "POST /api/admin/auth with valid password should return 200 OK" {
        testApplication {
            // Setup environment
            System.setProperty("ADMIN_PASSWORD", "test-password")

            val response = client.post("/api/admin/auth") {
                contentType(ContentType.Application.Json)
                setBody("""{"password": "test-password"}""")
            }

            response.status shouldBe HttpStatusCode.OK

            val json = Json.parseToJsonElement(response.bodyAsText()).jsonObject
            json["authenticated"]?.jsonPrimitive?.content shouldBe "true"
            json["message"] shouldNotBe null
        }
    }

    "POST /api/admin/auth with invalid password should return 401 Unauthorized" {
        testApplication {
            System.setProperty("ADMIN_PASSWORD", "correct-password")

            val response = client.post("/api/admin/auth") {
                contentType(ContentType.Application.Json)
                setBody("""{"password": "wrong-password"}""")
            }

            response.status shouldBe HttpStatusCode.Unauthorized

            val json = Json.parseToJsonElement(response.bodyAsText()).jsonObject
            json["error"] shouldNotBe null
            json["message"] shouldNotBe null
        }
    }

    "POST /api/admin/auth with missing password field should return 400 Bad Request" {
        testApplication {
            val response = client.post("/api/admin/auth") {
                contentType(ContentType.Application.Json)
                setBody("""{}""")
            }

            response.status shouldBe HttpStatusCode.BadRequest

            val json = Json.parseToJsonElement(response.bodyAsText()).jsonObject
            json["error"] shouldNotBe null
        }
    }

    "POST /api/admin/auth with malformed JSON should return 400 Bad Request" {
        testApplication {
            val response = client.post("/api/admin/auth") {
                contentType(ContentType.Application.Json)
                setBody("not-valid-json")
            }

            response.status shouldBe HttpStatusCode.BadRequest
        }
    }
})

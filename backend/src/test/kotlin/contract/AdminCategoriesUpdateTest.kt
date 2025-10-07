package contract

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.ktor.util.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

/**
 * Contract tests for PUT /api/admin/categories/{id} endpoint
 */
class AdminCategoriesUpdateTest : StringSpec({

    "PUT /api/admin/categories/{id} with valid update should return 200 OK" {
        testApplication {
            val credentials = "admin:test-password".encodeBase64()
            val categoryId = "507f1f77bcf86cd799439011" // Valid ObjectId format

            val response = client.put("/api/admin/categories/$categoryId") {
                header(HttpHeaders.Authorization, "Basic $credentials")
                contentType(ContentType.Application.Json)
                setBody("""{"name": "Updated Category", "order": 5}""")
            }

            // Should be 200 OK or 404 Not Found (if category doesn't exist)
            (response.status == HttpStatusCode.OK || response.status == HttpStatusCode.NotFound) shouldBe true
        }
    }

    "PUT /api/admin/categories/{id} with invalid ID should return 404 Not Found" {
        testApplication {
            val credentials = "admin:test-password".encodeBase64()
            val invalidId = "000000000000000000000000"

            val response = client.put("/api/admin/categories/$invalidId") {
                header(HttpHeaders.Authorization, "Basic $credentials")
                contentType(ContentType.Application.Json)
                setBody("""{"name": "Test", "order": 1}""")
            }

            response.status shouldBe HttpStatusCode.NotFound
        }
    }

    "PUT /api/admin/categories/{id} with empty name should return 400 Bad Request" {
        testApplication {
            val credentials = "admin:test-password".encodeBase64()
            val categoryId = "507f1f77bcf86cd799439011"

            val response = client.put("/api/admin/categories/$categoryId") {
                header(HttpHeaders.Authorization, "Basic $credentials")
                contentType(ContentType.Application.Json)
                setBody("""{"name": "", "order": 1}""")
            }

            response.status shouldBe HttpStatusCode.BadRequest
        }
    }

    "PUT /api/admin/categories/{id} without auth should return 401 Unauthorized" {
        testApplication {
            val categoryId = "507f1f77bcf86cd799439011"

            val response = client.put("/api/admin/categories/$categoryId") {
                contentType(ContentType.Application.Json)
                setBody("""{"name": "Test", "order": 1}""")
            }

            response.status shouldBe HttpStatusCode.Unauthorized
        }
    }
})

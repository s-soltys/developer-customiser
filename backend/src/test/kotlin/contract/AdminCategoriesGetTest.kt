package contract

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.collections.shouldNotBeEmpty
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.ktor.util.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray

/**
 * Contract tests for GET /api/admin/categories endpoint
 * Validates against OpenAPI spec: contracts/admin-api-spec.yaml
 */
class AdminCategoriesGetTest : StringSpec({

    "GET /api/admin/categories with valid auth should return 200 OK with array" {
        testApplication {
            val credentials = "admin:test-password".encodeBase64()

            val response = client.get("/api/admin/categories") {
                header(HttpHeaders.Authorization, "Basic $credentials")
            }

            response.status shouldBe HttpStatusCode.OK
            response.contentType() shouldBe ContentType.Application.Json

            val json = Json.parseToJsonElement(response.bodyAsText())
            json.jsonArray // Should be an array
        }
    }

    "GET /api/admin/categories without auth should return 401 Unauthorized" {
        testApplication {
            val response = client.get("/api/admin/categories")

            response.status shouldBe HttpStatusCode.Unauthorized
        }
    }

    "GET /api/admin/categories with invalid auth should return 401 Unauthorized" {
        testApplication {
            val credentials = "admin:wrong-password".encodeBase64()

            val response = client.get("/api/admin/categories") {
                header(HttpHeaders.Authorization, "Basic $credentials")
            }

            response.status shouldBe HttpStatusCode.Unauthorized
        }
    }

    "GET /api/admin/categories response should match Category schema" {
        testApplication {
            val credentials = "admin:test-password".encodeBase64()

            val response = client.get("/api/admin/categories") {
                header(HttpHeaders.Authorization, "Basic $credentials")
            }

            response.status shouldBe HttpStatusCode.OK

            val json = Json.parseToJsonElement(response.bodyAsText()).jsonArray
            // Each category should have required fields: id, name, order, active, createdAt, updatedAt
            if (json.isNotEmpty()) {
                val category = json[0].jsonObject
                category.keys shouldContain "id"
                category.keys shouldContain "name"
                category.keys shouldContain "order"
                category.keys shouldContain "active"
                category.keys shouldContain "createdAt"
                category.keys shouldContain "updatedAt"
            }
        }
    }
})

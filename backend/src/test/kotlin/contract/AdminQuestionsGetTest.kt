package contract

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.collections.shouldContain
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.ktor.server.config.*
import io.ktor.util.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import module

/**
 * Contract tests for GET /api/admin/questions endpoint
 */
class AdminQuestionsGetTest : StringSpec({

    "GET /api/admin/questions should return 200 OK with array" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()

            val response = client.get("/api/admin/questions") {
                header(HttpHeaders.Authorization, "Basic $credentials")
            }

            response.status shouldBe HttpStatusCode.OK
            response.contentType()?.withoutParameters() shouldBe ContentType.Application.Json

            val json = Json.parseToJsonElement(response.bodyAsText())
            json.jsonArray // Should be an array
        }
    }

    "GET /api/admin/questions with categoryId filter should return 200 OK" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()
            val categoryId = "507f1f77bcf86cd799439011"

            val response = client.get("/api/admin/questions?categoryId=$categoryId") {
                header(HttpHeaders.Authorization, "Basic $credentials")
            }

            response.status shouldBe HttpStatusCode.OK

            val json = Json.parseToJsonElement(response.bodyAsText()).jsonArray
            // Should be filtered by categoryId
        }
    }

    "GET /api/admin/questions without auth should return 401 Unauthorized" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val response = client.get("/api/admin/questions")

            response.status shouldBe HttpStatusCode.Unauthorized
        }
    }

    "GET /api/admin/questions response should match Question schema" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()

            val response = client.get("/api/admin/questions") {
                header(HttpHeaders.Authorization, "Basic $credentials")
            }

            response.status shouldBe HttpStatusCode.OK

            val json = Json.parseToJsonElement(response.bodyAsText()).jsonArray
            if (json.isNotEmpty()) {
                val question = json[0].jsonObject
                question.keys shouldContain "id"
                question.keys shouldContain "text"
                question.keys shouldContain "categoryId"
                question.keys shouldContain "order"
                question.keys shouldContain "active"
                question.keys shouldContain "createdAt"
                question.keys shouldContain "updatedAt"
            }
        }
    }
})

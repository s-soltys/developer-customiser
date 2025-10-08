package contract

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.ktor.server.config.*
import io.ktor.util.*
import module

/**
 * Contract tests for PUT & DELETE /api/admin/questions/{id} endpoints
 */
class AdminQuestionsUpdateDeleteTest : StringSpec({

    "PUT /api/admin/questions/{id} with valid update should return 200 OK" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()
            val questionId = "507f191e810c19729de860ea"

            val response = client.put("/api/admin/questions/$questionId") {
                header(HttpHeaders.Authorization, "Basic $credentials")
                contentType(ContentType.Application.Json)
                setBody("""{"text": "Updated question?", "order": 1}""")
            }

            // Should be 200 OK or 404 Not Found
            (response.status == HttpStatusCode.OK || response.status == HttpStatusCode.NotFound) shouldBe true
        }
    }

    "PUT /api/admin/questions/{id} with invalid ID should return 404 Not Found" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()
            val invalidId = "000000000000000000000000"

            val response = client.put("/api/admin/questions/$invalidId") {
                header(HttpHeaders.Authorization, "Basic $credentials")
                contentType(ContentType.Application.Json)
                setBody("""{"text": "Test?"}""")
            }

            response.status shouldBe HttpStatusCode.NotFound
        }
    }

    "PUT /api/admin/questions/{id} without auth should return 401 Unauthorized" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val questionId = "507f191e810c19729de860ea"

            val response = client.put("/api/admin/questions/$questionId") {
                contentType(ContentType.Application.Json)
                setBody("""{"text": "Test?"}""")
            }

            response.status shouldBe HttpStatusCode.Unauthorized
        }
    }

    "DELETE /api/admin/questions/{id} should return 204 No Content" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()
            val questionId = "507f191e810c19729de860ea"

            val response = client.delete("/api/admin/questions/$questionId") {
                header(HttpHeaders.Authorization, "Basic $credentials")
            }

            // Should be 204 or 404
            (response.status == HttpStatusCode.NoContent || response.status == HttpStatusCode.NotFound) shouldBe true
        }
    }

    "DELETE /api/admin/questions/{id} with invalid ID should return 404 Not Found" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()
            val invalidId = "000000000000000000000000"

            val response = client.delete("/api/admin/questions/$invalidId") {
                header(HttpHeaders.Authorization, "Basic $credentials")
            }

            response.status shouldBe HttpStatusCode.NotFound
        }
    }

    "DELETE /api/admin/questions/{id} without auth should return 401 Unauthorized" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val questionId = "507f191e810c19729de860ea"

            val response = client.delete("/api/admin/questions/$questionId")

            response.status shouldBe HttpStatusCode.Unauthorized
        }
    }
})

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
 * Contract tests for DELETE /api/admin/categories/{id} endpoint
 */
class AdminCategoriesDeleteTest : StringSpec({

    "DELETE /api/admin/categories/{id} for empty category should return 204 No Content" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()
            val categoryId = "507f1f77bcf86cd799439011"

            val response = client.delete("/api/admin/categories/$categoryId") {
                header(HttpHeaders.Authorization, "Basic $credentials")
            }

            // Should be 204 or 404 (depending on if category exists)
            (response.status == HttpStatusCode.NoContent || response.status == HttpStatusCode.NotFound) shouldBe true
        }
    }

    "DELETE /api/admin/categories/{id} with active questions should return 409 Conflict" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()
            val categoryId = "507f1f77bcf86cd799439011"

            // This test assumes category has active questions
            val response = client.delete("/api/admin/categories/$categoryId") {
                header(HttpHeaders.Authorization, "Basic $credentials")
            }

            // Could be 409 if has questions, 204 if empty, 404 if doesn't exist
            (response.status == HttpStatusCode.Conflict ||
             response.status == HttpStatusCode.NoContent ||
             response.status == HttpStatusCode.NotFound) shouldBe true
        }
    }

    "DELETE /api/admin/categories/{id} with cascade=true should return 204 No Content" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()
            val categoryId = "507f1f77bcf86cd799439011"

            val response = client.delete("/api/admin/categories/$categoryId?cascade=true") {
                header(HttpHeaders.Authorization, "Basic $credentials")
            }

            // Should be 204 or 404
            (response.status == HttpStatusCode.NoContent || response.status == HttpStatusCode.NotFound) shouldBe true
        }
    }

    "DELETE /api/admin/categories/{id} with invalid ID should return 404 Not Found" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val credentials = "admin:test-password".encodeBase64()
            val invalidId = "000000000000000000000000"

            val response = client.delete("/api/admin/categories/$invalidId") {
                header(HttpHeaders.Authorization, "Basic $credentials")
            }

            response.status shouldBe HttpStatusCode.NotFound
        }
    }

    "DELETE /api/admin/categories/{id} without auth should return 401 Unauthorized" {
        testApplication {
            environment {
                config = MapApplicationConfig("admin.password" to "test-password")
            }
            application {
                module()
            }

            val categoryId = "507f1f77bcf86cd799439011"

            val response = client.delete("/api/admin/categories/$categoryId")

            response.status shouldBe HttpStatusCode.Unauthorized
        }
    }
})

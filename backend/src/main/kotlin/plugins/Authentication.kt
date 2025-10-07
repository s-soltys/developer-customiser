package plugins

import io.ktor.server.application.*
import io.ktor.server.auth.*

/**
 * Configure Ktor authentication for admin endpoints.
 * Uses Basic Auth with password from ADMIN_PASSWORD environment variable.
 */
fun Application.configureAuthentication() {
    val adminPassword = environment.config.propertyOrNull("admin.password")?.getString()
        ?: System.getenv("ADMIN_PASSWORD")
        ?: "change-me-in-production"

    if (adminPassword == "change-me-in-production") {
        environment.log.warn("⚠️  ADMIN_PASSWORD not set! Using default (insecure)")
    }

    install(Authentication) {
        basic("admin-auth") {
            realm = "Backoffice Administration"
            validate { credentials ->
                if (credentials.password == adminPassword) {
                    UserIdPrincipal("admin")
                } else {
                    null
                }
            }
        }
    }
}

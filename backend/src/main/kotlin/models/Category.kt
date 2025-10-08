package models

import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import org.bson.codecs.pojo.annotations.BsonId
import org.bson.types.ObjectId

/**
 * Category entity for grouping questions in the "How to Work With Me" questionnaire.
 * Categories appear as sections in the user-facing questionnaire.
 */
data class Category(
    @BsonId
    val id: ObjectId = ObjectId(),

    val name: String,

    val order: Int,

    val active: Boolean = true,

    val createdAt: Instant = Clock.System.now(),

    val updatedAt: Instant = Clock.System.now()
) {
    init {
        require(name.isNotBlank()) { "Category name cannot be empty" }
        require(name.length <= 100) { "Category name cannot exceed 100 characters" }
        require(order >= 0) { "Category order must be non-negative" }
    }
}

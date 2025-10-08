package models

import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import org.bson.codecs.pojo.annotations.BsonId
import org.bson.types.ObjectId

/**
 * Question entity within a category.
 * Users answer questions to build their "How to Work With Me" profile.
 */
data class Question(
    @BsonId
    val id: ObjectId = ObjectId(),

    val text: String,

    val categoryId: ObjectId,

    val order: Int,

    val active: Boolean = true,

    val createdAt: Instant = Clock.System.now(),

    val updatedAt: Instant = Clock.System.now()
) {
    init {
        require(text.isNotBlank()) { "Question text cannot be empty" }
        require(text.length <= 500) { "Question text cannot exceed 500 characters" }
        require(order >= 0) { "Question order must be non-negative" }
    }
}

package models

import kotlinx.serialization.Serializable
import kotlinx.serialization.KSerializer
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import org.bson.types.ObjectId

@Serializable
enum class QuestionType {
    TEXT,
    CHOICE,
    MULTICHOICE
}

@Serializable
enum class Category(val id: String, val displayName: String) {
    COMMUNICATION("communication", "Communication Preferences"),
    WORK_STYLE("work-style", "Work Style"),
    FEEDBACK("feedback", "Feedback Style"),
    STRENGTHS("strengths", "Strengths & Growing Areas"),
    PET_PEEVES("pet-peeves", "Pet Peeves & Energizers"),
    PERSONAL("personal", "Personal Context");

    companion object {
        fun fromId(id: String): Category? = values().find { it.id == id }
    }
}

@Serializable
data class Question(
    @Serializable(with = ObjectIdSerializer::class)
    val id: ObjectId = ObjectId(),
    val categoryId: String,
    val questionId: String,
    val text: String,
    val type: QuestionType,
    val choices: List<String>? = null,
    val placeholder: String? = null,
    val order: Int
) {
    init {
        require(categoryId.isNotBlank()) { "categoryId cannot be blank" }
        require(questionId.isNotBlank()) { "questionId cannot be blank" }
        require(text.isNotBlank()) { "text cannot be blank" }
        require(order >= 0) { "order must be non-negative" }

        when (type) {
            QuestionType.CHOICE, QuestionType.MULTICHOICE -> {
                require(!choices.isNullOrEmpty()) {
                    "choices must be provided for CHOICE and MULTICHOICE question types"
                }
            }
            QuestionType.TEXT -> {
                // choices are optional for TEXT type
            }
        }
    }
}

// Custom serializer for MongoDB ObjectId
object ObjectIdSerializer : KSerializer<ObjectId> {
    override val descriptor: SerialDescriptor =
        PrimitiveSerialDescriptor("ObjectId", PrimitiveKind.STRING)

    override fun serialize(encoder: Encoder, value: ObjectId) {
        encoder.encodeString(value.toHexString())
    }

    override fun deserialize(decoder: Decoder): ObjectId {
        return ObjectId(decoder.decodeString())
    }
}

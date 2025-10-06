package models

import kotlinx.serialization.Serializable
import kotlinx.serialization.KSerializer
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import org.bson.types.ObjectId
import kotlinx.datetime.Instant

@Serializable
sealed class ResponseValue {
    @Serializable
    data class Text(val text: String) : ResponseValue()

    @Serializable
    data class Choice(val selected: String) : ResponseValue()

    @Serializable
    data class MultiChoice(val selected: List<String>) : ResponseValue()
}

@Serializable
data class Response(
    val value: ResponseValue,
    @Serializable(with = InstantSerializer::class)
    val answeredAt: Instant
)

@Serializable
data class Profile(
    @Serializable(with = ObjectIdSerializer::class)
    val id: ObjectId = ObjectId(),
    val name: String,
    val shareableId: String,
    @Serializable(with = InstantSerializer::class)
    val createdAt: Instant,
    @Serializable(with = InstantSerializer::class)
    val updatedAt: Instant,
    val responses: Map<String, Map<String, Response>> = emptyMap()
) {
    init {
        require(name.isNotBlank()) { "name cannot be blank" }
        require(shareableId.isNotBlank()) { "shareableId cannot be blank" }
    }
}

// Custom serializer for kotlinx.datetime.Instant
object InstantSerializer : KSerializer<Instant> {
    override val descriptor: SerialDescriptor =
        PrimitiveSerialDescriptor("Instant", PrimitiveKind.STRING)

    override fun serialize(encoder: Encoder, value: Instant) {
        encoder.encodeString(value.toString())
    }

    override fun deserialize(decoder: Decoder): Instant {
        return Instant.parse(decoder.decodeString())
    }
}

// Request DTOs
@Serializable
data class CreateProfileRequest(
    val name: String
) {
    init {
        require(name.isNotBlank()) { "name cannot be blank" }
    }
}

@Serializable
data class UpdateProfileRequest(
    val responses: Map<String, Map<String, Response>>
)

@Serializable
data class ErrorResponse(
    val error: String
)

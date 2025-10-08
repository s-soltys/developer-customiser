package models

import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.json.*
import kotlinx.serialization.builtins.*
import org.bson.types.ObjectId
import kotlinx.datetime.Instant

// Custom serializer for response value that can be String or List<String>
@OptIn(InternalSerializationApi::class, ExperimentalSerializationApi::class)
object ResponseValueSerializer : KSerializer<Any> {
    override val descriptor: SerialDescriptor =
        buildSerialDescriptor("ResponseValue", PolymorphicKind.SEALED)

    override fun serialize(encoder: Encoder, value: Any) {
        when (value) {
            is String -> encoder.encodeString(value)
            is List<*> -> {
                @Suppress("UNCHECKED_CAST")
                encoder.encodeSerializableValue(
                    ListSerializer(serializer<String>()),
                    value as List<String>
                )
            }
            else -> throw SerializationException("Unsupported response value type")
        }
    }

    override fun deserialize(decoder: Decoder): Any {
        val jsonDecoder = decoder as? JsonDecoder
            ?: throw SerializationException("This serializer only works with JSON")

        return when (val element = jsonDecoder.decodeJsonElement()) {
            is JsonPrimitive -> element.content
            is JsonArray -> element.map { (it as JsonPrimitive).content }
            else -> throw SerializationException("Unexpected JSON element type")
        }
    }
}

@Serializable
data class Response(
    @Serializable(with = ResponseValueSerializer::class)
    val value: Any,  // Can be String or List<String>
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

// Serializers moved to models/Serializers.kt

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

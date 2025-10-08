package models

import kotlinx.datetime.Instant
import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*
import org.bson.types.ObjectId

/**
 * Custom serializer for ObjectId to/from hex string
 */
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

/**
 * Custom serializer for kotlinx.datetime.Instant
 */
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

/**
 * Serializer for Category (for JSON API responses)
 */
@Serializer(forClass = Category::class)
object CategorySerializer : KSerializer<Category> {
    override val descriptor: SerialDescriptor = buildClassSerialDescriptor("Category") {
        element<String>("id")
        element<String>("name")
        element<Int>("order")
        element<Boolean>("active")
        element<String>("createdAt")
        element<String>("updatedAt")
    }

    override fun serialize(encoder: Encoder, value: Category) {
        encoder.encodeStructure(descriptor) {
            encodeStringElement(descriptor, 0, value.id.toHexString())
            encodeStringElement(descriptor, 1, value.name)
            encodeIntElement(descriptor, 2, value.order)
            encodeBooleanElement(descriptor, 3, value.active)
            encodeStringElement(descriptor, 4, value.createdAt.toString())
            encodeStringElement(descriptor, 5, value.updatedAt.toString())
        }
    }

    override fun deserialize(decoder: Decoder): Category {
        return decoder.decodeStructure(descriptor) {
            var id: ObjectId? = null
            var name = ""
            var order = 0
            var active = true
            var createdAt: Instant? = null
            var updatedAt: Instant? = null

            while (true) {
                when (val index = decodeElementIndex(descriptor)) {
                    0 -> id = ObjectId(decodeStringElement(descriptor, 0))
                    1 -> name = decodeStringElement(descriptor, 1)
                    2 -> order = decodeIntElement(descriptor, 2)
                    3 -> active = decodeBooleanElement(descriptor, 3)
                    4 -> createdAt = Instant.parse(decodeStringElement(descriptor, 4))
                    5 -> updatedAt = Instant.parse(decodeStringElement(descriptor, 5))
                    CompositeDecoder.DECODE_DONE -> break
                    else -> error("Unexpected index: $index")
                }
            }

            Category(
                id = id ?: ObjectId(),
                name = name,
                order = order,
                active = active,
                createdAt = createdAt ?: kotlinx.datetime.Clock.System.now(),
                updatedAt = updatedAt ?: kotlinx.datetime.Clock.System.now()
            )
        }
    }
}

/**
 * Serializer for Question (for JSON API responses)
 */
@Serializer(forClass = Question::class)
object QuestionSerializer : KSerializer<Question> {
    override val descriptor: SerialDescriptor = buildClassSerialDescriptor("Question") {
        element<String>("id")
        element<String>("text")
        element<String>("categoryId")
        element<Int>("order")
        element<Boolean>("active")
        element<String>("createdAt")
        element<String>("updatedAt")
    }

    override fun serialize(encoder: Encoder, value: Question) {
        encoder.encodeStructure(descriptor) {
            encodeStringElement(descriptor, 0, value.id.toHexString())
            encodeStringElement(descriptor, 1, value.text)
            encodeStringElement(descriptor, 2, value.categoryId.toHexString())
            encodeIntElement(descriptor, 3, value.order)
            encodeBooleanElement(descriptor, 4, value.active)
            encodeStringElement(descriptor, 5, value.createdAt.toString())
            encodeStringElement(descriptor, 6, value.updatedAt.toString())
        }
    }

    override fun deserialize(decoder: Decoder): Question {
        return decoder.decodeStructure(descriptor) {
            var id: ObjectId? = null
            var text = ""
            var categoryId: ObjectId? = null
            var order = 0
            var active = true
            var createdAt: Instant? = null
            var updatedAt: Instant? = null

            while (true) {
                when (val index = decodeElementIndex(descriptor)) {
                    0 -> id = ObjectId(decodeStringElement(descriptor, 0))
                    1 -> text = decodeStringElement(descriptor, 1)
                    2 -> categoryId = ObjectId(decodeStringElement(descriptor, 2))
                    3 -> order = decodeIntElement(descriptor, 3)
                    4 -> active = decodeBooleanElement(descriptor, 4)
                    5 -> createdAt = Instant.parse(decodeStringElement(descriptor, 5))
                    6 -> updatedAt = Instant.parse(decodeStringElement(descriptor, 6))
                    CompositeDecoder.DECODE_DONE -> break
                    else -> error("Unexpected index: $index")
                }
            }

            Question(
                id = id ?: ObjectId(),
                text = text,
                categoryId = categoryId ?: ObjectId(),
                order = order,
                active = active,
                createdAt = createdAt ?: kotlinx.datetime.Clock.System.now(),
                updatedAt = updatedAt ?: kotlinx.datetime.Clock.System.now()
            )
        }
    }
}

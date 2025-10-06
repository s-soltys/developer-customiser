package config

import kotlinx.datetime.Instant
import org.bson.BsonReader
import org.bson.BsonWriter
import org.bson.BsonType
import org.bson.codecs.Codec
import org.bson.codecs.DecoderContext
import org.bson.codecs.EncoderContext
import org.bson.codecs.configuration.CodecProvider
import org.bson.codecs.configuration.CodecRegistry

class InstantCodec : Codec<Instant> {
    override fun encode(writer: BsonWriter, value: Instant, encoderContext: EncoderContext) {
        writer.writeString(value.toString())
    }

    override fun decode(reader: BsonReader, decoderContext: DecoderContext): Instant {
        return Instant.parse(reader.readString())
    }

    override fun getEncoderClass(): Class<Instant> = Instant::class.java
}

// Codec for response values that can be String or List<String>
class ResponseValueCodec : Codec<Any> {
    override fun encode(writer: BsonWriter, value: Any, encoderContext: EncoderContext) {
        when (value) {
            is String -> writer.writeString(value)
            is List<*> -> {
                writer.writeStartArray()
                @Suppress("UNCHECKED_CAST")
                (value as List<String>).forEach { writer.writeString(it) }
                writer.writeEndArray()
            }
            else -> throw IllegalArgumentException("Unsupported response value type: ${value::class.java}")
        }
    }

    override fun decode(reader: BsonReader, decoderContext: DecoderContext): Any {
        return when (reader.currentBsonType) {
            BsonType.STRING -> reader.readString()
            BsonType.ARRAY -> {
                reader.readStartArray()
                val list = mutableListOf<String>()
                while (reader.readBsonType() != BsonType.END_OF_DOCUMENT) {
                    list.add(reader.readString())
                }
                reader.readEndArray()
                list
            }
            else -> throw IllegalArgumentException("Unsupported BSON type for response value: ${reader.currentBsonType}")
        }
    }

    override fun getEncoderClass(): Class<Any> = Any::class.java
}

class CustomCodecProvider : CodecProvider {
    @Suppress("UNCHECKED_CAST")
    override fun <T : Any?> get(clazz: Class<T>, registry: CodecRegistry): Codec<T>? {
        return when (clazz) {
            Instant::class.java -> InstantCodec() as Codec<T>
            Any::class.java -> ResponseValueCodec() as Codec<T>
            java.lang.Object::class.java -> ResponseValueCodec() as Codec<T>
            else -> null
        }
    }
}

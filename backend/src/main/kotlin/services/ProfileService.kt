package services

import com.mongodb.kotlin.client.coroutine.MongoDatabase
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.datetime.Clock
import models.Profile
import models.Response
import org.bson.types.ObjectId
import org.litote.kmongo.eq
import java.util.UUID

class ProfileService(private val database: MongoDatabase) {

    private val collection = database.getCollection<Profile>("profiles")

    suspend fun createProfile(name: String): Profile {
        val profile = Profile(
            name = name.trim(),
            shareableId = UUID.randomUUID().toString(),
            createdAt = Clock.System.now(),
            updatedAt = Clock.System.now(),
            responses = emptyMap()
        )

        collection.insertOne(profile)
        return profile
    }

    suspend fun getProfileById(id: ObjectId): Profile? {
        return collection.find(Profile::id eq id).firstOrNull()
    }

    suspend fun getProfileByShareableId(shareableId: String): Profile? {
        return collection.find(Profile::shareableId eq shareableId).firstOrNull()
    }

    suspend fun updateProfile(
        id: ObjectId,
        responses: Map<String, Map<String, Response>>
    ): Profile? {
        val existingProfile = getProfileById(id) ?: return null

        val updatedProfile = existingProfile.copy(
            responses = responses,
            updatedAt = Clock.System.now()
        )

        collection.replaceOne(Profile::id eq id, updatedProfile)
        return updatedProfile
    }

    suspend fun deleteProfile(id: ObjectId): Boolean {
        val result = collection.deleteOne(Profile::id eq id)
        return result.deletedCount > 0
    }
}

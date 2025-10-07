package services

import kotlinx.datetime.Clock
import models.Profile
import models.Response
import org.bson.types.ObjectId
import org.litote.kmongo.*
import org.litote.kmongo.coroutine.CoroutineDatabase
import java.util.UUID

class ProfileService(private val database: CoroutineDatabase) {

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
        return collection.findOneById(id)
    }

    suspend fun getProfileByShareableId(shareableId: String): Profile? {
        return collection.findOne(Profile::shareableId eq shareableId)
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

        collection.replaceOneById(id, updatedProfile)
        return updatedProfile
    }

    suspend fun deleteProfile(id: ObjectId): Boolean {
        return collection.deleteOneById(id).deletedCount > 0
    }
}

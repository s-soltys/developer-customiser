package services

import com.mongodb.kotlin.client.coroutine.MongoDatabase
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.toList
import models.Question
import org.litote.kmongo.and
import org.litote.kmongo.eq

class QuestionService(private val database: MongoDatabase) {

    private val collection = database.getCollection<Question>("questions")

    suspend fun getAllQuestions(): List<Question> {
        return collection.find()
            .toList()
            .sortedWith(compareBy({ it.categoryId }, { it.order }))
    }

    suspend fun getQuestionsByCategory(categoryId: String): List<Question> {
        return collection.find(Question::categoryId eq categoryId)
            .toList()
            .sortedBy { it.order }
    }

    suspend fun validateQuestionExists(categoryId: String, questionId: String): Boolean {
        return collection.find(
            and(
                Question::categoryId eq categoryId,
                Question::questionId eq questionId
            )
        ).firstOrNull() != null
    }

    suspend fun getQuestion(categoryId: String, questionId: String): Question? {
        return collection.find(
            and(
                Question::categoryId eq categoryId,
                Question::questionId eq questionId
            )
        ).firstOrNull()
    }
}

package services

import com.mongodb.client.model.IndexOptions
import kotlinx.datetime.Clock
import models.Category
import models.Question
import org.bson.Document
import org.bson.types.ObjectId
import org.litote.kmongo.*
import org.litote.kmongo.coroutine.CoroutineDatabase

/**
 * Service for Question CRUD operations with soft delete support.
 */
class QuestionService(private val database: CoroutineDatabase) {
    private val questionCollection = database.getCollection<Question>("questions")
    private val categoryCollection = database.getCollection<Category>("categories")

    suspend fun createIndexes() {
        // Compound index on category + order for efficient queries
        questionCollection.createIndex(
            ascending(Question::categoryId, Question::order)
        )

        // Index on active for filtering
        questionCollection.createIndex(ascending(Question::active))
    }

    /**
     * Create a new question.
     * @throws IllegalArgumentException if text is empty/too long or categoryId invalid
     * @throws IllegalStateException if category doesn't exist
     */
    suspend fun createQuestion(text: String, categoryId: ObjectId, order: Int): Question {
        // Validate category exists
        val category = categoryCollection.findOneById(categoryId)
            ?: throw IllegalStateException("Category with id '$categoryId' does not exist")

        val question = Question(
            text = text,
            categoryId = categoryId,
            order = order
        )

        questionCollection.insertOne(question)
        return question
    }

    /**
     * Get all questions (including inactive for admin view).
     * @param categoryId optional filter by category
     */
    suspend fun getAllQuestions(categoryId: ObjectId? = null): List<Question> {
        val filter = if (categoryId != null) {
            Question::categoryId eq categoryId
        } else {
            null
        }

        return questionCollection
            .find(filter ?: Document())
            .sort(ascending(Question::categoryId, Question::order))
            .toList()
    }

    /**
     * Get only active questions (for public API).
     * @param categoryId optional filter by category
     */
    suspend fun getActiveQuestions(categoryId: ObjectId? = null): List<Question> {
        val filter = if (categoryId != null) {
            and(
                Question::categoryId eq categoryId,
                Question::active eq true
            )
        } else {
            Question::active eq true
        }

        return questionCollection
            .find(filter)
            .sort(ascending(Question::categoryId, Question::order))
            .toList()
    }

    /**
     * Get question by ID.
     */
    suspend fun getQuestionById(id: ObjectId): Question? {
        return questionCollection.findOneById(id)
    }

    /**
     * Update question text, category, and/or order.
     * @return updated question or null if not found
     */
    suspend fun updateQuestion(
        id: ObjectId,
        text: String? = null,
        categoryId: ObjectId? = null,
        order: Int? = null
    ): Question? {
        val question = questionCollection.findOneById(id) ?: return null

        val updates = mutableListOf<SetTo<*>>()

        if (text != null && text != question.text) {
            require(text.isNotBlank()) { "Question text cannot be empty" }
            require(text.length <= 500) { "Question text cannot exceed 500 characters" }
            updates.add(SetTo(Question::text, text))
        }

        if (categoryId != null && categoryId != question.categoryId) {
            // Validate category exists
            val category = categoryCollection.findOneById(categoryId)
                ?: throw IllegalStateException("Category with id '$categoryId' does not exist")
            updates.add(SetTo(Question::categoryId, categoryId))
        }

        if (order != null && order != question.order) {
            require(order >= 0) { "Question order must be non-negative" }
            updates.add(SetTo(Question::order, order))
        }

        if (updates.isEmpty()) {
            return question
        }

        updates.add(SetTo(Question::updatedAt, Clock.System.now()))

        questionCollection.updateOneById(
            id,
            set(*updates.toTypedArray())
        )

        return questionCollection.findOneById(id)
    }

    /**
     * Soft delete a question.
     * User responses to deleted questions are preserved.
     * @return true if deleted, false if not found
     */
    suspend fun softDeleteQuestion(id: ObjectId): Boolean {
        val question = questionCollection.findOneById(id) ?: return false

        questionCollection.updateOneById(
            id,
            set(
                SetTo(Question::active, false),
                SetTo(Question::updatedAt, Clock.System.now())
            )
        )

        return true
    }
}

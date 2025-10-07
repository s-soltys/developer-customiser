package services

import com.mongodb.client.model.IndexOptions
import kotlinx.datetime.Clock
import models.Category
import models.Question
import org.bson.types.ObjectId
import org.litote.kmongo.*
import org.litote.kmongo.coroutine.CoroutineDatabase

/**
 * Service for Category CRUD operations with soft delete support.
 */
class CategoryService(private val database: CoroutineDatabase) {
    private val categoryCollection = database.getCollection<Category>("categories")
    private val questionCollection = database.getCollection<Question>("questions")

    suspend fun createIndexes() {
        // Unique index on name (among active categories)
        categoryCollection.createIndex(
            ascending(Category::name),
            IndexOptions()
                .unique(true)
                .partialFilterExpression(Category::active eq true)
        )

        // Index on order for sorting
        categoryCollection.createIndex(ascending(Category::order))
    }

    /**
     * Create a new category.
     * @throws IllegalArgumentException if name is empty or too long
     * @throws IllegalStateException if category with name already exists (among active)
     */
    suspend fun createCategory(name: String, order: Int): Category {
        // Check for duplicate name among active categories
        val existing = categoryCollection.findOne(
            and(
                Category::name eq name,
                Category::active eq true
            )
        )

        if (existing != null) {
            throw IllegalStateException("Category with name '$name' already exists")
        }

        val category = Category(
            name = name,
            order = order
        )

        categoryCollection.insertOne(category)
        return category
    }

    /**
     * Get all categories (including inactive for admin view).
     */
    suspend fun getAllCategories(): List<Category> {
        return categoryCollection
            .find()
            .sort(ascending(Category::order))
            .toList()
    }

    /**
     * Get only active categories (for public API).
     */
    suspend fun getActiveCategories(): List<Category> {
        return categoryCollection
            .find(Category::active eq true)
            .sort(ascending(Category::order))
            .toList()
    }

    /**
     * Get category by ID.
     */
    suspend fun getCategoryById(id: ObjectId): Category? {
        return categoryCollection.findOneById(id)
    }

    /**
     * Update category name and/or order.
     * @return updated category or null if not found
     */
    suspend fun updateCategory(
        id: ObjectId,
        name: String? = null,
        order: Int? = null
    ): Category? {
        val category = categoryCollection.findOneById(id) ?: return null

        val updates = mutableListOf<SetTo<*>>()

        if (name != null && name != category.name) {
            // Check for duplicate name
            val existing = categoryCollection.findOne(
                and(
                    Category::name eq name,
                    Category::active eq true,
                    Category::id ne id
                )
            )
            if (existing != null) {
                throw IllegalStateException("Category with name '$name' already exists")
            }
            updates.add(SetTo(Category::name, name))
        }

        if (order != null && order != category.order) {
            updates.add(SetTo(Category::order, order))
        }

        if (updates.isEmpty()) {
            return category
        }

        updates.add(SetTo(Category::updatedAt, Clock.System.now()))

        categoryCollection.updateOneById(
            id,
            set(*updates.toTypedArray())
        )

        return categoryCollection.findOneById(id)
    }

    /**
     * Soft delete a category.
     * @param cascade if true, also soft delete all questions in this category
     * @throws IllegalStateException if category has active questions and cascade is false
     * @return true if deleted, false if not found
     */
    suspend fun softDeleteCategory(id: ObjectId, cascade: Boolean = false): Boolean {
        val category = categoryCollection.findOneById(id) ?: return false

        // Check for active questions
        val activeQuestionCount = questionCollection.countDocuments(
            and(
                Question::categoryId eq id,
                Question::active eq true
            )
        )

        if (activeQuestionCount > 0 && !cascade) {
            throw IllegalStateException(
                "Cannot delete category with $activeQuestionCount active questions. " +
                "Use cascade=true to soft delete questions as well."
            )
        }

        // Soft delete questions if cascade
        if (cascade && activeQuestionCount > 0) {
            questionCollection.updateMany(
                Question::categoryId eq id,
                set(
                    SetTo(Question::active, false),
                    SetTo(Question::updatedAt, Clock.System.now())
                )
            )
        }

        // Soft delete category
        categoryCollection.updateOneById(
            id,
            set(
                SetTo(Category::active, false),
                SetTo(Category::updatedAt, Clock.System.now())
            )
        )

        return true
    }
}

import kotlinx.coroutines.runBlocking
import org.litote.kmongo.coroutine.CoroutineDatabase
import services.CategoryService
import services.QuestionService

/**
 * Database setup: Create indexes for optimal query performance.
 * Should be called during application startup.
 */
suspend fun setupDatabase(database: CoroutineDatabase) {
    println("Setting up database indexes...")

    // Create indexes for CategoryService
    val categoryService = CategoryService(database)
    categoryService.createIndexes()

    // Create indexes for QuestionService
    val questionService = QuestionService(database)
    questionService.createIndexes()

    println("✅ Database indexes created successfully")
}

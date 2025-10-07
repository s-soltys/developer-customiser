import kotlinx.coroutines.runBlocking
import kotlinx.datetime.Clock
import org.bson.types.ObjectId
import org.litote.kmongo.coroutine.coroutine
import org.litote.kmongo.reactivestreams.KMongo

/**
 * Database seed script for initial categories.
 * Run with: ./gradlew run --args="seed"
 */

data class Category(
    val id: ObjectId = ObjectId(),
    val name: String,
    val order: Int,
    val active: Boolean = true,
    val createdAt: kotlinx.datetime.Instant = Clock.System.now(),
    val updatedAt: kotlinx.datetime.Instant = Clock.System.now()
)

fun main(args: Array<String>) {
    if (args.isNotEmpty() && args[0] == "seed") {
        println("🌱 Starting database seed...")
        runBlocking {
            seedDatabase()
        }
    } else {
        println("Usage: ./gradlew run --args=\"seed\"")
    }
}

suspend fun seedDatabase() {
    val mongoUri = System.getenv("MONGODB_URI") ?: "mongodb://localhost:27017"
    val dbName = System.getenv("DB_NAME") ?: "howtoworkwithme"

    println("Connecting to MongoDB at: $mongoUri")
    val client = KMongo.createClient(mongoUri).coroutine
    val database = client.getDatabase(dbName)
    val categoryCollection = database.getCollection<Category>("categories")

    // Check if categories already exist
    val existingCount = categoryCollection.countDocuments()
    if (existingCount > 0) {
        println("⚠️  Database already contains $existingCount categories. Skipping seed.")
        client.close()
        return
    }

    // Initial 6 categories
    val initialCategories = listOf(
        Category(name = "Communication", order = 0),
        Category(name = "Work Style", order = 1),
        Category(name = "Collaboration", order = 2),
        Category(name = "Feedback", order = 3),
        Category(name = "Boundaries", order = 4),
        Category(name = "Problem Solving", order = 5)
    )

    println("Inserting ${initialCategories.size} categories...")
    categoryCollection.insertMany(initialCategories)

    println("✅ Seed complete! Inserted categories:")
    initialCategories.forEach { category ->
        println("  - ${category.name} (order: ${category.order})")
    }

    client.close()
    println("🎉 Database seeding finished successfully!")
}

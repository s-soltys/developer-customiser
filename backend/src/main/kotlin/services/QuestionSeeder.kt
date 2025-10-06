package services

import com.mongodb.kotlin.client.coroutine.MongoDatabase
import kotlinx.coroutines.flow.firstOrNull
import models.Category
import models.Question
import models.QuestionType
import org.litote.kmongo.coroutine.toList

class QuestionSeeder(private val database: MongoDatabase) {

    suspend fun seedQuestions() {
        val collection = database.getCollection<Question>("questions")

        // Check if questions already seeded
        val existingCount = collection.find().toList().size
        if (existingCount > 0) {
            println("Questions already seeded (${existingCount} questions found)")
            return
        }

        val questions = listOf(
            // Communication Preferences (3 questions)
            Question(
                categoryId = Category.COMMUNICATION.id,
                questionId = "preferred-channel",
                text = "What's your preferred communication channel?",
                type = QuestionType.CHOICE,
                choices = listOf("Slack", "Email", "Video call", "In-person", "Mix - depends on urgency"),
                order = 0
            ),
            Question(
                categoryId = Category.COMMUNICATION.id,
                questionId = "response-time",
                text = "What are your typical response time expectations?",
                type = QuestionType.TEXT,
                placeholder = "e.g., Within 24 hours for email, 1 hour for Slack during work hours",
                order = 1
            ),
            Question(
                categoryId = Category.COMMUNICATION.id,
                questionId = "meeting-preferences",
                text = "When do you prefer to schedule meetings?",
                type = QuestionType.TEXT,
                placeholder = "e.g., Afternoons, no meetings before 10 AM",
                order = 2
            ),

            // Work Style (3 questions)
            Question(
                categoryId = Category.WORK_STYLE.id,
                questionId = "focus-hours",
                text = "When are your deep focus hours?",
                type = QuestionType.TEXT,
                placeholder = "e.g., 9-11 AM daily, no interruptions please",
                order = 0
            ),
            Question(
                categoryId = Category.WORK_STYLE.id,
                questionId = "collaboration",
                text = "How do you prefer to collaborate?",
                type = QuestionType.TEXT,
                placeholder = "e.g., Async first, sync when needed",
                order = 1
            ),
            Question(
                categoryId = Category.WORK_STYLE.id,
                questionId = "timezone",
                text = "What's your timezone and typical working hours?",
                type = QuestionType.TEXT,
                placeholder = "e.g., EST, 9 AM - 5 PM",
                order = 2
            ),

            // Feedback Style (2 questions)
            Question(
                categoryId = Category.FEEDBACK.id,
                questionId = "delivery-style",
                text = "How do you prefer to receive feedback?",
                type = QuestionType.CHOICE,
                choices = listOf("Direct and concise", "Diplomatic with context", "Mix of both", "Written first, then discuss"),
                order = 0
            ),
            Question(
                categoryId = Category.FEEDBACK.id,
                questionId = "frequency",
                text = "How often do you like to receive feedback?",
                type = QuestionType.TEXT,
                placeholder = "e.g., Regular 1:1s, real-time, after projects",
                order = 1
            ),

            // Strengths & Growing Areas (2 questions)
            Question(
                categoryId = Category.STRENGTHS.id,
                questionId = "strengths",
                text = "What are your key strengths?",
                type = QuestionType.TEXT,
                placeholder = "e.g., Strategic thinking, problem-solving, mentoring",
                order = 0
            ),
            Question(
                categoryId = Category.STRENGTHS.id,
                questionId = "growth-areas",
                text = "What areas are you currently focused on developing?",
                type = QuestionType.TEXT,
                placeholder = "e.g., Public speaking, delegation, technical depth",
                order = 1
            ),

            // Pet Peeves & Energizers (2 questions)
            Question(
                categoryId = Category.PET_PEEVES.id,
                questionId = "pet-peeves",
                text = "What are your workplace pet peeves?",
                type = QuestionType.TEXT,
                placeholder = "e.g., Last-minute meetings, unclear objectives",
                order = 0
            ),
            Question(
                categoryId = Category.PET_PEEVES.id,
                questionId = "energizers",
                text = "What energizes you at work?",
                type = QuestionType.TEXT,
                placeholder = "e.g., Solving complex problems, helping teammates grow",
                order = 1
            ),

            // Personal Context (2 questions)
            Question(
                categoryId = Category.PERSONAL.id,
                questionId = "hobbies",
                text = "What are your hobbies or interests outside of work?",
                type = QuestionType.TEXT,
                placeholder = "e.g., Hiking, photography, cooking",
                order = 0
            ),
            Question(
                categoryId = Category.PERSONAL.id,
                questionId = "fun-facts",
                text = "Any fun facts you'd like to share?",
                type = QuestionType.TEXT,
                placeholder = "e.g., Lived in 3 countries, speak 4 languages",
                order = 1
            )
        )

        questions.forEach { collection.insertOne(it) }
        println("Seeded ${questions.size} questions into database")
    }
}

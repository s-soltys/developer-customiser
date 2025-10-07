# Data Model: Backoffice Question Configuration

**Feature**: 002-create-a-backoffice
**Date**: 2025-10-07
**Purpose**: Define data entities, relationships, and database schema for admin-managed questions and categories

---

## Entity Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Category   │ 1     * │   Question   │ *     * │  Response   │
│             ├─────────┤              ├─────────┤ (in Profile)│
│  - id       │         │  - id        │         │  - value    │
│  - name     │         │  - text      │         │  - answeredAt│
│  - order    │         │  - categoryId│         │             │
│  - active   │         │  - order     │         └─────────────┘
│             │         │  - active    │
└─────────────┘         └──────────────┘
```

**Relationships**:
- One Category has many Questions (1:N)
- One Question has many Responses across user profiles (1:N, indirect via Profile.responses map)
- Soft delete: `active=false` hides entities but preserves data

---

## 1. Category Entity

### Purpose
Groups related questions in the "How to Work With Me" questionnaire. Categories appear as sections in the user-facing questionnaire.

### Schema (Kotlin/MongoDB)
```kotlin
@Serializable
data class Category(
    @BsonId
    @Contextual
    val id: ObjectId = ObjectId(),

    val name: String,

    val order: Int,

    val active: Boolean = true,

    @Contextual
    val createdAt: Instant = Clock.System.now(),

    @Contextual
    val updatedAt: Instant = Clock.System.now()
)
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | ObjectId | Yes | MongoDB primary key (auto-generated) |
| `name` | String | Yes | Display name (e.g., "Communication", "Work Style") |
| `order` | Int | Yes | Display order in questionnaire (0-indexed, globally enforced) |
| `active` | Boolean | Yes | Soft delete flag (false = hidden from public questionnaire) |
| `createdAt` | Instant | Yes | Timestamp when category created |
| `updatedAt` | Instant | Yes | Timestamp of last modification |

### Validation Rules
- `name`: Non-empty, max 100 characters, unique across active categories
- `order`: Non-negative integer, unique across active categories
- `active`: Boolean (true/false only)

### Indexes
```kotlin
// Unique index on name (among active categories)
collection.createIndex(
    ascending(Category::name),
    IndexOptions().unique(true).partialFilterExpression(Category::active eq true)
)

// Index on order for sorting
collection.createIndex(ascending(Category::order))
```

### Business Rules
1. **Deletion Constraint**: Cannot soft-delete category if it contains active questions (enforced in CategoryService)
2. **Order Uniqueness**: When reordering, shift affected categories to maintain unique order values
3. **Cascade Soft Delete**: Optional - soft-deleting category can cascade to its questions (preserves user responses)

---

## 2. Question Entity

### Purpose
Individual question within a category. Users answer questions to build their "How to Work With Me" profile.

### Schema (Kotlin/MongoDB)
```kotlin
@Serializable
data class Question(
    @BsonId
    @Contextual
    val id: ObjectId = ObjectId(),

    val text: String,

    @Contextual
    val categoryId: ObjectId,

    val order: Int,

    val active: Boolean = true,

    @Contextual
    val createdAt: Instant = Clock.System.now(),

    @Contextual
    val updatedAt: Instant = Clock.System.now()
)
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | ObjectId | Yes | MongoDB primary key (auto-generated) |
| `text` | String | Yes | Question text displayed to users |
| `categoryId` | ObjectId | Yes | Foreign key reference to Category.id |
| `order` | Int | Yes | Display order within category (0-indexed) |
| `active` | Boolean | Yes | Soft delete flag (false = hidden from new questionnaires) |
| `createdAt` | Instant | Yes | Timestamp when question created |
| `updatedAt` | Instant | Yes | Timestamp of last modification |

### Validation Rules
- `text`: Non-empty, max 500 characters
- `categoryId`: Must reference existing Category (validated before save)
- `order`: Non-negative integer, unique within category
- `active`: Boolean (true/false only)

### Indexes
```kotlin
// Compound index on category + order for efficient queries
collection.createIndex(
    compoundIndex(
        ascending(Question::categoryId),
        ascending(Question::order)
    )
)

// Index on active for filtering
collection.createIndex(ascending(Question::active))
```

### Business Rules
1. **Category Reference**: categoryId must exist in categories collection (enforced in QuestionService)
2. **Order Uniqueness**: Order values unique within categoryId scope
3. **Soft Delete Preservation**: Inactive questions remain in database; user responses still reference them
4. **Response Integrity**: Existing Profile.responses can reference inactive question IDs (viewable in profile, hidden in new questionnaires)

---

## 3. Response Entity (Existing, in Profile)

### Purpose
User's answer to a specific question, stored within their Profile document.

### Schema (Existing - No Changes)
```kotlin
@Serializable
data class Profile(
    @BsonId
    @Contextual
    val id: ObjectId = ObjectId(),

    val name: String,
    val shareableId: String,

    // Nested map: { categoryId: { questionId: Response } }
    val responses: Map<String, Map<String, Response>> = emptyMap(),

    @Contextual
    val createdAt: Instant,

    @Contextual
    val updatedAt: Instant
)

@Serializable
data class Response(
    val value: String,

    @Contextual
    val answeredAt: Instant
)
```

### Integration with Questions
- **Key structure**: `responses[categoryId][questionId]` stores response
- **Soft delete impact**:
  - If question soft-deleted (`active=false`), response remains in map
  - Public profile view shows response even if question is inactive
  - New questionnaires exclude inactive questions (no new responses created)
- **Category changes**:
  - If question moved to new category, old responses remain under original categoryId
  - Migration script can reassign responses if needed (deferred to implementation)

---

## 4. Database Collections

### Collection Names
- `categories` - Category documents
- `questions` - Question documents
- `profiles` - Profile documents (existing)

### Sample Data

#### Categories Collection
```json
[
  {
    "_id": ObjectId("..."),
    "name": "Communication",
    "order": 0,
    "active": true,
    "createdAt": "2025-10-07T10:00:00Z",
    "updatedAt": "2025-10-07T10:00:00Z"
  },
  {
    "_id": ObjectId("..."),
    "name": "Work Style",
    "order": 1,
    "active": true,
    "createdAt": "2025-10-07T10:00:00Z",
    "updatedAt": "2025-10-07T10:00:00Z"
  }
]
```

#### Questions Collection
```json
[
  {
    "_id": ObjectId("..."),
    "text": "What is your preferred communication channel?",
    "categoryId": ObjectId("...communication-id..."),
    "order": 0,
    "active": true,
    "createdAt": "2025-10-07T10:00:00Z",
    "updatedAt": "2025-10-07T10:00:00Z"
  },
  {
    "_id": ObjectId("..."),
    "text": "How do you prefer to receive feedback?",
    "categoryId": ObjectId("...feedback-id..."),
    "order": 0,
    "active": false,  // Soft deleted
    "createdAt": "2025-10-07T10:00:00Z",
    "updatedAt": "2025-10-07T11:30:00Z"
  }
]
```

---

## 5. Migration Strategy

### Phase 1: Initial Seed
1. Create 6 default categories (Communication, Work Style, Collaboration, Feedback, Boundaries, Problem Solving)
2. Migrate existing hardcoded questions to questions collection
3. Link each question to appropriate category via `categoryId`
4. Set initial `order` values based on current question sequence

### Seed Script (Kotlin)
```kotlin
suspend fun seedInitialData() {
    val categories = listOf(
        Category(name = "Communication", order = 0),
        Category(name = "Work Style", order = 1),
        Category(name = "Collaboration", order = 2),
        Category(name = "Feedback", order = 3),
        Category(name = "Boundaries", order = 4),
        Category(name = "Problem Solving", order = 5)
    )

    categoryCollection.insertMany(categories)

    // Map existing questions to categories...
    val questions = listOf(
        Question(
            text = "What is your preferred communication channel?",
            categoryId = categories[0].id, // Communication
            order = 0
        ),
        // ... more questions
    )

    questionCollection.insertMany(questions)
}
```

### Phase 2: Backward Compatibility
- Update `GET /api/questions` endpoint to read from database instead of hardcoded list
- Filter: `active=true` for public questionnaire
- Response format unchanged (maintains frontend compatibility)

### Phase 3: Cleanup (Post-MVP)
- Remove hardcoded question lists from codebase
- Add admin UI to manage initial seed data

---

## 6. Query Patterns

### Get Active Questions by Category (Public API)
```kotlin
suspend fun getActiveQuestionsByCategory(categoryId: ObjectId): List<Question> {
    return questionCollection
        .find(
            and(
                Question::categoryId eq categoryId,
                Question::active eq true
            )
        )
        .sort(ascending(Question::order))
        .toList()
}
```

### Get All Questions (Admin API)
```kotlin
suspend fun getAllQuestions(): List<Question> {
    return questionCollection
        .find()
        .sort(
            ascending(Question::categoryId, Question::order)
        )
        .toList()
}
```

### Soft Delete with Cascade Check (Admin API)
```kotlin
suspend fun softDeleteCategory(id: ObjectId, cascade: Boolean = false) {
    val activeCount = questionCollection.countDocuments(
        and(
            Question::categoryId eq id,
            Question::active eq true
        )
    )

    if (activeCount > 0 && !cascade) {
        throw ConflictException("Category has $activeCount active questions")
    }

    if (cascade) {
        questionCollection.updateMany(
            Question::categoryId eq id,
            set(Question::active, false)
        )
    }

    categoryCollection.updateOneById(id, set(Category::active, false))
}
```

---

## 7. Data Integrity Constraints

| Constraint | Enforcement | Failure Behavior |
|------------|-------------|------------------|
| Category name uniqueness (active) | MongoDB partial unique index | 409 Conflict error on duplicate |
| Question.categoryId exists | Application-level validation | 400 Bad Request if invalid |
| Order uniqueness within scope | Application-level reordering logic | Shift conflicting items |
| Soft delete preservation | Queries filter by `active=true` | Inactive items excluded from results |
| Response references | No foreign key (MongoDB) | Orphaned responses remain viewable |

---

## 8. Performance Considerations

### Expected Scale
- **Categories**: ~10-20 total (6 initial + growth)
- **Questions**: ~100-200 total (~10-20 per category)
- **Profiles**: Unlimited (user-generated)

### Indexing Strategy
- **Critical**: `categoryId + order` compound index (supports sorted category queries)
- **Optional**: `active` index (if filtering becomes bottleneck)
- **Avoid**: Full-text search on question.text (deferred to post-MVP)

### Caching Opportunities (Future)
- Cache active questions/categories in-memory (invalidate on admin updates)
- TTL: 60 seconds (eventual consistency acceptable per clarifications)

---

**Data Model Status**: ✅ Complete
**Next**: Generate API contracts (OpenAPI spec)

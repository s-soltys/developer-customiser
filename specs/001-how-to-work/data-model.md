# Data Model
**Feature**: How to Work With Me App
**Date**: 2025-10-06

## Overview
This document defines the data structures for the "How to Work With Me" application. The design prioritizes flexibility (easy to add questions) and simplicity (MVP scope).

---

## Collections

### 1. profiles
Stores user-created "How to Work With Me" profiles.

#### Schema
```kotlin
data class Profile(
    @BsonId
    val id: ObjectId = ObjectId(),
    val name: String,
    val shareableId: String,  // UUID v4 for public links
    val createdAt: Instant,
    val updatedAt: Instant,
    val responses: Map<String, Map<String, Response>>
    // responses structure: {categoryId: {questionId: Response}}
)

data class Response(
    val value: ResponseValue,
    val answeredAt: Instant
)

// Union type for different response formats
sealed class ResponseValue {
    data class Text(val text: String) : ResponseValue()
    data class Choice(val selected: String) : ResponseValue()
    data class MultiChoice(val selected: List<String>) : ResponseValue()
}
```

#### Validation Rules
- **name**: Required, non-empty string (1-100 characters)
- **shareableId**: UUID v4 format, unique index
- **responses**: Nested map structure
  - Category IDs must match existing categories
  - Question IDs must match existing questions
  - Response values must match question type

#### Indexes
```javascript
// MongoDB indexes
db.profiles.createIndex({ "shareableId": 1 }, { unique: true })
db.profiles.createIndex({ "createdAt": -1 })
db.profiles.createIndex({ "updatedAt": -1 })
```

#### Example Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "Alex Chen",
  "shareableId": "a3f2c5d8-9b1e-4f7a-8c2d-1e3b4f5a6b7c",
  "createdAt": ISODate("2025-10-06T10:30:00Z"),
  "updatedAt": ISODate("2025-10-06T10:45:00Z"),
  "responses": {
    "communication": {
      "preferred-channel": {
        "value": { "selected": "Slack" },
        "answeredAt": ISODate("2025-10-06T10:31:00Z")
      },
      "response-time": {
        "value": { "text": "Within 2 hours during work hours, next day otherwise" },
        "answeredAt": ISODate("2025-10-06T10:32:00Z")
      }
    },
    "work-style": {
      "focus-hours": {
        "value": { "text": "9-11 AM daily, no meetings please" },
        "answeredAt": ISODate("2025-10-06T10:35:00Z")
      }
    }
  }
}
```

---

### 2. questions
Stores question templates for the questionnaire. Seeded at application startup.

#### Schema
```kotlin
data class Question(
    @BsonId
    val id: ObjectId = ObjectId(),
    val categoryId: String,
    val questionId: String,  // Unique within category
    val text: String,
    val type: QuestionType,
    val choices: List<String>? = null,  // Only for choice/multichoice
    val placeholder: String? = null,     // For text inputs
    val order: Int
)

enum class QuestionType {
    TEXT,        // Free text input
    CHOICE,      // Single selection from choices
    MULTICHOICE  // Multiple selections from choices
}
```

#### Validation Rules
- **categoryId**: Must be one of the 6 defined categories
- **questionId**: Unique within categoryId
- **type**: Must match QuestionType enum
- **choices**: Required (non-empty) for CHOICE/MULTICHOICE, null for TEXT
- **order**: Determines display order within category (0-indexed)

#### Indexes
```javascript
db.questions.createIndex({ "categoryId": 1, "order": 1 })
db.questions.createIndex({ "categoryId": 1, "questionId": 1 }, { unique: true })
```

#### Predefined Categories
```kotlin
enum class Category(val id: String, val displayName: String) {
    COMMUNICATION("communication", "Communication Preferences"),
    WORK_STYLE("work-style", "Work Style"),
    FEEDBACK("feedback", "Feedback Style"),
    STRENGTHS("strengths", "Strengths & Growing Areas"),
    PET_PEEVES("pet-peeves", "Pet Peeves & Energizers"),
    PERSONAL("personal", "Personal Context")
}
```

#### Example Seed Data
```json
[
  {
    "_id": ObjectId("507f1f77bcf86cd799439021"),
    "categoryId": "communication",
    "questionId": "preferred-channel",
    "text": "What's your preferred communication channel?",
    "type": "CHOICE",
    "choices": ["Slack", "Email", "Video call", "In-person", "Mix - depends on urgency"],
    "order": 0
  },
  {
    "_id": ObjectId("507f1f77bcf86cd799439022"),
    "categoryId": "communication",
    "questionId": "response-time",
    "text": "What are your typical response time expectations?",
    "type": "TEXT",
    "placeholder": "e.g., Within 24 hours for email, 1 hour for Slack during work hours",
    "order": 1
  },
  {
    "_id": ObjectId("507f1f77bcf86cd799439023"),
    "categoryId": "communication",
    "questionId": "meeting-preferences",
    "text": "When do you prefer to schedule meetings?",
    "type": "TEXT",
    "placeholder": "e.g., Afternoons, no meetings before 10 AM",
    "order": 2
  }
]
```

---

## Relationships

```
Profile (1) ─────► (N) Response
                       │
                       ▼
Question (1) ◄───── (N) Response (reference via categoryId + questionId)
```

**Notes**:
- Responses are embedded within Profile documents (no separate collection)
- Questions are referenced by composite key (categoryId, questionId)
- No foreign key constraints enforced at DB level (MongoDB flexibility)
- Application layer validates question references exist

---

## State Transitions

### Profile Lifecycle
```
┌─────────┐
│ CREATING│ (name entered, no responses yet)
└────┬────┘
     │ User starts answering questions
     ▼
┌──────────┐
│IN_PROGRESS│ (some categories incomplete)
└────┬─────┘
     │ All categories completed
     ▼
┌──────────┐
│ COMPLETE │ (shareable link generated)
└────┬─────┘
     │ User edits responses
     ▼
┌──────────┐
│  EDITED  │ (updated timestamp changed)
└──────────┘
```

**Note**: State is implicit (derived from responses completeness), not stored as a field.

---

## Data Integrity Rules

### At Creation (POST /api/profiles)
1. Generate unique `shareableId` (UUID v4)
2. Set `createdAt` and `updatedAt` to current timestamp
3. Initialize empty `responses` map
4. Validate `name` is non-empty

### At Update (PUT /api/profiles/:id)
1. Validate all `categoryId` values exist in Category enum
2. Validate all `questionId` values exist in questions collection
3. Validate response values match question types:
   - TEXT → ResponseValue.Text
   - CHOICE → ResponseValue.Choice (value in question.choices)
   - MULTICHOICE → ResponseValue.MultiChoice (all values in question.choices)
4. Update `updatedAt` to current timestamp
5. Set `answeredAt` for new/modified responses

### At Retrieval (GET /api/profiles/share/:shareableId)
1. Lookup by `shareableId` (not ObjectId)
2. Return 404 if not found
3. No authentication required (public access)

---

## Scalability Considerations (Future)

While not required for MVP, these optimizations could be added later:

### Potential Optimizations
1. **Response Count Index**: Track completion percentage
   ```javascript
   db.profiles.createIndex({ "responseCount": 1 })
   ```

2. **View Tracking**: Add `viewCount` field to profiles
   ```kotlin
   val viewCount: Int = 0
   ```

3. **Soft Deletes**: Add `deletedAt` field instead of hard deletes
   ```kotlin
   val deletedAt: Instant? = null
   ```

4. **Caching Layer**: Cache question templates (rarely change)

5. **Sharding Key**: Use `shareableId` for horizontal scaling

---

## Migration Strategy

### Adding New Questions
1. Insert new document in `questions` collection
2. Assign next available `order` within category
3. No changes to existing profiles required (flexible schema)
4. New responses appear as "unanswered" for existing profiles

### Changing Question Types
1. **Not Recommended**: Breaks existing response data
2. **If Required**: Create new question with different ID, migrate responses

### Removing Questions
1. Soft delete: Add `deprecated: true` field
2. Keep question in DB for existing responses
3. Hide from new questionnaires

---

## TypeScript Types (Frontend)

```typescript
// Shared types between frontend and backend
export type QuestionType = 'TEXT' | 'CHOICE' | 'MULTICHOICE'

export interface Question {
  id: string
  categoryId: string
  questionId: string
  text: string
  type: QuestionType
  choices?: string[]
  placeholder?: string
  order: number
}

export interface Profile {
  id: string
  name: string
  shareableId: string
  createdAt: string  // ISO 8601
  updatedAt: string  // ISO 8601
  responses: Record<string, Record<string, {
    value: string | string[]
    answeredAt: string  // ISO 8601
  }>>
}

export interface CreateProfileRequest {
  name: string
}

export interface UpdateProfileRequest {
  responses: Profile['responses']
}
```

---

## Summary

**Key Design Decisions**:
1. **Flexible Schema**: Key-value responses support easy question additions
2. **Embedded Responses**: Single document read/write for profile operations
3. **No Authentication**: Profiles are public via shareable UUID links
4. **Implicit State**: Completeness derived from responses, not stored
5. **Seed Data**: Questions loaded at application startup from configuration

**Next**: Define API contracts based on this data model.

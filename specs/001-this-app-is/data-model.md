# Data Model: Manager Mindset Feedback Tool

**Feature**: 001-this-app-is
**Date**: 2025-10-06
**Status**: Phase 1 Design

## Overview
Flexible MongoDB schema design supporting extensible trait questions without migrations. Key entities: Profile, TraitQuestion, FeedbackResponse, and computed AggregateResults.

---

## Entities

### Profile
**Description**: Represents a manager's feedback collection session. Contains two unique link identifiers for access control.

**Storage**: MongoDB collection `profiles`

**Fields**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `_id` | ObjectId | Yes | MongoDB primary key | Auto-generated |
| `feedbackLinkId` | String | Yes | Public link ID for colleagues to submit feedback | UUID v4, unique index |
| `adminLinkId` | String | Yes | Private link ID for manager to view results | UUID v4, unique index |
| `createdAt` | DateTime | Yes | Profile creation timestamp | ISO 8601 |
| `responses` | Array<FeedbackResponse> | Yes | Embedded feedback responses | Can be empty array |

**Indexes**:
- `feedbackLinkId` (unique)
- `adminLinkId` (unique)
- `createdAt` (for cleanup/analytics)

**Example Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "feedbackLinkId": "f_a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "adminLinkId": "a_9876fedc-ba09-8765-4321-0fedcba98765",
  "createdAt": "2025-10-06T10:30:00.000Z",
  "responses": [
    // FeedbackResponse objects embedded here
  ]
}
```

**Relationships**:
- One-to-many with FeedbackResponse (embedded)
- No foreign keys (embedded document pattern)

**State Transitions**:
- Created → Active (has 0+ responses)
- No deletion or archival for MVP

---

### TraitQuestion
**Description**: Represents one trait dimension being rated. Hardcoded in application config, not stored in database.

**Storage**: Application configuration file (`src/main/resources/traits.json` or Kotlin data structure)

**Fields**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `traitId` | String | Yes | Unique identifier (e.g., "risk_taking") | Lowercase, underscores only |
| `label` | String | Yes | Display label (e.g., "Takes on risk vs. Risk averse") | 1-100 chars |
| `leftLabel` | String | Yes | Label for value 1 (e.g., "Takes on risk") | 1-50 chars |
| `rightLabel` | String | Yes | Label for value 5 (e.g., "Risk averse") | 1-50 chars |
| `order` | Integer | Yes | Display order in UI | 0-based index |

**Example Configuration**:
```json
[
  {
    "traitId": "risk_taking",
    "label": "Takes on risk vs. Risk averse",
    "leftLabel": "Takes on risk",
    "rightLabel": "Risk averse",
    "order": 0
  },
  {
    "traitId": "goofy_professional",
    "label": "Goofy vs. Professional",
    "leftLabel": "Goofy",
    "rightLabel": "Professional",
    "order": 1
  },
  {
    "traitId": "candid_diplomatic",
    "label": "Candid vs. Diplomatic",
    "leftLabel": "Candid",
    "rightLabel": "Diplomatic",
    "order": 2
  },
  {
    "traitId": "leadership_ic",
    "label": "Focused on leadership vs. Focused on individual contribution",
    "leftLabel": "Leadership focus",
    "rightLabel": "IC focus",
    "order": 3
  }
]
```

**Extensibility**:
- Add new traits by appending to config and redeploying
- Existing responses remain valid (missing traits shown as "Not rated")
- Frontend fetches trait definitions from `GET /api/traits` endpoint

---

### FeedbackResponse
**Description**: One colleague's submission for a profile. Embedded within Profile document.

**Storage**: Embedded in `profiles` collection within `responses` array

**Fields**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `respondentId` | String | Yes | Unique identifier for colleague (browser fingerprint or UUID) | Used for overwrite detection |
| `respondentName` | String | No | Optional display name entered by colleague | 1-100 chars, defaults to "Anonymous" |
| `submittedAt` | DateTime | Yes | Submission timestamp | ISO 8601 |
| `traits` | Array<TraitRating> | Yes | Array of trait ratings | Must contain all trait IDs from config |

**TraitRating Subdocument**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `traitId` | String | Yes | Reference to TraitQuestion ID | Must match config traitId |
| `value` | Integer | Yes | Rating value | 1-5 inclusive |

**Example Embedded Document**:
```json
{
  "respondentId": "fp_abc123xyz",
  "respondentName": "Jane Doe",
  "submittedAt": "2025-10-06T14:30:00.000Z",
  "traits": [
    { "traitId": "risk_taking", "value": 4 },
    { "traitId": "goofy_professional", "value": 2 },
    { "traitId": "candid_diplomatic", "value": 5 },
    { "traitId": "leadership_ic", "value": 3 }
  ]
}
```

**Upsert Logic**:
- When submitting, check if `respondentId` already exists in `profile.responses`
- If exists: Replace entire response object
- If not: Append to `responses` array
- Use MongoDB `$pull` + `$push` or `findOneAndUpdate` with array filters

**Validation Rules**:
- FR-005: All traits must have values (1-5) before submission
- FR-013: Same `respondentId` overwrites previous response

---

### AggregateResults
**Description**: Computed aggregate data from all responses for a profile. Not stored in database - calculated on-demand.

**Computation**: Server-side aggregation when requested via API

**Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `traitId` | String | Trait identifier |
| `average` | Float | Mean of all values for this trait (1.0-5.0) |
| `count` | Integer | Number of responses contributing to this trait |
| `values` | Array<Integer> | Distribution of values [count of 1s, 2s, 3s, 4s, 5s] |

**Example Response**:
```json
{
  "profileId": "f_a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "totalResponses": 5,
  "aggregates": [
    {
      "traitId": "risk_taking",
      "average": 3.6,
      "count": 5,
      "values": [0, 1, 1, 2, 1]  // 0 ones, 1 two, 1 three, 2 fours, 1 five
    },
    {
      "traitId": "goofy_professional",
      "average": 2.2,
      "count": 5,
      "values": [0, 3, 2, 0, 0]
    }
    // ... other traits
  ]
}
```

**Aggregation Query** (KMongo):
```kotlin
// Pseudo-code for aggregation
profiles.aggregate<AggregateResult>(
  match(Profile::feedbackLinkId eq linkId),
  unwind(Profile::responses),
  unwind("responses.traits"),
  group(
    id = "traits.traitId",
    avg = avg("traits.value"),
    count = sum(1),
    values = push("traits.value")
  )
)
```

**FR Mapping**:
- FR-009: Radar chart shows combined data from all respondents
- FR-014: Managers can view aggregate results

---

## Data Validation Rules

### Profile Creation (FR-001, FR-002)
- Generate unique `feedbackLinkId` with prefix `f_`
- Generate unique `adminLinkId` with prefix `a_`
- Ensure uniqueness via database unique constraints
- Initialize `responses` as empty array

### Feedback Submission (FR-005, FR-006, FR-013)
- Validate all trait IDs match current config
- Validate all values are integers 1-5
- Generate or retrieve `respondentId` (browser fingerprint or cookie)
- If `respondentName` not provided, default to "Anonymous"
- Upsert logic: overwrite if `respondentId` exists

### Respondent Identity (FR-015)
- Capture `respondentName` from form input
- Store `respondentId` for tracking re-submissions
- Display both in manager's individual results view

### Data Retention (FR-012)
- No TTL indexes
- No automatic deletion
- Manual cleanup only (future admin feature if needed)

---

## Schema Migration Strategy

### Adding New Traits
1. Update `traits.json` config with new trait definition
2. Deploy backend (no database migration needed)
3. Existing profiles: new trait shows as "Not rated" in aggregate
4. New responses: include new trait in submission

### Removing Traits (Future)
1. Remove from config
2. Historic data preserved but ignored in aggregations
3. Optionally: mark as deprecated rather than removing

### Changing Trait Labels
1. Update config labels
2. `traitId` remains stable (data unchanged)
3. UI reflects new labels immediately

**No Breaking Changes**: Flexible key-value design prevents schema migrations.

---

## Sample Data for Testing

### Empty Profile
```json
{
  "_id": ObjectId("..."),
  "feedbackLinkId": "f_empty_profile",
  "adminLinkId": "a_empty_profile",
  "createdAt": "2025-10-06T10:00:00.000Z",
  "responses": []
}
```

### Profile with One Response
```json
{
  "_id": ObjectId("..."),
  "feedbackLinkId": "f_one_response",
  "adminLinkId": "a_one_response",
  "createdAt": "2025-10-06T10:00:00.000Z",
  "responses": [
    {
      "respondentId": "fp_test_001",
      "respondentName": "Test User",
      "submittedAt": "2025-10-06T11:00:00.000Z",
      "traits": [
        { "traitId": "risk_taking", "value": 3 },
        { "traitId": "goofy_professional", "value": 3 },
        { "traitId": "candid_diplomatic", "value": 3 },
        { "traitId": "leadership_ic", "value": 3 }
      ]
    }
  ]
}
```

### Profile with Multiple Responses
```json
{
  "_id": ObjectId("..."),
  "feedbackLinkId": "f_multi_response",
  "adminLinkId": "a_multi_response",
  "createdAt": "2025-10-06T10:00:00.000Z",
  "responses": [
    {
      "respondentId": "fp_alice",
      "respondentName": "Alice",
      "submittedAt": "2025-10-06T11:00:00.000Z",
      "traits": [
        { "traitId": "risk_taking", "value": 5 },
        { "traitId": "goofy_professional", "value": 1 },
        { "traitId": "candid_diplomatic", "value": 4 },
        { "traitId": "leadership_ic", "value": 5 }
      ]
    },
    {
      "respondentId": "fp_bob",
      "respondentName": "Bob",
      "submittedAt": "2025-10-06T12:00:00.000Z",
      "traits": [
        { "traitId": "risk_taking", "value": 2 },
        { "traitId": "goofy_professional", "value": 4 },
        { "traitId": "candid_diplomatic", "value": 2 },
        { "traitId": "leadership_ic", "value": 1 }
      ]
    }
  ]
}
```

---

## Edge Cases Handled

1. **Zero Responses**: Aggregate endpoint returns empty arrays, radar chart shows "No data yet"
2. **Resubmission**: `respondentId` matching replaces existing response in array
3. **Missing Trait in Old Data**: If new trait added, old responses show as "Not rated" or excluded from that trait's aggregate
4. **Concurrent Submissions**: MongoDB atomic array operations prevent data loss
5. **Invalid Link IDs**: Return 404 for non-existent feedbackLinkId or adminLinkId

---

## Performance Considerations

### Indexing Strategy
- Unique indexes on link IDs enable O(1) lookups
- No need to index within embedded responses (small array size for MVP)

### Query Patterns
- Profile lookup by link ID: Fast (indexed)
- Aggregate calculation: In-memory (small data size, embedded responses)
- Individual responses: Direct array access

### Scaling Notes (Post-MVP)
- For 1000+ responses per profile: Consider separate `responses` collection with foreign key
- For analytics: Add background job to pre-compute aggregates
- Current design sufficient for MVP (<100 responses per profile)

---

## Technology Mapping

### Backend (Kotlin + KMongo)
```kotlin
data class Profile(
    @BsonId val id: ObjectId = ObjectId(),
    val feedbackLinkId: String,
    val adminLinkId: String,
    val createdAt: Instant,
    val responses: List<FeedbackResponse> = emptyList()
)

data class FeedbackResponse(
    val respondentId: String,
    val respondentName: String = "Anonymous",
    val submittedAt: Instant,
    val traits: List<TraitRating>
)

data class TraitRating(
    val traitId: String,
    val value: Int // 1-5
)
```

### Frontend (TypeScript)
```typescript
interface Profile {
  feedbackLinkId: string;
  adminLinkId: string;
  createdAt: string;
}

interface FeedbackResponse {
  respondentId: string;
  respondentName: string;
  submittedAt: string;
  traits: TraitRating[];
}

interface TraitRating {
  traitId: string;
  value: number; // 1-5
}

interface AggregateResults {
  profileId: string;
  totalResponses: number;
  aggregates: TraitAggregate[];
}

interface TraitAggregate {
  traitId: string;
  average: number;
  count: number;
  values: number[]; // [count of 1s, 2s, 3s, 4s, 5s]
}
```

---

## Next Steps
Proceed to API contract generation in `/contracts/` directory.

# How to Work With Me App - Development Guidelines

**Auto-generated from feature plans** | Last updated: 2025-10-07
**Features**: 001-how-to-work, 002-create-a-backoffice

---

## Project Overview

This is a monorepo containing a full-stack web application for creating and sharing "How to Work With Me" profiles.

**Stack**:
- **Frontend**: React 18+ with TypeScript, Tailwind CSS, React Query (TanStack Query), Vite
- **Backend**: Kotlin with Ktor framework, KMongo for MongoDB, Kotest for testing
- **Database**: MongoDB (flexible document schema)
- **Build**: Node.js 18+ (frontend), Gradle 8+ (backend)

---

## Monorepo Structure

```
/
├── backend/                 # Kotlin + Ktor REST API
│   ├── src/main/kotlin/
│   │   ├── models/         # Data models
│   │   ├── services/       # Business logic
│   │   └── api/            # HTTP endpoints
│   ├── src/test/kotlin/    # Kotest tests
│   └── build.gradle.kts
├── frontend/                # React + TypeScript SPA
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page-level routes
│   │   ├── hooks/          # Custom React hooks
│   │   └── services/       # API client (React Query)
│   ├── tests/
│   └── package.json
├── shared/
│   └── contracts/          # OpenAPI spec
├── specs/                  # Feature specifications
└── docker-compose.yml      # MongoDB for development
```

---

## Development Commands

### Backend (Kotlin)
```bash
cd backend
./gradlew test              # Run all tests
./gradlew run               # Start server on :8080
./gradlew build             # Build JAR
./gradlew clean             # Clean build artifacts
```

### Frontend (React)
```bash
cd frontend
npm install                 # Install dependencies
npm run dev                 # Start dev server on :5173
npm run build               # Production build
npm run test                # Run Vitest tests
npm run lint                # ESLint check
```

### Database
```bash
docker-compose up -d        # Start MongoDB
docker-compose down         # Stop MongoDB
docker-compose logs mongodb # View logs
```

---

## Code Style Guidelines

### Kotlin (Backend)

**Conventions**:
- Use idiomatic Kotlin: data classes, sealed classes, extension functions
- Leverage coroutines for async operations (Ktor and KMongo support)
- Follow naming: PascalCase for classes, camelCase for functions/properties
- Use dependency injection patterns (simple constructor injection for MVP)

**Example**:
```kotlin
data class Profile(
    val id: ObjectId = ObjectId(),
    val name: String,
    val shareableId: String,
    val responses: Map<String, Map<String, Response>>
)

// Coroutine-based service
class ProfileService(private val database: MongoDatabase) {
    suspend fun createProfile(name: String): Profile {
        val profile = Profile(
            name = name,
            shareableId = UUID.randomUUID().toString()
        )
        database.getCollection<Profile>("profiles").insertOne(profile)
        return profile
    }
}
```

**Testing with Kotest**:
```kotlin
class ProfileServiceTest : StringSpec({
    "should create profile with unique shareable ID" {
        val service = ProfileService(testDatabase)
        val profile = service.createProfile("Test User")

        profile.name shouldBe "Test User"
        profile.shareableId shouldNotBe null
    }
})
```

### React (Frontend)

**Conventions**:
- Functional components with hooks (no class components)
- TypeScript strict mode enabled
- React Query for all server state
- Tailwind CSS for styling (no CSS modules or styled-components)
- Component file structure: PascalCase.tsx

**Example**:
```typescript
// hooks/useCreateProfile.ts
export function useCreateProfile() {
  return useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('http://localhost:8080/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      return response.json()
    }
  })
}

// pages/NameEntry.tsx
export function NameEntry() {
  const [name, setName] = useState('')
  const createProfile = useCreateProfile()

  const handleSubmit = () => {
    if (name.trim()) {
      createProfile.mutate(name)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 border rounded"
        placeholder="Enter your name"
      />
      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded"
      >
        Continue
      </button>
    </div>
  )
}
```

---

## API Integration

**Base URL**: `http://localhost:8080` (development)
**Contract**: See `specs/001-how-to-work/contracts/api-spec.yaml`

**Key Endpoints**:
- `GET /api/questions` - Fetch all active question templates
- `POST /api/profiles` - Create new profile
- `PUT /api/profiles/:id` - Update profile responses
- `GET /api/profiles/share/:shareableId` - Get public profile
- `POST /api/admin/auth` - Authenticate admin (password validation)
- `GET /api/admin/categories` - List all categories (admin)
- `POST /api/admin/categories` - Create category (admin)
- `PUT /api/admin/categories/:id` - Update category (admin)
- `DELETE /api/admin/categories/:id` - Soft delete category (admin)
- `GET /api/admin/questions` - List all questions (admin)
- `POST /api/admin/questions` - Create question (admin)
- `PUT /api/admin/questions/:id` - Update question (admin)
- `DELETE /api/admin/questions/:id` - Soft delete question (admin)

**CORS**: Backend configured to allow `localhost:5173` origin

**Authentication**: Admin endpoints protected by HTTP Basic Auth (password from `ADMIN_PASSWORD` env var)

---

## Testing Strategy

### Backend Tests (Kotest)
- **Contract Tests**: Validate OpenAPI spec compliance
- **Unit Tests**: Test service logic in isolation
- **Integration Tests**: Test with real MongoDB (testcontainers)

### Frontend Tests (Vitest + React Testing Library)
- **Component Tests**: Render and interaction tests
- **Hook Tests**: React Query hook behavior
- **Integration Tests**: Full user flow with MSW (Mock Service Worker)

---

## Sub-Agent Guidance

### For Kotlin-Focused Agents

**When working on backend tasks**:
1. Always use suspend functions for database operations
2. Validate request bodies before processing (return 400 for invalid data)
3. Use KMongo's `getCollection<T>()` with reified types for type safety
4. Handle ObjectId serialization properly (use @BsonId annotation)
5. Write contract tests that match OpenAPI spec exactly

**Key Dependencies** (build.gradle.kts):
```kotlin
implementation("io.ktor:ktor-server-core:2.3.+")
implementation("io.ktor:ktor-server-netty:2.3.+")
implementation("org.litote.kmongo:kmongo-coroutine:4.11.+")
testImplementation("io.kotest:kotest-runner-junit5:5.8.+")
```

**Common Patterns**:
- Route definition: `routing { get("/api/path") { ... } }`
- JSON serialization: Ktor's ContentNegotiation with kotlinx.serialization
- Error responses: `call.respond(HttpStatusCode.BadRequest, mapOf("error" to "message"))`

### For React-Focused Agents

**When working on frontend tasks**:
1. Use React Query for ALL server state (no useState for API data)
2. Define TypeScript interfaces for all props and API responses
3. Use Tailwind utility classes (avoid inline styles)
4. Extract reusable components (CategoryScreen should work for all 6 categories)
5. Handle loading and error states in UI

**Key Dependencies** (package.json):
```json
{
  "@tanstack/react-query": "^5.0.0",
  "react-router-dom": "^6.20.0",
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0"
}
```

**Common Patterns**:
- API hooks: `useQuery(['questions'], fetchQuestions)`
- Form validation: React Hook Form + Zod resolver
- Navigation: `useNavigate()` from react-router-dom
- Responsive: `className="px-4 md:px-8 lg:px-12"` for mobile-first

---

## Implementation Notes

### Data Model Flexibility
- Responses stored as nested maps: `{categoryId: {questionId: {value, answeredAt}}}`
- This allows adding new questions without schema migrations
- Validate question IDs exist before saving responses

### Single-Session Requirement
- No localStorage persistence during questionnaire
- Only save to backend after profile creation (POST /api/profiles)
- Editing works because profile persists in backend

### Shareable Links
- Use UUID v4 for shareableId (not MongoDB ObjectId)
- Public access route: `/share/:shareableId` (no auth required)
- Unique index on shareableId in MongoDB

### Soft Delete Pattern (Admin Features)
- Questions and categories use `active` boolean field (default: true)
- Soft delete: Set `active = false` instead of removing documents
- Public API filters: `active = true` (only show active items)
- Admin API shows all items (including inactive)
- **Preserves user responses**: Inactive questions remain viewable in existing profiles
- **Cascade behavior**: Deleting category can soft-delete all its questions (optional)

### Admin Authentication
- Single shared password stored in `ADMIN_PASSWORD` environment variable
- Ktor Basic Auth plugin validates credentials
- Admin routes: `/admin/*` (React Router nested routes)
- Session stored in `sessionStorage` (expires on tab close)

---

## Recent Changes
- **2025-10-07**: Backoffice admin interface (002-create-a-backoffice)
  - Added Question and Category entities with soft delete
  - Implemented admin authentication (Ktor Basic Auth + env var password)
  - Created admin CRUD endpoints for questions and categories
  - Added drag-and-drop reordering (@dnd-kit library)
  - Defined admin routes (`/admin/*`) with protected layout
- **2025-10-06**: Initial setup for 001-how-to-work feature
  - Chose Ktor for Kotlin backend
  - Chose Vite + React Query for frontend
  - Defined flexible MongoDB schema
  - Created OpenAPI contract

---

## References

### Feature 001: How to Work With Me
- **Feature Spec**: `specs/001-how-to-work/spec.md`
- **Implementation Plan**: `specs/001-how-to-work/plan.md`
- **Technical Research**: `specs/001-how-to-work/research.md`
- **Data Model**: `specs/001-how-to-work/data-model.md`
- **API Contract**: `specs/001-how-to-work/contracts/api-spec.yaml`
- **Quickstart Guide**: `specs/001-how-to-work/quickstart.md`

### Feature 002: Backoffice Question Configuration
- **Feature Spec**: `specs/002-create-a-backoffice/spec.md`
- **Implementation Plan**: `specs/002-create-a-backoffice/plan.md`
- **Technical Research**: `specs/002-create-a-backoffice/research.md`
- **Data Model**: `specs/002-create-a-backoffice/data-model.md`
- **Admin API Contract**: `specs/002-create-a-backoffice/contracts/admin-api-spec.yaml`
- **Quickstart Guide**: `specs/002-create-a-backoffice/quickstart.md`

<!-- MANUAL ADDITIONS START -->
<!-- Add project-specific conventions, known issues, or deployment notes here -->
<!-- MANUAL ADDITIONS END -->

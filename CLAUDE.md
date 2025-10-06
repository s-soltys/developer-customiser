# developer-customiser Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-06

## Active Technologies
- Kotlin (backend), TypeScript/React (frontend) + Backend: Kotlin framework (TBD - Spring Boot/Ktor), MongoDB driver; Frontend: React, Tailwind CSS, React Query, Chart library for radar charts (001-this-app-is)

## Project Structure
```
backend/
frontend/
tests/
```

## Commands
npm test [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] npm run lint

## Code Style
Kotlin (backend), TypeScript/React (frontend): Follow standard conventions

## Recent Changes
- 001-this-app-is: Added Kotlin (backend), TypeScript/React (frontend) + Backend: Kotlin framework (TBD - Spring Boot/Ktor), MongoDB driver; Frontend: React, Tailwind CSS, React Query, Chart library for radar charts

<!-- MANUAL ADDITIONS START -->

## Kotlin Backend Setup (User is new to Kotlin ecosystem)

### First-Time Setup
- JDK 17+ required: Verify with `java -version`
- Gradle wrapper (`./gradlew`) handles Gradle installation automatically
- IntelliJ IDEA Community Edition recommended for best Kotlin support
- Build command: `./gradlew build` (compiles, downloads dependencies, runs tests)
- Run server: `./gradlew run`

### Key Kotlin + Ktor Patterns
- Use Ktor DSL for routing: `routing { get("/api/path") { ... } }`
- Coroutines are built-in: use `suspend fun` for async operations
- KMongo provides Kotlin-idiomatic MongoDB access
- kotlinx.serialization for JSON: annotate data classes with `@Serializable`

### MongoDB Setup
- Local: `brew install mongodb-community && brew services start mongodb-community`
- Docker: `docker run -d -p 27017:27017 mongo:7`
- Cloud: MongoDB Atlas free tier
- Connection config in `backend/src/main/resources/application.conf`

### Testing
- Use Kotest framework (Kotlin-first testing)
- Test styles: StringSpec, FunSpec (choose one for consistency)
- Ktor testing: Use Kotest Ktor plugin for HTTP endpoint tests
- MockK for mocking (not Mockito)

## React Frontend Conventions

### Project Structure
- Pages: High-level route components (`CreateProfile`, `FeedbackForm`, `ResultsDashboard`)
- Components: Reusable UI (`TraitRating`, `RadarChart`)
- Services: React Query hooks for API calls (`useCreateProfile`, `useSubmitFeedback`)

### State Management
- React Query for server state (all API calls)
- React Context for minor shared UI state (if needed)
- No Redux/Zustand required for this MVP

### Styling
- Tailwind CSS utility classes
- Component-specific classes via `@apply` in CSS modules if needed
- Responsive design: Use Tailwind breakpoints (`sm:`, `md:`, `lg:`)

### Chart Library
- Recharts for radar chart visualization
- Use `<ResponsiveContainer>` for responsive sizing
- Components: `<RadarChart>`, `<PolarGrid>`, `<PolarAngleAxis>`, `<Radar>`

## Development Workflow

### Backend Development
```bash
cd backend
./gradlew build          # Build and test
./gradlew run            # Start server (port 8080)
./gradlew test           # Run tests only
```

### Frontend Development
```bash
cd frontend
npm install              # First time only
npm run dev              # Start dev server (port 3000)
npm test                 # Run tests
npm run build            # Production build
```

### Monorepo Tips
- Backend and frontend can run simultaneously
- API base URL for frontend: `http://localhost:8080/api`
- Enable CORS in backend for local development

## API Design Patterns
- REST endpoints defined in `specs/001-this-app-is/contracts/api-spec.yaml`
- Error format: `{ "error": "message", "code": "ERROR_CODE" }`
- Success format: `{ "data": {...} }`
- All responses are JSON

## Data Model Guidelines
- MongoDB flexible schema: traits stored as key-value array
- See `specs/001-this-app-is/data-model.md` for entity definitions
- Profile document embeds responses (no separate collection for MVP)
- Trait config hardcoded but easily extensible

## Key Feature Requirements
- No authentication required (FR-001)
- Two unique links per profile: feedback link (public) + admin link (private)
- Colleagues can resubmit (overwrites previous response by respondentId)
- Manager sees both individual responses and aggregates
- Data never expires (FR-012)

## Testing Strategy
- Backend: Contract tests → Integration tests → Unit tests
- Frontend: Component tests (React Testing Library) → Integration tests (MSW)
- Follow TDD: Write tests first, then implement

## Performance Notes
- MVP - no specific performance targets
- Scalability not a concern for initial release
- Focus on correctness and developer experience

<!-- MANUAL ADDITIONS END -->
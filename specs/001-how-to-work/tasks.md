# Tasks: How to Work With Me App

**Feature**: 001-how-to-work
**Input**: Design documents from `/specs/001-how-to-work/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/api-spec.yaml, quickstart.md

---

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: Kotlin + Ktor backend, React + Vite frontend, MongoDB, monorepo structure
2. Load design documents:
   → data-model.md: Profile, Question entities
   → contracts/api-spec.yaml: 4 endpoints (questions, profiles CRUD)
   → quickstart.md: 6 user journey scenarios
3. Generate tasks by category:
   → Setup: Monorepo, backend, frontend, MongoDB
   → Tests: Contract tests (5), integration tests (6)
   → Core: Models (2), services (2), endpoints (4), UI components (7)
   → Integration: DB connections, CORS, routing
   → Polish: E2E tests, responsive validation
4. Apply task rules:
   → Contract tests [P], model tasks [P], UI components [P]
   → Endpoint implementations sequential (shared routing file)
5. Number tasks sequentially (T001-T038)
6. Validate: All contracts tested, all entities modeled, TDD ordering
```

---

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- File paths are absolute from repository root

---

## Phase 3.1: Project Setup (T001-T008)

### Environment Initialization
- [x] **T001** - Create monorepo directory structure
  - Create `backend/`, `frontend/`, `shared/contracts/`, `docker-compose.yml` at repo root
  - Copy OpenAPI spec from `specs/001-how-to-work/contracts/api-spec.yaml` to `shared/contracts/api-spec.yaml`

- [x] **T002** - Configure Docker Compose for MongoDB
  - Create `docker-compose.yml` with MongoDB 7 service on port 27017
  - Configure volume mount for data persistence
  - Set database name to `howtoworkwithme`
  - Test: `docker compose up -d && docker compose ps` shows running MongoDB
  - Note: User needs to run `docker compose up -d` manually after installing Docker

### Backend Setup (Kotlin + Ktor)
- [x] **T003** - Initialize Kotlin backend project with Gradle
  - Create `backend/build.gradle.kts` with Kotlin 1.9+ and Ktor 2.3+ dependencies
  - Add KMongo 4.11+ for MongoDB
  - Add Kotest 5.8+ for testing
  - Add kotlinx.serialization for JSON
  - Configure Gradle wrapper: `backend/gradlew`
  - Set source directories: `backend/src/main/kotlin/`, `backend/src/test/kotlin/`
  - Note: User needs to run `gradle wrapper` to generate gradlew after installing Gradle
  - See backend/README.md for setup instructions

- [x] **T004** - Configure Ktor application
  - Create `backend/src/main/kotlin/Application.kt` with basic Ktor server
  - Install ContentNegotiation plugin with kotlinx.serialization JSON
  - Install CORS plugin allowing `http://localhost:5173` origin
  - Configure server to run on port 8080
  - Add MongoDB connection string: `mongodb://localhost:27017/howtoworkwithme`
  - Test: `./gradlew run` starts server without errors (after Gradle wrapper setup)

### Frontend Setup (React + Vite)
- [x] **T005** - Initialize React frontend with Vite and TypeScript
  - Created `frontend/package.json` with all dependencies
  - Install dependencies: React 18+, React Router DOM 6+, TanStack Query 5+
  - Install Tailwind CSS 3+ and configure `tailwind.config.js`
  - Install React Hook Form 7+ and Zod 3+ for forms
  - Configure Vite proxy to backend: `http://localhost:8080` for `/api/*`
  - Note: User needs to run `npm install` after installing Node.js
  - See frontend/README.md for setup instructions

- [x] **T006** [P] - Configure Tailwind CSS
  - Create `frontend/tailwind.config.js` with content paths for `src/**/*.{ts,tsx}`
  - Import Tailwind directives in `frontend/src/index.css`
  - Configure responsive breakpoints (sm: 640px, md: 768px, lg: 1024px)
  - Tailwind classes visible in App.tsx placeholder components

- [x] **T007** [P] - Set up React Query provider
  - Create `frontend/src/providers/QueryProvider.tsx` with QueryClient
  - Configure default options: staleTime 5 minutes, retry 1
  - Wrap App with QueryClientProvider in `frontend/src/main.tsx`
  - Add React Query DevTools for development

- [x] **T008** [P] - Configure React Router
  - Create router configuration in `frontend/src/App.tsx`
  - Define routes: `/` (NameEntry), `/questionnaire` (Questionnaire), `/share/:shareableId` (ProfileView)
  - Use `createBrowserRouter` and `RouterProvider`
  - Placeholder components created for all routes

---

## Phase 3.2: Backend Models & Tests (T009-T015) ⚠️ TDD: TESTS BEFORE IMPLEMENTATION

### Data Models
- [ ] **T009** [P] - Create Question data model
  - File: `backend/src/main/kotlin/models/Question.kt`
  - Define `Question` data class with: id (ObjectId), categoryId, questionId, text, type (enum), choices (nullable), placeholder (nullable), order
  - Define `QuestionType` enum: TEXT, CHOICE, MULTICHOICE
  - Define `Category` enum with 6 values: COMMUNICATION, WORK_STYLE, FEEDBACK, STRENGTHS, PET_PEEVES, PERSONAL
  - Add `@Serializable` annotation for JSON
  - Test: Compiles without errors

- [ ] **T010** [P] - Create Profile data model
  - File: `backend/src/main/kotlin/models/Profile.kt`
  - Define `Profile` data class with: id (ObjectId), name, shareableId, createdAt (Instant), updatedAt (Instant), responses (Map<String, Map<String, Response>>)
  - Define `Response` data class with: value (ResponseValue), answeredAt (Instant)
  - Define `ResponseValue` sealed class with: Text(text: String), Choice(selected: String), MultiChoice(selected: List<String>)
  - Add `@Serializable` annotations
  - Test: Compiles without errors

### Contract Tests (MUST FAIL before implementation)
- [ ] **T011** [P] - Contract test GET /api/questions
  - File: `backend/src/test/kotlin/contract/GetQuestionsTest.kt`
  - Use Kotest + Ktor test client
  - Test: GET request returns 200 with array of Question objects
  - Validate: Response matches OpenAPI schema (18+ questions expected)
  - **Expected**: Test FAILS (endpoint not implemented yet)

- [ ] **T012** [P] - Contract test POST /api/profiles
  - File: `backend/src/test/kotlin/contract/CreateProfileTest.kt`
  - Test: POST with valid name returns 201 with Profile object
  - Test: POST with empty name returns 400 error
  - Validate: Response includes unique shareableId (UUID format)
  - **Expected**: Test FAILS (endpoint not implemented yet)

- [ ] **T013** [P] - Contract test PUT /api/profiles/:id
  - File: `backend/src/test/kotlin/contract/UpdateProfileTest.kt`
  - Test: PUT with valid responses returns 200 with updated Profile
  - Test: PUT with invalid question ID returns 400 error
  - Test: PUT with wrong response type returns 400 error
  - Validate: updatedAt timestamp changes
  - **Expected**: Test FAILS (endpoint not implemented yet)

- [ ] **T014** [P] - Contract test GET /api/profiles/:id
  - File: `backend/src/test/kotlin/contract/GetProfileByIdTest.kt`
  - Test: GET with valid ID returns 200 with Profile
  - Test: GET with invalid ID returns 404 error
  - **Expected**: Test FAILS (endpoint not implemented yet)

- [ ] **T015** [P] - Contract test GET /api/profiles/share/:shareableId
  - File: `backend/src/test/kotlin/contract/GetProfileByShareableIdTest.kt`
  - Test: GET with valid shareableId returns 200 with Profile
  - Test: GET with invalid shareableId returns 404 error
  - **Expected**: Test FAILS (endpoint not implemented yet)

---

## Phase 3.3: Backend Implementation (T016-T023) - ONLY AFTER TESTS FAIL

### Database & Services
- [ ] **T016** - Seed question templates into MongoDB
  - File: `backend/src/main/kotlin/services/QuestionSeeder.kt`
  - Create function to seed 18 questions (3 per category)
  - Communication: preferred-channel (CHOICE), response-time (TEXT), meeting-preferences (TEXT)
  - Work Style: focus-hours (TEXT), collaboration (TEXT), timezone (TEXT)
  - Feedback: delivery-style (CHOICE), frequency (TEXT)
  - Strengths: strengths (TEXT), growth-areas (TEXT)
  - Pet Peeves: pet-peeves (TEXT), energizers (TEXT)
  - Personal: hobbies (TEXT), fun-facts (TEXT)
  - Call seeder on application startup
  - Test: MongoDB contains 18 questions after startup

- [ ] **T017** [P] - Create ProfileService
  - File: `backend/src/main/kotlin/services/ProfileService.kt`
  - Implement `createProfile(name: String): Profile` - generates UUID shareableId, sets timestamps
  - Implement `getProfileById(id: ObjectId): Profile?`
  - Implement `getProfileByShareableId(shareableId: String): Profile?`
  - Implement `updateProfile(id: ObjectId, responses: Map<...>): Profile?` - updates responses and updatedAt
  - Add validation: name non-empty, question IDs exist, response types match
  - Use KMongo coroutines for async DB operations
  - Test: Unit tests for each method

- [ ] **T018** [P] - Create QuestionService
  - File: `backend/src/main/kotlin/services/QuestionService.kt`
  - Implement `getAllQuestions(): List<Question>` - sorted by categoryId and order
  - Implement `validateQuestionExists(categoryId: String, questionId: String): Boolean`
  - Use KMongo coroutines
  - Test: Unit tests for retrieval and validation

### API Endpoints
- [ ] **T019** - Implement GET /api/questions endpoint
  - File: `backend/src/main/kotlin/api/Routes.kt` (routing configuration)
  - Add route: `get("/api/questions") { ... }`
  - Call QuestionService.getAllQuestions()
  - Return JSON array with status 200
  - Test: Run contract test T011, verify it PASSES

- [ ] **T020** - Implement POST /api/profiles endpoint
  - File: `backend/src/main/kotlin/api/Routes.kt`
  - Add route: `post("/api/profiles") { ... }`
  - Parse request body: `{ name: String }`
  - Validate name non-empty (400 if invalid)
  - Call ProfileService.createProfile(name)
  - Return created Profile with status 201
  - Test: Run contract test T012, verify it PASSES

- [ ] **T021** - Implement GET /api/profiles/:id endpoint
  - File: `backend/src/main/kotlin/api/Routes.kt`
  - Add route: `get("/api/profiles/{id}") { ... }`
  - Parse ObjectId from path parameter
  - Call ProfileService.getProfileById(id)
  - Return 404 if not found, 200 with Profile if found
  - Test: Run contract test T014, verify it PASSES

- [ ] **T022** - Implement PUT /api/profiles/:id endpoint
  - File: `backend/src/main/kotlin/api/Routes.kt`
  - Add route: `put("/api/profiles/{id}") { ... }`
  - Parse ObjectId and request body (responses map)
  - Validate all question IDs exist (400 if invalid)
  - Validate response values match question types (400 if mismatch)
  - Call ProfileService.updateProfile(id, responses)
  - Return 404 if profile not found, 200 with updated Profile if success
  - Test: Run contract test T013, verify it PASSES

- [ ] **T023** - Implement GET /api/profiles/share/:shareableId endpoint
  - File: `backend/src/main/kotlin/api/Routes.kt`
  - Add route: `get("/api/profiles/share/{shareableId}") { ... }`
  - Parse shareableId from path parameter
  - Call ProfileService.getProfileByShareableId(shareableId)
  - Return 404 if not found, 200 with Profile if found
  - Test: Run contract test T015, verify it PASSES

---

## Phase 3.4: Frontend Foundation (T024-T030)

### Type Definitions & API Client
- [ ] **T024** [P] - Create TypeScript types from OpenAPI spec
  - File: `frontend/src/types/api.ts`
  - Define `QuestionType`, `Question`, `Profile`, `Response`, `CreateProfileRequest`, `UpdateProfileRequest` interfaces
  - Match OpenAPI schema exactly
  - Export all types
  - Test: TypeScript compiles without errors

- [ ] **T025** [P] - Create API service layer with React Query hooks
  - File: `frontend/src/services/api.ts`
  - Create `useGetQuestions()` hook using `useQuery`
  - Create `useCreateProfile()` hook using `useMutation`
  - Create `useGetProfileById(id)` hook using `useQuery`
  - Create `useUpdateProfile(id)` hook using `useMutation`
  - Create `useGetProfileByShareableId(shareableId)` hook using `useQuery`
  - Base URL: `http://localhost:8080`
  - Test: TypeScript compiles, hooks can be imported

### Reusable Components
- [ ] **T026** [P] - Create ProgressIndicator component
  - File: `frontend/src/components/ProgressIndicator.tsx`
  - Props: `currentStep: number, totalSteps: number`
  - Display: "Step X of Y" with progress bar (Tailwind)
  - Responsive: Stack on mobile, inline on desktop
  - Test: Renders "Step 1 of 6" correctly

- [ ] **T027** [P] - Create QuestionInput component
  - File: `frontend/src/components/QuestionInput.tsx`
  - Props: `question: Question, value: string | string[], onChange: (value) => void`
  - Render TEXT → textarea, CHOICE → radio buttons, MULTICHOICE → checkboxes
  - Use Tailwind styling
  - Integrate React Hook Form
  - Test: All 3 input types render correctly

- [ ] **T028** [P] - Create CategoryScreen component
  - File: `frontend/src/components/CategoryScreen.tsx`
  - Props: `categoryId: string, questions: Question[], onNext: () => void, onBack: () => void`
  - Display category name as heading
  - Render QuestionInput for each question
  - Show "Next" button (disabled until all answered)
  - Show "Back" button if not first category
  - Use React Hook Form for validation
  - Test: Renders 3 questions, validates completion

- [ ] **T029** [P] - Create SummaryCard component
  - File: `frontend/src/components/SummaryCard.tsx`
  - Props: `profile: Profile`
  - Display name prominently
  - Show all 6 categories with responses in organized layout
  - Include "Edit Profile" button
  - Include "Generate Shareable Link" button (copies to clipboard)
  - Responsive card layout (Tailwind)
  - Test: Displays profile data correctly

- [ ] **T030** [P] - Create ProfileViewCard component
  - File: `frontend/src/components/ProfileViewCard.tsx`
  - Props: `profile: Profile`
  - Similar to SummaryCard but read-only (no edit button)
  - Optimized for public sharing view
  - Test: Renders profile without edit controls

---

## Phase 3.5: Frontend Pages & Navigation (T031-T034)

- [ ] **T031** - Create NameEntry page
  - File: `frontend/src/pages/NameEntry.tsx`
  - Form with single text input for name
  - Validate name is non-empty
  - On submit: call `useCreateProfile()` mutation
  - On success: store profile ID in React state, navigate to `/questionnaire`
  - Error handling: display error message
  - Responsive layout (centered card)
  - Test: Manual - enter name, navigates to questionnaire

- [ ] **T032** - Create Questionnaire page with state management
  - File: `frontend/src/pages/Questionnaire.tsx`
  - Load questions with `useGetQuestions()`
  - Manage current category index in state (0-5)
  - Store in-memory responses (Map structure matching API)
  - Render ProgressIndicator (current category + 1 of 6)
  - Render CategoryScreen for current category
  - Handle Next: increment category index, store responses
  - Handle Back: decrement category index
  - On completion (all 6 categories): call `useUpdateProfile()`, navigate to summary
  - Test: Manual - complete 2 categories, click back, verify responses persist

- [ ] **T033** - Create Summary page with shareable link generation
  - File: `frontend/src/pages/Summary.tsx`
  - Get profile ID from navigation state
  - Load profile with `useGetProfileById(id)`
  - Render SummaryCard component
  - "Generate Shareable Link" button creates `${window.location.origin}/share/${profile.shareableId}`
  - Copy to clipboard using Clipboard API
  - Show toast notification "Link copied!"
  - "Edit Profile" button navigates back to `/questionnaire` with existing responses
  - Test: Manual - click generate link, verify clipboard contains correct URL

- [ ] **T034** - Create ProfileView page for shared profiles
  - File: `frontend/src/pages/ProfileView.tsx`
  - Extract shareableId from route params
  - Load profile with `useGetProfileByShareableId(shareableId)`
  - Render ProfileViewCard component
  - Handle 404: show "Profile not found" message
  - Loading state: spinner
  - Test: Manual - open shareable link in incognito, verify profile loads

---

## Phase 3.6: Integration Tests (T035-T038)

- [ ] **T035** [P] - Integration test: Complete user journey (Scenarios 1-3)
  - File: `frontend/tests/integration/UserJourney.test.tsx`
  - Use Vitest + React Testing Library + MSW (Mock Service Worker)
  - Mock all API endpoints
  - Test flow: Enter name → Answer 6 categories → View summary → Generate link
  - Assert: All 6 categories rendered, responses saved, shareable link generated
  - **Expected**: Test PASSES (all components implemented)

- [ ] **T036** [P] - Integration test: Profile editing (Scenario 5)
  - File: `frontend/tests/integration/ProfileEditing.test.tsx`
  - Test flow: Complete profile → Click "Edit" → Modify responses → Finish → Verify changes
  - Assert: Modified responses appear in summary
  - **Expected**: Test PASSES

- [ ] **T037** [P] - Integration test: Session abandonment (Scenario 6)
  - File: `frontend/tests/integration/SessionPersistence.test.tsx`
  - Test flow: Start questionnaire → Complete 2 categories → Unmount component → Remount
  - Assert: Progress lost, back at NameEntry screen
  - Verify: No localStorage or sessionStorage used
  - **Expected**: Test PASSES (no persistence implemented)

- [ ] **T038** - Responsive design validation (Scenario 4 - quickstart.md)
  - Manual test using browser DevTools
  - Test viewports: 375px (mobile), 768px (tablet), 1024px (desktop)
  - Verify: All pages usable on mobile, no horizontal scroll, readable text
  - Checklist from quickstart.md:
    - [ ] NameEntry responsive
    - [ ] CategoryScreen stacks on mobile
    - [ ] SummaryCard readable on mobile
    - [ ] ProfileView card responsive
  - **Expected**: All layouts work on mobile

---

## Dependencies

### Critical Path
```
T001-T008 (Setup)
  ↓
T009-T010 (Models) [Parallel]
  ↓
T011-T015 (Contract Tests - MUST FAIL) [Parallel]
  ↓
T016-T018 (Services) [T017-T018 parallel]
  ↓
T019-T023 (Endpoints - Sequential, same file)
  ↓
T024-T030 (Frontend components) [Parallel]
  ↓
T031-T034 (Pages - Sequential, order matters)
  ↓
T035-T037 (Integration tests) [Parallel]
  ↓
T038 (Manual validation)
```

### Detailed Blocking
- **T016** (seeder) blocks T019 (questions endpoint needs seeded data)
- **T017** (ProfileService) blocks T020-T023 (all profile endpoints)
- **T018** (QuestionService) blocks T019, T022 (validation logic)
- **T019-T023** sequential (all modify same `Routes.kt` file)
- **T024** (types) blocks T025 (API hooks need types)
- **T025** (API hooks) blocks T031-T034 (pages use hooks)
- **T026-T030** (components) block T031-T034 (pages use components)
- **T031-T034** (pages) block T035-T037 (integration tests)

### Parallel Opportunities
- **T003-T008**: Can run T006-T008 in parallel after T005 completes
- **T009-T010**: Models can be created in parallel
- **T011-T015**: All contract tests can run in parallel
- **T017-T018**: Services can be created in parallel
- **T024-T030**: Types, hooks, and all components can run in parallel
- **T035-T037**: All integration tests can run in parallel

---

## Parallel Execution Examples

### Example 1: Contract Tests (After T009-T010 complete)
```bash
# Launch all 5 contract tests simultaneously:
# They all create different test files and have no dependencies
./gradlew test --tests GetQuestionsTest &
./gradlew test --tests CreateProfileTest &
./gradlew test --tests UpdateProfileTest &
./gradlew test --tests GetProfileByIdTest &
./gradlew test --tests GetProfileByShareableIdTest &
wait
# All tests should FAIL (endpoints not implemented)
```

### Example 2: Frontend Components (After T025 complete)
```bash
# Create all UI components in parallel:
# Each component is in a separate file
Task: "Create ProgressIndicator component in frontend/src/components/ProgressIndicator.tsx"
Task: "Create QuestionInput component in frontend/src/components/QuestionInput.tsx"
Task: "Create CategoryScreen component in frontend/src/components/CategoryScreen.tsx"
Task: "Create SummaryCard component in frontend/src/components/SummaryCard.tsx"
Task: "Create ProfileViewCard component in frontend/src/components/ProfileViewCard.tsx"
# Wait for all to complete before T031
```

### Example 3: Integration Tests (After T034 complete)
```bash
# Run all integration tests in parallel:
npm run test -- UserJourney.test.tsx &
npm run test -- ProfileEditing.test.tsx &
npm run test -- SessionPersistence.test.tsx &
wait
# All should PASS
```

---

## Validation Checklist
*GATE: Verify completeness before marking tasks done*

### Coverage
- [x] All 4 API endpoints have contract tests (T011-T015)
- [x] Both entities (Profile, Question) have model tasks (T009-T010)
- [x] All contract tests come before implementation (T011-T015 → T019-T023)
- [x] All 6 user journey scenarios covered in integration tests (T035-T037) + manual (T038)
- [x] TDD ordering enforced (tests must fail before implementation)

### Parallelism
- [x] Contract tests (T011-T015) marked [P] ✓
- [x] Models (T009-T010) marked [P] ✓
- [x] Services (T017-T018) marked [P] ✓
- [x] Components (T024-T030) marked [P] ✓
- [x] Integration tests (T035-T037) marked [P] ✓
- [x] API endpoints (T019-T023) NOT marked [P] (same Routes.kt file) ✓

### Specificity
- [x] Every task specifies exact file path ✓
- [x] Backend files use `backend/src/main/kotlin/` or `backend/src/test/kotlin/` ✓
- [x] Frontend files use `frontend/src/` ✓
- [x] No vague tasks like "implement backend" ✓

---

## Notes

### TDD Discipline
- **CRITICAL**: T011-T015 (contract tests) MUST be written and MUST FAIL before starting T019-T023 (implementations)
- Verify test failure before proceeding to implementation
- Re-run tests after each endpoint to verify they PASS

### Commit Strategy
- Commit after each phase completes
- Tag commits: `setup-complete`, `backend-complete`, `frontend-complete`, `tests-passing`

### Common Pitfalls
- ❌ Don't implement endpoints before tests exist
- ❌ Don't mark [P] on tasks modifying same file (Routes.kt, App.tsx)
- ❌ Don't skip test failures - they prove tests are correctly written
- ❌ Don't add localStorage persistence (violates single-session requirement)

### Success Criteria
When all tasks complete:
1. All contract tests PASS
2. All integration tests PASS
3. Manual quickstart.md validation succeeds
4. Can complete full user journey: name → 6 categories → summary → shareable link
5. Shared link works in incognito browser
6. Responsive on mobile viewport (375px width)

---

## Quick Reference

**Total Tasks**: 38
**Estimated Time**: 16-20 hours for experienced developer
**Parallel Tasks**: 18 (marked [P])
**Sequential Tasks**: 20

**Key Files Created**:
- Backend: 15 files (models, services, routes, tests)
- Frontend: 13 files (types, hooks, components, pages, tests)
- Config: 3 files (docker-compose, build files, Tailwind)

**Next Command**: Start with T001, follow dependency order, run parallel tasks together when possible.

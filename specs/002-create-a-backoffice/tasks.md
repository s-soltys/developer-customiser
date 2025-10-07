# Tasks: Backoffice Question Configuration

**Input**: Design documents from `/specs/002-create-a-backoffice/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/admin-api-spec.yaml, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✅ Loaded - Web app (Kotlin backend + React frontend)
   → ✅ Tech stack: Ktor 2.3.7, KMongo 4.11, React 18.2, React Query 5.14
2. Load optional design documents:
   → ✅ data-model.md: Category, Question entities with soft delete
   → ✅ contracts/: admin-api-spec.yaml with 8 endpoints
   → ✅ research.md: Ktor auth, @dnd-kit, soft delete patterns
   → ✅ quickstart.md: 11 test scenarios
3. Generate tasks by category:
   → Setup: Ktor auth plugin, frontend dependencies (@dnd-kit)
   → Tests: 8 contract tests (one per endpoint), 5 integration tests
   → Core: 2 models, 2 services, admin routes, admin UI components
   → Integration: MongoDB indexes, auth middleware, route guards
   → Polish: seed script, quickstart validation
4. Apply task rules:
   → Contract tests: All [P] (different files)
   → Model creation: [P] (backend/src/main/kotlin/models/)
   → Services: [P] (different files)
   → Admin routes: Sequential (same AdminRoutes.kt file)
   → Frontend components: [P] (different files)
5. Number tasks sequentially (T001-T042)
6. Dependencies: Tests → Models → Services → Routes → UI
7. Parallel execution examples provided
8. Validation:
   → ✅ All 8 endpoints have contract tests
   → ✅ All 2 entities have model tasks
   → ✅ All tests before implementation
   → ✅ Parallel tasks independent
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Backend**: `backend/src/main/kotlin/`, `backend/src/test/kotlin/`
- **Frontend**: `frontend/src/`, `frontend/tests/`
- **Shared**: `shared/contracts/`

---

## Phase 3.1: Setup & Dependencies

### T001: Install Backend Dependencies ✅ [X]
**File**: `backend/build.gradle.kts`

Add Ktor authentication plugin:
```kotlin
implementation("io.ktor:ktor-server-auth:2.3.7")
```

**Acceptance**: Build succeeds with new dependency

---

### T002 [P]: Install Frontend Dependencies ✅ [X]
**File**: `frontend/package.json`

Add drag-and-drop library:
```bash
npm install @dnd-kit/core@^6.0.8 @dnd-kit/sortable@^8.0.0
```

**Acceptance**: Package installed, no peer dependency warnings

**Can run in parallel with**: T001 (different project)

---

### T003 [P]: Create Database Seed Script ✅ [X]
**File**: `backend/src/main/kotlin/SeedDatabase.kt`

Create seed script for initial 6 categories:
- Communication (order: 0)
- Work Style (order: 1)
- Collaboration (order: 2)
- Feedback (order: 3)
- Boundaries (order: 4)
- Problem Solving (order: 5)

**Acceptance**: Script runnable via `./gradlew seed`, categories inserted into MongoDB

**Can run in parallel with**: T001, T002 (independent)

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Backend Contract Tests

#### T004 [P]: Contract Test - POST /api/admin/auth
**File**: `backend/src/test/kotlin/contract/AdminAuthTest.kt`

Test authentication endpoint:
- Valid password → 200 OK
- Invalid password → 401 Unauthorized
- Missing password field → 400 Bad Request

Validate against `contracts/admin-api-spec.yaml` schema

**Acceptance**: Test fails (endpoint not implemented yet)

---

#### T005 [P]: Contract Test - GET /api/admin/categories
**File**: `backend/src/test/kotlin/contract/AdminCategoriesGetTest.kt`

Test list categories endpoint:
- With valid auth → 200 OK, returns array of Category objects
- Without auth → 401 Unauthorized

Validate response schema matches OpenAPI spec

**Acceptance**: Test fails (endpoint not implemented yet)

**Can run in parallel with**: T004, T006-T011 (different files)

---

#### T006 [P]: Contract Test - POST /api/admin/categories
**File**: `backend/src/test/kotlin/contract/AdminCategoriesPostTest.kt`

Test create category endpoint:
- Valid request → 201 Created
- Empty name → 400 Bad Request
- Duplicate name → 409 Conflict
- Without auth → 401 Unauthorized

**Acceptance**: Test fails (endpoint not implemented yet)

**Can run in parallel with**: T004, T005, T007-T011 (different files)

---

#### T007 [P]: Contract Test - PUT /api/admin/categories/{id}
**File**: `backend/src/test/kotlin/contract/AdminCategoriesUpdateTest.kt`

Test update category endpoint:
- Valid update → 200 OK
- Invalid ID → 404 Not Found
- Empty name → 400 Bad Request

**Acceptance**: Test fails (endpoint not implemented yet)

**Can run in parallel with**: T004-T006, T008-T011 (different files)

---

#### T008 [P]: Contract Test - DELETE /api/admin/categories/{id}
**File**: `backend/src/test/kotlin/contract/AdminCategoriesDeleteTest.kt`

Test soft delete category endpoint:
- Delete empty category → 204 No Content
- Delete category with active questions → 409 Conflict
- Delete with cascade=true → 204 No Content
- Invalid ID → 404 Not Found

**Acceptance**: Test fails (endpoint not implemented yet)

**Can run in parallel with**: T004-T007, T009-T011 (different files)

---

#### T009 [P]: Contract Test - GET /api/admin/questions
**File**: `backend/src/test/kotlin/contract/AdminQuestionsGetTest.kt`

Test list questions endpoint:
- Get all questions → 200 OK
- Filter by categoryId → 200 OK, filtered results
- Without auth → 401 Unauthorized

**Acceptance**: Test fails (endpoint not implemented yet)

**Can run in parallel with**: T004-T008, T010, T011 (different files)

---

#### T010 [P]: Contract Test - POST /api/admin/questions
**File**: `backend/src/test/kotlin/contract/AdminQuestionsPostTest.kt`

Test create question endpoint:
- Valid request → 201 Created
- Empty text → 400 Bad Request
- Invalid categoryId → 400 Bad Request

**Acceptance**: Test fails (endpoint not implemented yet)

**Can run in parallel with**: T004-T009, T011 (different files)

---

#### T011 [P]: Contract Test - PUT & DELETE /api/admin/questions/{id}
**File**: `backend/src/test/kotlin/contract/AdminQuestionsUpdateDeleteTest.kt`

Test update and soft delete question endpoints:
- PUT: Valid update → 200 OK
- PUT: Invalid ID → 404 Not Found
- DELETE: Soft delete → 204 No Content
- DELETE: Invalid ID → 404 Not Found

**Acceptance**: Tests fail (endpoints not implemented yet)

**Can run in parallel with**: T004-T010 (different files)

---

### Integration Tests

#### T012 [P]: Integration Test - Category CRUD Flow
**File**: `backend/src/test/kotlin/integration/CategoryFlowTest.kt`

Test full category lifecycle:
1. Create category
2. List categories (verify present)
3. Update category name
4. Create question in category
5. Attempt delete (should fail with 409)
6. Delete with cascade
7. Verify soft delete (active=false)

**Acceptance**: Test fails (services not implemented yet)

**Can run in parallel with**: T004-T011, T013-T015 (different files)

---

#### T013 [P]: Integration Test - Question CRUD Flow
**File**: `backend/src/test/kotlin/integration/QuestionFlowTest.kt`

Test full question lifecycle:
1. Create question
2. List questions
3. Update question text
4. Reorder question (change order field)
5. Soft delete question
6. Verify inactive question excluded from public API

**Acceptance**: Test fails (services not implemented yet)

**Can run in parallel with**: T004-T012, T014, T015 (different files)

---

#### T014 [P]: Integration Test - Authentication Flow
**File**: `backend/src/test/kotlin/integration/AdminAuthFlowTest.kt`

Test authentication:
1. Call admin endpoint without auth → 401
2. Authenticate with wrong password → 401
3. Authenticate with correct password → 200
4. Call admin endpoint with auth → 200

**Acceptance**: Test fails (auth middleware not implemented yet)

**Can run in parallel with**: T004-T013, T015 (different files)

---

#### T015 [P]: Integration Test - Soft Delete Preservation
**File**: `backend/src/test/kotlin/integration/SoftDeleteFlowTest.kt`

Test soft delete preserves user responses:
1. Create category and question
2. Create profile with response to question
3. Soft delete question
4. Verify question.active = false
5. Verify profile response still exists
6. Verify public API excludes question
7. Verify admin API includes inactive question

**Acceptance**: Test fails (soft delete logic not implemented yet)

**Can run in parallel with**: T004-T014 (different files)

---

### Frontend Component Tests

#### T016 [P]: Component Test - AdminAuth
**File**: `frontend/tests/components/admin/AdminAuth.test.tsx`

Test admin authentication component:
- Renders password input
- Submit button disabled when empty
- Calls onLogin with password
- Shows error on invalid password

Use MSW to mock `/api/admin/auth` endpoint

**Acceptance**: Test fails (component not created yet)

**Can run in parallel with**: T004-T015, T017-T020 (different files)

---

#### T017 [P]: Component Test - CategoryList
**File**: `frontend/tests/components/admin/CategoryList.test.tsx`

Test category list component:
- Renders list of categories
- Shows inactive badge for soft-deleted categories
- Click edit opens CategoryForm
- Click delete shows confirmation modal

**Acceptance**: Test fails (component not created yet)

**Can run in parallel with**: T004-T016, T018-T020 (different files)

---

#### T018 [P]: Component Test - QuestionList with Drag-and-Drop
**File**: `frontend/tests/components/admin/QuestionList.test.tsx`

Test question list with reordering:
- Renders questions grouped by category
- Drag handle visible on each question
- Simulates drag-and-drop reorder
- Verifies optimistic update

**Acceptance**: Test fails (component not created yet)

**Can run in parallel with**: T004-T017, T019, T020 (different files)

---

#### T019 [P]: Integration Test - Admin Dashboard Flow (Frontend)
**File**: `frontend/tests/integration/AdminDashboard.test.tsx`

Test full admin flow:
1. Navigate to /admin
2. Authenticate
3. Create category
4. Create question in category
5. Reorder questions
6. Soft delete question
7. Verify question hidden from public questionnaire

Use MSW to mock all admin API endpoints

**Acceptance**: Test fails (admin pages not created yet)

**Can run in parallel with**: T004-T018, T020 (different files)

---

#### T020 [P]: Hook Test - useAdminAuth
**File**: `frontend/tests/hooks/admin/useAdminAuth.test.ts`

Test admin authentication hook:
- isAuthenticated starts false
- login() saves token to sessionStorage
- isAuthenticated becomes true
- logout() clears token
- Token persists across hook remounts

**Acceptance**: Test fails (hook not created yet)

**Can run in parallel with**: T004-T019 (different files)

---

## Phase 3.3: Core Implementation (ONLY after tests are failing)

**Prerequisites**: All tests T004-T020 written and failing

### Backend Models

#### T021 [P]: Create Category Model [X]
**File**: `backend/src/main/kotlin/models/Category.kt`

Implement Category data class per `data-model.md`:
- Fields: id (ObjectId), name (String), order (Int), active (Boolean), createdAt, updatedAt
- @Serializable annotation
- @BsonId for ObjectId
- Default values: active=true, timestamps=now()

**Acceptance**: Model compiles, can be serialized to JSON

**Dependencies**: None (can run after T004-T020)

---

#### T022 [P]: Create Question Model [X]
**File**: `backend/src/main/kotlin/models/Question.kt`

Implement Question data class per `data-model.md`:
- Fields: id, text, categoryId (ObjectId reference), order, active, createdAt, updatedAt
- @Serializable annotation
- Validation: text max 500 chars

**Acceptance**: Model compiles, can be serialized to JSON

**Can run in parallel with**: T021 (different files)

**Dependencies**: None (can run after T004-T020)

---

### Backend Services

#### T023 [P]: Implement CategoryService [X]
**File**: `backend/src/main/kotlin/services/CategoryService.kt`

Implement CRUD operations:
- `createCategory(name: String, order: Int): Category`
- `getAllCategories(): List<Category>`
- `updateCategory(id: ObjectId, name: String?, order: Int?): Category?`
- `softDeleteCategory(id: ObjectId, cascade: Boolean = false): Boolean`

Business logic:
- Check for active questions before soft delete (throw ConflictException if exists and cascade=false)
- If cascade=true, soft delete all questions in category
- Validate name uniqueness (among active categories)

**Acceptance**: Service methods work with test MongoDB instance, T012 passes

**Dependencies**: T021, T022 (needs models)

---

#### T024 [P]: Implement QuestionService [X]
**File**: `backend/src/main/kotlin/services/QuestionService.kt`

Implement CRUD operations:
- `createQuestion(text: String, categoryId: ObjectId, order: Int): Question`
- `getAllQuestions(categoryId: ObjectId? = null): List<Question>`
- `updateQuestion(id: ObjectId, text: String?, categoryId: ObjectId?, order: Int?): Question?`
- `softDeleteQuestion(id: ObjectId): Boolean`

Business logic:
- Validate categoryId exists before creating question
- Validate text non-empty, max 500 chars
- Set active=false for soft delete

**Acceptance**: Service methods work with test MongoDB instance, T013 passes

**Can run in parallel with**: T023 (different files)

**Dependencies**: T021, T022 (needs models)

---

### Backend Authentication

#### T025: Implement Ktor Authentication Plugin [X]
**File**: `backend/src/main/kotlin/plugins/Authentication.kt`

Configure Ktor authentication:
- Install Authentication plugin
- Create "admin-auth" basic auth provider
- Validate credentials against `ADMIN_PASSWORD` environment variable
- Return UserIdPrincipal("admin") on success

**Acceptance**: Auth plugin configured, T014 passes

**Dependencies**: None (independent)

---

### Backend API Routes

**Note**: Admin routes all go in the same file, so must be sequential (not [P])

#### T026: Implement POST /api/admin/auth Endpoint [X]
**File**: `backend/src/main/kotlin/api/AdminRoutes.kt`

Create AdminRoutes.kt and implement authentication endpoint:
- POST /api/admin/auth (no auth required on this endpoint)
- Validate password against environment variable
- Return { authenticated: true } or 401

**Acceptance**: T004 contract test passes

**Dependencies**: T025 (needs auth plugin)

---

#### T027: Implement GET /api/admin/categories Endpoint [X]
**File**: `backend/src/main/kotlin/api/AdminRoutes.kt` (same file as T026)

Add authenticated route:
- GET /api/admin/categories (requires auth)
- Call CategoryService.getAllCategories()
- Return JSON array of categories

**Acceptance**: T005 contract test passes

**Dependencies**: T026 (same file), T023 (needs CategoryService)

---

#### T028: Implement POST /api/admin/categories Endpoint [X]
**File**: `backend/src/main/kotlin/api/AdminRoutes.kt` (same file as T026-T027)

Add authenticated route:
- POST /api/admin/categories (requires auth)
- Parse request body { name, order }
- Call CategoryService.createCategory()
- Return 201 Created with category JSON

**Acceptance**: T006 contract test passes

**Dependencies**: T027 (same file), T023 (needs CategoryService)

---

#### T029: Implement PUT /api/admin/categories/{id} Endpoint [X]
**File**: `backend/src/main/kotlin/api/AdminRoutes.kt` (same file as T026-T028)

Add authenticated route:
- PUT /api/admin/categories/{id} (requires auth)
- Parse request body { name?, order? }
- Call CategoryService.updateCategory()
- Return 200 OK or 404 Not Found

**Acceptance**: T007 contract test passes

**Dependencies**: T028 (same file), T023 (needs CategoryService)

---

#### T030: Implement DELETE /api/admin/categories/{id} Endpoint [X]
**File**: `backend/src/main/kotlin/api/AdminRoutes.kt` (same file as T026-T029)

Add authenticated route:
- DELETE /api/admin/categories/{id}?cascade=bool (requires auth)
- Call CategoryService.softDeleteCategory(cascade param)
- Return 204 No Content, 404, or 409 Conflict

**Acceptance**: T008 contract test passes

**Dependencies**: T029 (same file), T023 (needs CategoryService)

---

#### T031: Implement GET /api/admin/questions Endpoint [X]
**File**: `backend/src/main/kotlin/api/AdminRoutes.kt` (same file as T026-T030)

Add authenticated route:
- GET /api/admin/questions?categoryId=... (requires auth)
- Call QuestionService.getAllQuestions(categoryId)
- Return JSON array of questions

**Acceptance**: T009 contract test passes

**Dependencies**: T030 (same file), T024 (needs QuestionService)

---

#### T032: Implement POST /api/admin/questions Endpoint [X]
**File**: `backend/src/main/kotlin/api/AdminRoutes.kt` (same file as T026-T031)

Add authenticated route:
- POST /api/admin/questions (requires auth)
- Parse request body { text, categoryId, order }
- Call QuestionService.createQuestion()
- Return 201 Created with question JSON

**Acceptance**: T010 contract test passes

**Dependencies**: T031 (same file), T024 (needs QuestionService)

---

#### T033: Implement PUT & DELETE /api/admin/questions/{id} Endpoints [X]
**File**: `backend/src/main/kotlin/api/AdminRoutes.kt` (same file as T026-T032)

Add authenticated routes:
- PUT /api/admin/questions/{id} (requires auth)
- DELETE /api/admin/questions/{id} (requires auth)
- Call QuestionService methods

**Acceptance**: T011 contract test passes

**Dependencies**: T032 (same file), T024 (needs QuestionService)

---

#### T034: Update GET /api/questions to Filter Active Only [X]
**File**: `backend/src/main/kotlin/api/QuestionRoutes.kt`

Modify existing public questions endpoint:
- Filter by `active = true` when querying questions and categories
- Exclude soft-deleted items from public API

**Acceptance**: T015 integration test passes (soft delete verification)

**Dependencies**: T024 (needs QuestionService with soft delete)

---

### Frontend Hooks

#### T035 [P]: Implement useAdminAuth Hook
**File**: `frontend/src/hooks/admin/useAdminAuth.ts`

Create authentication hook:
- State: isAuthenticated (boolean)
- Methods: login(password), logout()
- Store token in sessionStorage
- Call POST /api/admin/auth

**Acceptance**: T020 hook test passes

**Dependencies**: T026 (needs auth endpoint)

---

#### T036 [P]: Implement useCategories Hook
**File**: `frontend/src/hooks/admin/useCategories.ts`

Create React Query hooks:
- useQuery for GET /api/admin/categories
- useMutation for POST, PUT, DELETE operations
- Optimistic updates for better UX

**Acceptance**: Hook returns data from API, mutations work

**Can run in parallel with**: T035, T037 (different files)

**Dependencies**: T027-T030 (needs category endpoints)

---

#### T037 [P]: Implement useQuestions Hook
**File**: `frontend/src/hooks/admin/useQuestions.ts`

Create React Query hooks:
- useQuery for GET /api/admin/questions
- useMutation for POST, PUT, DELETE operations
- Optimistic updates for reordering

**Acceptance**: Hook returns data from API, mutations work

**Can run in parallel with**: T035, T036 (different files)

**Dependencies**: T031-T033 (needs question endpoints)

---

### Frontend Components

#### T038 [P]: Implement AdminAuth Component
**File**: `frontend/src/components/admin/AdminAuth.tsx`

Create login component:
- Password input field
- Submit button
- Error message display
- Calls useAdminAuth().login()

**Acceptance**: T016 component test passes

**Dependencies**: T035 (needs useAdminAuth hook)

---

#### T039 [P]: Implement CategoryList & CategoryForm Components
**File**: `frontend/src/components/admin/CategoryList.tsx` and `CategoryForm.tsx`

Create category management components:
- CategoryList: Displays categories, edit/delete buttons, inactive badge
- CategoryForm: Create/edit form with name and order fields

Use useCategories hook for data and mutations

**Acceptance**: T017 component test passes

**Can run in parallel with**: T038, T040 (different files)

**Dependencies**: T036 (needs useCategories hook)

---

#### T040 [P]: Implement QuestionList & QuestionForm Components with Drag-and-Drop
**File**: `frontend/src/components/admin/QuestionList.tsx` and `QuestionForm.tsx`

Create question management components:
- QuestionList: Displays questions grouped by category, drag handles, edit/delete buttons
- Implement drag-and-drop with @dnd-kit
- QuestionForm: Create/edit form with text, category dropdown, order fields

Use useQuestions hook for data and mutations

**Acceptance**: T018 component test passes

**Can run in parallel with**: T038, T039 (different files)

**Dependencies**: T037 (needs useQuestions hook), T002 (@dnd-kit library)

---

### Frontend Pages & Routing

#### T041: Implement AdminDashboard Page & Admin Routes
**File**: `frontend/src/pages/AdminDashboard.tsx` and `frontend/src/App.tsx`

Create admin dashboard page:
- AdminLayout component with navigation tabs
- Integrate AdminAuth, CategoryList, QuestionList components
- Add admin routes to React Router:
  - `/admin` - Main dashboard (protected route)
  - `/admin/categories` - Category management
  - `/admin/questions` - Question management

Route protection: Redirect to login if not authenticated (use useAdminAuth)

**Acceptance**: T019 integration test passes, can navigate to /admin

**Dependencies**: T038, T039, T040 (needs all admin components)

---

## Phase 3.4: Integration & Polish

#### T042 [P]: Create MongoDB Indexes
**File**: `backend/src/main/kotlin/DatabaseSetup.kt`

Create indexes per data-model.md:
- Category.name unique partial index (active=true)
- Category.order index
- Question.categoryId + Question.order compound index
- Question.active index

**Acceptance**: Indexes created, unique constraint enforced

**Can run in parallel with**: T003 (different concern)

**Dependencies**: T021, T022 (needs models)

---

## Phase 3.5: Validation

#### T043: Run Database Seed Script
**Prerequisite**: T003 seed script created

Execute seed script:
```bash
cd backend
export ADMIN_PASSWORD="demo-admin-2025"
./gradlew seed
```

**Acceptance**: 6 initial categories inserted into MongoDB

**Dependencies**: T003, T021, T023 (needs seed script, models, services)

---

#### T044: Execute Quickstart Guide
**Prerequisite**: All implementation complete

Follow `quickstart.md` step-by-step:
1. Set ADMIN_PASSWORD env var
2. Start MongoDB, backend, frontend
3. Authenticate to admin dashboard
4. Create category "Team Dynamics"
5. Create question in category
6. Reorder questions via drag-and-drop
7. Verify in public questionnaire
8. Soft delete question
9. Verify response preservation
10. Category deletion with constraint
11. Edit category name

**Acceptance**: All 11 quickstart steps pass successfully

**Dependencies**: T001-T042 (all implementation complete), T043 (seeded database)

---

## Dependencies Summary

```
Setup (T001-T003) → Tests (T004-T020) → Models (T021-T022)
                                          ↓
                                     Services (T023-T024)
                                          ↓
                     Auth (T025) → Admin Routes (T026-T034)
                                          ↓
                                    Frontend Hooks (T035-T037)
                                          ↓
                                  Frontend Components (T038-T040)
                                          ↓
                                    Admin Dashboard (T041)
                                          ↓
                              Integration & Polish (T042-T044)
```

**Critical Path**: T004-T020 (tests) → T021-T022 (models) → T023-T024 (services) → T026-T033 (routes) → T035-T037 (hooks) → T038-T040 (components) → T041 (dashboard) → T044 (quickstart)

---

## Parallel Execution Examples

### Example 1: All Contract Tests Together
```bash
# After T001-T003 complete, launch all contract tests in parallel:
# T004-T011 can all run together (8 different test files)
```

### Example 2: Models + Services in Parallel
```bash
# After T004-T020 complete:
# T021 (Category model) [P]
# T022 (Question model) [P]
# Then:
# T023 (CategoryService) [P]
# T024 (QuestionService) [P]
```

### Example 3: Frontend Hooks in Parallel
```bash
# After T026-T033 complete (all endpoints implemented):
# T035 (useAdminAuth) [P]
# T036 (useCategories) [P]
# T037 (useQuestions) [P]
```

### Example 4: Frontend Components in Parallel
```bash
# After T035-T037 complete (all hooks ready):
# T038 (AdminAuth) [P]
# T039 (CategoryList/Form) [P]
# T040 (QuestionList/Form) [P]
```

---

## Notes

- **[P] tasks**: Can run in parallel (different files, no dependencies)
- **TDD strictly enforced**: Tests T004-T020 MUST fail before implementing T021+
- **Sequential admin routes**: T026-T033 all modify AdminRoutes.kt (must be sequential)
- **Commit after each task**: Small, atomic commits enable easy rollback
- **Environment variable**: Set `ADMIN_PASSWORD` for all backend tests and quickstart

---

## Validation Checklist

**GATE: Verify before marking tasks.md complete**

- [x] All 8 endpoints have corresponding contract tests (T004-T011)
- [x] All 2 entities have model tasks (T021-T022)
- [x] All tests come before implementation (T004-T020 before T021+)
- [x] Parallel tasks truly independent (verified file paths)
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task
- [x] Frontend dependencies (@dnd-kit) included in setup
- [x] Database seed script included
- [x] Quickstart validation included as final task

---

**Total Tasks**: 44
**Estimated Duration**: 3-4 days (with parallel execution)
**Ready for**: Implementation phase (`/implement` or manual execution)

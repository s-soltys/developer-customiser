
# Implementation Plan: Backoffice Question Configuration

**Branch**: `002-create-a-backoffice` | **Date**: 2025-10-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-create-a-backoffice/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ Loaded and analyzed
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ Project type: Web (frontend + backend)
   → ✅ Structure Decision: Extend existing monorepo
3. Fill Constitution Check section
   → ✅ No constitution defined (using template placeholders)
4. Evaluate Constitution Check section
   → ✅ No violations (no active constitution)
   → ✅ Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → ✅ Complete (research.md generated)
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
   → ✅ Complete (all artifacts generated)
7. Re-evaluate Constitution Check section
   → ✅ PASS (no new violations)
8. Plan Phase 2 → Describe task generation approach
   → ✅ Complete (described in Phase 2 section)
9. STOP - Ready for /tasks command
   → ✅ READY
```

## Summary
Create a backoffice administration interface for managing questions and categories in the "How to Work With Me" questionnaire. Administrators will authenticate with a password (environment variable) and can create, edit, reorder, and soft-delete both questions and categories. Changes apply globally to all users. The backoffice extends the existing monorepo's React frontend and Kotlin backend.

## Technical Context
**Language/Version**:
- Frontend: TypeScript 5.2+, React 18.2
- Backend: Kotlin 1.9.21, Java 17

**Primary Dependencies**:
- Frontend: React Query 5.14, React Router 6.20, React Hook Form 7.49, Zod 3.22, Tailwind CSS 3.3, Vite 5.0, Vitest 1.0
- Backend: Ktor 2.3.7, KMongo 4.11, kotlinx.serialization 1.6

**Storage**: MongoDB (existing database, add new collections for questions and categories)

**Testing**:
- Frontend: Vitest + React Testing Library + MSW
- Backend: Kotest 5.8

**Target Platform**:
- Frontend: Modern browsers, localhost:5173 (dev)
- Backend: JVM 17, localhost:8080 (dev)

**Project Type**: Web (frontend + backend monorepo)

**Performance Goals**: No specific latency requirements (eventual consistency acceptable)

**Constraints**:
- Single shared password authentication (environment variable)
- Soft delete for questions and categories (preserve user responses)
- Global question/category ordering (applies to all users)

**Scale/Scope**:
- Backoffice for admin use (low concurrent user count)
- Manage ~50-100 questions across 6+ categories initially

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No project constitution found at `.specify/memory/constitution.md`. Using default development principles:
- ✅ Code quality: TypeScript strict mode, Kotlin idiomatic patterns
- ✅ Testing: TDD approach with contract tests, unit tests, integration tests
- ✅ Simplicity: Minimal additional complexity, leverage existing stack
- ✅ Observability: Structured logging (Ktor), error boundaries (React)

## Project Structure

### Documentation (this feature)
```
specs/002-create-a-backoffice/
├── spec.md              # Feature specification
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
backend/
├── src/main/kotlin/
│   ├── models/
│   │   ├── Question.kt          # New: Question entity
│   │   ├── Category.kt          # New: Category entity
│   │   └── Profile.kt           # Existing
│   ├── services/
│   │   ├── QuestionService.kt   # New: Question CRUD operations
│   │   ├── CategoryService.kt   # New: Category CRUD operations
│   │   └── ProfileService.kt    # Existing
│   └── api/
│       ├── AdminRoutes.kt       # New: Backoffice API endpoints
│       ├── QuestionRoutes.kt    # Update: Read from database
│       └── ProfileRoutes.kt     # Existing
└── src/test/kotlin/
    ├── contract/
    │   └── AdminApiTest.kt      # New: Contract tests for admin endpoints
    ├── integration/
    │   └── BackofficeFlowTest.kt # New: End-to-end admin scenarios
    └── unit/
        ├── QuestionServiceTest.kt   # New
        └── CategoryServiceTest.kt   # New

frontend/
├── src/
│   ├── components/
│   │   ├── admin/               # New: Backoffice components
│   │   │   ├── QuestionList.tsx
│   │   │   ├── QuestionForm.tsx
│   │   │   ├── CategoryList.tsx
│   │   │   ├── CategoryForm.tsx
│   │   │   └── AdminAuth.tsx
│   │   └── ...existing components
│   ├── pages/
│   │   ├── AdminDashboard.tsx   # New: Main backoffice page
│   │   └── ...existing pages
│   ├── hooks/
│   │   ├── admin/               # New: Admin-specific hooks
│   │   │   ├── useQuestions.ts
│   │   │   ├── useCategories.ts
│   │   │   └── useAdminAuth.ts
│   │   └── ...existing hooks
│   └── services/
│       └── adminApi.ts          # New: Admin API client
└── tests/
    ├── components/admin/        # New: Component tests
    └── integration/
        └── AdminFlow.test.tsx   # New: Full backoffice flow

shared/
└── contracts/
    └── admin-api-spec.yaml      # New: OpenAPI spec for admin endpoints
```

**Structure Decision**: Extend existing web application monorepo (backend + frontend). Add new admin-specific modules to both sides. Reuse existing MongoDB connection, authentication patterns, and React Query setup.

## Phase 0: Outline & Research

### Research Tasks

1. **Authentication Strategy**
   - Decision needed: Simple password middleware for Ktor
   - Research: Ktor authentication plugin for custom credentials
   - Best practices: Environment variable configuration, session management

2. **Question Management API Design**
   - Pattern research: RESTful CRUD for questions and categories
   - Best practices: Soft delete patterns in MongoDB
   - Integration: How to update existing `GET /api/questions` endpoint

3. **Drag-and-Drop Reordering**
   - Frontend research: React libraries for drag-and-drop (react-beautiful-dnd, dnd-kit)
   - Best practices: Optimistic updates with React Query
   - Pattern: Persisting order field in database

4. **Category Deletion Constraints**
   - Research: Cascade behavior options when category deleted
   - Decision: Orphan questions vs. prevent deletion vs. soft delete
   - Pattern: Referential integrity in MongoDB

5. **Frontend Routing**
   - Pattern: Nested routes for backoffice (`/admin/*`)
   - Security: Route guards for password-protected pages
   - Best practices: Separate layout for admin vs. public pages

**Output**: research.md with all decisions documented

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

### Artifacts to Generate

1. **data-model.md**:
   - Question entity (id, text, categoryId, order, active, timestamps)
   - Category entity (id, name, order, active, timestamps)
   - Relationships and indexes
   - Migration strategy from hardcoded questions

2. **contracts/admin-api-spec.yaml**:
   - Authentication: `POST /api/admin/auth` (password validation)
   - Questions: CRUD endpoints
     - `GET /api/admin/questions`
     - `POST /api/admin/questions`
     - `PUT /api/admin/questions/:id`
     - `DELETE /api/admin/questions/:id` (soft delete)
     - `PUT /api/admin/questions/:id/reorder`
   - Categories: CRUD endpoints
     - `GET /api/admin/categories`
     - `POST /api/admin/categories`
     - `PUT /api/admin/categories/:id`
     - `DELETE /api/admin/categories/:id` (soft delete)

3. **Contract tests** (backend/src/test/kotlin/contract/AdminApiTest.kt):
   - Test each endpoint matches OpenAPI spec
   - Request/response schema validation
   - Authentication header validation

4. **quickstart.md**:
   - Step 1: Set ADMIN_PASSWORD environment variable
   - Step 2: Start backend and frontend
   - Step 3: Navigate to /admin and authenticate
   - Step 4: Create category, add question, reorder, verify in public questionnaire
   - Step 5: Soft delete question, verify response preservation

5. **Update CLAUDE.md**:
   - Add admin API endpoints to "Key Endpoints" section
   - Document admin authentication pattern
   - Add soft delete conventions
   - Reference new admin components and hooks
   - Keep incremental (preserve existing content)

**Output**: data-model.md, contracts/admin-api-spec.yaml, failing contract tests, quickstart.md, updated CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
1. Load data-model.md, contracts/admin-api-spec.yaml, quickstart.md
2. Generate backend tasks:
   - Create Question and Category models
   - Create QuestionService and CategoryService
   - Implement authentication middleware
   - Create AdminRoutes with all CRUD endpoints
   - Update QuestionRoutes to read from database
   - Write contract tests (must fail initially)
   - Write unit tests for services
3. Generate frontend tasks:
   - Create admin authentication flow (AdminAuth component, useAdminAuth hook)
   - Create admin routing and layout
   - Create QuestionList and QuestionForm components
   - Create CategoryList and CategoryForm components
   - Implement drag-and-drop reordering
   - Create adminApi service with React Query hooks
   - Write component tests
   - Write integration tests
4. Generate integration tasks:
   - Database migration/seed script for initial categories
   - End-to-end backoffice flow test
   - Quickstart validation

**Ordering Strategy**:
- Backend first (data models → services → API routes → tests)
- Frontend depends on backend API
- TDD: Contract tests → implementation → unit tests
- Mark [P] for parallelizable tasks (independent components)

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following TDD principles)
**Phase 5**: Validation (run tests, execute quickstart.md, verify acceptance criteria)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

No constitutional violations identified. This feature extends the existing stack without introducing new languages, frameworks, or architectural patterns.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command) - 44 tasks created
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS (no active constitution)
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (1 minor item in FR-002: search/filter - deferred as optional)
- [x] Complexity deviations documented (none)

---
*Based on project conventions - See `CLAUDE.md` for stack details*

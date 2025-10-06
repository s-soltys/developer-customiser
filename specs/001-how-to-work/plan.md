
# Implementation Plan: How to Work With Me App

**Branch**: `001-how-to-work` | **Date**: 2025-10-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-how-to-work/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code, or `AGENTS.md` for all other agents).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
An interactive web application that guides users through creating a comprehensive "How to Work With Me" profile via a multi-category questionnaire. Users complete six categories (Communication, Work Style, Feedback, Strengths, Pet Peeves, Personal Context) in a single session, then receive a shareable public link to their completed profile card. Profiles are editable post-creation. Built as a monorepo with React/Tailwind/React Query frontend and Kotlin/MongoDB backend, using a flexible key-value data model to support future question additions.

## Technical Context
**Language/Version**: Frontend: JavaScript/TypeScript (React 18+), Backend: Kotlin (latest stable), Build: Node.js 18+
**Primary Dependencies**: Frontend: React, Tailwind CSS, React Query (TanStack Query), Backend: Kotlin web framework (to be researched), MongoDB driver for Kotlin
**Storage**: MongoDB (flexible key-value schema for questions/responses)
**Testing**: Frontend: Vitest + React Testing Library, Backend: Kotlin test framework (to be researched)
**Target Platform**: Web browsers (desktop and mobile responsive), Backend deployed as service
**Project Type**: web (monorepo with frontend/ and backend/ directories)
**Performance Goals**: MVP - no specific performance targets required
**Constraints**: Single-session completion (no progress saving), responsive design required
**Scale/Scope**: MVP - no specific scale targets, focus on core functionality

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: PASS (Constitution file contains only placeholders - no active constraints to validate)

The constitution file at `.specify/memory/constitution.md` contains template placeholders only. No specific principles, constraints, or requirements are defined. This feature proceeds without constitutional constraints.

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
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
│   ├── models/              # MongoDB document models
│   ├── services/            # Business logic
│   ├── api/                 # REST endpoints
│   └── Application.kt       # Main entry point
├── src/test/kotlin/
│   ├── contract/            # API contract tests
│   ├── integration/         # Integration tests
│   └── unit/                # Unit tests
├── build.gradle.kts         # Kotlin build configuration
└── README.md

frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CategoryScreen.tsx
│   │   ├── ProgressIndicator.tsx
│   │   └── SummaryCard.tsx
│   ├── pages/               # Page-level components
│   │   ├── NameEntry.tsx
│   │   ├── Questionnaire.tsx
│   │   └── ProfileView.tsx
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API client (React Query)
│   └── App.tsx              # Root component
├── tests/
│   ├── integration/         # E2E user flow tests
│   └── unit/                # Component tests
├── tailwind.config.js
├── vite.config.ts
└── package.json

shared/
└── contracts/               # Shared API contracts (OpenAPI spec)
```

**Structure Decision**: Web application monorepo with separate frontend/ and backend/ directories. Frontend uses Vite for fast development, backend uses Gradle for Kotlin builds. Shared contracts/ directory ensures API consistency between layers.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
1. **Environment Setup** (5-7 tasks):
   - Initialize monorepo structure (backend/, frontend/, shared/)
   - Configure Kotlin backend with Gradle and Ktor
   - Configure React frontend with Vite and TypeScript
   - Set up MongoDB with Docker Compose
   - Configure CORS between frontend/backend

2. **Backend Foundation** (8-10 tasks):
   - Define Kotlin data models (Profile, Question, Response enums)
   - Seed question templates into MongoDB
   - Implement GET /api/questions endpoint + contract test
   - Implement POST /api/profiles endpoint + contract test
   - Implement GET /api/profiles/:id endpoint + contract test
   - Implement PUT /api/profiles/:id endpoint + contract test
   - Implement GET /api/profiles/share/:shareableId endpoint + contract test
   - Add validation logic (response types, question existence)

3. **Frontend Foundation** (10-12 tasks):
   - Set up React Router for multi-page navigation
   - Configure Tailwind CSS theming
   - Set up React Query client with API base URL
   - Create TypeScript types from OpenAPI spec
   - Implement API service layer (React Query hooks)
   - Create NameEntry page component
   - Create CategoryScreen component (reusable for all 6 categories)
   - Create ProgressIndicator component
   - Create SummaryCard component
   - Create ProfileView page (for shareable links)
   - Wire up navigation flow with state management

4. **Integration & Testing** (5-7 tasks):
   - Write E2E test for complete user journey (Scenario 1-3)
   - Write E2E test for profile editing (Scenario 5)
   - Write E2E test for session abandonment (Scenario 6)
   - Test responsive design on mobile viewport
   - Validate quickstart.md scenarios manually

**Ordering Strategy**:
- **Sequential phases**: Setup → Backend → Frontend → Integration
- **Within phases**: Test-first where applicable (contract tests before implementations)
- **Parallelizable tasks** marked [P]: Data models, API endpoints (after foundation), UI components
- **Dependencies**: Backend API must work before frontend integration

**Estimated Output**: 30-35 numbered, dependency-ordered tasks in tasks.md

**Key Dependencies**:
- Docker Compose setup → Backend can start
- Backend models → API endpoints
- Backend endpoints working → Frontend API integration
- All components → E2E testing

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (via research.md)
- [x] Complexity deviations documented (N/A - no violations)

**Artifacts Generated**:
- [x] research.md - Technical decisions and framework choices
- [x] data-model.md - MongoDB collections and schemas
- [x] contracts/api-spec.yaml - OpenAPI 3.0 REST API specification
- [x] quickstart.md - End-to-end validation guide
- [x] CLAUDE.md - Agent context file for Claude Code
- [x] tasks.md - 38 implementation tasks with dependencies and parallel execution guidance

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*

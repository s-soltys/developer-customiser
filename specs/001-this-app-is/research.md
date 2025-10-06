# Research: Manager Mindset Feedback Tool

**Date**: 2025-10-06
**Feature**: 001-this-app-is
**Status**: Complete

## Overview
Research findings for technical decisions needed to implement the Manager Mindset Feedback Tool MVP. Focus on beginner-friendly Kotlin setup, MongoDB integration, and React charting solutions.

## Technology Decisions

### Backend Framework: Ktor vs Spring Boot

**Decision**: Ktor

**Rationale**:
- Lightweight and more beginner-friendly than Spring Boot
- Less boilerplate, easier to understand for someone new to Kotlin ecosystem
- Built by JetBrains specifically for Kotlin (idiomatic Kotlin patterns)
- Sufficient for MVP - no need for Spring's extensive ecosystem
- Faster startup time and lower memory footprint
- Simple routing DSL

**Alternatives Considered**:
- **Spring Boot**: More mature ecosystem, excellent documentation, but steeper learning curve with more "magic" and conventions. Overkill for this MVP.
- **http4k**: Functional approach, very lightweight, but less documentation and community support than Ktor

**Implementation Notes**:
- Use Ktor 2.x with embedded Netty server
- Content negotiation plugin for JSON serialization (kotlinx.serialization)
- CORS plugin for frontend communication

---

### MongoDB Driver: KMongo vs Official Driver

**Decision**: KMongo

**Rationale**:
- Kotlin-idiomatic wrapper around official MongoDB Java driver
- Provides type-safe DSL for queries
- Better Kotlin coroutines support
- Simplifies CRUD operations compared to Java driver
- Active maintenance and good documentation

**Alternatives Considered**:
- **Official MongoDB Kotlin Driver**: More recent official support, but less mature than KMongo and more verbose
- **MongoDB Java Driver**: Well-established but Java-centric API, less idiomatic in Kotlin

**Implementation Notes**:
- Use KMongo 4.x with coroutines support
- Store trait responses as flexible key-value documents: `{ "trait_id": "risk_taking", "value": 4 }`
- Enable easy addition of new traits without schema migration

---

### Testing Framework: JUnit vs Kotest

**Decision**: Kotest for backend

**Rationale**:
- Kotlin-first testing framework with multiple testing styles
- Better integration with coroutines (important for Ktor + KMongo)
- Excellent property-based testing support
- More expressive assertions than JUnit
- Built-in test data generation

**Alternatives Considered**:
- **JUnit 5**: Standard choice, great tooling support, but more Java-centric
- **Spek**: Deprecated in favor of Kotest

**Implementation Notes**:
- Use StringSpec or FunSpec style for readability
- Kotest Ktor plugin for HTTP testing
- MockK for mocking (Kotlin-friendly mocking library)

---

### Frontend Chart Library: Recharts vs Chart.js

**Decision**: Recharts

**Rationale**:
- React-native component library (declarative API matches React patterns)
- Built-in radar chart support
- TypeScript support out of the box
- Composable components fit React philosophy
- Easier to customize with React props

**Alternatives Considered**:
- **Chart.js with react-chartjs-2**: More features, but imperative API feels less "React-like"
- **Victory**: Good React integration but heavier bundle size
- **Nivo**: Beautiful defaults but more complex for simple radar charts

**Implementation Notes**:
- Use `<RadarChart>` component with `<PolarGrid>`, `<PolarAngleAxis>`, `<Radar>` sub-components
- Customize colors to match Tailwind theme
- Responsive sizing with `ResponsiveContainer`

---

### Build Tool: Gradle vs Maven

**Decision**: Gradle with Kotlin DSL (build.gradle.kts)

**Rationale**:
- Industry standard for Kotlin projects
- Kotlin DSL provides type-safe build configuration
- Better incremental builds than Maven
- More flexible and concise than Maven XML
- Excellent IDE integration (especially IntelliJ IDEA)

**Alternatives Considered**:
- **Maven**: More verbose XML configuration, less Kotlin-idiomatic
- **Bazel**: Overkill for MVP monorepo

**Implementation Notes**:
- Use Gradle 8.x with Kotlin DSL
- Shadow plugin for building fat JARs
- Kotlin serialization plugin for JSON handling

---

### Frontend State Management: React Query Only

**Decision**: React Query only (no additional state management)

**Rationale**:
- User already specified React Query
- Server state management is the main concern (API calls)
- Local UI state can be handled with React hooks (useState, useContext)
- No need for Redux/Zustand for this MVP
- Reduces complexity and bundle size

**Alternatives Considered**:
- **Redux Toolkit**: Overkill for MVP with limited client-side state
- **Zustand**: Simple but unnecessary given React Query handles server state

**Implementation Notes**:
- React Query for all API calls (mutations and queries)
- React Context for minor shared UI state if needed (e.g., profile ID)
- Keep most state server-synchronized

---

### Data Model Strategy: Flexible Trait Storage

**Decision**: Store traits as key-value array in MongoDB documents

**Rationale**:
- Requirement: "data model should be flexible - I can later introduce new questions"
- Avoid schema migrations when adding/removing traits
- MongoDB's schemaless nature suits this requirement perfectly
- Easy to query and aggregate

**Schema Design**:
```json
{
  "_id": "profile_abc123",
  "feedbackLinkId": "f_xyz789",
  "adminLinkId": "a_def456",
  "createdAt": "2025-10-06T12:00:00Z",
  "responses": [
    {
      "respondentId": "colleague_123",
      "respondentName": "Jane Doe",
      "submittedAt": "2025-10-06T14:30:00Z",
      "traits": [
        { "traitId": "risk_taking", "value": 4 },
        { "traitId": "goofy_professional", "value": 2 },
        { "traitId": "candid_diplomatic", "value": 5 },
        { "traitId": "leadership_ic", "value": 3 }
      ]
    }
  ]
}
```

**Alternatives Considered**:
- Fixed columns per trait: Requires migration for new traits
- Separate collections: More complex queries and aggregation

**Implementation Notes**:
- Trait definitions hardcoded in application config
- Easy to add new traits by updating config and deploying
- Existing data remains valid (just shows as null for missing traits)

---

## Development Setup Guide

### Prerequisites for User
Since the user is unfamiliar with Kotlin ecosystem, provide clear setup instructions:

1. **Install Java Development Kit (JDK)**:
   - JDK 17 or higher required
   - Recommended: Amazon Corretto, Azul Zulu, or Oracle JDK
   - Verify: `java -version`

2. **Install IntelliJ IDEA** (optional but recommended):
   - Community Edition is free and sufficient
   - Better Kotlin support than VS Code
   - Built-in Gradle support

3. **Install MongoDB**:
   - Option A: Local installation via Homebrew (macOS): `brew install mongodb-community`
   - Option B: Docker container: `docker run -d -p 27017:27017 mongo:7`
   - Option C: MongoDB Atlas (cloud, free tier)
   - Verify: `mongosh` or connection test

4. **Install Node.js** (for frontend):
   - Version 18+ recommended
   - Use nvm for version management
   - Verify: `node -v` and `npm -v`

### First-Time Backend Build
- Gradle wrapper handles Gradle installation automatically
- Run: `./gradlew build` (downloads dependencies, compiles, runs tests)
- No need to install Gradle globally

### Frontend Setup
- Standard Node.js workflow: `npm install` in frontend/
- Tailwind CSS configured via `tailwind.config.js`
- React Query provider setup in App.tsx

---

## API Design Patterns

### RESTful Endpoints
Following standard REST conventions for simplicity:

**Profile Management**:
- `POST /api/profiles` - Create new profile (returns feedbackLinkId + adminLinkId)
- `GET /api/profiles/:feedbackLinkId` - Get profile metadata for feedback form
- `GET /api/profiles/:adminLinkId/results` - Get results dashboard data (manager view)

**Feedback Submission**:
- `POST /api/profiles/:feedbackLinkId/responses` - Submit colleague feedback
- `GET /api/profiles/:feedbackLinkId/aggregate` - Get aggregate results for success screen

**Response Format**:
- Standard JSON responses
- Error format: `{ "error": "message", "code": "ERROR_CODE" }`
- Success format: `{ "data": {...} }`

**CORS**:
- Allow all origins for MVP (development)
- Restrict in production if deployed publicly

---

## Testing Strategy

### Backend Tests
1. **Contract Tests**: Verify API request/response schemas match OpenAPI spec
2. **Integration Tests**: Full request/response cycle with test MongoDB
3. **Unit Tests**: Service layer logic (aggregations, validations)

### Frontend Tests
1. **Component Tests**: React Testing Library for UI components
2. **Integration Tests**: User flow tests with MSW (Mock Service Worker)
3. **Type Safety**: TypeScript strict mode + shared contract types

### Test Data
- Use Kotest data generators for randomized testing
- Provide fixture data for common scenarios (0 responses, 1 response, 10 responses)

---

## Next Steps
All technical unknowns resolved. Ready to proceed to Phase 1: Design & Contracts.

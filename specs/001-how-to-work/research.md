# Research & Technical Decisions
**Feature**: How to Work With Me App
**Date**: 2025-10-06

## Overview
This document captures research findings and technical decisions for the "How to Work With Me" MVP application. The primary goal is to establish a simple, working implementation without over-engineering.

---

## Backend: Kotlin Web Framework

### Decision
**Ktor** - Lightweight Kotlin framework for building asynchronous servers and clients

### Rationale
- **Native Kotlin**: First-class Kotlin support with coroutines
- **Lightweight**: Minimal boilerplate, suitable for MVP
- **Flexible**: Easy to add features incrementally
- **Well-documented**: Official JetBrains framework with strong community
- **Modern**: Built for async/non-blocking I/O from the ground up

### Alternatives Considered
- **Spring Boot**: More enterprise-focused, heavier weight than needed for MVP
- **http4k**: Functional approach, steeper learning curve for developers unfamiliar with Kotlin ecosystem
- **Javalin**: Java-first with Kotlin support, but Ktor is more idiomatic

### Setup Requirements
```kotlin
// build.gradle.kts dependencies
implementation("io.ktor:ktor-server-core:2.3.+")
implementation("io.ktor:ktor-server-netty:2.3.+")
implementation("io.ktor:ktor-server-content-negotiation:2.3.+")
implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.+")
implementation("io.ktor:ktor-server-cors:2.3.+")
```

---

## Backend: MongoDB Kotlin Driver

### Decision
**MongoDB Kotlin Driver** (official) with KMongo for enhanced Kotlin experience

### Rationale
- **Official Support**: MongoDB provides official Kotlin driver
- **KMongo Enhancement**: Adds Kotlin-idiomatic extensions on top of official driver
- **Type Safety**: Leverages Kotlin's type system
- **Coroutines**: Supports Kotlin coroutines for async operations
- **Simple Setup**: Minimal configuration needed for MVP

### Alternatives Considered
- **Raw Java Driver**: Less idiomatic Kotlin, more verbose
- **Morphia**: ORM approach adds complexity for simple key-value model
- **Spring Data MongoDB**: Ties to Spring ecosystem unnecessarily

### Setup Requirements
```kotlin
// build.gradle.kts dependencies
implementation("org.mongodb:mongodb-driver-kotlin-coroutine:4.11.+")
implementation("org.litote.kmongo:kmongo-coroutine:4.11.+")
```

### Connection Pattern
```kotlin
val client = MongoClient.create("mongodb://localhost:27017")
val database = client.getDatabase("howtoworkwithme")
```

---

## Backend: Testing Framework

### Decision
**Kotest** for unit/integration tests + **Ktor Test** for API contract tests

### Rationale
- **Kotest**: Idiomatic Kotlin testing with multiple styles (StringSpec, FunSpec, etc.)
- **Rich Matchers**: Expressive assertions for better test readability
- **Ktor Integration**: Built-in support for testing Ktor applications
- **Async Support**: First-class coroutine testing support

### Alternatives Considered
- **JUnit 5**: Java-first, less idiomatic for Kotlin
- **Spek**: Less actively maintained than Kotest

### Setup Requirements
```kotlin
// build.gradle.kts test dependencies
testImplementation("io.kotest:kotest-runner-junit5:5.8.+")
testImplementation("io.kotest:kotest-assertions-core:5.8.+")
testImplementation("io.ktor:ktor-server-tests:2.3.+")
testImplementation("io.ktor:ktor-client-content-negotiation:2.3.+")
```

---

## Frontend: Build Tool & Development Server

### Decision
**Vite** with React + TypeScript template

### Rationale
- **Fast HMR**: Instant hot module replacement during development
- **Modern**: ESM-based, optimized for modern browsers
- **React Support**: Official React template maintained
- **TypeScript**: First-class TypeScript support
- **Simple Config**: Minimal configuration needed

### Setup Command
```bash
npm create vite@latest frontend -- --template react-ts
```

---

## Frontend: State Management & Data Fetching

### Decision
**TanStack Query (React Query v5)** for server state management

### Rationale
- **Server State Focus**: Designed specifically for API data management
- **Built-in Features**: Caching, background refetching, optimistic updates
- **No Redux Needed**: Eliminates need for complex client state management
- **DevTools**: Excellent debugging experience
- **TypeScript**: Strong type inference

### Alternatives Considered
- **Redux Toolkit + RTK Query**: Overkill for MVP, more boilerplate
- **SWR**: Similar but React Query has richer feature set
- **Zustand + fetch**: Manual cache management, reinventing the wheel

### Setup Requirements
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-query-devtools": "^5.0.0"
  }
}
```

---

## Frontend: Form Management

### Decision
**React Hook Form** with Zod validation

### Rationale
- **Performance**: Uncontrolled components, minimal re-renders
- **TypeScript**: Full type safety with Zod schema integration
- **Simple API**: Hook-based, minimal boilerplate
- **Validation**: Zod provides runtime validation matching TypeScript types

### Alternatives Considered
- **Formik**: More verbose, more re-renders
- **Manual useState**: Too much boilerplate for multi-step forms

### Setup Requirements
```json
{
  "dependencies": {
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0"
  }
}
```

---

## Data Model Strategy

### Decision
**Flexible Key-Value Schema** in MongoDB

### Rationale
- **Future-Proof**: Easy to add new questions without schema migrations
- **MVP Simplicity**: No need to predefine all question structures
- **MongoDB Strength**: Document database excels at flexible schemas
- **Quick Iteration**: Can modify questions without backend changes

### Schema Structure
```typescript
// Profile Document
{
  _id: ObjectId,
  name: string,
  shareableId: string,  // UUID for public link
  createdAt: Date,
  updatedAt: Date,
  responses: {
    [categoryId: string]: {
      [questionId: string]: {
        value: string | string[],  // text or selected choices
        answeredAt: Date
      }
    }
  }
}

// Question Template Document (separate collection)
{
  _id: ObjectId,
  categoryId: string,
  questionId: string,
  text: string,
  type: "text" | "choice" | "multichoice",
  choices?: string[],
  order: number
}
```

### Alternatives Considered
- **Rigid Schema**: Would require migrations for new questions
- **Separate Response Documents**: More complex joins, slower queries
- **Embedded Arrays**: Less flexible for querying specific responses

---

## API Design Pattern

### Decision
**REST API** with JSON

### Rationale
- **Simplicity**: Well-understood pattern, minimal learning curve
- **Tooling**: Excellent OpenAPI/Swagger support for documentation
- **Browser-Friendly**: Native fetch API support
- **Caching**: Standard HTTP caching works out of the box

### Endpoint Design
```
POST   /api/profiles                    # Create profile (with name)
GET    /api/profiles/:id                # Get profile by ID (for editing)
GET    /api/profiles/share/:shareableId # Get profile by shareable link
PUT    /api/profiles/:id                # Update profile responses
GET    /api/questions                   # Get all question templates
```

### Alternatives Considered
- **GraphQL**: Over-engineered for simple CRUD operations
- **gRPC**: Web client support requires additional complexity

---

## Monorepo Structure

### Decision
**Simple directory-based monorepo** without workspace tools

### Rationale
- **MVP Simplicity**: No need for Nx, Turborepo, or Lerna
- **Clear Separation**: frontend/, backend/, shared/ directories
- **Independent Builds**: Each project has own build configuration
- **Easy Migration**: Can add workspace tooling later if needed

### Directory Structure
```
/
├── frontend/         # Vite + React app
├── backend/          # Ktor + Kotlin service
├── shared/           # Contracts, types
└── specs/            # Feature specifications
```

---

## Development Environment Setup

### Decision
**Docker Compose** for MongoDB during development

### Rationale
- **Consistent**: Same MongoDB version across all developers
- **Isolated**: Doesn't pollute local system
- **Quick Setup**: `docker-compose up` starts everything
- **Production-Like**: Closer to deployment environment

### docker-compose.yml
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: howtoworkwithme
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

## CORS Configuration

### Decision
**Ktor CORS plugin** with development-friendly defaults

### Rationale
- **Local Development**: Frontend (localhost:5173) can call backend (localhost:8080)
- **Simple Config**: Built-in Ktor plugin
- **Production-Ready**: Easy to restrict origins for deployment

### Configuration
```kotlin
install(CORS) {
    allowHost("localhost:5173")  // Vite dev server
    allowHeader(HttpHeaders.ContentType)
    allowMethod(HttpMethod.Options)
    allowMethod(HttpMethod.Put)
    allowMethod(HttpMethod.Delete)
    allowCredentials = true
}
```

---

## Summary

All technical decisions prioritize:
1. **MVP Speed**: Get working implementation quickly
2. **Developer Experience**: User is new to Kotlin ecosystem
3. **Flexibility**: Support future question additions
4. **Modern Standards**: Use current best practices (Kotlin coroutines, React hooks, etc.)
5. **Simplicity**: Avoid over-engineering (no microservices, no complex state management)

**Next Phase**: Design data models and API contracts based on these technical foundations.

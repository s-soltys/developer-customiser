# How to Work With Me

> An interactive web application that guides team members through creating comprehensive, shareable "How to Work With Me" profiles.

[![Status](https://img.shields.io/badge/Status-In_Development-yellow)]()
[![Backend](https://img.shields.io/badge/Backend-Kotlin_+_Ktor-purple)]()
[![Frontend](https://img.shields.io/badge/Frontend-React_+_TypeScript-blue)]()
[![Database](https://img.shields.io/badge/Database-MongoDB-green)]()

---

## 🎯 Overview

This application helps new team members create and share their work preferences, communication styles, and personal context with colleagues. Users complete a guided questionnaire across 6 categories and receive a shareable link to their profile.

### Key Features

- ✅ **6 Category Questionnaire**:
  - Communication Preferences
  - Work Style
  - Feedback Style
  - Strengths & Growing Areas
  - Pet Peeves & Energizers
  - Personal Context

- ✅ **User-Friendly Flow**:
  - Single-session completion
  - Progress indicator
  - Navigate between categories
  - Mixed question types (text & choice)

- ✅ **Shareable Profiles**:
  - Unique UUID-based links
  - Public access (no authentication)
  - Editable after creation
  - Responsive design

---

## 🚀 Quick Start

### Prerequisites

- **Java 17+** (for Kotlin backend)
- **Node.js 18+** (for React frontend)
- **Docker** (for MongoDB)
- **Gradle** (for building Kotlin)

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed installation instructions.

### Installation

```bash
# 1. Generate Gradle wrapper
cd backend
gradle wrapper --gradle-version 8.5

# 2. Install frontend dependencies
cd ../frontend
npm install

# 3. Start MongoDB
cd ..
docker compose up -d
```

### Running

```bash
# Terminal 1: Start backend
cd backend
./gradlew run
# Backend runs on http://localhost:8080

# Terminal 2: Start frontend
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

Visit http://localhost:5173 to see the application.

---

## 📁 Project Structure

```
developer-customiser/
├── backend/               # Kotlin + Ktor REST API
│   ├── src/main/kotlin/
│   │   ├── models/       # Data models (Profile, Question)
│   │   ├── services/     # Business logic & MongoDB
│   │   ├── Application.kt # Server configuration
│   │   └── Routing.kt    # API endpoints
│   └── build.gradle.kts  # Dependencies
│
├── frontend/              # React + TypeScript SPA
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Route components
│   │   ├── providers/    # React Query setup
│   │   └── App.tsx       # Router configuration
│   └── package.json      # Dependencies
│
├── shared/
│   └── contracts/        # OpenAPI 3.0 specification
│
├── specs/                # Feature specifications
│   └── 001-how-to-work/
│       ├── spec.md       # Feature specification
│       ├── plan.md       # Implementation plan
│       ├── tasks.md      # Task breakdown
│       ├── research.md   # Technical decisions
│       ├── data-model.md # MongoDB schema
│       └── quickstart.md # Validation guide
│
├── docker-compose.yml    # MongoDB configuration
├── SETUP_GUIDE.md       # Setup instructions
├── PROJECT_STATUS.md    # Implementation status
└── CLAUDE.md            # Development guidelines
```

---

## 🛠️ Technology Stack

### Backend
- **Kotlin 1.9** - Modern JVM language
- **Ktor 2.3** - Lightweight async web framework
- **KMongo 4.11** - Kotlin MongoDB driver
- **Kotest 5.8** - Testing framework
- **Gradle 8.5** - Build tool

### Frontend
- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool & dev server
- **Tailwind CSS 3** - Utility-first styling
- **TanStack Query 5** - Server state management
- **React Router 6** - Client-side routing
- **React Hook Form 7** - Form handling
- **Zod 3** - Schema validation

### Database
- **MongoDB 7** - Document database
- **Docker** - Containerization

---

## 🔌 API Endpoints

All endpoints are documented in `shared/contracts/api-spec.yaml` (OpenAPI 3.0 spec).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/questions` | Get all question templates |
| `POST` | `/api/profiles` | Create new profile |
| `GET` | `/api/profiles/:id` | Get profile by ID |
| `PUT` | `/api/profiles/:id` | Update profile responses |
| `GET` | `/api/profiles/share/:shareableId` | Get profile by shareable link |

### Example Request

```bash
# Create a profile
curl -X POST http://localhost:8080/api/profiles \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Chen"}'

# Response
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Alex Chen",
  "shareableId": "a3f2c5d8-9b1e-4f7a-8c2d-1e3b4f5a6b7c",
  "createdAt": "2025-10-06T10:30:00Z",
  "updatedAt": "2025-10-06T10:30:00Z",
  "responses": {}
}
```

---

## 📊 Implementation Status

**Current Phase**: Foundation Complete ✅

- ✅ **Phase 3.1**: Project Setup (100%)
- ✅ **Phase 3.2**: Backend Models (100%)
- ✅ **Phase 3.3**: Backend Implementation (100%)
- ⏳ **Phase 3.4**: Frontend Components (0%)
- ⏳ **Phase 3.5**: Frontend Pages (0%)
- ⏳ **Phase 3.6**: Integration Tests (0%)

**Total Progress**: 13/38 tasks complete (34%)

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for detailed breakdown.

---

## 🧪 Testing

### Backend Tests (Kotest)
```bash
cd backend
./gradlew test
```

### Frontend Tests (Vitest)
```bash
cd frontend
npm run test
```

### Manual Testing

See `specs/001-how-to-work/quickstart.md` for complete validation scenarios.

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Installation & setup instructions |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Current implementation status |
| [CLAUDE.md](./CLAUDE.md) | Development guidelines & code examples |
| [backend/README.md](./backend/README.md) | Backend-specific docs |
| [frontend/README.md](./frontend/README.md) | Frontend-specific docs |
| [specs/001-how-to-work/](./specs/001-how-to-work/) | Feature specifications & design docs |

---

## 🗺️ Roadmap

### Current Sprint
- [ ] Implement frontend TypeScript types from OpenAPI spec
- [ ] Create React Query API hooks
- [ ] Build UI components (ProgressIndicator, QuestionInput, etc.)

### Next Sprint
- [ ] Implement page components (NameEntry, Questionnaire, etc.)
- [ ] Add contract tests for all API endpoints
- [ ] Integration tests for user journeys
- [ ] Responsive design validation

### Future Enhancements
- [ ] Profile analytics (view counts)
- [ ] Link expiration & revocation
- [ ] Profile deletion
- [ ] Character limits per question
- [ ] Custom question types
- [ ] Team/organization features

---

## 🤝 Contributing

This project follows a specification-driven development process:

1. **Specification** → `specs/001-how-to-work/spec.md`
2. **Planning** → `specs/001-how-to-work/plan.md`
3. **Tasks** → `specs/001-how-to-work/tasks.md`
4. **Implementation** → Follow task order

See [CLAUDE.md](./CLAUDE.md) for code style guidelines and best practices.

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if MongoDB is running
docker compose ps

# Start MongoDB
docker compose up -d

# Check logs
docker compose logs mongodb
```

### Frontend build errors
```bash
# Clear node_modules and reinstall
rm -rf frontend/node_modules frontend/package-lock.json
cd frontend && npm install
```

### Port already in use
```bash
# Find process using port 8080 (backend)
lsof -i :8080
kill -9 <PID>

# Find process using port 5173 (frontend)
lsof -i :5173
kill -9 <PID>
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting) for more solutions.

---

## 📝 License

This project is created for educational and internal use purposes.

---

## 👥 Team

- **Feature Spec**: Defined via `/specify` command
- **Planning**: Generated via `/plan` command
- **Implementation**: Generated via `/implement` command
- **Guidance**: See CLAUDE.md for AI agent collaboration

---

## 🔗 Links

- **API Documentation**: `shared/contracts/api-spec.yaml`
- **Feature Spec**: `specs/001-how-to-work/spec.md`
- **Implementation Plan**: `specs/001-how-to-work/plan.md`
- **Task List**: `specs/001-how-to-work/tasks.md`

---

**Status**: Backend Complete ✅ | Frontend In Progress ⏳

Ready to continue with frontend implementation (Tasks T024-T034) or backend testing (Tasks T011-T015).

# How to Work With Me - Setup Guide

This guide will help you set up and run the "How to Work With Me" application.

---

## Prerequisites Installation

### 1. Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Java Development Kit (JDK) 17+
```bash
# Install JDK
brew install openjdk@17

# Add to PATH (add to ~/.zshrc or ~/.bashrc)
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
java --version
# Should show: openjdk 17.x.x or higher
```

### 3. Install Gradle
```bash
# Install Gradle
brew install gradle

# Verify installation
gradle --version
# Should show: Gradle 8.x
```

### 4. Install Node.js 18+
```bash
# Install Node.js
brew install node@18

# Verify installation
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
```

### 5. Install Docker Desktop
```bash
# Install Docker
brew install --cask docker

# Open Docker Desktop application
open -a Docker

# Wait for Docker to start, then verify
docker --version
docker compose version
```

---

## Project Setup

### Step 1: Generate Gradle Wrapper

```bash
cd backend
gradle wrapper --gradle-version 8.5
```

This creates:
- `gradlew` (Gradle wrapper script)
- `gradle/wrapper/` directory

### Step 2: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This installs all packages defined in `package.json`.

### Step 3: Start MongoDB

```bash
# From repository root
cd ..
docker compose up -d
```

Verify MongoDB is running:
```bash
docker compose ps
# Should show: howtoworkwithme-mongodb  running

# Check logs
docker compose logs mongodb
```

---

## Running the Application

### Terminal 1: Start Backend Server

```bash
cd backend
./gradlew run
```

Expected output:
```
> Task :run
Application started on port 8080
MongoDB connected to: howtoworkwithme
Seeded 14 questions into database
```

**Backend is now running on**: http://localhost:8080

### Terminal 2: Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Frontend is now running on**: http://localhost:5173

---

## Verification

### 1. Check Backend Health

Open browser or use curl:
```bash
curl http://localhost:8080/health
# Should return: OK

curl http://localhost:8080/api/questions
# Should return: JSON array with 14 questions
```

### 2. Check Frontend

Open browser to http://localhost:5173/

You should see a placeholder page that says:
- "Name Entry Page"
- "Component will be implemented in T031"

### 3. Check MongoDB

```bash
# Connect to MongoDB shell
docker exec -it howtoworkwithme-mongodb mongosh

# In MongoDB shell:
use howtoworkwithme
db.questions.countDocuments()
# Should return: 14

db.questions.find().pretty()
# Should show all seeded questions

# Exit MongoDB shell
exit
```

---

## Development Workflow

### Backend Development

```bash
cd backend

# Run tests
./gradlew test

# Build project
./gradlew build

# Clean and rebuild
./gradlew clean build

# Run with auto-reload (requires additional setup)
./gradlew run --continuous
```

### Frontend Development

```bash
cd frontend

# Start dev server (with hot reload)
npm run dev

# Run tests
npm run test

# Type check
npx tsc --noEmit

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Management

```bash
# Start MongoDB
docker compose up -d

# Stop MongoDB
docker compose down

# Stop and remove volumes (clears all data)
docker compose down -v

# View logs
docker compose logs -f mongodb

# Restart MongoDB
docker compose restart mongodb
```

---

## Testing the API

### Using curl

```bash
# Get all questions
curl http://localhost:8080/api/questions

# Create a profile
curl -X POST http://localhost:8080/api/profiles \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Chen"}'

# Response will include profile ID and shareableId
# Save these for next commands

# Get profile by ID (replace with actual ID from response)
curl http://localhost:8080/api/profiles/507f1f77bcf86cd799439011

# Update profile with responses (replace ID)
curl -X PUT http://localhost:8080/api/profiles/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "responses": {
      "communication": {
        "preferred-channel": {
          "value": {"selected": "Slack"},
          "answeredAt": "2025-10-06T10:30:00Z"
        }
      }
    }
  }'

# Get profile by shareable ID (replace with actual shareableId)
curl http://localhost:8080/api/profiles/share/a3f2c5d8-9b1e-4f7a-8c2d-1e3b4f5a6b7c
```

### Using Browser

1. **Install REST Client Extension** (VS Code):
   - Install "REST Client" extension
   - Create `test.http` file with requests

2. **Use Postman** or **Insomnia**:
   - Import OpenAPI spec from `shared/contracts/api-spec.yaml`
   - All endpoints will be available with documentation

---

## Troubleshooting

### Backend Won't Start

**Error: `./gradlew: No such file or directory`**
```bash
cd backend
gradle wrapper --gradle-version 8.5
```

**Error: `MongoDB connection failed`**
```bash
# Check if MongoDB is running
docker compose ps

# If not running, start it
docker compose up -d

# Check logs for errors
docker compose logs mongodb
```

**Error: `Port 8080 already in use`**
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process (replace PID)
kill -9 <PID>
```

### Frontend Won't Start

**Error: `command not found: npm`**
```bash
# Install Node.js
brew install node@18

# Verify installation
node --version
npm --version
```

**Error: `Cannot find module`**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error: `Port 5173 already in use`**
```bash
# Find process using port 5173
lsof -i :5173

# Kill the process
kill -9 <PID>
```

### Docker Issues

**Error: `Cannot connect to Docker daemon`**
```bash
# Start Docker Desktop application
open -a Docker

# Wait 30 seconds for Docker to start
sleep 30

# Try again
docker compose up -d
```

**Error: `docker compose command not found`**
```bash
# Update Docker Desktop to latest version
# Or use older syntax:
docker-compose up -d
```

---

## Project Structure Overview

```
developer-customiser/
├── backend/                 # Kotlin + Ktor REST API
│   ├── src/main/kotlin/    # Application code
│   │   ├── models/         # Data models (Profile, Question)
│   │   ├── services/       # Business logic
│   │   ├── Application.kt  # Main entry point
│   │   └── Routing.kt      # API endpoints
│   ├── src/test/kotlin/    # Tests (to be implemented)
│   └── build.gradle.kts    # Dependencies
│
├── frontend/                # React + TypeScript SPA
│   ├── src/                # Application code
│   │   ├── components/     # UI components (to be implemented)
│   │   ├── pages/          # Page components (placeholders exist)
│   │   ├── providers/      # React Query provider
│   │   ├── App.tsx         # Router configuration
│   │   └── main.tsx        # Entry point
│   └── package.json        # Dependencies
│
├── shared/
│   └── contracts/          # OpenAPI specification
│
├── docker-compose.yml      # MongoDB configuration
├── CLAUDE.md              # Development guidelines
├── PROJECT_STATUS.md      # Implementation status
└── SETUP_GUIDE.md         # This file
```

---

## Next Steps

1. **Verify Setup**: Run all verification steps above
2. **Read Documentation**:
   - `PROJECT_STATUS.md` - Current implementation status
   - `CLAUDE.md` - Development guidelines and code examples
   - `specs/001-how-to-work/quickstart.md` - Feature validation guide

3. **Continue Implementation**:
   - See `specs/001-how-to-work/tasks.md` for remaining tasks
   - Frontend components (T024-T034) are the next priority
   - Contract tests (T011-T015) can be done in parallel

4. **Get Help**:
   - Backend issues: Check `backend/README.md`
   - Frontend issues: Check `frontend/README.md`
   - API reference: `shared/contracts/api-spec.yaml`

---

## Quick Reference

### Useful Commands

```bash
# Start everything
docker compose up -d                    # MongoDB
cd backend && ./gradlew run &          # Backend (background)
cd frontend && npm run dev             # Frontend

# Stop everything
pkill -f "gradlew run"                 # Stop backend
# Ctrl+C in frontend terminal          # Stop frontend
docker compose down                    # Stop MongoDB

# Check status
docker compose ps                      # MongoDB status
lsof -i :8080                          # Backend status
lsof -i :5173                          # Frontend status

# View logs
docker compose logs -f mongodb         # MongoDB logs
# Backend logs appear in gradlew terminal
# Frontend logs appear in npm dev terminal
```

### Important URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Health Check: http://localhost:8080/health
- Questions API: http://localhost:8080/api/questions
- MongoDB: mongodb://localhost:27017/howtoworkwithme

---

**You're all set!** 🎉

The foundation is complete. Follow the steps above to get the application running, then continue with the remaining frontend implementation tasks.

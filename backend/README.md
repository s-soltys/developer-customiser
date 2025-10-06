# How to Work With Me - Backend (Kotlin + Ktor)

## Prerequisites

1. **Install JDK 17 or higher**:
   ```bash
   # macOS (using Homebrew)
   brew install openjdk@17

   # Verify installation
   java --version
   ```

2. **Install Gradle** (optional - gradlew will download it automatically):
   ```bash
   # macOS (using Homebrew)
   brew install gradle

   # Verify installation
   gradle --version
   ```

## Setup

1. **Generate Gradle Wrapper** (if not already present):
   ```bash
   cd backend
   gradle wrapper --gradle-version 8.5
   ```

2. **Build the project**:
   ```bash
   ./gradlew build
   ```

3. **Run the server**:
   ```bash
   ./gradlew run
   ```

   Server will start on `http://localhost:8080`

## Project Structure

```
backend/
├── src/
│   ├── main/kotlin/
│   │   ├── models/          # Data models (Profile, Question)
│   │   ├── services/        # Business logic
│   │   └── api/             # HTTP endpoints
│   └── test/kotlin/
│       ├── contract/        # API contract tests
│       ├── integration/     # Integration tests
│       └── unit/            # Unit tests
├── build.gradle.kts         # Dependencies and build configuration
└── settings.gradle.kts      # Project settings
```

## Dependencies

- **Ktor 2.3.7**: Web framework
- **KMongo 4.11.0**: MongoDB Kotlin driver
- **Kotest 5.8.0**: Testing framework
- **Kotlinx Serialization**: JSON serialization

## Development

### Running Tests
```bash
./gradlew test
```

### Clean Build
```bash
./gradlew clean build
```

### Run with Auto-reload
```bash
./gradlew run --continuous
```

## MongoDB Connection

The application connects to MongoDB at:
```
mongodb://localhost:27017/howtoworkwithme
```

Make sure MongoDB is running via Docker Compose:
```bash
docker compose up -d
```

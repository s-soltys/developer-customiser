# How to Work With Me - Frontend (React + TypeScript)

## Prerequisites

1. **Install Node.js 18+**:
   ```bash
   # macOS (using Homebrew)
   brew install node@18

   # Verify installation
   node --version  # Should be v18.x or higher
   npm --version
   ```

## Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

   Frontend will start on `http://localhost:5173`

3. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page-level route components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API client (React Query)
│   ├── providers/       # Context providers
│   ├── types/           # TypeScript type definitions
│   └── main.tsx         # Application entry point
├── tests/
│   ├── integration/     # E2E integration tests
│   └── unit/            # Component unit tests
└── public/              # Static assets
```

## Key Technologies

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool & dev server
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing
- **TanStack Query (React Query)**: Server state management
- **React Hook Form + Zod**: Form handling & validation
- **Vitest**: Testing framework

## Development Commands

### Run Tests
```bash
npm run test
```

### Lint Code
```bash
npm run lint
```

### Type Check
```bash
npx tsc --noEmit
```

## API Integration

The frontend connects to the backend API at:
```
http://localhost:8080
```

API requests to `/api/*` are automatically proxied through Vite config.

Make sure the backend server is running:
```bash
cd ../backend
./gradlew run
```

## Environment Variables

Create `.env` file for environment-specific configuration:
```
VITE_API_BASE_URL=http://localhost:8080
```

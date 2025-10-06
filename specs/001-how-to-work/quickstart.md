# Quickstart Guide
**Feature**: How to Work With Me App
**Purpose**: Validate the end-to-end user journey for creating and sharing profiles

---

## Prerequisites

### Required Software
- **Docker & Docker Compose** (for MongoDB)
- **Node.js 18+** and npm (for frontend)
- **JDK 17+** (for Kotlin backend)
- **Gradle 8+** (Kotlin build tool)

### Verify Installation
```bash
docker --version          # Should be 20.10+
docker-compose --version  # Should be 2.0+
node --version            # Should be v18+
java --version            # Should be 17+
gradle --version          # Should be 8+
```

---

## Environment Setup

### 1. Start MongoDB
```bash
# From repository root
docker-compose up -d

# Verify MongoDB is running
docker-compose ps
# Should show mongodb container as "Up"

# Check logs (optional)
docker-compose logs mongodb
```

### 2. Start Backend (Ktor + Kotlin)
```bash
# Navigate to backend directory
cd backend

# Download dependencies and run tests (first time will download Gradle wrapper)
./gradlew test

# Start the backend server
./gradlew run

# Server should start on http://localhost:8080
# Look for log: "Application started in X.XX seconds"
```

**Expected output**:
```
> Task :run
[main] INFO  Application - Responding at http://0.0.0.0:8080
[main] INFO  Application - Questions seeded: 18 questions loaded
```

### 3. Start Frontend (React + Vite)
```bash
# Open new terminal, navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Frontend should start on http://localhost:5173
```

**Expected output**:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## End-to-End User Journey Test

### Scenario 1: Create New Profile

**Steps**:
1. Open browser to `http://localhost:5173`
2. You should see the **Name Entry** screen
3. Enter your name (e.g., "Alex Chen")
4. Click "Continue" or press Enter

**Expected**:
- ✅ Name field validates (cannot be empty)
- ✅ After submission, navigates to first category screen
- ✅ Progress indicator shows "1 of 6" categories

### Scenario 2: Complete Questionnaire

**Steps**:
1. **Communication Preferences** screen appears
2. Answer all 3 questions:
   - Select preferred channel (dropdown/radio)
   - Type response time expectations (text input)
   - Type meeting preferences (text input)
3. Click "Next" to advance

**Expected**:
- ✅ Cannot advance until all questions answered
- ✅ Progress indicator updates to "2 of 6"

**Repeat for remaining categories**:
4. **Work Style** (3 questions)
5. **Feedback Style** (2 questions)
6. **Strengths & Growing Areas** (2 questions)
7. **Pet Peeves & Energizers** (2 questions)
8. **Personal Context** (2 questions)

**Navigation**:
- ✅ Can click "Back" to edit previous category
- ✅ Responses persist when navigating back/forward
- ✅ Progress bar accurately reflects position

### Scenario 3: View Summary & Generate Link

**Steps**:
1. After completing all 6 categories, click "Finish"
2. **Summary Card** screen appears
3. Review all your responses organized by category
4. Click "Generate Shareable Link"

**Expected**:
- ✅ All responses displayed correctly
- ✅ Shareable link appears (format: `http://localhost:5173/share/[UUID]`)
- ✅ "Copy Link" button copies to clipboard
- ✅ Toast/notification confirms "Link copied!"

**Example link**:
```
http://localhost:5173/share/a3f2c5d8-9b1e-4f7a-8c2d-1e3b4f5a6b7c
```

### Scenario 4: View Shared Profile

**Steps**:
1. Copy the shareable link from Scenario 3
2. Open new **incognito/private browser window**
3. Paste and navigate to the shareable link

**Expected**:
- ✅ Profile loads without authentication
- ✅ Name displayed prominently
- ✅ All categories and responses visible
- ✅ Formatted as readable card/profile view
- ✅ No edit functionality visible (read-only)

### Scenario 5: Edit Existing Profile

**Steps**:
1. Return to original browser window (where you created profile)
2. Click "Edit Profile" button on summary screen
3. Navigate to any category
4. Change one or more responses
5. Click "Finish" again

**Expected**:
- ✅ Navigate back through questionnaire
- ✅ Previous answers pre-populated
- ✅ Can modify any answer
- ✅ Summary updates with new responses
- ✅ Shareable link remains the same (or updates if regenerated)
- ✅ Shared profile reflects edits when reloaded

### Scenario 6: Abandon Mid-Session (Single-Session Validation)

**Steps**:
1. Create new profile with different name
2. Complete 2-3 categories
3. Close browser tab entirely
4. Reopen `http://localhost:5173`

**Expected**:
- ✅ Back at Name Entry screen (no saved progress)
- ✅ Previous incomplete session discarded
- ✅ Must start over from beginning

---

## API Contract Validation

### Test Endpoints Directly

```bash
# Get all questions
curl http://localhost:8080/api/questions | jq

# Create profile
curl -X POST http://localhost:8080/api/profiles \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User"}' | jq

# Expected response:
# {
#   "id": "...",
#   "name": "Test User",
#   "shareableId": "uuid-here",
#   "createdAt": "2025-10-06T...",
#   "updatedAt": "2025-10-06T...",
#   "responses": {}
# }

# Save the id and shareableId from response for next tests
export PROFILE_ID="<id from response>"
export SHAREABLE_ID="<shareableId from response>"

# Update profile with responses
curl -X PUT http://localhost:8080/api/profiles/$PROFILE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "responses": {
      "communication": {
        "preferred-channel": {
          "value": "Slack",
          "answeredAt": "2025-10-06T10:31:00Z"
        }
      }
    }
  }' | jq

# Get profile by shareable ID (public access)
curl http://localhost:8080/api/profiles/share/$SHAREABLE_ID | jq

# Verify response includes updated data
```

---

## Validation Checklist

### Functional Requirements
- [ ] **FR-001**: Name entry prompt displayed first
- [ ] **FR-002**: Empty name validation works
- [ ] **FR-004**: All 6 categories present with correct names
- [ ] **FR-005**: One category screen at a time
- [ ] **FR-006**: Can navigate backward and forward
- [ ] **FR-008**: Cannot access summary until all complete
- [ ] **FR-009**: Mixed question types (text + choice) render correctly
- [ ] **FR-024**: Shareable link generated after completion
- [ ] **FR-026**: Public link viewable without authentication
- [ ] **FR-027**: Profile formatted as readable card
- [ ] **FR-029**: Can edit profile after creation
- [ ] **FR-030**: Progress indicator visible and accurate
- [ ] **FR-033**: No progress saved between sessions
- [ ] **FR-034**: Responsive on mobile viewport (test at 375px width)

### User Experience
- [ ] All text readable and properly formatted
- [ ] Form inputs have appropriate validation
- [ ] Error messages clear and helpful
- [ ] Loading states shown during API calls
- [ ] Transitions smooth between screens
- [ ] Mobile layout doesn't break (test viewport resize)
- [ ] Keyboard navigation works (Tab, Enter)

### API Contracts
- [ ] GET /api/questions returns 18+ questions
- [ ] POST /api/profiles creates unique shareableId
- [ ] PUT /api/profiles validates question IDs
- [ ] PUT /api/profiles validates response value types
- [ ] GET /api/profiles/share/:id returns 404 for invalid ID
- [ ] CORS allows localhost:5173 origin

---

## Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB container is running
docker-compose ps

# Restart MongoDB
docker-compose restart mongodb

# Check MongoDB logs
docker-compose logs -f mongodb
```

### Backend Won't Start
```bash
# Check port 8080 is not in use
lsof -i :8080

# Clean build and retry
cd backend
./gradlew clean build
./gradlew run
```

### Frontend Build Errors
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### CORS Errors in Browser
- Verify backend CORS configuration includes `http://localhost:5173`
- Check backend logs for CORS-related errors
- Ensure backend is running on port 8080

---

## Success Criteria

The quickstart is successful when:

1. ✅ All 6 user journey scenarios pass
2. ✅ API contract validation tests return expected responses
3. ✅ All validation checklist items checked
4. ✅ No console errors in browser DevTools
5. ✅ No errors in backend logs
6. ✅ Shared profile accessible from different browser/device

**Estimated Time**: 15-20 minutes for complete validation

---

## Next Steps

After quickstart validation passes:

1. **Contract Tests**: Write automated tests for API endpoints
2. **Integration Tests**: Automate user journey scenarios
3. **Unit Tests**: Test individual components and services
4. **Deployment**: Configure production environment

See `tasks.md` for detailed implementation task breakdown.

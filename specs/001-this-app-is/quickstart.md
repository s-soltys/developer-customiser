# Quickstart Guide: Manager Mindset Feedback Tool

**Feature**: 001-this-app-is
**Date**: 2025-10-06
**Audience**: Developers setting up and testing the application

---

## Prerequisites

### Required Software
- **Java Development Kit (JDK) 17+**
  - macOS: `brew install openjdk@17`
  - Verify: `java -version`

- **Node.js 18+**
  - macOS: `brew install node@18`
  - Verify: `node -v` and `npm -v`

- **MongoDB 5.0+**
  - Option A (Local): `brew install mongodb-community`
  - Option B (Docker): `docker run -d -p 27017:27017 --name mongodb mongo:7`
  - Option C (Cloud): [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier
  - Verify: `mongosh` or test connection

### Optional Tools
- **IntelliJ IDEA Community Edition** (recommended for Kotlin development)
- **MongoDB Compass** (GUI for database inspection)

---

## Initial Setup

### 1. Clone Repository and Install Dependencies

```bash
# Navigate to project root
cd /Users/szymon/Documents/developer-customiser

# Backend setup
cd backend
./gradlew build  # Downloads dependencies, compiles, runs tests
cd ..

# Frontend setup
cd frontend
npm install
cd ..
```

### 2. Configure MongoDB Connection

**backend/src/main/resources/application.conf**:
```hocon
mongodb {
  uri = "mongodb://localhost:27017"
  database = "mindset_feedback"
}

server {
  port = 8080
  host = "0.0.0.0"
}
```

For Docker MongoDB:
```hocon
mongodb.uri = "mongodb://localhost:27017"
```

For MongoDB Atlas:
```hocon
mongodb.uri = "mongodb+srv://<username>:<password>@cluster.mongodb.net/mindset_feedback?retryWrites=true&w=majority"
```

### 3. Verify MongoDB Running

```bash
# Local installation
brew services list | grep mongodb
# Should show: mongodb-community started

# Docker
docker ps | grep mongo
# Should show running container

# Test connection
mongosh mongodb://localhost:27017
# Should connect successfully
```

---

## Running the Application

### Start Backend (Port 8080)

```bash
cd backend
./gradlew run

# Expected output:
# [main] INFO Application - Responding at http://0.0.0.0:8080
# [main] INFO Application - MongoDB connected to: mindset_feedback
```

**Verify Backend**:
```bash
curl http://localhost:8080/api/traits
# Should return trait questions JSON
```

### Start Frontend (Port 3000)

```bash
cd frontend
npm run dev

# Expected output:
# VITE v5.x.x ready in xxx ms
# ➜  Local:   http://localhost:3000/
# ➜  Network: http://192.168.x.x:3000/
```

**Verify Frontend**:
Open browser to `http://localhost:3000` - should see create profile page.

---

## End-to-End User Flow Testing

### Test Scenario 1: Create Profile (FR-001, FR-002)

**Action**:
1. Open `http://localhost:3000`
2. Click "Create New Profile" button

**Expected Result**:
- Success message displayed
- Two links shown:
  - **Feedback Link**: `http://localhost:3000/feedback/{feedbackLinkId}`
  - **Admin Link**: `http://localhost:3000/admin/{adminLinkId}`
- Copy both links for next steps

**API Validation**:
```bash
# Check profile was created in MongoDB
mongosh mongodb://localhost:27017/mindset_feedback
> db.profiles.findOne()
# Should show profile document with both link IDs
```

---

### Test Scenario 2: Submit Feedback (FR-003, FR-004, FR-005, FR-006, FR-007)

**Action**:
1. Open Feedback Link (from Test Scenario 1)
2. Verify four trait questions displayed:
   - Takes on risk vs. Risk averse
   - Goofy vs. Professional
   - Candid vs. Diplomatic
   - Focused on leadership vs. Focused on individual contribution
3. Select values for all four traits using spinners (1-5)
4. Enter name (optional): "Test User"
5. Click "Submit Feedback"

**Expected Result**:
- Success screen displayed with message
- Radar chart shown with submitted data point
- Chart displays all four traits on axes

**Validation**:
```bash
# Verify feedback stored
mongosh mongodb://localhost:27017/mindset_feedback
> db.profiles.findOne({}, {responses: 1})
# Should show responses array with one entry
```

**Edge Case - Incomplete Submission** (FR-005):
- Leave one trait unselected
- Click "Submit Feedback"
- Expected: Error message "All traits must be rated"
- Submit button disabled until all traits selected

---

### Test Scenario 3: View Aggregate Results (FR-008, FR-009)

**Action**:
1. Submit feedback as "User 1" (values: 4, 2, 5, 3)
2. Open same Feedback Link in incognito/private window
3. Submit feedback as "User 2" (values: 2, 4, 1, 5)

**Expected Result**:
- Success screen shows updated radar chart
- Chart displays average of both submissions:
  - Risk taking: (4+2)/2 = 3.0
  - Goofy/Professional: (2+4)/2 = 3.0
  - Candid/Diplomatic: (5+1)/2 = 3.0
  - Leadership/IC: (3+5)/2 = 4.0

**API Validation**:
```bash
curl http://localhost:8080/api/profiles/{feedbackLinkId}/aggregate
# Should return aggregates with counts and averages
```

---

### Test Scenario 4: Resubmit Feedback (FR-013)

**Action**:
1. Use same browser as "User 1" (from Test Scenario 3)
2. Open Feedback Link again
3. Submit new values: 5, 5, 5, 5
4. View success screen

**Expected Result**:
- New submission overwrites previous "User 1" response
- Aggregate now shows:
  - Risk taking: (5+2)/2 = 3.5
  - Goofy/Professional: (5+4)/2 = 4.5
  - Candid/Diplomatic: (5+1)/2 = 3.0
  - Leadership/IC: (5+5)/2 = 5.0
- Total response count remains 2 (not 3)

**Validation**:
```bash
mongosh mongodb://localhost:27017/mindset_feedback
> db.profiles.findOne({}, {responses: 1})
# Should show 2 responses, User 1's traits updated
```

---

### Test Scenario 5: Manager Results Dashboard (FR-011, FR-014, FR-015)

**Action**:
1. Open Admin Link (from Test Scenario 1)
2. View dashboard

**Expected Result**:
- **Aggregate Section**:
  - Radar chart showing average values
  - Total responses count: 2
- **Individual Responses Section**:
  - List of all responses with:
    - Respondent name: "User 1", "User 2"
    - Submission timestamp
    - Individual trait values
  - Sortable by timestamp or name

**API Validation**:
```bash
curl http://localhost:8080/api/profiles/{adminLinkId}/results
# Should return both aggregates and individual responses arrays
```

---

### Test Scenario 6: Zero Responses Edge Case

**Action**:
1. Create new profile
2. Immediately open Admin Link (before any feedback submitted)

**Expected Result**:
- Dashboard shows "No responses yet"
- Radar chart empty or shows placeholder
- No errors or crashes

---

### Test Scenario 7: Link Sharing (FR-007 clarification)

**Action**:
1. Create profile
2. Click "Copy Feedback Link" button

**Expected Result**:
- Link copied to clipboard
- Toast notification: "Link copied!"
- Can paste link in browser and access feedback form

---

## Manual Testing Checklist

### Profile Creation
- [ ] Create profile button works
- [ ] Two unique links generated
- [ ] Links are copyable
- [ ] No authentication required

### Feedback Submission
- [ ] All four traits displayed
- [ ] Spinners show values 1-5
- [ ] Cannot submit with incomplete ratings
- [ ] Name field optional (defaults to "Anonymous")
- [ ] Success screen shows after submission
- [ ] Radar chart displays correctly

### Aggregate Results
- [ ] Radar chart updates with new submissions
- [ ] Chart shows correct averages
- [ ] Works with 0, 1, 2, 10+ responses
- [ ] Axes labeled correctly

### Resubmission
- [ ] Same browser overwrites previous response
- [ ] Total count doesn't increment on resubmission
- [ ] Different browsers create separate responses

### Manager Dashboard
- [ ] Admin link works
- [ ] Aggregate section displays
- [ ] Individual responses listed
- [ ] Names and timestamps shown
- [ ] No feedback link ID exposed

### Data Persistence (FR-012)
- [ ] Restart backend → data persists
- [ ] No automatic deletion
- [ ] Old profiles remain accessible

---

## Troubleshooting

### Backend won't start
**Issue**: "Address already in use: bind"
**Solution**: Port 8080 in use. Kill process or change port in `application.conf`

**Issue**: "MongoDB connection timeout"
**Solution**:
- Verify MongoDB running: `brew services list | grep mongodb`
- Check connection string in `application.conf`
- Test: `mongosh mongodb://localhost:27017`

### Frontend won't start
**Issue**: "Module not found" errors
**Solution**: Delete `node_modules` and `package-lock.json`, run `npm install`

**Issue**: "Network error" when calling API
**Solution**:
- Check backend running on port 8080
- Verify CORS enabled in backend
- Check browser console for errors

### Feedback submission fails
**Issue**: 400 Bad Request "Invalid traits"
**Solution**:
- Verify all four traits have values
- Check trait IDs match backend config
- Inspect request payload in browser DevTools

### Radar chart not displaying
**Issue**: Chart shows blank
**Solution**:
- Check browser console for errors
- Verify Recharts library installed: `npm list recharts`
- Ensure aggregate data has correct shape (see API spec)

---

## Database Inspection Commands

### View All Profiles
```bash
mongosh mongodb://localhost:27017/mindset_feedback
> db.profiles.find().pretty()
```

### Count Responses for Profile
```javascript
> db.profiles.aggregate([
    { $match: { feedbackLinkId: "f_YOUR_LINK_ID" } },
    { $project: { responseCount: { $size: "$responses" } } }
  ])
```

### View Aggregate Statistics
```javascript
> db.profiles.aggregate([
    { $match: { feedbackLinkId: "f_YOUR_LINK_ID" } },
    { $unwind: "$responses" },
    { $unwind: "$responses.traits" },
    { $group: {
        _id: "$responses.traits.traitId",
        average: { $avg: "$responses.traits.value" },
        count: { $sum: 1 }
      }
    }
  ])
```

### Reset Database (Development Only)
```bash
mongosh mongodb://localhost:27017/mindset_feedback
> db.profiles.deleteMany({})
> show collections  # Should show empty or no profiles collection
```

---

## Performance Validation

### Expected Response Times (MVP)
- `POST /api/profiles`: < 100ms
- `POST /api/profiles/{id}/responses`: < 200ms
- `GET /api/profiles/{id}/aggregate`: < 300ms (with 100 responses)
- `GET /api/profiles/{id}/results`: < 500ms (with 100 responses)

### Load Testing (Optional)
```bash
# Install Apache Bench
brew install httpd

# Test profile creation (10 requests, 2 concurrent)
ab -n 10 -c 2 -p profile.json -T application/json http://localhost:8080/api/profiles

# Test feedback submission
ab -n 50 -c 5 -p feedback.json -T application/json http://localhost:8080/api/profiles/{id}/responses
```

**Note**: MVP has no performance requirements, but basic responsiveness expected.

---

## Next Steps After Quickstart

1. **Run Contract Tests**:
   ```bash
   cd backend
   ./gradlew test --tests "*ContractTest"
   ```

2. **Run Integration Tests**:
   ```bash
   cd backend
   ./gradlew test --tests "*IntegrationTest"

   cd frontend
   npm run test:integration
   ```

3. **Review Generated Artifacts**:
   - `specs/001-this-app-is/research.md` - Technology decisions
   - `specs/001-this-app-is/data-model.md` - Database schema
   - `specs/001-this-app-is/contracts/api-spec.yaml` - API contracts

4. **Proceed to Implementation**:
   - Run `/tasks` command to generate ordered task list
   - Follow TDD approach: tests first, then implementation

---

## Support Resources

### Documentation
- [Ktor Documentation](https://ktor.io/docs/)
- [KMongo Documentation](https://litote.org/kmongo/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Recharts Documentation](https://recharts.org/)

### Code Examples
- Ktor REST API: `backend/src/main/kotlin/api/`
- MongoDB queries: `backend/src/main/kotlin/repositories/`
- React components: `frontend/src/components/`
- API client: `frontend/src/services/`

### Getting Help
- Check API contract: `specs/001-this-app-is/contracts/api-spec.yaml`
- Review data model: `specs/001-this-app-is/data-model.md`
- Feature requirements: `specs/001-this-app-is/spec.md`

---

**Last Updated**: 2025-10-06
**Status**: Ready for implementation phase

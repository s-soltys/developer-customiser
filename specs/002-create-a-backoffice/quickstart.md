# Quickstart Guide: Backoffice Question Configuration

**Feature**: 002-create-a-backoffice
**Purpose**: Validate the backoffice admin interface end-to-end
**Estimated Time**: 10-15 minutes

---

## Prerequisites

- ✅ Backend and frontend implemented and tested
- ✅ MongoDB running (via `docker-compose up -d`)
- ✅ Database seeded with initial categories and questions
- ✅ `ADMIN_PASSWORD` environment variable set

---

## Step 1: Environment Setup

### 1.1 Set Admin Password
```bash
export ADMIN_PASSWORD="demo-admin-2025"
```

### 1.2 Verify MongoDB is Running
```bash
docker-compose ps
# Should show mongodb container as running
```

### 1.3 Start Backend
```bash
cd backend
./gradlew run
```

Expected output:
```
[main] INFO  Application - Responding at http://0.0.0.0:8080
```

### 1.4 Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.0.8  ready in 523 ms
➜  Local:   http://localhost:5173/
```

---

## Step 2: Access Backoffice

### 2.1 Navigate to Admin Page
Open browser: **http://localhost:5173/admin**

**Expected**: Admin login prompt (password input field)

### 2.2 Authenticate
Enter password: `demo-admin-2025` (from environment variable)

**Expected**: Redirect to admin dashboard showing:
- Navigation: "Categories" | "Questions" tabs
- Empty state or list of seeded categories

---

## Step 3: Create a New Category

### 3.1 Navigate to Categories Tab
Click "Categories" in admin nav

**Expected**: List of existing categories (Communication, Work Style, etc.)

### 3.2 Add New Category
1. Click "Add Category" button
2. Fill form:
   - **Name**: "Team Dynamics"
   - **Order**: 6 (after existing categories)
3. Click "Save"

**Expected**:
- Success message: "Category created successfully"
- New category appears in list at position 6
- Category card shows: "Team Dynamics" with edit/delete buttons

### 3.3 Verify Category Exists
```bash
# In MongoDB shell or Compass
db.categories.find({ name: "Team Dynamics" })
```

**Expected**: One document with `active: true`, `order: 6`

---

## Step 4: Create a Question

### 4.1 Navigate to Questions Tab
Click "Questions" in admin nav

**Expected**: List of existing questions grouped by category

### 4.2 Add New Question
1. Click "Add Question" button
2. Fill form:
   - **Text**: "How do you approach team conflicts?"
   - **Category**: Select "Team Dynamics" (from dropdown)
   - **Order**: 0 (first question in category)
3. Click "Save"

**Expected**:
- Success message: "Question created successfully"
- New question appears under "Team Dynamics" section
- Question shows: text, category badge, edit/delete buttons

### 4.3 Verify Question Exists
```bash
# In MongoDB shell or Compass
db.questions.find({ text: /team conflicts/ })
```

**Expected**: One document with `categoryId` matching "Team Dynamics", `active: true`, `order: 0`

---

## Step 5: Reorder Questions

### 5.1 Navigate to Questions in Category
Filter questions by category: "Communication"

**Expected**: List of Communication questions in current order

### 5.2 Drag and Drop to Reorder
1. Grab second question in list (using drag handle icon)
2. Drag to first position
3. Drop

**Expected**:
- Optimistic UI update: question moves to first position immediately
- Success message: "Question reordered successfully"
- Order persists on page refresh

### 5.3 Verify Order in Database
```bash
# In MongoDB shell or Compass
db.questions.find({ categoryId: ObjectId("...communication-id...") }).sort({ order: 1 })
```

**Expected**: Questions returned in new order (0, 1, 2, ...)

---

## Step 6: Verify in Public Questionnaire

### 6.1 Navigate to Public Questionnaire
Open new browser tab: **http://localhost:5173/**

### 6.2 Start New Profile
1. Enter name: "Test User"
2. Click "Continue"

**Expected**: Redirect to first category (Communication)

### 6.3 Verify New Category Appears
Navigate through categories (click "Next" button)

**Expected**:
- "Team Dynamics" appears as category option (order 6)
- Question "How do you approach team conflicts?" appears when selecting "Team Dynamics"

### 6.4 Answer the New Question
1. Navigate to "Team Dynamics" category
2. Enter response: "I prefer open dialogue and mediation"
3. Click "Save"

**Expected**:
- Response saved successfully
- Progress indicator shows category completed

---

## Step 7: Soft Delete Question

### 7.1 Return to Admin Dashboard
Switch back to admin tab: **http://localhost:5173/admin**

### 7.2 Delete a Question
1. Navigate to "Questions" tab
2. Find question: "How do you approach team conflicts?"
3. Click "Delete" button
4. Confirm deletion in modal

**Expected**:
- Success message: "Question deleted successfully"
- Question card shows grayed out with "(Inactive)" badge
- Question still visible in admin list (not hard deleted)

### 7.3 Verify Soft Delete in Database
```bash
# In MongoDB shell or Compass
db.questions.find({ text: /team conflicts/ })
```

**Expected**: Document exists with `active: false`, `updatedAt` timestamp recent

---

## Step 8: Verify Response Preservation

### 8.1 View Public Profile
1. Navigate back to public questionnaire tab
2. Complete profile (answer remaining questions)
3. View profile (or copy shareable link)

**Expected**:
- Profile displays response to "How do you approach team conflicts?" (soft-deleted question)
- Response text: "I prefer open dialogue and mediation"
- Question text still visible in profile (even though inactive)

### 8.2 Start New Profile
1. Open incognito window: **http://localhost:5173/**
2. Enter name: "New User"
3. Navigate through questionnaire

**Expected**:
- "Team Dynamics" category appears
- Question "How do you approach team conflicts?" does NOT appear (soft deleted)
- Other questions in category (if any) still visible

---

## Step 9: Category Deletion with Constraint

### 9.1 Attempt to Delete Category with Active Questions
1. Return to admin dashboard: "Categories" tab
2. Find "Communication" category (has active questions)
3. Click "Delete" button

**Expected**:
- Error message: "Cannot delete category with X active questions"
- Modal shows: "Delete all questions in this category?" with "Cancel" | "Delete All" buttons

### 9.2 Cascade Delete
1. Click "Delete All" button in modal
2. Confirm cascade deletion

**Expected**:
- Success message: "Category and X questions deleted successfully"
- Category shows "(Inactive)" badge in admin list
- All questions in category show "(Inactive)" badge

### 9.3 Verify Cascade in Database
```bash
# In MongoDB shell or Compass
db.categories.find({ name: "Communication" })
db.questions.find({ categoryId: ObjectId("...communication-id...") })
```

**Expected**:
- Category has `active: false`
- All questions in category have `active: false`
- No documents hard-deleted

---

## Step 10: Edit Category

### 10.1 Rename Category
1. Navigate to "Categories" tab
2. Find "Team Dynamics" category
3. Click "Edit" button
4. Change name to: "Collaboration & Team Dynamics"
5. Click "Save"

**Expected**:
- Success message: "Category updated successfully"
- Category name updates in list
- Questions under category show new name

### 10.2 Verify Public Questionnaire Updates
1. Return to public questionnaire tab
2. Refresh page

**Expected**:
- Category navigation shows: "Collaboration & Team Dynamics"
- No specific latency requirement (eventual consistency acceptable)

---

## Step 11: Logout

### 11.1 Clear Session
Click "Logout" button in admin nav (or close browser tab)

### 11.2 Verify Auth Protection
1. Navigate to: **http://localhost:5173/admin**

**Expected**:
- Redirect to login page (password prompt)
- Cannot access admin dashboard without authentication

---

## Success Criteria

✅ **Authentication**: Admin password successfully restricts backoffice access

✅ **Category Management**: Create, update, soft delete, rename categories

✅ **Question Management**: Create, update, soft delete questions

✅ **Reordering**: Drag-and-drop reorders questions within category

✅ **Soft Delete Behavior**:
- Inactive questions/categories hidden from new questionnaires
- Existing user responses preserved and viewable

✅ **Cascade Delete**: Deleting category with questions soft-deletes all questions

✅ **Public Questionnaire Integration**:
- New categories/questions appear in public questionnaire
- Edited category names reflected
- Soft-deleted questions excluded from new profiles

✅ **Data Integrity**:
- All operations persist to MongoDB
- No hard deletes (preserve user responses)
- Order values maintained correctly

---

## Troubleshooting

### Issue: "Invalid admin password" Error
**Solution**: Verify `ADMIN_PASSWORD` environment variable is set and matches input

### Issue: Category Delete Shows No Error (But Nothing Happens)
**Solution**: Check browser console for network errors; verify backend logs for validation messages

### Issue: Drag-and-Drop Not Working
**Solution**: Ensure @dnd-kit libraries installed (`npm install @dnd-kit/core @dnd-kit/sortable`)

### Issue: Questions Not Appearing in Public Questionnaire
**Solution**:
1. Check question `active` field in database (should be `true`)
2. Verify category `active` field is `true`
3. Refresh frontend (clear cache if needed)

### Issue: MongoDB Connection Error
**Solution**: Run `docker-compose up -d` to start MongoDB container

---

## Cleanup (After Testing)

```bash
# Stop backend (Ctrl+C in backend terminal)
# Stop frontend (Ctrl+C in frontend terminal)

# Stop MongoDB
docker-compose down

# Clear test data (optional)
docker-compose down -v  # Removes volumes (deletes database)
```

---

**Quickstart Status**: ✅ Complete
**Next**: Execute quickstart to validate implementation

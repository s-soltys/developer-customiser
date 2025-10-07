# Technical Research: Backoffice Question Configuration

**Feature**: 002-create-a-backoffice
**Date**: 2025-10-07
**Purpose**: Research technical approaches for admin interface with authentication, CRUD operations, and drag-and-drop reordering

---

## 1. Authentication Strategy

### Decision
Use Ktor's built-in authentication plugin with a custom `BasicAuthenticationProvider` configured to validate against an environment variable password.

### Rationale
- **Simplicity**: Single shared password stored in environment variable (no database needed)
- **Ktor native**: Leverages existing `ktor-server-auth` plugin, well-documented pattern
- **Session-less**: Stateless authentication via HTTP Basic Auth or custom header
- **Environment-based**: Password configured via `ADMIN_PASSWORD` env var, follows 12-factor principles

### Implementation Approach
```kotlin
install(Authentication) {
    basic("admin-auth") {
        realm = "Backoffice"
        validate { credentials ->
            val expectedPassword = System.getenv("ADMIN_PASSWORD") ?: "change-me"
            if (credentials.password == expectedPassword) {
                UserIdPrincipal("admin")
            } else null
        }
    }
}

routing {
    authenticate("admin-auth") {
        route("/api/admin") {
            // Admin endpoints here
        }
    }
}
```

### Alternatives Considered
- **JWT tokens**: Rejected - adds unnecessary complexity for single-user scenario
- **OAuth/SSO**: Rejected - out of scope for MVP, no identity provider required
- **Custom middleware**: Rejected - Ktor's authentication plugin is cleaner and testable

### References
- [Ktor Authentication Documentation](https://ktor.io/docs/authentication.html)
- [Basic Authentication](https://ktor.io/docs/basic.html)

---

## 2. Question Management API Design

### Decision
RESTful API with separate endpoints for questions and categories, using soft delete pattern with `active` boolean field.

### Rationale
- **REST conventions**: CRUD operations map cleanly to HTTP verbs (GET, POST, PUT, DELETE)
- **Soft delete**: Preserves referential integrity for existing user responses (aligns with FR-011)
- **Separation of concerns**: Questions and categories as independent resources with relationships
- **Filtering**: `GET /api/questions` filters by `active=true` for public questionnaire

### API Endpoints

#### Categories
- `GET /api/admin/categories` - List all categories (including inactive)
- `POST /api/admin/categories` - Create new category
- `PUT /api/admin/categories/:id` - Update category (name, order)
- `DELETE /api/admin/categories/:id` - Soft delete (set `active=false`)

#### Questions
- `GET /api/admin/questions` - List all questions (including inactive)
- `POST /api/admin/questions` - Create new question
- `PUT /api/admin/questions/:id` - Update question (text, categoryId, order)
- `DELETE /api/admin/questions/:id` - Soft delete (set `active=false`)

#### Public Endpoint Update
- `GET /api/questions` - Modified to filter `active=true` questions and categories

### Data Patterns
```kotlin
data class Question(
    @BsonId val id: ObjectId = ObjectId(),
    val text: String,
    val categoryId: ObjectId,
    val order: Int,
    val active: Boolean = true,
    val createdAt: Instant,
    val updatedAt: Instant
)

data class Category(
    @BsonId val id: ObjectId = ObjectId(),
    val name: String,
    val order: Int,
    val active: Boolean = true,
    val createdAt: Instant,
    val updatedAt: Instant
)
```

### Soft Delete Strategy
- Set `active = false` instead of removing documents
- Public API filters: `collection.find(Question::active eq true)`
- Admin API shows all: `collection.find()` (no filter)
- User responses reference question IDs; soft-deleted questions remain viewable in profiles

### Alternatives Considered
- **Hard delete**: Rejected - violates FR-011 (preserve user responses)
- **GraphQL**: Rejected - adds complexity, REST sufficient for simple CRUD
- **Combined endpoint**: Rejected - mixing questions and categories reduces clarity

### References
- [REST API Design Best Practices](https://restfulapi.net/)
- [KMongo Query Documentation](https://litote.org/kmongo/quick-start/)

---

## 3. Drag-and-Drop Reordering

### Decision
Use `@dnd-kit/core` + `@dnd-kit/sortable` for React drag-and-drop, with optimistic updates via React Query.

### Rationale
- **Modern**: @dnd-kit is actively maintained, TypeScript-first, accessible (ARIA support)
- **Lightweight**: Smaller bundle than react-beautiful-dnd (~20KB vs ~50KB)
- **React Query integration**: Optimistic mutation pattern handles UI updates before server confirmation
- **Accessibility**: Built-in keyboard navigation and screen reader support

### Implementation Approach

#### Frontend (React)
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

function QuestionList({ categoryId }: { categoryId: string }) {
  const { data: questions } = useQuestions(categoryId);
  const reorderMutation = useReorderQuestions();

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id);
      const newIndex = questions.findIndex(q => q.id === over.id);

      // Optimistic update
      reorderMutation.mutate({ questionId: active.id, newOrder: newIndex });
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
        {questions.map(q => <SortableQuestionItem key={q.id} question={q} />)}
      </SortableContext>
    </DndContext>
  );
}
```

#### Backend (Kotlin)
```kotlin
// PUT /api/admin/questions/:id/reorder
suspend fun reorderQuestion(id: String, newOrder: Int) {
    val question = questionCollection.findOneById(ObjectId(id)) ?: throw NotFoundException()

    // Shift other questions in same category
    questionCollection.updateMany(
        and(
            Question::categoryId eq question.categoryId,
            Question::order gte newOrder
        ),
        inc(Question::order, 1)
    )

    // Update target question
    questionCollection.updateOneById(
        ObjectId(id),
        set(Question::order, newOrder)
    )
}
```

### Order Persistence
- Store `order` as integer field (0-indexed within category)
- Reordering operation: shift affected items, then update target
- React Query optimistic update: reorder locally, rollback on error

### Alternatives Considered
- **react-beautiful-dnd**: Rejected - larger bundle, deprecated in favor of dnd-kit
- **Manual drag handlers**: Rejected - reinventing the wheel, accessibility concerns
- **react-dnd**: Rejected - more complex API, overkill for simple vertical lists

### References
- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [React Query Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)

---

## 4. Category Deletion Constraints

### Decision
Prevent hard deletion of categories containing active questions. Soft delete allowed; orphaned questions handled with cascading soft delete.

### Rationale
- **Data integrity**: Prevents broken references between questions and categories
- **User clarity**: Admin sees error if trying to delete non-empty category
- **Cascade option**: Deleting category soft-deletes all its questions (preserves responses per FR-011)

### Deletion Rules

#### Rule 1: Cannot Delete Category with Active Questions
```kotlin
suspend fun deleteCategory(id: ObjectId) {
    val activeQuestionCount = questionCollection.countDocuments(
        and(
            Question::categoryId eq id,
            Question::active eq true
        )
    )

    if (activeQuestionCount > 0) {
        throw ConflictException("Cannot delete category with $activeQuestionCount active questions")
    }

    // Soft delete category
    categoryCollection.updateOneById(id, set(Category::active, false))
}
```

#### Rule 2: Cascade Soft Delete (Optional Enhancement)
Add query parameter: `DELETE /api/admin/categories/:id?cascade=true`
```kotlin
if (cascade) {
    // Soft delete all questions in category
    questionCollection.updateMany(
        Question::categoryId eq id,
        set(Question::active, false)
    )
}
categoryCollection.updateOneById(id, set(Category::active, false))
```

### UI Flow
1. Admin clicks delete on category
2. If category has active questions:
   - Show modal: "This category has X active questions. Delete questions too?"
   - Options: "Cancel" | "Delete All"
3. If cascade selected, soft-delete category + questions
4. If no active questions, soft-delete category immediately

### Alternatives Considered
- **Allow orphans**: Rejected - questions without categories break UI
- **Reassign to default category**: Rejected - implicit behavior confuses admins
- **Hard delete with cascade**: Rejected - violates FR-011 (preserve responses)

### References
- [MongoDB Update Operators](https://www.mongodb.com/docs/manual/reference/operator/update/)
- [Referential Integrity Patterns](https://www.mongodb.com/docs/manual/core/data-model-design/)

---

## 5. Frontend Routing & Layout

### Decision
Use React Router nested routes with protected admin layout (`/admin/*`), separate from public questionnaire routes.

### Rationale
- **Route isolation**: Admin routes under `/admin/*` namespace, easy to guard
- **Layout separation**: Admin UI uses different nav/sidebar than public pages
- **Route protection**: Single auth guard component wraps all admin routes
- **Code splitting**: Admin bundle loaded only when accessed (via React.lazy)

### Route Structure
```typescript
// App.tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <NameEntry /> },
      { path: 'questionnaire/:category', element: <CategoryScreen /> },
      { path: 'share/:shareableId', element: <ProfileView /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />, // Protected with password check
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'questions', element: <QuestionManager /> },
      { path: 'categories', element: <CategoryManager /> },
    ],
  },
]);
```

### Auth Guard Pattern
```typescript
function AdminLayout() {
  const { isAuthenticated, login } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminAuth onLogin={login} />;
  }

  return (
    <div className="admin-layout">
      <AdminNav />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

### Session Management
- Store auth token in `sessionStorage` (expires on tab close)
- React Query hook checks token validity on mount
- Logout clears sessionStorage and redirects to login

### Alternatives Considered
- **Modal-based admin**: Rejected - poor UX for complex management tasks
- **Same layout for admin and public**: Rejected - conflicting navigation needs
- **Separate admin SPA**: Rejected - adds deployment complexity

### References
- [React Router Data APIs](https://reactrouter.com/en/main/routers/create-browser-router)
- [Protected Routes Pattern](https://ui.dev/react-router-protected-routes-authentication)

---

## Summary of Decisions

| Area | Decision | Key Trade-off |
|------|----------|---------------|
| Authentication | Ktor basic auth + env var password | Simplicity over multi-user support |
| API Design | RESTful CRUD with soft delete | Standard patterns over novelty |
| Drag-and-Drop | @dnd-kit + React Query optimistic updates | Modern lib over legacy (react-beautiful-dnd) |
| Category Deletion | Prevent delete if active questions exist | Data integrity over flexibility |
| Frontend Routing | Nested routes with protected layout | Route isolation over shared layout |

---

## Open Questions (Deferred to Implementation)

1. **Search/Filter**: FR-002 mentions potential search - defer to post-MVP enhancement
2. **Concurrent Editing**: Edge case in spec - handle via last-write-wins, add `updatedAt` timestamp check
3. **Text Length Limits**: Edge case in spec - enforce 500 chars for question text, 100 for category name (TBD in validation)
4. **Migration Path**: Seed database with existing 6 categories + questions from current hardcoded list

---

**Phase 0 Status**: ✅ Complete
**Next Phase**: Phase 1 (Design & Contracts)

# Feature Specification: Backoffice Question Configuration

**Feature Branch**: `002-create-a-backoffice`
**Created**: 2025-10-07
**Status**: Draft
**Input**: User description: "Create a Backoffice page where I can configure questions"

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identified: backoffice interface, question configuration, admin access
3. For each unclear aspect:
   → [NEEDS CLARIFICATION: Who can access the backoffice?]
   → [NEEDS CLARIFICATION: What aspects of questions can be configured?]
   → [NEEDS CLARIFICATION: Should this support creating new questions or only editing existing ones?]
   → [NEEDS CLARIFICATION: What categories can questions belong to?]
4. Fill User Scenarios & Testing section
   → User flow: Admin accesses backoffice → views questions → configures them
5. Generate Functional Requirements
   → Each requirement must be testable
   → Marked ambiguous requirements
6. Identify Key Entities (Question entity involved)
7. Run Review Checklist
   → WARN "Spec has uncertainties - clarification needed"
8. Return: SUCCESS (spec ready for planning after clarification)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## Clarifications

### Session 2025-10-07
- Q: When an administrator deletes a question that existing users have already answered in their profiles, what should happen to those responses? → A: Preserve responses - deleted questions become hidden but their answers remain viewable in existing profiles
- Q: How should administrators authenticate to access the backoffice? → A: Environment variable password - single shared password set via config (simplest, no user management)
- Q: Can administrators create new categories in addition to the existing 6 categories (Communication, Work Style, Collaboration, Feedback, Boundaries, Problem Solving)? → A: Full category management - administrators can create, edit, rename, and delete categories
- Q: Is the question order within each category enforced globally for all users, or can individual users customize their own questionnaire order? → A: Global ordering - all users see questions in the same order set by administrators
- Q: What is the acceptable delay between when an administrator saves a change (question/category edit) and when it appears in the public-facing questionnaire? → A: No specific requirement - can take as long as needed, user can refresh manually

---

## User Scenarios & Testing

### Primary User Story
As an administrator, I need to configure the questions and categories that appear in the "How to Work With Me" questionnaire so that I can customize the content without requiring code changes. This enables the application to evolve based on user feedback and changing organizational needs.

### Acceptance Scenarios
1. **Given** an administrator is logged into the backoffice, **When** they navigate to the question configuration page, **Then** they see a list of all existing questions organized by category
2. **Given** an administrator is viewing a question, **When** they edit the question text and save, **Then** the updated question appears in the public-facing questionnaire
3. **Given** an administrator wants to add a new question, **When** they create a question with text and category, **Then** the new question becomes available in the questionnaire
4. **Given** an administrator wants to remove a question, **When** they delete the question, **Then** it no longer appears in the questionnaire but existing user responses remain preserved and viewable in their profiles
5. **Given** an administrator is editing questions, **When** they reorder questions within a category, **Then** the new order is reflected in the questionnaire
6. **Given** an administrator wants to organize questions differently, **When** they create a new category with a name, **Then** questions can be assigned to that category
7. **Given** an administrator wants to update category organization, **When** they rename or delete a category, **Then** the changes are reflected in the questionnaire
8. **Given** a user attempts to access the backoffice without the correct password, **When** they try to authenticate, **Then** they are denied access

### Edge Cases
- How does the system handle duplicate questions or empty question text?
- What happens if two administrators edit the same question simultaneously?
- What happens to questions when their category is deleted?
- What is the maximum length for question text and category names?
- Can a category be deleted if it contains questions?

## Requirements

### Functional Requirements
- **FR-001**: System MUST provide a dedicated backoffice interface for question management
- **FR-002**: System MUST display all existing questions in the backoffice [NEEDS CLARIFICATION: Should questions be filterable or searchable?]
- **FR-003**: Administrators MUST be able to view questions organized by category
- **FR-004**: Administrators MUST be able to create new questions with text and category assignment
- **FR-005**: Administrators MUST be able to edit existing question text
- **FR-006**: Administrators MUST be able to delete questions (soft delete: hidden from new questionnaires but existing user responses preserved)
- **FR-007**: Administrators MUST be able to reorder questions within a category (order applies globally to all users)
- **FR-008**: System MUST validate that question text is not empty before saving
- **FR-009**: System MUST restrict backoffice access via password authentication (single shared password configured via environment variable)
- **FR-010**: System MUST reflect question and category changes in the public-facing questionnaire (no specific latency requirement)
- **FR-011**: System MUST preserve existing user responses when questions are modified or deleted
- **FR-012**: Administrators MUST be able to assign questions to categories
- **FR-013**: Administrators MUST be able to create new categories with a name
- **FR-014**: Administrators MUST be able to rename existing categories
- **FR-015**: Administrators MUST be able to delete categories
- **FR-016**: System MUST validate that category names are not empty before saving

### Key Entities
- **Question**: Represents a configurable question in the system
  - Text content that users see
  - Category association (reference to Category entity)
  - Display order within category
  - Creation and modification timestamps
  - Active/inactive status (for soft delete: inactive questions hidden from new questionnaires)
  - Relationship to user responses in existing profiles

- **Category**: Represents a grouping of related questions
  - Category name
  - Display order (for organizing categories in the questionnaire)
  - Creation and modification timestamps
  - Active/inactive status (for soft delete)
  - Relationship to questions

- **Administrator**: User with permission to access the backoffice
  - Authenticates via single shared password
  - Password configured via environment variable (no database storage required)

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain *(9 clarifications needed)*
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [x] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (9 items require clarification)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (pending clarifications)

---

## Key Clarifications Needed

1. **Authentication & Authorization**: How should administrators access the backoffice? (Single password, user accounts, role-based access?)
2. **Question Lifecycle**: Can administrators create new questions or only edit existing ones?
3. **Category Management**: Can administrators create/modify categories or only assign questions to existing categories?
4. **Data Integrity**: What happens to existing user responses when questions are edited or deleted?
5. **Delete Behavior**: Should question deletion be hard (permanent) or soft (hidden but preserved)?
6. **Question Discovery**: Should the backoffice include search/filter capabilities for questions?
7. **Question Ordering**: Is question order enforced globally or can individual users customize their questionnaire order?
8. **Concurrent Editing**: How should conflicts be handled when multiple administrators edit simultaneously?
9. **Real-time Updates**: What is the acceptable delay between question configuration changes and public questionnaire updates?

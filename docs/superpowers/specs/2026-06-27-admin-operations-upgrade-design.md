# SJG Admin Operations Upgrade Design

**Date:** 2026-06-27

**Status:** Approved for specification; pending implementation planning

## Context

The project is a digital-humanities platform for the Yellow River Basin in Shandong. It has a data-management front end (`admin-frontend`), an immersive public display front end (`display-v2`), and a Spring Boot backend (`backend`).

The first upgrade round focuses on making the management side useful for real data operations. The display side already has an ambitious visual layer, while the management side needs better operational overview, data-quality cues, stronger filters, and safer forms. Backend changes should be additive and low risk.

## Goals

- Add an admin dashboard as the default management landing page.
- Add backend read APIs that summarize content counts, data quality issues, and chart distributions.
- Improve existing management lists with useful filters and clearer empty/error states.
- Add basic form validation for required fields and numeric boundaries.
- Improve import feedback so operators can tell what was imported, skipped, or invalid.
- Keep database schema changes out of the first round unless implementation discovers an unavoidable need.

## Non-Goals

- Do not redesign `display-v2` in this round.
- Do not replace Element Plus or the existing Vue/Vite/Spring Boot stack.
- Do not introduce a real LLM or external AI service in this round.
- Do not implement destructive batch editing until data-quality reporting is stable.

## Proposed Approaches Considered

### Approach A: Admin-first plus small backend read APIs

Add a dashboard and data-quality support to the admin front end, backed by additive read-only endpoints. This is the chosen approach because it improves the daily management workflow while keeping backend risk low.

### Approach B: Display-first public experience

Make `display-v2` consume more real backend data, especially map statistics and relationship graph data. This would improve the public experience but leaves the data-maintenance workflow weak.

### Approach C: Backend-first platform APIs

Build a broader API layer for stats, search, relationships, import diagnostics, and recommendations before UI changes. This is clean architecturally but delays visible product improvement.

## Architecture

### Backend

Add a new admin-facing read controller and service:

- `AdminDashboardController`
- `DashboardService`

The controller will expose one primary endpoint:

```text
GET /api/admin/dashboard
```

The response will use the existing `Result<T>` wrapper and return an object with:

- `totals`: total counts for poets, spots, poems, events, and users.
- `pending`: operational counts such as pending users.
- `quality`: counts and small samples for data-quality issues.
- `regions`: scenic spot distribution by the nine supported regions.
- `dynasties`: content distribution by dynasty.

The service will use existing mappers and MyBatis-Plus query wrappers. It will not mutate data.

### Admin Frontend

Add a new route:

```text
/dashboard
```

The existing root route should redirect to `/dashboard` instead of `/poets`.

Add a new view:

- `admin-frontend/src/views/Dashboard.vue`

Update:

- `admin-frontend/src/router/index.js`
- `admin-frontend/src/views/Layout.vue`
- `admin-frontend/src/components/DataTable.vue`
- `admin-frontend/src/components/FormDialog.vue`
- resource pages for poets, spots, poems, events, and users where the new table/form capabilities are needed.

The dashboard will follow a quiet operational admin style: dense but readable, with restrained visual styling, small cards, tables, tags, and chart-like distribution bars. It should not become a marketing hero page.

## Dashboard UX

The dashboard will contain:

- KPI strip: poets, scenic spots, poems, events, users, pending approvals.
- Data-quality panel: missing coordinates, missing images, missing poet links, missing spot links, missing annotation/background, and empty biography/description.
- Quick actions: add poet, add scenic spot, add poem, import data, review pending users.
- Region distribution: nine-region spot counts with compact bars.
- Dynasty distribution: per-dynasty counts for poets, poems, and events.

Each data-quality item should link to the closest relevant list page with a query/filter where practical. If a filter cannot be deep-linked in the first implementation, the item should still navigate to the related resource list.

## DataTable Enhancements

`DataTable` should continue to be the shared table shell. It will gain:

- A named slot for advanced filters next to keyword search.
- Optional props controlling visibility of import/add buttons for pages like user management.
- Empty-state copy when the table has no records.
- Basic error state with retry if `fetchFn` fails.

Existing list pages should remain source-compatible where possible.

## FormDialog Enhancements

`FormDialog` will gain validation plumbing:

- Accept `rules` and pass them to `el-form`.
- Call `validate()` before submit.
- Keep the loading state and success/close behavior.
- Leave dirty-close protection out of the first implementation unless it is cheap and local.

Resource pages will define minimal rules:

- Poet: `name` required.
- Scenic spot: `name` and `region` required; longitude and latitude should be valid if provided.
- Poem: `title` and `content` required.
- Event: `title` required; year should be numeric if provided.
- User password reset: new password required with a minimum length of 6.

## Import Feedback

Backend import endpoints currently return only a success message. First-round import feedback should preserve existing compatibility and may extend the returned map with:

- `success`
- `message`
- `importedCount`
- `skippedCount`
- `errors`

`errors` should be a short list of row-level messages when the service can detect bad rows. The first implementation should at minimum report skipped rows with missing required names/titles. More detailed foreign-key validation can be added if it stays localized.

`ImportDialog` should render:

- Imported count.
- Skipped count.
- Error/warning list.
- Existing success/error alert.

## Filtering

First-round filters:

- Scenic spots: region filter; data-quality filter for missing coordinates or missing images.
- Poems: author, dynasty, scenic spot, and missing linkage filters where backend support is available.
- Users: preserve existing status tabs and search.

If backend list endpoints need filter parameters, add them in a backward-compatible way. Existing keyword/page/size parameters must continue to work.

## Data Flow

Dashboard:

1. `Dashboard.vue` calls `GET /api/admin/dashboard`.
2. Axios unwraps the existing `Result` response.
3. The dashboard maps the returned object into KPI cards, quality items, and distribution sections.
4. Loading, empty, and error states are shown locally.

List pages:

1. Page-level filters update local refs.
2. `DataTable.fetch()` calls the page's `fetchFn(page, size, keyword)`.
3. `fetchFn` includes any extra page-level filter params.
4. `DataTable` displays rows, empty state, or retryable error state.

Forms:

1. Resource page passes form rules to `FormDialog`.
2. `FormDialog` validates before calling `submitFn`.
3. Existing API calls continue to create/update records.

Imports:

1. `ImportDialog` sends `FormData`.
2. Backend returns existing message plus structured counts/errors.
3. Dialog displays the result and triggers table refresh.

## Error Handling

- Backend endpoint errors should use the existing `Result.error(code, message)` shape.
- Dashboard errors should show a retry action instead of a blank page.
- Table fetch errors should preserve the previous layout and show retry.
- Form validation errors should appear near fields through Element Plus validation.
- Import errors should preserve backend error messages, and row-level import warnings should not block successfully imported rows unless the service cannot safely continue.

## Testing and Verification

Backend:

- Add focused tests for `DashboardService` if the existing test setup can instantiate it without a real remote database.
- If no safe DB test harness exists, verify with Maven compilation and localized unit tests for pure helper methods introduced for quality/import reporting.

Admin frontend:

- Build `admin-frontend`.
- Manually inspect dashboard route, layout navigation, table filters, form validation, and import result rendering.
- Confirm existing pages still load through router.

Regression checks:

- Login and role-gated `/users` behavior remains unchanged.
- Existing CRUD endpoints remain backward-compatible.
- `display-v2` build should still pass if shared backend/API changes are additive only.

## Acceptance Criteria

- Admin login lands on `/dashboard`.
- Sidebar includes a dashboard entry and keeps existing resource entries.
- Dashboard displays totals, pending approvals, data-quality counts, region distribution, and dynasty distribution from backend data.
- Data-quality items are actionable enough to guide the operator to the relevant list page.
- Existing poet, spot, poem, event, and user pages still support their current CRUD/search workflows.
- Spot and poem pages include the first-round filters.
- Required fields cannot be submitted empty through the shared dialog.
- Import dialog can show imported/skipped counts and row warnings when the backend provides them.
- Frontend builds pass for `admin-frontend`; backend compiles/tests pass or any environment limitation is documented.

## Spec Self-Review

- Placeholder scan: no TBD/TODO placeholders remain.
- Internal consistency: the backend endpoint shape matches the dashboard data needs and remains additive.
- Scope check: this is focused on admin operations and small backend support; display-v2 redesign is deferred.
- Ambiguity check: first-round filters, validation rules, and import diagnostics are explicit enough for implementation planning.

---
id: STORY-73
story_key: 3-73-subject-catalog-pagination
status: done
baseline_commit: NO_VCS
epic: EPIC-3
ux_refs: ["W-10"]
---

# STORY-73: Subject catalog pagination (W-10)

**Epic:** EPIC-3

As a **Candidate**,  
I want **the subject catalog paginated on the home page**,  
So that **browsing scales without loading every subject at once**.

## Acceptance Criteria

- **AC-1:** `GET /subjects?page=&limit=` returns paginated catalog
- **AC-2:** Web home `/` shows page controls (Vietnamese)
- **AC-3:** `listSubjects()` without params unchanged for other clients

## Tasks

- [x] API pagination in `SubjectsService.listActiveCatalogPaginated`
- [x] `listSubjectsPaginated` + query key in api-client
- [x] Web home pagination state + `CatalogPagination`
- [x] `SubjectCatalogGrid.totalCount`
- [x] Spec: `spec-web-subject-catalog-pagination.md`

## File List

- apps/api/src/subjects/subjects.controller.ts
- apps/api/src/subjects/subjects.service.ts
- apps/api/src/subjects/dto/list-subjects.dto.ts
- apps/web/src/app/(candidate)/(shell)/page.tsx
- packages/ui/src/components/catalog-pagination.tsx
- packages/ui/src/components/subject-catalog-grid.tsx

### Review Findings

- [x] [Review][Defer] `listActiveCatalogPaginated` loads full active catalog then slices in memory — same scale class as non-paginated `listActiveCatalog` [`apps/api/src/subjects/subjects.service.ts:75-108`] — deferred, DB skip/take when catalog grows
- [x] [Review][Defer] No unit tests for paginated catalog path — deferred, controller/service specs cover non-paginated path only
- [x] [Review][Defer] Home page page state not in URL — refresh loses current page [`apps/web/src/app/(candidate)/(shell)/page.tsx:34`] — deferred, UX polish
- [x] [Review][Defer] Course group headers may repeat or split across pages when a course spans page boundaries — deferred, flat pagination tradeoff
- [x] [Review][Defer] `featuredCount` applies per page (first two cards on every page get featured styling) [`packages/ui/src/components/subject-catalog-grid.tsx:78-88`] — deferred, minor visual polish

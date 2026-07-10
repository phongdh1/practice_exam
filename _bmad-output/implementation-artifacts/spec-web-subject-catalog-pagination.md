# Spec — Web subject catalog pagination (W-10)

**Story:** STORY-73 (`3-73-subject-catalog-pagination`)  
**Status:** implemented

## API

- `GET /api/v1/subjects?page=&limit=` returns `PaginatedResult<SubjectCatalogItem>`
- Without `page`/`limit`: unchanged full-array response (Zalo + subject detail lookups)
- Default page size on web: 12

## Client

- `api-client.listSubjectsPaginated({ page, limit })`
- `queryKeys.subjects.catalogPage(page, limit)`
- Home `/` uses paginated fetch + `CatalogPagination` controls (Vietnamese copy)
- `SubjectCatalogGrid.totalCount` shows catalog total across pages

## Out of scope

- Admin A-20 subjects table pagination

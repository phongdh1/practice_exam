---
title: 'Fix corrupt import template download'
type: 'bugfix'
created: '2026-07-02'
status: 'done'
route: 'one-shot'
---

## Intent

**Problem:** Downloaded `mau-import-cau-hoi.xlsx` could not be opened in Excel — file format invalid. The ExcelJS-generated buffer was valid; the API global `ApiEnvelopeInterceptor` wrapped `StreamableFile` responses as `{ data: ... }`, producing JSON bytes saved with an `.xlsx` extension.

**Approach:** Skip JSON envelope wrapping when the handler returns `StreamableFile`, matching how other binary downloads use `@Res()` to bypass the envelope.

## Suggested Review Order

1. [api-envelope.interceptor.ts](../../apps/api/src/common/interceptors/api-envelope.interceptor.ts) — pass `StreamableFile` through unchanged
2. [api-envelope.interceptor.spec.ts](../../apps/api/src/common/interceptors/api-envelope.interceptor.spec.ts) — JSON still wrapped; binary streams as ZIP magic `PK`
3. [import-questions.controller.ts](../../apps/api/src/questions/import-questions.controller.ts) — unchanged; relies on fixed interceptor

## Verification

**Commands:**
- `pnpm test api-envelope.interceptor.spec` — expected: 2/2 pass
- `pnpm test import-questions.service.spec` — expected: 14/14 pass

**Manual checks:**
- Admin → Import → Tải file mẫu → open in Excel → three sheets (Câu hỏi, DanhMuc, HuongDan) with dropdowns

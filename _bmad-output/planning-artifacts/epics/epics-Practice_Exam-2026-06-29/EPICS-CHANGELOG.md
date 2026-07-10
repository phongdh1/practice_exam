# EPICS-CHANGELOG — Practice Exam MVP

Bulk synchronization events between PRD revisions and the epic/story backlog. Per-story deltas live in each `stories/STORY-*.md` frontmatter `changelog` array and inline tables in `epics.md`.

## Events

| date | prd_version | architecture_version | change_summary | stories_affected | sync_action |
|------|-------------|----------------------|----------------|------------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | architecture-Practice_Exam-2026-06-29 (final) | Initial decomposition: 13 epics, 60 stories from FR-1..FR-46. Payment stories cite AD-5 (SePay/PayOS) over PRD ZaloPay/VNPay/MoMo. Database stories cite AD-3 (Supabase PostgreSQL + Prisma). | STORY-1..STORY-60 (all) | Created full backlog |
| 2026-07-09 | prd-Practice_Exam-2026-06-29 (Study Mode addendum) | architecture-Practice_Exam-2026-06-29 (final) | Sprint change proposal: new EPIC-14 Study Mode — FR-47, Study Tier freemium (5 views/month default), UJ-7, Z-12..14/W-12..14, A-21 study limit. Independent from Free Tier practice counter. | STORY-65..STORY-68 | Created EPIC-14 stories |

## PRD divergences recorded at creation

| PRD reference | PRD says | Architecture binds | Affected stories |
|---------------|----------|-------------------|------------------|
| FR-6, §6.1, §10 | ZaloPay (Zalo); VNPay, MoMo (web) | AD-5: SePay/PayOS unified hosted checkout; `Payment.provider` = payos\|sepay; `Payment.channel` = web\|zalo | STORY-16, STORY-17, STORY-18, STORY-19, STORY-49, STORY-50, STORY-55 |
| FR-42 | ZaloPay merchant configuration | AD-5: PayOS/SePay merchant config replaces ZaloPay-specific admin | STORY-55 |
| FR-36 filter | Provider filter ZaloPay, VNPay, MoMo | Provider filter payos, sepay | STORY-49 |
| addendum tech direction | PostgreSQL (generic) | AD-3: Supabase PostgreSQL + Prisma with pooler URLs | STORY-2, STORY-3, STORY-15 |

## How to append bulk events

When the PRD is revised:

1. Diff `prd.md` against the `prd_version` in `epics.md` frontmatter.
2. List affected FR IDs and map to stories via `epics.md` → FR Coverage Map.
3. Update each affected `stories/STORY-*.md`: revise body/AC, update `prd_refs`, append a `changelog` entry.
4. Add one row to the **Events** table above with `sync_action` (e.g. `PRD patch sync`, `Architecture override sync`).
5. Bump `updated` in `epics.md` frontmatter; set `prd_version` to the new PRD run folder id.

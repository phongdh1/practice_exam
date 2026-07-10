# Epics & Stories — Practice Exam MVP

**Run folder:** `epics-Practice_Exam-2026-06-29`  
**Status:** final  
**PRD:** `prd-Practice_Exam-2026-06-29` (final)  
**Architecture:** `architecture-Practice_Exam-2026-06-29` (final)

## Artifacts

| File | Purpose |
|------|---------|
| [`epics.md`](epics.md) | Canonical epic breakdown: requirements inventory, FR coverage map, epic list, story summaries with inline changelog tables |
| [`stories/STORY-*.md`](stories/) | Implementable user stories with YAML frontmatter (`prd_refs`, `ad_refs`, `changelog`) and full acceptance criteria |
| [`EPICS-CHANGELOG.md`](EPICS-CHANGELOG.md) | Bulk PRD→stories synchronization events and documented PRD/architecture divergences |
| [`.memlog.md`](.memlog.md) | Append-only workflow memory (not a deliverable) |

## Stable IDs

- **Epics:** `EPIC-1` … `EPIC-14` (14 epics)
- **Stories:** `STORY-1` … `STORY-68` (64 core MVP stories + EPIC-8/9 extensions through STORY-64)

## Changelog mechanism

Each story tracks traceability to requirements and history of changes.

### Per-story fields (`stories/STORY-NNN.md` frontmatter)

```yaml
prd_refs: ["FR-6", "FR-7"]      # FR IDs this story implements
ad_refs: ["AD-5", "AD-6"]       # Architecture decision IDs (when applicable)
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "What changed in the PRD or architecture that triggered this update"
    story_delta: "Created | AC revised | Scope split | Deprecated | ..."
```

`epics.md` mirrors a summary `changelog` table under each story for quick scanning.

### Bulk sync (`EPICS-CHANGELOG.md`)

Use for workspace-level events affecting many stories at once (initial creation, major PRD version bumps, architecture overrides).

## Process: update stories when the PRD changes

1. **Diff PRD** — Compare new `prd.md` to the `prd_version` recorded in `epics.md` frontmatter. Note added/changed/removed FR IDs and section references (§4.x).
2. **Map impact** — Use the **FR Coverage Map** in `epics.md` to find affected `EPIC-*` and `STORY-*` ids.
3. **Architecture check** — If architecture spine (`ARCHITECTURE-SPINE.md`) or memlog records an AD override (e.g. payments AD-5), architecture wins over PRD for implementation stories; note divergence in story AC and changelog.
4. **Update stories** — For each affected `stories/STORY-*.md`:
   - Revise user story and acceptance criteria.
   - Update `prd_refs` (add/remove FR IDs; cite PRD sections in `change_summary`).
   - Append a new `changelog` entry (never edit prior entries).
   - Sync the matching section in `epics.md`.
5. **Record bulk event** — Append a row to `EPICS-CHANGELOG.md` Events table.
6. **Bump metadata** — Update `updated` date and `prd_version` in `epics.md` frontmatter.

## Payment implementation note

Stories implementing checkout and finance admin (**STORY-16–19, STORY-49–50, STORY-55**) follow **AD-5 SePay/PayOS**, not PRD ZaloPay/VNPay/MoMo. FR-6, FR-36, and FR-42 remain the business requirements; provider names in PRD are superseded for build.

## Database note

Persistence stories follow **AD-3**: Supabase PostgreSQL (`ap-southeast-1`) with Prisma; `DATABASE_URL` (transaction pooler) and `DIRECT_URL` (migrations only).

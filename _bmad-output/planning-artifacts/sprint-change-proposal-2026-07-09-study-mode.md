---
title: Sprint Change Proposal — Study Mode
status: proposed
created: 2026-07-09
author: BMad Correct Course workflow
trigger: Stakeholder requirement — browse-all-questions study feature with freemium cap
change_scope: moderate
project: Practice_Exam
user: Mr_Phong
---

# Sprint Change Proposal — Study Mode (Browse Questions with Answers)

**Date:** 2026-07-09  
**Workflow:** `bmad-correct-course` (batch mode)  
**Prepared for:** Mr_Phong  
**Classification:** **Moderate** — backlog reorganization + PRD/UX/arch updates before implementation

---

## 1. Issue Summary

### 1.1 Trigger

Stakeholder request during sprint execution:

> Add **"View all questions to study"** — candidates can browse all published questions **with answers and explanations** for study purposes. Freemium users can view a maximum of **5 study views per Subject per month**, then must subscribe to continue.

### 1.2 Problem Statement

The MVP PRD defines **Practice Mode** (FR-8) as interactive, answer-first practice with immediate feedback. Free Tier gates **answered practice questions** (default 20/month per Subject). There is **no Study Mode** — a passive browse-and-read experience where candidates review the full question bank with solutions visible upfront.

Candidates preparing for CNVCK often want to **read through questions and explanations** before or alongside active practice. Without Study Mode, the product forces an assess-first workflow that does not match how many learners study in Zalo groups (reading dumps with answers).

### 1.3 Issue Type

**New requirement emerged from stakeholders** — not a technical limitation or misunderstanding of original requirements. Aligns with product vision (affordable per-Subject prep) but was not in the finalized PRD (2026-06-29).

### 1.4 Evidence

| Source | Finding |
|---|---|
| PRD §3 Glossary | Defines **Practice Mode** only; no Study Mode |
| PRD FR-5, FR-8 | Free Tier counts **answered** Practice Mode questions |
| `EntitlementsService` (implemented) | `consumeFreeTierQuestion()` increments on practice answer; no browse/view counter |
| EPIC-5 | Practice Mode stories **done** — no browse flow |
| UX EXPERIENCE.md | Screen IDs Z-20..Z-22 (practice); no study browse screens |
| STORY-61 (done) | Course is catalog grouping only; monetization stays **Subject-level** |

### 1.5 Checklist Summary

| Section | Status | Notes |
|---|---|---|
| 1 — Trigger & context | [x] Done | Stakeholder requirement; EPIC-5 complete, gap identified post-implementation |
| 2 — Epic impact | [x] Done | New capability; touches EPIC-3, EPIC-5 area, EPIC-9; recommend new EPIC-14 |
| 3 — Artifact conflicts | [x] Done | PRD, UX, architecture need additive updates; no rollback required |
| 4 — Path forward | [x] Done | **New EPIC-14** recommended over rollback; MVP still achievable |
| 5 — Proposal components | [x] Done | This document |
| 6 — Final review | [x] Done | Batch mode — no approval loop; parent presents to user |
| 6.3 — User approval | [N/A] | Skipped per workflow instruction |
| 6.4 — sprint-status.yaml update | [!] Action-needed | Update **after** user approves proposal |

---

## 2. Impact Analysis

### 2.1 Epic Impact

| Epic | Status | Impact |
|---|---|---|
| **EPIC-5: Practice Mode** | done | No modification to completed stories. Study Mode is **adjacent**, not a rewrite of practice |
| **EPIC-3: Subject Catalog & Compliance** | review | Subject detail (Z-11/W-11) needs Study CTA + study-tier meter; optional paywall context |
| **EPIC-4: Subscriptions & Payments** | review | Subscribe flow reused when study cap hit; no payment model change |
| **EPIC-9: Subject & Mock Exam Config** | done | Admin Subject edit (A-21) needs **Study Tier limit** field (default 5) |
| **EPIC-14 (new): Study Mode** | — | **Recommended new epic** — API, entitlements, candidate UI |
| EPIC-6..13 | minimal/none | No structural changes |

### 2.2 Story Impact

| Story area | Change |
|---|---|
| STORY-11, STORY-12 | Subject catalog/detail — add Study entry point and meter |
| STORY-13 | Extend entitlement model — **separate** study-view counter (do not conflate with practice) |
| STORY-40 | Admin pricing screen — add `study_tier_limit` alongside `free_tier_limit` |
| **STORY-65** (new) | Study Mode API + server gating (FR-47) |
| **STORY-66** (new) | Study Mode candidate UI (Z-12..14, W-12..14) |
| **STORY-67** (new) | Subject detail integration + study meter component |
| EPIC-5 stories 21–24 | **No changes** — remain done |

### 2.3 PRD Impact

- Add **FR-47** (Study Mode)
- Extend **Glossary** (Study Mode vs Practice Mode; Study Tier vs Free Tier)
- Extend **FR-26** admin config for study limit
- Add user journey **UJ-7** (optional) — browse study before subscribing
- Update **§6.1 MVP In Scope** and **§11 Monetization**
- Add assumption index entry for default Study Tier: 5 views/month

**MVP remains achievable** — additive feature, no epics invalidated.

### 2.4 Architecture Impact

| Area | Change |
|---|---|
| `entitlements` module | Add `consumeStudyView()` + `StudyTierUsage` (or typed usage dimension) |
| New `study` module (preferred) | `StudyService` — list/detail Published questions; gate answer payload |
| Prisma schema | `StudyTierUsage` table: `user_id`, `subject_id`, `period_key`, `viewed_count`; optional `SubjectPricing.study_tier_limit` |
| API routes | `GET /study/subjects/:subjectId/questions` (list, no answers); `GET /study/subjects/:subjectId/questions/:id` (full with answer — consumes study view) |
| AD-11 | Extend rule: Study question selection server-side; study view counter atomic |
| Clients | New TanStack Query keys; Z-12/W-12 list, Z-13/W-13 detail |

**Recommendation:** New `StudyService` + extend `EntitlementsService` (not fold into `PracticeService`) — different consumption semantics and response shape (browse vs session).

### 2.5 UX Impact

| Screen ID | Purpose |
|---|---|
| **Z-12 / W-12** | Study Mode — question list (stem preview, topic/difficulty; no answers) |
| **Z-13 / W-13** | Study Mode — question detail (options, correct answer, explanation visible) |
| **Z-14 / W-14** | Study Tier paywall (5 views cap) — or contextual variant of Z-23/W-23 |
| **Z-11 / W-11** (update) | Add "Xem tất cả câu hỏi" CTA + study meter "Đã xem {n}/5 câu ôn tháng này" |

Study list/detail sit between Subject detail (Z-11) and Practice setup (Z-20) — unused ID band.

### 2.6 Technical / Secondary Artifacts

- `packages/types` — `StudyTierStatus`, `StudyQuestionListItem`, `StudyQuestionDetail`
- `packages/api-client` — study query keys and hooks
- `@practice-exam/ui` — study list row, study detail layout (read-only; no confirm-before-reveal)
- Tests — entitlement isolation (practice consume ≠ study consume)
- Admin A-21 — study limit field

---

## 3. Recommended Approach

### 3.1 Options Evaluated

| Option | Viable? | Effort | Risk | Verdict |
|---|---|---|---|---|
| **1. Direct Adjustment** — add stories to EPIC-3/5/9 | Yes | Medium | Medium — EPIC-5 done; entitlements entangled if not careful | Acceptable but awkward sprint tracking |
| **2. Rollback** — revert EPIC-5 practice | No | High | High — destroys working feature | **Not viable** |
| **3. MVP Review** — defer Study Mode post-MVP | Yes | Low | Low — misses stakeholder ask | **Not recommended** |
| **4. New EPIC-14: Study Mode** | Yes | Medium | Low — clean boundary | **Recommended** |

### 3.2 Selected Approach: **New EPIC-14 (Study Mode)** with cross-epic touch points

**Rationale:**

1. Study Mode is a **distinct user journey** (browse/read) vs Practice Mode (assess/learn-by-doing).
2. **Separate entitlement counter** (5 study views vs 20 practice answers) needs clear ownership — new epic avoids polluting done EPIC-5.
3. EPIC-5 is **done**; reopening it confuses sprint-status and code-review history.
4. Small, well-scoped epic (3–4 stories) fits **moderate** classification without fundamental replan.
5. Aligns with STORY-61: all gating at **Subject** level; Course remains grouping only.

**Effort estimate:** ~1–1.5 sprints (API + entitlements + web + Zalo UI)  
**Timeline impact:** Can run parallel to EPIC-6 review / EPIC-1–4 review closure  
**Risk:** Low — pattern mirrors existing `freeTierUsage` + `PracticeService`

### 3.3 Epic Placement Recommendation

```
EPIC-14: Study Mode
├── STORY-65: Study Mode API + study-tier entitlement (FR-47)
├── STORY-66: Study Mode candidate UI — Z-12/13/14, W-12/13/14
├── STORY-67: Subject detail integration — CTA + study meter on Z-11/W-11
└── STORY-68: Admin study-tier limit on A-21 (extends FR-26) [optional same sprint]
```

Cross-epic dependencies: STORY-65 before STORY-66/67; STORY-68 can parallel admin work.

---

## 4. Glossary Additions

### Study Mode vs Practice Mode

| Term | Definition |
|---|---|
| **Practice Mode** | Interactive, untimed (or loosely timed) question-by-question practice. Candidate selects an answer; system reveals correctness and explanation **after** submit. Each **answered** question increments the **Free Tier** counter (default 20/month per Subject). Creates `PracticeSession` / Attempt History. |
| **Study Mode** | Passive browse of **all Published questions** for a Subject. Correct answer and explanation are **visible on the detail view** without answering first. Each **study view** (opening a question detail with full solution) increments the **Study Tier** counter (default 5/month per Subject). Does not create a Practice session; optional lightweight `StudyView` audit log for analytics only. |
| **Free Tier** | Unpaid **Practice Mode** allowance — answered questions per Subject per calendar month (ICT reset). Existing FR-5. |
| **Study Tier** | Unpaid **Study Mode** allowance — study views per Subject per calendar month (ICT reset). New; independent of Free Tier. |
| **Entitlement** | Unchanged: active Subscription grants **unlimited** Practice Mode and Study Mode for that Subject. |

### Freemium Rule Comparison

| Dimension | Practice (Free Tier) | Study (Study Tier) |
|---|---|---|
| What is counted | **Answered** practice questions | **Viewed** question details (answer+explanation revealed) |
| Default limit | 20 / Subject / month | **5 / Subject / month** |
| Counter table | `free_tier_usage.used_count` | `study_tier_usage.viewed_count` (proposed) |
| When incremented | On practice answer submit (`consumeFreeTierQuestion`) | On study detail fetch with full payload (`consumeStudyView`) |
| List/browse index | N/A (server picks next question) | Question list free; **detail with answers** consumes 1 view |
| Subscribed users | Unlimited practice | Unlimited study views |
| Scope | Per **Subject** | Per **Subject** (not Course) |
| Paywall | Z-23 / W-23 | Z-14 / W-14 (or contextual Z-23) |

**Important:** A freemium user could use **5 study views + 20 practice answers** in the same month on the same Subject — separate pools by design.

---

## 5. New Functional Requirement — FR-47

### FR-47: Study Mode — browse published questions with answers

A Candidate with Entitlement or remaining Study Tier allowance can browse Published Questions for a Subject in Study Mode, viewing correct answers and explanations without answering first.

**Consequences (testable):**

- Study Mode lists all Published Questions for the selected Subject (paginated; filter by topic/difficulty optional post-MVP).
- Question **list** responses expose stem and metadata only — **no** correct answer or explanation.
- Opening a question **detail** with full answer and explanation increments the Study Tier counter by 1 when applicable.
- Default Study Tier limit is **5 views per Subject per month** per User [ASSUMPTION: admin-overridable per Subject via FR-26 extension].
- Study Tier counter resets ICT midnight on the 1st of each calendar month per User per Subject (same rule as Free Tier).
- When Study Tier limit is reached, Study Mode detail requests return a subscribe prompt; list may remain visible but detail is blocked (or list shows locked state).
- Active Subscription grants unlimited Study Mode views for that Subject.
- Study Tier usage does **not** increment Free Tier practice counter and vice versa.
- Study Mode does not grant Mock Exam access.
- Only Published Questions are served; Draft/Archived excluded.
- Re-viewing the same question in the same calendar month does **not** consume additional Study Tier views [ASSUMPTION: idempotent per user+subject+question+period].

---

## 6. Draft Story — STORY-65

### STORY-65: Study Mode API and study-tier entitlement

**Epic:** EPIC-14  
**prd_refs:** `["FR-47"]`  
**ad_refs:** `["AD-11"]`

As a **Candidate**,  
I want **to browse Published questions with answers and explanations in Study Mode**,  
So that **I can review the full question bank before or alongside practice**.

#### Acceptance Criteria

**Given** a Candidate opens Study Mode for a Subject they do not subscribe to  
**When** they request a question list via `GET /study/subjects/:subjectId/questions`  
**Then** only Published Questions for that Subject are returned with stem and metadata (no correct answer or explanation)  
**And** the response includes `studyTier: { used, limit, remaining, periodKey, isAtLimit }` for that Subject

**Given** a freemium Candidate with remaining Study Tier allowance  
**When** they open question detail via `GET /study/subjects/:subjectId/questions/:questionId`  
**Then** the response includes options, correct answer, and explanation  
**And** the Study Tier counter increments atomically by 1 for that User+Subject+period  
**And** the Free Tier practice counter is unchanged

**Given** a freemium Candidate who has used 5 Study Tier views this month for a Subject  
**When** they request question detail for a question not yet viewed this period  
**Then** the API returns `403 STUDY_TIER_EXCEEDED` with subscribe CTA metadata  
**And** Practice Mode remains available if Free Tier practice allowance remains

**Given** a Candidate with an active Subscription for the Subject  
**When** they browse Study Mode list and detail  
**Then** all Published questions are accessible without incrementing Study Tier counter  
**And** re-viewing questions does not affect counters

**Given** a Candidate re-opens a question detail they already viewed this calendar month  
**When** they request the same question detail again  
**Then** the detail is returned without consuming an additional Study Tier view [ASSUMPTION]

**Given** Study Mode is scoped to Subject per STORY-61  
**When** entitlements are evaluated  
**Then** counters and Subscription checks use `subjectId` only — never `courseId`

---

## 7. Architecture Notes

### 7.1 Server-Side Gating (required)

```text
apps/api/src/
  study/
    study.controller.ts      # GET list, GET detail
    study.service.ts         # Published question queries, pagination
  entitlements/
    entitlements.service.ts  # + consumeStudyView(), getStudyTierStatus()
```

**Flow:**

1. List endpoint — auth required; no consumption; returns `StudyTierStatus`.
2. Detail endpoint — check Subscription → if active, return full payload.
3. Else check idempotent view log (`study_view_log` or unique constraint) → if already viewed this period, return full payload without increment.
4. Else `consumeStudyView()` in transaction → if at limit, 403; else return full payload.

### 7.2 Proposed Schema Additions

```prisma
model SubjectPricing {
  // existing
  freeTierLimit   Int  @map("free_tier_limit")
  studyTierLimit  Int  @default(5) @map("study_tier_limit")  // NEW
}

model StudyTierUsage {
  userId      String @map("user_id")
  subjectId   String @map("subject_id")
  periodKey   String @map("period_key")
  viewedCount Int    @default(0) @map("viewed_count")
  @@id([userId, subjectId, periodKey])
}

model StudyViewLog {
  userId     String   @map("user_id")
  subjectId  String   @map("subject_id")
  questionId String   @map("question_id")
  periodKey  String   @map("period_key")
  viewedAt   DateTime @default(now()) @map("viewed_at")
  @@unique([userId, subjectId, questionId, periodKey])
}
```

### 7.3 AD-11 Extension (proposed)

**AD-11 addendum:** `StudyService` serves Published questions server-side. Study Tier counter incremented atomically on first detail view per question per period. Clients must not receive correct answers from list endpoints.

---

## 8. Detailed Change Proposals (OLD → NEW)

### 8.1 PRD §3 Glossary

**Section:** Glossary

**OLD:**
```markdown
- **Practice Mode** — Untimed (or loosely timed) question-by-question practice with immediate feedback and explanations after each answer.
```

**NEW:**
```markdown
- **Practice Mode** — Untimed (or loosely timed) question-by-question practice with immediate feedback and explanations after each answer. Free Tier counts answered questions.
- **Study Mode** — Browse-all-questions review for a Subject: candidates read stems, correct answers, and explanations without answering first. Study Tier counts detail views (default 5/month per Subject).
- **Study Tier** — Unpaid Study Mode access allowing a limited number of question detail views per Subject per calendar month; limit is admin-configurable per Subject (default 5). Independent of Free Tier.
```

**Rationale:** Anchor vocabulary before FR-47.

---

### 8.2 PRD §4 Features — New §4.3a or renumber

**Section:** New feature block after §4.3 Practice Mode

**OLD:** *(section does not exist)*

**NEW:**
```markdown
### 4.3a Study Mode

**Description:** Candidates browse all Published Questions for a Subject with answers and explanations visible. Access gated by Subscription or Study Tier. Realizes UJ-7.

#### FR-47: Study Mode — browse published questions with answers

[Full FR-47 text from §5 of this proposal]
```

**Rationale:** Study Mode is peer to Practice Mode, not a sub-feature.

---

### 8.3 PRD FR-5 — Clarify scope

**Section:** FR-5 consequences

**OLD:**
```markdown
- Free Tier usage does not grant Mock Exam access.
```

**NEW:**
```markdown
- Free Tier usage does not grant Mock Exam access.
- Free Tier applies to Practice Mode answered questions only; Study Mode uses Study Tier (FR-47).
```

**Rationale:** Prevent conflation of two freemium pools.

---

### 8.4 PRD FR-26 — Admin config

**Section:** FR-26 consequences

**OLD:**
```markdown
- Price is in VND; minimum 10,000 VND [ASSUMPTION: floor price].
```

**NEW:**
```markdown
- Price is in VND; minimum 10,000 VND [ASSUMPTION: floor price].
- Study Tier limit is admin-configurable per Subject (default 5 views/month).
- Free Tier limit and Study Tier limit are independently configurable.
```

**Rationale:** Ops needs control over both monetization levers.

---

### 8.5 PRD §6.1 MVP In Scope

**OLD:**
```markdown
- Practice Mode, Mock Exams, Progress Analytics.
```

**NEW:**
```markdown
- Practice Mode, Study Mode, Mock Exams, Progress Analytics.
```

---

### 8.6 PRD §11 Monetization

**OLD:**
```markdown
- **Free Tier:** Limited Practice Mode questions per Subject per month (default 20; admin-configurable).
```

**NEW:**
```markdown
- **Free Tier:** Limited Practice Mode answered questions per Subject per month (default 20; admin-configurable).
- **Study Tier:** Limited Study Mode question detail views per Subject per month (default 5; admin-configurable).
```

---

### 8.7 PRD User Journey — UJ-7 (new)

**NEW:**
```markdown
> **UJ-7. Linh browses questions to study before practicing.**
> Linh opens Pháp luật chứng khoán on the Mini App and taps "Xem tất cả câu hỏi". She scrolls the question list (Z-12), opens five questions with answers visible (Z-13), and hits her Study Tier cap (5 views this month). A paywall (Z-14) offers subscription. She switches to Practice Mode and still has her separate 20-question Free Tier for active practice.
```

---

### 8.8 UX EXPERIENCE.md — Screen table (Zalo)

**OLD:** *(no rows between Z-11 and Z-20)*

**NEW:**
```markdown
| Study question list | Z-12 | Browse Published questions (no answers); study meter | "Xem tất cả câu hỏi" on Z-11 |
| Study question detail | Z-13 | Full question with correct answer + explanation | Z-12 row tap |
| Study Tier paywall | Z-14 | 5 views cap; Subscribe CTA (FR-47) | 6th detail view or locked row |
```

**Web:** Mirror as W-12, W-13, W-14.

---

### 8.9 UX EXPERIENCE.md — Z-11 components

**OLD:**
```markdown
| Free Tier meter | Z-11, W-11 | "Đã dùng {n}/20 câu miễn phí tháng này." ...
```

**NEW:**
```markdown
| Free Tier meter | Z-11, W-11 | "Đã dùng {n}/20 câu luyện tập miễn phí tháng này." ...
| Study Tier meter | Z-11, W-11 | "Đã xem {n}/5 câu ôn miễn phí tháng này." Hidden when subscribed.
| Study CTA | Z-11, W-11 | "Xem tất cả câu hỏi" → Z-12/W-12
```

---

### 8.10 Architecture ARCHITECTURE-SPINE.md

**OLD:**
```markdown
| Practice (FR-8..9) | `api/practice` | AD-11 |
```

**NEW:**
```markdown
| Practice (FR-8..9) | `api/practice` | AD-11 |
| Study Mode (FR-47) | `api/study` | AD-11 |
```

**Module map add:** `study/` — browse list, detail, study-tier consumption

**Inherited invariants add:**
```markdown
| Per-Subject Study Tier (ICT reset) | PRD FR-47 | `entitlements` + `study` |
```

---

### 8.11 Epics — FR Coverage Map

**NEW row:**
```markdown
| FR-47 | EPIC-14 | STORY-65, STORY-66, STORY-67, STORY-68 |
```

**Epic list add:**
```markdown
- **EPIC-14: Study Mode** — STORY-65, STORY-66, STORY-67, STORY-68
```

---

## 9. Implementation Handoff

### 9.1 Scope Classification: **Moderate**

Requires backlog reorganization (new epic + stories), PRD/UX/arch artifact updates, then implementation across API and both candidate clients.

### 9.2 Handoff Recipients

| Role / Workflow | Responsibility |
|---|---|
| **bmad-prd** | Apply §8 PRD edits; add FR-47, glossary, UJ-7 |
| **bmad-ux** | Add Z-12..14, W-12..14 wireframes; update Z-11 meters and microcopy |
| **bmad-create-story** | Formalize STORY-65..68 from this proposal |
| **bmad-architecture** | Schema migration, AD-11 addendum, API contract |
| **Developer agent** | Implement after artifacts updated |
| **PO / sprint-status** | Add `epic-14` backlog entries after approval |

### 9.3 Sequencing

1. Approve this proposal  
2. `bmad-prd` + `bmad-ux` in parallel  
3. `bmad-create-story` for STORY-65..68  
4. `bmad-dev-story` STORY-65 (API) → STORY-66/67 (UI) → STORY-68 (admin)  
5. Update `sprint-status.yaml`

### 9.4 Success Criteria

- [ ] Freemium user can browse study list and view 5 question details with answers per Subject per month  
- [ ] 6th detail view shows paywall; practice Free Tier unaffected  
- [ ] Subscribed user has unlimited study views  
- [ ] Study and practice counters are independent (verified by integration test)  
- [ ] Gating is server-side — client cannot fetch answers without entitlement  
- [ ] Scope remains Subject-level (Course grouping unchanged per STORY-61)

### 9.5 Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Users confuse Study vs Practice meters | Distinct labels on Z-11; glossary in help/settings |
| Content leakage via list API | List DTO excludes answers; contract tests |
| Double paywall fatigue | Z-14 copy explains study vs practice limits |
| EPIC-6/1-4 still in review | EPIC-14 can start independently after STORY-65 API |

---

## 10. MVP Impact Statement

**MVP scope expands additively.** No epics removed or deferred. Launch Phase 1 Subjects unchanged. Study Mode increases conversion surface (read-before-buy) without replacing Practice or Mock Exams.

**Recommended priority:** Implement EPIC-14 after EPIC-6 review closes, in parallel with final EPIC-1–4 review fixes — or immediately if stakeholder prioritizes study browse over mock exam polish.

---

## 11. Workflow Completion

| Item | Value |
|---|---|
| Issue addressed | Study Mode — browse Q&A with 5 study views/month freemium per Subject |
| Change scope | **Moderate** |
| Artifacts to modify | PRD, EXPERIENCE.md, ARCHITECTURE-SPINE.md, epics.md, sprint-status.yaml |
| Routed to | bmad-prd → bmad-ux → bmad-create-story → Developer |
| Output file | `_bmad-output/planning-artifacts/sprint-change-proposal-2026-07-09-study-mode.md` |

---

*Correct Course workflow complete. This proposal is ready for Mr_Phong review. No sprint-status.yaml changes applied pending approval.*

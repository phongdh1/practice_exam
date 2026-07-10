# Practice Exam PRD Addendum

Technical and operational detail supporting the MVP PRD. Not part of the requirements narrative.

**Updated 2026-07-09:** Study Mode data model notes (Study Tier usage, StudyViewLog) — see sprint-change-proposal-2026-07-09-study-mode.

---

## Upstream Reference

Derived from product brief addendum: `_bmad-output/planning-artifacts/briefs/brief-Practice_Exam-2026-06-29/addendum.md`

---

## Core Data Model (High-Level)

```
User
  └── AuthIdentity[]

Subject
  └── SubjectPricing (monthly_amount, free_tier_limit, study_tier_limit)
  └── Question[] (via subject_id)
  └── Subscription[] (user entitlements)
  └── StudyTierUsage[] (per user, per period)
  └── StudyViewLog[] (idempotent detail views per period)

Question
  └── status: draft | in_review | published | archived
  └── QuestionVersion[] (audit)
  └── tags, difficulty, explanation, source_ref

MockExamTemplate
  └── MockExamSection[] (subject, question_count, time_minutes)
  └── MockExamAttempt[] (user, score, answers)

Subscription
  └── user_id, subject_id, status, period_start, period_end, channel

Payment
  └── user_id, amount, provider (zalopay|vnpay|momo), status, external_ref

ContentReview
  └── question_id, reviewer_id, action, comments, timestamp
```

Detailed schema, indexes, and API contracts belong in architecture docs (`bmad-architecture`).

---

## Study Tier Data Model (FR-47)

Supports Study Mode freemium gating — separate from Free Tier practice counters.

```
SubjectPricing
  └── study_tier_limit (default: 5 views/month per Subject)

StudyTierUsage
  └── user_id, subject_id, period_key (YYYY-MM, ICT)
  └── viewed_count (increments on first detail view per question per period)

StudyViewLog
  └── user_id, subject_id, question_id, period_key
  └── viewed_at
  └── unique(user_id, subject_id, question_id, period_key) — idempotent re-views
```

| Counter | Table / field | Incremented when |
|---|---|---|
| Free Tier (practice) | `free_tier_usage.used_count` | Practice Mode answer submit |
| Study Tier (browse) | `study_tier_usage.viewed_count` | First Study Mode detail view with full answer payload per question per period |

- List endpoint returns stems/metadata only — no answers in list DTO.
- Detail endpoint gates full payload via Subscription or Study Tier allowance.
- Subscribed Users skip Study Tier consumption.
- Scope is per **Subject** (not Course); aligns with STORY-61 monetization model.

---

## AuthIdentity Model

```
User
 ├── AuthIdentity (provider: zalo, external_id, ...)
 ├── AuthIdentity (provider: email, ...)
 └── AuthIdentity (provider: google, ...)
```

- One `User` owns Subscription state, Attempt History, and profile.
- Linking merges AuthIdentities under one User; see PRD FR-2, FR-3.

---

## Cross-Channel Sync

| Data | Sync behavior |
|---|---|
| Subscription status (per Subject) | Server-authoritative; reflected on web and Zalo |
| Attempt History | Server-side; available on any linked channel |
| Profile (display name, avatar) | Zalo profile preferred when linked; overridable on web |
| Payment receipts | Channel-specific provider; Entitlement at User level |

---

## Payment Flow

| Channel | Provider | Trigger |
|---|---|---|
| Zalo Mini App | ZaloPay | User subscribes to Subject in-app |
| Web | VNPay, MoMo | User subscribes on responsive web |

On success: create/extend `Subscription` for `user_id` + `subject_id`; Entitlement immediately on all linked channels.

---

## RBAC Permission Matrix (MVP)

| Capability | Super Admin | Content Editor | Reviewer | Support | Finance |
|---|---|---|---|---|---|
| Subject CRUD & pricing | ✓ | — | — | — | — |
| Question CRUD (Draft) | ✓ | ✓ | — | — | — |
| Editorial approve/reject | ✓ | — | ✓ | — | — |
| Mock Exam Template | ✓ | — | — | — | — |
| User search / profile | ✓ | — | — | ✓ | — |
| Manual Subscription grant | ✓ | — | — | ✓ | — |
| Account merge override | ✓ | — | — | ✓ | — |
| Payment log & reconciliation | ✓ | — | — | — | ✓ |
| Refunds | ✓ | — | — | — | ✓ |
| Promo codes | ✓ | — | — | — | ✓ |
| Zalo / ZaloPay config | ✓ | — | — | — | — |
| System settings | ✓ | — | — | — | — |
| RBAC admin users | ✓ | — | — | — | — |

---

## Admin Function Inventory (Reference)

Grouped inventory from brief addendum for epic decomposition. PRD FRs cover MVP subset; items below marked **defer** are not MVP requirements.

### Catalog (~10) — FR-25, FR-26, FR-27 cover MVP
- Bulk import/export subject definitions — **defer**
- Subject analytics dashboard — **defer** (basic counts in FR-39 sufficient)
- Subject duplication for exam cycles — **defer**

### Question Bank (~15) — FR-21–FR-24 cover MVP
- Question usage analytics — **defer**
- Random pool configuration UI — covered by FR-29

### Content Workflow (~8) — FR-17–FR-19 cover MVP
- SLA / aging report — **defer**
- Editor performance metrics — **defer**

### Mock Exam (~10) — FR-28–FR-30 cover MVP
- Scheduled exam releases — **defer**
- Exam analytics dashboard — **defer** (Attempt History covers candidate side)

### User Management (~10) — FR-31–FR-35 cover MVP
- User segmentation — **defer**
- Communication preferences — **defer**
- Impersonation — **defer** (see PRD §6.2)

### Payments (~10) — FR-36–FR-40 cover MVP
- Failed payment retry automation — **defer**
- Invoice generation — **defer**

### Zalo (~8) — FR-41–FR-43 cover MVP
- Zalo review compliance checklist — operational doc, not software FR
- Zalo-specific feature flags — **defer**

### RBAC & System (~10) — FR-44–FR-46 cover MVP
- API key management — **defer**
- Background job monitor — **defer**
- Data backup status — **defer** (ops tooling)

---

## Tech Direction (Non-binding)

- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL
- **Auth:** Zalo OAuth, NextAuth or equivalent for email/Google
- **Payments:** ZaloPay SDK, VNPay, MoMo gateways
- **Hosting:** TBD in architecture

---

## Post-MVP Roadmap (Not Scoped)

- B2B marketplace and creator commissions
- Affiliate program for group admins
- Additional certification verticals
- Native iOS/Android apps

---

## Launch Content Plan (from PRD §13)

**Phase 1 (go-live):** Pháp luật về chứng khoán; Phân tích báo cáo tài chính doanh nghiệp — 200 Published Questions + 1 Mock Exam Template each.

**Phase 2 (90 days):** Remaining six Subjects from the eight-program framework.

**Full sát hạch mock:** After all 8 Subjects active.

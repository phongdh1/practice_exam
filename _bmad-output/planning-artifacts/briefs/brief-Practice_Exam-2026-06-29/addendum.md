# Practice Exam — Product Brief Addendum

Supplementary detail for PRD, architecture, and solution design. Not part of the executive brief.

---

## Authentication and Identity Sync

### Providers (MVP)

| Provider | Channel | Purpose |
|---|---|---|
| Zalo OAuth | Zalo Mini App (+ web linking) | Primary channel for study-group users |
| Email/password | Web | Traditional account creation |
| Google OAuth | Web | Low-friction web sign-up |

### AuthIdentity Model

A single user account may have multiple linked identities:

```
User
 ├── AuthIdentity (provider: zalo, external_id, ...)
 ├── AuthIdentity (provider: email, ...)
 └── AuthIdentity (provider: google, ...)
```

- One `User` record owns subscription state, progress, and profile data.
- Each `AuthIdentity` maps an external provider account to the internal `User`.
- Linking flow: authenticated user on one channel can merge/link an identity from another channel (e.g., web user links Zalo account).

### Cross-Channel Sync Requirements

| Data | Sync behavior |
|---|---|
| Subscription status (per subject) | Authoritative on server; reflected on both web and Zalo |
| Practice progress / attempt history | Server-side; available on any linked channel |
| Profile (display name, avatar) | [ASSUMPTION] Zalo profile preferred when linked; overridable on web |
| Payment receipts | Channel-specific payment provider; entitlement granted at User level |

### Account Merge Rules (to define in PRD)

- Prevent duplicate active subscriptions for the same subject on merged accounts.
- Preserve progress from both accounts on merge, or prompt user to choose [ASSUMPTION: merge-all-progress default].
- Audit log for identity link/unlink events.

---

## Subscription and Entitlement Model

### Per-Subject (Môn) Subscription

- Each **Subject** (môn) is independently subscribable.
- Admin configures monthly price per subject (e.g., Môn A: 100,000 VND/month).
- Entitlement grants access to that subject's full question bank, study content, and mock exams.
- Free tier: limited practice questions per subject per month (cap admin-configurable).

### Example

| Subject | Monthly price | Free tier limit |
|---|---|---|
| Pháp luật chứng khoán | 100,000 VND | 20 questions/month |
| Phân tích báo cáo tài chính | 80,000 VND | 20 questions/month |

Exact free-tier defaults TBD in PRD.

---

## Content Editorial Workflow

```
Draft → Review → Published
         ↓
      Rejected / Revision
```

| Stage | Owner | Actions |
|---|---|---|
| **Draft** | Content editor | Create/edit questions, assign subject, tag difficulty, attach explanations |
| **Review** | Senior editor / QA | Verify answer accuracy, check legal compliance, flag copyright concerns |
| **Published** | System | Available to entitled subscribers; versioned for rollback |
| **Rejected** | Reviewer | Return to draft with notes |

### Legal and Compliance Guardrails

- Platform disclaimer: **not** an official UBCKNN examination product.
- Prohibited marketing: "guaranteed pass," "official exam questions," or implied government endorsement.
- Source attribution for community-collected content; takedown process for copyright claims.

---

## Admin Back-Office Function Inventory (~80+ functions)

Grouped by domain for PRD decomposition. Counts are approximate groupings, not final API endpoints.

### Catalog and Subject Management (~10)

- Subject CRUD (name, code, description, display order)
- Subject category / exam blueprint mapping
- Subject visibility (active, archived)
- Per-subject pricing configuration (monthly amount, currency)
- Free-tier limit configuration per subject
- Subject metadata (official exam weighting, topic tags)
- Bulk import/export subject definitions
- Subject analytics dashboard (subscribers, usage)
- Subject content version history
- Subject duplication for new exam cycles

### Question Bank (~15)

- Question CRUD (stem, options, correct answer, explanation)
- Question types (single choice, multiple choice, true/false) [ASSUMPTION: aligned with CNVCK format]
- Difficulty and topic tagging
- Media attachments (images, tables)
- Bulk import (CSV/Excel)
- Duplicate detection
- Question versioning and audit trail
- Question search and filter (subject, status, tag, author)
- Batch status transitions (draft/review)
- Question usage analytics (attempt rate, error rate)
- Flagged-question queue (user reports)
- Question retirement / archival
- Reference source field (community origin tracking)
- Random pool configuration for mock exams
- Question preview (candidate view)

### Content Workflow (~8)

- Editorial queue (pending review)
- Assign reviewer
- Approve / reject with comments
- Publish batch
- Unpublish / emergency takedown
- Workflow status dashboard
- SLA / aging report for pending items
- Editor performance metrics

### Mock Exam (~10)

- Mock exam template CRUD
- Map exam structure to official CNVCK blueprint (subject mix, question count, duration)
- Auto-generate exam from question pools (by difficulty/topic rules)
- Fixed vs. randomized exam modes
- Time limit configuration
- Passing score threshold
- Exam attempt limits (per user, per period)
- Exam result review (candidate-facing explanations)
- Exam analytics (completion rate, score distribution)
- Scheduled exam releases

### User Management (~10)

- User search and profile view
- Subscription status per subject
- Manual subscription grant/revoke (support)
- Account merge (identity linking override)
- User activity log
- Ban / suspend account
- Export user data (GDPR-style request) [ASSUMPTION: basic export for compliance]
- User segmentation (free, paid, churned)
- Communication preferences
- Impersonation (support/debug, audited)

### Payments (~10)

- Payment transaction log
- ZaloPay reconciliation
- VNPay reconciliation
- MoMo reconciliation [ASSUMPTION]
- Refund processing
- Failed payment retry status
- Revenue report by subject
- Revenue report by channel (web vs. Zalo)
- Promo code / discount management [ASSUMPTION: basic promo for launch]
- Invoice / receipt generation

### Zalo Integration (~8)

- Zalo Mini App configuration (app ID, secrets)
- Zalo OAuth settings
- ZaloPay merchant configuration
- Mini App version / deployment status
- Zalo user mapping diagnostics
- Webhook log (payment, auth events)
- Zalo-specific content/feature flags
- Zalo review compliance checklist

### RBAC and System (~10)

- Role definitions (super admin, content editor, reviewer, support, finance)
- Permission matrix per role
- Admin user CRUD
- Login audit log
- System settings (maintenance mode, global disclaimers)
- Email template management
- Notification configuration
- API key management (internal integrations)
- Background job monitor
- Data backup status [ASSUMPTION: ops visibility in admin]

---

## Core Data Model (High-Level)

```
User
  └── AuthIdentity[]

Subject
  └── SubjectPricing (monthly_amount, free_tier_limit)
  └── Question[] (via subject_id)
  └── Subscription[] (user entitlements)

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

Detailed schema, indexes, and API contracts belong in architecture docs.

---

## Payment Flow Summary

| Channel | Provider | Trigger |
|---|---|---|
| Zalo Mini App | ZaloPay | User subscribes to subject in-app |
| Web | VNPay, MoMo | User subscribes on responsive web |

On successful payment: create/extend `Subscription` for `user_id` + `subject_id`; entitlement immediately available on all linked channels.

---

## Future Roadmap (Post-MVP, Not Scoped)

- **B2B marketplace:** Third-party creators publish subject content; platform commission on sales.
- **Affiliate program:** Group admins earn referral commission for subscriber sign-ups.
- **Additional verticals:** Other professional certifications beyond CNVCK.
- **Native apps:** iOS/Android if Zalo + web prove insufficient.

---
title: Practice Exam — CNVCK Certification Prep (MVP)
status: final
created: 2026-06-29
updated: 2026-07-09
changelog:
  - "2026-07-09: Study Mode (FR-47), Study Tier freemium, UJ-7 — sprint-change-proposal-2026-07-09-study-mode"
---

# PRD: Practice Exam — CNVCK Certification Prep (MVP)

*MVP scope only. Finalized 2026-06-29. Builds on product brief `brief-Practice_Exam-2026-06-29` and its addendum.*

## 0. Document Purpose

This PRD defines **MVP functional and non-functional requirements** for Practice Exam — a CNVCK (Chứng chỉ nghiệp vụ chứng khoán) certification prep platform delivered via responsive web and Zalo Mini App. It is written for product stakeholders, UX (`bmad-ux`), architecture (`bmad-architecture`), and epic/story decomposition (`bmad-create-epics-and-stories`).

The document uses a **Glossary-anchored vocabulary**, features grouped with globally numbered FRs (FR-1…FR-N), user journeys (UJ-1…UJ-N), and success metrics (SM-1…). Inline `[ASSUMPTION]` tags flag inferred decisions; all are indexed in §9. Technical data models, payment integration detail, and the full admin function inventory live in `addendum.md` — this PRD states *what* the system must do, not *how* it is built.

**Upstream inputs:** `_bmad-output/planning-artifacts/briefs/brief-Practice_Exam-2026-06-29/brief.md`, `addendum.md`.

## 1. Vision

CNVCK candidates in Vietnam study in Zalo groups, share PDFs, and rely on unofficial question dumps — with no quality control, no exam-faithful practice, and no progress continuity when they switch between phone and laptop.

Practice Exam is the **affordable, per-subject practice layer** that meets candidates where they already study. A learner subscribes only to the **Subjects** (môn) they need, practices curated questions with explanations, takes **Mock Exams** that mirror the official CNVCK structure, and sees **Progress Analytics** that reveal strengths and gaps. The same **User** account works on web and Zalo Mini App; subscriptions and attempt history follow them across channels.

MVP proves one vertical (CNVCK) and one business model (freemium → per-Subject monthly subscription). Success is measured by conversion, content quality, and cross-channel reliability — not feature breadth. The moat is execution: accurate content, Zalo distribution, and modular pricing.

## 2. Target User

### 2.1 Jobs To Be Done

**CNVCK Candidate (primary)**

- **Functional:** Practice exam-style questions per Subject; simulate the real exam format; track improvement over time.
- **Emotional:** Feel confident I am studying the right material, not wasting time on wrong answers.
- **Social:** Stay credible in my Zalo study group without buying an expensive all-subject bundle.
- **Contextual:** Study on my phone inside Zalo during commutes; continue on web at home without losing progress.

**Content Editor (secondary)**

- **Functional:** Curate questions from community sources, tag and explain them, move content through editorial review to publication.
- **Emotional:** Trust that published content is accurate and legally safe.

**Platform Admin (secondary)**

- **Functional:** Configure Subject catalog and pricing, manage subscriptions and payments, operate the Zalo Mini App integration, support users.

### 2.2 Non-Users (MVP)

- **B2B buyers** seeking institutional licenses or bulk seat packages.
- **Third-party content creators** publishing and selling their own Subject packs.
- **Group admins** earning affiliate commissions on referrals.
- **Candidates for certifications other than CNVCK** (future verticals).
- **Users expecting native iOS/Android apps** (web + Zalo Mini App only in MVP).

### 2.3 Key User Journeys

> **UJ-1. Linh tries free practice inside her Zalo study group.**
> Linh, 26, works at a securities firm and is preparing for CNVCK. She sees a link to the Practice Exam Zalo Mini App shared in her study group. She opens it, signs in with **Zalo OAuth**, and lands on the Subject catalog. She selects **Pháp luật chứng khoán** and starts **Practice Mode**. She answers 5 questions, sees immediate feedback with explanations, and hits her **Free Tier** cap (20 questions this month). A paywall shows the monthly price (100,000 VND) and a **Subscribe** button. She dismisses it for now but bookmarks the Mini App. **Edge case:** if Zalo OAuth fails, she sees a clear error and a retry action — no silent failure.

> **UJ-2. Linh subscribes on Zalo and practices without limits.**
> A week later Linh returns to the Mini App, still authenticated. She taps **Subscribe** on Pháp luật chứng khoán, completes payment via **ZaloPay**, and immediately gains full access to that Subject's question bank and Mock Exams. She completes a 30-question practice session; her **Attempt History** and score are saved server-side. **Climax:** she sees "Subscription active until [date]" and unlimited practice for that Subject. **Resolution:** she plans to take a full Mock Exam next weekend.

> **UJ-3. Minh studies on web and links his Zalo account.**
> Minh registered on the responsive web app with **Google OAuth** and subscribed to **Phân tích báo cáo tài chính** via **VNPay**. He later opens the Zalo Mini App and chooses **Link Account**. After Zalo OAuth, the system merges his Zalo identity into his existing **User** record. His web subscription and all **Attempt History** appear in the Mini App without duplicate charges. **Edge case:** if he had started a separate Zalo-only account with free-tier usage, the system merges progress from both accounts [ASSUMPTION: merge-all-progress default] and deduplicates any active Subscription for the same Subject.

> **UJ-4. Linh takes a CNVCK-faithful Mock Exam.**
> Linh, now subscribed to two Subjects, starts a **Mock Exam** configured to match the official CNVCK blueprint (section mix, question count, time limit). She works through timed sections, submits, and receives a score with pass/fail against the configured threshold. She reviews each question with explanations. Her Mock Exam attempt is recorded in **Progress Analytics** alongside her practice sessions. **Climax:** the results screen shows section-level breakdown matching official Subject weighting.

> **UJ-5. Editor Hương publishes a reviewed question.**
> Hương, a content editor, logs into the **Admin Back-Office**, creates a new **Question** in **Draft** status for Pháp luật chứng khoán, tags difficulty and topic, attaches an explanation and source reference, and submits for review. A reviewer approves it; the Question moves to **Published** and becomes available to entitled Subscribers. **Edge case:** if the reviewer rejects it, Hương receives rejection notes and the Question returns to Draft.

> **UJ-6. Admin Trung configures a new Subject and price.**
> Trung, a platform admin, creates a new Subject in the catalog, sets monthly price, **Free Tier** limit (20 questions/month), and **Study Tier** limit (5 views/month), and activates it. Candidates on web and Zalo see the Subject within minutes. Trung monitors payment reconciliation and subscription counts per Subject in the admin dashboard.

> **UJ-7. Linh browses questions to study before practicing.**
> Linh opens Pháp luật chứng khoán on the Mini App and taps "Xem tất cả câu hỏi". She scrolls the question list (Z-12), opens five questions with answers visible (Z-13), and hits her Study Tier cap (5 views this month). A paywall (Z-14) offers subscription. She switches to Practice Mode and still has her separate 20-question Free Tier for active practice.

## 3. Glossary

- **Admin Back-Office** — Authenticated web application for content editors, reviewers, and platform operators. Distinct from the candidate-facing surfaces.
- **Attempt History** — Server-side record of a User's practice sessions and Mock Exam attempts, including answers, scores, and timestamps.
- **AuthIdentity** — A linked external login (Zalo, email, or Google) mapped to exactly one User.
- **Candidate** — A User preparing for the CNVCK exam using Practice Exam surfaces.
- **CNVCK** — Chứng chỉ nghiệp vụ chứng khoán; the securities professional certification exam in Vietnam. MVP covers this certification only.
- **Content Editor** — Admin Back-Office role that creates and edits Questions in Draft status.
- **Entitlement** — A User's right to access full content for a Subject, granted by an active Subscription or limited by Free Tier and Study Tier rules. An active Subscription grants unlimited Practice Mode and Study Mode for that Subject.
- **Free Tier** — Unpaid **Practice Mode** allowance — answered questions per Subject per calendar month (ICT reset); limit is admin-configurable per Subject (default 20). Independent of Study Tier.
- **Mock Exam** — A timed, structured assessment generated from a Mock Exam Template that mirrors the official CNVCK exam blueprint.
- **Mock Exam Template** — Admin-defined configuration specifying Subject sections, question counts, duration, passing threshold, and pool rules.
- **Practice Mode** — Untimed (or loosely timed) question-by-question practice with immediate feedback and explanations after each answer. Free Tier counts answered questions.
- **Study Mode** — Browse-all-questions review for a Subject: candidates read stems, correct answers, and explanations without answering first. Study Tier counts detail views (default 5/month per Subject).
- **Study Tier** — Unpaid Study Mode access allowing a limited number of question detail views per Subject per calendar month; limit is admin-configurable per Subject (default 5). Independent of Free Tier.
- **Progress Analytics** — Candidate-facing views of Attempt History, scores over time, and Subject-level strength/gap summaries.
- **Published** — Question lifecycle status indicating availability to entitled Candidates.
- **Question** — A single assessable item (stem, answer options, correct answer, explanation) belonging to one Subject.
- **Reviewer** — Admin Back-Office role that approves or rejects Questions in the editorial workflow.
- **Subject** — A curricular unit (môn) within CNVCK; independently priced and subscribable.
- **Subscription** — A time-bounded Entitlement (monthly) for one User on one Subject, created or extended by successful payment or manual admin grant.
- **UBCKNN** — State Securities Commission of Vietnam. Practice Exam is **not** an official UBCKNN product.
- **User** — A single account owning AuthIdentities, Subscriptions, Attempt History, and profile data.
- **Zalo Mini App** — Candidate-facing surface inside the Zalo ecosystem, using Zalo OAuth and ZaloPay.

## 4. Features

### 4.1 Authentication and Identity

**Description:** Candidates authenticate via Zalo OAuth (Zalo Mini App), email/password (web), or Google OAuth (web). One User may link multiple AuthIdentities. Account linking merges identity and syncs Subscription and Attempt History across web and Zalo Mini App. Realizes UJ-1, UJ-3.

**Functional Requirements:**

#### FR-1: Multi-provider sign-in

A Candidate can sign in or register using Zalo OAuth, email/password, or Google OAuth on the appropriate surface. Realizes UJ-1, UJ-3.

**Consequences (testable):**
- Zalo OAuth is available only on the Zalo Mini App [ASSUMPTION: Zalo OAuth on web limited to account-linking flow, not primary web sign-up].
- Email/password and Google OAuth are available on the responsive web app.
- Each successful authentication creates or resolves exactly one User and one AuthIdentity for that provider.
- Failed authentication displays a user-visible error with retry; no partial session is created.

#### FR-2: Account linking across channels

An authenticated User on one surface can link an AuthIdentity from another provider/channel to their existing User. Realizes UJ-3.

**Consequences (testable):**
- Linking requires the User to be authenticated on the initiating surface before the secondary provider OAuth completes.
- After linking, Subscription status and Attempt History for the User are identical on web and Zalo Mini App.
- Linking the same external provider account to a different User is rejected.
- Identity link and unlink events are recorded in an audit log accessible to admins.

#### FR-3: Account merge on link

When linking would merge two existing User records, the system combines Attempt History from both and prevents duplicate active Subscriptions for the same Subject. Realizes UJ-3.

**Consequences (testable):**
- All Attempt History records from both Users are retained under the surviving User [ASSUMPTION: merge-all-progress default].
- If both Users hold an active Subscription for the same Subject, the longer-valid period is retained and the duplicate is voided without double billing.
- The merged User sees a confirmation summary of combined Subscriptions and attempt counts.

**Feature-specific NFRs:**
- Session tokens expire per industry-standard durations; refresh is supported on both surfaces.

---

### 4.2 Subject Catalog and Subscriptions

**Description:** Candidates browse active Subjects, see pricing and Free Tier limits, and subscribe per Subject on a monthly basis. Entitlement is enforced server-side and reflected on all linked channels. Realizes UJ-1, UJ-2, UJ-6.

**Functional Requirements:**

#### FR-4: Subject catalog (candidate)

A Candidate can view all active Subjects with name, description, monthly price, and Free Tier limit. Realizes UJ-1, UJ-6.

**Consequences (testable):**
- Only Subjects with active visibility appear in the catalog.
- Archived Subjects are hidden from Candidates but remain in admin views.
- Price and Free Tier limit match admin configuration at time of display.

#### FR-5: Free Tier practice access

A Candidate without a Subscription for a Subject can answer Practice Mode questions up to that Subject's monthly Free Tier limit. Realizes UJ-1.

**Consequences (testable):**
- Free Tier counter resets on the first day of each calendar month per User per Subject.
- Default Free Tier limit is 20 questions per Subject per month [ASSUMPTION: aligns with brief example; admin-overridable per Subject].
- When the limit is reached, Practice Mode displays a subscribe prompt; no additional free questions are served until the next month.
- Free Tier usage does not grant Mock Exam access.
- Free Tier applies to Practice Mode answered questions only; Study Mode uses Study Tier (FR-47).

#### FR-6: Per-Subject Subscription purchase

A Candidate can purchase a monthly Subscription for one Subject at the configured price on the appropriate payment channel. Realizes UJ-2, UJ-3.

**Consequences (testable):**
- Zalo Mini App uses ZaloPay; responsive web uses VNPay and MoMo [ASSUMPTION: MoMo included alongside VNPay].
- On successful payment, Subscription is active immediately and Entitlement is granted on all linked channels.
- Subscription period is one calendar month from activation (or extension from current period end if already active).
- Failed or cancelled payment does not create or extend Subscription.
- Candidate sees Subscription status and expiry date per Subject.

#### FR-7: Subscription renewal

An active Subscription auto-expires at period end unless renewed by payment. Realizes UJ-2.

**Consequences (testable):**
- Expired Subscription revokes full Entitlement; Candidate retains Free Tier access only.
- Renewal payment extends the period by one month from the previous period end (or from payment date if already expired).
- Candidate receives in-app notice when Subscription expires within 3 days [ASSUMPTION: renewal reminder window].

**Notes:** `[NOTE FOR PM]` Auto-renew via saved payment method is out of MVP — manual renewal only.

---

### 4.3 Practice Mode

**Description:** Candidates practice Questions one at a time with immediate feedback and explanations. Access is gated by Entitlement or Free Tier. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-8: Practice session

A Candidate with Entitlement or remaining Free Tier allowance can start a Practice Mode session for a Subject. Realizes UJ-1, UJ-2.

**Consequences (testable):**
- Only Published Questions for the selected Subject are served.
- Supported Question types: single choice, multiple choice, true/false [ASSUMPTION: aligned with CNVCK format].
- After each answer, the Candidate sees correct/incorrect status and the Question explanation.
- Each answered Question in Practice Mode increments the Free Tier counter when applicable.
- Session progress is persisted; a Candidate can exit and resume an in-progress practice session within 24 hours [ASSUMPTION: session TTL].

#### FR-9: Question reporting

A Candidate can flag a Published Question as potentially incorrect from Practice Mode or Mock Exam review. Realizes UJ-4.

**Consequences (testable):**
- Flag creates an entry in the admin flagged-question queue with User, Question, and optional comment.
- Flagging does not remove the Question from circulation in MVP.

---

### 4.3a Study Mode

**Description:** Candidates browse all Published Questions for a Subject with answers and explanations visible. Access gated by Subscription or Study Tier. Realizes UJ-7.

**Functional Requirements:**

#### FR-47: Study Mode — browse published questions with answers

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

### 4.4 Mock Exams

**Description:** Subscribed Candidates take timed Mock Exams structured per Mock Exam Templates that mirror the official CNVCK blueprint. Results include scores, pass/fail, and per-section breakdown with explanations. Realizes UJ-4.

**Functional Requirements:**

#### FR-10: Mock Exam availability

A Candidate with an active Subscription for all Subjects covered by a Mock Exam Template can start that Mock Exam. Realizes UJ-4.

**Consequences (testable):**
- Free Tier Candidates cannot start Mock Exams.
- Available Mock Exams are listed with duration, question count, and Subjects covered.
- Attempt limits per User per Mock Exam Template are enforced per admin configuration [ASSUMPTION: default 3 attempts per month per template].

#### FR-11: Timed Mock Exam execution

A Candidate can complete a Mock Exam within the configured time limit, section by section. Realizes UJ-4.

**Consequences (testable):**
- Timer counts down per exam rules; auto-submit occurs when time expires.
- Candidate navigates forward-only within the current section; backward navigation to prior sections is blocked during the timed attempt.
- Before final submit, Candidate can review and change answers across all sections; submit is explicit and irreversible.
- Answers are saved incrementally; connection loss does not lose submitted section answers.
- On submit, score is calculated against the configured passing threshold.

#### FR-12: Mock Exam results and review

After submitting a Mock Exam, a Candidate sees overall score, pass/fail, section breakdown, and can review each Question with explanation. Realizes UJ-4.

**Consequences (testable):**
- Results persist in Attempt History permanently.
- Section breakdown percentages align with Mock Exam Template Subject weights.
- Explanations are shown for all Questions regardless of answer correctness.

---

### 4.5 Progress Analytics

**Description:** Candidates view practice and Mock Exam performance over time, per Subject. Realizes UJ-2, UJ-4.

**Functional Requirements:**

#### FR-13: Attempt History

A Candidate can view a chronological list of Practice Mode sessions and Mock Exam attempts with dates, Subjects, and scores. Realizes UJ-2, UJ-4.

**Consequences (testable):**
- History is identical on web and Zalo Mini App for the same User.
- Each entry links to session detail (questions answered, correctness, explanations for Mock Exams).

#### FR-14: Subject performance summary

A Candidate can view per-Subject aggregates: questions attempted, correctness rate, and Mock Exam scores over the last 30/90 days. Realizes UJ-4.

**Consequences (testable):**
- Summary updates within 5 minutes of session completion.
- Subjects with no attempts show an empty state with a CTA to practice.

---

### 4.6 Legal Compliance and Disclaimers

**Description:** The platform displays required legal disclaimers and prohibits misleading exam claims across all candidate surfaces and marketing content. Realizes all candidate UJs.

**Functional Requirements:**

#### FR-15: Platform disclaimer

All candidate surfaces display a persistent disclaimer that Practice Exam is not an official UBCKNN examination product. Realizes UJ-1.

**Consequences (testable):**
- Disclaimer is visible on first visit and accessible from footer/settings at all times.
- Disclaimer text is admin-configurable without code deploy [ASSUMPTION: CMS field in system settings].

#### FR-16: Prohibited claims enforcement

The system and Admin Back-Office prevent publication of content or marketing copy containing "guaranteed pass," "official exam questions," or implied government endorsement. Realizes UJ-5.

**Consequences (testable):**
- Question and Subject description fields are scanned or manually reviewed for prohibited phrases before Published status.
- Admin-editable marketing banners are subject to the same policy.

---

### 4.7 Content Editorial Workflow

**Description:** Content Editors create Questions in Draft; Reviewers approve or reject; approved Questions become Published. Supports source attribution and emergency takedown. Realizes UJ-5.

**Functional Requirements:**

#### FR-17: Question lifecycle

A Content Editor can create and edit Questions in Draft status; a Reviewer can transition Questions to Published or back to Draft with rejection notes. Realizes UJ-5.

**Consequences (testable):**
- Lifecycle states: Draft → In Review → Published; Rejected returns to Draft with reviewer comments.
- Published Questions are versioned; edits create a new Draft version requiring re-review before replacing Published [ASSUMPTION: version-on-edit].
- Only Published Questions are served to Candidates.

#### FR-18: Editorial queue

A Reviewer can view a queue of Questions pending review, assign themselves, and approve or reject with comments. Realizes UJ-5.

**Consequences (testable):**
- Queue is filterable by Subject, author, and age.
- Rejection requires a non-empty comment.
- Approval triggers Published status atomically.

#### FR-19: Emergency unpublish

An admin or reviewer can unpublish a Question immediately, removing it from Candidate surfaces. Realizes UJ-5.

**Consequences (testable):**
- Unpublished Questions remain in the bank as Archived and are excluded from practice and exam pools.
- Unpublish action is audit-logged with actor and reason.

#### FR-20: Source attribution

A Content Editor can record a source reference (community origin, document link) on each Question. Realizes UJ-5.

**Consequences (testable):**
- Source reference is stored and visible to admins; not shown to Candidates in MVP.

---

### 4.8 Question Bank Management (Admin)

**Description:** Admins and editors manage the Question bank: CRUD, tagging, bulk import, search, and preview. Realizes UJ-5, UJ-6.

**Functional Requirements:**

#### FR-21: Question CRUD

A Content Editor can create, read, update, and archive Questions with stem, options, correct answer, explanation, difficulty, and topic tags. Realizes UJ-5.

**Consequences (testable):**
- Questions belong to exactly one Subject.
- Media attachments (images) are supported [ASSUMPTION: images only in MVP; tables as images].
- Duplicate detection warns when stem text closely matches an existing Question.

#### FR-22: Bulk import

A Content Editor can bulk-import Questions via CSV/Excel template. Realizes UJ-5.

**Consequences (testable):**
- Import creates Questions in Draft status only.
- Import report lists row-level errors without partial silent failure.
- Maximum 500 Questions per import batch [ASSUMPTION: batch limit].

#### FR-23: Question search and filter

Admin users can search and filter Questions by Subject, status, difficulty, topic, and author. Realizes UJ-5.

**Consequences (testable):**
- Search returns results within 2 seconds for banks up to 10,000 Questions per Subject.

#### FR-24: Candidate-view preview

A Content Editor can preview a Question as it will appear to Candidates. Realizes UJ-5.

**Consequences (testable):**
- Preview matches Practice Mode rendering including explanation reveal behavior.

---

### 4.9 Subject and Catalog Management (Admin)

**Description:** Admins configure the Subject catalog, pricing, Free Tier limits, and exam blueprint metadata. Realizes UJ-6.

**Functional Requirements:**

#### FR-25: Subject CRUD

An admin can create, update, archive, and reorder Subjects. Realizes UJ-6.

**Consequences (testable):**
- Each Subject has: name, code, description, display order, visibility status.
- Archived Subjects are hidden from Candidates; existing Subscriptions remain valid until expiry.
- A Subject cannot be set to active visibility until it has ≥ 200 Published Questions and at least one approved Mock Exam Template (§13.1 go-live gate).

#### FR-26: Subject pricing configuration

An admin can set monthly Subscription price, Free Tier question limit, and Study Tier view limit per Subject. Realizes UJ-6.

**Consequences (testable):**
- Price is in VND; minimum 10,000 VND [ASSUMPTION: floor price].
- Study Tier limit is admin-configurable per Subject (default 5 views/month).
- Free Tier limit and Study Tier limit are independently configurable.
- Price changes apply to new purchases only; active Subscriptions retain purchase-time price until renewal.

#### FR-27: Exam blueprint metadata

An admin can map Subject metadata to official CNVCK exam weighting (topic tags, section weight percentages). Realizes UJ-4, UJ-6.

**Consequences (testable):**
- Weight percentages per Subject sum to 100% within a Mock Exam Template.
- Metadata is used in Mock Exam section breakdown and Progress Analytics.

---

### 4.10 Mock Exam Configuration (Admin)

**Description:** Admins define Mock Exam Templates, generate exams from question pools, and configure attempt limits and passing thresholds. Realizes UJ-4, UJ-6.

**Functional Requirements:**

#### FR-28: Mock Exam Template CRUD

An admin can create and edit Mock Exam Templates with sections (Subject, question count, time limit), total duration, and passing score threshold. Realizes UJ-4.

**Consequences (testable):**
- Template specifies fixed vs. randomized Question selection per section [ASSUMPTION: both modes supported in MVP].
- Randomized selection draws only from Published Questions tagged to the section's Subject and difficulty rules.

#### FR-29: Exam pool rules

An admin can configure difficulty/topic distribution rules for auto-generated Mock Exams. Realizes UJ-4.

**Consequences (testable):**
- Auto-generation fails with a clear admin error if the pool lacks sufficient Published Questions.
- Generated exams are previewable before release to Candidates.

#### FR-30: Mock Exam attempt limits

An admin can set per-User attempt limits per Mock Exam Template per time period. Realizes UJ-4.

**Consequences (testable):**
- Default: 3 attempts per User per template per calendar month [ASSUMPTION].
- Candidate sees remaining attempts before starting.

---

### 4.11 User and Subscription Management (Admin)

**Description:** Support and admin staff manage Users, Subscriptions, account merges, and basic compliance exports. Realizes UJ-3, UJ-6.

**Functional Requirements:**

#### FR-31: User search and profile

A support admin can search Users and view profile, AuthIdentities, Subscriptions, and Attempt History summary. Realizes UJ-3.

**Consequences (testable):**
- Search by email, phone, Zalo ID, or internal User ID.
- Profile shows all linked AuthIdentities with link dates.

#### FR-32: Manual Subscription grant/revoke

A support admin can manually grant or revoke a Subscription for a User and Subject with audit reason. Realizes UJ-6.

**Consequences (testable):**
- Manual grant creates Entitlement immediately on all channels.
- Revoke removes Entitlement immediately; action is audit-logged.

#### FR-33: Account merge override

A support admin can force-merge two User accounts with the same rules as FR-3. Realizes UJ-3.

**Consequences (testable):**
- Force-merge requires a mandatory support ticket reference.
- Audit log records both User IDs and resulting survivor.

#### FR-34: User data export

A support admin can export a User's personal data and Attempt History on request. Realizes compliance.

**Consequences (testable):**
- Export is JSON or CSV, delivered within admin UI download [ASSUMPTION: basic GDPR-style export for MVP].
- Export action is audit-logged.

#### FR-35: Account suspension

An admin can suspend a User account, blocking sign-in and practice. Realizes UJ-6.

**Consequences (testable):**
- Suspended User sees a generic account-disabled message on sign-in.
- Active Subscriptions are frozen, not cancelled; no refund automation in MVP.

---

### 4.12 Payments (Admin)

**Description:** Admins view payment transactions, reconcile provider records, process refunds, and view revenue reports. Realizes UJ-2, UJ-6.

**Functional Requirements:**

#### FR-36: Payment transaction log

An admin can view all payment transactions with User, Subject, amount, provider, status, and external reference. Realizes UJ-2.

**Consequences (testable):**
- Log is filterable by provider (ZaloPay, VNPay, MoMo), date range, and status.
- Each successful transaction maps to exactly one Subscription activation or extension.

#### FR-37: Provider reconciliation views

A finance admin can view reconciliation summaries per provider per day. Realizes UJ-6.

**Consequences (testable):**
- Summary shows transaction count, gross revenue, failed count, and pending count.
- Discrepancies between provider webhook and internal record are flagged.

#### FR-38: Refund processing

A finance admin can initiate a refund for a payment with audit reason. Realizes UJ-6.

**Consequences (testable):**
- Refund revokes or shortens Subscription proportionally [ASSUMPTION: refund revokes current period].
- Refund status is tracked; provider confirmation is required.

#### FR-39: Revenue reports

A finance admin can view revenue by Subject and by channel (web vs. Zalo). Realizes UJ-6.

**Consequences (testable):**
- Report supports date range filter and CSV export.
- Revenue is attributed at payment confirmation timestamp.

#### FR-40: Promo codes

An admin can create promo codes offering a percentage or fixed discount on Subject Subscription. Realizes UJ-2.

**Consequences (testable):**
- Promo code has expiry date, usage limit, and applicable Subject(s) [ASSUMPTION: basic promo for launch].
- Discount applies at checkout only; one code per purchase.

---

### 4.13 Zalo Integration (Admin)

**Description:** Admins configure Zalo Mini App, OAuth, ZaloPay, and monitor webhooks. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-41: Zalo Mini App configuration

An admin can configure Zalo Mini App credentials (app ID, secrets) and view deployment status. Realizes UJ-1.

**Consequences (testable):**
- Invalid credentials surface a diagnostic error in admin without exposing secrets to Candidates.
- Configuration changes require super-admin role.

#### FR-42: ZaloPay merchant configuration

An admin can configure ZaloPay merchant settings and test payment flow. Realizes UJ-2.

**Consequences (testable):**
- Test mode payments do not create production Subscriptions.
- Webhook endpoint logs all payment events.

#### FR-43: Zalo webhook log

An admin can view webhook events for Zalo OAuth and ZaloPay with payload status and errors. Realizes UJ-2.

**Consequences (testable):**
- Log retains 90 days of events [ASSUMPTION: retention window].
- Failed webhooks are retryable manually from admin.

---

### 4.14 RBAC and System Settings (Admin)

**Description:** Role-based access control and global system configuration for the Admin Back-Office. Realizes UJ-5, UJ-6.

**Functional Requirements:**

#### FR-44: Role-based access

An admin can assign roles (super admin, content editor, reviewer, support, finance) with defined permission boundaries. Realizes UJ-5, UJ-6.

**Consequences (testable):**
- Content editors cannot access payment or Zalo configuration.
- Finance role cannot publish Questions.
- Super admin has full access.
- Permission matrix is documented in `addendum.md`.

#### FR-45: Admin user management

A super admin can create, disable, and assign roles to admin users. Realizes UJ-6.

**Consequences (testable):**
- Disabled admin cannot sign in.
- Admin login events are audit-logged.

#### FR-46: System settings

A super admin can configure maintenance mode, global disclaimer text, and email notification templates. Realizes FR-15.

**Consequences (testable):**
- Maintenance mode shows a branded message to Candidates and blocks practice; admin access remains.
- Disclaimer text changes propagate to all surfaces within 5 minutes.

---

## 5. Non-Goals (Explicit)

- **Not an official UBCKNN product** — no branding, claims, or positioning that implies government endorsement.
- **Not a course marketplace** — no third-party creators, commissions, or user-generated Question banks in MVP.
- **Not B2B** — no institutional licensing, seat management, or invoicing for enterprises.
- **Not an affiliate platform** — group admins do not earn referral revenue in MVP.
- **Not multi-vertical** — certifications beyond CNVCK are out of scope.
- **Not native mobile** — no iOS/Android app; responsive web and Zalo Mini App only.
- **Not auto-renew subscriptions** — Candidates manually renew each month in MVP.
- **Not a social network** — no study groups, chat, or forums inside the product.
- **Not live proctoring** — Mock Exams are self-paced practice, not invigilated tests.

## 6. MVP Scope

### 6.1 In Scope

- CNVCK certification content only.
- Responsive web app (candidate) + Zalo Mini App (candidate) + Admin Back-Office (web).
- Per-Subject monthly Subscription with admin-configurable pricing and Free Tier limits.
- Multi-provider auth (Zalo, email, Google) with cross-channel account linking and sync.
- Practice Mode, Study Mode, Mock Exams, Progress Analytics.
- Full editorial workflow (Draft → Review → Published) with source attribution.
- Question bank management with bulk import and candidate preview.
- Mock Exam Templates with CNVCK blueprint mapping.
- Payments: ZaloPay (Zalo), VNPay and MoMo (web).
- Admin: catalog, pricing, users, subscriptions, payments, Zalo config, RBAC, basic promo codes.
- Legal disclaimers and prohibited-claims guardrails.
- User data export on request.

### 6.2 Out of Scope for MVP

| Item | Reason |
|---|---|
| B2B / enterprise licensing | Deferred to post-MVP marketplace phase |
| Creator marketplace and commissions | Requires creator onboarding, revenue split, quality governance |
| Affiliate program for group admins | Requires attribution tracking and payout infrastructure |
| Additional certification verticals | Prove CNVCK first |
| Native iOS/Android apps | Zalo Mini App + responsive web sufficient for validation |
| Auto-renew / saved payment methods | Manual renewal reduces payment integration complexity |
| In-app study groups / chat | Candidates already use Zalo groups externally |
| Live tutoring or video courses | Practice-focused MVP only |
| Advanced AI adaptive learning | Progress analytics sufficient for v1 |
| Invoice generation for tax | Deferred post-MVP (§14 #2); basic payment receipt only at launch |
| Impersonation mode for support | Audit-heavy; defer unless support volume demands it |

## 7. Success Metrics

**Primary**

- **SM-1: Free-to-paid conversion** — % of Users who activate at least one paid Subscription within 30 days of first practice. **Target:** ≥ 8% within 90 days of launch. Validates FR-5, FR-6.
- **SM-2: Mock Exam completion rate** — % of started Mock Exams that are submitted (not abandoned). **Target:** ≥ 70%. Validates FR-10, FR-11.
- **SM-3: Cross-channel consistency** — % of linked Users who see identical Subscription state on web and Zalo within 1 minute of payment. **Target:** 100%. Validates FR-2, FR-3, FR-6.

**Secondary**

- **SM-4: Practice score improvement** — Average correctness rate in second month vs. first month for Users with ≥ 50 practice questions. **Target:** ≥ 10 percentage-point improvement. Validates FR-8, FR-14.
- **SM-5: Content quality** — Flagged-question rate (flags per 1,000 attempts). **Target:** < 5. Validates FR-9, FR-17.
- **SM-6: Zalo Mini App adoption** — % of active Users whose last session was on Zalo Mini App. **Target:** ≥ 50% within 60 days. Validates FR-1, FR-41.

**Counter-metrics (do not optimize)**

- **SM-C1: Free Tier abuse** — Accounts with Free Tier usage on > 5 Subjects without any Subscription intent. Counterbalances SM-1; high values indicate limits are too generous, not that acquisition is strong.
- **SM-C2: Refund rate** — Refunds as % of successful payments. Counterbalances revenue growth; optimize for < 3%, not zero (zero may indicate refund friction harming trust).

## 8. Cross-Cutting NFRs

- **Performance:** Candidate-facing pages load in < 3s on 4G; Practice Mode question transition < 500ms p95.
- **Availability:** 99.5% uptime monthly for candidate surfaces during study hours (06:00–23:00 ICT).
- **Security:** All traffic TLS 1.2+; passwords hashed with bcrypt or equivalent; OAuth tokens stored encrypted; PCI scope minimized via provider-hosted payment pages.
- **Data residency:** User and Attempt History data stored in Vietnam or ASEAN region [ASSUMPTION: aligns with target user base].
- **Accessibility:** Responsive web meets WCAG 2.1 AA for candidate flows; Zalo Mini App follows Zalo platform accessibility guidelines.
- **Observability:** Structured logging for payment webhooks, auth failures, and exam submissions; alerting on payment reconciliation discrepancies > 1% daily.
- **Localization:** UI in Vietnamese; currency displayed as VND.

## 9. Constraints and Guardrails

### Legal and Compliance

- Platform disclaimer on all surfaces (FR-15).
- No "guaranteed pass" or "official exam questions" messaging (FR-16).
- Source attribution on community-sourced Questions (FR-20).
- Copyright takedown process: admin can unpublish within 24 hours of valid claim (FR-19).
- Basic user data export on request (FR-34).

### Privacy

- Collect only data required for auth, progress, and payments.
- Do not sell User data to third parties.
- Privacy policy linked on all surfaces [ASSUMPTION: required for Zalo Mini App review].

### Zalo Platform

- Early compliance review against Zalo Mini App content and payment policies.
- No prohibited medical/financial guarantee claims in Mini App listing.

## 10. Platform

| Surface | Users | Auth | Payments |
|---|---|---|---|
| Zalo Mini App | Candidates | Zalo OAuth | ZaloPay |
| Responsive web | Candidates | Email, Google; Zalo for linking | VNPay, MoMo |
| Admin Back-Office | Editors, reviewers, admins | Email + password | N/A |

Tech stack direction (Next.js, PostgreSQL) is documented in `addendum.md` — not a PRD commitment.

## 11. Monetization

- **Free Tier:** Limited Practice Mode answered questions per Subject per month (default 20; admin-configurable).
- **Study Tier:** Limited Study Mode question detail views per Subject per month (default 5; admin-configurable). Independent of Free Tier — a freemium User may use both pools in the same month on the same Subject (e.g., 5 study views + 20 practice answers).
- **Paid:** Monthly Subscription per Subject; price set per Subject by admin (example: 80,000–100,000 VND/month). Grants unlimited Practice Mode and Study Mode for that Subject.
- **Promo codes:** Basic percentage/fixed discount at launch (FR-40).
- **No ads** in MVP.

## 12. Risk and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Content copyright from community sources | Legal takedown, reputation | Source attribution (FR-20), editorial review (FR-17), emergency unpublish (FR-19) |
| Answer inaccuracy | User churn, trust loss | Two-stage review, flagged-question queue (FR-9), version-on-edit |
| Zalo Mini App rejection | Channel blocked | Early policy review, disclaimer compliance (FR-15, FR-16) |
| Payment reconciliation errors | Revenue loss, wrong Entitlements | Webhook logging (FR-43), reconciliation views (FR-37) |
| Account merge edge cases | Duplicate billing, lost progress | FR-3 merge rules, support override (FR-33) |
| Insufficient Question inventory at launch | Poor Mock Exam experience | Admin pool validation (FR-29), phased Subject rollout |

## 13. Launch Content Plan

Practice Exam maps **Subjects** to the eight chứng chỉ chuyên môn về chứng khoán programs (Thông tư 135/2025/TT-BTC framework). MVP launches in two phases to de-risk content inventory and validate conversion before full catalog investment.

### 13.1 Phase 1 — Go-Live (Day 1)

| Subject | Min. Published Questions | Mock Exam |
|---|---|---|
| Pháp luật về chứng khoán và thị trường chứng khoán | 200 | 1 Subject-scoped practice exam |
| Phân tích báo cáo tài chính doanh nghiệp | 200 | 1 Subject-scoped practice exam |

**Go-live gate:** A Subject cannot be activated for Candidates until it meets minimum Published Question count and has at least one approved Mock Exam Template.

### 13.2 Phase 2 — Within 90 Days Post-Launch

Remaining six Subjects from the eight-program framework:

1. Những vấn đề cơ bản về chứng khoán và thị trường chứng khoán
2. Phân tích và đầu tư chứng khoán
3. Môi giới chứng khoán và tư vấn đầu tư chứng khoán
4. Tư vấn tài chính và bảo lãnh phát hành chứng khoán
5. Quản lý quỹ và tài sản
6. Chứng khoán phái sinh và thị trường chứng khoán phái sinh

Each Phase 2 Subject requires the same minimum (200 Published Questions) before activation.

### 13.3 Full CNVCK Mock Exam (Post Phase 2)

A cross-Subject Mock Exam Template mirroring the official sát hạch structure (Pháp luật + Chuyên môn, ~50% theory / ~50% calculation) ships only after all eight Subjects are active. MVP Phase 1–2 uses per-Subject Mock Exams only.

## 14. Resolved Decisions

| # | Question | Decision | Rationale |
|---|---|---|---|
| 1 | Launch Subject list | Phase 1: two Subjects (table §13.1); Phase 2: remaining six within 90 days | Prove conversion and editorial pipeline before full catalog |
| 2 | VAT invoicing | **Deferred post-MVP** | B2C digital subscriptions at MVP scale; revisit when monthly revenue exceeds compliance threshold or enterprise buyers request invoices |
| 3 | Zalo OAuth on web | **Link-only** on web; primary sign-in on Zalo Mini App | Matches channel strategy; web uses email/Google as primary |
| 4 | Mock Exam navigation | **Forward-only within section**; **free review of all answers before final submit** | Mirrors official exam pacing while allowing pre-submit review |
| 5 | Refund policy | **Full current period revoke** on approved refund | Simplest entitlement logic for MVP; no proration |
| 6 | Free Tier reset timezone | **ICT (Asia/Ho_Chi_Minh)**, first calendar day of month | Aligns with Vietnamese user base |

## 15. Deferred Items

| Item | Owner | Revisit when |
|---|---|---|
| VAT invoice generation | Finance / Legal | First enterprise inquiry or monthly revenue > 50M VND |
| Full sát hạch Mock Exam | Product | All 8 Subjects active (§13.3) |
| Auto-renew subscriptions | Product | Renewal rate data after 3 months live |

## 16. Assumptions Index

- MoMo included alongside VNPay for web payments (§4.2 FR-6).
- Default Free Tier: 20 questions per Subject per month (§4.2 FR-5).
- Default Study Tier: 5 question detail views per Subject per month (§4.3a FR-47).
- Study Tier and Free Tier counters are independent per Subject per month (§4.2 FR-5; §4.3a FR-47).
- Study Mode detail re-view in same calendar month is idempotent — does not consume additional Study Tier views (§4.3a FR-47).
- Account merge preserves all Attempt History from both Users (§4.1 FR-3).
- Zalo profile preferred for display name/avatar when linked; overridable on web (brief addendum).
- Question types: single choice, multiple choice, true/false (§4.3 FR-8).
- Practice session resume TTL: 24 hours (§4.3 FR-8).
- Subscription renewal reminder: 3 days before expiry (§4.2 FR-7).
- Mock Exam default attempt limit: 3 per User per template per month (§4.4 FR-10).
- Mock Exam forward-only within section; free review before final submit (§4.4 FR-11; §14 resolved #4).
- Phase 1 launch: 2 Subjects, 200 min Questions each (§13.1).
- Phase 2: remaining 6 Subjects within 90 days (§13.2).
- Full sát hạch Mock Exam deferred until all 8 Subjects active (§13.3).
- VAT invoicing deferred post-MVP (§14 #2).
- Free Tier resets ICT midnight, 1st of month (§14 #6).
- Version-on-edit for Published Questions (§4.7 FR-17).
- Bulk import max 500 Questions per batch (§4.8 FR-22).
- Minimum Subject price: 10,000 VND (§4.9 FR-26).
- Both fixed and randomized Mock Exam generation modes (§4.10 FR-28).
- Refund revokes current Subscription period (§4.12 FR-38).
- Basic promo codes at launch (§4.12 FR-40).
- Webhook log retention: 90 days (§4.13 FR-43).
- Basic GDPR-style user data export (§4.11 FR-34).
- Data residency: Vietnam/ASEAN (§8).
- Privacy policy required for Zalo review (§9).
- Zalo OAuth on web limited to account-linking flow (§4.1 FR-1).
- Images only for Question media in MVP (§4.8 FR-21).

---
status: final
created: 2026-06-29
story_count: 64
epic_count: 14
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
prd_version: prd-Practice_Exam-2026-06-29
architecture_version: architecture-Practice_Exam-2026-06-29
ux_version: ux-Practice_Exam-2026-06-29
updated: 2026-07-09
inputDocuments:
  - prd-Practice_Exam-2026-06-29
  - architecture-Practice_Exam-2026-06-29
  - ux-Practice_Exam-2026-06-29
---

# Practice Exam — Epic Breakdown

## Overview

Complete epic and story decomposition for Practice Exam MVP (CNVCK certification prep).
64 implementable stories across 14 epics covering FR-1..FR-47.
Payment stories follow **AD-5 SePay/PayOS**, not PRD ZaloPay/VNPay/MoMo.

## Requirements Inventory

### Functional Requirements

- **FR-1:** Multi-provider sign-in (Zalo OAuth, email/password, Google OAuth)
- **FR-2:** Account linking across web and Zalo channels
- **FR-3:** Account merge on link with progress and subscription deduplication
- **FR-4:** Candidate Subject catalog with pricing and Free Tier limits
- **FR-5:** Free Tier practice access with monthly per-Subject limits
- **FR-6:** Per-Subject monthly Subscription purchase
- **FR-7:** Subscription renewal and expiry handling
- **FR-8:** Practice Mode session with immediate feedback
- **FR-9:** Question reporting / flagged-question queue
- **FR-10:** Mock Exam availability for subscribed Candidates
- **FR-11:** Timed Mock Exam execution with section rules
- **FR-12:** Mock Exam results and question review
- **FR-13:** Attempt History chronological list
- **FR-14:** Subject performance summary aggregates
- **FR-15:** Platform disclaimer (non-UBCKNN affiliation)
- **FR-16:** Prohibited claims enforcement
- **FR-17:** Question lifecycle (Draft → In Review → Published)
- **FR-18:** Editorial review queue
- **FR-19:** Emergency unpublish
- **FR-20:** Source attribution on Questions
- **FR-21:** Question CRUD with tags and media
- **FR-22:** Bulk import via CSV/Excel template
- **FR-23:** Question search and filter (admin)
- **FR-24:** Candidate-view preview
- **FR-25:** Subject CRUD with visibility and ordering
- **FR-26:** Subject pricing, Free Tier, and Study Tier configuration
- **FR-47:** Study Mode — browse published questions with answers
- **FR-27:** Exam blueprint metadata and topic weighting
- **FR-28:** Mock Exam Template CRUD
- **FR-29:** Exam pool rules for auto-generation
- **FR-30:** Mock Exam attempt limits per User
- **FR-31:** User search and profile (admin)
- **FR-32:** Manual Subscription grant/revoke
- **FR-33:** Account merge override (support)
- **FR-34:** User data export on request
- **FR-35:** Account suspension
- **FR-36:** Payment transaction log
- **FR-37:** Provider reconciliation views
- **FR-38:** Refund processing
- **FR-39:** Revenue reports by Subject and channel
- **FR-40:** Promo codes
- **FR-41:** Zalo Mini App configuration
- **FR-42:** Payment merchant configuration (PayOS/SePay per AD-5)
- **FR-43:** Webhook event log
- **FR-44:** Role-based access control
- **FR-45:** Admin user management
- **FR-46:** System settings (maintenance, disclaimer, email templates)

### Non-Functional Requirements

- **NFR-1:** Performance: candidate pages < 3s on 4G; practice question transition < 500ms p95
- **NFR-2:** Availability: 99.5% uptime monthly during 06:00–23:00 ICT
- **NFR-3:** Security: TLS 1.2+; bcrypt passwords; encrypted OAuth tokens; PCI minimized via hosted checkout
- **NFR-4:** Data residency: User and Attempt History in Vietnam/ASEAN region
- **NFR-5:** Accessibility: WCAG 2.1 AA (web); Zalo platform guidelines (Mini App)
- **NFR-6:** Observability: structured logging for webhooks, auth, exams; reconciliation alerting > 1% daily
- **NFR-7:** Localization: Vietnamese UI; VND currency display

### Architecture Decision Requirements (AD)

- **AD-1:** Monorepo layout — pnpm workspaces + Turborepo
- **AD-2:** BFF-less API boundary — domain logic in NestJS only
- **AD-3:** Supabase PostgreSQL + Prisma single source of truth
- **AD-4:** AuthIdentity + JWT sessions
- **AD-5:** SePay/PayOS unified payments (replaces PRD ZaloPay/VNPay/MoMo)
- **AD-6:** Webhook idempotency and entitlement activation
- **AD-7:** Channel-agnostic checkout flow
- **AD-8:** TanStack client stack split (Query/Form/Router)
- **AD-9:** Vite for Zalo Mini App only
- **AD-10:** Excel bulk import pipeline (async BullMQ job)
- **AD-11:** Editorial and exam engines in API (server-side selection)
- **AD-12:** Shared UI package with DESIGN.md brand tokens
- **AD-13:** Deployment topology — Supabase ap-southeast-1, Vercel, Zalo CDN

### UX Design Requirements (UX-DR)

- **UX-DR-1:** Three candidate surfaces: Zalo Mini App (Z-*), responsive web (W-*), admin back-office (A-*)
- **UX-DR-2:** Zalo 3-tab bottom nav: Trang chủ | Tiến độ | Tài khoản (UX-A6)
- **UX-DR-3:** First-visit UBCKNN disclaimer acknowledgment (Z-02, W-03) — FR-15
- **UX-DR-4:** Practice MCQ requires explicit Xác nhận before reveal (UX-A7)
- **UX-DR-5:** Hide bottom tabs during active Mock Exam focus mode (UX-A8)
- **UX-DR-6:** Payment pending/failed states with poll confirmation (Z-25, W-25) — AD-7
- **UX-DR-7:** Account link and merge summary screens (W-51, W-52, Z-51) — FR-2, FR-3
- **UX-DR-8:** Bulk import error table on A-33 — AD-10
- **UX-DR-9:** shadcn/ui + Tailwind with navy #1B4F72 and success #0E7C4A tokens (UX-A3, AD-12)
- **UX-DR-10:** Vietnamese microcopy; VND format 100.000 ₫/tháng; exam-serious tone
- **UX-DR-11:** Admin sidebar IA grouped by domain with RBAC role gating
- **UX-DR-12:** Admin dashboard KPIs on A-10 — subscriptions, revenue, queue depth

### FR Coverage Map

| FR | Epic | Stories |
|---|---|---|
| FR-1 | EPIC-2 | STORY-6, STORY-7, STORY-8 |
| FR-2 | EPIC-2 | STORY-9 |
| FR-3 | EPIC-2 | STORY-10, STORY-46 |
| FR-4 | EPIC-3 | STORY-11, STORY-12 |
| FR-5 | EPIC-3 | STORY-13 |
| FR-6 | EPIC-4 | STORY-16, STORY-17, STORY-18, STORY-19 |
| FR-7 | EPIC-4 | STORY-15, STORY-20 |
| FR-8 | EPIC-5 | STORY-21, STORY-22, STORY-23 |
| FR-9 | EPIC-5, EPIC-8 | STORY-24, STORY-38 |
| FR-10 | EPIC-6 | STORY-25 |
| FR-11 | EPIC-6 | STORY-26, STORY-27 |
| FR-12 | EPIC-6 | STORY-28, STORY-29 |
| FR-13 | EPIC-7 | STORY-30 |
| FR-14 | EPIC-7 | STORY-31, STORY-32 |
| FR-15 | EPIC-3, EPIC-13 | STORY-14, STORY-59 |
| FR-16 | EPIC-3 | STORY-14 |
| FR-17 | EPIC-8 | STORY-33, STORY-34 |
| FR-18 | EPIC-8 | STORY-34 |
| FR-19 | EPIC-8 | STORY-35 |
| FR-20 | EPIC-8 | STORY-35 |
| FR-21 | EPIC-8 | STORY-33 |
| FR-22 | EPIC-8 | STORY-37 |
| FR-23 | EPIC-8 | STORY-36 |
| FR-24 | EPIC-8 | STORY-36 |
| FR-25 | EPIC-9 | STORY-39 |
| FR-26 | EPIC-9, EPIC-14 | STORY-40, STORY-68 |
| FR-27 | EPIC-9 | STORY-41 |
| FR-28 | EPIC-9 | STORY-42 |
| FR-29 | EPIC-9 | STORY-43 |
| FR-30 | EPIC-6, EPIC-9 | STORY-25, STORY-43 |
| FR-31 | EPIC-10 | STORY-44 |
| FR-32 | EPIC-10 | STORY-45 |
| FR-33 | EPIC-10 | STORY-46 |
| FR-34 | EPIC-10 | STORY-47 |
| FR-35 | EPIC-10 | STORY-48 |
| FR-36 | EPIC-4, EPIC-11 | STORY-18, STORY-49 |
| FR-37 | EPIC-11 | STORY-50 |
| FR-38 | EPIC-11 | STORY-51 |
| FR-39 | EPIC-11 | STORY-52 |
| FR-40 | EPIC-11 | STORY-53 |
| FR-41 | EPIC-12 | STORY-54 |
| FR-42 | EPIC-12 | STORY-55 |
| FR-43 | EPIC-4, EPIC-12 | STORY-18, STORY-56 |
| FR-44 | EPIC-13 | STORY-57 |
| FR-45 | EPIC-13 | STORY-58 |
| FR-46 | EPIC-13 | STORY-59 |
| FR-47 | EPIC-14 | STORY-65, STORY-66, STORY-67, STORY-68 |

## Epic List

- **EPIC-1: Foundation & Monorepo Setup** — STORY-1, STORY-2, STORY-3, STORY-4, STORY-5
- **EPIC-2: Authentication & Identity** — STORY-6, STORY-7, STORY-8, STORY-9, STORY-10
- **EPIC-3: Subject Catalog & Compliance** — STORY-11, STORY-12, STORY-13, STORY-14
- **EPIC-4: Subscriptions & Payments** — STORY-15, STORY-16, STORY-17, STORY-18, STORY-19, STORY-20
- **EPIC-5: Practice Mode** — STORY-21, STORY-22, STORY-23, STORY-24
- **EPIC-6: Mock Exams** — STORY-25, STORY-26, STORY-27, STORY-28, STORY-29
- **EPIC-7: Progress Analytics** — STORY-30, STORY-31, STORY-32
- **EPIC-8: Content Editorial & Question Bank** — STORY-33, STORY-34, STORY-35, STORY-36, STORY-37, STORY-38
- **EPIC-9: Subject & Mock Exam Configuration** — STORY-39, STORY-40, STORY-41, STORY-42, STORY-43
- **EPIC-10: User & Subscription Admin** — STORY-44, STORY-45, STORY-46, STORY-47, STORY-48
- **EPIC-11: Payments Admin & Finance** — STORY-49, STORY-50, STORY-51, STORY-52, STORY-53
- **EPIC-12: Zalo Integration Admin** — STORY-54, STORY-55, STORY-56
- **EPIC-13: RBAC, Settings & Dashboard** — STORY-57, STORY-58, STORY-59, STORY-60
- **EPIC-14: Study Mode** — STORY-65, STORY-66, STORY-67, STORY-68

## EPIC-1: Foundation & Monorepo Setup

Establish the monorepo, database, API scaffold, shared UI package, and client app shells so all subsequent epics can ship independently.

### [STORY-1: Initialize monorepo with pnpm workspaces and Turborepo](stories/STORY-1.md)

**prd_refs:** [] · **ad_refs:** ["AD-1"]

As a **platform engineer**,  
I want **a pnpm + Turborepo monorepo with apps and packages folders**,  
So that **the team can build all clients and the API from one repository**.

**Acceptance Criteria:**

**Given** Monorepo root contains `pnpm-workspace.yaml`, `turbo.json`, and folders `apps/` and `packages/`  
**When** developer runs `pnpm install` at root  
**Then** all workspace packages resolve without errors  
**And** CI can run `turbo build` across apps

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-2: Configure Supabase PostgreSQL and Prisma datasource](stories/STORY-2.md)

**prd_refs:** [] · **ad_refs:** ["AD-3", "AD-13"]

As a **platform engineer**,  
I want **Prisma configured against Supabase PostgreSQL with pooler URLs**,  
So that **the API can persist data in the managed Vietnam-region database**.

**Acceptance Criteria:**

**Given** `.env.example` documents `DATABASE_URL` (pooler :6543) and `DIRECT_URL` (session :5432)  
**When** developer runs `prisma migrate dev`  
**Then** migrations apply via `directUrl`  
**And** runtime NestJS uses transaction pooler connection

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-3: Scaffold NestJS API with health check and PrismaService](stories/STORY-3.md)

**prd_refs:** [] · **ad_refs:** ["AD-2", "AD-3"]

As a **platform engineer**,  
I want **a NestJS API skeleton with modular structure and health endpoint**,  
So that **client apps have a REST API to integrate against**.

**Acceptance Criteria:**

**Given** API exposes `GET /api/v1/health` returning 200  
**When** PrismaService is injectable in modules  
**Then** API envelope follows `{ data, error? }` convention  
**And** no domain logic in Next.js route handlers

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-4: Create shared UI package with DESIGN.md brand tokens](stories/STORY-4.md)

**prd_refs:** [] · **ad_refs:** ["AD-12"]

As a **frontend developer**,  
I want **`@practice-exam/ui` exporting shadcn components and Tailwind preset**,  
So that **web, admin, and Zalo apps share consistent brand styling**.

**Acceptance Criteria:**

**Given** Package exports primary `#1B4F72`, success `#0E7C4A`, and typography tokens from DESIGN.md  
**When** web app extends tailwind config from package preset  
**Then** Subject card and answer-option component tokens are available  
**And** Be Vietnam Pro font is configured

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-5: Scaffold client app shells (web, admin, Zalo Mini App)](stories/STORY-5.md)

**prd_refs:** [] · **ad_refs:** ["AD-8", "AD-9"]

As a **frontend developer**,  
I want **Next.js web and admin apps plus Vite Zalo mini-app with TanStack Query**,  
So that **each surface can call the API and render branded UI**.

**Acceptance Criteria:**

**Given** web and admin use Next.js App Router with TanStack Query configured  
**When** zalo-mini-app uses Vite 5, zmp-vite-plugin, and TanStack Router  
**Then** each app imports `@practice-exam/api-client`  
**And** local dev starts without build errors

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |


## EPIC-2: Authentication & Identity

Candidates and admins authenticate securely; Users link identities across web and Zalo with merge rules.

### [STORY-6: Email registration and password sign-in on web](stories/STORY-6.md)

**prd_refs:** ["FR-1"] · **ad_refs:** ["AD-4"]

As a **Candidate**,  
I want **to register and sign in with email/password on the responsive web app**,  
So that **I can access my account without a social provider**.

**Acceptance Criteria:**

**Given** unauthenticated user opens W-01/W-02  
**When** submits valid credentials  
**Then** exactly one User and AuthIdentity(email) is created or resolved  
**And** failed auth shows Vietnamese error with retry and no partial session

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-7: Google OAuth sign-in on web](stories/STORY-7.md)

**prd_refs:** ["FR-1"] · **ad_refs:** ["AD-4"]

As a **Candidate**,  
I want **to sign in with Google on the responsive web app**,  
So that **I can access my account quickly on web**.

**Acceptance Criteria:**

**Given** user selects Google on W-01  
**When** OAuth completes successfully  
**Then** User and AuthIdentity(google) are created or resolved  
**And** JWT access (15m) and refresh (7d) tokens are issued

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-8: Zalo OAuth primary sign-in on Mini App](stories/STORY-8.md)

**prd_refs:** ["FR-1"] · **ad_refs:** ["AD-4", "AD-9"]

As a **Candidate**,  
I want **to sign in via Zalo OAuth when opening the Mini App**,  
So that **I can start practicing inside Zalo without a separate registration**.

**Acceptance Criteria:**

**Given** user opens Z-01 on Mini App launch  
**When** Zalo OAuth succeeds via `zmp-sdk` token exchange to `POST /auth/zalo`  
**Then** User and AuthIdentity(zalo) are created  
**And** OAuth failure shows Z-91 with retry and no catalog access

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-9: Link AuthIdentity across web and Zalo](stories/STORY-9.md)

**prd_refs:** ["FR-2"] · **ad_refs:** ["AD-4"]

As a **Candidate**,  
I want **to link Zalo or web identity to my existing account while authenticated**,  
So that **my subscriptions and history sync across channels**.

**Acceptance Criteria:**

**Given** authenticated user initiates W-51 or Z-51 link flow  
**When** secondary provider OAuth completes  
**Then** Subscription and Attempt History are identical on both channels  
**And** linking same provider to different User is rejected; audit log records link event

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-10: Merge Users on account link with FR-3 rules](stories/STORY-10.md)

**prd_refs:** ["FR-3"] · **ad_refs:** ["AD-4"]

As a **Candidate**,  
I want **the system to merge two existing accounts when I link providers**,  
So that **I keep all progress and avoid duplicate subscriptions**.

**Acceptance Criteria:**

**Given** linking would merge two User records  
**When** merge executes server-side  
**Then** all Attempt History from both Users is retained under survivor  
**And** duplicate active Subscription for same Subject retains longer period; W-52/Z merge summary shown

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |


## EPIC-3: Subject Catalog & Compliance

Candidates browse Subjects, use Free Tier practice, and see legal disclaimers with prohibited-claims guardrails.

### [STORY-11: Subject catalog API for active Subjects](stories/STORY-11.md)

**prd_refs:** ["FR-4"] · **ad_refs:** ["AD-3"]

As a **Candidate**,  
I want **to retrieve all active Subjects with pricing and Free Tier limits**,  
So that **I can choose which môn to practice**.

**Acceptance Criteria:**

**Given** API returns only active visible Subjects  
**When** each Subject includes name, description, monthly price VND, Free Tier limit  
**Then** archived Subjects are excluded from candidate responses  
**And** price matches admin configuration

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-12: Candidate Subject catalog UI on web and Zalo](stories/STORY-12.md)

**prd_refs:** ["FR-4"] · **ad_refs:** ["AD-12"]

As a **Candidate**,  
I want **to browse the Subject catalog on Z-10 and W-10**,  
So that **I can discover Phase 1 Subjects and their subscription status**.

**Acceptance Criteria:**

**Given** catalog renders Subject cards with price badge and subscription/Free Tier meter  
**When** Phase 1 Subjects appear prominently  
**Then** tap/click opens Subject detail Z-11/W-11  
**And** pull-to-refresh works on catalog

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-13: Free Tier entitlement enforcement](stories/STORY-13.md)

**prd_refs:** ["FR-5"] · **ad_refs:** ["AD-11"]

As a **Candidate**,  
I want **to practice up to the monthly Free Tier limit per Subject without subscribing**,  
So that **I can try the product before paying**.

**Acceptance Criteria:**

**Given** Free Tier counter resets ICT midnight on 1st of month per User per Subject  
**When** default limit is 20 questions (admin-overridable)  
**Then** at limit Practice Mode shows subscribe prompt Z-23/W-23  
**And** Free Tier does not grant Mock Exam access

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-14: Platform disclaimer and prohibited claims guardrails](stories/STORY-14.md)

**prd_refs:** ["FR-15", "FR-16"] · **ad_refs:** []

As a **Candidate**,  
I want **to see UBCKNN non-affiliation disclaimer and trust that marketing copy is compliant**,  
So that **I understand this is not an official exam product**.

**Acceptance Criteria:**

**Given** first visit requires Z-02/W-03 disclaimer acknowledgment  
**When** persistent footer disclaimer is always accessible  
**Then** disclaimer text is loaded from system settings CMS field  
**And** Question/Subject text is blocked or flagged for prohibited phrases

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |


## EPIC-4: Subscriptions & Payments

Per-Subject monthly subscriptions via PayOS/SePay hosted checkout with webhook-driven entitlement activation.

### [STORY-15: Subscription model and entitlement service](stories/STORY-15.md)

**prd_refs:** ["FR-6", "FR-7"] · **ad_refs:** ["AD-3"]

As a **Candidate**,  
I want **my Subscription status and expiry to be tracked server-authoritatively**,  
So that **entitlement is consistent across all linked channels within 1 minute (SM-3)**.

**Acceptance Criteria:**

**Given** Subscription record links user_id, subject_id, period_start, period_end, channel  
**When** active Subscription grants full Entitlement  
**Then** expired Subscription reverts to Free Tier only  
**And** renewal extends one month from previous period end

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-16: PayOS payment adapter and checkout initiation](stories/STORY-16.md)

**prd_refs:** ["FR-6"] · **ad_refs:** ["AD-5", "AD-7"]

As a **Candidate**,  
I want **to pay via PayOS hosted checkout**,  
So that **I can subscribe on web or Zalo without in-app card handling**.

**Acceptance Criteria:**

**Given** `POST /checkout/subscription` with provider payos returns checkoutUrl and paymentId  
**When** Payment.provider=payos and Payment.channel=web|zalo  
**Then** failed/cancelled payment does not create Subscription  
**And** **Note:** Implements FR-6 via architecture AD-5, not PRD ZaloPay/VNPay/MoMo

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-17: SePay payment adapter](stories/STORY-17.md)

**prd_refs:** ["FR-6"] · **ad_refs:** ["AD-5", "AD-7"]

As a **Candidate**,  
I want **to pay via SePay hosted checkout redirect**,  
So that **I have an alternate Vietnam payment option at checkout**.

**Acceptance Criteria:**

**Given** SePayAdapter implements PaymentProvider port  
**When** checkout creates SePay redirect URL  
**Then** web uses redirect; Zalo uses `zmp.openWebview` for checkout [ASSUMPTION]  
**And** provider selectable at checkout or admin-configured default

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-18: Payment webhooks with idempotent entitlement activation](stories/STORY-18.md)

**prd_refs:** ["FR-6", "FR-36"] · **ad_refs:** ["AD-6"]

As a **platform**,  
I want **payment webhooks to activate subscriptions exactly once**,  
So that **successful payments never double-grant or lose entitlements**.

**Acceptance Criteria:**

**Given** `POST /webhooks/payos` and `POST /webhooks/sepay` verify signatures  
**When** PaymentWebhookEvent stored with unique (provider, external_event_id)  
**Then** PAID status idempotently activates Subscription  
**And** failed webhooks enqueue BullMQ retry; admin can manual retry (FR-43 pattern)

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-19: Candidate checkout and confirmation UI](stories/STORY-19.md)

**prd_refs:** ["FR-6"] · **ad_refs:** ["AD-7", "AD-12"]

As a **Candidate**,  
I want **to complete checkout and see subscription confirmation on Z-24–26 and W-24–26**,  
So that **I know my payment succeeded and when my subscription expires**.

**Acceptance Criteria:**

**Given** checkout UI shows Subject, price, promo code field  
**When** return from provider polls `GET /payments/:id` until terminal state  
**Then** Z-26/W-26 shows 'Đang hoạt động đến {date}' after PAID  
**And** payment failure shows retry without entitlement change

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-20: Subscription expiry notice and manual renewal](stories/STORY-20.md)

**prd_refs:** ["FR-7"] · **ad_refs:** []

As a **Candidate**,  
I want **in-app notice when my subscription expires within 3 days**,  
So that **I can manually renew before losing access**.

**Acceptance Criteria:**

**Given** expiring ≤3 days shows amber subscription badge and renewal CTA  
**When** at expiry full Entitlement revoked; Free Tier restored  
**Then** no auto-renew in MVP  
**And** renewal payment extends from previous period end

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |


## EPIC-5: Practice Mode

Server-authoritative practice sessions with immediate feedback, resume, and question flagging.

### [STORY-21: Practice session API with server-side question selection](stories/STORY-21.md)

**prd_refs:** ["FR-8"] · **ad_refs:** ["AD-11"]

As a **Candidate**,  
I want **to start a Practice Mode session for a Subject**,  
So that **I practice only entitled Published questions**.

**Acceptance Criteria:**

**Given** PracticeService serves only Published Questions for Subject  
**When** supports single choice, multiple choice, true/false  
**Then** Free Tier counter increments atomically when applicable  
**And** in-progress session persisted with 24h resume TTL

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-22: Practice question UI with immediate feedback](stories/STORY-22.md)

**prd_refs:** ["FR-8"] · **ad_refs:** ["AD-12"]

As a **Candidate**,  
I want **to answer questions one at a time with explanations on Z-21/W-21**,  
So that **I learn from each answer immediately**.

**Acceptance Criteria:**

**Given** one question visible with answer-option component states  
**When** MCQ requires explicit 'Xác nhận' before reveal  
**Then** correct/incorrect shown with icon+text not color alone  
**And** explanation displays after submit

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-23: Practice session resume and summary](stories/STORY-23.md)

**prd_refs:** ["FR-8"] · **ad_refs:** []

As a **Candidate**,  
I want **to exit and resume practice within 24 hours and see session summary**,  
So that **I do not lose progress on short breaks**.

**Acceptance Criteria:**

**Given** return within 24h shows 'Tiếp tục phiên luyện tập?' prompt  
**When** session summary Z-22/W-22 shows score and questions answered  
**Then** ending session at Free Tier cap routes to paywall  
**And** 'Câu tiếp' disabled until answer submitted

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-24: Flag potentially incorrect questions](stories/STORY-24.md)

**prd_refs:** ["FR-9"] · **ad_refs:** []

As a **Candidate**,  
I want **to flag a Question from practice or mock review**,  
So that **editors can investigate content quality issues**.

**Acceptance Criteria:**

**Given** 'Báo cáo câu hỏi' action available post-reveal  
**When** flag creates admin queue entry with User, Question, optional comment  
**Then** flagging does not remove Question from circulation in MVP  
**And** toast confirms 'Đã gửi báo cáo'

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |


## EPIC-6: Mock Exams

Timed CNVCK-faithful Mock Exams with attempt limits, scoring, results, and candidate UI flow.

### [STORY-25: Mock exam listing and attempt limit enforcement](stories/STORY-25.md)

**prd_refs:** ["FR-10", "FR-30"] · **ad_refs:** ["AD-11"]

As a **Candidate**,  
I want **to see available Mock Exams and remaining attempts**,  
So that **I know if I can start an exam before committing time**.

**Acceptance Criteria:**

**Given** Free Tier users cannot start Mock Exams  
**When** list shows duration, question count, Subjects covered  
**Then** default 3 attempts per User per template per calendar month  
**And** exhausted attempts show disabled card with message

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-26: Timed mock exam execution with section rules](stories/STORY-26.md)

**prd_refs:** ["FR-11"] · **ad_refs:** ["AD-11"]

As a **Candidate**,  
I want **to complete a Mock Exam within time limits section by section**,  
So that **the experience mirrors official exam pacing**.

**Acceptance Criteria:**

**Given** timer counts down; auto-submit on expiry  
**When** forward-only within section; no back to prior section during timed attempt  
**Then** answers saved incrementally on connection loss  
**And** bottom tabs hidden during active exam [UX-A8]

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-27: Pre-submit cross-section answer review](stories/STORY-27.md)

**prd_refs:** ["FR-11"] · **ad_refs:** []

As a **Candidate**,  
I want **to review and change answers across all sections before final submit**,  
So that **I can verify answers before irreversible submission**.

**Acceptance Criteria:**

**Given** after final section user reaches Z-33/W-33 review grid  
**When** can jump to any question and change answer  
**Then** 'Nộp bài' requires confirmation dialog  
**And** submit is explicit and irreversible

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-28: Mock exam scoring, results, and question review](stories/STORY-28.md)

**prd_refs:** ["FR-12"] · **ad_refs:** []

As a **Candidate**,  
I want **to see score, pass/fail, section breakdown, and per-question explanations**,  
So that **I understand my performance and weak areas**.

**Acceptance Criteria:**

**Given** score calculated against configured passing threshold  
**When** section breakdown matches template Subject weights  
**Then** results persist permanently in Attempt History  
**And** Z-35/W-35 shows explanations for all questions

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-29: Mock exam candidate UI flow (briefing through results)](stories/STORY-29.md)

**prd_refs:** ["FR-10", "FR-11", "FR-12"] · **ad_refs:** ["AD-12"]

As a **Candidate**,  
I want **a complete mock exam UI from briefing Z-31/W-31 through results Z-34/W-34**,  
So that **I can take a full mock exam on web or Zalo**.

**Acceptance Criteria:**

**Given** briefing shows duration, rules, attempts remaining  
**When** timer bar uses mono font with aria-live at 5:00 and 1:00  
**Then** exit during exam shows confirm dialog  
**And** pass/fail copy follows EXPERIENCE.md voice (no gamification)

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |


## EPIC-7: Progress Analytics

Attempt History and per-Subject performance summaries on web and Zalo.

### [STORY-30: Attempt History API and list UI](stories/STORY-30.md)

**prd_refs:** ["FR-13"] · **ad_refs:** []

As a **Candidate**,  
I want **to view chronological practice and mock attempts on Z-41/W-41**,  
So that **I can track what I have completed over time**.

**Acceptance Criteria:**

**Given** history identical on web and Zalo for same User  
**When** entries show type, Subject, date, score  
**Then** tap opens attempt detail with questions and explanations for mocks  
**And** empty state CTA 'Bắt đầu luyện tập'

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-31: Subject performance summary aggregates](stories/STORY-31.md)

**prd_refs:** ["FR-14"] · **ad_refs:** []

As a **Candidate**,  
I want **per-Subject stats for questions attempted, correctness rate, and mock scores**,  
So that **I see strengths and gaps over 30/90 days**.

**Acceptance Criteria:**

**Given** summary updates within 5 minutes of session completion  
**When** 30/90 day toggles on Z-40/W-40  
**Then** Subjects with no attempts show empty card with practice CTA  
**And** aggregates computed server-side

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-32: Progress dashboard UI](stories/STORY-32.md)

**prd_refs:** ["FR-13", "FR-14"] · **ad_refs:** ["AD-12"]

As a **Candidate**,  
I want **a progress dashboard on tab Tiến độ**,  
So that **I have a single place to monitor improvement**.

**Acceptance Criteria:**

**Given** dashboard shows per-Subject summary cards  
**When** links to full attempt history  
**Then** layout differs Zalo tabs vs web nav but data is identical  
**And** meets WCAG focus order on web

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |


## EPIC-8: Content Editorial & Question Bank

Full editorial workflow, question bank CRUD, search/preview, bulk import, and flagged-question triage.

### [STORY-33: Question CRUD with lifecycle states](stories/STORY-33.md)

**prd_refs:** ["FR-17", "FR-21"] · **ad_refs:** []

As a **Content Editor**,  
I want **to create and edit Questions in Draft with stem, options, explanation, tags**,  
So that **I can build the question bank for a Subject**.

**Acceptance Criteria:**

**Given** lifecycle: Draft → In Review → Published; rejection returns to Draft with comments  
**When** Published edits create new Draft version requiring re-review  
**Then** Questions belong to exactly one Subject  
**And** image attachments supported; duplicate stem warns editor

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-34: Editorial review queue and approve/reject](stories/STORY-34.md)

**prd_refs:** ["FR-18"] · **ad_refs:** []

As a **Reviewer**,  
I want **to review pending Questions on A-40/A-41**,  
So that **only quality content reaches Candidates**.

**Acceptance Criteria:**

**Given** queue filterable by Subject, author, age  
**When** assign-to-self supported  
**Then** rejection requires non-empty comment  
**And** approval atomically sets Published status

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-35: Emergency unpublish and source attribution](stories/STORY-35.md)

**prd_refs:** ["FR-19", "FR-20"] · **ad_refs:** []

As a **Reviewer**,  
I want **to unpublish a Question immediately and record source references**,  
So that **we can respond to copyright or accuracy issues quickly**.

**Acceptance Criteria:**

**Given** unpublish removes Question from candidate pools; status Archived  
**When** unpublish audit-logged with actor and reason  
**Then** source_ref stored and visible to admins only  
**And** candidate surfaces exclude unpublished Questions

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-36: Question search, filter, and candidate preview](stories/STORY-36.md)

**prd_refs:** ["FR-23", "FR-24"] · **ad_refs:** []

As a **Admin**,  
I want **to search and filter Questions and preview them as Candidates will see them**,  
So that **I can find and validate content efficiently**.

**Acceptance Criteria:**

**Given** A-30 search/filter by Subject, status, difficulty, topic, author  
**When** results return within 2 seconds for banks up to 10,000 Questions per Subject  
**Then** preview on A-32 matches Practice Mode rendering including explanation reveal  
**And** filters persist in admin session URL query params

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-37: Excel bulk import with async job pipeline](stories/STORY-37.md)

**prd_refs:** ["FR-22"] · **ad_refs:** ["AD-10"]

As a **Content Editor**,  
I want **to bulk-import Questions via Excel on A-33**,  
So that **I can onboard large question banks without manual entry**.

**Acceptance Criteria:**

**Given** admin uploads .xlsx up to 500 rows per batch  
**When** API enqueues ImportQuestionsJob; success rows create Questions in Draft only  
**Then** ImportBatch report lists row-level errors without silent partial failure  
**And** no synchronous import; Published status cannot be set via import

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-38: Flagged questions admin queue](stories/STORY-38.md)

**prd_refs:** ["FR-9"] · **ad_refs:** []

As a **Reviewer**,  
I want **to triage candidate-flagged Questions on A-42**,  
So that **I can investigate reported content quality issues**.

**Acceptance Criteria:**

**Given** queue lists flags with User, Question, optional comment, and timestamp  
**When** reviewer can assign, resolve, or escalate to editorial workflow  
**Then** flagging does not remove Question from candidate circulation in MVP  
**And** resolved flags are audit-logged with actor and resolution note

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-49: Downloadable question import template](stories/STORY-49.md)

**prd_refs:** ["FR-22"] · **ad_refs:** ["AD-10"]

As a **Content Editor**,  
I want **to download an Excel template from A-33 before bulk import**,  
So that **I know the exact column format and reduce import errors**.

**Acceptance Criteria:**

**Given** A-33 bulk import page  
**When** editor clicks "Tải file mẫu"  
**Then** API returns `.xlsx` with Vietnamese canonical columns and one example row  
**And** the template parses successfully via existing import parser

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-07-01 | prd-Practice_Exam-2026-06-29 (final) | Add downloadable import template to close FR-22 gap | Created |

### [STORY-63: Import UX, multi-type questions, and Excel data-sheet dropdowns](stories/STORY-63.md)

**prd_refs:** ["FR-22", "FR-8"] · **ad_refs:** ["AD-10"]

As a **Content Editor**,  
I want **to select Course and Subject on A-33 and import Excel with dropdown-defined question types (Single Choice, Multiple Choice, True/False)**,  
So that **I can bulk-load questions accurately without guessing UUIDs or free-typing enum values**.

**Acceptance Criteria:**

**Given** A-33 bulk import page  
**When** editor selects Course then Subject (not UUID) and downloads template  
**Then** `.xlsx` has `Câu hỏi`, `DanhMuc`, `HuongDan` sheets with list validation on question type and difficulty  
**And** import supports `single_choice`, `multiple_choice`, `true_false` per row with type-specific validation  
**And** all imported questions remain Draft only

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-07-02 | prd-Practice_Exam-2026-06-29 (final) | Extend import UX and template for Course/Subject picker and 3 question types with Excel dropdowns | Created |


## EPIC-9: Subject & Mock Exam Configuration

Admin catalog, pricing, blueprint metadata, Mock Exam Templates, pool rules, and attempt limits.

### [STORY-39: Subject CRUD with go-live gate](stories/STORY-39.md)

**prd_refs:** ["FR-25"] · **ad_refs:** []

As a **Platform Admin**,  
I want **to create, update, archive, and reorder Subjects on A-20/A-21**,  
So that **the catalog reflects accurate CNVCK offerings**.

**Acceptance Criteria:**

**Given** each Subject has name, code, description, display order, visibility status  
**When** archived Subjects hidden from Candidates; existing Subscriptions remain valid until expiry  
**Then** Subject cannot activate until >= 200 Published Questions and one approved Mock Exam Template  
**And** reorder updates display order without breaking existing Subscriptions

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-40: Subject pricing and Free Tier configuration](stories/STORY-40.md)

**prd_refs:** ["FR-26"] · **ad_refs:** []

As a **Platform Admin**,  
I want **to set monthly Subscription price and Free Tier limit per Subject**,  
So that **monetization matches business strategy per môn**.

**Acceptance Criteria:**

**Given** price is integer VND with minimum 10,000 VND floor  
**When** Free Tier limit is admin-configurable per Subject (default 20/month)  
**Then** price changes apply to new purchases only; active Subscriptions retain purchase-time price until renewal  
**And** changes propagate to candidate catalog within minutes

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-41: Exam blueprint metadata and topic weighting](stories/STORY-41.md)

**prd_refs:** ["FR-27"] · **ad_refs:** []

As a **Platform Admin**,  
I want **to map Subject metadata to CNVCK exam weighting on A-22**,  
So that **Mock Exams and analytics reflect official section mix**.

**Acceptance Criteria:**

**Given** admin configures topic tags and section weight percentages per Subject  
**When** weight percentages per Mock Exam Template sum to 100%  
**Then** metadata drives Mock Exam section breakdown and Progress Analytics  
**And** invalid weight totals block save with clear validation error

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-42: Mock Exam Template CRUD](stories/STORY-42.md)

**prd_refs:** ["FR-28"] · **ad_refs:** []

As a **Platform Admin**,  
I want **to create and edit Mock Exam Templates on A-50/A-51**,  
So that **Candidates can take structured exams mirroring CNVCK format**.

**Acceptance Criteria:**

**Given** template specifies sections with Subject, question count, and time limit  
**When** total duration and passing score threshold are configurable  
**Then** fixed vs randomized Question selection per section is supported  
**And** randomized selection draws only from Published Questions matching Subject and difficulty rules

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-43: Exam pool rules and attempt limits](stories/STORY-43.md)

**prd_refs:** ["FR-29", "FR-30"] · **ad_refs:** []

As a **Platform Admin**,  
I want **to configure difficulty/topic distribution and attempt limits**,  
So that **auto-generated exams are fair and bounded**.

**Acceptance Criteria:**

**Given** auto-generation fails with clear admin error if pool lacks sufficient Published Questions  
**When** generated exams are previewable on A-52 before release to Candidates  
**Then** default 3 attempts per User per template per calendar month  
**And** Candidates see remaining attempts before starting Mock Exam

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |


## EPIC-10: User & Subscription Admin

Support tools for user search, manual subscriptions, merge override, data export, and suspension.

### [STORY-44: User search and profile admin view](stories/STORY-44.md)

**prd_refs:** ["FR-31"] · **ad_refs:** []

As a **Support Admin**,  
I want **to search Users and view profile on A-60/A-61**,  
So that **I can assist Users with account and subscription issues**.

**Acceptance Criteria:**

**Given** search by email, phone, Zalo ID, or internal User ID  
**When** profile shows AuthIdentities with link dates  
**Then** profile summarizes Subscriptions and Attempt History  
**And** PII access is RBAC-gated and audit-logged

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-45: Manual Subscription grant and revoke](stories/STORY-45.md)

**prd_refs:** ["FR-32"] · **ad_refs:** []

As a **Support Admin**,  
I want **to manually grant or revoke a Subscription on A-62**,  
So that **I can resolve billing exceptions with audit trail**.

**Acceptance Criteria:**

**Given** manual grant creates Entitlement immediately on all channels  
**When** revoke removes Entitlement immediately  
**Then** action requires mandatory audit reason  
**And** grant/revoke events appear in user profile timeline

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-46: Account merge override for support](stories/STORY-46.md)

**prd_refs:** ["FR-33"] · **ad_refs:** []

As a **Support Admin**,  
I want **to force-merge two User accounts on A-63**,  
So that **I can resolve duplicate accounts per FR-3 rules**.

**Acceptance Criteria:**

**Given** force-merge applies same rules as FR-3 (merge-all-progress, dedupe Subscriptions)  
**When** mandatory support ticket reference required  
**Then** audit log records both User IDs and resulting survivor  
**And** merge summary shown to admin before confirmation

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-47: User data export on request](stories/STORY-47.md)

**prd_refs:** ["FR-34"] · **ad_refs:** []

As a **Support Admin**,  
I want **to export a User's personal data and Attempt History on A-64**,  
So that **we meet basic GDPR-style compliance requests**.

**Acceptance Criteria:**

**Given** export available as JSON or CSV download in admin UI  
**When** export includes profile, AuthIdentities, Subscriptions, and Attempt History  
**Then** export action is audit-logged with actor and timestamp  
**And** export excludes other Users' data and admin-only fields

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-48: Account suspension](stories/STORY-48.md)

**prd_refs:** ["FR-35"] · **ad_refs:** []

As a **Admin**,  
I want **to suspend a User account on A-65**,  
So that **abuse or policy violations can be blocked immediately**.

**Acceptance Criteria:**

**Given** suspended User sees generic account-disabled message on sign-in  
**When** active Subscriptions are frozen, not cancelled; no refund automation in MVP  
**Then** suspension is reversible by super admin with audit reason  
**And** suspended Users cannot start practice or Mock Exams

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |


## EPIC-11: Payments Admin & Finance

Transaction log, reconciliation, refunds, revenue reports, and promo codes (PayOS/SePay per AD-5).

### [STORY-49: Payment transaction log admin view](stories/STORY-49.md)

**prd_refs:** ["FR-36"] · **ad_refs:** ["AD-5"]

As a **Finance Admin**,  
I want **to view all payment transactions on A-70**,  
So that **I can investigate checkout and entitlement issues**.

**Acceptance Criteria:**

**Given** log shows User, Subject, amount, provider, status, and external reference  
**When** filterable by provider payos|sepay, date range, and status  
**Then** each successful transaction maps to exactly one Subscription activation or extension  
**And** **Note:** Implements FR-36 via AD-5 payos|sepay, not PRD ZaloPay/VNPay/MoMo

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-50: Provider reconciliation summaries](stories/STORY-50.md)

**prd_refs:** ["FR-37"] · **ad_refs:** ["AD-5"]

As a **Finance Admin**,  
I want **to view reconciliation summaries per provider per day on A-71**,  
So that **I can detect payment discrepancies quickly**.

**Acceptance Criteria:**

**Given** summary shows transaction count, gross revenue, failed count, and pending count  
**When** discrepancies between provider webhook and internal record are flagged  
**Then** supports payos and sepay providers per AD-5  
**And** date range filter defaults to last 7 days ICT

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-51: Refund processing with entitlement adjustment](stories/STORY-51.md)

**prd_refs:** ["FR-38"] · **ad_refs:** []

As a **Finance Admin**,  
I want **to initiate a refund for a payment on A-72**,  
So that **revenue corrections revoke access appropriately**.

**Acceptance Criteria:**

**Given** refund requires mandatory audit reason  
**When** refund revokes or shortens current Subscription period proportionally  
**Then** refund status tracked; provider confirmation required  
**And** refund action is audit-logged

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-52: Revenue reports by Subject and channel](stories/STORY-52.md)

**prd_refs:** ["FR-39"] · **ad_refs:** []

As a **Finance Admin**,  
I want **to view revenue reports on A-73**,  
So that **I can analyze business performance over time**.

**Acceptance Criteria:**

**Given** report supports date range filter and CSV export  
**When** revenue attributed at payment confirmation timestamp  
**Then** breakdown by Subject and by channel (web vs Zalo)  
**And** excludes pending and failed payments from revenue totals

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-53: Promo code management](stories/STORY-53.md)

**prd_refs:** ["FR-40"] · **ad_refs:** []

As a **Finance Admin**,  
I want **to create and manage promo codes on A-74**,  
So that **marketing can offer controlled discounts at checkout**.

**Acceptance Criteria:**

**Given** promo code has expiry date, usage limit, and applicable Subject(s)  
**When** percentage or fixed discount supported  
**Then** discount applies at checkout only; one code per purchase  
**And** usage count visible; expired codes cannot be applied

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |


## EPIC-12: Zalo Integration Admin

Zalo Mini App credentials, payment provider merchant config, and webhook event log.

### [STORY-54: Zalo Mini App configuration](stories/STORY-54.md)

**prd_refs:** ["FR-41"] · **ad_refs:** []

As a **Super Admin**,  
I want **to configure Zalo Mini App credentials on A-80**,  
So that **the Mini App can authenticate and deploy correctly**.

**Acceptance Criteria:**

**Given** configure app ID and secrets with deployment status view  
**When** invalid credentials surface diagnostic error without exposing secrets to Candidates  
**Then** configuration changes require super-admin role  
**And** changes are audit-logged

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-55: Payment provider merchant configuration](stories/STORY-55.md)

**prd_refs:** ["FR-42"] · **ad_refs:** ["AD-5"]

As a **Super Admin**,  
I want **to configure PayOS/SePay merchant settings on A-81**,  
So that **hosted checkout works on web and Zalo channels**.

**Acceptance Criteria:**

**Given** configure merchant credentials per provider (payos|sepay)  
**When** test mode payments do not create production Subscriptions  
**Then** webhook endpoints documented and testable from admin  
**And** **Note:** Replaces PRD FR-42 ZaloPay merchant config per AD-5

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-56: Webhook event log and manual retry](stories/STORY-56.md)

**prd_refs:** ["FR-43"] · **ad_refs:** ["AD-6"]

As a **Super Admin**,  
I want **to view webhook events on A-83**,  
So that **I can diagnose OAuth and payment integration failures**.

**Acceptance Criteria:**

**Given** log shows Zalo OAuth and payment webhook events with payload status and errors  
**When** retains 90 days of events  
**Then** failed webhooks are manually retryable from admin  
**And** retry is idempotent per AD-6 PaymentWebhookEvent rules

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |


## EPIC-13: RBAC, Settings & Dashboard

Role-based access, admin user management, system settings, and operational KPI dashboard.

### [STORY-57: Role-based access control enforcement](stories/STORY-57.md)

**prd_refs:** ["FR-44"] · **ad_refs:** []

As a **Super Admin**,  
I want **to enforce RBAC across admin modules**,  
So that **each role sees only permitted actions**.

**Acceptance Criteria:**

**Given** roles: super admin, content editor, reviewer, support, finance  
**When** content editors cannot access payment or Zalo configuration  
**Then** finance role cannot publish Questions  
**And** permission matrix documented and viewable on A-92

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-58: Admin user management](stories/STORY-58.md)

**prd_refs:** ["FR-45"] · **ad_refs:** []

As a **Super Admin**,  
I want **to create, disable, and assign roles to admin users on A-91**,  
So that **back-office access is controlled and auditable**.

**Acceptance Criteria:**

**Given** super admin can create admin users with email + password  
**When** disabled admin cannot sign in  
**Then** role assignment changes take effect on next login  
**And** admin login events are audit-logged

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-59: System settings including disclaimer and maintenance](stories/STORY-59.md)

**prd_refs:** ["FR-46", "FR-15"] · **ad_refs:** []

As a **Super Admin**,  
I want **to configure maintenance mode, disclaimer text, and email templates on A-90**,  
So that **global platform behavior can be updated without deploy**.

**Acceptance Criteria:**

**Given** maintenance mode shows branded message to Candidates and blocks practice; admin access remains  
**When** disclaimer text changes propagate to all surfaces within 5 minutes  
**Then** email notification templates editable for key events  
**And** settings changes require super-admin role and are audit-logged

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

### [STORY-60: Admin dashboard KPIs](stories/STORY-60.md)

**prd_refs:** [] · **ad_refs:** []

As a **Platform Admin**,  
I want **to view operational KPIs on A-10 dashboard**,  
So that **I can monitor subscriptions, revenue, and content pipeline health**.

**Acceptance Criteria:**

**Given** dashboard shows active subscription count per Subject  
**When** revenue snapshot for current month (confirmed payments only)  
**Then** content queue depth: editorial pending and flagged questions  
**And** KPIs refresh within 5 minutes; role-gated per RBAC

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-06-29 | prd-Practice_Exam-2026-06-29 (final) | Initial story created from finalized PRD, architecture spine, and UX contract | Created |

## EPIC-14: Study Mode

Browse-and-read review of Published Questions with answers visible. Separate **Study Tier** freemium pool (default 5 detail views/month per Subject) independent of Practice Mode **Free Tier**. Realizes FR-47 and UJ-7.

**Dependencies:** STORY-65 (API) before STORY-66/67; STORY-68 (admin config) can parallel STORY-65.

### [STORY-65: Study Mode API and study-tier entitlement](stories/STORY-65.md)

**prd_refs:** ["FR-47", "FR-5"] · **ad_refs:** ["AD-11", "AD-3"]

As a **Candidate**,  
I want **to browse Published questions with answers and explanations in Study Mode**,  
So that **I can review the full question bank before or alongside practice**.

**Acceptance Criteria:**

**Given** a Candidate opens Study Mode for a Subject they do not subscribe to  
**When** they request a question list via `GET /study/subjects/:subjectId/questions`  
**Then** only Published Questions are returned with stem and metadata (no correct answer or explanation)  
**And** the response includes `studyTier: { used, limit, remaining, periodKey, isAtLimit }`

**Given** a freemium Candidate with remaining Study Tier allowance  
**When** they open question detail via `GET /study/subjects/:subjectId/questions/:questionId`  
**Then** the response includes options, correct answer, and explanation  
**And** the Study Tier counter increments atomically by 1; Free Tier practice counter unchanged

**Given** Study Tier limit reached  
**When** they request detail for an unviewed question  
**Then** API returns `403 STUDY_TIER_EXCEEDED` with subscribe CTA metadata

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-07-09 | sprint-change-proposal-2026-07-09-study-mode | New EPIC-14 Study Mode — FR-47 API, StudyTierUsage, server-side gating | Created |

### [STORY-66: Candidate Study Mode UI (web + Zalo)](stories/STORY-66.md)

**prd_refs:** ["FR-47"] · **ad_refs:** ["AD-8", "AD-12"]

As a **Candidate**,  
I want **to browse and read study questions with visible answers on web and Zalo**,  
So that **I can review content passively before active practice**.

**Acceptance Criteria:**

**Given** Study list Z-12/W-12  
**When** loaded  
**Then** paginated stems with topic/difficulty; no answers; inline Study Tier meter

**Given** Study detail Z-13/W-13  
**When** opened with allowance  
**Then** read-only layout with correct answer highlighted and explanation; no confirm-before-reveal

**Given** Study Tier cap  
**When** tapping locked row  
**Then** Z-14/W-14 paywall with Subscribe CTA; Practice Free Tier unaffected

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-07-09 | sprint-change-proposal-2026-07-09-study-mode | Z-12..14 / W-12..14 candidate UI per EXPERIENCE.md UJ-7 | Created |

### [STORY-67: Subject detail Study CTA and Study Tier meter](stories/STORY-67.md)

**prd_refs:** ["FR-47", "FR-4"] · **ad_refs:** ["AD-12"]

As a **Candidate**,  
I want **to see my Study Tier usage and enter Study Mode from Subject detail**,  
So that **I can choose browse-and-read review alongside practice and mock exams**.

**Acceptance Criteria:**

**Given** Subject detail Z-11/W-11  
**When** rendered  
**Then** "Xem tất cả câu hỏi" CTA (Study → Practice → Mock order) and Study Tier meter below Free Tier meter

**Given** subscribed Candidate  
**When** detail loads  
**Then** Study meter hidden; Study CTA available with unlimited access

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-07-09 | sprint-change-proposal-2026-07-09-study-mode | Z-11/W-11 Study CTA + Study Tier meter integration | Created |

### [STORY-68: Admin Study Tier limit configuration per Subject](stories/STORY-68.md)

**prd_refs:** ["FR-26", "FR-47"] · **ad_refs:** []

As a **Platform Admin**,  
I want **to configure the Study Tier view limit per Subject on A-21**,  
So that **ops can tune browse-and-read freemium separately from practice Free Tier**.

**Acceptance Criteria:**

**Given** admin edits Subject on A-21  
**When** pricing section renders  
**Then** Study Tier limit field alongside price and Free Tier limit (default 5 views/month)

**Given** limit changed  
**When** Candidate loads Study Mode  
**Then** new limit applies on next request; current period usage preserved

**Changelog:**

| date | prd_version_or_updated | change_summary | story_delta |
|------|------------------------|----------------|-------------|
| 2026-07-09 | sprint-change-proposal-2026-07-09-study-mode | A-21 Study Tier limit extends FR-26 admin config | Created |


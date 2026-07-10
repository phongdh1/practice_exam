# PRD Reconciliation — Practice Exam Architecture

**Spine:** `ARCHITECTURE-SPINE.md` (2026-06-29)  
**PRD:** `prd-Practice_Exam-2026-06-29/prd.md`

## Landed

| PRD area | Spine coverage |
| --- | --- |
| AuthIdentity, multi-provider auth, link/merge (FR-1..3) | AD-4, auth flow diagram |
| Per-Subject subscription, Free Tier ICT (FR-4..7) | AD-3, Inherited |
| Practice, Mock Exam, Progress (FR-8..14) | AD-11, module map |
| Legal disclaimers (FR-15..16) | Inherited; system settings in admin |
| Editorial workflow (FR-17..20) | Inherited; `content` module |
| Question CRUD, bulk import (FR-21..24) | AD-10 |
| Subject/Mock config (FR-25..30) | module map |
| User/subscription admin (FR-31..35) | AD-4, AD-3 |
| RBAC, system settings (FR-44..46) | Inherited |
| Cross-channel sync (SM-3) | AD-3, AD-6, AD-7 |
| Launch phases §13 | Deferred section |
| Data model | ERD seed; Prisma at `apps/api/prisma/` (AD-3); Supabase ap-southeast-1 |

## Divergences — PRD update required

| PRD reference | PRD says | Architecture says | Action |
| --- | --- | --- | --- |
| FR-6, §6.1, §10, Glossary | ZaloPay (Zalo), VNPay + MoMo (web) | **SePay + PayOS** all channels (AD-5, user override) | **Update PRD** payment FRs and platform table |
| FR-36 | Filter by ZaloPay, VNPay, MoMo | Filter by `payos`, `sepay` | Update FR-36 provider enum |
| FR-39 | Revenue by channel (web vs Zalo) | Retained via `Payment.channel`; provider dimension changes | Amend FR-39 wording |
| FR-42 | ZaloPay merchant configuration | **Payment provider config** (SePay/PayOS credentials, sandbox toggle) | Replace FR-42; rename admin screen A-81 |
| FR-43 | Zalo OAuth + ZaloPay webhooks | Zalo OAuth webhooks + **PayOS/SePay** payment webhooks | Amend FR-43 scope |
| UJ-2, UJ-3 journeys | ZaloPay / VNPay named | Checkout via SePay/PayOS hosted page | Update journey copy in PRD §2.3 |
| addendum Payment Flow table | ZaloPay / VNPay / MoMo | SePay / PayOS unified | Update addendum |
| EXPERIENCE.md payment rows | ZaloPay / VNPay / MoMo | Flagged in reconcile-ux.md | UX doc sync |

## Quiet requirements checked

- Merge-all-progress default (FR-3): AD-4 ✓
- 500 row import cap (FR-22): AD-10 ✓
- 90-day webhook retention (FR-43): Conventions ✓
- Version-on-edit Questions (FR-17): Inherited, `QuestionVersion` in ERD ✓
- Go-live gate 200 Questions (FR-25): Not architectural — enforced in `subjects` service ✓
- Data residency Vietnam/ASEAN (§8): AD-13 — Supabase `ap-southeast-1` ✓

## Not in architecture (correctly deferred)

- Auto-renew, VAT invoices, B2B, marketplace — PRD §15 / §6.2
- Impersonation mode — PRD out of scope

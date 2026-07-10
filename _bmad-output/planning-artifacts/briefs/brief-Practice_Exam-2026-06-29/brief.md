---
title: "Product Brief: Practice Exam — CNVCK Certification Prep"
status: draft
created: 2026-06-29
updated: 2026-06-29
---

# Product Brief: Practice Exam — CNVCK Certification Prep

## Executive Summary

Practice Exam is a subscription-based learning platform for candidates preparing for Vietnam's **Chứng chỉ nghiệp vụ chứng khoán (CNVCK)** — the securities professional certification exam. Candidates today rely on fragmented Zalo study groups, ad-hoc PDFs, and unofficial question dumps with no structured progress tracking, no quality control, and no exam-faithful practice experience.

Practice Exam delivers curated, per-subject practice content and mock exams through a responsive web app and a **Zalo Mini App**, meeting learners where they already study. The MVP focuses exclusively on CNVCK, with a freemium model: limited free practice per subject each month, and affordable monthly subscriptions unlocked per subject (môn) at admin-configurable prices.

The platform is built for sustainable content operations from day one — an editorial workflow (Draft → Review → Published), legal disclaimers that the product is not an official UBCKNN exam, and identity linking so a learner's subscription and progress follow them across web and Zalo.

## The Problem

CNVCK candidates face a familiar pain pattern:

- **Fragmented study materials** scattered across Zalo groups and community shares, with inconsistent quality and no single source of truth.
- **No affordable, modular access** — learners often pay for bundled courses covering subjects they do not need, or rely on free dumps of unknown accuracy.
- **Weak exam simulation** — few tools replicate the official exam structure (subject breakdown, timing, question types), leaving candidates unprepared for the real format.
- **No cross-channel continuity** — study happens in Zalo groups, but practice tools live elsewhere; progress is lost when switching devices or channels.

The cost of the status quo is wasted study time, false confidence from inaccurate answers, and repeated exam attempts.

## The Solution

A dual-surface practice platform (web + Zalo Mini App) that provides:

- **Per-subject question banks and study content** curated by an in-house team from community and group sources, governed by editorial SOP.
- **Mock exams** structured to mirror the official CNVCK exam format.
- **Progress analytics** so candidates see strengths, gaps, and improvement over time.
- **Flexible subscriptions** — pay monthly only for the subjects (môn) being studied, with pricing set by admins per subject.
- **Unified identity** across Zalo, email, and Google sign-in, with account linking so subscriptions and progress sync across web and Zalo.

Free tier users receive a limited number of practice questions per subject per month, enough to evaluate quality before subscribing.

## What Makes This Different

| Differentiator | Why it matters |
|---|---|
| **Per-subject pricing** | Candidates pay only for what they study — lower barrier than all-in-one course bundles. |
| **Zalo-native experience** | Meets learners inside the ecosystem where CNVCK study groups already live. |
| **Exam-faithful mock tests** | Practice that reflects official structure, not generic quiz formats. |
| **Editorial quality control** | Draft → Review → Published workflow reduces inaccurate answers and copyright risk versus raw community dumps. |
| **Cross-channel identity sync** | Web ↔ Zalo account linking keeps subscription and progress consistent. |

Honest assessment: the moat is **execution** — content quality, Zalo distribution, and affordable per-subject pricing — not proprietary technology. Competing group admins and course sellers already have audience trust; Practice Exam must earn it through accuracy and convenience.

## Who This Serves

**Primary:** CNVCK exam candidates, especially active members of Zalo study groups who want structured practice without buying full multi-subject packages.

**Secondary (MVP):** Internal content editors and admins who curate, review, and publish question banks; platform operators who configure pricing, payments, and Zalo integration.

**Not in MVP:** B2B institutional sales, third-party content creators, or affiliate/group-admin revenue sharing — these are future marketplace capabilities.

## Success Criteria

**User success**

- Candidates complete mock exams and report confidence in exam format familiarity.
- Measurable improvement in practice scores over a study period.
- Free-to-paid conversion on at least one subject subscription within the first month of use.

**Business success**

- Sustainable subscriber base per subject with admin-configurable unit economics.
- Content pipeline maintains published question inventory without quality regressions.
- Zalo Mini App passes review and achieves usable adoption among target study groups.

**Operational success**

- Editorial SOP adhered to for all published content (zero "guaranteed pass" or official-exam claims).
- Payment and subscription state consistent across web and Zalo channels.

## Scope

**In (MVP)**

- CNVCK certification content only (first industry vertical).
- Responsive web application and Zalo Mini App (no native iOS/Android app).
- Per-subject subscription with admin-configurable monthly pricing.
- Free tier with limited questions per subject per month.
- Multi-provider authentication (Zalo, email, Google) with Web ↔ Zalo account linking and subscription sync.
- Question bank, mock exam engine, progress analytics.
- Admin back-office: catalog, subject pricing, question bank, content workflow, mock exam configuration, user management, payments, Zalo config, RBAC.
- Legal disclaimers: not an official UBCKNN exam; no guaranteed-pass messaging.
- Payments: ZaloPay (Zalo channel), VNPay/MoMo (web) [ASSUMPTION: MoMo included alongside VNPay as discussed in tech direction].

**Out (MVP)**

- B2B / enterprise licensing.
- Creator marketplace and commission model.
- Affiliate program for group admins.
- Additional certification verticals beyond CNVCK.
- Native mobile applications.

## Vision

If CNVCK MVP succeeds, Practice Exam becomes the **default affordable practice layer** for professional certification prep in Vietnam — starting with securities, then expanding to additional exam types. A future **creator marketplace** would let verified content authors publish subject packs while the platform takes commission; group admins could earn affiliate revenue for referrals. The core identity, subscription, and editorial infrastructure built for CNVCK would scale to new verticals without rebuilding the platform.

## Risks and Open Questions

| Risk | Mitigation direction |
|---|---|
| **Content copyright** from community-sourced material | Editorial SOP, source attribution policy, takedown process |
| **Answer accuracy** | Two-stage review before publish; user error reporting |
| **Zalo Mini App review policy** | Early compliance review; avoid prohibited claims and payment edge cases |
| **Free tier limits** | Admin-configurable caps; exact numbers TBD in PRD |

## Tech Direction (Summary)

Next.js, PostgreSQL, Zalo OAuth/ZaloPay, VNPay/MoMo for web payments. Detailed architecture, data models, and admin function inventory are documented in `addendum.md`. Project management uses BMAD v6.9.0.

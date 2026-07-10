---
id: STORY-56
status: ready
prd_refs: ["FR-43"]
ad_refs: ["AD-6"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-56: Webhook event log and manual retry

**Epic:** EPIC-12

As a **Super Admin**,  
I want **to view webhook events on A-83**,  
So that **I can diagnose OAuth and payment integration failures**.

## Acceptance Criteria

### AC-1

**Given** log shows Zalo OAuth and payment webhook events with payload status and errors  

**When** retains 90 days of events  

**Then** failed webhooks are manually retryable from admin  

**And** retry is idempotent per AD-6 PaymentWebhookEvent rules

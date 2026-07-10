---
id: STORY-17
status: ready
prd_refs: ["FR-6"]
ad_refs: ["AD-5", "AD-7"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-17: SePay payment adapter

**Epic:** EPIC-4

As a **Candidate**,  
I want **to pay via SePay hosted checkout redirect**,  
So that **I have an alternate Vietnam payment option at checkout**.

## Acceptance Criteria

### AC-1

**Given** SePayAdapter implements PaymentProvider port  

**When** checkout creates SePay redirect URL  

**Then** web uses redirect; Zalo uses `zmp.openWebview` for checkout [ASSUMPTION]  

**And** provider selectable at checkout or admin-configured default

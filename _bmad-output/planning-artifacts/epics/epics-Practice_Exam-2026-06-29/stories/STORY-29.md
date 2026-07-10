---
id: STORY-29
status: ready
prd_refs: ["FR-10", "FR-11", "FR-12"]
ad_refs: ["AD-12"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-29: Mock exam candidate UI flow (briefing through results)

**Epic:** EPIC-6

As a **Candidate**,  
I want **a complete mock exam UI from briefing Z-31/W-31 through results Z-34/W-34**,  
So that **I can take a full mock exam on web or Zalo**.

## Acceptance Criteria

### AC-1

**Given** briefing shows duration, rules, attempts remaining  

**When** timer bar uses mono font with aria-live at 5:00 and 1:00  

**Then** exit during exam shows confirm dialog  

**And** pass/fail copy follows EXPERIENCE.md voice (no gamification)

---
id: STORY-49
story_key: 8-39-import-template-download
prd_refs: ["FR-22"]
ad_refs: ["AD-10"]
---

# STORY-49: Downloadable question import template

As a **Content Editor**,  
I want **to download an Excel template from A-33 before bulk import**,  
So that **I know the exact column format and reduce import errors**.

**Acceptance Criteria:**

**Given** A-33 bulk import page  
**When** editor clicks "Tải file mẫu"  
**Then** API returns `.xlsx` with Vietnamese canonical columns and one example row  
**And** the template parses successfully via existing import parser

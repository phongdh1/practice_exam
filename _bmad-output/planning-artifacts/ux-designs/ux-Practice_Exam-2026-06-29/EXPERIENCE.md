---
name: Practice Exam
status: final
sources:
  - _bmad-output/planning-artifacts/prds/prd-Practice_Exam-2026-06-29/prd.md
  - _bmad-output/planning-artifacts/prds/prd-Practice_Exam-2026-06-29/addendum.md
  - _bmad-output/planning-artifacts/briefs/brief-Practice_Exam-2026-06-29/brief.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-07-09-study-mode.md
updated: 2026-07-09
---

# Practice Exam — Experience Spine

> Multi-surface CNVCK certification prep. Candidate surfaces: Zalo Mini App + responsive web. Operations: Admin Back-Office. Paired with `DESIGN.md`. Spines win on conflict with any future mock or wireframe.

## Foundation

**Form factor:** Multi-surface — Zalo Mini App (mobile-first, in-ecosystem), responsive web (mobile through desktop), Admin Back-Office (desktop-primary, tablet-capable).

**UI system:** [ASSUMPTION] shadcn/ui on Next.js 15+ with Tailwind CSS for web and admin. Zalo Mini App renders shared React components in Zalo webview where platform policy allows; Zalo-native OAuth and ZaloPay flows use platform SDK chrome.

**Visual identity:** `DESIGN.md` owns colors, typography, components. This spine references tokens as `{path.to.token}` (e.g., `{colors.primary}`, `{typography.question-stem.fontSize}`).

**Language & locale:** Vietnamese UI throughout candidate surfaces. VND currency. ICT timezone for Free Tier reset and subscription dates. Admin Back-Office UI in Vietnamese with English acceptable for technical labels in logs/IDs.

**Legal posture:** Persistent UBCKNN non-affiliation disclaimer (FR-15). No "guaranteed pass" or "official exam questions" copy anywhere (FR-16).

**Phase 1 catalog:** Two Subjects at launch — Pháp luật về chứng khoán và thị trường chứng khoán; Phân tích báo cáo tài chính doanh nghiệp (PRD §13.1).

## Information Architecture

### Zalo Mini App (Candidate)

Bottom tab nav: **Trang chủ** | **Tiến độ** | **Tài khoản**. Stack navigation within tabs. Modal sheets for paywall and payment.

| Screen | ID | Purpose | Primary entry |
|---|---|---|---|
| Zalo OAuth gate | Z-01 | First-open auth via Zalo OAuth | Mini App launch |
| First-visit disclaimer | Z-02 | UBCKNN disclaimer acknowledgment (FR-15) | Post-auth first visit |
| Home / Subject catalog | Z-10 | Browse active Subjects, pricing, Free Tier status | Tab: Trang chủ |
| Subject detail | Z-11 | Subject description, subscription state, Study/Practice/Mock CTAs, Free + Study Tier meters | Catalog card tap |
| Study question list | Z-12 | Browse Published questions (stem + metadata only; no answers); inline Study Tier meter | "Xem tất cả câu hỏi" on Z-11 |
| Study question detail | Z-13 | Full question with correct answer + explanation visible (read-only; no submit) | Z-12 row tap |
| Study Tier paywall | Z-14 | Study Tier cap (default 5 views/month); Subscribe CTA (FR-47) | 6th new detail view or locked row tap |
| Practice session setup | Z-20 | Confirm Subject, show Free Tier remaining or unlimited | "Luyện tập" on Z-11 |
| Practice question | Z-21 | One question at a time, answer, immediate feedback | Z-20 start / resume |
| Practice session summary | Z-22 | Score, questions answered, link to history | End session or cap hit |
| Free Tier paywall | Z-23 | Monthly price, benefits, Subscribe CTA (FR-5) | 20th free question or manual |
| Subscribe / checkout | Z-24 | Subject, price, ZaloPay CTA | Z-23 or subscribe on Z-11 |
| ZaloPay processing | Z-25 | Provider flow; return handling | Z-24 confirm |
| Subscription confirmed | Z-26 | Active until date, unlimited access confirmation | Z-25 success |
| Mock Exam list | Z-30 | Available templates, attempts remaining | Z-11 or tab shortcut |
| Mock Exam briefing | Z-31 | Duration, sections, rules, start CTA | Template tap |
| Mock Exam — section | Z-32 | Timed questions, forward-only within section | Z-31 start |
| Mock Exam — review all | Z-33 | Cross-section answer review before submit | After final section |
| Mock Exam results | Z-34 | Score, pass/fail, section breakdown | Submit exam |
| Mock Exam question review | Z-35 | Per-question explanations post-submit | Z-34 drill-down |
| Progress dashboard | Z-40 | Per-Subject summaries, 30/90 day toggles | Tab: Tiến độ |
| Attempt history | Z-41 | Chronological practice + mock list | Z-40 or account |
| Attempt detail | Z-42 | Session questions, scores, explanations | Z-41 row tap |
| Account / profile | Z-50 | Display name, linked status, subscriptions | Tab: Tài khoản |
| Link web account info | Z-51 | Instructions + "Liên kết tài khoản web" if unlinked | Z-50 |
| Settings | Z-52 | Disclaimer, privacy policy, support contact | Z-50 |
| Maintenance | Z-90 | Branded maintenance message (FR-46) | System setting |
| Auth error | Z-91 | OAuth failure + retry (UJ-1 edge) | Z-01 failure |

### Responsive Web (Candidate)

Top nav: **Môn học** | **Tiến độ** | **Tài khoản**. Unauthenticated users see marketing landing with sign-in.

| Screen | ID | Purpose | Primary entry |
|---|---|---|---|
| Landing / marketing | W-00 | Value prop, Phase 1 Subjects, sign-in CTAs | `/` unauthenticated |
| Sign in | W-01 | Email/password, Google OAuth (FR-1) | W-00 CTA |
| Register | W-02 | Email registration | W-01 link |
| First-visit disclaimer | W-03 | UBCKNN disclaimer (FR-15) | Post-auth first visit |
| Subject catalog | W-10 | Same as Z-10 | Nav or post-auth home |
| Subject detail | W-11 | Same as Z-11 | Catalog card |
| Study question list | W-12 | Same as Z-12 | "Xem tất cả câu hỏi" on W-11 |
| Study question detail | W-13 | Same as Z-13 | W-12 row tap |
| Study Tier paywall | W-14 | Same as Z-14 | 6th new detail view or locked row tap |
| Practice session setup | W-20 | Same as Z-20 | Subject CTA |
| Practice question | W-21 | Same as Z-21 | W-20 |
| Practice session summary | W-22 | Same as Z-22 | End / cap |
| Free Tier paywall | W-23 | Same as Z-23 | Cap or CTA |
| Subscribe / checkout | W-24 | VNPay + MoMo options (FR-6) | W-23 or Z-11 |
| Payment processing | W-25 | Provider redirect / return | W-24 |
| Subscription confirmed | W-26 | Same as Z-26 | W-25 success |
| Mock Exam list | W-30 | Same as Z-30 | W-11 |
| Mock Exam briefing | W-31 | Same as Z-31 | W-30 |
| Mock Exam — section | W-32 | Same as Z-32 | W-31 |
| Mock Exam — review all | W-33 | Same as Z-33 | Final section |
| Mock Exam results | W-34 | Same as Z-34 | Submit |
| Mock Exam question review | W-35 | Same as Z-35 | W-34 |
| Progress dashboard | W-40 | Same as Z-40 | Nav: Tiến độ |
| Attempt history | W-41 | Same as Z-41 | W-40 |
| Attempt detail | W-42 | Same as Z-42 | W-41 |
| Account / profile | W-50 | Profile, subscriptions, linked accounts | Nav: Tài khoản |
| Link Zalo account | W-51 | Zalo OAuth link-only flow (FR-1, FR-2) | W-50 |
| Account merge summary | W-52 | Combined subscriptions + attempt counts (FR-3) | Post-link merge |
| Settings | W-53 | Disclaimer, privacy, data export request info | W-50 |
| Maintenance | W-90 | Same as Z-90 | System |
| Auth error | W-91 | Provider failure + retry | W-01 / W-51 |

### Admin Back-Office

Sidebar navigation grouped by domain. Role-gated per RBAC matrix (addendum). Desktop-primary layout.

| Screen | ID | Purpose | Roles |
|---|---|---|---|
| Admin login | A-01 | Email + password | All admin roles |
| Dashboard | A-10 | KPIs: subscriptions, revenue snapshot, content queue depth | Super admin, finance |
| Subject list | A-20 | CRUD, visibility, ordering (FR-25) | Super admin |
| Subject edit | A-21 | Name, code, description, pricing, Free Tier + Study Tier limits (FR-26) | Super admin |
| Subject blueprint metadata | A-22 | CNVCK weighting, topic tags (FR-27) | Super admin |
| Question bank list | A-30 | Search, filter, bulk actions (FR-23) | Editor, super admin |
| Question editor | A-31 | Stem, options, explanation, tags, source (FR-21) | Editor |
| Question preview | A-32 | Candidate-render preview (FR-24) | Editor |
| Bulk import | A-33 | CSV/Excel upload, error report (FR-22) | Editor |
| Editorial queue | A-40 | Pending review list (FR-18) | Reviewer |
| Review detail | A-41 | Approve / reject with comments (FR-17) | Reviewer |
| Flagged questions queue | A-42 | Candidate reports (FR-9) | Reviewer, editor |
| Mock Exam Template list | A-50 | Template CRUD (FR-28) | Super admin |
| Mock Exam Template editor | A-51 | Sections, timing, pool rules (FR-28, FR-29) | Super admin |
| Mock Exam preview | A-52 | Generated exam preview before release | Super admin |
| User search | A-60 | Search by email, phone, Zalo ID (FR-31) | Support |
| User profile | A-61 | Identities, subscriptions, history summary | Support |
| Manual subscription grant | A-62 | Grant/revoke with reason (FR-32) | Support |
| Account merge override | A-63 | Force merge with ticket ref (FR-33) | Support |
| User data export | A-64 | JSON/CSV download (FR-34) | Support |
| Account suspension | A-65 | Suspend user (FR-35) | Super admin, support |
| Payment transaction log | A-70 | Filterable log (FR-36) | Finance |
| Reconciliation summary | A-71 | Per-provider daily (FR-37) | Finance |
| Refund processing | A-72 | Initiate refund (FR-38) | Finance |
| Revenue reports | A-73 | By Subject, channel, date (FR-39) | Finance |
| Promo codes | A-74 | Create/manage codes (FR-40) | Finance, super admin |
| Zalo Mini App config | A-80 | App credentials, status (FR-41) | Super admin |
| ZaloPay config | A-81 | Merchant settings, test mode (FR-42) | Super admin |
| Webhook log | A-83 | OAuth + payment events (FR-43) | Super admin |
| System settings | A-90 | Disclaimer text, maintenance, email templates (FR-46) | Super admin |
| Admin user management | A-91 | Create/disable admins, roles (FR-45) | Super admin |
| RBAC reference | A-92 | Permission matrix (read-only) | Super admin |

**IA closure:** Every PRD candidate journey (UJ-1–4, UJ-7) maps to screens above. UJ-5 maps to A-30–A-42. UJ-6 maps to A-20–A-22, A-50–A-52, A-70–A-73 (A-21 includes Study Tier limit). Cross-channel sync screens (W-51–W-52, Z-51) cover UJ-3. Study Mode (Z-12–14 / W-12–14) sits between Subject detail and Practice setup — browse/read journey distinct from assess-first Practice (Z-20–22).

## Voice and Tone

Microcopy is **direct, respectful, and exam-serious** in Vietnamese. No hype, no gamification, no faux camaraderie. Candidates are professionals preparing for a high-stakes certification.

| Context | Do | Don't |
|---|---|---|
| Practice feedback | "Chính xác. Giải thích bên dưới." | "Tuyệt vời! Bạn giỏi quá! 🎉" |
| Free Tier cap | "Bạn đã dùng hết 20 câu luyện tập miễn phí tháng này." | "Hết lượt rồi! Nâng cấp ngay!" |
| Study Tier cap | "Bạn đã xem hết 5 câu ôn miễn phí tháng này." | "Hết lượt xem đáp án!" |
| Study vs Practice distinction | "Ôn tập: xem đáp án trước. Luyện tập: làm bài rồi mới xem giải thích." | Conflate Study and Practice meters or copy |
| Study list empty | "Chưa có câu hỏi Published cho môn này." | Blame the candidate |
| Study locked row | "Đăng ký để xem đáp án" | Show correct answer in list preview |
| Study detail header | "Đáp án đúng" + explanation below | Require answer submit before reveal |
| Subscribe CTA | "Đăng ký môn — 100.000 ₫/tháng" | "Mở khóa siêu năng lực!" |
| Mock Exam timer | "Còn 12:34" | "Nhanh lên nhé!" |
| Pass result | "Đạt — 72/100 điểm" | "Chúc mừng chiến thắng!" |
| Fail result | "Chưa đạt — 58/100 điểm. Xem phân tích bên dưới." | "Tiếc quá! Thử lại nhé!" |
| Disclaimer | "Đây không phải kỳ thi chính thức của UBCKNN." | Omit or bury disclaimer |
| Account link | "Liên kết tài khoản để đồng bộ tiến độ và gói đăng ký." | "Kết nối để nhận quà!" |
| Subscription expiry | "Gói hết hạn sau 3 ngày. Gia hạn để tiếp tục luyện tập." | Aggressive countdown banners |
| Admin rejection | "Từ chối — vui lòng xem ghi chú và chỉnh sửa." | Blame language |
| Error (auth) | "Không thể đăng nhập Zalo. Thử lại." | Silent failure or raw error codes |
| Empty progress | "Chưa có dữ liệu. Bắt đầu luyện tập để theo dõi tiến độ." | "Bạn chưa làm gì cả!" |

**Formatting conventions:**
- VND: `100.000 ₫/tháng` (dot thousands separator, đ suffix)
- Dates: `29/06/2026` or `29 tháng 6, 2026` for display; ISO internally
- Subscription status: "Đang hoạt động đến {date}" / "Hết hạn — gia hạn để tiếp tục"

## Component Patterns

Behavioral specs. Visual anatomy in `DESIGN.md.Components`.

| Pattern | Surfaces | Behavioral rules |
|---|---|---|
| Subject card | Z-10, W-10 | Tap opens detail. Shows name, price/month, subscription pill or Free Tier meter. Phase 1: max 2 cards prominently featured. |
| Free Tier meter | Z-11, W-11 | "Đã dùng {n}/20 câu luyện tập miễn phí tháng này." Thin `{components.progress-bar-fill}` bar. Resets ICT 1st of month. Hidden when subscribed. Coexists with Study Tier meter and Study CTA. |
| Study Tier meter | Z-11, W-11, Z-12, W-12 | "Đã xem {n}/5 câu ôn miễn phí tháng này." Uses `{components.study-meter-badge}`. Resets ICT 1st of month. Hidden when subscribed. Independent of Free Tier meter. |
| Study CTA | Z-11, W-11 | Secondary/outline button "Xem tất cả câu hỏi" → Z-12/W-12. Coexists with "Luyện tập" (primary) and "Thi thử" on same Subject detail. Order: Study → Practice → Mock [ASSUMPTION: Study secondary to Practice for conversion priority]. |
| Study question list row | Z-12, W-12 | Shows stem preview (truncated), topic tag, difficulty. No answer indicators. Tap → Z-13/W-13 if allowed; at Study Tier cap, row shows lock icon and tap → Z-14/W-14. Already-viewed this month: no lock; re-tap does not consume view [ASSUMPTION: idempotent per FR-47]. Paginated; pull-to-refresh on Zalo. |
| Study question detail | Z-13, W-13 | Read-only layout: stem `{typography.question-stem}`, options with correct answer highlighted via `{components.answer-option-correct}` (no incorrect state — no submit). Explanation in `{typography.body}` below. "Báo cáo câu hỏi" ghost action visible. Back → list. First view this period consumes 1 Study Tier view server-side. |
| Study Tier paywall sheet | Z-14, W-14 | Bottom sheet (Zalo/mobile), dialog (desktop). Headline explains Study Tier vs Free Tier: "Xem đáp án và giải thích cho tất cả câu hỏi." Lists benefits: unlimited study + practice + mock exams. Primary: Subscribe → Z-24/W-24. Secondary: "Quay lại danh sách" or "Luyện tập miễn phí" if Free Tier remains. |
| Practice question card | Z-21, W-21 | One question visible. Options: radio (single), checkbox (multiple), toggle (T/F). Submit answer → reveal correct/incorrect + explanation inline. "Báo cáo câu hỏi" ghost action always visible post-reveal. |
| Practice navigation | Z-21, W-21 | "Câu tiếp" disabled until answer submitted. "Kết thúc" exits to summary; session resumable 24h. Progress indicator: "Câu {n}" without total if pool is adaptive [ASSUMPTION: show total if fixed session size]. |
| Paywall sheet | Z-23, W-23 | Bottom sheet (mobile/Zalo), dialog (desktop). Lists benefits: unlimited practice, mock exams. Primary: Subscribe. Secondary: "Để sau" dismisses without guilt copy. |
| Payment flow | Z-24–25, W-24–25 | Leave app to provider; on return, poll/subscribe to confirmation. Loading skeleton on W-26/Z-26 until entitlement confirmed. Failure: retry + support link. |
| Subscription status pill | Z-11, W-11, Z-50 | Active: green badge. Expiring ≤3d: amber badge + inline renewal CTA. Expired: muted + subscribe CTA. |
| Mock Exam timer bar | Z-32, W-32 | Sticky top. Persists across questions in section. Warning color below 5:00. Auto-submit on expiry with toast. |
| Section divider | Z-32, W-32 | "Phần 2: Phân tích báo cáo tài chính — 15 câu, 30 phút" — forward-only; no back to prior section during timed attempt. |
| Pre-submit review | Z-33, W-33 | Grid of all questions by section; tap to jump and change answer. Explicit "Nộp bài" with confirmation dialog. |
| Results breakdown | Z-34, W-34 | Overall score + pass/fail threshold line. Section bars weighted per template. Primary CTA: "Xem đáp án chi tiết." |
| Attempt history row | Z-41, W-41 | Type icon (practice/mock), Subject, date, score. Tap → detail. |
| Disclaimer banner | Z-02, W-03, persistent footer | First visit: modal acknowledgment required. Persistent compact banner in footer/settings. Text from CMS. |
| Account link flow | W-51, Z-51 | Initiator must be authenticated. OAuth secondary provider. Merge summary on conflict (FR-3). |
| Admin question editor | A-31 | Autosave draft. Status pill: Draft / In Review / Published. Submit for review action when Draft complete. |
| Admin editorial queue row | A-40 | Subject, author, age, assign-to-self. Open → A-41. |
| Admin data table | A-30, A-60, A-70 | Server-side pagination. Filters persist in URL. Export CSV where FR specifies. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Cold load | All candidate | `{colors.surface-subtle}` background; shadcn `Skeleton` cards matching Subject catalog layout. |
| Unauthenticated | W-00–W-02 | Marketing hero + sign-in. No Subject practice without auth. |
| Zalo first open | Z-01 | Full-screen Zalo OAuth; no catalog until complete. |
| Free Tier remaining | Z-11, W-11 | Practice meter visible; practice enabled. Study meter and Study CTA visible independently. |
| Study Tier remaining | Z-11, W-11, Z-12 | Study meter shows {n}/5; list browsable; detail with answers loads. |
| Study Tier exhausted | Z-13 attempt, Z-12 locked rows | Block new detail views; Z-14 paywall. List remains visible with locked state on unviewed rows. Already-viewed questions still open without consuming. Practice Mode unaffected if Free Tier remains. |
| Study detail — subscribed | Z-13, W-13 | No meter; unlimited detail access; no consumption. |
| Study detail — already viewed | Z-13, W-13 | Full payload without incrementing Study Tier counter this period. |
| Free Tier exhausted | Z-21 → Z-23 | Block new question; paywall sheet. Existing session summary still reachable. Study Mode unaffected if Study Tier remains. |
| Subscribed | Z-11, W-11 | "Đang hoạt động đến {date}" pill; mock exams unlocked. |
| Subscription expiring | Z-11, W-50 | Amber badge; banner on home: "Gia hạn để không gián đoạn ôn tập." |
| Subscription expired | Z-11 | Revert to Free Tier meter; mock exams hidden with explanation. |
| Practice session in progress | Z-21 | Resume prompt if <24h: "Tiếp tục phiên luyện tập?" |
| Mock Exam in progress | Z-32 | Connection loss: toast "Đã lưu câu trả lời." Answers incremental save. |
| Mock Exam attempts exhausted | Z-30 | Template card disabled: "Đã dùng hết 3 lượt tháng này." |
| Empty attempt history | Z-41, W-41 | Empty state + CTA "Bắt đầu luyện tập." |
| Empty progress | Z-40, W-40 | Per-Subject empty card with practice CTA. |
| Payment pending | Z-25, W-25 | Spinner + "Đang xử lý thanh toán…" Do not grant entitlement until confirmed. |
| Payment failed | Z-25, W-25 | Error + "Thử lại" + support. No subscription created. |
| Account merge | W-52 | Summary card: combined attempts, surviving subscriptions, voided duplicates explained. |
| OAuth failure | Z-91, W-91 | Error message + retry; no partial session. |
| Account suspended | All candidate sign-in | Generic "Tài khoản đã bị vô hiệu hóa. Liên hệ hỗ trợ." |
| Maintenance | Z-90, W-90 | Branded static page; practice blocked; admin still accessible. |
| Admin: empty queue | A-40 | "Không có câu hỏi chờ duyệt." |
| Admin: import errors | A-33 | Row-level error table; no silent partial import. |
| Admin: insufficient pool | A-52 | Blocking error: "Không đủ câu hỏi Published để tạo đề." |

## Interaction Primitives

**Candidate — touch-first (Zalo) / responsive (web):**
- Tap to select answer option; explicit "Xác nhận" for multiple-choice submit [ASSUMPTION: prevents mis-tap on MCQ].
- Swipe-back within Zalo stack follows platform convention; practice flow uses in-app "Quay lại" instead of destructive swipe.
- Pull-to-refresh on Subject catalog and Attempt history.
- Bottom sticky CTAs on mobile for primary actions (Subscribe, Câu tiếp, Nộp bài).
- No keyboard shortcuts on candidate surfaces (except web: Tab order for accessibility).

**Mock Exam — focus mode:**
- During Z-32/W-32: hide bottom tab nav [ASSUMPTION: reduces accidental exit]; confirm dialog on exit attempt.
- Timer always visible.
- Forward-only within section; backward allowed in pre-submit review (Z-33/W-33) only.

**Admin — efficiency-first:**
- `Cmd/Ctrl+S` saves in question editor.
- Table row click opens detail; bulk select for archive.
- Filter chips + search debounced 300ms.
- Destructive actions (unpublish, suspend, refund) require confirmation dialog with reason field.

**Banned everywhere:**
- Infinite scroll on exam questions (paginate history only).
- Gamification (streaks, badges, leaderboards).
- Auto-advance to next question without showing explanation in Practice Mode.
- Skipping disclaimer on first visit.
- Granting Mock Exam access on Free Tier.
- Exposing correct answers or explanations in Study list API responses (list is stem-only; detail gated server-side).
- Requiring answer submit in Study Mode detail (answers visible on load).

## Accessibility Floor

Behavioral requirements. Visual contrast in `DESIGN.md`.

- **WCAG 2.1 AA** on responsive web candidate flows (PRD §8).
- **Zalo Mini App:** follow Zalo platform accessibility guidelines; minimum touch target 44×44px.
- Answer options: entire row is tap target; `aria-pressed` / `aria-checked` on selection.
- Practice feedback: not color-alone — icons + text ("Chính xác" / "Chưa chính xác") with `{colors.success}` / `{colors.error}`.
- Mock Exam timer: `aria-live="polite"` announcements at 5:00 and 1:00 remaining.
- Form errors: inline Vietnamese message linked via `aria-describedby`.
- Focus order matches visual order; modals trap focus.
- Images in Questions require admin-provided alt text (A-31); candidate sees alt or "Hình ảnh đính kèm" fallback.
- Admin tables: sortable columns announce state; pagination has accessible labels.

## Responsive & Platform

### Zalo Mini App vs Responsive Web

| Concern | Zalo Mini App | Responsive Web |
|---|---|---|
| Auth | Zalo OAuth only (primary) | Email, Google; Zalo link-only |
| Payments | ZaloPay | VNPay, MoMo |
| Navigation | Bottom tabs (3) | Top nav + hamburger on mobile |
| Paywall | Bottom `Sheet` | `Sheet` mobile / `Dialog` desktop |
| Account linking | "Liên kết tài khoản web" | "Liên kết tài khoản Zalo" |
| Profile source | Zalo profile default | Overridable; Zalo preferred when linked |
| Distribution | Zalo group links, Mini App store | SEO landing, direct URL |
| Safe area | Zalo status bar + home indicator | Standard browser |
| Offline | Not supported — toast on disconnect | Not supported MVP |
| Disclaimer | Z-02 modal + compact footer | W-03 modal + footer |

### Breakpoints (Web + Admin)

| Breakpoint | Candidate web | Admin |
|---|---|---|
| `< md` (768px) | Single column; hamburger nav | Sidebar → sheet |
| `md–lg` | 2-column Subject grid | Icon sidebar |
| `≥ lg` (1024px) | 2-col grid; wider gutters | Full sidebar + content |
| `≥ xl` (1280px) | `max-w-2xl` question column centered | Full table width |

### Content parity

Server-authoritative entitlements and Attempt History must be identical across Zalo and web within 1 minute of any action (SM-3). UI layout may differ; data and capabilities must not.

## Key Flows

### UJ-1 — Linh tries free practice in Zalo (FR-1, FR-4, FR-5, FR-8, FR-15)

**Protagonist:** Linh, 26, securities firm analyst, discovers Mini App via Zalo study group.

1. Linh taps shared Mini App link → **Z-01** Zalo OAuth.
2. First visit → **Z-02** disclaimer modal; she taps "Đã hiểu" (required).
3. **Z-10** catalog shows 2 Phase 1 Subjects. She taps Pháp luật về chứng khoán → **Z-11**.
4. **Z-11** shows Free Tier meter 0/20. She taps "Luyện tập" → **Z-20** → **Z-21**.
5. She answers 5 questions; each shows immediate explanation with correct/incorrect styling per `{components.answer-option-correct}` / `{components.answer-option-incorrect}`.
6. On question 20 (or when she hits cap), **Z-23** paywall: "100.000 ₫/tháng" + benefits. She taps "Để sau."
7. **Climax:** She returns to **Z-10**; Subject card shows "Đã dùng 20/20 câu miễn phí" — clear, no confusion about why she cannot continue. Mini App remains bookmarked in Zalo.

**Failure — OAuth (Z-91):** "Không thể đăng nhập Zalo. Thử lại." Retry button. No catalog access.

### UJ-2 — Linh subscribes on Zalo (FR-6, FR-7, FR-13)

**Protagonist:** Linh, one week later, authenticated return visit.

1. **Z-10** → **Z-11** Pháp luật. Paywall prompt or "Đăng ký" CTA → **Z-24**.
2. **Z-24** shows price, ZaloPay button (provider branding). Tap → **Z-25** ZaloPay SDK.
3. Payment succeeds → **Z-26**: "Đăng ký thành công! Đang hoạt động đến 29/07/2026." Unlimited practice confirmed.
4. She starts practice → **Z-21**, completes 30 questions → **Z-22** summary.
5. **Z-41** Attempt history shows new session with score.
6. **Climax:** **Z-11** now shows green `{components.subscription-badge-active}` "Đang hoạt động đến 29/07/2026" — entitlement unmistakable. She plans Mock Exam for weekend.

**Failure — payment cancelled:** Return to **Z-24** with "Thanh toán chưa hoàn tất." No entitlement change.

### UJ-3 — Minh links Zalo to web account (FR-2, FR-3)

**Protagonist:** Minh, web subscriber, wants Zalo access.

1. Minh on **W-50** Account → "Liên kết tài khoản Zalo" → **W-51**.
2. Zalo OAuth completes. System detects existing Zalo-only User with free-tier usage on same Subject.
3. **W-52** merge summary: "Đã hợp nhất 45 lượt luyện tập. Gói Phân tích BCTC giữ đến 15/08/2026. Gói trùng lặp đã hủy."
4. Minh opens Zalo Mini App → **Z-10**. Subscription and history match web.
5. **Climax:** **Z-11** for Phân tích BCTC shows identical subscription date and attempt count as **W-11** — cross-channel sync visible without support contact.

**Failure — link to different user's provider:** "Tài khoản Zalo này đã liên kết với người dùng khác."

### UJ-4 — Linh takes Mock Exam (FR-10, FR-11, FR-12, FR-14)

**Protagonist:** Linh, subscribed to both Phase 1 Subjects.

1. **Z-11** → "Thi thử" → **Z-30** lists Subject-scoped Mock Exam. "Còn 3/3 lượt tháng này."
2. **Z-31** briefing: 60 phút, 60 câu, pass threshold 60%. Rules: forward-only per section.
3. **Z-32** timed sections. Timer bar `{components.mock-exam-timer}` counts down. She cannot return to prior section.
4. Final section complete → **Z-33** review all answers. She changes 2 answers. Taps "Nộp bài" → confirm dialog.
5. **Z-34** results: 72/100 — Đạt. Section breakdown bars match official weighting.
6. **Z-35** per-question explanations. She flags one question → toast "Đã gửi báo cáo."
7. **Z-40** Progress dashboard updates within 5 minutes.
8. **Climax:** **Z-34** section breakdown — "Pháp luật CK: 85% | Phân tích BCTC: 68%" — mirrors CNVCK structure. Linh sees exactly where to focus next.

**Failure — time expired:** Auto-submit → **Z-34** with note "Đã tự động nộp khi hết giờ."

### UJ-5 — Editor Hương publishes a question (FR-17, FR-18, FR-20)

**Protagonist:** Hương, content editor.

1. **A-01** login → **A-30** question bank. Filter: Pháp luật, Draft.
2. "Tạo câu hỏi" → **A-31**. Enters stem, 4 options, explanation, difficulty, topic tags, source reference.
3. Autosave draft. "Gửi duyệt" → status In Review.
4. Reviewer (not Hương) opens **A-40** queue → assigns → **A-41**. Approves with comment.
5. Question → Published. Available in candidate practice pool.
6. **Climax:** Hương opens **A-32** preview — rendering matches **Z-21** exactly. She trusts what candidates will see.

**Failure — rejection:** Question returns to Draft with reviewer comment visible at top of **A-31**. Push notification deferred [ASSUMPTION: in-app badge only MVP].

### UJ-6 — Admin Trung configures Subject (FR-25, FR-26, FR-39)

**Protagonist:** Trung, platform admin.

1. **A-20** Subject list → edit Pháp luật → **A-21**. Sets price 100.000 ₫, Free Tier 20, Study Tier 5.
2. **A-22** blueprint metadata: section weights for Mock Exam.
3. **A-50** → **A-51** create Subject-scoped Mock Exam Template. **A-52** preview passes pool validation.
4. Activates Subject visibility when ≥200 Published Questions gate met (PRD §13.1).
5. **A-10** dashboard shows subscription count increment as candidates subscribe.
6. **Climax:** Trung refreshes **Z-10** on his phone — new price and Subject appear within minutes. Catalog matches admin config.

### UJ-7 — Linh browses questions to study before practicing (FR-47)

**Protagonist:** Linh, 26, securities firm analyst — same persona as UJ-1; returns to Pháp luật chứng khoán after seeing peers share answer dumps in her Zalo study group.

1. **Z-10** → **Z-11** Pháp luật. She sees two meters: "Đã dùng 0/20 câu luyện tập miễn phí" and "Đã xem 0/5 câu ôn miễn phí" — distinct labels, no confusion.
2. She taps "Xem tất cả câu hỏi" → **Z-12** paginated list. Stems and metadata only; no answer leakage in list rows `{components.study-question-row}`.
3. She opens question 1 → **Z-13**. Correct answer highlighted `{components.answer-option-correct}`; explanation below. Study meter updates to 1/5.
4. She browses four more new questions (2–5) — each **Z-13** visit consumes one view. Meter shows 5/5.
5. She taps question 6 (not yet viewed) → **Z-14** Study Tier paywall: explains 5 study views vs 20 practice answers are separate pools. She taps "Để sau."
6. She returns to **Z-11** and taps "Luyện tập" → **Z-20** → **Z-21**. Free Tier still shows 0/20 — practice pool untouched.
7. **Climax:** Linh reads five full solutions without paying, understands the product value, and still has her entire Free Tier for active practice — Study and Practice feel like complementary modes, not duplicate paywalls.

**Failure — at cap, re-open viewed question:** Question 3 opens in **Z-13** without extra consumption or paywall (idempotent re-view).

**Failure — subscribed user:** **Z-12** list has no meter; all rows unlocked; **Z-13** loads without counter increment.

## Assumptions Index

Assumptions flagged during UX fast path. Confirm with stakeholder before architecture lock.

| ID | Assumption | Impact |
|---|---|---|
| UX-A1 | shadcn/ui + Tailwind as UI system for web and admin | Architecture, component library |
| UX-A2 | Be Vietnam Pro + Inter typography | Font licensing, bundle size |
| UX-A3 | Brand colors: navy `#1B4F72` + success green `#0E7C4A` | DESIGN.md; marketing alignment |
| UX-A4 | No custom logo — wordmark only until brand assets delivered | DESIGN.md Brand & Style |
| UX-A5 | Light mode only MVP; dark mode deferred | DESIGN.md Colors |
| UX-A6 | Zalo Mini App 3-tab bottom nav (Trang chủ, Tiến độ, Tài khoản) | Zalo IA |
| UX-A7 | MCQ requires explicit "Xác nhận" before reveal | Practice interaction |
| UX-A8 | Hide bottom tabs during active Mock Exam | Focus mode |
| UX-A9 | Zalo system font fallback if webfont fails in webview | Typography |
| UX-A10 | Editor rejection notification: in-app badge only (no push MVP) | UJ-5 failure path |
| UX-A11 | Practice progress shows "Câu {n}" without total when pool is open-ended | Practice UI |
| UX-A12 | Subject card uses letter/icon thumbnail, no stock photography | Visual design |
| UX-A13 | Study CTA secondary to Practice CTA on Z-11/W-11 | Subject detail layout priority |
| UX-A14 | Study list shows locked icon on unviewed rows at Study Tier cap (list stays visible) | Z-12/W-12 at-limit UX |
| UX-A15 | Study detail re-view same month is idempotent — no extra consumption | Aligns with FR-47 [ASSUMPTION] |
| UX-A16 | Default Study Tier limit 5 views/month per Subject (admin-overridable via A-21) | Meter copy, paywall timing |

*Inherited from PRD without override:* account merge-all-progress, Free Tier 20/month ICT reset, Study Tier 5 views/month ICT reset (independent pool), Zalo OAuth web link-only, Mock Exam forward-only within section, 3 mock attempts/month default, 24h practice session resume, Study list stem-only / detail gated server-side.

## Open Questions

None blocking architecture start. Visual brand confirmation (UX-A3, UX-A4) recommended before high-fidelity marketing.

---

*Mock coverage: spine-only (no key-screen HTML mocks). See `.memlog.md` for fast-path record.*

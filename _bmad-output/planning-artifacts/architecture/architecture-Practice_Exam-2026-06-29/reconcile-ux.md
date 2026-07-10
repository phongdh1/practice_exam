# UX Reconciliation — Practice Exam Architecture

**Spine:** `ARCHITECTURE-SPINE.md` (2026-06-29)  
**UX:** `DESIGN.md`, `EXPERIENCE.md`

## Landed

| UX element | Architecture binding |
| --- | --- |
| shadcn/ui + Tailwind, DESIGN.md tokens | AD-12 `@practice-exam/ui` |
| 3 surfaces (Zalo, web, admin) | Monorepo apps; paradigm diagram |
| Zalo 3-tab nav, screen IDs Z-* | `zalo-mini-app` + TanStack Router |
| Web top nav, screen IDs W-* | `web` Next.js App Router |
| Admin sidebar A-* | `admin` Next.js App Router |
| Server-authoritative entitlements (SM-3) | AD-3, AD-6 |
| Payment pending/failed states (Z-25, W-25) | AD-7 poll pattern |
| Account link/merge (W-51, W-52, Z-51) | AD-4 auth flow |
| Bulk import error table (A-33) | AD-10 ImportBatch report |
| Mock Exam focus mode, timer | AD-11 server timer |
| Vietnamese locale, VND format | Conventions table |
| WCAG AA web | Client responsibility; no spine conflict |
| Phase 1 two Subjects | Inherited |

## Deltas — UX doc sync recommended

| UX reference | UX says | Architecture says |
| --- | --- | --- |
| EXPERIENCE §Responsive Platform — Payments | ZaloPay / VNPay / MoMo | SePay/PayOS hosted checkout all channels |
| DESIGN.md Components — Payment provider buttons | ZaloPay/VNPay/MoMo brand assets | SePay/PayOS official buttons per provider guidelines |
| EXPERIENCE UJ-2 | ZaloPay SDK flow Z-25 | PayOS/SePay redirect in webview; poll confirmation |
| EXPERIENCE UJ-3 | VNPay on web | SePay/PayOS on web |
| EXPERIENCE Foundation | ZaloPay flows use platform SDK chrome | OAuth stays Zalo SDK; **payment** uses provider redirect (AD-7) |

## TanStack / routing alignment

| UX assumption | Spine decision |
| --- | --- |
| UX-A1 Next.js 15+ for web/admin | Next.js 16.2.9 — compatible |
| Zalo shared React components | AD-9 Vite app consumes `@practice-exam/ui` |
| TanStack not named in UX | AD-8: Query all surfaces; Form admin+checkout; Router Zalo only |

## No conflict

- Screen inventory maps 1:1 to client apps — no missing surfaces
- State patterns (payment pending, merge, Free Tier) have API backing in AD-3, AD-6, AD-11
- Brand tokens unchanged; architecture does not override DESIGN.md colors/typography

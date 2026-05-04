# Memory

## Current Decisions

- Tailwind is used
- Mobile-first approach
- Component reuse required
- 8pt grid is baseline
- Safe-area-aware layout is required
- Existing structure must not be broken when adding new features
- 2026-05-04: Added `src/api` integration layer with typed `ApiResponse` envelope handling and endpoint modules to keep UI decoupled from transport details (Faz 1 contract aligned).
- 2026-05-04: Navbar language control uses custom `listbox` popover styled to landing dark/teal aesthetic (native `<select>` removed for dropdown appearance parity).
- 2026-05-04: Theme support added with `ThemeProvider`; selection persists in localStorage and falls back to `prefers-color-scheme`.
- 2026-05-04: API client wrappers were synchronized to local OpenAPI v1 (`http://localhost:15080/openapi/v1.json`); auth endpoints are intentionally env-driven because they are absent in this spec.
- 2026-05-04: After OpenAPI refresh, frontend API layer now includes `Employers`, `Workers`, and `SystemUserGroups` modules; auth defaults align to `SystemUsers/Login` and `SystemUsers/RefreshToken`.
- 2026-05-04: Auth session persistence added via `AuthProvider` (`ada-is-akademi:auth-session` in localStorage); `LoginModal` sign-in now updates global session and Navbar toggles login/logout action.
- 2026-05-04: Post-login UI now routes by role to dedicated Worker/Employer/Admin dashboards; admin detection uses `VITE_ADMIN_SYSTEM_USER_TYPES`, others derive from login audience.
- 2026-05-04: `RegisterAdmin` flow is handled inside Admin Dashboard (not auth modal) with dedicated i18n form fields and OpenAPI-aligned payload.
- 2026-05-04: Admin dashboard was upgraded to classic panel UX with sidebar navigation, summary cards, and section-specific detail screens.
- 2026-05-04: Admin detail sections are now operational: user lifecycle actions (`suspend/reactivate/ban`), password reset, and approval list query via `jobPostingId`.
- 2026-05-04: Admin welcome text now uses `/SystemUsers/Me` (name + surname when available), and summary cards support endpoint-driven live stats via optional env-configured paths.
- 2026-05-04: Persisted `auth-session` localStorage payload is now AES-GCM encrypted with Web Crypto and decrypted during app bootstrap (optional secret: `VITE_AUTH_STORAGE_SECRET`).
- 2026-05-04: Landing `HeroSection`, `HeroBackground`, `HeroCards`, and `LandingSections` now use theme-aware ocean light tokens (sky/cyan surfaces + slate text) to preserve contrast in light mode while keeping dark visuals unchanged.
- 2026-05-04: `LoginModal` now consumes `ThemeContext`; light mode uses ocean surfaces/borders/input tokens while dark mode keeps existing glass style to prevent readability mismatch when theme toggles.
- 2026-05-04: OpenAPI refresh re-validated against frontend API layer; no missing endpoint paths, and wrapper contracts were aligned for changed request/response shapes (removed `employerId` from posting-create payload, id-returning add-skill/add-permission responses, optional job application note).
- 2026-05-04: Admin dashboard mobile overflow fixed by enforcing `min-w-0` on content column, clipping accidental x-overflow at section level, stacking user action buttons to one-column on small screens, and enabling long approval rows to wrap.
- 2026-05-04: Admin summary adapter now defaults to `/Statistics/Overview` and maps new dashboard-statistics fields (`totalSystemUsers`, `pendingSystemUserCount`, `active/suspended/banned`) while keeping env-based fallback endpoints for backward compatibility.
- 2026-05-04: API path configuration is now centralized in `src/api/endpoints.ts` (version-controlled endpoint registry); auth/admin adapters no longer read path env vars, reducing runtime config drift and making endpoint evolution reviewable in code.
- 2026-05-04: Admin dashboard mobile layout refined for true mobile-first behavior: sidebar actions use grid on small screens (instead of horizontal strip), content spacing is reduced on mobile, summary/detail containers are compact, and card grid starts adapting from `sm`.
- 2026-05-04: Admin dashboard now renders extended `/Statistics/Overview` metrics in a dedicated responsive statistics block (workers, employers, postings, applications, activated-today) with locale-aware formatting and i18n labels for all supported locales.
- 2026-05-04: Detailed statistics cells in admin overview were normalized to reusable `DashboardCard` components with icon slots for consistent card language and better scanability on mobile.
- 2026-05-04: Admin overview statistics were regrouped into domain cards (`CandidateStatus`, `EmployerStatus`, `PostingStatus`, `ApplicationStatus`, `ActivationStatus`) where each card lists state rows and counts, improving information hierarchy on mobile.

---

## Known Patterns

- Card-based layouts
- Section spacing consistency
- Reusable page sections over one-off markup

---

## Rules

- Update when new decisions are made
- Keep project consistency
- Add date + short reason for each new decision

---

## Decision Log Template

Date:
Decision:
Reason:
Affected Areas:

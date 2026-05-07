# Memory

## Current Decisions

- 2026-05-07: Mutation sonrası bildirimler için `useActionToasts` + mevcut `NotificationProvider` kullanılıyor; mesajlar yalnızca i18n anahtarlarından (`runWithToast`), GET/list için toast yok.
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
- 2026-05-05: Frontend deployment containerization standardized with a multi-stage Docker build (`node:22-alpine` builder + `nginx:1.27-alpine` runtime) and SPA-safe nginx fallback (`try_files ... /index.html`) for refresh-safe client routing.
- 2026-05-05: Admin overview KPI row was redesigned to four operational cards (`Employer`, `Candidate`, `Job Posting`, `Job Application`) with `Active/Total` pairing and a lightweight inline trend chart to improve scanability without adding new chart dependencies.
- 2026-05-05: Admin sidebar `Candidates` menu now has a dedicated detail surface backed by `workersApi.getById`, with client-side filters (nationality/university/skill tags) and localized candidate cards across all supported locales.
- 2026-05-05: Admin `Candidates` section is now API-driven with `Workers/List` (server-side search seed, first-load hydration) and per-row `Workers/GetById` enrichment so candidate cards stay detailed while list/filter remains live.
- 2026-05-05: Admin listing surfaces now standardize on reusable `AdminDataGrid` (sorting + paging + empty state + responsive scroll); project rule `admin-data-grid-standard.mdc` enforces using this grid for admin summary/list tables.
- 2026-05-05: `AdminDataGrid` now supports server-controlled mode (`mode="server"`) so admin listings can keep pagination/sort state in feature screens and fetch rows from API (`offset/limit`) instead of local-only paging.
- 2026-05-05: API contract sync now uses centralized enum-like constants in `src/api/enums.ts` (account/job/system-user/device platform) and wrappers/components consume these typed values instead of raw numeric literals.
- 2026-05-05: Added OpenAPI sync automation for `Apiyi Güncelledim` flow with `tools/openapi/check-openapi.mjs` (localhost source), baseline snapshot tracking, and markdown/json diff reports.
- 2026-05-05: All `src/api` wrapper endpoint paths were centralized in `src/api/endpoints.ts` so OpenAPI diff tooling can deterministically map and validate every used endpoint call.
- 2026-05-05: Added `.cursor/rules/api-update-command.mdc` to enforce command workflow: strict OpenAPI check, wrapper fixes, lint/build verification, and baseline refresh.
- 2026-05-05: Shared API client now normalizes both envelope variants (`success/code/fieldErrors` and `isSuccess/errorCode/errors`) so login and other flows keep working across backend contract naming differences.
- 2026-05-05: Employer dashboard was expanded into a PRD-aligned section workspace (`overview`, `postings`, `candidates`, `operations`, `billing`, `reports`) with mobile-first safe-area-aware layout and explicit read-only fallback states for modules lacking dedicated backend endpoints (billing/payout/reporting detail APIs).
- 2026-05-05: Admin **Employers / Candidates / User Groups / Users** menus now share one pattern: server-mode `AdminDataGrid` + filters, row Edit → in-section **detail** with `AdminEntityDetail` (`Save`/`Delete`/`Close`). Persistence uses only existing commands (employer activate/suspend/ban; worker skill + system-user lifecycle/password; group activate/deactivate/add-permission; user lifecycle/password). **Delete** in UI maps to soft-delete semantics (`Ban` for users/workers/employers, `Deactivate` for groups). No new router; sidebar `activeSection` unchanged except canonical keys (`employers`, `candidates`, `userGroups`, `users`, `createAdmin`). List endpoints wired: `Employers/List`, `SystemUsers/List`, `SystemUserGroups/List`.
- 2026-05-05: Post-login UI standardization introduced shared `Dashboard UI Primitives` (`DashboardSurface`, `InteractiveButton`, `GlowBadge`, `StatePanel`) and rolled them into Admin/Employer/Worker surfaces to create consistent premium depth + interaction language while preserving existing API/state flows.
- 2026-05-05: Employer + Worker post-login redesign moved to art-directed section rhythm with new `DashboardHero` primitive and denser CTA hierarchy; implementation stayed presentation-only (no API/route contract changes) to avoid regressions while improving mobile-first visual clarity.
- 2026-05-06: Worker `Overview` was rebuilt with Ocean Theme dashboard widgets (AI match hero, earnings chart block, QR action card, shift timeline) using `zustand` + `framer-motion`; all visible labels are i18n-driven across supported locales.
- 2026-05-06: Worker experience now shares one shell language across all pages (refined ocean sidebar nav + common worker topbar search/actions + navbar sidebar-mode theming) to remove inconsistent/amatour menu appearance.
- 2026-05-06: Active endpoint integration pass now enforces authenticated `JobPostings/GetById` calls in frontend wrapper to keep employer/worker detail access consistent with authenticated dashboard surfaces.
- 2026-05-06: Worker portal data loading standardized with reusable `useWorkerAsyncData` hook; pages now share one loading/error/data lifecycle while consuming endpoint-backed portal adapters.
- 2026-05-06: Worker portal fallback simulations were reduced by deriving applications/payouts/reports/CV/QR states from existing active endpoints (`SystemUsers/Me`, `Workers/GetDetail`, `JobPostings/*`, `JobApplications/*`) instead of page-local demo-only state.
- 2026-05-06: Admin list/detail sections (Employers/Candidates/UserGroups/Users) now expose backend `ApiError.code` in UI error strings to improve operational triage without changing endpoint contracts.
- 2026-05-06: Post-login endpoint alignment pass added global API `401 -> SystemUsers/RefreshToken -> retry` flow (`setApiRefreshHandlers` in `AuthProvider`) and worker profile now resolves self endpoints first (`Workers/GetSelfFullDetail`/`GetSelfSummary`) with `GetById` as controlled fallback.
- 2026-05-06: Added `docs/frontend-endpoint-map.md` as current OpenAPI-aligned post-login endpoint matrix; employer posting/payout derived synthetic statuses were reduced to contract-safe fallback behavior.
- 2026-05-06: `/worker/profile` basic info area now supports edit mode (`fullName`, `nationality`, `university`) with i18n-driven form actions/messages and local session save feedback; no backend update endpoint wired yet, so persistence remains read-only beyond current session.
- 2026-05-06: `/worker/profile` page layout now mirrors account-settings IA (left section menu + right content card) while preserving existing ocean dashboard visual language and keeping worker detail cards below the settings block.
- 2026-05-06: Worker area now has a dedicated `WorkerLayout` component; `WorkerDashboard` renders routes inside this layout and `WorkerShell` remains as a thin compatibility wrapper.
- 2026-05-06: `/worker` overview now includes a dedicated `Tamamlanan Vardiyalar` surface between best-match listings and earnings summary, rendering 4 compact shift cards with per-shift earning amounts and i18n labels.
- 2026-05-06: Worker overview `Kazanç Özeti` kartı dönem-seçimli hale getirildi (`Aylık`, `3 Aylık`, `6 Aylık`, `Yıllık`); seçim, gösterilen kazanç toplamını ve SVG grafik eğrilerini period bazında dinamik güncelliyor, boş veri durumunda yine empty-state gösteriliyor.

- 2026-05-07: Worker light theme readability was tightened by increasing sidebar/nav/logout/icon contrast and strengthening overview accent text in light mode; favicon delivery now prioritizes public/favicon.ico (logo-derived) with SVG fallback in index.html.
- 2026-05-07: Dashboard typography was formalized as Cursor rules: Worker layout surfaces and Admin/Employer dashboard files now follow a shared contract (`DM Sans` for body/actions, `Syne` for titles and KPI emphasis) to keep role dashboards visually consistent.
- 2026-05-07: Employer portal now uses `EmployerLayout` structurally aligned with `WorkerLayout` (fixed collapsible sidebar, sticky welcome header, main padding), routed at `/employer/*` with `EmployerPortalProvider` shared state across overview/postings/candidates/operations/billing/reports screens; authenticated employers skip global Navbar/footer like workers.

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

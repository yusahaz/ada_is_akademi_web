# Components Registry

## Buttons

- PrimaryButton
- SecondaryButton

## Layout

- Container
- Section

## UI

- Card
- Modal
- Input
- Navbar

## Notifications

Component: `useActionToasts` (hook)
Purpose: Mutation aksiyonlarında `NotificationProvider` üzerinden i18n anahtarlarıyla success/error toast gösterir; hatayı yeniden fırlatarak mevcut `try/catch` ve inline banner akışını korur.
Used In: `ShiftsPage` (ilan başvurusu); `CandidatesSection` (hesap aksiyonları); `UsersSection`, `EmployersSection`, `UserGroupsSection` (kaydet/sil lifecycle).
Props: Yok — `runWithToast(request, { success?: { messageKey, interpolation? }, error: { messageKey, interpolation? } })` döner.
States: logic-only
Responsive Notes: Toast görünümü `NotificationProvider` içinde (`fixed end-3 top-20`, mobil genişlik sınırı).

---

## Rules

- Reuse first
- If new component: document in this file before task closure
- Existing component API should not be broken
- New props should be backward compatible

---

## Entry Template

Use the following format for each new entry:

Component: ComponentName
Purpose: Brief purpose statement
Used In: Page or feature area
Props:
- propName: type - description
States:
- default / loading / error / disabled (if applicable)
Responsive Notes:
- Mobile behavior
- Tablet/Desktop behavior

---

## New Component Checklist

- Why are existing components insufficient?
- Is the API simple and reusable?
- Is the change backward compatible?
- Has responsive behavior been validated?

---

## Landing (Ada İş Akademi)

Component: LoginModal
Purpose: Accessible auth dialog with Individual vs Business tabs; Individual supports login + register, Business is login-only, and both submit through API-ready auth adapter.
Used In: `App`
Props: `open`, `onClose`
States: open / closed; theme-aware (`dark` | `light`); audience `individual` | `corporate`; view `login` | `register` (individual only); submit `idle` | `loading` | `success` | `error`; successful login writes global auth session
Responsive Notes: bottom-sheet layout on small viewports; centered card from `sm` upward; safe-area bottom padding on mobile.

Component: AdaLogoMark
Purpose: Vector brand mark (academy roof + stylized “A” + connection nodes) for Navbar and static asset parity.
Used In: `Navbar`, `public/brand/ada-is-akademi-mark.svg`
Props: optional `className`
States: default
Responsive Notes: scales with `h-*` / `w-*`; inherits color via `currentColor`.

Component: Navbar
Purpose: Sticky glass header with brand lockup, custom language listbox (not native `<select>`), theme toggle, and sign-in entry.
Used In: `App`
Props: `onAuthAction?`, `authLabel?`
States: default; language menu open/closed with keyboard + pointer and outside-dismiss; theme `dark` | `light`; auth CTA toggles login/logout label
Responsive Notes: stacks actions with touch-friendly controls on small screens; dropdown anchored with `end-0`; uses logical positioning for RTL.

Component: AuthProvider
Purpose: Global auth session store with localStorage persistence and token provider bridge for API client auth headers.
Used In: `main`
Props: `children`
States: `session` null | active; `isAuthenticated` boolean
Responsive Notes: logic-only provider, no visual output.

Component: DashboardShell
Purpose: Shared role-dashboard frame with welcome, title/subtitle, and responsive card grid.
Used In: `WorkerDashboard`, `EmployerDashboard`, `AdminDashboard`
Props: `titleKey`, `subtitleKey`, `children`
States: theme-aware (`dark` | `light`)
Responsive Notes: single-column mobile with card grid scaling to 2-3 columns on wider breakpoints.

Component: Dashboard UI Primitives (`DashboardSurface`, `DashboardHero`, `InteractiveButton`, `GlowBadge`, `StatePanel`)
Purpose: Unified premium post-login UI layer for art-directed hero openings, 3D-like depth, micro-interactions, consistent motion feel, and reusable state rendering.
Used In: `DashboardShell`, `AdminDashboard`, `EmployerDashboard`, `WorkerShell`, Worker portal pages, admin detail/grid surfaces
Props: theme-aware minimal props (`theme`, `children`, optional `isActive`/`isError`/`className`)
States: default/active/error variations with dark-light parity
Responsive Notes: mobile-first spacing, safe-area friendly composition, touch-friendly interactive sizes.

Component: Worker Portal UI primitives (`worker-ui.tsx`: `WorkerSectionHeader`, `WorkerPillBadge`, `WorkerPrimaryButton`, `WorkerGhostButton`) + shared `cn` helper (`src/lib/cn.ts`)
Purpose: Lightweight, Ocean-token-aligned typography + CTA primitives for Worker route pages without duplicating ad-hoc title stacks and badge styles across screens.
Used In: `src/features/worker/pages/*`
Props: `tone` (`dark` | `light`) + standard button/`className`; `emphasis` for pill badges
States: default/disabled/error emphasis via badges; buttons support focus-visible rings
Responsive Notes: headers wrap cleanly on small widths; badges are max-content and wrap in card footers.

Component: Worker async data hook (`useWorkerAsyncData`)
Purpose: Shared worker-page fetch lifecycle wrapper for endpoint queries (single place for `loading/error/data/reload` behavior).
Used In: `src/features/worker/pages/ApplicationsPage.tsx`, `CvImportPage.tsx`, `PayoutsPage.tsx`, `ReportsPage.tsx`, `ShiftsPage.tsx`
Props: `initialData`, `query`, `resolveError`
States: loading / success / error with explicit `reload` and `setData`
Responsive Notes: logic-only hook, no visual output.

Component: WorkerDashboard / EmployerDashboard / AdminDashboard
Purpose: Role-based post-login surfaces. Employer mirrors worker routing (`/employer/*`) under `EmployerLayout` shell (sidebar + sticky welcome header); sections are routes with shared portal state (`EmployerPortalProvider` + `useEmployerPortal`). Admin remains sidebar orchestrator delegating `admin/*Section` grids/detail.
Used In: `App` routes (`/worker/*`, `/employer/*`, `/admin/*`)
Props (EmployerDashboard / WorkerDashboard): `isSidebarOpen`, `onSidebarClose`
States: employer routes `overview` | `postings` | …; admin unchanged; summary/API fallbacks unchanged
Responsive Notes: same shell rhythm as Worker (collapsible sidebar, padded main).

Component: WorkerShell
Purpose: Thin alias that forwards props to `WorkerLayout` for legacy imports/tests.
Used In: optional; worker routes use `WorkerDashboard` → `WorkerLayout` directly.

Component: EmployerLayout
Purpose: Employer-only shell duplicated from worker shell structure (ocean sidebar strip, splitter toggle with persisted collapse, sticky top welcome/subtitle strip, logout row, padded main viewport).
Used In: `EmployerDashboard`
Props: `children`, `isSidebarOpen`, `onSidebarClose`
States: sidebar collapsed/expander; resolves welcome name via `systemUsers/me` like worker shell.
Responsive Notes: fixed left sidebar widths match `WorkerLayout`; safe-area padded content region.

Component: WorkerLayout
Purpose: Dedicated worker-only app layout wrapper that owns sidebar, worker top header strip, and content viewport spacing (`NavLink`-based sidebar; profile deep-link `/worker/profile?section=accountControl`).
Used In: `WorkerDashboard` (direct), `WorkerShell` (compat re-export)
Props: `children`, `isSidebarOpen`, `onSidebarClose`
States: sidebar open/expanded vs collapsed breakpoints; persisted collapse preference (`ada-worker:sidebar-collapsed`)
Responsive Notes: always-visible collapsible sidebar; sticky header + padded main consistent with EmployerLayout.

Component: Worker Portal Pages (Overview/Profile/CV Import/Shifts/Applications/QR/Payouts/Reports)
Purpose: PRD-aligned worker workspace modules split into route-based screens.
Used In: `WorkerDashboard`, `src/features/worker/pages/*`
Props: none (page-level state + API adapters)
States: `loading` | `empty` | `error` | `success`; interactive states for CV pipeline steps, shift apply request, payout confirm, QR validation status
Responsive Notes: each page uses card-first composition and touch-friendly controls for mobile with progressive enhancement for larger viewports.

Component: Worker Dashboard Store (`useWorkerDashboardStore`)
Purpose: Zustand-powered overview state for Ocean Theme widgets (AI match score, earnings balance, timeline shifts, local theme mirror).
Used In: `src/features/worker/pages/OverviewPage`
Props: N/A (store hooks)
States: theme `dark|light`, shift status union (`confirmed|active|completed|disputed`), anomaly union (`none|locationMismatch|expiredToken`)
Responsive Notes: data-only store; widgets consuming it are mobile-first grid blocks.

Component: AdminDataGrid
Purpose: Reusable admin listing table with sortable columns, paging, responsive horizontal scroll, and i18n-ready controls; supports `mode="server"` so callers own `offset/limit`, total count, and sort callbacks (see `admin-data-grid-standard.mdc`).
Used In: `EmployersSection`, `CandidatesSection`, `UserGroupsSection`, `UsersSection`
Props: `columns`, `rows`, `getRowId`, `pageSizeOptions?`, `defaultPageSize?`, `emptyMessage`, `mode?` (`client`|`server`), `serverState?` (`page`, `pageSize`, `totalCount`, `sortState`, `onPageChange`, `onPageSizeChange`, `onSortChange`)
States: default; sorting `asc` | `desc`; paging state (`page`, `pageSize`); empty rows; server mode mirrors controls to parent fetch
Responsive Notes: wraps with `overflow-x-auto` for narrow viewports; keeps touch-safe pagination controls.

Component: AdminEntityDetail
Purpose: Shared admin **detail** shell: breadcrumb + back affordance, title slot, stacked action bar (`Save` / `Delete` / `Close`), optional confirm on delete, and status message strip for async feedback.
Used In: `EmployersSection`, `CandidatesSection`, `UserGroupsSection`, `UsersSection`
Props: `breadcrumb` (segments + `onNavigateHome`), `title`, `children`, `onClose`, `onSave?`, `onDelete?`, `pending?`, `successMessage?`, `errorMessage?`, optional `saveDisabled` / `deleteDisabled`
States: idle; `pending` disables actions; success/error copy from parent
Responsive Notes: mobile-first stacked header actions; from `sm` actions align inline; breadcrumb uses `min-w-0` + truncate; RTL-safe logical alignment via parent + i18n

Component: AdminFilterField
Purpose: Small labeled field wrapper for admin list filters (reduces duplicated Tailwind for label + control spacing).
Used In: admin `*Section` list toolbars
Props: `label` (ReactNode), `children`, optional `className`
States: default
Responsive Notes: full-width on mobile; can sit in responsive grid on wider breakpoints

Component: EmployersSection / CandidatesSection / UserGroupsSection / UsersSection
Purpose: Self-contained admin workspace: server-driven `AdminDataGrid` + filters, row **Edit** opens **detail** view inside same sidebar section (`mode: list|detail`), lifecycle/permission/password actions call existing API commands (no generic Update endpoint).
Used In: `AdminDashboard`
Props: none
States: list fetch/error/empty; detail load; save/delete pending + toast-style messages
Responsive Notes: list toolbar stacks; detail uses `AdminEntityDetail` action layout

Component: HeroSection
Purpose: Dark-tech marketing hero with badge, headline, CTAs, and visual stack.
Used In: `App`
Props: none
States: theme-aware (`dark` | `light`)
Responsive Notes: single-column on mobile; two-column split from `lg` upward.

Component: HeroBackground
Purpose: Grid, glow, and node illustration for depth (decorative).
Used In: `HeroSection`
Props: none
States: theme-aware (`dark` | `light`)
Responsive Notes: purely decorative; scales with container width.

Component: HeroCards
Purpose: Glassmorphism preview cards (shifts, activity, suggestion) for social proof.
Used In: `HeroSection`
Props: none
States: theme-aware (`dark` | `light`)
Responsive Notes: stacked, overlapping cards; spacing adapts on narrow widths.

Component: icons (IconBolt, IconArrowRight, IconPlay, IconGlobe, IconChevronDown, IconStar, IconSun, IconMoon)
Purpose: Inline SVG icon set for marketing UI.
Used In: `Navbar`, `HeroSection`, `HeroCards`
Props: optional `className`
States: default
Responsive Notes: decorative (`aria-hidden`) where used beside visible text.

Component: LandingSections
Purpose: Section orchestration for metrics strip, process steps, feature grid, social proof, and final CTA.
Used In: `App`
Props: none
States: theme-aware (`dark` | `light`)
Responsive Notes: stacked cards on mobile; multi-column layout from `md` and above.

Component: SectionFrame
Purpose: Reusable section shell with shared heading/subheading rhythm.
Used In: `LandingSections`
Props: `title`, `subtitle`, `children`, `isDark`
States: theme-aware (`dark` | `light`)
Responsive Notes: center-aligned heading block and adaptive vertical spacing.

Component: icons (IconCheck, IconShield, IconUsers, IconSpark)
Purpose: Supporting visual language for trust, process, and value proposition cards.
Used In: `LandingSections`
Props: optional `className`
States: default
Responsive Notes: vector-based and scale-friendly across breakpoints.

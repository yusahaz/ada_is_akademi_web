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

Component: HeaderUserMenu
Purpose: Shared post-login header user menu rendered behind the user icon. Single popover exposes profile shortcut (optional), theme switch (Dark/Light), language switch (all `SUPPORTED_LOCALES`), and logout (optional). Closes on outside click and `Escape`; aligns to inline-end by default for RTL safety.
Used In: `WorkerLayout` topbar, `EmployerLayout` topbar, `Navbar` (admin shell when `showSidebarToggle && isAuthenticated`)
Props:
- `tone`: `'dark' | 'light'` - matches surrounding header surface
- `userName?`, `userEmail?`: optional identity shown at the top of the popover
- `profileTo?`: route path; when set renders a `Profil` menu item
- `onLogout?`: when set renders a destructive `Çıkış` menu item
- `triggerAriaLabel?`: aria-label override for the trigger button
- `triggerClassName?`: override classes for trigger size/colors
- `align?`: `'start' | 'end'` (defaults to `'end'`)
States: open/closed; theme `dark|light`; tracks active language from `i18n.language`; selected theme button is highlighted
Responsive Notes: trigger is 40x40 touch target; popover width clamps via `min(18rem, calc(100vw - 1.5rem))`; language list scrolls within `max-h-56`; menu uses logical `start/end` for RTL parity.

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

Component: Worker Portal UI primitives (`worker-ui.tsx`: `WorkerSectionHeader`, `WorkerPillBadge`, `WorkerPrimaryButton`, `WorkerGhostButton`, `WorkerTabs`, `WorkerNotice`, `WorkerNavBadge`) + shared `cn` helper (`src/shared/lib/cn.ts`)
Purpose: Lightweight, Ocean-token-aligned typography + CTA primitives for Worker route pages without duplicating ad-hoc title stacks and badge styles across screens.
Used In: `src/features/worker/pages/*`, `WorkerLayout` (sidebar badges + notice banner)
Props:
- `WorkerTabs`: `tone`, `items` (`{ id, label, badge? }[]`), `value`, `onChange`, `ariaLabel?`
- `WorkerNotice`: `tone`, `variant` (`info`|`warning`|`success`|`danger`), `title`, `description?`, `action?`, `icon?`, `className?`
- `WorkerNavBadge`: `tone`, `value`, `compact?`
- shared: `tone` (`dark` | `light`) + standard button/`className`; `emphasis` for pill badges
States: tabs `active|inactive`; notice variants `info|warning|success|danger`; nav badge auto-hides on `value <= 0`; buttons support focus-visible rings
Responsive Notes: tabs wrap with `flex-wrap` and horizontal scroll fallback; notice uses logical paddings + safe-area friendly; nav badge shrinks to `compact` size for collapsed sidebar/icon overlays. RTL: badge anchors via `-end-1` to mirror automatically.

Component: Worker async data hook (`useWorkerAsyncData`)
Purpose: Shared worker-page fetch lifecycle wrapper for endpoint queries (single place for `loading/error/data/reload` behavior).
Used In: `src/features/worker/pages/applications/ApplicationsPage.tsx`, `cv-import/CvImportPage.tsx`, `payouts/PayoutsPage.tsx`, `reports/ReportsPage.tsx`, `shifts-list/ShiftsPage.tsx`, `jobs/JobsPage.tsx` (map tab), `shifts/MyShiftsPage.tsx`, `notifications/NotificationsPage.tsx`, `profile/ProfilePage.tsx` (availability)
Props: `initialData`, `query`, `resolveError`
States: loading / success / error with explicit `reload` and `setData`
Responsive Notes: logic-only hook, no visual output.

Component: Worker live counters hook (`useWorkerLiveCounters`)
Purpose: Reactive counter source for sidebar badges and tab badges (`pendingPayouts`, `newMatches`, `upcomingShifts`); fetches from `workerPortalApi.getLiveCounters()` with 60s revalidation; gracefully returns zeros on failure.
Used In: `WorkerLayout` (sidebar badges + topbar bell counter), `JobsPage` (tab badge), `WalletPage` (tab badge), `MyShiftsPage` (tab badge)
Props: none
States: data-only; consumers read `{ pendingPayouts, newMatches, upcomingShifts }`.
Responsive Notes: logic-only hook; visual treatment is delegated to `WorkerNavBadge` / `WorkerTabs`.

Component: Worker Portal Parent Pages (`JobsPage`, `MyShiftsPage`, `WalletPage`, `NotificationsPage`)
Purpose: PRD-aligned IA containers that group existing worker screens via `WorkerTabs`. URL `?tab=` param controls the active tab so deep-link redirects keep working (e.g. `/worker/applications` → `/worker/jobs?tab=applications`).
Used In: `WorkerDashboard` routes
Props: none (consume `useSearchParams` directly)
States: tab `recommendations|open|map|applications` (Jobs), `active|history` (My Shifts), `payouts|earnings` (Wallet); each child page receives `embedded` so duplicate headers are suppressed.
Responsive Notes: `WorkerTabs` overflow-x scroll on mobile, wrap on desktop; map tab renders responsive 2-column employer cards; QR + active assignment surfaces stack on small screens.

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
Used In: `src/features/worker/pages/overview/OverviewPage`
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

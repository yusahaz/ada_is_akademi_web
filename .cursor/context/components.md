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

Component: Dashboard UI Primitives (`DashboardSurface`, `InteractiveButton`, `GlowBadge`, `StatePanel`)
Purpose: Unified premium post-login UI layer for 3D-like depth, micro-interactions, consistent motion feel, and reusable state rendering.
Used In: `DashboardShell`, `AdminDashboard`, `EmployerDashboard`, `WorkerShell`, Worker portal pages, admin detail/grid surfaces
Props: theme-aware minimal props (`theme`, `children`, optional `isActive`/`isError`/`className`)
States: default/active/error variations with dark-light parity
Responsive Notes: mobile-first spacing, safe-area friendly composition, touch-friendly interactive sizes.

Component: WorkerDashboard / EmployerDashboard / AdminDashboard
Purpose: Role-based post-login home surfaces for operational metrics and actions; Employer dashboard uses section-based workspace (overview/postings/candidates/operations/billing/reports) with API-aware fallback states; Admin dashboard is an orchestrator (left sidebar + KPI overview + `createAdmin` form) delegating list/detail work to `src/components/dashboard/admin/*Section` screens (no URL routing; `activeSection` + local `list|detail` mode).
Used In: `App` (authenticated state)
Props: none
States: selected by role resolver (`worker` | `employer` | `admin`); employer section `overview` | `postings` | `candidates` | `operations` | `billing` | `reports`; admin section `overview` | `employers` | `candidates` | `userGroups` | `users` | `createAdmin`; register-admin form submit `idle` | `loading` | `success` | `error`; summary cards consume `/Statistics/Overview` with i18n fallbacks
Responsive Notes: card-first layout optimized for mobile and progressively expanded on tablet/desktop.

Component: WorkerShell
Purpose: Worker post-login route shell with responsive top navigation tabs and unified content surface.
Used In: `WorkerDashboard`
Props: `children`
States: default; active tab state by route; theme-aware (`dark` | `light`)
Responsive Notes: horizontal scrollable nav chips on mobile; full-width content layout on tablet/desktop.

Component: Worker Portal Pages (Overview/Profile/CV Import/Shifts/Applications/QR/Payouts/Reports)
Purpose: PRD-aligned worker workspace modules split into route-based screens.
Used In: `WorkerDashboard`, `src/features/worker/pages/*`
Props: none (page-level state + API adapters)
States: `loading` | `empty` | `error` | `success`; interactive states for CV pipeline steps, shift apply request, payout confirm, QR validation status
Responsive Notes: each page uses card-first composition and touch-friendly controls for mobile with progressive enhancement for larger viewports.

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

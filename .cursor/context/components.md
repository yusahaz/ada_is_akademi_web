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

Component: WorkerDashboard / EmployerDashboard / AdminDashboard
Purpose: Role-based post-login home surfaces for operational metrics and actions; Admin dashboard follows classic panel layout (left sidebar + summary + section details + in-panel Create Admin form).
Used In: `App` (authenticated state)
Props: none
States: selected by role resolver (`worker` | `employer` | `admin`); admin section `overview` | `users` | `approvals` | `security` | `createAdmin`; admin form submit `idle` | `loading` | `success` | `error`; detail actions include user suspend/reactivate/ban, password reset, and approval query by posting id; summary cards can consume optional API endpoints and fallback to i18n defaults
Responsive Notes: card-first layout optimized for mobile and progressively expanded on tablet/desktop.

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

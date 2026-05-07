# Tasks

## Active

- [ ] Wire login form submission to real auth API when backend is ready
- [ ] Refine per-locale copy quality for ES/IT/RU content blocks

### Shared Header User Menu (Worker / Employer / Admin) — done 2026-05-07

### Employer layout (mirror Worker)

- [x] Analyze `WorkerLayout` shell vs tek sayfalık `EmployerDashboard`
- [x] Add `EmployerLayout` + `/employer/*` routing; paylaşımlı portal state/context
- [x] i18n: `dashboard.employerPortal` + `dashboard.employer.defaultName` (tr/en/es/it/ru/ar/fr)
- [x] `App.tsx`: işveren Navbar/footer worker ile gizlenir; girişte `/employer` yönlendirmesi

---

## Completed

### Employer ilan oluştur sayfası ayrıştırma (2026-05-07)

- [x] `İlan Oluştur` formunu `Operasyon` sekmesinden ayırıp yeni rota/sayfa (`/employer/postings/create`) olarak taşıdım.
- [x] `İlanlar` ekranına `İlan Oluştur` aksiyon butonu ekleyip yeni sayfaya yönlendirdim.
- [x] Form input/select/textarea genişliklerini `w-full` ile standartlaştırarak bozulan yerleşimi düzelttim.

### Employer create-posting UX düzeni (2026-05-07)

- [x] Create-posting formundaki tüm input/textarea/select alanlarına üst label eklendi.
- [x] Kategori alanı combobox'a çevrilip `JobPostings/GetById` çağrılarından toplanan `jobCategoryId` değerleriyle API tabanlı beslendi.
- [x] Başlangıç ve bitiş saatleri varsayılan `00:00` olarak ayarlandı, submit success/error toast akışı doğrulandı.

### Shared header user menu (2026-05-07)

- [x] Analyzed `WorkerLayout`/`EmployerLayout`/`Navbar` user-icon points and existing theme + language primitives
- [x] Added reusable `HeaderUserMenu` (`src/components/dashboard/HeaderUserMenu.tsx`) with trigger + popover (profile/theme/language/logout), outside-click + ESC close, RTL-aware logical alignment
- [x] Added `dashboard.userMenu.*` i18n keys (`title/triggerAria/profile/logout/theme/themeDark/themeLight/language`) across `tr/en/es/it/ru/ar/fr`
- [x] Wired the menu into `WorkerLayout` topbar (replaces user `NavLink`), `EmployerLayout` topbar (replaces handler-less user button), and `Navbar` (admin shell, when `showSidebarToggle && isAuthenticated`) without changing landing/auth flows
- [x] Validated via `npm run lint` and `npm run build`; updated `components.md` + `memory.md`

### Worker portal PRD revize (2026-05-07)

- [x] Worker portal sidebar 6 ana menüye yenilendi: `Panel`, `İş Bul`, `Vardiyalarım`, `Cüzdan`, `Profil`, `Bildirimler`.
- [x] Yeni parent ekranlar (`JobsPage`, `MyShiftsPage`, `WalletPage`, `NotificationsPage`) eski sayfaları (`Recommendations`, `Applications`, `Shifts`, `QrCheck`, `Payouts`, `Reports`) `embedded` modda tab içeriği olarak yeniden kullanır.
- [x] Eski URL'ler (`/worker/applications`, `/recommendations`, `/qr-check`, `/payouts`, `/reports`, `/cv-import`) yeni IA'ye redirect ile bağlandı.
- [x] `worker-ui.tsx` içine `WorkerTabs`, `WorkerNotice`, `WorkerNavBadge` primitive'leri eklendi (Ocean/8pt grid uyumlu, RTL-friendly).
- [x] `WorkerLayout` `AccountStatus.Pending` kullanıcılar için sticky doğrulama banner'ı + `useWorkerLiveCounters` hook'u ile dinamic sidebar badge desteği.
- [x] `OverviewPage`'e Yaklaşan Vardiyalar / Güvenilirlik Skoru / Aktif Check-in CTA kartları eklendi (mevcut yapı bozulmadı).
- [x] `ProfilePage` yan menüsüne `cvImport` (CvImportPage embedded) ve `availability` (UI stub) bölümleri ile in-page section nav eklendi.
- [x] `workerPortalApi`'ye yeni metodlar eklendi: `getReliabilityScore`, `getUpcomingShiftAssignments`, `getActiveShiftAssignment`, `listShiftHistory`, `listNotifications`, `getLiveCounters`, `getAvailabilityCalendar`, `requestEmailVerification` (mevcut metodlar dokunulmadı).
- [x] 7 locale (tr/en/es/it/ru/ar/fr) için yeni nav, page, tab, banner, badge, overview ve menu anahtarları eklendi.
- [x] `npm run lint` ve `npm run build` başarıyla doğrulandı.

> Not: `/worker/shifts` rotası anlam değiştirdi: artık "Vardiyalarım" sayfasını gösterir (eski "açık ilanlar" listesi `/worker/jobs?tab=open` segmentinde erişilebilir).



- [x] Analyze employer operations `createPosting` flow and required API/i18n contracts
- [x] Implement live `Yeni İş İlanı Oluştur` form in `EmployerOperationsPage` with field validation and submit to `POST JobPostings/Create`
- [x] Add submit success/error toast integration and refresh employer postings after create
- [x] Extend `createPosting` i18n keys (fields, validation, submit states) across `tr/en/es/it/ru/ar/fr`
- [x] Add generic `useActionToasts` hook (`src/notifications/use-action-toasts.ts`) and wire mutation toasts: worker shifts apply (`submitSuccess` i18n), admin Candidates account actions, Users/Employers/UserGroups save-delete flows
- [x] Create dedicated `WorkerLayout` and route worker pages through it for centralized shell definitions
- [x] Verify worker-only layout path with lint
- [x] Redesign `/worker/profile` with account-settings style layout (left section nav + right editable content) aligned to existing ocean dashboard theme
- [x] Add profile settings section i18n keys for `tr`, `en`, `es`, `it`, `ru`, `ar`
- [x] Validate `/worker/profile` redesign with lint
- [x] Analyze `/worker/profile` editable UX states and convert basic info section into an editable form without affecting other worker routes
- [x] Add `/worker/profile` edit-mode i18n keys across supported locales (`tr`, `en`, `es`, `it`, `ru`, `ar`)
- [x] Validate `/worker/profile` scoped refactor with lint
- [x] Add `Tamamlanan Vardiyalar` card between worker overview best-matches and earnings cards with 4 earning rows
- [x] Extend worker overview locale keys for completed-shift earning labels across `tr/en/es/it/ru/ar/fr`
- [x] Validate worker overview completed-shifts update with lint
- [x] Analyze worker overview earnings card period-switch UX and chart behavior
- [x] Add earnings period selector (`Aylık / 3 Aylık / 6 Aylık / Yıllık`) to worker overview summary card
- [x] Render period-dependent earnings chart variants and periodized amount display in `OverviewPage`
- [x] Extend overview period i18n keys across `tr/en/es/it/ru/ar/fr` and validate with lint
- [x] Remove bottom worker overview stats row (`Aylık kazanç / Tamamlanan ödeme / Tamamlanan vardiya`) per latest UI request
- [x] Analyze Worker Dashboard light theme readability + favicon ico generation scope
- [x] Improve Worker light theme text/icon contrast in sidebar and overview cards
- [x] Generate `public/favicon.ico` from brand mark and prioritize ico link in `index.html`
- [x] Validate dashboard readability + favicon updates with lint
- [x] Analyze `/worker/shifts` title/action copy update and map impacted i18n keys
- [x] Update worker shifts copy (`Açık vardiyalar` -> `İş İlanları`, `Vardiyaya başvur` -> `İlana Başvur`) across locale files
- [x] Validate shifts copy update with lint
- [x] Analyze `/worker/shifts` employer display requirement and map reusable i18n key
- [x] Show employer information in each shifts listing card using localized employer label
- [x] Validate shifts employer info update with lint
- [x] Analyze `/worker/shifts` wage display requirement and add localized label key
- [x] Show wage amount and currency in each shifts listing card with localized label
- [x] Extend shifts wage label key across `tr/en/es/it/ru/ar/fr` and validate with lint
- [x] Analyze worker header left alignment mismatch between welcome text and page titles
- [x] Align worker welcome header container with page content titles by removing extra left padding
- [x] Validate worker header alignment update with lint
- [x] Create shared dashboard typography rules for Worker layout and Admin/Employer dashboard surfaces
- [x] Analyze worker route-level breadcrumb architecture (exclude `/worker` dashboard)
- [x] Add shared breadcrumb in `WorkerLayout` for all `/worker/*` subpages
- [x] Validate worker breadcrumb rollout with lint
- [x] Analyze persistent mobile-first worker sidebar behavior with always-visible + collapsible modes
- [x] Keep worker sidebar always visible on all breakpoints and add icon-focused collapsed mode for small screens
- [x] Add sidebar collapse toggle control in worker topbar and sync aria labels across locales
- [x] Validate persistent worker sidebar behavior with lint
- [x] Analyze in-sidebar collapse control placement aligned to logo row and right border center
- [x] Move worker sidebar collapse control into logo row and align it to the right border center line
- [x] Remove topbar collapse toggle and validate in-sidebar control layout with lint
- [x] Fine-tune worker sidebar collapse button to pixel-perfect border-right center alignment
- [x] Polish worker sidebar collapse control into a panel-splitter style toggle
- [x] Reposition worker sidebar splitter between logo and first menu item; increase content inset
- [x] Add detailed written logo variant and wire collapsed/open sidebar logo switching with angle-chevron splitter icons
- [x] Add persisted worker sidebar collapse preference and restore it on layout initialization
- [x] Create project-shared written SVG logo asset and align navbar/worker usage
- [x] Refine collapsed worker sidebar logo styling (transparent, borderless, larger mark)
- [x] Remove worker sidebar logo flicker during expand/collapse transitions
- [x] Tune worker written-logo typography to Syne and reduce expanded sidebar width to 12rem
- [x] Adjust worker header typography and desktop-only visibility for top action icons
- [x] Reduce worker welcome header size further, align content inset with sidebar, and make desktop header sticky
- [x] Remove worker content container paddings and restyle sticky header with flat bottom border
- [x] Wrap worker page content below sticky header in padded main container (`WorkerLayout`)
 - [x] Build OpenAPI vs frontend endpoint matrix for post-login screens and add `docs/frontend-endpoint-map.md`
- [x] Add global 401 refresh-token retry flow in API client via `AuthProvider` refresh handlers
- [x] Align worker portal profile endpoint resolution to self-first strategy (`GetSelfFullDetail` -> `GetSelfSummary` -> `GetById`)
- [x] Align employer section filters/statuses to endpoint-safe behavior (remove synthetic posting/payout statuses)
- [x] Validate endpoint alignment with `npm run lint` and `npm run build`
- [x] Map OpenAPI active endpoint coverage for Admin/Employer/Worker flows and align endpoint auth requirements (`JobPostings/GetById` now auth-required)
- [x] Refactor Worker portal fetch lifecycles to shared async hook and replace synthetic worker data paths with endpoint-backed derivations (applications/payouts/reports/CV/QR)
- [x] Replace Employer billing/reports mock blocks with live metrics derived from postings + applications endpoint outputs
- [x] Improve Admin section error surfaces by appending `ApiError.code` context in list/detail command failures
- [x] Validate role endpoint activation changes with `npm run lint` and `npm run build`
- [x] Add FR locale support globally (i18n config + language switcher + locale file)
- [x] Standardize Worker portal screens with shared page headers (`WorkerSectionHeader`) + Ocean CTA/badge tokens (`worker-ui`) across routes, including Overview loading/error/header rhythm
- [x] Unify Worker shell/sidebar/topbar/navbar into one Ocean design language for all worker pages
- [x] Analyze Worker Overview against requested Ocean Theme widget architecture (AI match, earnings, QR, timeline)
- [x] Add required dashboard UI dependencies (zustand, framer-motion, lucide-react, clsx, tailwind-merge) with SPA-compatible setup
- [x] Implement Zustand-backed Worker dashboard state and Ocean Theme widgets in `OverviewPage`
- [x] Extend i18n keys for new Worker dashboard widgets across supported locales
- [x] Validate responsive behavior and run lint for Worker dashboard refactor
- [x] Revise Worker Overview with top stats cards and best-match job listing section
- [x] Convert Worker top nav to admin-like left sidebar navigation with shared navbar toggle behavior
- [x] Analyze Employer + Worker post-login layout gaps against new art-direction (hero rhythm, section hierarchy, CTA clarity)
- [x] Redesign shared dashboard primitives for richer image-led premium surfaces while preserving theme parity and responsiveness
- [x] Recompose `EmployerDashboard` sections with stronger visual hierarchy and conversion-oriented flow without breaking existing data logic
- [x] Recompose `WorkerShell` + worker pages with cohesive premium navigation rhythm and responsive section cadence
- [x] Validate redesigned Employer/Worker experience with lint checks and document component/memory updates
- [x] Rollout shared post-login 3D primitives across Admin/Employer/Worker shells
- [x] Migrate Worker portal pages to premium interactive dashboard surface system
- [x] Validate post-login 3D refresh with lint/build and role-based smoke checks
- [x] Build project-wide notification/toast infrastructure and provider wiring
- [x] Redesign Candidates detail screen with professional tabbed sections
- [x] Replace account action select with segmented action bar + confirm + immediate API call
- [x] Analyze Admin dynamic grid + entity detail scope (list ↔ detail, lifecycle-only saves, no generic Update)
- [x] Add `Employers/List`, `SystemUsers/List`, `SystemUserGroups/List` API wrappers + endpoint registry + exports (`PageableResult` / `normalizePageableList` pattern)
- [x] Add `AdminEntityDetail` + `AdminFilterField` and per-entity `EmployersSection`, `CandidatesSection`, `UserGroupsSection`, `UsersSection`
- [x] Refactor `AdminDashboard` into orchestrator (overview + sidebar + `createAdmin`); remove legacy inline approval/security/user-action forms superseded by detail flows
- [x] i18n: `dashboard.admin.detail`, employers/userGroups/users/candidates detail copy + `grid.columns.actions` across tr/en/es/it/ru/ar (RTL-safe strings)
- [x] Validate admin refactor with `npm run lint` + `npm run build`

- [x] Restructure Employer dashboard into section-based panel shell (overview/postings/candidates/operations/billing/reports)
- [x] Expand Employer postings and candidate flow surfaces with PRD-aligned filters, detail panels, and fallback behavior
- [x] Add Employer operations, billing/payout, and read-only reporting sections without breaking existing role routing
- [x] Extend Employer i18n keys for all supported locales (tr/en/es/it/ru/ar) including section navigation and fallback states
- [x] Analyze worker PRD scope and break post-login flow into route-based web modules
- [x] Add worker multi-route shell architecture without breaking existing admin/employer surfaces
- [x] Implement worker screens (overview, profile, CV import, shifts, applications, QR, payouts, reports)
- [x] Add worker portal API adapter layer using existing wrappers with safe fallback models for missing backend coverage
- [x] Add worker portal i18n keys across tr/en/es/it/ru/ar and validate responsive/RTL-friendly layout behavior
- [x] Validate worker portal integration with lint and production build checks
- [x] Run strict OpenAPI diff and inspect latest reports for enum contract changes
- [x] Analyze Candidates summary structure and align Employers section UI with same pattern
- [x] Implement shared summary-card layout for Candidates/Employers in Admin dashboard
- [x] Update impacted API wrapper enum types and related UI mappings
- [x] Re-run strict OpenAPI check until breaking count is zero
- [x] Validate enum alignment with lint and build
- [x] Refresh OpenAPI baseline after successful alignment
- [x] Add server-controlled mode to `AdminDataGrid` for API-driven pagination/sort state
- [x] Wire Candidates grid paging/search flow to `Workers/List` with API `offset/limit` calls
- [x] Replace effect-driven candidate fetching with event-driven server fetch triggers to satisfy hook lint rules
- [x] Validate server-side grid integration with lint
- [x] Diagnose login failure when API returns `isSuccess: true` envelope
- [x] Add backward-compatible API envelope normalization in shared client (`success` vs `isSuccess`)
- [x] Validate auth login flow after envelope fix with lint
- [x] Map `src/api` endpoint usages into centralized registry references for OpenAPI diffability
- [x] Add localhost OpenAPI diff checker with baseline/report outputs under `tools/openapi`
- [x] Add Cursor rule for `Apiyi Güncelledim` command flow (check -> fix -> validate -> baseline update)
- [x] Validate OpenAPI automation with strict check + baseline refresh + lint + build
- [x] Re-run strict OpenAPI diff + refresh baseline after latest API update (`Apiyi Güncelledim`)
- [x] Analyze Admin "Candidates" menu UX flow/state and align with existing panel shell
- [x] Implement Candidates section content with worker query + responsive candidate cards
- [x] Add i18n keys for Candidates section in all supported locales (tr/en/es/it/ru/ar)
- [x] Validate admin dashboard changes with lint
- [x] Integrate Admin Candidates list with Workers API (`Workers/List`) and live search submit flow
- [x] Auto-load candidate rows on Candidates section open and hydrate cards via `Workers/GetById`
- [x] Update candidate locale copy for API-driven list/filter behavior across all supported languages
- [x] Validate API-driven candidates integration with lint
- [x] Analyze reusable admin grid requirements (paging, sorting, summary-grid reuse scope)
- [x] Build generic AdminDataGrid component with mobile-first responsive table shell
- [x] Integrate AdminDataGrid into admin listing surfaces (Candidates and Employers)
- [x] Add admin-grid i18n keys for all supported locales
- [x] Add persistent Cursor rule to enforce AdminDataGrid usage for admin summary/list grids
- [x] Validate admin grid refactor with lint
- [x] Apply selected #1 brand logo style as SVG with dark/light support in Navbar and auth surfaces
- [x] Build Employers menu summary screen with filters and employer grid cards
- [x] Move hamburger next to logo and remove admin logout button border
- [x] Update admin sidebar menu order to Control Panel, Employers, Candidates, User Groups, Users
- [x] Move admin sidebar hamburger control into main header (desktop: logo-right, mobile: right side) and bind it to sidebar state
- [x] Make Admin dashboard full-width with left-fixed collapsible sidebar and top hamburger (desktop + mobile)
- [x] Reshape AdminDashboard UI shell to AdminLTE-like structure (dark fixed sidebar + top bar + boxed content)
- [x] Reintroduce classic KPI summary row and panelized content blocks without breaking existing admin actions
- [x] Validate updated admin layout on lint checks
- [x] Update Admin panel sidebar menu labels to Employers/Candidates/User Groups/Users and reduce menu count to four
- [x] Refactor AdminDashboard layout to classic admin panel shell (left sidebar + right content)
- [x] Preserve existing admin actions/forms while applying new layout structure
- [x] Validate classic admin layout changes with lint
- [x] Define production Docker strategy for Vite app (build + static serve)
- [x] Add Docker artifacts (`Dockerfile`, `.dockerignore`, nginx config)
- [x] Validate containerization flow with local image build command
- [x] Group admin overview statistics by domain (Aday/İşveren/İlan/Başvuru/Aktivasyon) with iconized cards and inline state counts
- [x] Revise Admin overview KPI cards to Employer/Candidate/Job Posting/Application with Active and Total values
- [x] Add lightweight trend/chart support area for admin overview cards without breaking existing layout
- [x] Convert detailed statistics area into iconized reusable card blocks (`DashboardCard`) for consistent admin UI
- [x] Render `/Statistics/Overview` metrics inside Admin dashboard as responsive detailed statistics grid
- [x] Rework Admin dashboard mobile-first layout (sidebar actions grid, tighter spacing, responsive card flow)
- [x] Replace env-based API path lookup with centralized typed endpoint registry
- [x] Refactor auth and admin summary adapters to consume endpoint registry
- [x] Clean obsolete path env typings/examples and update auth i18n error copy
- [x] Validate endpoint-registry refactor with lint + build
- [x] Map `/Statistics/Overview` response model into admin summary adapter defaults
- [x] Migrate admin summary source to centralized endpoint registry (`Statistics/Overview`)
- [x] Validate updated admin summary integration with lint + build
- [x] Remove horizontal overflow in Admin dashboard with mobile-first layout fixes (stacked action buttons + min-width guards)
- [x] Validate refreshed OpenAPI against `src/api` wrappers and confirm endpoint coverage (no missing paths)
- [x] Sync OpenAPI payload/response contracts in API wrappers (`CreateJobPostingCommand`, skill/add-permission return ids, optional submit note)
- [x] Re-run lint + build after OpenAPI contract sync
- [x] Make LoginModal fully theme-aware so light mode uses ocean palette instead of fixed dark glass
- [x] Improve light-mode readability with ocean-themed high-contrast palette across Hero and Landing sections
- [x] Encrypt persisted auth session in localStorage and restore via secure decrypt flow
- [x] Convert admin summary cards to API-driven stats model with endpoint-configurable adapter
- [x] Add actionable admin detail tools (user lifecycle actions, approval query, password reset)
- [x] Refactor Admin Dashboard into classic layout with left sidebar and right content area
- [x] Add summary cards and section-based detail screens for admin operations
- [x] Add admin-user registration form inside Admin Dashboard and map it to RegisterAdmin endpoint
- [x] Add role resolver for Worker/Employer/Admin from authenticated session
- [x] Build responsive dashboards for Worker, Employer, and Admin after login
- [x] Route authenticated users to role-based dashboard and keep landing for guests
- [x] Add auth session provider with persistent login storage and restore-on-load
- [x] Wire LoginModal successful login to global auth session + logout action
- [x] Re-sync API wrappers against refreshed OpenAPI v1 (SystemUsers auth + Employers/Workers/SystemUserGroups)
- [x] Align frontend API endpoint wrappers with local OpenAPI v1 paths and methods
- [x] Add dark/light theme state with localStorage + system preference fallback
- [x] Add navbar theme toggle button and i18n labels for all locales
- [x] Custom Navbar language dropdown: dark glass panel, cyan accents, listbox keyboard + RTL `end-*` anchor
- [x] Analyze Faz 1 API contract and map frontend integration boundaries
- [x] Add reusable HTTP client + typed ApiResponse handling for Faz 1 endpoints
- [x] Wire login/register UI submit handlers to API-ready service abstraction with loading/error states
- [x] Implement login modal UI with i18n + RTL-friendly layout
- [x] Analyze reference visual direction and retain no code-copy policy
- [x] Keep hero and navbar visual language; extend with new section system
- [x] Implement section components with mobile-first responsive behavior
- [x] Ensure all new user-facing strings come from i18n resources
- [x] Validate Arabic RTL compatibility via logical layout properties
- [x] Run lint and production build checks successfully

---

## Rules

- Always update tasks
- Break large tasks into small ones
- Move each completed item from Active to Completed
- At least one analysis task must exist before code changes

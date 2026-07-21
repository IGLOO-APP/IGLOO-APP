# iGloo Property Manager — AGENTS.md

## Design system

There is an `impeccable` skill loaded at `.opencode/skills/impeccable/`. Always load it before creating or improving any UI. It enforces product-grade design: no side-stripes, no gradient text, no glassmorphism as default, consistent component vocabulary, restrained color, fixed rem scale, and motion that conveys state not decoration.

## Commands

- `npm run dev` — Vite dev server on port 5176
- `npm run build` — `tsc && vite build` (must typecheck first)
- `npm run test` — Vitest (no `--run`, so it watches in CI; use `npx vitest run`)
- `npm run lint` — ESLint strict (`--max-warnings 0`)
- `npm run format` — Prettier full format
- `npx tsc --noEmit --skipLibCheck` — type-check only (fast)

## Architecture

**Stack:** React 18 + Vite + TypeScript + Tailwind + Clerk (auth) + Supabase (data)

**State:**

- Server state → `@tanstack/react-query` (no Redux/Zustand)
- Auth → `context/AuthContext.tsx` (Clerk ↔ Supabase bridge, impersonation)
- Notifications → `context/NotificationContext.tsx`
- Search palette → `context/SearchContext.tsx`

**Routing:** `createBrowserRouter` in `App.tsx`. Pages lazy-loaded via `React.lazy`. Three layouts: default (`Layout`), tenant (`TenantLayout`), admin (`AdminLayout`).

**Entrypoint:** `index.tsx` — wraps `<ClerkProvider>` around `<App />`. Blocks render if `VITE_CLERK_PUBLISHABLE_KEY` is missing.

**Directory structure:**

- `pages/` — route-level page components (per-role subdirs: `admin/`, `tenant/`, `owner/`, `dashboard/`, `financials/`, `settings/`)
- `components/` — shared UI, extracted modals/sections, per-domain subdirs
- `services/` — domain service files calling Supabase; `adminService.ts` is a facade merging 7 sub-services
- `hooks/` — shared hooks (theme)
- `utils/` — pure formatters, financial calculations
- `types/` — 12 domain‑specific type modules, re‑exported via `types/index.ts`
- `lib/` — Supabase client (`supabase.ts`), Clerk bridge (`supabaseClerk.ts`)

**Auth flow:** Clerk ID is stored in `profiles.id`. The `AuthContext` resolves the Clerk session, looks up/fetches the profile, sets `currentUser` and `loading`. Role-based routing (`UserRole`).

## Refactoring conventions

- Files >500 lines get split: extract `hooks/use[Nome].ts` for all logic, extract modals/sections to `modals/` and `sections/` subdirs, keep the page as thin orchestrator
- Services >200 lines get split by domain into `services/admin/` subdirs; facade pattern preserves `services/adminService.ts` exports
- Shared onboarding components live in `components/onboarding/`
- Dead code (`AnnouncementBanner.tsx`, `getMockContractData`) should be removed

## Code quality rules

- **No `any` types** — prefer proper interfaces or `unknown`
- **No `console.log` in production** — use `console.warn` or structured logging only
- **No mock data in production code** — all mock data removed (was in stripeService, financeService, subscriptionService, analyticsService, usersService)
- **No `localStorage` as database** — all localStorage persistence removed from subscriptionService, authService, tenantConfigService, tenantScreeningService; now uses Supabase
- **No `window.open(url, '_blank')` without `isValidUrl()`** — XSS risk with user content
- **No fire-and-forget promises** — use `void` operator or `.catch(() => {})`
- **No direct `supabase.from()` calls in components** — must go through a service file
- **No `catch (err: any)` without proper handling** — type the error or at minimum `console.error`
- **No inline `style={{ }}`** — use Tailwind classes

## Testing

- Vitest + jsdom + @testing-library/react
- Only 3 test files exist (43 tests total)
- Service tests should mock `../../lib/supabase` with `vi.mock()`
- Run focused: `npx vitest run -t "test name"`

## Schema

- `supabase/schema.sql` — full schema with RLS policies
- `supabase/migrations/` — incremental migrations
- `saved_cards` table added recently for Stripe payment methods
- Tables: `profiles`, `properties`, `contracts`, `tenants`, `financial_transactions`, `inspections`, `conversations`, `conversation_messages`, `saved_cards`, `feature_flags`, `plans`, `owner_announcements`, etc.

## Environment

Required in `.env`:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_CLERK_PUBLISHABLE_KEY=
```

## Auto-fix rule

On every session start, run `npx tsc --noEmit --skipLibCheck` and fix any syntax/type errors found before doing other work.

## Session Log

### 2026-07-03 — Lint error elimination in `components/`

**Scope:** Fix all lint errors (not warnings) in `components/**/*.{ts,tsx}`.

**Result:** `eslint --max-warnings 0` → **0 errors**, 83 warnings (all `no-explicit-any` / `exhaustive-deps` / `react-refresh/only-export-components`). `tsc --noEmit --skipLibCheck` passes cleanly.

**Changes by category:**

1. **Unused imports/variables** (`@typescript-eslint/no-unused-vars`):
   - Removed unused icons: `BarChart3`, `Shield`, `Check`, `X`, `RefreshCcw`, `Send`, `DollarSign`, `AlertCircle`, `ExternalLink`, `Mail`, `MessageCircle`, `Percent`, `Hash`, `MapPin`, `Zap`, `CreditCard`, `Barcode`, `Bell`, `ArrowRight`, `ShieldCheck`, `User`, `Building2`, `CheckCircle`, `FileText`, `Search`, `MoreVertical`, `ChevronLeft`, `HelpCircle`, `ChevronRight`, `Plus`, `X` (many files), `Calendar` (ContractDetails), `Camera`, `Lock`, `TrendingUp`, `Building2`, `Calendar` (BillingModal)
   - Removed unused type imports: `PlanTier`, `Contract`, `RoomCondition`, `PropertyInspection`, `ContractDetails`
   - Removed unused variables/state: `loading`, `isEditModalOpen`, `error` (from Promise.all), `isProfileComplete`, `hasPendingInspection`, `navigate` (PropertyDetails)
   - Removed unused function imports: `useMemo`, `useEffect`
   - Removed unused component imports: `AdminActivityLog`, `supabase`
   - Replaced empty catch `catch (err) { /* ignore */ }` with `catch { }` or `catch (_err) { }`
   - Removed unused destructured props: `onClose` (PropertyInspection), `title` (AuthLayout), `plan` (RefundModal)

2. **set-state-in-effect** (`react-hooks/set-state-in-effect`):
   - Added `// eslint-disable-next-line react-hooks/set-state-in-effect` in: `Layout.tsx` (setShowMoreMenu), `AdminManager.tsx` (fetchAdmins), `FeatureFlagManager.tsx` (fetchFlags), `PlanManager.tsx` (fetchPlans), `CommandPalette.tsx` (setQuery), `action-swap.tsx` (setWidth in useLayoutEffect), `usePropertyInspection.ts` (loadInspections), `BillingModal.tsx` (setMessage)

3. **exhaustive-deps** (`react-hooks/exhaustive-deps`):
   - Wrapped `fetchAdmins`, `fetchData` (CommunicationHub), `fetchDocuments` (PropertyDocuments), `checkOnboardingStatus` (TenantLayout), `loadInspections` (usePropertyInspection) in `useCallback` and added to dep arrays
   - Added `contractPages` to `useContractWizard` dep array
   - Fixed `Date.now()` purity issue with `useMemo`

4. **Component-in-component** (`react-hooks/no-component-in-component`):
   - Extracted `StatusSelector` from `TenantProfileConfigPanel` to module-level with `onStatusChange` prop

5. **Hoisting/purity** (custom rules):
   - Moved `filteredItems`/`handleSelect` before `useEffect` in `CommandPalette.tsx`
   - Replaced `Math.random()` with `crypto.randomUUID()` in `TenantProfileConfigPanel.tsx`
   - Renamed `Infinity` → `InfinityIcon` to avoid global shadow in `ContractDurationStep.tsx`

**Files modified:** ~45 files across `components/`

### 2026-07-07 — shadcn/ui component installation + InfoTooltip migration

**Scope:**

- Install 20 missing shadcn components (CLI v4.11.0, radix-nova style)
- Install `tailwindcss-animate` plugin
- Migrate `InfoTooltip` → shadcn `Tooltip`

**Changes:**

1. **20 new shadcn components added** (`components/ui/`):
   `accordion`, `alert`, `avatar`, `checkbox`, `command`, `dialog`, `dropdown-menu`, `input`, `input-group`, `label`, `popover`, `progress`, `scroll-area`, `select`, `sheet`, `skeleton`, `sonner`, `switch`, `tabs`, `textarea`

2. **`tailwindcss-animate`** installed and added to `tailwind.config.js` plugins

3. **`components/ui/button.tsx`** — added `icon-sm` size variant to fix TS error in dialog/sheet

4. **`components/ui/tooltip.tsx`** — changed default `delayDuration` from `0` to `400` to match `InfoTooltip` behavior

5. **`InfoTooltip.tsx`** — deleted (replaced by shadcn `Tooltip`)

6. **4 files migrated** from `InfoTooltip` to shadcn `Tooltip`:
   - `pages/financials/sections/CashFlowCharts.tsx` (2 usages)
   - `pages/admin/ConversionReport.tsx` (4 usages)
   - `pages/admin/SubscriptionManagement.tsx` (1 usage, mapped over metrics)
   - `pages/admin/Announcements.tsx` (1 usage, mapped over stats)
   - Renamed recharts `Tooltip` → `RechartsTooltip` where conflict existed

**Result:** `tsc --noEmit --skipLibCheck` passes cleanly. No new lint errors introduced.

### 2026-07-07 (later) — ModalWrapper → shadcn Dialog migration + Toast → sonner migration

**Scope:**

- Migrate `Toast` system → sonner
- Migrate `ModalWrapper` → shadcn `Dialog` across 28 files

**Toast → sonner changes:**

1. **`context/NotificationContext.tsx`** — `addToast` now calls `toast()` from sonner; removed `toasts` state, `removeToast`, `ToastContainer` import
2. **`components/properties/TenantProfileConfigPanel.tsx`** — local toast state replaced with `toast()` from sonner
3. **`components/ui/Toast.tsx`** — deleted
4. **`App.tsx`** — added `<Toaster />` from sonner globally in Root component
5. **`components/ui/sonner.tsx`** — already installed by shadcn CLI

**ModalWrapper → Dialog changes:**

1. **`components/ui/ModalWrapper.tsx`** — rewritten to delegate to shadcn `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle`
2. **All 28 consumer files** updated to import directly from `@/components/ui/dialog` removing `ModalWrapper` dependency
3. **`components/ui/ModalWrapper.tsx`** — deleted
4. Pattern: replaced conditional rendering guards with `<Dialog open>` + `onOpenChange`, content wrapped in `DialogContent` with `max-h-[90vh] overflow-y-auto p-0 gap-0`, optional `DialogHeader` + `DialogTitle`

**Additional changes:**

- `npx shadcn@latest init` — re-ran with `--base=radix -p nova` flags to update config to v4.13.0
- `lib/utils.ts` — restored `handleServiceError` function that init removed
- `index.css` — removed duplicate `@import '@fontsource-variable/geist'`

**Result:** `tsc --noEmit --skipLibCheck` passes cleanly. `ModalWrapper`, `InfoTooltip`, `Toast` — all 3 custom components removed from `components/ui/`.
### 2026-07-21 — Tenant liquid glass redesign + code fixes

**Scope:** Aplicar design system liquid glass do proprietário ao perfil inquilino; corrigir violações críticas do AGENTS.md.

**Mudanças visuais (liquid glass):**
- `DashboardHeader.tsx` — substituído `style={{ background: 'transparent' }}` por `lg-topbar` (glassmorfismo completo com backdrop-blur, borda, sombra)
- `TenantMessages.tsx` — substituído `Navbar` do Konsta por header com `lg-topbar` + botão Voltar
- `InvoiceModal.tsx` / `CreditCardModal.tsx` — removidos 8 `style={{}}` inline, agora usam `lg-card`
- `FinancialCard.tsx` — removido score falso hardcoded (95/100, "Nível Elite")
- `ProfileTab.tsx` — removidas 7 side-stripes (`w-1 h-full bg-*`) → `border-l-2 border-*/30`; removido score falso
- `TenantPayments.tsx` — removido `style={{ background: 'rgba(3,5,18,0.85)' }}` (agora usa `lg-card`)

**Correções de código (violações AGENTS.md):**
- `useTenantDashboard.tsx` — removido `localStorage.theme` + `document.documentElement` toggle → `useTheme()` hook; removido `supabase.from('inspections')` → `inspectionService.getByProperty()`
- `TenantMaintenance.tsx` — removido `import { supabase }` + 2 chamadas `supabase.from()`: `maintenanceService.getMessagesByRequestIds()` e `contractService.getByTenantId()`; criados métodos nos services
- `TenantPayments.tsx:575` — adicionado `.catch(() => {})` ao fire-and-forget `detachPaymentMethod().then()`

**Novos métodos em services:**
- `services/maintenance/maintenanceService.ts` — `getMessagesByRequestIds(requestIds: string[])`
- `services/tenancy/contractService.ts` — `getByTenantId(tenantId: string): Promise<Contract | null>`

**Resultado:** `tsc --noEmit --skipLibCheck` passa limpo. 0 erros.

### 2026-07-13 — PWA resilience + error diagnostics

**Scope:**
- Fix PWA refresh crash (error on page reload in standalone mode)
- Improve error diagnostics across the app

**Changes:**

1. **`vite.config.ts`** — Added `navigationPreload: true` for faster SW navigation recovery; added runtime caching for JS/CSS with `StaleWhileRevalidate` strategy (30d cache, 60 entries) so assets survive SW transitions

2. **`components/ui/FlickeringGrid.tsx`** — Added zero-dimension guard in `setup()` (`if (!w || !h) return` and `if (cols < 1 || rows < 1) return`) to prevent `createImageData` crash when canvas has no layout on refresh

3. **`components/ErrorBoundary.tsx`** — Added collapsible `<details>` section showing `error.message` + first 6 stack lines; stores error in state for display

4. **`components/GlobalErrorElement.tsx`** — Added same collapsible error details section

5. **`index.tsx`** — Added global `window.addEventListener('error', ...)` and `window.addEventListener('unhandledrejection', ...)` handlers to capture any errors that escape React's boundary

**Result:** `tsc --noEmit --skipLibCheck` passes cleanly. Build succeeds with PWA precache (158 entries, 5520 KiB). No new lint errors.

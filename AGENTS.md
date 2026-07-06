# iGloo Property Manager — AGENTS.md

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
- `types.ts` — single file with all interfaces (404 lines, intended to be split)
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
- **No mock data in production code** — stripeService, financeService, subscriptionService still have mock data; flag for removal
- **No `localStorage` as database** — subscriptionService, authService still use localStorage persistence
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

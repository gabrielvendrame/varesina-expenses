# GV Expenses Tracker — Project Reference

Personal expense tracking app with Italian localization. Helps users track income/expenses by category, visualize history, and manage budgets.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router, Turbopack) |
| Language | TypeScript 5, strict mode |
| Database | PostgreSQL via Neon (managed) |
| ORM | Prisma 6 |
| Auth | Clerk (itIT locale, dark theme) |
| UI | Shadcn/ui (Radix UI) + Tailwind CSS |
| State | TanStack React Query 5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Table | TanStack React Table 8 |
| Dates | date-fns (it locale) |
| Package manager | Yarn |

---

## Project Structure

```
app/
  (auth)/sign-in, sign-up        # Clerk auth pages
  (dashboard)/                   # All protected pages
    _actions/                    # Server actions (mutations)
    _components/                 # Dashboard-specific components
    transactions/                # Transactions list page
      _actions/                  # Update/delete transaction actions
      _components/               # Table + dialogs
    layout.tsx                   # Navbar + content wrapper
    page.tsx                     # Main dashboard
  api/                           # GET-only API routes
    user-settings/               # Fetch/create user settings
    categories/                  # List user categories
    stats/balance/               # Income/expense totals for date range
    stats/categories/            # Category breakdown
    transactions-history/        # Formatted transactions for range
    history-data/                # Monthly/yearly aggregated data
    history-periods/             # Available years from user data
    shortcut/transactions/       # Bearer token API for Apple Shortcuts
  wizard/                        # First-login onboarding (currency selection)
    _actions/                    # UpdateUserCurrency action
  layout.tsx                     # Root layout (ClerkProvider, ThemeProvider)

components/
  ui/                            # 60+ Shadcn/ui components
  providers/RootProviders.tsx    # QueryClientProvider + ThemeProvider
  Navbar.tsx                     # Desktop + mobile navigation
  CurrencyComboBox.tsx           # EUR/USD selector (responsive)
  SkeletonWrapper.tsx            # Loading overlay utility
  ThemeSwitcherButton.tsx        # Dark/light toggle

lib/
  prisma.ts                      # Singleton Prisma client
  currencies.ts                  # Currency definitions + formatter factory
  helpers.ts                     # DateToUTCDate, GetFormatterForCurrency
  types.ts                       # TransactionType, Timeframe, Period
  constants.ts                   # Shared constants

schema/                          # Zod validation schemas
  transacton.ts                  # CreateTransactionSchema, UpdateTransactionSchema
  categories.ts                  # CreateCategorySchema
  usetSettings.ts                # UpdateUserCurrencySchema
  overview.ts                    # OverviewQuerySchema (date range)

hooks/
  use-media-query.ts             # Responsive breakpoint detection
  use-toast.ts                   # Toast utility hook

prisma/schema.prisma             # Database schema
```

---

## Database Models

### UserSettings
```prisma
userId    String  @id
currency  String  // "EUR" | "USD"
```

### Category
```prisma
createdAt  DateTime
name       String
userId     String
icon       String   // emoji character
@@unique([name, userId])
```

### Transaction
```prisma
id            String   @id @default(cuid())
createdAt     DateTime
updatedAt     DateTime
amount        Float
description   String?
date          DateTime
userId        String
type          String   // "income" | "expense"
category      String   // denormalized name
categoryIcon  String   // denormalized emoji
```

### MonthHistory (aggregated)
```prisma
userId   String
day      Int
month    Int
year     Int
income   Float
expense  Float
@@id([userId, day, month, year])
```

### YearHistory (aggregated)
```prisma
userId   String
month    Int
year     Int
income   Float
expense  Float
@@id([userId, month, year])
```

---

## Pages & Routes

| Route | Purpose |
|-------|---------|
| `/` | Main dashboard: quick-add form, stats, category breakdown, history chart |
| `/transactions` | Full paginated table with sort/filter, edit/delete actions |
| `/wizard` | First-login onboarding — currency selection gate |
| `/sign-in`, `/sign-up` | Clerk auth pages |

---

## API Routes (all GET, all Clerk-protected)

| Endpoint | Query Params | Returns |
|----------|-------------|---------|
| `/api/user-settings` | — | UserSettings (creates with EUR if missing) |
| `/api/categories` | — | Category[] for current user |
| `/api/stats/balance` | `from`, `to` | `{ income, expense }` totals |
| `/api/stats/categories` | `from`, `to` | Category breakdown with amounts |
| `/api/transactions-history` | `from`, `to` | Formatted transaction list |
| `/api/history-data` | `timeframe`, `year`, `month` | Aggregated MonthHistory or YearHistory |
| `/api/history-periods` | — | Available years (`number[]`) |
| `/api/shortcut/transactions` | — | POST, Bearer token auth (Apple Shortcuts) |

All routes export their return type:
```ts
export type GetXxxResponseType = Awaited<ReturnType<typeof fetchData>>
```

---

## Server Actions

Location: `app/(dashboard)/_actions/` and subdirectories.

| Action | File | DB Operations |
|--------|------|--------------|
| `CreateCategory` | `_actions/categories.ts` | Insert Category |
| `CreateTransaction` | `_actions/transactions.ts` | Insert Transaction + upsert MonthHistory + YearHistory (prisma.$transaction) |
| `UpdateTransaction` | `transactions/_actions/updateTransaction.ts` | Update Transaction + sync history aggregates |
| `DeleteTransaction` | `transactions/_actions/deleteTransaction.ts` | Delete Transaction + sync history aggregates |
| `UpdateUserCurrency` | `wizard/_actions/userSettings.ts` | Upsert UserSettings |

All actions follow this pattern:
```ts
"use server"
export async function ActionName(params) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')
  const parsed = Schema.safeParse(params)
  if (!parsed.success) throw new Error(...)
  return prisma.xxx.create({ ... })
}
```

---

## Auth Flow

1. `ClerkProvider` wraps the entire app in `app/layout.tsx`
2. All dashboard routes and API routes call `await currentUser()` — redirect to `/sign-in` if null
3. After first sign-in, user lands on `/wizard` to pick currency
4. Wizard writes `UserSettings` record; dashboard reads it to format amounts
5. Client components use Clerk's `<UserButton />` for profile/sign-out
6. Exception: `/api/shortcut/transactions` uses `Authorization: Bearer <token>` (`SHORTCUT_API_TOKEN` env var)

---

## State Management

**React Query** manages all server state. `RootProviders.tsx` sets `refetchOnWindowFocus: false`.

Query key conventions:
```ts
['overview', 'stats', from, to]          // stats/balance, stats/categories
['overview', 'history', timeframe, period] // history-data
['overview', 'transactions', from, to]    // transactions-history
['categories']                            // categories list
['userSettings']                          // user-settings
['history', 'periods']                    // history-periods
```

Mutation pattern:
```ts
const { mutate, isPending } = useMutation({
  mutationFn: serverAction,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['overview'] })
    toast.success('...')
  },
  onError: (e) => toast.error(e.message),
})
```

---

## Key Conventions

**Responsive UI:** Desktop uses Popover, mobile uses Drawer. Toggle via `useMediaQuery("(min-width: 768px)")`.

**Date handling:**
- Always convert to UTC before sending to server/API: `DateToUTCDate(date)`
- Parse dates with `date-fns` using `it` locale
- Months stored as 0-based integers in history tables

**Currency formatting:**
```ts
const formatter = GetFormatterForCurrency(currency)
// Returns Intl.NumberFormat; EUR → it-IT locale, USD → en-US locale
formatter.format(1234.5) // "€ 1.234,50"
```

**History aggregation:** Every transaction CRUD atomically syncs `MonthHistory` and `YearHistory` via `prisma.$transaction([...])`. This keeps charts fast without runtime aggregation.

**Category denormalization:** `Transaction` stores `category` (name) and `categoryIcon` (emoji) directly to avoid joins on the hot read path.

**Loading states:** `SkeletonWrapper` accepts `isLoading` boolean and wraps any child with a skeleton overlay. Used throughout with React Query's `isFetching`.

**Toasts:** Sonner, position `bottom-right`, rich colors, unique `id` per toast to prevent duplicates.

**All UI labels are in Italian.** Variable names and code comments are in English.

---

## Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
POSTGRES_PRISMA_URL          # pooled connection
POSTGRES_URL_NON_POOLING     # direct connection (for migrations)
SHORTCUT_API_TOKEN           # Bearer token for Apple Shortcuts API
SHORTCUT_USER_ID             # Clerk userId for the Shortcuts endpoint
```

---

## Common Tasks

**Add a new API route:**
- Create `app/api/<name>/route.ts`
- Check auth with `currentUser()`, validate params with Zod, query Prisma
- Export return type as `GetXxxResponseType`

**Add a new server action:**
- Create `"use server"` function in nearest `_actions/` directory
- Validate with `safeParse`, use `prisma.$transaction` if touching history tables

**Add a new dashboard component:**
- Place in `app/(dashboard)/_components/`
- Fetch data with `useQuery`, mutate with `useMutation`
- Wrap with `SkeletonWrapper` during loading

**Run migrations:**
```bash
npx prisma migrate dev
```

**Regenerate Prisma client:**
```bash
npx prisma generate
```

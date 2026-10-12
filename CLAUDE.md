# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (Vite, default port 5173)
- **Build:** `npm run build` (runs `tsc -b` then `vite build`)
- **Type check only:** `npx tsc --noEmit`
- **Lint:** `npm run lint` (oxlint with React + TypeScript plugins)
- **Preview prod build:** `npm run preview`

No test framework is configured yet.

## Architecture

Personal expense tracker SPA — React 19, TypeScript 6, Tailwind CSS v4 (via `@tailwindcss/vite` plugin), Vite 8. Data persists to Supabase (PostgreSQL) with localStorage as a fast cache for instant loading.

### Pages

Two-page layout controlled by state in `App.tsx` (no router):
- **Dashboard:** FilterBar, SummaryCards, InsightCards, Charts (CategoryChart + TrendChart), BudgetOverview (read-only), TransactionForm, TransactionList
- **Settings:** RecurringPanel, BudgetPanel (full editor), CurrencySelector, DataManagement (import/export/clear)

### Data flow

`useTransactions` hook owns all transaction state (CRUD + import + clear). `useBudgets` hook owns budget state. `useRecurring` manages recurring rules. `useCurrency` manages the display currency. All hooks load from localStorage first (instant), then fetch from Supabase in the background; writes go to both. If Supabase is not configured (no `.env`), the app falls back to localStorage only. Components receive data and callbacks through props from `App.tsx`. Currency is provided via `CurrencyContext`.

### Key conventions

- **Types as source of truth:** `CATEGORIES` and `PAYMENT_METHODS` are `as const` arrays in `types/transaction.ts`; their union types are derived from them. Add new categories/methods there.
- **Amount is always positive:** `Transaction.amount` stores a positive number; `type` field (`'income' | 'expense'`) determines the sign for display and calculations.
- **Form data vs stored data:** `TransactionFormData` uses `amount: string` for input handling; the hook parses it to `number` on save.
- **Dark theme:** All UI uses dark color scheme (gray-950/900 backgrounds, gray-100/300 text). `color-scheme: dark` is set on body. Always maintain this.
- **Tailwind v4:** Styles use `@import "tailwindcss"` in `index.css` — no `tailwind.config` file. Tailwind runs as a Vite plugin, not PostCSS.

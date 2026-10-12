-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Transactions table
create table transactions (
  id text primary key,
  date text not null,
  title text not null,
  category text not null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense')),
  payment_method text not null,
  created_at text not null
);

-- Budgets table
create table budgets (
  id uuid primary key default gen_random_uuid(),
  category text not null unique,
  limit_amount numeric not null
);

-- Recurring rules table
create table recurring_rules (
  id text primary key,
  title text not null,
  amount numeric not null,
  category text not null,
  type text not null check (type in ('income', 'expense')),
  payment_method text not null,
  frequency text not null check (frequency in ('weekly', 'fortnightly', 'monthly', 'yearly')),
  next_date text not null,
  end_date text,
  enabled boolean not null default true,
  created_at text not null
);

-- Settings table (for currency, etc.)
create table settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null
);

-- Disable Row Level Security for personal use (single user, no auth)
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table recurring_rules enable row level security;
alter table settings enable row level security;

-- Allow all operations with the anon key (personal app, single user)
create policy "Allow all" on transactions for all using (true) with check (true);
create policy "Allow all" on budgets for all using (true) with check (true);
create policy "Allow all" on recurring_rules for all using (true) with check (true);
create policy "Allow all" on settings for all using (true) with check (true);

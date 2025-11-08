-- Create boosters catalog table
create table if not exists public.boosters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type text not null, -- 'multiplier', 'auto_claim', 'premium_mining'
  multiplier_value integer default 1, -- e.g., 2 for 2x
  duration_hours integer not null, -- how long the booster lasts
  price_sol decimal(10, 8) not null, -- price in SOL (0.07 SOL)
  active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create user boosters table (active boosters per user)
create table if not exists public.user_boosters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  booster_id uuid not null references public.boosters(id),
  activated_at timestamp default now(),
  expires_at timestamp not null,
  auto_renew boolean default false,
  created_at timestamp default now()
);

-- Create transactions table for audit and history
create table if not exists public.booster_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  booster_id uuid not null references public.boosters(id),
  amount_sol decimal(10, 8) not null,
  wallet_tx_hash text unique,
  status text not null, -- 'pending', 'completed', 'failed'
  error_message text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS
alter table public.boosters enable row level security;
alter table public.user_boosters enable row level security;
alter table public.booster_transactions enable row level security;

-- RLS Policies for boosters (public read)
create policy "boosters_select_all" on public.boosters for select using (true);

-- RLS Policies for user_boosters
create policy "user_boosters_select_own" on public.user_boosters for select using (auth.uid() = user_id);
create policy "user_boosters_insert_own" on public.user_boosters for insert with check (auth.uid() = user_id);
create policy "user_boosters_update_own" on public.user_boosters for update using (auth.uid() = user_id);
create policy "user_boosters_delete_own" on public.user_boosters for delete using (auth.uid() = user_id);

-- RLS Policies for transactions (users see their own)
create policy "booster_transactions_select_own" on public.booster_transactions for select using (auth.uid() = user_id);
create policy "booster_transactions_insert_own" on public.booster_transactions for insert with check (auth.uid() = user_id);

-- Create indexes for performance
create index idx_user_boosters_user_id on public.user_boosters(user_id);
create index idx_user_boosters_expires_at on public.user_boosters(expires_at);
create index idx_booster_transactions_user_id on public.booster_transactions(user_id);
create index idx_booster_transactions_wallet_tx on public.booster_transactions(wallet_tx_hash);

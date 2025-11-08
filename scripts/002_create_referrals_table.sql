-- Create referrals tracking table
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references auth.users(id) on delete cascade,
  referred_user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp default now(),
  unique(referrer_id, referred_user_id)
);

alter table public.referrals enable row level security;

-- RLS Policies for referrals
create policy "referrals_select_own"
  on public.referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referred_user_id);

create policy "referrals_insert_own"
  on public.referrals for insert
  with check (auth.uid() = referred_user_id);

-- Create profiles table with referral code
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  referral_code text unique not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Public policy to view referral codes (for validation)
create policy "profiles_select_referral_codes"
  on public.profiles for select
  using (true);

-- Add nickname and wallet columns to profiles table
alter table public.profiles add column if not exists nickname text unique;
alter table public.profiles add column if not exists wallet_address text;
alter table public.profiles add column if not exists wallet_type text;
alter table public.profiles add column if not exists wallet_connected_at timestamp;

-- Create index for nickname lookup
create index if not exists idx_profiles_nickname on public.profiles(nickname);

-- Create index for wallet lookups
create index if not exists idx_profiles_wallet_address on public.profiles(wallet_address);

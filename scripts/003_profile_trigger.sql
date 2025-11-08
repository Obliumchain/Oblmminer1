-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_code text;
begin
  -- Generate unique referral code
  generated_code := 'REF-' || substr(new.id::text, 1, 8) || '-' || substr(md5(random()::text), 1, 4);
  
  -- Added 10,000 welcome points and mining start time for new users
  insert into public.profiles (id, first_name, last_name, referral_code, points, mining_started_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', null),
    coalesce(new.raw_user_meta_data ->> 'last_name', null),
    generated_code,
    10000, -- Welcome bonus
    now() -- Start mining timer immediately
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

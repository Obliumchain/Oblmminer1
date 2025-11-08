-- Insert default boosters
-- Updated prices: 2x = 0.03 SOL, 3x = 0.045 SOL, Auto-Claim = 0.03 SOL
-- Updated all booster durations to 120 hours (5 days)
insert into public.boosters (name, description, type, multiplier_value, duration_hours, price_sol) values
  ('2x Multiplier', 'Double your mining points for 5 days', 'multiplier', 2, 120, 0.03),
  ('3x Multiplier', 'Triple your mining points for 5 days', 'multiplier', 3, 120, 0.045),
  ('Auto-Claim (5d)', 'Automatically claim points every 4 hours for 5 days', 'auto_claim', 1, 120, 0.03),
  ('Premium Auto-Claim', 'Extended auto-claim boost for 5 days', 'auto_claim', 1, 120, 0.05),
  ('Premium Mining', 'Unlock premium mining features for 5 days', 'premium_mining', 1, 120, 0.05)
on conflict do nothing;

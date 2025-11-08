-- Add mining system columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS points BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS mining_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_claim_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS has_auto_claim BOOLEAN DEFAULT FALSE;

-- Create index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);

-- Create function to count referrals
CREATE OR REPLACE FUNCTION get_referral_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM referrals WHERE referrer_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policy if it exists before creating new one
DROP POLICY IF EXISTS "profiles_select_leaderboard" ON profiles;

-- Fixed policy creation - removed IF NOT EXISTS syntax
CREATE POLICY "profiles_select_leaderboard" ON profiles
  FOR SELECT
  USING (true);

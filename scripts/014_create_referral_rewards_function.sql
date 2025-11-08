-- Function to process referral rewards
CREATE OR REPLACE FUNCTION process_referral_reward(
  p_referrer_code TEXT,
  p_new_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id UUID;
  v_referral_exists BOOLEAN;
BEGIN
  -- Check if referral code exists and get referrer ID
  SELECT id INTO v_referrer_id
  FROM profiles
  WHERE referral_code = p_referrer_code;
  
  -- If referrer not found, return false
  IF v_referrer_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if referral relationship already exists
  SELECT EXISTS(
    SELECT 1 FROM referrals 
    WHERE referrer_id = v_referrer_id 
    AND referred_user_id = p_new_user_id
  ) INTO v_referral_exists;
  
  -- If referral already processed, return false
  IF v_referral_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Insert referral relationship
  INSERT INTO referrals (referrer_id, referred_user_id)
  VALUES (v_referrer_id, p_new_user_id);
  
  -- Award 500 points to referrer
  UPDATE profiles
  SET points = points + 500
  WHERE id = v_referrer_id;
  
  -- Award 250 points to new user
  UPDATE profiles
  SET points = points + 250
  WHERE id = p_new_user_id;
  
  RETURN TRUE;
END;
$$;

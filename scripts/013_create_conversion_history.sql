-- Create conversion history table
CREATE TABLE IF NOT EXISTS conversion_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points_converted INTEGER NOT NULL,
  oblm_tokens_received NUMERIC(10, 2) NOT NULL,
  conversion_rate NUMERIC(10, 2) NOT NULL, -- e.g., 10000 points = 200 OBLM
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  wallet_tx_hash TEXT, -- Solana transaction hash if tokens were sent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop indexes if they exist before creating them to prevent errors
DROP INDEX IF EXISTS idx_conversion_history_user_id;
DROP INDEX IF EXISTS idx_conversion_history_created_at;

-- Create index for faster queries
CREATE INDEX idx_conversion_history_user_id ON conversion_history(user_id);
CREATE INDEX idx_conversion_history_created_at ON conversion_history(created_at DESC);

-- Enable RLS
ALTER TABLE conversion_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own conversion history
DROP POLICY IF EXISTS conversion_history_select_own ON conversion_history;
CREATE POLICY conversion_history_select_own ON conversion_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own conversion records (for when they trigger conversion)
DROP POLICY IF EXISTS conversion_history_insert_own ON conversion_history;
CREATE POLICY conversion_history_insert_own ON conversion_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

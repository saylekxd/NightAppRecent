/*
  # Points Management System

  1. New Tables
    - `transactions`
      - Track all point movements (earning and spending)
      - Store transaction details, amounts, and metadata
    - `qr_codes`
      - Store unique QR codes for each user
      - Track usage and expiration
    - `challenges`
      - Define point-earning opportunities
      - Track user progress and completion
    - `referrals`
      - Track user referrals
      - Store referral rewards and status

  2. Security
    - Enable RLS on all tables
    - Add policies for secure access
    - Implement transaction verification
*/

-- QR Codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('earn', 'spend')),
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  points integer NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Challenge Progress table
CREATE TABLE IF NOT EXISTS user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  challenge_id uuid REFERENCES challenges ON DELETE CASCADE,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES auth.users ON DELETE CASCADE,
  referred_id uuid REFERENCES auth.users ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  points_awarded boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(referred_id)
);

-- Enable RLS
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- QR Codes policies
CREATE POLICY "Users can view their own QR codes"
  ON qr_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own QR codes"
  ON qr_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Challenges policies
CREATE POLICY "Anyone can view active challenges"
  ON challenges
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- User Challenges policies
CREATE POLICY "Users can view their own challenge progress"
  ON user_challenges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress"
  ON user_challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "Users can view their referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals"
  ON referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referrer_id);

-- Functions
CREATE OR REPLACE FUNCTION process_points_transaction(
  p_user_id uuid,
  p_amount integer,
  p_type text,
  p_description text,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert transaction
  INSERT INTO transactions (user_id, amount, type, description, metadata)
  VALUES (p_user_id, p_amount, p_type, p_description, p_metadata);

  -- Update user points
  IF p_type = 'earn' THEN
    UPDATE profiles
    SET points = points + p_amount
    WHERE id = p_user_id;
  ELSIF p_type = 'spend' THEN
    UPDATE profiles
    SET points = points - p_amount
    WHERE id = p_user_id;
  END IF;
END;
$$;
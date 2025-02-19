/*
  # Rewards System

  1. New Tables
    - `rewards`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `points_required` (integer)
      - `image_url` (text)
      - `is_active` (boolean)
      - `quantity` (integer, null for unlimited)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `reward_redemptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `reward_id` (uuid, references rewards)
      - `code` (text, unique)
      - `status` (text: active, used, expired)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)
      - `used_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and redeeming rewards
*/

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  points_required integer NOT NULL CHECK (points_required > 0),
  image_url text NOT NULL,
  is_active boolean DEFAULT true,
  quantity integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reward redemptions table
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  reward_id uuid REFERENCES rewards ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'used', 'expired')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz
);

-- Create a partial unique index instead of the WHERE clause in the UNIQUE constraint
CREATE UNIQUE INDEX reward_redemptions_active_unique 
ON reward_redemptions (user_id, reward_id) 
WHERE status = 'active';

-- Enable RLS
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Rewards policies
CREATE POLICY "Anyone can view active rewards"
  ON rewards
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Reward redemptions policies
CREATE POLICY "Users can view their own redemptions"
  ON reward_redemptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to redeem a reward
CREATE OR REPLACE FUNCTION redeem_reward(
  p_reward_id uuid,
  p_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_points_required integer;
  v_user_points integer;
  v_redemption_id uuid;
  v_code text;
BEGIN
  -- Get reward points requirement
  SELECT points_required INTO v_points_required
  FROM rewards
  WHERE id = p_reward_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found or inactive';
  END IF;

  -- Check if user has enough points
  SELECT points INTO v_user_points
  FROM profiles
  WHERE id = p_user_id;

  IF v_user_points < v_points_required THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  -- Generate unique code
  v_code := encode(gen_random_bytes(6), 'hex');

  -- Create redemption
  INSERT INTO reward_redemptions (
    user_id,
    reward_id,
    code,
    status,
    expires_at
  )
  VALUES (
    p_user_id,
    p_reward_id,
    v_code,
    'active',
    now() + interval '30 days'
  )
  RETURNING id INTO v_redemption_id;

  -- Deduct points
  PERFORM process_points_transaction(
    p_user_id,
    v_points_required,
    'spend',
    'Reward redemption'
  );

  RETURN v_redemption_id;
END;
$$;

-- Insert sample rewards
INSERT INTO rewards (title, description, points_required, image_url) VALUES
  ('Free Drink', 'Get any drink from our menu for free!', 500, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800'),
  ('VIP Entry', 'Skip the line with VIP entry access', 1000, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800'),
  ('Private Table', 'Reserve a private table for you and your friends', 2000, 'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?w=800'),
  ('Birthday Package', 'Special birthday celebration package with champagne', 5000, 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800');
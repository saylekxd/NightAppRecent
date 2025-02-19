/*
  # Visit and Reward Functions

  1. New Tables
    - `activities` - Stores different types of activities and their point values

  2. Functions
    - `accept_visit` - Processes a visit QR code and awards points
    - `accept_reward` - Processes a reward redemption
*/

-- Create activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  points integer NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert default activities
INSERT INTO activities (name, points, description) VALUES
  ('Entry', 100, 'Points for entering the venue'),
  ('Event', 200, 'Points for attending an event')
ON CONFLICT (name) DO UPDATE
SET points = EXCLUDED.points,
    description = EXCLUDED.description;

-- Function to accept a visit QR code
CREATE OR REPLACE FUNCTION accept_visit(p_code text, p_activity_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_visit_id uuid;
  v_activity activities%ROWTYPE;
BEGIN
  -- Get activity details
  SELECT * INTO v_activity
  FROM activities
  WHERE name = p_activity_name
    AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid activity type';
  END IF;

  -- Get user ID from QR code and validate
  SELECT user_id INTO v_user_id
  FROM qr_codes
  WHERE code = p_code
    AND is_active = true
    AND expires_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired QR code';
  END IF;

  -- Create visit and award points
  SELECT id INTO v_visit_id FROM create_visit(v_user_id);

  -- Award points to the user
  UPDATE profiles
  SET points = points + v_activity.points
  WHERE id = v_user_id;

  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    amount,
    type,
    description,
    metadata
  ) VALUES (
    v_user_id,
    v_activity.points,
    'earn',
    'Points earned from ' || v_activity.name,
    jsonb_build_object(
      'qr_code', p_code,
      'visit_id', v_visit_id,
      'activity_name', v_activity.name,
      'activity_id', v_activity.id
    )
  );
END;
$$;

-- Function to accept a reward redemption
CREATE OR REPLACE FUNCTION accept_reward(p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_redemption_id uuid;
BEGIN
  -- Get redemption and validate
  SELECT id INTO v_redemption_id
  FROM reward_redemptions
  WHERE code = p_code
    AND status = 'active'
    AND expires_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired redemption code';
  END IF;

  -- Mark redemption as used
  UPDATE reward_redemptions
  SET 
    status = 'used',
    used_at = now()
  WHERE id = v_redemption_id;
END;
$$;
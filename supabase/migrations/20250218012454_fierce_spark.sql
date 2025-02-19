/*
  # Consolidate Activities Table and Functions

  1. Changes
    - Drop existing activities table and policies
    - Recreate activities table with proper structure
    - Add comprehensive set of default activities
    - Update related functions
*/

-- Drop existing table and policies
DROP TABLE IF EXISTS activities CASCADE;

-- Create activities table
CREATE TABLE activities (
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
CREATE POLICY "Anyone can view activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage activities"
  ON activities
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Insert comprehensive set of default activities
INSERT INTO activities (name, points, description) VALUES
  ('Entry', 200, 'Points for entering the venue'),
  ('Drink Purchase', 100, 'Points for purchasing a drink'),
  ('Food Order', 150, 'Points for ordering food'),
  ('VIP Area Access', 300, 'Points for accessing VIP area'),
  ('Event Participation', 250, 'Points for participating in an event'),
  ('Bring a Friend', 400, 'Points for bringing a new friend'),
  ('Special Promotion', 500, 'Points for special promotional activities'),
  ('Birthday Bonus', 1000, 'Special birthday bonus points'),
  ('Loyalty Milestone', 2000, 'Points for reaching loyalty milestones')
ON CONFLICT (name) DO UPDATE
SET 
  points = EXCLUDED.points,
  description = EXCLUDED.description;

-- Update functions to use activities
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
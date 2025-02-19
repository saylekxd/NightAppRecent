/*
  # Fix Activities Table Setup

  1. Changes
    - Drop existing activities table and policies
    - Recreate activities table with proper structure
    - Add comprehensive set of default activities
    - Update related functions
    - Set proper RLS policies
*/

-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS activities CASCADE;

-- Create activities table
CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  points integer NOT NULL CHECK (points >= 0),
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

-- Function to validate QR code
CREATE OR REPLACE FUNCTION validate_qr_code(p_code text, p_activity_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
  v_activity activities%ROWTYPE;
BEGIN
  -- Get activity details
  SELECT * INTO v_activity
  FROM activities
  WHERE name = p_activity_name
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Invalid activity type'
    );
  END IF;

  -- Check visit QR code
  SELECT json_build_object(
    'valid', true,
    'data', json_build_object(
      'type', 'visit',
      'code', qr.code,
      'activity', json_build_object(
        'name', v_activity.name,
        'points', v_activity.points,
        'description', v_activity.description
      ),
      'user', json_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'points', p.points
      )
    )
  ) INTO v_result
  FROM qr_codes qr
  JOIN profiles p ON p.id = qr.user_id
  WHERE qr.code = p_code
    AND qr.is_active = true
    AND qr.expires_at > now();

  IF v_result IS NOT NULL THEN
    RETURN v_result;
  END IF;

  RETURN json_build_object(
    'valid', false,
    'error', 'Invalid or expired QR code'
  );
END;
$$;
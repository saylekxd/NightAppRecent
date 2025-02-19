/*
  # Fix foreign key relationships

  1. Changes
    - Add missing foreign key constraints for qr_codes and reward_redemptions
    - Update validation queries to use proper foreign key names
    
  2. Security
    - Maintain existing RLS policies
*/

-- Fix qr_codes foreign key
ALTER TABLE qr_codes
DROP CONSTRAINT IF EXISTS qr_codes_user_id_fkey,
ADD CONSTRAINT qr_codes_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add points field to qr_codes
ALTER TABLE qr_codes
ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;

-- Add metadata field to qr_codes
ALTER TABLE qr_codes
ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Fix reward_redemptions foreign key
ALTER TABLE reward_redemptions
DROP CONSTRAINT IF EXISTS reward_redemptions_user_id_fkey,
ADD CONSTRAINT reward_redemptions_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  points integer NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default activities
INSERT INTO activities (name, points, description) VALUES
  ('Entry', 200, 'Points for entering the venue'),
  ('Drink Purchase', 100, 'Points for purchasing a drink'),
  ('Food Order', 150, 'Points for ordering food'),
  ('VIP Area Access', 300, 'Points for accessing VIP area'),
  ('Event Participation', 250, 'Points for participating in an event'),
  ('Bring a Friend', 400, 'Points for bringing a new friend'),
  ('Special Promotion', 500, 'Points for special promotional activities')
ON CONFLICT (name) DO UPDATE
SET points = EXCLUDED.points,
    description = EXCLUDED.description;

-- Enable RLS and add policies for activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active activities" ON activities;
DROP POLICY IF EXISTS "Admins can manage activities" ON activities;

-- Allow all authenticated users to read activities
CREATE POLICY "Anyone can view activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to manage activities
CREATE POLICY "Admins can manage activities"
  ON activities
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Update validateQRCode function to only validate the QR code existence
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
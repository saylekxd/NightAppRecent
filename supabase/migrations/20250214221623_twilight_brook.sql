/*
  # Add admin access control

  1. Changes
    - Add `is_admin` column to profiles table
    - Add RLS policies for admin access
    - Add function to check admin status

  2. Security
    - Only admins can access admin-specific tables and functions
    - Regular users cannot modify admin status
*/

-- Add is_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  SELECT is_admin INTO v_is_admin
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(v_is_admin, false);
END;
$$;

-- Update RLS policies for admin access
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR is_admin());

-- Add admin policies for events
CREATE POLICY "Admins can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete events"
  ON events
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Add admin policies for rewards
CREATE POLICY "Admins can create rewards"
  ON rewards
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update rewards"
  ON rewards
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete rewards"
  ON rewards
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Add admin policies for visits
CREATE POLICY "Admins can view all visits"
  ON visits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- Add admin policies for reward redemptions
CREATE POLICY "Admins can view all redemptions"
  ON reward_redemptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());
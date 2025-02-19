/*
  # Fix Transactions and Points System

  1. Changes
    - Update accept_visit function to properly handle transactions
    - Add better error handling and validation
    - Fix points calculation and transaction recording

  2. Security
    - Maintain existing RLS policies
    - Ensure proper security checks
*/

-- Drop and recreate the accept_visit function with fixed transaction handling
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
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

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

  -- Create visit
  INSERT INTO visits (user_id)
  VALUES (v_user_id)
  RETURNING id INTO v_visit_id;

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

  -- Mark QR code as used
  UPDATE qr_codes
  SET is_active = false
  WHERE code = p_code;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error details
    RAISE LOG 'Error in accept_visit: %', SQLERRM;
    -- Re-raise the error
    RAISE;
END;
$$;
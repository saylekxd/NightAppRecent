-- Drop and recreate the process_points_transaction function with better error handling
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
  -- Insert transaction first
  INSERT INTO transactions (
    user_id,
    amount,
    type,
    description,
    metadata
  ) VALUES (
    p_user_id,
    p_amount,
    p_type,
    p_description,
    p_metadata
  );

  -- Update user points
  IF p_type = 'earn' THEN
    UPDATE profiles
    SET 
      points = points + p_amount,
      updated_at = now()
    WHERE id = p_user_id;
  ELSIF p_type = 'spend' THEN
    UPDATE profiles
    SET 
      points = points - p_amount,
      updated_at = now()
    WHERE id = p_user_id;
  END IF;

  -- Verify the points update
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

-- Drop and recreate the accept_visit function with transaction handling
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
  -- Start transaction
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

    -- Process points transaction
    PERFORM process_points_transaction(
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
    SET 
      is_active = false,
      updated_at = now()
    WHERE code = p_code;

    -- If we get here, everything succeeded
    RETURN;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error details
      RAISE LOG 'Error in accept_visit: %', SQLERRM;
      -- Re-raise the error
      RAISE;
  END;
END;
$$;
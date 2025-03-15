/*
  # Update process_points_transaction function

  This migration updates the process_points_transaction function to call
  the update_user_rank function after updating a user's points.
*/

-- Update the process_points_transaction function
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
  
  -- Update user rank based on new points total
  PERFORM update_user_rank(p_user_id);
END;
$$; 
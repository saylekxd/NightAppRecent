/*
  # Add function to update user ranks

  This migration adds a function to update a user's rank based on their points.
  It will be called by the process_points_transaction function.
*/

-- Create function to update user rank
CREATE OR REPLACE FUNCTION update_user_rank(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_points integer;
  v_current_rank_id uuid;
  v_new_rank_id uuid;
BEGIN
  -- Get user's current points
  SELECT points INTO v_user_points
  FROM profiles
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Find the appropriate rank based on points
  SELECT id INTO v_new_rank_id
  FROM ranks
  WHERE min_points <= v_user_points
  ORDER BY min_points DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    -- If no rank found, use the lowest rank
    SELECT id INTO v_new_rank_id
    FROM ranks
    ORDER BY min_points ASC
    LIMIT 1;
  END IF;
  
  -- Update the user's rank if needed
  UPDATE profiles
  SET 
    rank_id = v_new_rank_id,
    updated_at = now()
  WHERE id = p_user_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in update_user_rank: %', SQLERRM;
    RAISE;
END;
$$; 
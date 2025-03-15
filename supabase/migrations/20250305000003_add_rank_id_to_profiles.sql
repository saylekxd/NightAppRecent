/*
  # Add rank_id to profiles table

  This migration adds a rank_id column to the profiles table and sets the initial rank
  for all existing users.
*/

-- Add rank_id column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS rank_id uuid REFERENCES ranks(id);

-- Update existing profiles with appropriate ranks
DO $$
DECLARE
  v_profile RECORD;
  v_rank_id uuid;
BEGIN
  FOR v_profile IN
    SELECT id, points
    FROM profiles
    WHERE rank_id IS NULL
  LOOP
    -- Find appropriate rank for this user
    SELECT id INTO v_rank_id
    FROM ranks
    WHERE min_points <= v_profile.points
    ORDER BY min_points DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
      -- If no rank found, use the lowest rank
      SELECT id INTO v_rank_id
      FROM ranks
      ORDER BY min_points ASC
      LIMIT 1;
    END IF;
    
    -- Update profile with rank
    UPDATE profiles
    SET rank_id = v_rank_id
    WHERE id = v_profile.id;
  END LOOP;
END;
$$; 
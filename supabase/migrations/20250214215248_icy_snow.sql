/*
  # Fix reward redemption logic

  1. Changes
    - Update redeem_reward function to check for existing active redemptions
    - Add better error handling and validation

  2. Security
    - Maintain existing RLS policies
    - Add additional validation checks
*/

-- Update the redeem_reward function with better validation
CREATE OR REPLACE FUNCTION redeem_reward(
  p_reward_id uuid,
  p_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_points_required integer;
  v_user_points integer;
  v_redemption_id uuid;
  v_code text;
  v_existing_redemption_count integer;
BEGIN
  -- Check if user already has an active redemption for this reward
  SELECT COUNT(*) INTO v_existing_redemption_count
  FROM reward_redemptions
  WHERE user_id = p_user_id
    AND reward_id = p_reward_id
    AND status = 'active'
    AND expires_at > now();

  IF v_existing_redemption_count > 0 THEN
    RAISE EXCEPTION 'You already have an active redemption for this reward';
  END IF;

  -- Get reward points requirement and check if reward exists and is active
  SELECT points_required INTO v_points_required
  FROM rewards
  WHERE id = p_reward_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found or inactive';
  END IF;

  -- Check if user has enough points
  SELECT points INTO v_user_points
  FROM profiles
  WHERE id = p_user_id;

  IF v_user_points < v_points_required THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  -- Generate unique code
  v_code := encode(gen_random_bytes(6), 'hex');

  -- Create redemption
  INSERT INTO reward_redemptions (
    user_id,
    reward_id,
    code,
    status,
    expires_at
  )
  VALUES (
    p_user_id,
    p_reward_id,
    v_code,
    'active',
    now() + interval '30 days'
  )
  RETURNING id INTO v_redemption_id;

  -- Deduct points
  PERFORM process_points_transaction(
    p_user_id,
    v_points_required,
    'spend',
    'Reward redemption'
  );

  RETURN v_redemption_id;
END;
$$;
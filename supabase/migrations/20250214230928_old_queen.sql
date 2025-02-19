-- Function to get admin stats for a specific date
CREATE OR REPLACE FUNCTION get_admin_stats(p_date timestamptz)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  SELECT json_build_object(
    'visits_count', (
      SELECT COUNT(*)
      FROM visits
      WHERE DATE(check_in) = DATE(p_date)
    ),
    'rewards_used', (
      SELECT COUNT(*)
      FROM reward_redemptions
      WHERE DATE(used_at) = DATE(p_date)
    ),
    'points_awarded', (
      SELECT COALESCE(SUM(amount), 0)
      FROM transactions
      WHERE DATE(created_at) = DATE(p_date)
      AND type = 'earn'
    ),
    'capacity_percentage', (
      SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND((COUNT(*) * 100.0 / 200)::numeric, 2) -- Assuming max capacity is 200
        END
      FROM visits
      WHERE DATE(check_in) = DATE(p_date)
      AND check_out IS NULL
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;
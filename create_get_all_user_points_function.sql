-- Function to get total points for a list of users
CREATE OR REPLACE FUNCTION get_all_user_points(user_ids UUID[])
RETURNS TABLE (user_id UUID, total_points BIGINT)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.user_id,
    COALESCE(SUM(t.amount), 0)::BIGINT as total_points
  FROM 
    transactions t
  WHERE 
    t.user_id = ANY(user_ids)
    AND t.type = 'earn'
  GROUP BY 
    t.user_id;
END;
$$ LANGUAGE plpgsql;

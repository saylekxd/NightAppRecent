/*
  # Add Visits Table

  1. New Tables
    - `visits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `check_in` (timestamptz)
      - `check_out` (timestamptz, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `visits` table
    - Add policies for users to view their own visits
*/

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  check_in timestamptz NOT NULL DEFAULT now(),
  check_out timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own visits"
  ON visits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own visits"
  ON visits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visits"
  ON visits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to create a new visit
CREATE OR REPLACE FUNCTION create_visit(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_visit_id uuid;
BEGIN
  INSERT INTO visits (user_id)
  VALUES (p_user_id)
  RETURNING id INTO v_visit_id;

  -- Award points for the visit
  PERFORM process_points_transaction(
    p_user_id,
    100, -- Award 100 points per visit
    'earn',
    'Visit check-in'
  );

  RETURN v_visit_id;
END;
$$;

-- Function to complete a visit
CREATE OR REPLACE FUNCTION complete_visit(p_visit_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE visits
  SET check_out = now()
  WHERE id = p_visit_id
  AND check_out IS NULL;
END;
$$;

-- Insert sample visits for testing
INSERT INTO visits (user_id, check_in, check_out)
SELECT 
  auth.uid(),
  timestamp - (i || ' days')::interval,
  timestamp - (i || ' days')::interval + interval '3 hours'
FROM 
  generate_series(1, 10) i,
  (SELECT now() as timestamp, id as auth_uid FROM auth.users LIMIT 1) u
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);
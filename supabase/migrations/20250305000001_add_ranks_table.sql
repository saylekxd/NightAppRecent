/*
  # Add ranks table to fix error with accept_visit function

  This migration adds the missing 'ranks' table that is being referenced
  by database functions. The table structure matches the client-side ranks
  defined in lib/ranks.ts.
*/

-- Create ranks table
CREATE TABLE IF NOT EXISTS public.ranks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  min_points integer NOT NULL,
  color text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ranks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view ranks"
  ON public.ranks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage ranks"
  ON public.ranks
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_ranks_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ranks_updated_at
BEFORE UPDATE ON public.ranks
FOR EACH ROW
EXECUTE FUNCTION update_ranks_updated_at_column();

-- Insert ranks from lib/ranks.ts
INSERT INTO public.ranks (name, min_points, color, icon)
VALUES
  ('Rookie', 0, '#CD7F32', 'star-outline'),
  ('Trendsetter', 1000, '#C0C0C0', 'star-half'),
  ('Icon', 5000, '#FFD700', 'star'),
  ('Legend', 10000, '#E5E4E2', 'diamond'),
  ('GOAT', 25000, '#B9F2FF', 'diamond-sharp'); 
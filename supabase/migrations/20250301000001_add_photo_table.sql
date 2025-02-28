/*
  # Add photo table for promotions

  1. New Tables
    - `photo`
      - `id` (uuid, primary key)
      - `url` (text)
      - `title` (text)
      - `description` (text, nullable)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `photo` table
    - Add policies for authenticated users to view active photos
*/

-- Create photo table
CREATE TABLE IF NOT EXISTS photo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  title text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE photo ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active photos"
  ON photo
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage photos"
  ON photo
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_photo_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_photo_updated_at
BEFORE UPDATE ON photo
FOR EACH ROW
EXECUTE FUNCTION update_photo_updated_at_column();

-- Insert sample photos
INSERT INTO photo (url, title, description)
VALUES
  ('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800', 'Summer Party', 'Join us for our exclusive summer party with special drinks!'),
  ('https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800', 'DJ Night', 'Experience the best electronic music with our special guest DJs!'),
  ('https://images.unsplash.com/photo-1535924206242-349927a8e360?w=800', 'Beach Club Opening', 'Be part of our exclusive beach club opening ceremony!'); 
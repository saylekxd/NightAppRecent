/*
  # Add events table and update transactions

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `date` (timestamptz)
      - `image_url` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `events` table
    - Add policy for authenticated users to view active events
*/

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  date timestamptz NOT NULL,
  image_url text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Anyone can view active events"
  ON events
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert sample events
INSERT INTO events (title, description, date, image_url)
VALUES
  ('Summer Night Party', 'Join us for an unforgettable summer night filled with music and fun!', now() + interval '2 days', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800'),
  ('DJ Night Special', 'Experience the best electronic music with our special guest DJs!', now() + interval '7 days', 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800'),
  ('Beach Club Opening', 'Be part of our exclusive beach club opening ceremony!', now() + interval '14 days', 'https://images.unsplash.com/photo-1535924206242-349927a8e360?w=800');
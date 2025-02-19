/*
  # Add Community Features

  1. New Tables
    - `community_posts`
      - `id` (uuid, primary key)
      - `content` (text)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `community_post_likes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references community_posts)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamptz)

    - `community_events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `date` (timestamptz)
      - `image_url` (text)
      - `status` (text: pending, approved, rejected)
      - `submitted_by` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create community_posts table
CREATE TABLE community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create community_post_likes table
CREATE TABLE community_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create community_events table
CREATE TABLE community_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  date timestamptz NOT NULL,
  image_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;

-- Policies for community_posts
CREATE POLICY "Anyone can view posts"
  ON community_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create posts"
  ON community_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON community_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON community_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for community_post_likes
CREATE POLICY "Anyone can view likes"
  ON community_post_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like posts"
  ON community_post_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON community_post_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for community_events
CREATE POLICY "Anyone can view events"
  ON community_events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can submit events"
  ON community_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Admins can manage events"
  ON community_events
  FOR ALL
  TO authenticated
  USING (is_admin());
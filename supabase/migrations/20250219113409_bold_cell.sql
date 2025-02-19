-- Add status column to community_posts
ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update existing posts to be approved
UPDATE community_posts SET status = 'approved' WHERE status = 'pending';

-- Update policies for community_posts
DROP POLICY IF EXISTS "Anyone can view posts" ON community_posts;
CREATE POLICY "Anyone can view approved posts"
  ON community_posts
  FOR SELECT
  TO authenticated
  USING (status = 'approved' OR auth.uid() = user_id OR is_admin());

-- Admins can manage all posts
CREATE POLICY "Admins can manage posts"
  ON community_posts
  FOR ALL
  TO authenticated
  USING (is_admin());
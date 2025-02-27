-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create a function to check if a user has already submitted a review in the last 24 hours
CREATE OR REPLACE FUNCTION check_recent_review()
RETURNS TRIGGER AS $$
DECLARE
  recent_review_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_review_count
  FROM reviews
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '24 hours';
  
  IF recent_review_count > 0 THEN
    RAISE EXCEPTION 'User has already submitted a review in the last 24 hours';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check if a user has had a transaction in the last 24 hours
CREATE OR REPLACE FUNCTION check_recent_transaction()
RETURNS TRIGGER AS $$
DECLARE
  recent_transaction_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_transaction_count
  FROM transactions
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '24 hours';
  
  IF recent_transaction_count = 0 THEN
    RAISE EXCEPTION 'User must have a transaction in the last 24 hours to submit a review';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to enforce the rules
CREATE TRIGGER enforce_one_review_per_day
BEFORE INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION check_recent_review();

CREATE TRIGGER enforce_transaction_required
BEFORE INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION check_recent_transaction();

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 
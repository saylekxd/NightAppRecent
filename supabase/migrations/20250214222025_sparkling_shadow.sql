-- Add INSERT policy to allow profile creation during sign-up
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
  
  -- Create new INSERT policy
  CREATE POLICY "Users can create their own profile"
    ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);
    
EXCEPTION
  WHEN undefined_table THEN
    -- If profiles table doesn't exist yet, create it with all policies
    CREATE TABLE IF NOT EXISTS profiles (
      id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
      username text UNIQUE NOT NULL,
      full_name text,
      points integer DEFAULT 0,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can read own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);

    CREATE POLICY "Users can update own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);

    CREATE POLICY "Users can create their own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
END $$;

-- Ensure the trigger function exists
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger (will replace if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
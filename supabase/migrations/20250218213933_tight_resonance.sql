-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create new, more permissive policies for profile creation and access
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

CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_count integer;
BEGIN
  -- Check if profile already exists
  SELECT COUNT(*) INTO v_count
  FROM public.profiles
  WHERE id = new.id;

  -- Only create profile if it doesn't exist
  IF v_count = 0 THEN
    INSERT INTO public.profiles (
      id,
      username,
      full_name,
      points,
      created_at,
      updated_at
    )
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', new.email),
      0,
      now(),
      now()
    );
  END IF;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create missing profiles for existing users
DO $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN profiles p ON p.id = u.id
    WHERE p.id IS NULL
  LOOP
    INSERT INTO profiles (
      id,
      username,
      full_name,
      points,
      created_at,
      updated_at
    )
    VALUES (
      v_user.id,
      v_user.email,
      COALESCE(v_user.raw_user_meta_data->>'full_name', v_user.email),
      0,
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END;
$$;
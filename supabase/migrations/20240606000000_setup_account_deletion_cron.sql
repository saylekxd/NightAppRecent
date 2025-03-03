-- Enable the required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to process account deletions
CREATE OR REPLACE FUNCTION public.process_account_deletions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Run with the privileges of the function creator
SET search_path = public, pg_temp
AS $$
DECLARE
  user_record RECORD;
  deletion_date TIMESTAMP;
BEGIN
  -- Loop through all users with deletion_requested = true
  FOR user_record IN 
    SELECT id, raw_user_meta_data->>'deletion_date' as deletion_date_str
    FROM auth.users
    WHERE 
      raw_user_meta_data->>'deletion_requested' = 'true'
      AND raw_user_meta_data->>'deletion_date' IS NOT NULL
  LOOP
    -- Parse the deletion date
    deletion_date := (user_record.deletion_date_str)::TIMESTAMP;
    
    -- Check if deletion date has passed
    IF deletion_date <= NOW() THEN
      -- Log the deletion
      RAISE NOTICE 'Deleting user %', user_record.id;
      
      -- Delete user data from profiles table
      DELETE FROM public.profiles WHERE id = user_record.id;
      
      -- Delete any other related data in other tables
      -- Add additional DELETE statements for other tables where user data is stored
      
      -- Delete the user from auth.users
      -- This uses the built-in function provided by Supabase
      PERFORM auth.admin_delete_user(user_record.id, true); -- true for soft delete
    END IF;
  END LOOP;
END;
$$;

-- Schedule the account deletion job to run daily at midnight
SELECT cron.schedule(
  'process-account-deletions',
  '0 0 * * *', -- Run daily at midnight (cron syntax: minute hour day month day_of_week)
  'CALL public.process_account_deletions();'
); 
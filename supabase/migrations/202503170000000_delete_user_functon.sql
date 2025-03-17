--- 1ST MIGRATION ---

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

-- 2ND MIGRATION ---

-- Here I set by CRON automatically users to delete --

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


-- 3RD MIGRATION ---

-- This is fixed call function to check if the user still want to be deleted, before deletion --

CREATE OR REPLACE FUNCTION public.process_account_deletions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- Run with the privileges of the function creator
SET search_path = public, pg_temp
AS $$
DECLARE
    user_record RECORD;
    deletion_date TIMESTAMP;
BEGIN
    -- Loop through all users with deletion_requested = true
    FOR user_record IN
        SELECT id, raw_user_meta_data->>'deletion_date' AS deletion_date_str
        FROM auth.users
        WHERE raw_user_meta_data->>'deletion_requested' = 'true'
        AND raw_user_meta_data->>'deletion_date' IS NOT NULL
    LOOP
        -- Parse the deletion date
        deletion_date := (user_record.deletion_date_str)::TIMESTAMP;

        -- Final check before deletion: Ensure deletion is still requested
        IF deletion_date <= NOW() AND
           (SELECT raw_user_meta_data->>'deletion_requested' FROM auth.users WHERE id = user_record.id) = 'true' THEN
           
            -- Log the deletion
            RAISE NOTICE 'Deleting user %', user_record.id;

            -- Delete user data from profiles table
            DELETE FROM public.profiles WHERE id = user_record.id;

            -- Additional delete statements for other related data...

            -- Delete the user from auth.users (soft delete)
            PERFORM auth.admin_delete_user(user_record.id, true);
        ELSE
            RAISE NOTICE 'Skipping user % because deletion request was canceled.', user_record.id;
        END IF;
    END LOOP;
END $$;


-- 4TH MIGRATION ---


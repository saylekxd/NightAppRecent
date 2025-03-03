# SQL-Based Account Deletion Process

This migration sets up an automated process to delete user accounts that have been marked for deletion and have passed their deletion date.

## How It Works

1. **Marking Accounts for Deletion**:
   - When a user requests account deletion in the app, their account is marked with metadata:
     - `deletion_requested: true`
     - `deletion_date: [30 days from request date]`
   - This gives users a 30-day grace period to change their mind

2. **Scheduled Deletion**:
   - A PostgreSQL function `public.process_account_deletions()` is created to:
     - Find all users with `deletion_requested: true` whose `deletion_date` has passed
     - Delete their profile data from the `profiles` table
     - Delete any other related data in other tables
     - Finally delete the user account using Supabase's built-in `auth.admin_delete_user()` function
   - This function is scheduled to run daily at midnight using Supabase Cron

## Deployment

1. Run this migration in your Supabase project:
   - Go to the SQL Editor in the Supabase Dashboard
   - Paste the contents of `20240606000000_setup_account_deletion_cron.sql`
   - Run the SQL script

2. Alternatively, use the Supabase CLI:
   ```bash
   supabase migration up
   ```

## Customization

You may need to customize the function to delete user data from additional tables specific to your application. Look for the comment "Delete any other related data in other tables" in the SQL function.

## Advantages of SQL-Only Approach

- **Simplicity**: No need to deploy and maintain a separate Edge Function
- **Security**: The function runs with database privileges, no need for service role keys
- **Reliability**: Runs directly in the database, reducing external dependencies
- **Monitoring**: Execution logs are available in the Supabase Dashboard under Database Logs

## Testing

You can manually test the function by running:

```sql
CALL public.process_account_deletions();
```

This will process any accounts that are marked for deletion and have passed their deletion date. 
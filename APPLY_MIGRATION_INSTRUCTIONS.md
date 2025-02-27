# How to Apply the Reviews Table Migration

There are several ways to apply the migration to create the reviews table in your Supabase database:

## Option 1: Using the Supabase Web Interface

1. Log in to your Supabase project at https://app.supabase.io
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `supabase/migrations/20250227000001_add_reviews_table.sql`
5. Run the query

## Option 2: Using the Supabase CLI

If you have the Supabase CLI installed and configured:

```bash
# Link to your remote project (if not already linked)
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

## Option 3: Using the Migration Script

If you have the service role key for your Supabase project:

1. Add the `SUPABASE_SERVICE_ROLE_KEY` to your `.env` file
2. Install required packages:
   ```bash
   npm install dotenv
   ```
3. Run the migration script:
   ```bash
   node apply_reviews_migration.js
   ```

## Verifying the Migration

After applying the migration, you can verify that the reviews table was created by:

1. Going to the Table Editor in the Supabase dashboard
2. Looking for the `reviews` table
3. Checking that it has the expected columns:
   - id (UUID)
   - user_id (UUID)
   - mood (INTEGER)
   - comment (TEXT)
   - created_at (TIMESTAMPTZ)
   - updated_at (TIMESTAMPTZ) 
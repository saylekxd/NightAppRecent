-- Create avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'avatars', 'avatars', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
);

-- Create policies to allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Create policies for users to read their own avatars
CREATE POLICY "Allow public to view avatars" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'avatars');

-- Create policies for users to update their own avatars
CREATE POLICY "Allow authenticated users to update their avatars" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Create policies for users to delete their own avatars
CREATE POLICY "Allow authenticated users to delete their avatars" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'avatars' AND auth.role() = 'authenticated'); 
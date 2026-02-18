-- Fix for "must be owner of table objects" error
-- We skip enabling RLS as it is usually enabled by default on storage.objects.
-- This script only creates or updates the necessary policies.

-- 1. Drop existing custom policies to avoid conflicts
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Host Write Access" ON storage.objects;
DROP POLICY IF EXISTS "Host Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Host Delete Access" ON storage.objects;

-- 2. Create Policy: Public Read Access (Anyone can see images)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'room-images' );

-- 3. Create Policy: Host Only Write Access (Only Admins can modify)
-- Upload Access (INSERT)
CREATE POLICY "Host Write Access"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'room-images' 
  AND (auth.role() = 'service_role' OR public.is_admin())
);

-- Update Access (UPDATE)
CREATE POLICY "Host Update Access"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'room-images' 
  AND (auth.role() = 'service_role' OR public.is_admin())
);

-- Delete Access (DELETE)
CREATE POLICY "Host Delete Access"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'room-images' 
  AND (auth.role() = 'service_role' OR public.is_admin())
);

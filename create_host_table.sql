-- 1. Create the authorized_hosts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.authorized_hosts (
  email text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security
ALTER TABLE public.authorized_hosts ENABLE ROW LEVEL SECURITY;

-- 3. Create Policy: Allow Public Read (Needed for login check)
-- This allows anyone (or at least authenticated users) to see the list of admins to check their own status used by public.is_admin()
CREATE POLICY "Allow public read to check access" 
ON public.authorized_hosts FOR SELECT 
USING (true);

-- 4. Create Helper Function: is_admin
-- This function checks if the current user's email is in the authorized_hosts table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.authorized_hosts
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Insert your email (Replce 'YOUR_EMAIL' with your actual email)
-- Example: INSERT INTO public.authorized_hosts (email) VALUES ('example@gmail.com');
-- You can run this line separately or edit it here:
INSERT INTO public.authorized_hosts (email)
VALUES ('您的Email@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Fix for "Lock Failed" and Payment Status issues
-- The current database schema is missing 'BLOCKED' and 'PAID' statuses in the check constraint.
-- Run this script in the Supabase SQL Editor to fix it.

ALTER TABLE public.bookings DROP CONSTRAINT bookings_status_check;

ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'REJECTED', 'BLOCKED', 'PAID'));

-- Verify the change
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'bookings_status_check';

-- Add 'specs' column to room_types table
-- This field allows hosts to enter flexible room specifications.

ALTER TABLE public.room_types ADD COLUMN IF NOT EXISTS specs text;

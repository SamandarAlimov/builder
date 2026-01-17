-- Add budget column to contact_submissions table
ALTER TABLE public.contact_submissions
ADD COLUMN budget text DEFAULT NULL;
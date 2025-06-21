
-- Add timezone field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN timezone TEXT DEFAULT 'UTC';

-- Add index for timezone queries
CREATE INDEX idx_profiles_timezone ON public.profiles(timezone);

-- Update existing profiles to have a default timezone
UPDATE public.profiles 
SET timezone = 'UTC' 
WHERE timezone IS NULL;

-- Add missing foreign key constraint for user_presence to fix friends query
-- This resolves the "Could not find a relationship between 'friendships' and 'user_presence'" error

ALTER TABLE public.user_presence 
ADD CONSTRAINT user_presence_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
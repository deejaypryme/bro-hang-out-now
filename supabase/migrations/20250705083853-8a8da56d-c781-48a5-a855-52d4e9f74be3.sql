-- Fix foreign key references to point to profiles instead of auth.users
-- This will resolve the PostgREST schema cache relationship errors

-- Drop existing foreign keys that point to auth.users
DO $$ 
BEGIN
    -- Drop friendships foreign keys if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'friendships_user_id_fkey' 
        AND table_name = 'friendships'
    ) THEN
        ALTER TABLE public.friendships DROP CONSTRAINT friendships_user_id_fkey;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'friendships_friend_id_fkey' 
        AND table_name = 'friendships'
    ) THEN
        ALTER TABLE public.friendships DROP CONSTRAINT friendships_friend_id_fkey;
    END IF;

    -- Drop hangouts foreign keys if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'hangouts_organizer_id_fkey' 
        AND table_name = 'hangouts'
    ) THEN
        ALTER TABLE public.hangouts DROP CONSTRAINT hangouts_organizer_id_fkey;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'hangouts_friend_id_fkey' 
        AND table_name = 'hangouts'
    ) THEN
        ALTER TABLE public.hangouts DROP CONSTRAINT hangouts_friend_id_fkey;
    END IF;
END $$;

-- Add correct foreign keys pointing to profiles.id
ALTER TABLE public.friendships 
ADD CONSTRAINT friendships_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.friendships 
ADD CONSTRAINT friendships_friend_id_fkey 
FOREIGN KEY (friend_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.hangouts 
ADD CONSTRAINT hangouts_organizer_id_fkey 
FOREIGN KEY (organizer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.hangouts 
ADD CONSTRAINT hangouts_friend_id_fkey 
FOREIGN KEY (friend_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
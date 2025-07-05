-- Add missing foreign key constraints to fix relationship errors

-- Add foreign key for friendships.user_id -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'friendships_user_id_fkey' 
        AND table_name = 'friendships'
    ) THEN
        ALTER TABLE public.friendships 
        ADD CONSTRAINT friendships_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key for friendships.friend_id -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'friendships_friend_id_fkey' 
        AND table_name = 'friendships'
    ) THEN
        ALTER TABLE public.friendships 
        ADD CONSTRAINT friendships_friend_id_fkey 
        FOREIGN KEY (friend_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key for hangouts.organizer_id -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'hangouts_organizer_id_fkey' 
        AND table_name = 'hangouts'
    ) THEN
        ALTER TABLE public.hangouts 
        ADD CONSTRAINT hangouts_organizer_id_fkey 
        FOREIGN KEY (organizer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key for hangouts.friend_id -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'hangouts_friend_id_fkey' 
        AND table_name = 'hangouts'
    ) THEN
        ALTER TABLE public.hangouts 
        ADD CONSTRAINT hangouts_friend_id_fkey 
        FOREIGN KEY (friend_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check existing constraints and add only missing ones
DO $$ 
BEGIN
    -- Add foreign key for friendships.blocked_by if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'friendships_blocked_by_fkey' 
        AND table_name = 'friendships'
    ) THEN
        ALTER TABLE public.friendships 
        ADD CONSTRAINT friendships_blocked_by_fkey 
        FOREIGN KEY (blocked_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;

    -- Add foreign key for friend_invitations.invitee_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'friend_invitations_invitee_id_fkey' 
        AND table_name = 'friend_invitations'
    ) THEN
        ALTER TABLE public.friend_invitations 
        ADD CONSTRAINT friend_invitations_invitee_id_fkey 
        FOREIGN KEY (invitee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for user_presence.user_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_presence_user_id_fkey' 
        AND table_name = 'user_presence'
    ) THEN
        ALTER TABLE public.user_presence 
        ADD CONSTRAINT user_presence_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Fix friend_invitations foreign key constraints to point to profiles instead of auth.users
-- This will resolve the PostgREST schema cache relationship errors

-- Drop existing foreign keys if they exist
DO $$ 
BEGIN
    -- Drop friend_invitations foreign keys if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'friend_invitations_inviter_id_fkey' 
        AND table_name = 'friend_invitations'
    ) THEN
        ALTER TABLE public.friend_invitations DROP CONSTRAINT friend_invitations_inviter_id_fkey;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'friend_invitations_invitee_id_fkey' 
        AND table_name = 'friend_invitations'
    ) THEN
        ALTER TABLE public.friend_invitations DROP CONSTRAINT friend_invitations_invitee_id_fkey;
    END IF;
END $$;

-- Add correct foreign keys pointing to profiles.id
ALTER TABLE public.friend_invitations 
ADD CONSTRAINT friend_invitations_inviter_id_fkey 
FOREIGN KEY (inviter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.friend_invitations 
ADD CONSTRAINT friend_invitations_invitee_id_fkey 
FOREIGN KEY (invitee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
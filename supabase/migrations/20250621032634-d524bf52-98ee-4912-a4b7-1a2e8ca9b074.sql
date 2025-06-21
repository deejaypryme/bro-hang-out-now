
-- Create friend_invitations table for tracking invitations
CREATE TABLE public.friend_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  invitee_email TEXT,
  invitee_phone TEXT,
  invitee_id UUID REFERENCES auth.users ON DELETE CASCADE,
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_invitee_info CHECK (
    (invitee_email IS NOT NULL AND invitee_phone IS NULL AND invitee_id IS NULL) OR
    (invitee_email IS NULL AND invitee_phone IS NOT NULL AND invitee_id IS NULL) OR
    (invitee_email IS NULL AND invitee_phone IS NULL AND invitee_id IS NOT NULL)
  )
);

-- Create user_presence table for real-time status tracking
CREATE TABLE public.user_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'busy', 'away')) DEFAULT 'offline',
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  custom_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update friendships table to include more metadata
ALTER TABLE public.friendships ADD COLUMN IF NOT EXISTS blocked_by UUID REFERENCES auth.users ON DELETE SET NULL;
ALTER TABLE public.friendships ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.friendships ADD COLUMN IF NOT EXISTS favorite BOOLEAN DEFAULT false;

-- Enable Row Level Security
ALTER TABLE public.friend_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friend_invitations
CREATE POLICY "Users can view invitations they sent" ON public.friend_invitations 
  FOR SELECT USING (auth.uid() = inviter_id);

CREATE POLICY "Users can view invitations sent to them by email" ON public.friend_invitations 
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = invitee_email
    )
  );

CREATE POLICY "Users can view invitations sent to them by ID" ON public.friend_invitations 
  FOR SELECT USING (auth.uid() = invitee_id);

CREATE POLICY "Users can create invitations" ON public.friend_invitations 
  FOR INSERT WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update invitations they received" ON public.friend_invitations 
  FOR UPDATE USING (
    auth.uid() = invitee_id OR 
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = invitee_email
    )
  );

-- RLS Policies for user_presence
CREATE POLICY "Users can view all presence statuses" ON public.user_presence 
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own presence" ON public.user_presence 
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_friend_invitations_inviter ON public.friend_invitations(inviter_id);
CREATE INDEX idx_friend_invitations_invitee_email ON public.friend_invitations(invitee_email);
CREATE INDEX idx_friend_invitations_invitee_id ON public.friend_invitations(invitee_id);
CREATE INDEX idx_friend_invitations_token ON public.friend_invitations(invitation_token);
CREATE INDEX idx_friend_invitations_status ON public.friend_invitations(status);
CREATE INDEX idx_user_presence_user ON public.user_presence(user_id);
CREATE INDEX idx_user_presence_status ON public.user_presence(status);
CREATE INDEX idx_friendships_user_friend ON public.friendships(user_id, friend_id);

-- Create function to automatically create user presence on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_presence()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_presence (user_id, status)
  VALUES (new.id, 'offline');
  RETURN new;
END;
$$;

-- Update the existing trigger to also create presence
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'username'
  );
  
  INSERT INTO public.user_presence (user_id, status)
  VALUES (new.id, 'offline');
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for presence updates
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
ALTER TABLE public.friend_invitations REPLICA IDENTITY FULL;
ALTER TABLE public.friendships REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_invitations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;

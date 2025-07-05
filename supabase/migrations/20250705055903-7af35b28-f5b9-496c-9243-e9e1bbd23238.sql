-- Simplified Social System Migration
-- This replaces the complex external notification system with simple in-app interactions

-- Create simple friend requests table (replacing complex friend_invitations)
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, recipient_id)
);

-- Create simple hangout requests table (replacing complex hangout invitations)
CREATE TABLE IF NOT EXISTS public.hangout_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  activity_name TEXT NOT NULL,
  activity_emoji TEXT NOT NULL DEFAULT '🤝',
  proposed_date DATE NOT NULL,
  proposed_time TIME NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hangout_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friend_requests
CREATE POLICY "Users can create friend requests" 
ON public.friend_requests 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can view their friend requests" 
ON public.friend_requests 
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Recipients can update friend requests" 
ON public.friend_requests 
FOR UPDATE 
USING (auth.uid() = recipient_id);

-- RLS Policies for hangout_requests
CREATE POLICY "Users can create hangout requests" 
ON public.hangout_requests 
FOR INSERT 
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can view their hangout requests" 
ON public.hangout_requests 
FOR SELECT 
USING (auth.uid() = organizer_id OR auth.uid() = friend_id);

CREATE POLICY "Friends can update hangout requests" 
ON public.hangout_requests 
FOR UPDATE 
USING (auth.uid() = friend_id OR auth.uid() = organizer_id);

-- Enable realtime for instant notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hangout_requests;

-- Create notification helper view for easy querying
CREATE OR REPLACE VIEW public.user_notifications AS
SELECT 
  'friend_request' as type,
  fr.id,
  fr.requester_id as from_user_id,
  fr.recipient_id as to_user_id,
  p.full_name as from_user_name,
  p.username as from_username,
  fr.message,
  fr.status,
  fr.created_at
FROM friend_requests fr
JOIN profiles p ON p.id = fr.requester_id
WHERE fr.status = 'pending'

UNION ALL

SELECT 
  'hangout_request' as type,
  hr.id,
  hr.organizer_id as from_user_id,
  hr.friend_id as to_user_id,
  p.full_name as from_user_name,
  p.username as from_username,
  hr.activity_name || ' - ' || to_char(hr.proposed_date, 'Mon DD') || ' at ' || to_char(hr.proposed_time, 'HH12:MI AM') as message,
  hr.status,
  hr.created_at
FROM hangout_requests hr
JOIN profiles p ON p.id = hr.organizer_id
WHERE hr.status = 'pending'

ORDER BY created_at DESC;
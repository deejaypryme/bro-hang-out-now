
-- Add hangout invitations table to track sent invites
CREATE TABLE public.hangout_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hangout_id UUID REFERENCES public.hangouts(id) ON DELETE CASCADE NOT NULL,
  inviter_id UUID NOT NULL,
  invitee_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  message TEXT,
  sent_via TEXT CHECK (sent_via IN ('email', 'sms', 'app')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_hangout_invitations_hangout_id ON public.hangout_invitations(hangout_id);
CREATE INDEX idx_hangout_invitations_invitee_id ON public.hangout_invitations(invitee_id);
CREATE INDEX idx_hangout_invitations_token ON public.hangout_invitations(invitation_token);
CREATE INDEX idx_hangout_invitations_status ON public.hangout_invitations(status);

-- Add RLS policies for hangout invitations
ALTER TABLE public.hangout_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations they sent or received
CREATE POLICY "Users can view their hangout invitations" 
  ON public.hangout_invitations 
  FOR SELECT 
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- Users can create invitations they are sending
CREATE POLICY "Users can create hangout invitations" 
  ON public.hangout_invitations 
  FOR INSERT 
  WITH CHECK (auth.uid() = inviter_id);

-- Users can update invitations they received (to respond)
CREATE POLICY "Users can respond to hangout invitations" 
  ON public.hangout_invitations 
  FOR UPDATE 
  USING (auth.uid() = invitee_id);

-- Add time slot proposals table for flexible scheduling
CREATE TABLE public.hangout_time_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hangout_id UUID REFERENCES public.hangouts(id) ON DELETE CASCADE NOT NULL,
  proposed_date DATE NOT NULL,
  proposed_start_time TIME NOT NULL,
  proposed_end_time TIME NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_hangout_time_proposals_hangout_id ON public.hangout_time_proposals(hangout_id);

-- Add RLS for time proposals
ALTER TABLE public.hangout_time_proposals ENABLE ROW LEVEL SECURITY;

-- Users involved in the hangout can view and create time proposals
CREATE POLICY "Users can manage hangout time proposals" 
  ON public.hangout_time_proposals 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.hangouts h 
      WHERE h.id = hangout_id 
      AND (h.organizer_id = auth.uid() OR h.friend_id = auth.uid())
    )
  );

-- Add emotional signals to hangouts table
ALTER TABLE public.hangouts 
ADD COLUMN emotional_signal JSONB,
ADD COLUMN cancellation_reason TEXT,
ADD COLUMN cancelled_by UUID,
ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE;

-- Update hangout status to include more states
ALTER TABLE public.hangouts 
DROP CONSTRAINT IF EXISTS hangouts_status_check;

ALTER TABLE public.hangouts 
ADD CONSTRAINT hangouts_status_check 
CHECK (status IN ('draft', 'pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'));

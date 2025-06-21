
import { supabase } from "@/integrations/supabase/client";
import type { 
  Hangout, 
  HangoutWithDetails,
  FriendWithProfile 
} from "@/types/database";
import { type TimeOption } from "@/components/TimeSelection";
import { type Activity, type EmotionalSignal } from "@/data/activities";

export interface HangoutInvitation {
  id: string;
  hangout_id: string;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitation_token: string;
  message: string | null;
  sent_via: 'email' | 'sms' | 'app' | null;
  expires_at: string;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HangoutTimeProposal {
  id: string;
  hangout_id: string;
  proposed_date: string;
  proposed_start_time: string;
  proposed_end_time: string;
  created_by: string;
  created_at: string;
}

export interface CreateHangoutRequest {
  friend: FriendWithProfile;
  timeOptions: TimeOption[];
  activity: Activity;
  signal?: EmotionalSignal;
  message?: string;
}

export const hangoutsService = {
  async createHangoutWithInvitation(request: CreateHangoutRequest): Promise<{ hangout: Hangout; invitation: HangoutInvitation }> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    // Create the hangout in draft status first
    const hangoutData = {
      organizer_id: user.id,
      friend_id: request.friend.id,
      activity_id: request.activity.id,
      activity_name: request.activity.name,
      activity_emoji: request.activity.emoji,
      scheduled_date: request.timeOptions[0]?.date || new Date().toISOString().split('T')[0],
      scheduled_time: request.timeOptions[0]?.startTime || '12:00',
      status: 'pending' as const,
      emotional_signal: request.signal ? JSON.stringify(request.signal) : null
    };

    const { data: hangout, error: hangoutError } = await supabase
      .from('hangouts')
      .insert(hangoutData)
      .select()
      .single();

    if (hangoutError) throw hangoutError;

    // Create time proposals for all selected options
    if (request.timeOptions.length > 1) {
      const timeProposals = request.timeOptions.map(option => ({
        hangout_id: hangout.id,
        proposed_date: option.date,
        proposed_start_time: option.startTime,
        proposed_end_time: option.endTime,
        created_by: user.id
      }));

      const { error: proposalsError } = await supabase
        .from('hangout_time_proposals')
        .insert(timeProposals);

      if (proposalsError) throw proposalsError;
    }

    // Create the invitation
    const invitationData = {
      hangout_id: hangout.id,
      inviter_id: user.id,
      invitee_id: request.friend.id,
      status: 'pending' as const,
      message: request.message,
      sent_via: request.friend.phone ? 'sms' as const : 'email' as const
    };

    const { data: invitation, error: invitationError } = await supabase
      .from('hangout_invitations')
      .insert(invitationData)
      .select()
      .single();

    if (invitationError) throw invitationError;

    return {
      hangout: {
        ...hangout,
        status: hangout.status as 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
      },
      invitation
    };
  },

  async getHangoutInvitations(userId: string): Promise<HangoutInvitation[]> {
    const { data, error } = await supabase
      .from('hangout_invitations')
      .select('*')
      .or(`inviter_id.eq.${userId},invitee_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async respondToInvitation(invitationId: string, response: 'accepted' | 'declined'): Promise<void> {
    const { error } = await supabase
      .from('hangout_invitations')
      .update({ 
        status: response,
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId);

    if (error) throw error;

    // If accepted, update hangout status to confirmed
    if (response === 'accepted') {
      const { data: invitation } = await supabase
        .from('hangout_invitations')
        .select('hangout_id')
        .eq('id', invitationId)
        .single();

      if (invitation) {
        await supabase
          .from('hangouts')
          .update({ status: 'confirmed' })
          .eq('id', invitation.hangout_id);
      }
    }
  },

  async updateHangoutStatus(hangoutId: string, status: 'confirmed' | 'completed' | 'cancelled' | 'rescheduled', reason?: string): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'cancelled') {
      updateData.cancellation_reason = reason;
      updateData.cancelled_by = user.id;
      updateData.cancelled_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('hangouts')
      .update(updateData)
      .eq('id', hangoutId);

    if (error) throw error;
  },

  async rescheduleHangout(hangoutId: string, newDate: string, newTime: string): Promise<void> {
    const { error } = await supabase
      .from('hangouts')
      .update({
        scheduled_date: newDate,
        scheduled_time: newTime,
        status: 'rescheduled',
        updated_at: new Date().toISOString()
      })
      .eq('id', hangoutId);

    if (error) throw error;
  },

  async getHangoutByInvitationToken(token: string): Promise<{ hangout: HangoutWithDetails; invitation: HangoutInvitation } | null> {
    const { data: invitation, error: invitationError } = await supabase
      .from('hangout_invitations')
      .select('*')
      .eq('invitation_token', token)
      .single();

    if (invitationError || !invitation) return null;

    const { data: hangout, error: hangoutError } = await supabase
      .from('hangouts')
      .select(`
        *,
        friend_profile:profiles!hangouts_friend_id_fkey(full_name),
        organizer_profile:profiles!hangouts_organizer_id_fkey(full_name)
      `)
      .eq('id', invitation.hangout_id)
      .single();

    if (hangoutError || !hangout) return null;

    const friendName = hangout.organizer_id === invitation.invitee_id 
      ? hangout.friend_profile?.full_name || 'Unknown'
      : hangout.organizer_profile?.full_name || 'Unknown';

    const hangoutWithDetails: HangoutWithDetails = {
      ...hangout,
      status: hangout.status as 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled',
      friendName,
      date: new Date(hangout.scheduled_date),
      time: hangout.scheduled_time,
      confirmed: hangout.status === 'confirmed',
      confirmedDateTime: hangout.status === 'confirmed' 
        ? new Date(`${hangout.scheduled_date}T${hangout.scheduled_time}`) 
        : undefined
    };

    return { hangout: hangoutWithDetails, invitation };
  }
};

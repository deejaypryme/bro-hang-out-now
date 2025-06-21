
import { supabase } from "@/integrations/supabase/client";

export interface NotificationRequest {
  to: string;
  message: string;
  subject?: string;
  type: 'sms' | 'email';
  invitationToken?: string;
}

export const notificationService = {
  async sendHangoutInvitation(
    friendName: string,
    friendContact: string,
    activityName: string,
    activityEmoji: string,
    scheduledDate: string,
    scheduledTime: string,
    invitationToken: string,
    organizerName: string,
    contactType: 'sms' | 'email'
  ): Promise<boolean> {
    try {
      const baseUrl = window.location.origin;
      const responseUrl = `${baseUrl}/hangout-response?token=${invitationToken}`;
      
      const message = contactType === 'sms' 
        ? `Hey ${friendName}! ${organizerName} wants to hang out. ${activityEmoji} ${activityName} on ${scheduledDate} at ${scheduledTime}. Respond: ${responseUrl}`
        : `
          <h2>You're invited to hang out!</h2>
          <p>Hi ${friendName},</p>
          <p><strong>${organizerName}</strong> has invited you to:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${activityEmoji} ${activityName}</h3>
            <p><strong>Date:</strong> ${new Date(scheduledDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${scheduledTime}</p>
          </div>
          <p>
            <a href="${responseUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Respond to Invitation
            </a>
          </p>
          <p>Or copy this link: ${responseUrl}</p>
        `;

      const { data, error } = await supabase.functions.invoke('send-hangout-invitation', {
        body: {
          to: friendContact,
          message,
          subject: `${organizerName} wants to hang out! ${activityEmoji} ${activityName}`,
          type: contactType,
          invitationToken
        }
      });

      if (error) {
        console.error('Error sending notification:', error);
        return false;
      }

      console.log('Notification sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in notification service:', error);
      return false;
    }
  },

  async sendHangoutUpdate(
    friendContact: string,
    contactType: 'sms' | 'email',
    updateType: 'confirmed' | 'cancelled' | 'rescheduled',
    activityName: string,
    organizerName: string,
    details?: string
  ): Promise<boolean> {
    try {
      let message = '';
      let subject = '';

      switch (updateType) {
        case 'confirmed':
          subject = `Hangout confirmed! ${activityName}`;
          message = contactType === 'sms' 
            ? `Great news! ${organizerName} confirmed your hangout for ${activityName}. See you there!`
            : `
              <h2>Hangout Confirmed! 🎉</h2>
              <p>Great news! <strong>${organizerName}</strong> has confirmed your hangout:</p>
              <p><strong>${activityName}</strong></p>
              <p>Looking forward to seeing you there!</p>
            `;
          break;
        case 'cancelled':
          subject = `Hangout cancelled: ${activityName}`;
          message = contactType === 'sms' 
            ? `Sorry, ${organizerName} had to cancel the hangout for ${activityName}. ${details || ''}`
            : `
              <h2>Hangout Cancelled</h2>
              <p>Sorry, <strong>${organizerName}</strong> had to cancel the hangout for <strong>${activityName}</strong>.</p>
              ${details ? `<p><strong>Reason:</strong> ${details}</p>` : ''}
              <p>Maybe next time!</p>
            `;
          break;
        case 'rescheduled':
          subject = `Hangout rescheduled: ${activityName}`;
          message = contactType === 'sms' 
            ? `${organizerName} rescheduled the hangout for ${activityName}. ${details || ''}`
            : `
              <h2>Hangout Rescheduled</h2>
              <p><strong>${organizerName}</strong> has rescheduled the hangout for <strong>${activityName}</strong>.</p>
              ${details ? `<p><strong>New details:</strong> ${details}</p>` : ''}
            `;
          break;
      }

      const { data, error } = await supabase.functions.invoke('send-hangout-notification', {
        body: {
          to: friendContact,
          message,
          subject,
          type: contactType
        }
      });

      if (error) {
        console.error('Error sending update notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in notification service:', error);
      return false;
    }
  }
};

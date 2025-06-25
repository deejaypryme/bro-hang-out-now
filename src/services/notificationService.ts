import { supabase } from "@/integrations/supabase/client";

export interface NotificationRequest {
  to: string;
  message: string;
  subject?: string;
  type: 'sms' | 'email';
  invitationToken?: string;
}

// Email validation function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Enhanced phone number validation and formatting
const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters except +
  let cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // If phone doesn't start with +, add +1 for US numbers
  if (!cleanPhone.startsWith('+')) {
    // Check if it looks like a US number (10 or 11 digits)
    if (cleanPhone.length === 10) {
      cleanPhone = '+1' + cleanPhone;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      cleanPhone = '+' + cleanPhone;
    } else {
      // For other lengths, assume US and add +1
      cleanPhone = '+1' + cleanPhone;
    }
  }
  
  return cleanPhone;
};

// Enhanced phone number validation function
const isValidPhoneNumber = (phone: string): { valid: boolean; formatted?: string; error?: string } => {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, error: 'Phone number is required' };
  }

  const formatted = formatPhoneNumber(phone);
  
  // Basic international phone number validation (E.164 format)
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  
  if (!phoneRegex.test(formatted)) {
    return { valid: false, error: 'Invalid phone number format. Please use international format (e.g., +1234567890)' };
  }
  
  // Check for reasonable length (minimum 10 digits after country code)
  const digitsOnly = formatted.replace('+', '');
  if (digitsOnly.length < 10) {
    return { valid: false, error: 'Phone number too short. Please include area code.' };
  }
  
  if (digitsOnly.length > 15) {
    return { valid: false, error: 'Phone number too long. Please check the format.' };
  }
  
  return { valid: true, formatted };
};

// SMS character limit handling
const SMS_CHARACTER_LIMITS = {
  SINGLE_SMS: 160,
  UNICODE_SMS: 70,
  LONG_SMS_SEGMENT: 153,
  UNICODE_LONG_SMS_SEGMENT: 67
};

const analyzeSMSLength = (message: string): { 
  length: number; 
  segments: number; 
  encoding: 'GSM' | 'Unicode';
  withinLimit: boolean;
  recommendation?: string;
} => {
  // Check if message contains Unicode characters
  const hasUnicode = /[^\x00-\x7F]/.test(message);
  const encoding = hasUnicode ? 'Unicode' : 'GSM';
  
  const singleLimit = encoding === 'Unicode' ? SMS_CHARACTER_LIMITS.UNICODE_SMS : SMS_CHARACTER_LIMITS.SINGLE_SMS;
  const segmentLimit = encoding === 'Unicode' ? SMS_CHARACTER_LIMITS.UNICODE_LONG_SMS_SEGMENT : SMS_CHARACTER_LIMITS.LONG_SMS_SEGMENT;
  
  let segments = 1;
  let withinLimit = true;
  let recommendation;
  
  if (message.length > singleLimit) {
    segments = Math.ceil(message.length / segmentLimit);
    if (segments > 3) {
      withinLimit = false;
      recommendation = `Message is ${message.length} characters and will be split into ${segments} SMS segments. Consider shortening to reduce costs.`;
    }
  }
  
  return {
    length: message.length,
    segments,
    encoding,
    withinLimit,
    recommendation
  };
};

const createSMSFallbackMessage = (
  friendName: string,
  organizerName: string,
  activityName: string,
  activityEmoji: string,
  scheduledDate: string,
  scheduledTime: string,
  responseUrl: string
): string => {
  // Create a shorter version if the original is too long
  return `${friendName}, ${organizerName} invites you: ${activityEmoji} ${activityName} on ${scheduledDate} at ${scheduledTime}. Reply: ${responseUrl}`;
};

// Enhanced error handling for notification responses
const handleNotificationError = (error: any, contactType: 'sms' | 'email', contact: string) => {
  console.error(`Error sending ${contactType} to ${contact}:`, error);
  
  if (contactType === 'sms') {
    if (error.message?.includes('21211')) {
      return `Invalid phone number: ${contact}. Please check the format and try again.`;
    }
    if (error.message?.includes('21614')) {
      return `Phone number ${contact} is not a valid mobile number or cannot receive SMS.`;
    }
    if (error.message?.includes('21408')) {
      return `SMS permission denied for ${contact}. The number may have opted out.`;
    }
    if (error.message?.includes('Twilio')) {
      return `SMS service temporarily unavailable. Please try email instead or contact support.`;
    }
  }
  
  if (contactType === 'email') {
    if (error.message?.includes('domain')) {
      return `Email domain verification required. Please contact support.`;
    }
    if (error.message?.includes('Invalid email')) {
      return `Invalid email address format: ${contact}`;
    }
  }
  
  return `Failed to send ${contactType} notification. Please try again later.`;
};

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
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate contact information based on type
      if (contactType === 'email' && !isValidEmail(friendContact)) {
        const errorMsg = `Invalid email address: ${friendContact}`;
        console.error(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      if (contactType === 'sms') {
        const phoneValidation = isValidPhoneNumber(friendContact);
        if (!phoneValidation.valid) {
          console.error('Phone validation failed:', phoneValidation.error);
          return { success: false, error: phoneValidation.error };
        }
        friendContact = phoneValidation.formatted!;
      }

      const baseUrl = window.location.origin;
      const responseUrl = `${baseUrl}/hangout-response?token=${invitationToken}`;
      
      let message = '';
      
      if (contactType === 'sms') {
        message = `Hey ${friendName}! ${organizerName} wants to hang out. ${activityEmoji} ${activityName} on ${scheduledDate} at ${scheduledTime}. Respond: ${responseUrl}`;
        
        // Analyze SMS length and create fallback if needed
        const smsAnalysis = analyzeSMSLength(message);
        console.log('SMS Analysis:', smsAnalysis);
        
        if (!smsAnalysis.withinLimit) {
          console.log('Creating fallback SMS message due to length');
          message = createSMSFallbackMessage(
            friendName,
            organizerName,
            activityName,
            activityEmoji,
            scheduledDate,
            scheduledTime,
            responseUrl
          );
          
          // Re-analyze fallback message
          const fallbackAnalysis = analyzeSMSLength(message);
          console.log('Fallback SMS Analysis:', fallbackAnalysis);
        }
      } else {
        message = `
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 10px;">You're invited to hang out!</h2>
          </div>
          <p style="font-size: 16px; color: #555;">Hi <strong>${friendName}</strong>,</p>
          <p style="font-size: 16px; color: #555;"><strong>${organizerName}</strong> has invited you to join them for:</p>
          <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px;">${activityEmoji} ${activityName}</h3>
            <p style="color: #4b5563; margin: 5px 0; font-size: 16px;"><strong>📅 Date:</strong> ${new Date(scheduledDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p style="color: #4b5563; margin: 5px 0; font-size: 16px;"><strong>🕒 Time:</strong> ${scheduledTime}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${responseUrl}" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);">
              Respond to Invitation
            </a>
          </div>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
              Can't click the button? Copy and paste this link: <br>
              <span style="word-break: break-all;">${responseUrl}</span>
            </p>
          </div>
        `;
      }

      console.log(`Sending ${contactType} invitation to ${friendContact}`);

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
        const errorMessage = handleNotificationError(error, contactType, friendContact);
        console.error('Error sending notification:', error);
        return { success: false, error: errorMessage };
      }

      console.log('Notification sent successfully:', data);
      return { success: true };
    } catch (error: any) {
      const errorMessage = handleNotificationError(error, contactType, friendContact);
      console.error('Error in notification service:', error);
      return { success: false, error: errorMessage };
    }
  },

  async sendHangoutUpdate(
    friendContact: string,
    contactType: 'sms' | 'email',
    updateType: 'confirmed' | 'cancelled' | 'rescheduled',
    activityName: string,
    organizerName: string,
    details?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate contact information
      if (contactType === 'email' && !isValidEmail(friendContact)) {
        const errorMsg = `Invalid email address: ${friendContact}`;
        console.error(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      if (contactType === 'sms') {
        const phoneValidation = isValidPhoneNumber(friendContact);
        if (!phoneValidation.valid) {
          console.error('Phone validation failed:', phoneValidation.error);
          return { success: false, error: phoneValidation.error };
        }
        friendContact = phoneValidation.formatted!;
      }

      let message = '';
      let subject = '';

      switch (updateType) {
        case 'confirmed':
          subject = `Hangout confirmed! ${activityName}`;
          message = contactType === 'sms' 
            ? `Great news! ${organizerName} confirmed your hangout for ${activityName}. See you there!`
            : `
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #059669;">Hangout Confirmed! 🎉</h2>
              </div>
              <p style="font-size: 16px; color: #555;">Great news! <strong>${organizerName}</strong> has confirmed your hangout:</p>
              <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; border-left: 4px solid #059669;">
                <p style="color: #047857; font-size: 18px; font-weight: bold; margin: 0;"><strong>${activityName}</strong></p>
              </div>
              <p style="font-size: 16px; color: #555;">Looking forward to seeing you there!</p>
            `;
          break;
        case 'cancelled':
          subject = `Hangout cancelled: ${activityName}`;
          message = contactType === 'sms' 
            ? `Sorry, ${organizerName} had to cancel the hangout for ${activityName}. ${details || ''}`
            : `
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #dc2626;">Hangout Cancelled</h2>
              </div>
              <p style="font-size: 16px; color: #555;">Sorry, <strong>${organizerName}</strong> had to cancel the hangout for <strong>${activityName}</strong>.</p>
              ${details ? `<div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;"><p style="color: #b91c1c; margin: 0;"><strong>Reason:</strong> ${details}</p></div>` : ''}
              <p style="font-size: 16px; color: #555;">Maybe next time!</p>
            `;
          break;
        case 'rescheduled':
          subject = `Hangout rescheduled: ${activityName}`;
          message = contactType === 'sms' 
            ? `${organizerName} rescheduled the hangout for ${activityName}. ${details || ''}`
            : `
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #d97706;">Hangout Rescheduled</h2>
              </div>
              <p style="font-size: 16px; color: #555;"><strong>${organizerName}</strong> has rescheduled the hangout for <strong>${activityName}</strong>.</p>
              ${details ? `<div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;"><p style="color: #92400e; margin: 0;"><strong>New details:</strong> ${details}</p></div>` : ''}
            `;
          break;
      }

      // For SMS updates, check character limits
      if (contactType === 'sms') {
        const smsAnalysis = analyzeSMSLength(message);
        console.log('SMS Update Analysis:', smsAnalysis);
        
        if (smsAnalysis.recommendation) {
          console.log('SMS Recommendation:', smsAnalysis.recommendation);
        }
      }

      console.log(`Sending ${contactType} update (${updateType}) to ${friendContact}`);

      const { data, error } = await supabase.functions.invoke('send-hangout-notification', {
        body: {
          to: friendContact,
          message,
          subject,
          type: contactType
        }
      });

      if (error) {
        const errorMessage = handleNotificationError(error, contactType, friendContact);
        console.error('Error sending update notification:', error);
        return { success: false, error: errorMessage };
      }

      console.log('Update notification sent successfully:', data);
      return { success: true };
    } catch (error: any) {
      const errorMessage = handleNotificationError(error, contactType, friendContact);
      console.error('Error in notification service:', error);
      return { success: false, error: errorMessage };
    }
  }
};

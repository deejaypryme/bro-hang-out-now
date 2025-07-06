
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FriendInvitationRequest {
  invitationId: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail?: string;
  inviteePhone?: string;
  message?: string;
  invitationToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Friend invitation notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const {
      invitationId,
      inviterName,
      inviterEmail,
      inviteeEmail,
      inviteePhone,
      message,
      invitationToken
    }: FriendInvitationRequest = await req.json();

    console.log("Processing friend invitation:", {
      invitationId,
      inviterName,
      hasEmail: !!inviteeEmail,
      hasPhone: !!inviteePhone
    });

    // Get the app URL for the invitation link
    const appUrl = Deno.env.get("SUPABASE_URL")?.replace('/rest/v1', '') || "https://your-app.com";
    const invitationLink = `${appUrl}/invite?token=${invitationToken}`;

    let emailResult = null;
    let smsResult = null;

    // Send email invitation if email is provided
    if (inviteeEmail) {
      try {
        console.log("Sending email invitation to:", inviteeEmail);
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">You're Invited to Connect!</h1>
            <p style="font-size: 16px; color: #666;">
              Hi there! 👋
            </p>
            <p style="font-size: 16px; color: #666;">
              <strong>${inviterName}</strong> (${inviterEmail}) has invited you to connect as friends on our app.
            </p>
            ${message ? `
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-style: italic; color: #555;">
                  "${message}"
                </p>
              </div>
            ` : ''}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationLink}" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Accept Friend Invitation
              </a>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center;">
              Or copy and paste this link: <br>
              <code style="background: #f1f1f1; padding: 4px 8px; border-radius: 4px;">${invitationLink}</code>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #aaa; text-align: center;">
              This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        `;

        emailResult = await resend.emails.send({
          from: "Friends App <onboarding@resend.dev>",
          to: [inviteeEmail],
          subject: `${inviterName} wants to connect with you!`,
          html: emailHtml,
        });

        console.log("Email sent successfully:", emailResult);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        emailResult = { error: emailError.message };
      }
    }

    // Send SMS invitation if phone is provided
    if (inviteePhone) {
      try {
        console.log("Sending SMS invitation to:", inviteePhone);
        
        const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
        const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
        const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

        if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
          throw new Error("Twilio configuration missing");
        }

        const smsMessage = `Hi! ${inviterName} invited you to connect as friends on our app. ${message ? `Message: "${message}" ` : ''}Accept here: ${invitationLink}`;

        const twilioResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              From: twilioPhoneNumber,
              To: inviteePhone,
              Body: smsMessage,
            }),
          }
        );

        if (!twilioResponse.ok) {
          const errorData = await twilioResponse.text();
          throw new Error(`Twilio API error: ${errorData}`);
        }

        smsResult = await twilioResponse.json();
        console.log("SMS sent successfully:", smsResult);
      } catch (smsError) {
        console.error("SMS sending failed:", smsError);
        smsResult = { error: smsError.message };
      }
    }

    // Return results
    const response = {
      success: true,
      invitationId,
      emailResult,
      smsResult,
      sentVia: {
        email: !!inviteeEmail && !emailResult?.error,
        sms: !!inviteePhone && !smsResult?.error
      }
    };

    console.log("Friend invitation notification completed:", response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-friend-invitation function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        message: error.message, // Consistent with frontend expectations
        data: null // Consistent data field
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);

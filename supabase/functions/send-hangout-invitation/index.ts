
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface HangoutInvitationRequest {
  to: string;
  message: string;
  subject: string;
  type: 'sms' | 'email';
  invitationToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, message, subject, type, invitationToken }: HangoutInvitationRequest = await req.json();

    if (type === 'email') {
      const emailResponse = await resend.emails.send({
        from: "BroYourFriend <invites@broyourfriend.com>",
        to: [to],
        subject: subject,
        html: message,
      });

      console.log("Email invitation sent successfully:", emailResponse);

      return new Response(JSON.stringify(emailResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else if (type === 'sms') {
      // For SMS, we would integrate with a service like Twilio
      // For now, we'll log the SMS and return success
      console.log("SMS invitation would be sent to:", to, "Message:", message);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: "SMS would be sent in production with Twilio integration" 
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid notification type" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-hangout-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

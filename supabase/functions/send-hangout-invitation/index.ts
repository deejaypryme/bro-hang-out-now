
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

// Environment variable validation
const validateEnvironmentVariables = () => {
  console.log("🔍 Validating environment variables...");
  
  const requiredVars = {
    RESEND_API_KEY: Deno.env.get("RESEND_API_KEY"),
    TWILIO_ACCOUNT_SID: Deno.env.get("TWILIO_ACCOUNT_SID"),
    TWILIO_AUTH_TOKEN: Deno.env.get("TWILIO_AUTH_TOKEN"),
    TWILIO_PHONE_NUMBER: Deno.env.get("TWILIO_PHONE_NUMBER"),
  };

  const missing = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error("❌ Missing environment variables:", missing);
    return { valid: false, missing };
  }

  console.log("✅ All environment variables present");
  return { valid: true, missing: [] };
};

const sendSMS = async (to: string, message: string) => {
  console.log("📱 Attempting to send SMS...");
  console.log("📱 SMS recipient:", to);
  console.log("📱 SMS message length:", message.length);

  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    const missingCreds = [];
    if (!accountSid) missingCreds.push("TWILIO_ACCOUNT_SID");
    if (!authToken) missingCreds.push("TWILIO_AUTH_TOKEN");
    if (!fromNumber) missingCreds.push("TWILIO_PHONE_NUMBER");
    
    console.error("❌ Missing Twilio credentials:", missingCreds);
    throw new Error(`Missing Twilio credentials: ${missingCreds.join(', ')}`);
  }

  console.log("📱 Twilio config - From:", fromNumber, "AccountSID:", accountSid?.substring(0, 10) + "...");

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const body = new URLSearchParams({
    To: to,
    From: fromNumber,
    Body: message,
  });

  console.log("📱 Making Twilio API request to:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    console.log("📱 Twilio response status:", response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Twilio API error:", response.status, response.statusText);
      console.error("❌ Twilio error details:", errorData);
      throw new Error(`Twilio API failed (${response.status}): ${errorData}`);
    }

    const result = await response.json();
    console.log("✅ SMS sent successfully. Message SID:", result.sid);
    return result;
  } catch (error) {
    console.error("❌ SMS sending failed:", error);
    throw error;
  }
};

const sendEmail = async (to: string, subject: string, message: string) => {
  console.log("📧 Attempting to send email...");
  console.log("📧 Email recipient:", to);
  console.log("📧 Email subject:", subject);

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("❌ Missing RESEND_API_KEY");
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  console.log("📧 Resend API key present:", apiKey.substring(0, 10) + "...");

  try {
    const emailResponse = await resend.emails.send({
      from: "BroYourFriend <invites@broyourfriend.com>",
      to: [to],
      subject: subject,
      html: message,
    });

    console.log("✅ Email sent successfully:", emailResponse);
    return emailResponse;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

// Health check endpoint
const handleHealthCheck = () => {
  console.log("🏥 Health check requested");
  const envCheck = validateEnvironmentVariables();
  
  return new Response(JSON.stringify({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: envCheck,
    service: "send-hangout-invitation"
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
};

const handler = async (req: Request): Promise<Response> => {
  console.log("🚀 Function invoked:", req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("✋ CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === "GET") {
    return handleHealthCheck();
  }

  // Validate environment variables
  const envCheck = validateEnvironmentVariables();
  if (!envCheck.valid) {
    console.error("❌ Environment validation failed");
    return new Response(JSON.stringify({ 
      error: "Missing environment variables",
      missing: envCheck.missing,
      details: "Required environment variables are not set"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    console.log("📥 Parsing request body...");
    const requestData: HangoutInvitationRequest = await req.json();
    console.log("📥 Request data:", {
      to: requestData.to,
      type: requestData.type,
      subject: requestData.subject,
      messageLength: requestData.message?.length,
      hasToken: !!requestData.invitationToken
    });

    const { to, message, subject, type, invitationToken } = requestData;

    // Validate required fields
    if (!to || !message || !subject || !type || !invitationToken) {
      const missingFields = [];
      if (!to) missingFields.push('to');
      if (!message) missingFields.push('message');
      if (!subject) missingFields.push('subject');
      if (!type) missingFields.push('type');
      if (!invitationToken) missingFields.push('invitationToken');
      
      console.error("❌ Missing required fields:", missingFields);
      return new Response(JSON.stringify({ 
        error: "Missing required fields",
        missing: missingFields
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("🎯 Processing", type, "notification to:", to);

    if (type === 'email') {
      const emailResponse = await sendEmail(to, subject, message);
      
      console.log("✅ Email invitation sent successfully");
      return new Response(JSON.stringify({
        success: true,
        type: 'email',
        response: emailResponse
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else if (type === 'sms') {
      const smsResponse = await sendSMS(to, message);
      
      console.log("✅ SMS invitation sent successfully");
      return new Response(JSON.stringify({ 
        success: true, 
        type: 'sms',
        message: "SMS invitation sent successfully",
        response: smsResponse
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else {
      console.error("❌ Invalid notification type:", type);
      return new Response(JSON.stringify({ 
        error: "Invalid notification type",
        received: type,
        expected: "email or sms"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

  } catch (error: any) {
    console.error("💥 Critical error in send-hangout-invitation function:");
    console.error("💥 Error name:", error.name);
    console.error("💥 Error message:", error.message);
    console.error("💥 Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

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

// Email validation function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 5000
};

// Sleep function for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Calculate retry delay with exponential backoff
const calculateRetryDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelayMs);
};

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

const sendEmailWithRetry = async (to: string, subject: string, message: string): Promise<any> => {
  console.log("📧 Attempting to send email with retry logic...");
  console.log("📧 Email recipient:", to);
  console.log("📧 Email subject:", subject);

  // Validate email format
  if (!isValidEmail(to)) {
    console.error("❌ Invalid email format:", to);
    throw new Error(`Invalid email format: ${to}`);
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("❌ Missing RESEND_API_KEY");
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  console.log("📧 Resend API key present:", apiKey.substring(0, 10) + "...");

  // Define sender domains with fallback
  const senderDomains = [
    "noreply@broyourfriend.com", // Primary verified domain
    "onboarding@resend.dev"      // Resend default testing domain
  ];

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    for (const senderDomain of senderDomains) {
      try {
        console.log(`📧 Attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1} with sender: ${senderDomain}`);

        const emailResponse = await resend.emails.send({
          from: `BroYourFriend <${senderDomain}>`,
          to: [to],
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">BroYourFriend</h1>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
                ${message}
              </div>
              <div style="text-align: center; margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
                <p style="color: #666; font-size: 14px; margin: 0;">
                  This email was sent by BroYourFriend. If you didn't expect this email, you can safely ignore it.
                </p>
              </div>
            </div>
          `,
        });

        console.log("✅ Email sent successfully:", emailResponse);
        return emailResponse;
      } catch (error: any) {
        lastError = error;
        console.error(`❌ Email sending failed with ${senderDomain}:`, error.message);
        
        // If it's a domain-related error, try the next domain immediately
        if (error.message?.includes('domain') || error.message?.includes('verify')) {
          console.log(`🔄 Trying next sender domain due to domain error...`);
          continue;
        }
        
        // For other errors, break out of domain loop and retry
        break;
      }
    }

    // If we've tried all domains and still failed, wait before retrying
    if (attempt < RETRY_CONFIG.maxRetries) {
      const delay = calculateRetryDelay(attempt);
      console.log(`⏳ Waiting ${delay}ms before retry ${attempt + 2}...`);
      await sleep(delay);
    }
  }

  console.error("❌ All email sending attempts failed");
  throw lastError || new Error("Email sending failed after all retry attempts");
};

const sendEmail = async (to: string, subject: string, message: string) => {
  return await sendEmailWithRetry(to, subject, message);
};

// Health check endpoint
const handleHealthCheck = () => {
  console.log("🏥 Health check requested");
  const envCheck = validateEnvironmentVariables();
  
  return new Response(JSON.stringify({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: envCheck,
    service: "send-hangout-invitation",
    configuration: {
      resendConfigured: !!Deno.env.get("RESEND_API_KEY"),
      twilioConfigured: !!(Deno.env.get("TWILIO_ACCOUNT_SID") && Deno.env.get("TWILIO_AUTH_TOKEN")),
      retryConfig: RETRY_CONFIG
    }
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

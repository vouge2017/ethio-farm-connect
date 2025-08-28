import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phoneNumber, displayName, preferredChannel } = await req.json();

    if (!phoneNumber || !displayName) {
      return new Response(
        JSON.stringify({ error: 'Phone number and display name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    const { error: otpError } = await supabaseAdmin
      .from('otp_logs')
      .insert({
        phone_number: phoneNumber,
        otp_code: otp,
        channel: preferredChannel,
        expires_at: expiresAt.toISOString()
      });

    if (otpError) {
      console.error('OTP storage error:', otpError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate verification code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send OTP via preferred channel
    if (preferredChannel === 'sms') {
      try {
        const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        
        if (twilioSid && twilioToken) {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
          const auth = btoa(`${twilioSid}:${twilioToken}`);
          
          const response = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: '+1234567890', // Replace with your Twilio phone number
              To: phoneNumber,
              Body: `Your Yegebere Gebeya verification code is: ${otp}. This code expires in 10 minutes.`
            })
          });
          
          if (!response.ok) {
            console.error('Twilio SMS failed:', await response.text());
          }
        }
      } catch (error) {
        console.error('SMS sending error:', error);
      }
    } else if (preferredChannel === 'telegram') {
      try {
        const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
        
        if (telegramToken) {
          // For Telegram, we need the chat_id. For now, log the OTP
          // In production, you'd need to implement Telegram bot setup
          console.log(`Telegram OTP for ${phoneNumber}: ${otp}`);
          
          // Example Telegram API call (requires chat_id):
          // const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
          // const response = await fetch(telegramUrl, {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({
          //     chat_id: userChatId,
          //     text: `Your Yegebere Gebeya verification code is: ${otp}`
          //   })
          // });
        }
      } catch (error) {
        console.error('Telegram sending error:', error);
      }
    }

    // For development, return the OTP (remove in production)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully',
        // Remove this in production:
        dev_otp: otp 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
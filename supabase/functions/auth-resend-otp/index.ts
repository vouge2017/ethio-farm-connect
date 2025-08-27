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
    const { phoneNumber, channel } = await req.json();

    if (!phoneNumber || !channel) {
      return new Response(
        JSON.stringify({ error: 'Phone number and channel are required' }),
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

    // Check for recent OTP requests (rate limiting)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const { data: recentOTP } = await supabaseAdmin
      .from('otp_logs')
      .select('id')
      .eq('phone_number', phoneNumber)
      .gte('created_at', oneMinuteAgo.toISOString())
      .limit(1);

    if (recentOTP && recentOTP.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Please wait 1 minute before requesting another OTP' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate new 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store new OTP in database
    const { error: otpError } = await supabaseAdmin
      .from('otp_logs')
      .insert({
        phone_number: phoneNumber,
        otp_code: otp,
        channel: channel,
        expires_at: expiresAt.toISOString()
      });

    if (otpError) {
      console.error('OTP storage error:', otpError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate verification code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send OTP via requested channel
    if (channel === 'sms') {
      // TODO: Integrate with Ethiopian SMS provider
      console.log(`SMS OTP for ${phoneNumber}: ${otp}`);
    } else if (channel === 'telegram') {
      // TODO: Integrate with Telegram Bot API
      console.log(`Telegram OTP for ${phoneNumber}: ${otp}`);
    }

    // For development, return the OTP (remove in production)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP resent successfully',
        // Remove this in production:
        dev_otp: otp 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Resend OTP error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
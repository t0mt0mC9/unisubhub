import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { ReferralEmail } from './_templates/referral-invitation.tsx';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReferralEmailRequest {
  referral_code: string;
  referral_link: string;
  referred_email: string;
  referrer_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Send referral email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { 
      referral_code, 
      referral_link, 
      referred_email, 
      referrer_name 
    }: ReferralEmailRequest = await req.json();

    console.log("Sending referral email to:", referred_email);
    console.log("Referral code:", referral_code);

    // Render the React email template
    const html = await renderAsync(
      React.createElement(ReferralEmail, {
        referrer_name: referrer_name || "Un ami",
        referral_link,
        referral_code,
      })
    );

    console.log("Email template rendered successfully");

    // Send the email with a verified domain from
    const emailResponse = await resend.emails.send({
      from: "UniSubHub <noreply@city-fix.fr>",
      to: [referred_email],
      subject: "🎉 Vous êtes invité(e) à rejoindre UniSubHub !",
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email d'invitation envoyé avec succès",
      email_id: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-referral-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
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
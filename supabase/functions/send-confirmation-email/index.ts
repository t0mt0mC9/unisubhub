import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { AccountConfirmationEmail } from './_templates/account-confirmation.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  confirmation_link: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmation_link }: ConfirmationEmailRequest = await req.json();

    console.log('Envoi de l\'email de confirmation à:', email);
    console.log('Lien de confirmation:', confirmation_link);

    // Render the React email template
    const html = await renderAsync(
      React.createElement(AccountConfirmationEmail, {
        confirmation_link,
        user_email: email,
      })
    );

    const emailResponse = await resend.emails.send({
      from: "UniSubHub <onboarding@resend.dev>",
      to: [email],
      subject: "🎉 Confirmez votre compte UniSubHub",
      html,
    });

    console.log("Email de confirmation envoyé avec succès:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email de confirmation envoyé avec succès',
      data: emailResponse 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erreur dans la fonction send-confirmation-email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
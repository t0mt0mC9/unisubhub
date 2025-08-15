import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { AccountConfirmationEmail } from './_templates/account-confirmation.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, webhook-signature",
};

interface WebhookPayload {
  type: string;
  table: string;
  record: any;
  schema: string;
  old_record?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();
    
    console.log('Webhook received:', payload);

    // Only handle user signup events
    if (payload.type === 'INSERT' && payload.table === 'users' && payload.schema === 'auth') {
      const user = payload.record;
      
      console.log('New user signup detected:', user.email);

      // Generate the proper confirmation link
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      try {
        // Generate the confirmation link using Supabase admin API
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'signup',
          email: user.email,
          options: {
            redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify`
          }
        });

        if (linkError) {
          console.error('Error generating confirmation link:', linkError);
          return new Response(
            JSON.stringify({ error: 'Failed to generate confirmation link' }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Render the React email template
        const html = await renderAsync(
          React.createElement(AccountConfirmationEmail, {
            confirmation_link: linkData.properties.action_link,
            user_email: user.email,
          })
        );

        // Send the custom email
        const emailResponse = await resend.emails.send({
          from: "UniSubHub <onboarding@resend.dev>",
          to: [user.email],
          subject: "🎉 Confirmez votre compte UniSubHub",
          html,
        });

        console.log("Email de confirmation UniSubHub envoyé:", emailResponse);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Custom confirmation email sent',
            email_id: emailResponse.data?.id 
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );

      } catch (error: any) {
        console.error("Erreur lors de l'envoi de l'email:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // For other webhook events, just return success
    return new Response(
      JSON.stringify({ message: 'Webhook received but not processed' }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Erreur dans le webhook auth:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
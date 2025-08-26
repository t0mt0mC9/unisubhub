import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Obtenir la date de demain pour les rappels
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    console.log(`Checking for renewals between ${tomorrowStart.toISOString()} and ${tomorrowEnd.toISOString()}`);

    // Récupérer les abonnements qui se renouvellent demain
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('subscriptions')
      .select(`
        *,
        profiles!inner(id, email)
      `)
      .gte('next_billing_date', tomorrowStart.toISOString())
      .lt('next_billing_date', tomorrowEnd.toISOString());

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions renewing tomorrow`);

    const results = [];

    for (const subscription of subscriptions || []) {
      try {
        // Vérifier les préférences de notification de l'utilisateur
        const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(subscription.profiles.id);
        
        if (userError || !user) {
          console.log(`User not found for subscription ${subscription.id}`);
          continue;
        }

        // Récupérer les paramètres de notification depuis localStorage simulé en base
        // Pour l'instant, on assume que tous les utilisateurs veulent les rappels
        const shouldSendReminder = true; // TODO: implémenter la vérification des préférences

        if (!shouldSendReminder) {
          console.log(`User ${user.email} has disabled renewal alerts`);
          continue;
        }

        // Calculer le prix en fonction du cycle de facturation
        let displayPrice = subscription.price;
        let cycleText = 'mensuel';
        
        if (subscription.billing_cycle === 'yearly') {
          cycleText = 'annuel';
        } else if (subscription.billing_cycle === 'weekly') {
          cycleText = 'hebdomadaire';
        }

        // Envoyer l'email de rappel
        const emailResponse = await resend.emails.send({
          from: 'UniSubHub <notifications@unisubhub.fr>',
          to: [subscription.profiles.email],
          subject: `🔔 Rappel : ${subscription.name} se renouvelle demain`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0;">UniSubHub</h1>
                <p style="color: #6b7280; margin: 5px 0;">Gestion intelligente de vos abonnements</p>
              </div>
              
              <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h2 style="color: #1e293b; margin: 0 0 15px 0;">📅 Renouvellement prévu demain</h2>
                <div style="background: white; border-radius: 8px; padding: 15px;">
                  <h3 style="color: #0f172a; margin: 0 0 10px 0;">${subscription.name}</h3>
                  <p style="color: #64748b; margin: 0 0 10px 0;">Catégorie: ${subscription.category}</p>
                  <p style="color: #dc2626; font-weight: bold; margin: 0; font-size: 18px;">
                    ${displayPrice}€ / ${cycleText}
                  </p>
                </div>
              </div>
              
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <p style="margin: 0; color: #1e40af;">
                  💡 <strong>Conseil :</strong> Vérifiez si vous utilisez toujours cet abonnement ou si des offres plus avantageuses sont disponibles.
                </p>
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="https://unisubhub.fr" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Gérer mes abonnements
                </a>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Vous recevez cet email car vous avez activé les rappels de renouvellement.<br>
                  <a href="https://unisubhub.fr/settings" style="color: #2563eb;">Modifier vos préférences</a>
                </p>
              </div>
            </div>
          `,
        });

        console.log(`Renewal reminder sent to ${subscription.profiles.email} for ${subscription.name}`);
        results.push({
          subscription_id: subscription.id,
          email: subscription.profiles.email,
          status: 'sent',
          response: emailResponse
        });

      } catch (error) {
        console.error(`Error sending reminder for subscription ${subscription.id}:`, error);
        results.push({
          subscription_id: subscription.id,
          email: subscription.profiles?.email || 'unknown',
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in renewal-reminder function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
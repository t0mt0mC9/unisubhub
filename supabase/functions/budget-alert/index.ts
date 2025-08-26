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

    const { userId, newSubscriptionPrice, subscriptionName } = await req.json();

    if (!userId) {
      throw new Error('Missing userId');
    }

    console.log(`Checking budget alert for user ${userId}`);

    // Récupérer le profil utilisateur
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
    
    if (userError || !user) {
      throw new Error('User not found');
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    // Récupérer les abonnements de l'utilisateur
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('price, billing_cycle')
      .eq('user_id', userId);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    // Calculer le total mensuel actuel
    let currentMonthlyTotal = 0;
    for (const sub of subscriptions || []) {
      let monthlyPrice = sub.price;
      if (sub.billing_cycle === 'yearly') {
        monthlyPrice = sub.price / 12;
      } else if (sub.billing_cycle === 'weekly') {
        monthlyPrice = sub.price * 4;
      }
      currentMonthlyTotal += monthlyPrice;
    }

    // Ajouter le nouvel abonnement si spécifié
    if (newSubscriptionPrice) {
      currentMonthlyTotal += newSubscriptionPrice;
    }

    // Récupérer la limite de budget (TODO: depuis localStorage/base, pour l'instant 100€ par défaut)
    const budgetLimit = 100; // Default budget limit

    console.log(`User ${userId} - Current monthly total: ${currentMonthlyTotal}€, Budget limit: ${budgetLimit}€`);

    // Vérifier si le budget est dépassé
    if (currentMonthlyTotal <= budgetLimit) {
      console.log(`Budget not exceeded for user ${userId}`);
      return new Response(JSON.stringify({
        success: true,
        budget_exceeded: false,
        current_total: currentMonthlyTotal,
        budget_limit: budgetLimit
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Vérifier les préférences de notification de l'utilisateur
    // TODO: implémenter la vérification des préférences depuis localStorage/base
    const shouldSendAlert = true;

    if (!shouldSendAlert) {
      console.log(`User ${user.email} has disabled budget alerts`);
      return new Response(JSON.stringify({
        success: true,
        budget_exceeded: true,
        alert_disabled: true,
        current_total: currentMonthlyTotal,
        budget_limit: budgetLimit
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const excess = currentMonthlyTotal - budgetLimit;
    const percentageOver = ((currentMonthlyTotal / budgetLimit) - 1) * 100;

    // Envoyer l'alerte par email
    const emailResponse = await resend.emails.send({
      from: 'UniSubHub <notifications@unisubhub.fr>',
      to: [profile.email],
      subject: '⚠️ Alerte budget : Limite dépassée',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">UniSubHub</h1>
            <p style="color: #6b7280; margin: 5px 0;">Alerte budget</p>
          </div>
          
          <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ Budget dépassé !</h2>
              <p style="color: #7f1d1d; margin: 0; font-size: 16px;">
                Votre limite mensuelle de ${budgetLimit}€ a été dépassée
              </p>
            </div>
            
            <div style="background: white; border-radius: 8px; padding: 20px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div style="text-align: center; padding: 15px; background: #fee2e2; border-radius: 6px;">
                  <h3 style="color: #dc2626; margin: 0; font-size: 24px;">${currentMonthlyTotal.toFixed(2)}€</h3>
                  <p style="color: #7f1d1d; margin: 5px 0 0 0; font-size: 14px;">Total actuel</p>
                </div>
                <div style="text-align: center; padding: 15px; background: #f3f4f6; border-radius: 6px;">
                  <h3 style="color: #374151; margin: 0; font-size: 24px;">${budgetLimit}€</h3>
                  <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Limite fixée</p>
                </div>
              </div>
              
              <div style="text-align: center; padding: 10px; background: #fef2f2; border-radius: 6px;">
                <p style="color: #dc2626; margin: 0; font-weight: bold;">
                  Dépassement: +${excess.toFixed(2)}€ (+${percentageOver.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>
          
          ${newSubscriptionPrice && subscriptionName ? `
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0; color: #1e40af;">
              <strong>Nouvel abonnement ajouté :</strong> ${subscriptionName} (+${newSubscriptionPrice}€/mois)
            </p>
          </div>
          ` : ''}
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #166534; margin: 0 0 10px 0;">💡 Conseils pour réduire vos dépenses :</h3>
            <ul style="color: #166534; margin: 0; padding-left: 20px;">
              <li>Vérifiez quels abonnements vous utilisez réellement</li>
              <li>Recherchez des offres promotionnelles ou des plans moins chers</li>
              <li>Annulez temporairement les services non essentiels</li>
              <li>Partagez certains abonnements familiaux avec vos proches</li>
              <li>Ajustez votre limite de budget si nécessaire</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://unisubhub.fr" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
              Gérer mes abonnements
            </a>
            <a href="https://unisubhub.fr/settings" style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Modifier le budget
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Vous recevez cet email car vous avez activé les alertes budget.<br>
              <a href="https://unisubhub.fr/settings" style="color: #2563eb;">Modifier vos préférences</a>
            </p>
          </div>
        </div>
      `,
    });

    // Créer aussi une notification push dans l'app
    const { data: notification, error: notifError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'budget_alert',
        title: '⚠️ Budget dépassé',
        content: `Votre limite de ${budgetLimit}€ a été dépassée. Total actuel: ${currentMonthlyTotal.toFixed(2)}€`,
        data: {
          current_total: currentMonthlyTotal,
          budget_limit: budgetLimit,
          excess: excess
        },
        is_read: false,
        created_at: new Date().toISOString()
      });

    if (notifError) {
      console.error('Error creating notification:', notifError);
    }

    console.log(`Budget alert sent to ${profile.email}`);

    return new Response(JSON.stringify({
      success: true,
      budget_exceeded: true,
      alert_sent: true,
      current_total: currentMonthlyTotal,
      budget_limit: budgetLimit,
      excess: excess,
      percentage_over: percentageOver,
      email_response: emailResponse,
      notification_id: notification?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in budget-alert function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
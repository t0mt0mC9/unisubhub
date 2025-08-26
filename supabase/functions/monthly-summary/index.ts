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

    // Récupérer tous les utilisateurs qui ont des abonnements et les notifications email activées
    const { data: users, error: usersError } = await supabaseClient
      .from('profiles')
      .select(`
        id, 
        email,
        subscriptions(*)
      `)
      .not('subscriptions', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`Found ${users?.length || 0} users with subscriptions`);

    const results = [];

    for (const user of users || []) {
      try {
        // Vérifier les préférences de notification email de l'utilisateur
        // TODO: implémenter la vérification des préférences depuis localStorage/base
        const shouldSendSummary = true;

        if (!shouldSendSummary) {
          console.log(`User ${user.email} has disabled email notifications`);
          continue;
        }

        const subscriptions = user.subscriptions || [];
        
        if (subscriptions.length === 0) {
          console.log(`User ${user.email} has no subscriptions`);
          continue;
        }

        // Calculer les statistiques mensuelles
        const monthlyTotal = subscriptions.reduce((total, sub) => {
          let monthlyPrice = sub.price;
          if (sub.billing_cycle === 'yearly') {
            monthlyPrice = sub.price / 12;
          } else if (sub.billing_cycle === 'weekly') {
            monthlyPrice = sub.price * 4;
          }
          return total + monthlyPrice;
        }, 0);

        const yearlyTotal = monthlyTotal * 12;

        // Analyser par catégorie
        const categoryStats = subscriptions.reduce((stats, sub) => {
          const category = sub.category || 'Autre';
          let monthlyPrice = sub.price;
          if (sub.billing_cycle === 'yearly') {
            monthlyPrice = sub.price / 12;
          } else if (sub.billing_cycle === 'weekly') {
            monthlyPrice = sub.price * 4;
          }
          
          if (!stats[category]) {
            stats[category] = { count: 0, total: 0 };
          }
          stats[category].count++;
          stats[category].total += monthlyPrice;
          return stats;
        }, {});

        // Générer les graphiques en texte (simple)
        const categoryList = Object.entries(categoryStats)
          .sort(([,a], [,b]) => b.total - a.total)
          .map(([category, stats]) => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${category}</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${stats.count}</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #dc2626;">${stats.total.toFixed(2)}€</td>
            </tr>
          `).join('');

        const subscriptionsList = subscriptions
          .map(sub => {
            let monthlyPrice = sub.price;
            let cycle = 'mensuel';
            if (sub.billing_cycle === 'yearly') {
              monthlyPrice = sub.price / 12;
              cycle = 'annuel';
            } else if (sub.billing_cycle === 'weekly') {
              monthlyPrice = sub.price * 4;
              cycle = 'hebdomadaire';
            }
            
            return `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                  <strong>${sub.name}</strong><br>
                  <small style="color: #6b7280;">${sub.category}</small>
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">
                  <span style="background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${cycle}</span>
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #dc2626;">
                  ${sub.price}€
                </td>
              </tr>
            `;
          }).join('');

        // Envoyer l'email de résumé mensuel
        const emailResponse = await resend.emails.send({
          from: 'UniSubHub <notifications@unisubhub.fr>',
          to: [user.email],
          subject: '📊 Votre résumé mensuel UniSubHub',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f8fafc;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0;">UniSubHub</h1>
                <p style="color: #6b7280; margin: 5px 0;">Votre résumé mensuel de consommation</p>
              </div>
              
              <!-- Vue d'ensemble -->
              <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h2 style="color: #1e293b; margin: 0 0 20px 0; display: flex; align-items: center;">
                  📊 Vue d'ensemble
                </h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                  <div style="text-align: center; padding: 20px; background: #fef2f2; border-radius: 8px;">
                    <h3 style="color: #dc2626; margin: 0; font-size: 28px;">${monthlyTotal.toFixed(2)}€</h3>
                    <p style="color: #7f1d1d; margin: 5px 0 0 0;">Coût mensuel</p>
                  </div>
                  <div style="text-align: center; padding: 20px; background: #fefce8; border-radius: 8px;">
                    <h3 style="color: #ca8a04; margin: 0; font-size: 28px;">${yearlyTotal.toFixed(2)}€</h3>
                    <p style="color: #713f12; margin: 5px 0 0 0;">Coût annuel estimé</p>
                  </div>
                </div>
                <div style="text-align: center; margin-top: 15px; padding: 15px; background: #f0f9ff; border-radius: 8px;">
                  <p style="color: #0369a1; margin: 0; font-weight: bold;">
                    ${subscriptions.length} abonnement${subscriptions.length > 1 ? 's' : ''} actif${subscriptions.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <!-- Répartition par catégorie -->
              <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h2 style="color: #1e293b; margin: 0 0 20px 0;">📈 Répartition par catégorie</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #f8fafc;">
                      <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Catégorie</th>
                      <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #e5e7eb;">Nombre</th>
                      <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Coût mensuel</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${categoryList}
                  </tbody>
                </table>
              </div>
              
              <!-- Liste détaillée -->
              <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h2 style="color: #1e293b; margin: 0 0 20px 0;">📋 Détail de vos abonnements</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #f8fafc;">
                      <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Service</th>
                      <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #e5e7eb;">Facturation</th>
                      <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${subscriptionsList}
                  </tbody>
                </table>
              </div>
              
              <!-- Conseils -->
              <div style="background: #ecfccb; border: 1px solid #a3e635; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #365314; margin: 0 0 10px 0;">💡 Conseils d'optimisation</h3>
                <ul style="color: #365314; margin: 0; padding-left: 20px;">
                  <li>Vérifiez régulièrement si vous utilisez tous vos abonnements</li>
                  <li>Recherchez des offres promotionnelles pour vos services favoris</li>
                  <li>Considérez le passage à des abonnements annuels pour économiser</li>
                  ${monthlyTotal > 50 ? '<li style="font-weight: bold;">Votre budget mensuel dépasse 50€, pensez à optimiser</li>' : ''}
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://unisubhub.fr" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Gérer mes abonnements
                </a>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Vous recevez cet email car vous avez activé les notifications email mensuelles.<br>
                  <a href="https://unisubhub.fr/settings" style="color: #2563eb;">Modifier vos préférences</a>
                </p>
              </div>
            </div>
          `,
        });

        console.log(`Monthly summary sent to ${user.email}`);
        results.push({
          user_id: user.id,
          email: user.email,
          subscriptions_count: subscriptions.length,
          monthly_total: monthlyTotal,
          status: 'sent',
          response: emailResponse
        });

      } catch (error) {
        console.error(`Error sending summary to user ${user.id}:`, error);
        results.push({
          user_id: user.id,
          email: user.email,
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
    console.error('Error in monthly-summary function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
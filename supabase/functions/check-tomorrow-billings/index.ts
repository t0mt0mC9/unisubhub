import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for access to all data
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    console.log("🔍 Démarrage de la vérification des facturations de demain...");

    // Calculate tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0]; // Format YYYY-MM-DD

    console.log(`📅 Date de recherche: ${tomorrowString}`);

    // Get users who have renewal alerts enabled
    const { data: usersWithAlerts, error: usersError } = await supabase
      .from("notification_settings")
      .select(`
        user_id,
        renewal_alerts,
        profiles!inner(full_name, email)
      `)
      .eq("renewal_alerts", true);

    if (usersError) {
      console.error("❌ Erreur lors de la récupération des utilisateurs:", usersError);
      throw usersError;
    }

    console.log(`👥 ${usersWithAlerts?.length || 0} utilisateurs avec notifications de rappel activées`);

    if (!usersWithAlerts || usersWithAlerts.length === 0) {
      console.log("ℹ️ Aucun utilisateur avec notifications de rappel activées");
      return new Response(
        JSON.stringify({ 
          message: "Aucun utilisateur avec notifications de rappel activées",
          processed: 0 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    let totalBillings = 0;

    // For each user with alerts enabled, check for tomorrow's billings
    for (const userSetting of usersWithAlerts) {
      const userId = userSetting.user_id;
      const userName = userSetting.profiles?.full_name || userSetting.profiles?.email || "Utilisateur inconnu";

      console.log(`\n🔍 Vérification pour l'utilisateur: ${userName} (ID: ${userId})`);

      // Get subscriptions for this user that are due tomorrow
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .eq("next_billing_date", tomorrowString);

      if (subscriptionsError) {
        console.error(`❌ Erreur lors de la récupération des abonnements pour ${userName}:`, subscriptionsError);
        continue;
      }

      if (subscriptions && subscriptions.length > 0) {
        console.log(`💳 ${subscriptions.length} facturation(s) trouvée(s) pour ${userName}`);
        
        subscriptions.forEach((subscription) => {
          console.log(`📋 FACTURATION DEMAIN:
            👤 Utilisateur: ${userName}
            🔖 Abonnement: ${subscription.name}
            💰 Montant: ${subscription.price} ${subscription.currency}
            📅 Date de facturation: ${subscription.next_billing_date}
            🔄 Cycle: ${subscription.billing_cycle}
            🏷️ Catégorie: ${subscription.category}`);
          
          totalBillings++;
        });
      } else {
        console.log(`✅ Aucune facturation demain pour ${userName}`);
      }
    }

    console.log(`\n📊 RÉSUMÉ: ${totalBillings} facturation(s) programmée(s) pour demain`);

    return new Response(
      JSON.stringify({
        message: "Vérification terminée avec succès",
        date_checked: tomorrowString,
        users_checked: usersWithAlerts.length,
        total_billings: totalBillings,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("❌ Erreur dans check-tomorrow-billings:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
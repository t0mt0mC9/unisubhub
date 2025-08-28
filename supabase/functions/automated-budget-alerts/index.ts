import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🤖 Démarrage des alertes budget automatisées (dimanches uniquement)')
    
    // Vérifier si c'est dimanche (0 = dimanche)
    const today = new Date()
    const isDSunday = today.getDay() === 0
    
    if (!isDSunday) {
      console.log('📅 Pas un dimanche, arrêt de la fonction')
      return new Response(JSON.stringify({
        success: true,
        message: 'Les alertes budget ne sont envoyées que le dimanche',
        day: today.getDay(),
        date: today.toISOString().split('T')[0]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Récupérer tous les utilisateurs avec alertes budget activées
    const { data: usersWithBudgetAlerts, error: usersError } = await supabaseClient
      .from('notification_settings')
      .select(`
        user_id,
        budget_alerts,
        budget_limit,
        profiles!inner(full_name, email)
      `)
      .eq('budget_alerts', true)

    if (usersError) {
      console.error('❌ Erreur récupération utilisateurs:', usersError)
      throw usersError
    }

    console.log(`👥 ${usersWithBudgetAlerts?.length || 0} utilisateurs avec alertes budget activées`)

    if (!usersWithBudgetAlerts || usersWithBudgetAlerts.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Aucun utilisateur avec alertes budget activées',
        notifications_sent: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let notificationsSent = 0
    const results = []

    // Pour chaque utilisateur avec alertes budget activées
    for (const userSetting of usersWithBudgetAlerts) {
      const userId = userSetting.user_id
      const userName = userSetting.profiles?.full_name || 'Utilisateur'
      const userEmail = userSetting.profiles?.email
      const budgetLimit = userSetting.budget_limit || 100

      console.log(`\n🔍 Traitement utilisateur: ${userName} (${userEmail})`)

      // Récupérer les abonnements actifs de l'utilisateur
      const { data: subscriptions, error: subError } = await supabaseClient
        .from('subscriptions')
        .select('price, billing_cycle, name')
        .eq('user_id', userId)
        .eq('status', 'active')

      if (subError) {
        console.error(`❌ Erreur abonnements pour ${userName}:`, subError)
        continue
      }

      // Calculer le coût mensuel total
      let monthlyTotal = 0
      for (const sub of subscriptions || []) {
        let monthlyPrice = sub.price
        if (sub.billing_cycle === 'yearly') {
          monthlyPrice = sub.price / 12
        } else if (sub.billing_cycle === 'weekly') {
          monthlyPrice = sub.price * 4
        }
        monthlyTotal += monthlyPrice
      }

      console.log(`💰 Coût mensuel: ${monthlyTotal.toFixed(2)}€, Budget: ${budgetLimit}€`)

      // Préparer le message personnalisé
      const message = `Bonjour ${userName} Attention, vous avez prévu un budget mensuel de ${budgetLimit}€. Vos abonnements vous coûtent en moyenne ${monthlyTotal.toFixed(2)}€ par mois.`

      // Envoyer notification push via OneSignal
      try {
        const { data: pushResult, error: pushError } = await supabaseClient.functions.invoke('onesignal-push', {
          body: {
            userId: userId,
            title: '📊 Rapport budget hebdomadaire',
            message: message,
            data: {
              type: 'budget_alert',
              monthly_total: monthlyTotal,
              budget_limit: budgetLimit,
              subscriptions_count: subscriptions?.length || 0
            }
          }
        })

        if (pushError) {
          console.error(`❌ Erreur push notification pour ${userName}:`, pushError)
        } else {
          console.log(`✅ Notification push envoyée à ${userName}`)
          notificationsSent++
        }

        // Enregistrer dans la table notifications pour le suivi
        const { error: notifError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'budget_alert',
            title: '📊 Rapport budget hebdomadaire',
            content: message,
            data: {
              monthly_total: monthlyTotal,
              budget_limit: budgetLimit,
              subscriptions_count: subscriptions?.length || 0,
              sent_date: today.toISOString(),
              push_result: pushResult
            }
          })

        if (notifError) {
          console.error(`❌ Erreur enregistrement notification pour ${userName}:`, notifError)
        }

        results.push({
          user_id: userId,
          user_name: userName,
          user_email: userEmail,
          monthly_total: monthlyTotal,
          budget_limit: budgetLimit,
          notification_sent: !pushError,
          error: pushError?.message
        })

      } catch (error) {
        console.error(`❌ Erreur générale pour ${userName}:`, error)
        results.push({
          user_id: userId,
          user_name: userName,
          user_email: userEmail,
          monthly_total: monthlyTotal,
          budget_limit: budgetLimit,
          notification_sent: false,
          error: error.message
        })
      }
    }

    console.log(`\n📊 RÉSUMÉ: ${notificationsSent} notification(s) budget envoyée(s)`)

    return new Response(JSON.stringify({
      success: true,
      message: `Alertes budget automatisées envoyées`,
      date: today.toISOString().split('T')[0],
      is_sunday: isDSunday,
      users_processed: usersWithBudgetAlerts.length,
      notifications_sent: notificationsSent,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erreur dans automated-budget-alerts:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Erreur interne du serveur',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
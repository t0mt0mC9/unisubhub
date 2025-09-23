import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId } = await req.json()

    if (!userId) {
      throw new Error('Missing userId')
    }

    console.log(`🔍 Vérification budget en temps réel pour l'utilisateur: ${userId}`)

    // Récupérer les paramètres de notification de l'utilisateur
    const { data: notificationSettings, error: settingsError } = await supabaseClient
      .from('notification_settings')
      .select('budget_alerts, budget_limit')
      .eq('user_id', userId)
      .single()

    if (settingsError || !notificationSettings) {
      console.log(`❌ Paramètres de notification non trouvés pour ${userId}`)
      return new Response(JSON.stringify({
        success: false,
        error: 'Paramètres de notification non configurés'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Si les alertes budget sont désactivées, ne rien faire
    if (!notificationSettings.budget_alerts) {
      console.log(`ℹ️ Alertes budget désactivées pour ${userId}`)
      return new Response(JSON.stringify({
        success: true,
        message: 'Alertes budget désactivées'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const budgetLimit = notificationSettings.budget_limit || 100

    // Récupérer tous les abonnements actifs de l'utilisateur
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('price, billing_cycle, name')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (subError) {
      console.error(`❌ Erreur récupération abonnements pour ${userId}:`, subError)
      throw subError
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

    console.log(`💰 Coût mensuel total: ${monthlyTotal.toFixed(2)}€, Budget limite: ${budgetLimit}€`)

    // Vérifier si le budget est dépassé
    if (monthlyTotal <= budgetLimit) {
      console.log(`✅ Budget respecté pour ${userId}`)
      return new Response(JSON.stringify({
        success: true,
        budget_exceeded: false,
        monthly_total: monthlyTotal,
        budget_limit: budgetLimit
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Budget dépassé - envoyer une alerte immédiate
    const excess = monthlyTotal - budgetLimit
    const percentageOver = ((monthlyTotal / budgetLimit) - 1) * 100

    console.log(`⚠️ Budget dépassé ! Excédent: ${excess.toFixed(2)}€ (+${percentageOver.toFixed(1)}%)`)

    // Vérifier si une alerte a déjà été envoyée aujourd'hui
    const today = new Date().toISOString().split('T')[0]
    const { data: existingAlert, error: alertCheckError } = await supabaseClient
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'budget_alert')
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`)
      .limit(1)

    if (alertCheckError) {
      console.error('Erreur vérification alerte existante:', alertCheckError)
    }

    if (existingAlert && existingAlert.length > 0) {
      console.log(`ℹ️ Alerte budget déjà envoyée aujourd'hui pour ${userId}`)
      return new Response(JSON.stringify({
        success: true,
        budget_exceeded: true,
        alert_already_sent: true,
        monthly_total: monthlyTotal,
        budget_limit: budgetLimit,
        excess: excess
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Envoyer notification push via OneSignal
    try {
      const message = `⚠️ Budget dépassé ! Votre limite de ${budgetLimit}€ a été dépassée. Coût actuel: ${monthlyTotal.toFixed(2)}€ (+${excess.toFixed(2)}€)`

      const { data: pushResult, error: pushError } = await supabaseClient.functions.invoke('onesignal-push', {
        body: {
          userId: userId,
          title: '⚠️ Alerte Budget - Limite dépassée',
          message: message,
          data: {
            type: 'budget_alert',
            monthly_total: monthlyTotal,
            budget_limit: budgetLimit,
            excess: excess,
            percentage_over: percentageOver
          }
        }
      })

      if (pushError) {
        console.error(`❌ Erreur push notification:`, pushError)
      } else {
        console.log(`✅ Notification push envoyée`)
      }

      // Enregistrer la notification dans la base
      const { error: notifError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'budget_alert',
          title: '⚠️ Budget dépassé',
          content: message,
          data: {
            monthly_total: monthlyTotal,
            budget_limit: budgetLimit,
            excess: excess,
            percentage_over: percentageOver,
            alert_date: new Date().toISOString()
          }
        })

      if (notifError) {
        console.error(`❌ Erreur enregistrement notification:`, notifError)
      }

      return new Response(JSON.stringify({
        success: true,
        budget_exceeded: true,
        alert_sent: true,
        monthly_total: monthlyTotal,
        budget_limit: budgetLimit,
        excess: excess,
        percentage_over: percentageOver,
        push_result: pushResult
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (error) {
      console.error(`❌ Erreur envoi notification:`, error)
      return new Response(JSON.stringify({
        success: false,
        error: 'Erreur envoi notification',
        details: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('❌ Erreur dans check-budget-realtime:', error)
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
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
    console.log('🤖 Démarrage des rappels de facturation automatisés')

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Calculer la date de demain
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowString = tomorrow.toISOString().split('T')[0] // Format YYYY-MM-DD

    console.log(`📅 Recherche facturations pour: ${tomorrowString}`)

    // Récupérer les utilisateurs avec rappels de facturation activés ET leurs abonnements dus demain
    const { data: usersWithReminders, error: usersError } = await supabaseClient
      .from('notification_settings')
      .select(`
        user_id,
        renewal_alerts,
        profiles!inner(full_name, email)
      `)
      .eq('renewal_alerts', true)

    if (usersError) {
      console.error('❌ Erreur récupération utilisateurs:', usersError)
      throw usersError
    }

    console.log(`👥 ${usersWithReminders?.length || 0} utilisateurs avec rappels activés`)

    if (!usersWithReminders || usersWithReminders.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Aucun utilisateur avec rappels de facturation activés',
        notifications_sent: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let notificationsSent = 0
    const results = []

    // Pour chaque utilisateur avec rappels activés
    for (const userSetting of usersWithReminders) {
      const userId = userSetting.user_id
      const userName = userSetting.profiles?.full_name || 'Utilisateur'
      const userEmail = userSetting.profiles?.email

      console.log(`\n🔍 Vérification pour: ${userName} (${userEmail})`)

      // Récupérer les abonnements de cet utilisateur dus demain
      const { data: subscriptions, error: subscriptionsError } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .eq('next_billing_date', tomorrowString)

      if (subscriptionsError) {
        console.error(`❌ Erreur abonnements pour ${userName}:`, subscriptionsError)
        continue
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log(`✅ Aucune facturation demain pour ${userName}`)
        continue
      }

      console.log(`💳 ${subscriptions.length} facturation(s) demain pour ${userName}`)

      // Traiter chaque abonnement qui expire demain
      for (const subscription of subscriptions) {
        const message = `Bonjour ${userName} Demain prélèvement ${subscription.name} de ${subscription.price}€.`

        try {
          // Envoyer notification push via OneSignal
          const { data: pushResult, error: pushError } = await supabaseClient.functions.invoke('onesignal-push', {
            body: {
              userId: userId,
              title: '🔔 Rappel de facturation',
              message: message,
              data: {
                type: 'billing_reminder',
                subscription_id: subscription.id,
                subscription_name: subscription.name,
                amount: subscription.price,
                currency: subscription.currency,
                billing_date: tomorrowString
              }
            }
          })

          if (pushError) {
            console.error(`❌ Erreur push notification pour ${subscription.name}:`, pushError)
          } else {
            console.log(`✅ Rappel envoyé: ${subscription.name} (${subscription.price}€)`)
            notificationsSent++
          }

          // Enregistrer dans la table notifications pour le suivi
          const { error: notifError } = await supabaseClient
            .from('notifications')
            .insert({
              user_id: userId,
              type: 'billing_reminder',
              title: '🔔 Rappel de facturation',
              content: message,
              data: {
                subscription_id: subscription.id,
                subscription_name: subscription.name,
                amount: subscription.price,
                currency: subscription.currency,
                billing_date: tomorrowString,
                sent_date: new Date().toISOString(),
                push_result: pushResult
              }
            })

          if (notifError) {
            console.error(`❌ Erreur enregistrement notification:`, notifError)
          }

          results.push({
            user_id: userId,
            user_name: userName,
            user_email: userEmail,
            subscription_name: subscription.name,
            amount: subscription.price,
            currency: subscription.currency,
            billing_date: tomorrowString,
            notification_sent: !pushError,
            error: pushError?.message
          })

        } catch (error) {
          console.error(`❌ Erreur pour ${subscription.name}:`, error)
          results.push({
            user_id: userId,
            user_name: userName,
            user_email: userEmail,
            subscription_name: subscription.name,
            amount: subscription.price,
            currency: subscription.currency,
            billing_date: tomorrowString,
            notification_sent: false,
            error: error.message
          })
        }
      }
    }

    console.log(`\n📊 RÉSUMÉ: ${notificationsSent} rappel(s) de facturation envoyé(s)`)

    return new Response(JSON.stringify({
      success: true,
      message: `Rappels de facturation automatisés envoyés`,
      date: new Date().toISOString().split('T')[0],
      billing_date: tomorrowString,
      users_processed: usersWithReminders.length,
      notifications_sent: notificationsSent,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erreur dans automated-billing-reminders:', error)
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
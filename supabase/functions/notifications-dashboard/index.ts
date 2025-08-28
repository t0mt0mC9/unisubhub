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
    console.log('📊 Génération du tableau de bord des notifications')

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayString = yesterday.toISOString().split('T')[0]

    // Récupérer les statistiques des notifications envoyées hier
    const { data: budgetAlerts, error: budgetError } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('type', 'budget_alert')
      .gte('created_at', `${yesterdayString}T00:00:00.000Z`)
      .lt('created_at', `${today.toISOString().split('T')[0]}T00:00:00.000Z`)

    const { data: billingReminders, error: billingError } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('type', 'billing_reminder')
      .gte('created_at', `${yesterdayString}T00:00:00.000Z`)
      .lt('created_at', `${today.toISOString().split('T')[0]}T00:00:00.000Z`)

    if (budgetError || billingError) {
      console.error('❌ Erreur récupération notifications:', { budgetError, billingError })
      throw budgetError || billingError
    }

    // Statistiques des 7 derniers jours
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: weeklyBudgetAlerts, error: weeklyBudgetError } = await supabaseClient
      .from('notifications')
      .select('created_at')
      .eq('type', 'budget_alert')
      .gte('created_at', sevenDaysAgo.toISOString())

    const { data: weeklyBillingReminders, error: weeklyBillingError } = await supabaseClient
      .from('notifications')
      .select('created_at')
      .eq('type', 'billing_reminder')
      .gte('created_at', sevenDaysAgo.toISOString())

    if (weeklyBudgetError || weeklyBillingError) {
      console.error('❌ Erreur récupération statistiques hebdomadaires:', { weeklyBudgetError, weeklyBillingError })
    }

    // Statistiques par jour pour les 7 derniers jours
    const dailyStats = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]
      
      const budgetCount = weeklyBudgetAlerts?.filter(n => 
        n.created_at.startsWith(dateString)
      ).length || 0
      
      const billingCount = weeklyBillingReminders?.filter(n => 
        n.created_at.startsWith(dateString)
      ).length || 0

      dailyStats.push({
        date: dateString,
        day_name: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
        budget_alerts: budgetCount,
        billing_reminders: billingCount,
        total: budgetCount + billingCount
      })
    }

    // Vérification de l'exécution de la nuit dernière
    const lastNightExecution = {
      budget_alerts_executed: (budgetAlerts?.length || 0) > 0,
      billing_reminders_executed: (billingReminders?.length || 0) > 0,
      budget_alerts_count: budgetAlerts?.length || 0,
      billing_reminders_count: billingReminders?.length || 0,
      execution_date: yesterdayString,
      is_sunday: yesterday.getDay() === 0
    }

    // Statistiques globales
    const { data: totalStats, error: totalError } = await supabaseClient
      .from('notifications')
      .select('type, created_at')
      .in('type', ['budget_alert', 'billing_reminder'])
      .gte('created_at', '2025-01-01T00:00:00.000Z')

    const globalStats = {
      total_budget_alerts: totalStats?.filter(n => n.type === 'budget_alert').length || 0,
      total_billing_reminders: totalStats?.filter(n => n.type === 'billing_reminder').length || 0,
      total_notifications: totalStats?.length || 0
    }

    // Utilisateurs actifs
    const { data: activeUsers, error: usersError } = await supabaseClient
      .from('notification_settings')
      .select('user_id, budget_alerts, renewal_alerts')

    const userStats = {
      total_users: activeUsers?.length || 0,
      budget_alerts_enabled: activeUsers?.filter(u => u.budget_alerts).length || 0,
      billing_reminders_enabled: activeUsers?.filter(u => u.renewal_alerts).length || 0
    }

    const dashboard = {
      generated_at: today.toISOString(),
      last_night_execution: lastNightExecution,
      daily_stats_7_days: dailyStats,
      weekly_totals: {
        budget_alerts: weeklyBudgetAlerts?.length || 0,
        billing_reminders: weeklyBillingReminders?.length || 0,
        total: (weeklyBudgetAlerts?.length || 0) + (weeklyBillingReminders?.length || 0)
      },
      global_stats: globalStats,
      user_stats: userStats,
      system_status: {
        functions_configured: true,
        onesignal_configured: !!Deno.env.get('ONESIGNAL_API_KEY'),
        supabase_connected: true
      }
    }

    console.log('📊 Tableau de bord généré avec succès')

    return new Response(JSON.stringify({
      success: true,
      dashboard: dashboard
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erreur dans notifications-dashboard:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Erreur génération tableau de bord',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
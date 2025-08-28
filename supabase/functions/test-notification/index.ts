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
    console.log('🧪 Test de notification pour tom.lifert@gmail.com')

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const userId = '750929e9-09e0-4c24-8e21-a34a324acf6e' // tom.lifert@gmail.com

    // Envoyer notification push via OneSignal
    const { data: pushResult, error: pushError } = await supabaseClient.functions.invoke('onesignal-push', {
      body: {
        title: '🧪 Test notification UniSubHub',
        message: 'Bonjour ! Ceci est un test de notification push depuis votre système automatisé. Si vous recevez ce message, tout fonctionne parfaitement ! 🎉',
        data: {
          type: 'test_notification',
          test_time: new Date().toISOString(),
          from: 'notification_system'
        },
        included_segments: ['All']  // Envoyer à tous les utilisateurs abonnés
      }
    })

    if (pushError) {
      console.error('❌ Erreur push notification:', pushError)
      return new Response(JSON.stringify({
        success: false,
        error: 'Erreur envoi notification',
        details: pushError
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('✅ Notification de test envoyée avec succès:', pushResult)

    // Enregistrer dans la table notifications pour le suivi
    const { error: notifError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'test_notification',
        title: '🧪 Test notification UniSubHub',
        content: 'Bonjour Tom ! Ceci est un test de notification push depuis votre système automatisé. Si vous recevez ce message, tout fonctionne parfaitement ! 🎉',
        data: {
          test_time: new Date().toISOString(),
          from: 'notification_system',
          push_result: pushResult
        }
      })

    if (notifError) {
      console.error('❌ Erreur enregistrement notification:', notifError)
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Notification de test envoyée avec succès',
      user_email: 'tom.lifert@gmail.com',
      user_id: userId,
      push_result: pushResult,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erreur dans test-notification:', error)
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
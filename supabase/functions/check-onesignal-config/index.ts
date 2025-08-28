import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔍 Vérification de la configuration OneSignal...')

    // Vérifier les variables d'environnement OneSignal
    const oneSignalApiKey = Deno.env.get('ONESIGNAL_API_KEY')
    const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID')

    console.log('OneSignal API Key présente:', !!oneSignalApiKey)
    console.log('OneSignal App ID présent:', !!oneSignalAppId)

    if (!oneSignalApiKey) {
      console.error('❌ ONESIGNAL_API_KEY manquante')
      return new Response(JSON.stringify({
        error: 'ONESIGNAL_API_KEY non configurée',
        configured: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!oneSignalAppId) {
      console.error('❌ ONESIGNAL_APP_ID manquant')
      return new Response(JSON.stringify({
        error: 'ONESIGNAL_APP_ID non configuré',
        configured: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Test de connexion à OneSignal
    console.log('🔗 Test de connexion à OneSignal...')
    
    const testResponse = await fetch(`https://onesignal.com/api/v1/apps/${oneSignalAppId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${oneSignalApiKey}`,
        'Content-Type': 'application/json'
      }
    })

    const testResult = await testResponse.json()
    console.log('Réponse OneSignal:', testResult)

    if (!testResponse.ok) {
      console.error('❌ Erreur connexion OneSignal:', testResult)
      return new Response(JSON.stringify({
        error: 'Impossible de se connecter à OneSignal',
        details: testResult,
        status: testResponse.status
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Vérifier les utilisateurs enregistrés
    const playersResponse = await fetch(`https://onesignal.com/api/v1/players?app_id=${oneSignalAppId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${oneSignalApiKey}`,
        'Content-Type': 'application/json'
      }
    })

    const playersResult = await playersResponse.json()
    console.log('Utilisateurs OneSignal:', playersResult)

    return new Response(JSON.stringify({
      success: true,
      message: 'Configuration OneSignal vérifiée',
      app_info: testResult,
      users_count: playersResult.total_count || 0,
      users: playersResult.players || [],
      api_key_configured: true,
      app_id_configured: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erreur dans check-onesignal-config:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Erreur de vérification OneSignal',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
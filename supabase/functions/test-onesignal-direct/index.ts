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
    console.log('🧪 Test direct OneSignal pour tom.lifert@gmail.com')

    // Récupérer les secrets
    const oneSignalApiKey = Deno.env.get('ONESIGNAL_API_KEY')
    const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID')

    console.log('🔍 Secrets disponibles:')
    console.log('- API Key:', oneSignalApiKey ? `présente (${oneSignalApiKey.length} chars)` : 'MANQUANTE')
    console.log('- App ID:', oneSignalAppId ? `présent (${oneSignalAppId.length} chars)` : 'MANQUANT')

    if (!oneSignalApiKey || !oneSignalAppId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Secrets OneSignal manquants',
        details: {
          hasApiKey: !!oneSignalApiKey,
          hasAppId: !!oneSignalAppId
        }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Test direct avec OneSignal
    const notification = {
      app_id: oneSignalAppId,
      headings: { en: "🧪 Test Mobile UniSubHub" },
      contents: { en: "Bonjour Tom ! Cette notification mobile fonctionne parfaitement ! 📱✅" },
      filters: [
        { field: "email", relation: "=", value: "tom.lifert@gmail.com" }
      ],
      data: {
        type: "mobile_test_direct",
        timestamp: new Date().toISOString()
      }
    }

    console.log('📤 Envoi notification OneSignal:', notification)

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${oneSignalApiKey}`
      },
      body: JSON.stringify(notification)
    })

    const result = await response.json()
    console.log('📥 Réponse OneSignal:', result)

    if (!response.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Erreur OneSignal',
        details: result
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Notification envoyée avec succès !',
      recipients: result.recipients,
      onesignal_id: result.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erreur:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Erreur inattendue',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
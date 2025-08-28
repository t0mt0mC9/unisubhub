import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushNotificationRequest {
  userId?: string
  title: string
  message: string
  data?: Record<string, any>
  url?: string
  included_segments?: string[]
  filters?: Array<{field: string, relation: string, value: string}>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, title, message, data, url, included_segments, filters } = await req.json() as PushNotificationRequest

    // Vérifier les paramètres requis
    if (!title || !message) {
      return new Response(
        JSON.stringify({ error: 'title et message sont requis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Si on utilise included_segments, pas besoin de vérifier un utilisateur spécifique
    if (!included_segments && userId) {
      // Vérifier que l'utilisateur existe et récupérer ses préférences de notification
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('id, email')
        .eq('id', userId)
        .single()

      if (profileError || !profile) {
        console.error('Utilisateur non trouvé:', profileError)
        return new Response(
          JSON.stringify({ error: 'Utilisateur non trouvé' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Vérifier les paramètres de notification
      const { data: notificationSettings } = await supabaseClient
        .from('notification_settings')
        .select('push_notifications')
        .eq('user_id', userId)
        .single()

      if (notificationSettings && !notificationSettings.push_notifications) {
        console.log('Notifications push désactivées pour l\'utilisateur:', userId)
        return new Response(
          JSON.stringify({ message: 'Notifications push désactivées pour cet utilisateur' }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Créer la notification OneSignal
    const oneSignalApiKey = Deno.env.get('ONESIGNAL_API_KEY')
    const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID')

    console.log('🔍 Vérification des secrets OneSignal:')
    console.log('API Key présente:', !!oneSignalApiKey)
    console.log('App ID présent:', !!oneSignalAppId)
    console.log('API Key longueur:', oneSignalApiKey ? oneSignalApiKey.length : 0)
    console.log('App ID longueur:', oneSignalAppId ? oneSignalAppId.length : 0)
    console.log('App ID value:', oneSignalAppId || 'UNDEFINED')

    // Fallback avec l'App ID hardcodé si le secret n'est pas disponible
    const finalAppId = oneSignalAppId || 'e1e3a34f-c681-49ec-9c03-51c04792d448'
    
    if (!oneSignalApiKey) {
      console.error('❌ OneSignal API key manquant')
      return new Response(
        JSON.stringify({ 
          error: 'Configuration OneSignal manquante - API Key',
          details: {
            hasApiKey: !!oneSignalApiKey,
            hasAppId: !!oneSignalAppId,
            usingFallbackAppId: !oneSignalAppId
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Préparer le payload OneSignal
    const oneSignalPayload: any = {
      app_id: finalAppId,
      headings: { en: title },
      contents: { en: message },
      data: data || {},
      url: url || undefined,
      // Configuration pour mobile
      android_channel_id: "unisubhub-notifications",
      ios_badgeType: "Increase",
      ios_badgeCount: 1
    }

    // Utiliser included_segments, filters ou user_id selon le cas
    if (included_segments) {
      oneSignalPayload.included_segments = included_segments
    } else if (filters) {
      oneSignalPayload.filters = filters
    } else if (userId) {
      oneSignalPayload.filters = [
        { field: "tag", relation: "=", key: "user_id", value: userId }
      ]
    }

    // Envoyer la notification via OneSignal
    const oneSignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${oneSignalApiKey}`
      },
      body: JSON.stringify(oneSignalPayload)
    })

    const oneSignalResult = await oneSignalResponse.json()

    if (!oneSignalResponse.ok) {
      console.error('Erreur OneSignal:', oneSignalResult)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'envoi de la notification', details: oneSignalResult }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Enregistrer la notification dans la base de données
    const { error: insertError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'push',
        title: title,
        content: message,
        data: {
          onesignal_id: oneSignalResult.id,
          recipients: oneSignalResult.recipients,
          ...data
        }
      })

    if (insertError) {
      console.error('Erreur lors de l\'enregistrement de la notification:', insertError)
    }

    console.log('Notification push envoyée avec succès:', oneSignalResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        onesignal_id: oneSignalResult.id,
        recipients: oneSignalResult.recipients 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erreur dans l\'edge function:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
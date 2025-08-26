import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

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

    const { userId, offers } = await req.json();

    if (!userId || !offers || !Array.isArray(offers)) {
      throw new Error('Missing userId or offers array');
    }

    console.log(`Processing offer notifications for user ${userId} with ${offers.length} offers`);

    // Vérifier les préférences de notification de l'utilisateur
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
    
    if (userError || !user) {
      throw new Error('User not found');
    }

    // Pour l'instant, on assume que les notifications push sont activées
    // TODO: implémenter la vérification des préférences depuis localStorage/base
    const shouldSendNotifications = true;

    if (!shouldSendNotifications) {
      console.log(`User ${user.email} has disabled offer notifications`);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Notifications disabled for user' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const notifications = [];

    for (const offer of offers) {
      try {
        // Créer une notification push web (Web Push API)
        const notificationPayload = {
          title: '🎉 Nouvelle offre correspondante !',
          body: `${offer.title} - ${offer.price}`,
          icon: '/logo.png',
          badge: '/logo.png',
          data: {
            url: offer.url,
            offerId: offer.id,
            type: 'dealabs_offer'
          },
          actions: [
            {
              action: 'view',
              title: 'Voir l\'offre',
              icon: '/icons/view.png'
            },
            {
              action: 'dismiss',
              title: 'Ignorer',
              icon: '/icons/dismiss.png'
            }
          ]
        };

        // Sauvegarder la notification en base pour affichage dans l'app
        const { data: notification, error: notifError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'dealabs_offer',
            title: notificationPayload.title,
            content: notificationPayload.body,
            data: notificationPayload.data,
            is_read: false,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (notifError) {
          console.error('Error saving notification:', notifError);
          continue;
        }

        notifications.push({
          notification_id: notification.id,
          offer_id: offer.id,
          offer_title: offer.title,
          status: 'created'
        });

        console.log(`Notification created for offer: ${offer.title}`);

      } catch (error) {
        console.error(`Error processing offer ${offer.id}:`, error);
        notifications.push({
          offer_id: offer.id,
          offer_title: offer.title,
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      user_id: userId,
      processed: notifications.length,
      notifications
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in offer-notification function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
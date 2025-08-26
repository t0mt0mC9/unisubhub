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

    const { userEmail, subscriptionName, renewalDate, testMessage } = await req.json();

    if (!userEmail) {
      throw new Error('userEmail is required');
    }

    console.log(`Sending test notification to: ${userEmail}`);

    // Récupérer l'utilisateur par email
    const { data: { users }, error: usersError } = await supabaseClient.auth.admin.listUsers();
    
    if (usersError) {
      throw usersError;
    }

    const user = users.find(u => u.email === userEmail);
    
    if (!user) {
      throw new Error(`User with email ${userEmail} not found`);
    }

    console.log(`Found user: ${user.id}`);

    // Préparer le message de notification
    const defaultMessage = subscriptionName && renewalDate 
      ? `🔔 Rappel : ${subscriptionName} se renouvelle demain (${new Date(renewalDate).toLocaleDateString('fr-FR')})`
      : testMessage || '🔔 Notification de test UniSubHub';

    // Créer la notification dans la base de données
    const { data: notification, error: notifError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'renewal_reminder',
        title: '🔔 Test de notification',
        content: defaultMessage,
        data: {
          subscription_name: subscriptionName || 'Netflix',
          renewal_date: renewalDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          test: true
        },
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (notifError) {
      console.error('Error creating notification:', notifError);
      throw notifError;
    }

    console.log(`Test notification created: ${notification.id}`);

    // Simuler l'envoi de la notification push
    // En production, ceci utiliserait un service comme Firebase Cloud Messaging ou Apple Push Notification Service
    const pushNotificationPayload = {
      title: '🔔 UniSubHub',
      body: defaultMessage,
      icon: '/logo.png',
      badge: '/logo.png',
      data: {
        notification_id: notification.id,
        type: 'renewal_reminder',
        subscription_name: subscriptionName || 'Netflix',
        renewal_date: renewalDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      actions: [
        {
          action: 'view',
          title: 'Voir',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: 'Ignorer',
          icon: '/icons/dismiss.png'
        }
      ]
    };

    console.log('Push notification payload:', pushNotificationPayload);

    // Log pour simulation (en production, ceci enverrait vraiment la notification)
    console.log(`📱 PUSH NOTIFICATION SENT TO ${userEmail}:`);
    console.log(`Title: ${pushNotificationPayload.title}`);
    console.log(`Body: ${pushNotificationPayload.body}`);
    console.log(`Data:`, pushNotificationPayload.data);

    return new Response(JSON.stringify({
      success: true,
      message: 'Test notification sent successfully',
      user_email: userEmail,
      user_id: user.id,
      notification_id: notification.id,
      push_payload: pushNotificationPayload,
      note: 'This is a test notification. In production, this would trigger an actual push notification to the user\'s device.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in test-notification function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
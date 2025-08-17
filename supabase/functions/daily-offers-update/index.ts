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
    console.log('Starting daily offers update...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Appeler l'API Dealabs pour récupérer les dernières offres
    const response = await fetch('https://rhmxohcqyyyglgmtnioc.supabase.co/functions/v1/dealabs-offers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action: 'get_offers',
        userSubscriptions: []
      })
    });

    const offersData = await response.json();
    console.log(`Retrieved ${offersData.offers?.length || 0} offers`);

    // Sauvegarder les offres dans une table cache (optionnel)
    if (offersData.offers && offersData.offers.length > 0) {
      // Nettoyer les anciennes offres
      const { error: deleteError } = await supabaseClient
        .from('dealabs_offers_cache')
        .delete()
        .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (deleteError) {
        console.log('Warning: Could not delete old offers:', deleteError);
      }

      // Insérer les nouvelles offres
      const { error: insertError } = await supabaseClient
        .from('dealabs_offers_cache')
        .insert(
          offersData.offers.map((offer: any) => ({
            deal_id: offer.id,
            title: offer.title,
            description: offer.description,
            price: offer.price,
            original_price: offer.originalPrice,
            discount: offer.discount,
            merchant: offer.merchant,
            category: offer.category,
            url: offer.url,
            votes: offer.votes,
            temperature: offer.temperature,
            expiry_date: offer.expiryDate,
            coupon_code: offer.couponCode,
            is_expired: offer.isExpired,
            created_at: new Date().toISOString()
          }))
        );

      if (insertError) {
        console.log('Warning: Could not cache offers:', insertError);
      } else {
        console.log('Successfully cached offers in database');
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Offers updated successfully',
      count: offersData.offers?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in daily-offers-update:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
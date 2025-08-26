import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting daily Dealabs offers update...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Fetch all Dealabs offers and update cache
    console.log('📥 Fetching fresh offers from Dealabs...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/dealabs-offers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': Deno.env.get('SUPABASE_ANON_KEY')!
      },
      body: JSON.stringify({
        action: 'refresh_cache'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh offers cache: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Daily offers update completed successfully');
    console.log(`📊 Updated ${result.offersCount || 0} offers in cache`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Daily offers update completed',
        offersUpdated: result.offersCount || 0,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('❌ Error in daily offers update:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
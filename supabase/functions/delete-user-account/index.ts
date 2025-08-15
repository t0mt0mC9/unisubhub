import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize regular client for user verification
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    console.log(`Deleting account for user: ${user.id} (${user.email})`);

    // Delete user data in the correct order (foreign key constraints)
    
    // 1. Delete user subscriptions
    const { error: subscriptionsError } = await supabaseAdmin
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id);

    if (subscriptionsError) {
      console.error('Error deleting subscriptions:', subscriptionsError);
      throw new Error('Failed to delete user subscriptions');
    }

    // 2. Delete user referrals
    const { error: referralsError } = await supabaseAdmin
      .from('referrals')
      .delete()
      .or(`referrer_user_id.eq.${user.id},referred_user_id.eq.${user.id}`);

    if (referralsError) {
      console.error('Error deleting referrals:', referralsError);
      throw new Error('Failed to delete user referrals');
    }

    // 3. Delete user subscribers record
    const { error: subscribersError } = await supabaseAdmin
      .from('subscribers')
      .delete()
      .eq('user_id', user.id);

    if (subscribersError) {
      console.error('Error deleting subscribers:', subscribersError);
      throw new Error('Failed to delete user subscription record');
    }

    // 4. Delete user profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      throw new Error('Failed to delete user profile');
    }

    // 5. Finally delete the auth user (this must be done last)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError);
      throw new Error('Failed to delete user authentication record');
    }

    console.log(`Successfully deleted account for user: ${user.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Account successfully deleted' 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in delete-user-account function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
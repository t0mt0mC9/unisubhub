
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use service role key to bypass RLS for writes
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    
    // Try to get user data - if it fails, let client handle reauth
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      logStep("Auth error - session invalid", { error: userError?.message });
      return new Response(JSON.stringify({ 
        error: "Session expired",
        needsReauth: true,
        subscribed: false,
        trial_active: false,
        subscription_tier: null,
        subscription_type: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user already exists in subscribers table by user_id first, then by email
    let existingSubscriber = null;
    
    // First try to find by user_id (most reliable)
    const { data: subscriberByUserId } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    if (subscriberByUserId) {
      existingSubscriber = subscriberByUserId;
    } else {
      // Fallback to email lookup
      const { data: subscriberByEmail } = await supabaseClient
        .from("subscribers")
        .select("*")
        .eq("email", user.email)
        .single();
      
      existingSubscriber = subscriberByEmail;
    }

    logStep("Existing subscriber check", { 
      existingSubscriber,
      searchedByUserId: user.id,
      searchedByEmail: user.email 
    });

    // If user has a lifetime subscription in the database, preserve it
    if (existingSubscriber?.subscription_type === 'lifetime' && existingSubscriber?.subscribed) {
      logStep("Found existing lifetime subscription in database", { 
        tier: existingSubscriber.subscription_tier,
        type: existingSubscriber.subscription_type
      });
      
      return new Response(JSON.stringify({
        subscribed: true,
        subscription_tier: existingSubscriber.subscription_tier,
        subscription_type: existingSubscriber.subscription_type,
        subscription_end: existingSubscriber.subscription_end,
        trial_active: false,
        trial_days_remaining: 0,
        trial_end_date: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // RÈGLE D'ACTIVATION: 14 jours d'accès gratuit pour les nouveaux comptes
    // Récupérer la date de début d'essai depuis le profil
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("trial_start_date")
      .eq("id", user.id)
      .single();
    
    const now = new Date();
    const trialStartDate = profile?.trial_start_date ? new Date(profile.trial_start_date) : new Date(user.created_at);
    const trialEndDate = new Date(trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 jours après début d'essai
    const isTrialActive = now < trialEndDate;
    const trialDaysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    logStep("Trial period calculation", { 
      now: now.toISOString(),
      trialStartDate: trialStartDate.toISOString(), 
      trialEndDate: trialEndDate.toISOString(),
      timeDiffMs: trialEndDate.getTime() - now.getTime(),
      isTrialActive,
      trialDaysRemaining,
      accountAge: Math.floor((now.getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24))
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check for Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    let hasActiveSub = false;
    let subscriptionTier = null;
    let subscriptionType = null;
    let subscriptionEnd = null;
    let customerId = null;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });

      // Check for active subscriptions (monthly)
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      
      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        subscriptionType = 'monthly';
        subscriptionTier = 'Premium';
        hasActiveSub = true;
        logStep("Active monthly subscription found", { 
          subscriptionId: subscription.id, 
          endDate: subscriptionEnd 
        });
      } else {
        // Check for lifetime payment
        const payments = await stripe.paymentIntents.list({
          customer: customerId,
          limit: 10,
        });
        
        const lifetimePayment = payments.data.find(payment => 
          payment.status === 'succeeded' && 
          payment.amount >= 9900 && 
          payment.metadata?.plan_type === 'lifetime'
        );
        
        if (lifetimePayment) {
          hasActiveSub = true;
          subscriptionType = 'lifetime';
          subscriptionTier = 'Premium';
          subscriptionEnd = null;
          logStep("Lifetime subscription found", { 
            paymentId: lifetimePayment.id,
            amount: lifetimePayment.amount 
          });
        }
      }
    }

    // RÈGLE D'ACTIVATION FINALE:
    // - subscribed = true si abonnement payant actif (Stripe ou RevenueCat)
    // - trial_active = true si compte < 14 jours
    // - Accès accordé si subscribed OU trial_active
    let finalSubscribed = hasActiveSub;
    let finalTier = subscriptionTier || (isTrialActive ? 'Trial' : null);
    let finalType = subscriptionType || (isTrialActive ? 'trial' : null);
    let finalEnd = subscriptionEnd || (isTrialActive ? trialEndDate.toISOString() : null);

    // Update database
    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: finalSubscribed,
      subscription_tier: finalTier,
      subscription_type: finalType,
      subscription_end: finalEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Updated database with subscription info", { 
      subscribed: finalSubscribed, 
      subscriptionTier: finalTier,
      subscriptionType: finalType,
      isTrialActive,
      trialDaysRemaining,
      hasAccess: finalSubscribed || isTrialActive,
      shouldBlock: !finalSubscribed && !isTrialActive
    });
    
    return new Response(JSON.stringify({
      subscribed: finalSubscribed,
      subscription_tier: finalTier,
      subscription_type: finalType,
      subscription_end: finalEnd,
      trial_active: isTrialActive,
      trial_days_remaining: trialDaysRemaining,
      trial_end_date: trialEndDate.toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: errorMessage,
      // En cas d'erreur, donner un accès temporaire pour éviter de bloquer les nouveaux utilisateurs
      subscribed: false,
      trial_active: true,
      trial_days_remaining: 14,
      subscription_tier: 'Trial',
      subscription_type: 'trial'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

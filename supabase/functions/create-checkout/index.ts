import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { planType } = await req.json();
    if (!planType || !['monthly', 'lifetime'].includes(planType)) {
      throw new Error("Invalid plan type. Must be 'monthly' or 'lifetime'");
    }

    // Debug: Check if Stripe key is available
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    logStep("Stripe key check", { hasKey: !!stripeKey, keyLength: stripeKey?.length });
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email, planType });

    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2023-10-16" 
    });
    logStep("Stripe initialized successfully");

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found, will create new one in checkout");
    }

    // Configure plan details
    const planConfig = planType === 'monthly' 
      ? {
          price: 500, // 5€ in cents
          interval: 'month' as const,
          mode: 'subscription' as const,
          name: 'Abonnement Mensuel Premium'
        }
      : {
          price: 9900, // 99€ in cents
          interval: null,
          mode: 'payment' as const,
          name: 'Abonnement à Vie Premium'
        };

    logStep("Plan configuration", planConfig);

    // Create checkout session
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { 
              name: planConfig.name,
              description: planType === 'monthly' 
                ? 'Accès complet à UniSubHub avec toutes les fonctionnalités premium'
                : 'Accès à vie à UniSubHub avec toutes les fonctionnalités premium'
            },
            unit_amount: planConfig.price,
            ...(planType === 'monthly' && {
              recurring: { interval: planConfig.interval }
            }),
          },
          quantity: 1,
        },
      ],
      mode: planConfig.mode,
      success_url: `${req.headers.get("origin")}/success?plan=${planType}`,
      cancel_url: `${req.headers.get("origin")}/cancel`,
      metadata: {
        user_id: user.id,
        plan_type: planType,
      }
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
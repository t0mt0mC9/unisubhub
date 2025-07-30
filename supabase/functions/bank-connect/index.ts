import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BANK-CONNECT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const truelayerClientId = Deno.env.get("TRUELAYER_CLIENT_ID");
    const truelayerClientSecret = Deno.env.get("TRUELAYER_CLIENT_SECRET");
    
    if (!truelayerClientId || !truelayerClientSecret) {
      throw new Error("TrueLayer credentials not configured");
    }

    const { action, body } = await req.json();
    logStep("Request received", { action });

    // Authentification utilisateur
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    if (action === "get_auth_url") {
      // Générer l'URL d'autorisation TrueLayer pour les banques européennes
      const redirectUri = `${req.headers.get("origin")}/bank-callback`;
      const scope = "accounts transactions";
      const state = `user_${user.id}_${Date.now()}`;
      
      // Utiliser les banques européennes au lieu de UK seulement
      const authUrl = `https://auth.truelayer-sandbox.com/?` +
        `response_type=code&` +
        `client_id=${truelayerClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${state}&` +
        `providers=es-santander-sandbox,fr-ca-particuliers-sandbox,fr-bnp-paribas-sandbox,demo-bank`;

      logStep("Generated auth URL for European banks", { authUrl, state });

      return new Response(JSON.stringify({ auth_url: authUrl, state }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (action === "exchange_code") {
      const { code, state } = body;
      
      // Échanger le code contre un token d'accès
      const tokenResponse = await fetch("https://auth.truelayer-sandbox.com/connect/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: truelayerClientId,
          client_secret: truelayerClientSecret,
          redirect_uri: `${req.headers.get("origin")}/bank-callback`,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${await tokenResponse.text()}`);
      }

      const tokenData = await tokenResponse.json();
      logStep("Token exchange successful", { access_token: "***" });

      // Récupérer les comptes
      const accountsResponse = await fetch("https://api.truelayer-sandbox.com/data/v1/accounts", {
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
        },
      });

      if (!accountsResponse.ok) {
        throw new Error(`Accounts fetch failed: ${await accountsResponse.text()}`);
      }

      const accountsData = await accountsResponse.json();
      logStep("Accounts retrieved", { count: accountsData.results?.length });

      // Récupérer les transactions pour chaque compte
      const allTransactions = [];
      
      for (const account of accountsData.results || []) {
        try {
          const transactionsResponse = await fetch(
            `https://api.truelayer-sandbox.com/data/v1/accounts/${account.account_id}/transactions?from=2024-01-01`,
            {
              headers: {
                "Authorization": `Bearer ${tokenData.access_token}`,
              },
            }
          );

          if (transactionsResponse.ok) {
            const transactionsData = await transactionsResponse.json();
            allTransactions.push(...(transactionsData.results || []));
          }
        } catch (error) {
          logStep("Transaction fetch error for account", { account_id: account.account_id, error });
        }
      }

      logStep("All transactions retrieved", { count: allTransactions.length });

      // Analyser les transactions pour détecter les abonnements
      const detectedSubscriptions = analyzeTransactionsForSubscriptions(allTransactions);
      
      logStep("Subscriptions detected", { count: detectedSubscriptions.length });

      return new Response(JSON.stringify({ 
        subscriptions: detectedSubscriptions,
        accounts_count: accountsData.results?.length || 0,
        transactions_count: allTransactions.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    throw new Error("Invalid action");

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

function analyzeTransactionsForSubscriptions(transactions: any[]) {
  const subscriptionKeywords = [
    { keywords: ["netflix"], name: "Netflix", category: "Streaming" },
    { keywords: ["spotify"], name: "Spotify", category: "Musique" },
    { keywords: ["adobe"], name: "Adobe Creative Cloud", category: "Design & Créativité" },
    { keywords: ["microsoft", "office365"], name: "Microsoft Office", category: "Productivité" },
    { keywords: ["amazon prime"], name: "Amazon Prime", category: "Streaming" },
    { keywords: ["disney"], name: "Disney+", category: "Streaming" },
    { keywords: ["youtube premium"], name: "YouTube Premium", category: "Streaming" },
    { keywords: ["dropbox"], name: "Dropbox", category: "Stockage" },
    { keywords: ["zoom"], name: "Zoom", category: "Communication" },
    { keywords: ["slack"], name: "Slack", category: "Communication" },
  ];

  const detectedSubscriptions = [];
  const transactionGroups = new Map();

  // Grouper les transactions par commerçant
  for (const transaction of transactions) {
    if (transaction.amount < 0) { // Débit seulement
      const merchant = transaction.merchant_name?.toLowerCase() || transaction.description?.toLowerCase() || "";
      
      if (!transactionGroups.has(merchant)) {
        transactionGroups.set(merchant, []);
      }
      transactionGroups.get(merchant).push(transaction);
    }
  }

  // Analyser chaque groupe pour détecter des patterns récurrents
  for (const [merchant, merchantTransactions] of transactionGroups) {
    if (merchantTransactions.length >= 2) { // Au moins 2 transactions
      // Vérifier si c'est un service connu
      const matchingService = subscriptionKeywords.find(service => 
        service.keywords.some(keyword => merchant.includes(keyword))
      );

      if (matchingService) {
        // Calculer la récurrence et le montant moyen
        const amounts = merchantTransactions.map(t => Math.abs(t.amount));
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        
        // Vérifier la régularité (montants similaires)
        const amountVariation = Math.max(...amounts) - Math.min(...amounts);
        if (amountVariation <= avgAmount * 0.1) { // Variation de moins de 10%
          // Calculer l'intervalle entre transactions
          const dates = merchantTransactions.map(t => new Date(t.timestamp)).sort();
          const intervals = [];
          for (let i = 1; i < dates.length; i++) {
            const daysDiff = (dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24);
            intervals.push(daysDiff);
          }
          
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          let billingCycle = "monthly";
          
          if (avgInterval >= 350 && avgInterval <= 380) {
            billingCycle = "yearly";
          } else if (avgInterval >= 25 && avgInterval <= 35) {
            billingCycle = "monthly";
          } else if (avgInterval >= 6 && avgInterval <= 8) {
            billingCycle = "weekly";
          }

          detectedSubscriptions.push({
            id: `detected_${detectedSubscriptions.length + 1}`,
            name: matchingService.name,
            price: Math.round(avgAmount * 100) / 100,
            currency: "EUR",
            billing_cycle: billingCycle,
            category: matchingService.category,
            last_transaction_date: dates[dates.length - 1].toISOString().split('T')[0],
            confidence: Math.min(95, 70 + merchantTransactions.length * 5) // Plus de transactions = plus de confiance
          });
        }
      }
    }
  }

  return detectedSubscriptions;
}
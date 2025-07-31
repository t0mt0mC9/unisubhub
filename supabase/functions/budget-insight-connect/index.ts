import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DetectedSubscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_cycle: string;
  category: string;
  last_transaction_date: string;
  confidence: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bank_id, username, password } = await req.json();
    
    console.log('Budget Insight connection request:', { bank_id, username: username?.substring(0, 3) + '***' });

    // Configuration Budget Insight (Powens)
    const budgetInsightDomain = Deno.env.get('BUDGET_INSIGHT_DOMAIN');
    const budgetInsightClientId = Deno.env.get('BUDGET_INSIGHT_CLIENT_ID');
    const budgetInsightClientSecret = Deno.env.get('BUDGET_INSIGHT_CLIENT_SECRET');

    console.log('Environment check:', {
      domain: budgetInsightDomain ? 'SET' : 'MISSING',
      clientId: budgetInsightClientId ? 'SET' : 'MISSING',
      clientSecret: budgetInsightClientSecret ? 'SET' : 'MISSING'
    });

    if (!budgetInsightDomain || !budgetInsightClientId || !budgetInsightClientSecret) {
      const missingVars = [];
      if (!budgetInsightDomain) missingVars.push('BUDGET_INSIGHT_DOMAIN');
      if (!budgetInsightClientId) missingVars.push('BUDGET_INSIGHT_CLIENT_ID');
      if (!budgetInsightClientSecret) missingVars.push('BUDGET_INSIGHT_CLIENT_SECRET');
      
      throw new Error(`Variables d'environnement manquantes: ${missingVars.join(', ')}`);
    }

    // 1. Authentification avec Budget Insight
    const authResponse = await fetch(`https://${budgetInsightDomain}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: budgetInsightClientId,
        client_secret: budgetInsightClientSecret,
      }),
    });

    if (!authResponse.ok) {
      throw new Error(`Erreur d'authentification Budget Insight: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    console.log('Budget Insight authentication successful');

    // 2. Créer un utilisateur temporaire
    const createUserResponse = await fetch(`https://${budgetInsightDomain}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login: `temp_user_${Date.now()}`,
      }),
    });

    if (!createUserResponse.ok) {
      throw new Error(`Erreur création utilisateur: ${createUserResponse.status}`);
    }

    const userData = await createUserResponse.json();
    const userId = userData.id;

    console.log('Budget Insight user created:', userId);

    // 3. Ajouter une connexion bancaire
    const addConnectionResponse = await fetch(`https://${budgetInsightDomain}/users/${userId}/connections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_connector: getBudgetInsightConnectorId(bank_id),
        login: username,
        password: password,
      }),
    });

    if (!addConnectionResponse.ok) {
      const errorData = await addConnectionResponse.text();
      console.error('Budget Insight connection error:', errorData);
      throw new Error(`Erreur de connexion bancaire: ${addConnectionResponse.status}`);
    }

    const connectionData = await addConnectionResponse.json();
    console.log('Budget Insight connection created:', connectionData.id);

    // 4. Attendre la synchronisation (polling)
    let attempts = 0;
    const maxAttempts = 20;
    let syncComplete = false;

    while (attempts < maxAttempts && !syncComplete) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes
      
      const statusResponse = await fetch(`https://${budgetInsightDomain}/users/${userId}/connections/${connectionData.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.state === 0) { // 0 = synchronisation terminée
          syncComplete = true;
        }
      }
      
      attempts++;
    }

    if (!syncComplete) {
      console.log('Synchronisation timeout, proceeding with available data');
    }

    // 5. Récupérer les transactions
    const transactionsResponse = await fetch(`https://${budgetInsightDomain}/users/${userId}/transactions?limit=500`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    let detectedSubscriptions: DetectedSubscription[] = [];

    if (transactionsResponse.ok) {
      const transactionsData = await transactionsResponse.json();
      console.log(`Retrieved ${transactionsData.transactions?.length || 0} transactions`);
      
      // 6. Analyser les transactions pour détecter les abonnements
      if (transactionsData.transactions && transactionsData.transactions.length > 0) {
        detectedSubscriptions = analyzeTransactionsForSubscriptions(transactionsData.transactions);
      }
    }

    // 7. Nettoyer - supprimer l'utilisateur temporaire
    try {
      await fetch(`https://${budgetInsightDomain}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      console.log('Temporary user cleaned up');
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    return new Response(JSON.stringify({
      success: true,
      detected_subscriptions: detectedSubscriptions,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Budget Insight connection error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getBudgetInsightConnectorId(bankId: string): number {
  // Mappage des banques vers les IDs de connecteurs Budget Insight
  const bankMapping: { [key: string]: number } = {
    'bnp': 3, // BNP Paribas
    'credit_agricole': 1, // Crédit Agricole
    'societe_generale': 5, // Société Générale
    'lcl': 2, // LCL
    'credit_mutuel': 4, // Crédit Mutuel
    'la_banque_postale': 6, // La Banque Postale
    'caisse_epargne': 7, // Caisse d'Épargne
    'boursorama': 40, // Boursorama
    'fortuneo': 41, // Fortuneo
    'ing': 42, // ING Direct
    'hello_bank': 43, // Hello bank!
    'revolut': 44, // Revolut
    'n26': 45, // N26
  };

  return bankMapping[bankId] || 999; // Connecteur de test par défaut
}

function analyzeTransactionsForSubscriptions(transactions: any[]): DetectedSubscription[] {
  const subscriptions: DetectedSubscription[] = [];
  const merchantMap = new Map<string, any[]>();

  // Grouper les transactions par commerçant
  for (const transaction of transactions) {
    if (transaction.value < 0) { // Seules les dépenses
      const merchant = cleanMerchantName(transaction.simplified_wording || transaction.wording || '');
      if (merchant) {
        if (!merchantMap.has(merchant)) {
          merchantMap.set(merchant, []);
        }
        merchantMap.get(merchant)!.push(transaction);
      }
    }
  }

  // Analyser chaque commerçant pour détecter les récurrences
  for (const [merchant, merchantTransactions] of merchantMap) {
    if (merchantTransactions.length >= 2) { // Au moins 2 transactions
      const amounts = merchantTransactions.map(t => Math.abs(t.value));
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      
      // Vérifier si les montants sont similaires (variance < 20%)
      const variance = amounts.reduce((acc, amount) => acc + Math.pow(amount - avgAmount, 2), 0) / amounts.length;
      const stdDev = Math.sqrt(variance);
      const coefficient = stdDev / avgAmount;

      if (coefficient < 0.2 && isSubscriptionKeyword(merchant)) { // Variance faible + mot-clé
        const confidence = Math.max(60, Math.min(95, 95 - (coefficient * 100)));
        
        subscriptions.push({
          id: `bi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: formatSubscriptionName(merchant),
          price: parseFloat(avgAmount.toFixed(2)),
          currency: 'EUR',
          billing_cycle: determineBillingCycle(merchantTransactions),
          category: categorizeSubscription(merchant),
          last_transaction_date: merchantTransactions[0].date,
          confidence: Math.round(confidence),
        });
      }
    }
  }

  return subscriptions.slice(0, 10); // Limiter à 10 abonnements
}

function cleanMerchantName(wording: string): string {
  return wording
    .replace(/\d{2}\/\d{2}\/\d{4}/g, '') // Supprimer les dates
    .replace(/\d{2}\/\d{2}/g, '')
    .replace(/CB\s*/g, '') // Supprimer CB
    .replace(/\*+/g, '') // Supprimer les astérisques
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .trim()
    .toUpperCase();
}

function isSubscriptionKeyword(merchant: string): boolean {
  const keywords = [
    'NETFLIX', 'SPOTIFY', 'AMAZON', 'APPLE', 'GOOGLE', 'MICROSOFT',
    'ADOBE', 'CANAL', 'DEEZER', 'YOUTUBE', 'LINKEDIN', 'DROPBOX',
    'OFFICE', 'ICLOUD', 'DISNEY', 'ABONNEMENT', 'SUBSCRIPTION'
  ];
  
  return keywords.some(keyword => merchant.includes(keyword));
}

function formatSubscriptionName(merchant: string): string {
  const nameMap: { [key: string]: string } = {
    'NETFLIX': 'Netflix',
    'SPOTIFY': 'Spotify Premium',
    'AMAZON PRIME': 'Amazon Prime',
    'APPLE': 'Apple iCloud',
    'GOOGLE': 'Google One',
    'ADOBE': 'Adobe Creative Cloud',
    'CANAL': 'Canal+',
    'DEEZER': 'Deezer Premium',
    'YOUTUBE': 'YouTube Premium',
    'LINKEDIN': 'LinkedIn Premium',
    'MICROSOFT': 'Microsoft 365',
  };

  for (const [key, value] of Object.entries(nameMap)) {
    if (merchant.includes(key)) {
      return value;
    }
  }

  return merchant.charAt(0) + merchant.slice(1).toLowerCase();
}

function categorizeSubscription(merchant: string): string {
  if (merchant.includes('NETFLIX') || merchant.includes('CANAL') || merchant.includes('DISNEY')) {
    return 'Streaming';
  }
  if (merchant.includes('SPOTIFY') || merchant.includes('DEEZER') || merchant.includes('YOUTUBE')) {
    return 'Musique';
  }
  if (merchant.includes('ADOBE') || merchant.includes('MICROSOFT') || merchant.includes('GOOGLE')) {
    return 'Productivité';
  }
  if (merchant.includes('LINKEDIN')) {
    return 'Professionnel';
  }
  return 'Autres';
}

function determineBillingCycle(transactions: any[]): string {
  if (transactions.length < 2) return 'monthly';
  
  // Calculer l'intervalle moyen entre les transactions
  const dates = transactions.map(t => new Date(t.date)).sort();
  const intervals = [];
  
  for (let i = 1; i < dates.length; i++) {
    const diffDays = (dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24);
    intervals.push(diffDays);
  }
  
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  
  if (avgInterval < 10) return 'weekly';
  if (avgInterval < 40) return 'monthly';
  return 'yearly';
}
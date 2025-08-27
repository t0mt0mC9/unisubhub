import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user's AI insights consent
    const { data: profile } = await supabase
      .from('profiles')
      .select('ai_insights_consent')
      .eq('id', userData.user.id)
      .single();

    const { subscriptions } = await req.json();

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ recommendations: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Récupérer les offres Dealabs pour comparaison
    const { data: dealabsOffers } = await supabase
      .from('dealabs_offers_cache')
      .select('*')
      .eq('is_expired', false)
      .order('temperature', { ascending: false })
      .limit(20);

    // Préparer les données pour Perplexity
    const subscriptionsList = subscriptions.map((sub: any) => 
      `${sub.name} (${sub.price}€/${sub.billing_cycle}, catégorie: ${sub.category})`
    ).join(', ');

    const dealsContext = dealabsOffers?.slice(0, 10).map(deal => 
      `${deal.title} - ${deal.price || 'Prix variable'} (${deal.merchant})`
    ).join(', ') || '';

    const prompt = `Analysez les abonnements suivants et fournissez des recommandations d'optimisation spécifiques en français selon ces critères STRICTS:

Abonnements utilisateur: ${subscriptionsList}
Offres du marché: ${dealsContext}

CRITÈRES OBLIGATOIRES pour inclure une recommandation:
1. Recommandation "duplicate" : SEULEMENT si plus de 2 abonnements dans la même catégorie
2. Recommandation "cost" : SEULEMENT si le prix mensuel de l'abonnement est supérieur à 30€ 
3. Recommandation "billing" : SEULEMENT si il existe des abonnements en facturation annuelle ET des abonnements en facturation mensuelle

Ne générez une recommandation QUE si les critères sont respectés. Si aucun critère n'est rempli, retournez un tableau vide.

Répondez uniquement avec un JSON valide dans ce format exact:
{
  "recommendations": [
    {
      "id": 1,
      "type": "cost",
      "title": "titre court",
      "description": "description brève",
      "impact": "Élevé",
      "details": "explication détaillée avec actions spécifiques",
      "potential_savings": "économies mensuelles estimées en euros"
    }
  ]
}

Types disponibles: cost, duplicate, billing, usage, alternative
Impact disponible: Élevé, Moyen, Faible

Soyez spécifique et actionnable. N'incluez QUE les recommandations qui respectent les critères stricts.`;

    // Generate recommendations based on user consent
    let recommendations = [];
    
    if (profile?.ai_insights_consent) {
      // Appel à Perplexity API only if user consented
      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert français en optimisation d abonnements. Réponds uniquement avec du JSON valide sans formatage markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1500,
        return_images: false,
        return_related_questions: false,
        frequency_penalty: 1
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error(`Perplexity API error ${perplexityResponse.status}:`, errorText);
      throw new Error(`Perplexity API error: ${perplexityResponse.status} - ${errorText}`);
    }

      const perplexityData = await perplexityResponse.json();

      const aiContent = perplexityData.choices[0].message.content;
      
      // Parse la réponse JSON
      try {
        const parsed = JSON.parse(aiContent.replace(/```json\n?|\n?```/g, ''));
        recommendations = parsed.recommendations || [];
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        
        // Fallback avec recommandations de base
        recommendations = generateFallbackRecommendations(subscriptions);
      }
    } else {
      // User hasn't consented to AI insights, use local fallback only
      recommendations = generateFallbackRecommendations(subscriptions);
    }

    // Ajouter des icônes et couleurs selon le type
    const enrichedRecommendations = recommendations.map((rec: any, index: number) => ({
      ...rec,
      id: index + 1,
      icon: getIconForType(rec.type),
      color: getColorForType(rec.type),
      bgColor: getBgColorForType(rec.type)
    }));

    console.log('Final recommendations:', enrichedRecommendations);

    return new Response(JSON.stringify({ 
      recommendations: enrichedRecommendations,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in dynamic-recommendations function:', error);
    
    // Fallback en cas d'erreur
    const fallbackRecommendations = generateFallbackRecommendations(
      await req.json().then(data => data.subscriptions).catch(() => [])
    );
    
    return new Response(JSON.stringify({ 
      recommendations: fallbackRecommendations,
      error: 'Fallback recommendations used'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getIconForType(type: string): string {
  switch (type) {
    case 'cost': return 'Euro';
    case 'duplicate': return 'Users';
    case 'billing': return 'Calendar';
    case 'usage': return 'Target';
    case 'alternative': return 'ArrowRightLeft';
    default: return 'Lightbulb';
  }
}

function getColorForType(type: string): string {
  switch (type) {
    case 'cost': return 'text-green-600';
    case 'duplicate': return 'text-orange-600';
    case 'billing': return 'text-blue-600';
    case 'usage': return 'text-purple-600';
    case 'alternative': return 'text-indigo-600';
    default: return 'text-gray-600';
  }
}

function getBgColorForType(type: string): string {
  switch (type) {
    case 'cost': return 'bg-green-100';
    case 'duplicate': return 'bg-orange-100';
    case 'billing': return 'bg-blue-100';
    case 'usage': return 'bg-purple-100';
    case 'alternative': return 'bg-indigo-100';
    default: return 'bg-gray-100';
  }
}

function generateFallbackRecommendations(subscriptions: any[]): any[] {
  if (!subscriptions || subscriptions.length === 0) return [];

  const recommendations = [];
  
  // Analyser les doublons (plus de 2 abonnements identiques)
  const categories = new Map();
  subscriptions.forEach(sub => {
    if (!categories.has(sub.category)) {
      categories.set(sub.category, []);
    }
    categories.get(sub.category).push(sub);
  });

  // Détecter les doublons seulement si plus de 2 abonnements dans la même catégorie
  const duplicates = Array.from(categories.entries()).filter(([_, subs]) => subs.length > 2);
  if (duplicates.length > 0) {
    const duplicateCategory = duplicates[0][0];
    const duplicateSubs = duplicates[0][1];
    const potentialSavings = Math.min(...duplicateSubs.map(s => s.price));
    
    recommendations.push({
      id: recommendations.length + 1,
      type: "duplicate",
      title: `Services en double détectés - ${duplicateCategory}`,
      description: `${duplicateSubs.length} abonnements ${duplicateCategory} actifs`,
      impact: "Élevé",
      details: `Vous avez ${duplicateSubs.map(s => s.name).join(', ')} dans la catégorie ${duplicateCategory}. Considérez n'en garder qu'un seul.`,
      potential_savings: `${potentialSavings}€`
    });
  }

  // Analyser les coûts élevés (supérieurs à 30€)
  const expensiveSubs = subscriptions.filter(sub => {
    const monthlyPrice = sub.billing_cycle === 'yearly' ? sub.price / 12 : 
                        sub.billing_cycle === 'weekly' ? sub.price * 4.33 : sub.price;
    return monthlyPrice > 30;
  });

  if (expensiveSubs.length > 0) {
    const mostExpensive = expensiveSubs.reduce((a, b) => {
      const priceA = a.billing_cycle === 'yearly' ? a.price / 12 : a.price;
      const priceB = b.billing_cycle === 'yearly' ? b.price / 12 : b.price;
      return priceA > priceB ? a : b;
    });
    
    recommendations.push({
      id: recommendations.length + 1,
      type: "cost",
      title: "Abonnement coûteux identifié",
      description: `${mostExpensive.name} représente un coût élevé`,
      impact: "Élevé",
      details: `${mostExpensive.name} coûte ${mostExpensive.price}€/${mostExpensive.billing_cycle}. Recherchez des alternatives moins chères ou négociez le tarif.`,
      potential_savings: `${Math.round(mostExpensive.price * 0.3)}€`
    });
  }

  // Optimisation facturation annuelle seulement si il y a des abonnements en facturation mensuelle
  const monthlyBilling = subscriptions.filter(sub => sub.billing_cycle === 'monthly');
  const hasYearlyOptions = subscriptions.some(sub => sub.billing_cycle === 'yearly');
  
  if (monthlyBilling.length > 0 && hasYearlyOptions) {
    const totalMonthly = subscriptions.reduce((sum, sub) => {
      const monthlyPrice = sub.billing_cycle === 'yearly' ? sub.price / 12 : 
                          sub.billing_cycle === 'weekly' ? sub.price * 4.33 : sub.price;
      return sum + monthlyPrice;
    }, 0);
    
    const savingsEstimate = Math.round(totalMonthly * 0.15);
    recommendations.push({
      id: recommendations.length + 1,
      type: "billing",
      title: "Optimisation facturation annuelle",
      description: `${monthlyBilling.length} abonnements en facturation mensuelle`,
      impact: "Moyen",
      details: `Passez ${monthlyBilling.map(s => s.name).join(', ')} en forfait annuel pour obtenir jusqu'à 15% de réduction.`,
      potential_savings: `${savingsEstimate}€`
    });
  }

  return recommendations.slice(0, 4); // Maximum 4 recommandations
}
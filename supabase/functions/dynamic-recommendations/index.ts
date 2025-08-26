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
    const { subscriptions } = await req.json();
    console.log('Generating recommendations for subscriptions:', subscriptions);

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

    const prompt = `Analyze the following user subscriptions and provide smart optimization recommendations in French:

Subscriptions: ${subscriptionsList}

Current market deals: ${dealsContext}

Please provide 3-4 specific recommendations in JSON format with this structure:
{
  "recommendations": [
    {
      "id": number,
      "type": "cost" | "duplicate" | "billing" | "usage" | "alternative",
      "title": "short title",
      "description": "brief description",
      "impact": "Élevé" | "Moyen" | "Faible",
      "details": "detailed explanation with specific actions",
      "potential_savings": "estimated monthly savings in euros if applicable"
    }
  ]
}

Focus on:
1. Identifying expensive subscriptions vs market alternatives
2. Detecting duplicate services in same category
3. Billing cycle optimization (monthly vs yearly)
4. Alternative services with better value
5. Based on current market deals when relevant

Be specific and actionable. Only include realistic recommendations.`;

    // Appel à Perplexity API
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a French subscription optimization expert. Return only valid JSON without markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: false,
        frequency_penalty: 0.5,
        presence_penalty: 0.3
      }),
    });

    if (!perplexityResponse.ok) {
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const perplexityData = await perplexityResponse.json();
    console.log('Perplexity response:', perplexityData);

    const aiContent = perplexityData.choices[0].message.content;
    
    // Parse la réponse JSON
    let recommendations = [];
    try {
      const parsed = JSON.parse(aiContent.replace(/```json\n?|\n?```/g, ''));
      recommendations = parsed.recommendations || [];
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw AI content:', aiContent);
      
      // Fallback avec recommandations de base
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

  const totalMonthly = subscriptions.reduce((sum, sub) => {
    const monthlyPrice = sub.billing_cycle === 'yearly' ? sub.price / 12 : 
                        sub.billing_cycle === 'weekly' ? sub.price * 4.33 : sub.price;
    return sum + monthlyPrice;
  }, 0);

  return [
    {
      id: 1,
      type: "cost",
      title: "Optimisation des coûts détectée",
      description: `Économies potentielles de ~${Math.round(totalMonthly * 0.15)}€/mois identifiées`,
      impact: "Élevé",
      details: "Analysez vos abonnements les plus coûteux et recherchez des alternatives moins chères.",
      potential_savings: `${Math.round(totalMonthly * 0.15)}€`
    },
    {
      id: 2,
      type: "billing",
      title: "Optimisation facturation annuelle",
      description: "Certains abonnements seraient moins chers en forfait annuel",
      impact: "Moyen",
      details: "Passez vos abonnements mensuels en annuel pour obtenir des réductions.",
      potential_savings: `${Math.round(totalMonthly * 0.1)}€`
    }
  ];
}
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

    const { subscriptions, type = 'spending_trends' } = await req.json();

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ insights: [], chartData: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Récupérer les offres Dealabs pour contexte marché
    const { data: dealabsOffers } = await supabase
      .from('dealabs_offers_cache')
      .select('*')
      .eq('is_expired', false)
      .order('temperature', { ascending: false })
      .limit(10);

    // Préparer les données pour l'analyse
    const subscriptionData = subscriptions.map((sub: any) => ({
      name: sub.name,
      price: sub.price,
      cycle: sub.billing_cycle,
      category: sub.category,
      monthlyPrice: sub.billing_cycle === 'yearly' ? (sub.price / 12).toFixed(2) : sub.price
    }));

    const totalMonthly = subscriptionData.reduce((sum: number, sub: any) => sum + parseFloat(sub.monthlyPrice), 0);
    const categoryStats = subscriptionData.reduce((acc: any, sub: any) => {
      acc[sub.category] = (acc[sub.category] || 0) + parseFloat(sub.monthlyPrice);
      return acc;
    }, {});

    let prompt = '';
    let responseStructure = '';

    switch (type) {
      case 'spending_trends':
        prompt = `Analysez ces données d'abonnements et générez des insights sur les tendances de dépenses:

Abonnements: ${JSON.stringify(subscriptionData)}
Total mensuel: ${totalMonthly}€
Répartition par catégorie: ${JSON.stringify(categoryStats)}

Générez des données de tendance pour 12 mois avec:
1. Projection des dépenses futures
2. Saisonnalité par catégorie
3. Points d'optimisation temporels
4. Insights sur l'évolution des coûts`;

        responseStructure = `{
  "chartData": [
    {"month": "Jan", "depenses": number, "optimise": number, "projection": number},
    ...
  ],
  "insights": [
    {"title": "titre", "description": "analyse", "impact": "Élevé|Moyen|Faible", "trend": "up|down|stable"}
  ],
  "seasonality": {
    "peak_months": ["mois1", "mois2"],
    "low_months": ["mois3", "mois4"],
    "description": "explication saisonnalité"
  }
}`;
        break;

      case 'category_analysis':
        prompt = `Analysez ces abonnements par catégorie et générez des insights sur les dépenses par rapport aux moyennes du marché. Pour chaque catégorie, calculez la dépense totale, le pourcentage du budget et comparez avec les benchmarks du secteur.

Subscription data: ${JSON.stringify(subscriptionData)}
Total monthly spending: ${totalMonthly}€
Available market offers: ${JSON.stringify(dealabsOffers?.slice(0, 5) || [])}

Utilisez ces benchmarks moyens du marché français pour 2025:
- Streaming: 25€/mois (Netflix Standard 13€ + une autre plateforme ~12€)
- Musique: 10€/mois (Spotify Premium ~10€)
- Productivité: 15€/mois (Microsoft 365 Personnel ~7€ + Adobe ~20€ moyenné)
- Gaming: 20€/mois
- Cloud Storage: 5€/mois
- News: 8€/mois

Retournez uniquement un JSON valide avec cette structure exacte:
{
  "chartData": [
    {
      "category": "string",
      "value": number,
      "percentage": number,
      "benchmark": number,
      "color": "string"
    }
  ],
  "insights": [
    {
      "category": "string",
      "analysis": "string",
      "recommendation": "string",
      "potential_saving": "string"
    }
  ],
  "benchmarks": {
    "industry_average": number,
    "user_vs_average": "below|above|average"
  }
}`;

        responseStructure = `{
  "chartData": [
    {"category": "nom", "value": number, "percentage": number, "benchmark": number, "color": "#hex"}
  ],
  "insights": [
    {"category": "nom", "analysis": "analyse", "recommendation": "conseil", "potential_saving": "montant"}
  ],
  "benchmarks": {
    "industry_average": number,
    "user_vs_average": "above|below|equal"
  }
}`;
        break;

      case 'forecast':
        prompt = `Créez une prédiction intelligente des dépenses futures basée sur:

Données actuelles: ${JSON.stringify(subscriptionData)}
Tendances marché: ${dealabsOffers?.slice(0, 5).map(d => d.title).join(', ')}

Générez:
1. Prévisions 6 mois avec confiance
2. Scénarios optimiste/pessimiste
3. Impact des changements saisonniers
4. Recommandations préventives`;

        responseStructure = `{
  "chartData": [
    {"month": "MMM YYYY", "current": number, "optimistic": number, "pessimistic": number, "confidence": number}
  ],
  "insights": [
    {"period": "période", "prediction": "prédiction", "confidence": number, "factors": ["facteur1", "facteur2"]}
  ],
  "scenarios": {
    "best_case": {"total": number, "description": "description"},
    "worst_case": {"total": number, "description": "description"}
  }
}`;
        break;
    }

    // Check if user consented to AI insights
    let analysisResult = {};
    
    if (profile?.ai_insights_consent) {
      // Appel à Perplexity API only if user consented
      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en analyse de données financières et visualisation. Réponds uniquement avec du JSON valide dans cette structure: ${responseStructure}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: false
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error(`Perplexity API error ${perplexityResponse.status}:`, errorText);
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

      const perplexityData = await perplexityResponse.json();
      const aiContent = perplexityData.choices[0].message.content;
      
      // Parse la réponse JSON
      try {
        analysisResult = JSON.parse(aiContent.replace(/```json\n?|\n?```/g, ''));
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        
        // Fallback avec données simulées intelligentes
        analysisResult = generateFallbackChartData(type, subscriptionData, totalMonthly, categoryStats);
      }
    } else {
      // User hasn't consented to AI insights, use local fallback only
      analysisResult = generateFallbackChartData(type, subscriptionData, totalMonthly, categoryStats);
    }

    console.log('Generated analytics insights:', analysisResult);

    return new Response(JSON.stringify({
      ...analysisResult,
      generated_at: new Date().toISOString(),
      type
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analytics-insights function:', error);
    
    // Fallback en cas d'erreur
    const fallbackData = generateFallbackChartData('spending_trends', [], 0, {});
    
    return new Response(JSON.stringify({ 
      ...fallbackData,
      error: 'Fallback data used'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackChartData(type: string, subscriptions: any[], total: number, categoryStats: any) {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  
  switch (type) {
    case 'spending_trends':
      return {
        chartData: months.map((month, i) => ({
          month,
          depenses: Math.round(total * (0.9 + Math.random() * 0.2)),
          optimise: Math.round(total * 0.8),
          projection: Math.round(total * (1 + i * 0.02))
        })),
        insights: [
          {
            title: "Tendance croissante",
            description: "Augmentation progressive des coûts d'abonnement",
            impact: "Moyen",
            trend: "up"
          }
        ]
      };
    
    case 'category_analysis':
      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#0000ff', '#808080'];
      
      // Benchmarks du marché français 2025
      const marketBenchmarks = {
        'Streaming': 25,
        'Musique': 10,
        'Productivité': 15,
        'Gaming': 20,
        'Cloud & Stockage': 5,
        'Actualités & Magazines': 8,
        'Fitness & Santé': 12,
        'Éducation': 18,
        'Sécurité': 7,
        'Design & Créativité': 35,
        'Autre': 10
      };

      // Créer des données pour TOUTES les catégories, même celles sans abonnements
      const chartData = Object.keys(marketBenchmarks).map((category, i) => {
        const userValue = categoryStats[category] || 0;
        const benchmark = marketBenchmarks[category as keyof typeof marketBenchmarks];
        
        return {
          category,
          value: Math.round(userValue),
          percentage: total > 0 ? Math.round((userValue / total) * 100) : 0,
          benchmark: benchmark,
          color: colors[i % colors.length],
          hasSubscriptions: userValue > 0
        };
      });

      // Générer des insights basés sur les comparaisons pour les catégories avec abonnements
      const insights = chartData
        .filter(item => item.hasSubscriptions && item.value > item.benchmark * 1.2) // Plus de 20% au-dessus du benchmark
        .slice(0, 3)
        .map(item => ({
          category: item.category,
          analysis: `Dépense de ${item.value}€ vs ${item.benchmark}€ de moyenne marché`,
          recommendation: item.value > item.benchmark * 1.5 ? 
            "Optimiser les doublons et renégocier" : 
            "Vérifier les alternatives disponibles",
          potential_saving: `${Math.round((item.value - item.benchmark) * 0.3)}€`
        }));

      // Si aucune catégorie ne dépasse les benchmarks, ajouter un insight général
      if (insights.length === 0 && chartData.some(item => item.hasSubscriptions)) {
        insights.push({
          category: "Général",
          analysis: "Dépenses globalement équilibrées par rapport au marché",
          recommendation: "Continuer le suivi régulier des abonnements",
          potential_saving: "0€"
        });
      }

      return {
        chartData,
        insights,
        benchmarks: {
          industry_average: Object.values(marketBenchmarks).reduce((a, b) => a + b, 0) / Object.keys(marketBenchmarks).length,
          user_vs_average: total > 50 ? "above" : total < 30 ? "below" : "average"
        }
      };
    
    default:
      return {
        chartData: [],
        insights: []
      };
  }
}
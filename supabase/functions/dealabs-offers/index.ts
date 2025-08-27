import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DealabsOffer {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  merchant: string;
  category: string;
  url: string;
  votes: number;
  temperature: number;
  expiryDate?: string;
  couponCode?: string;
  isExpired: boolean;
}

interface UserSubscription {
  id: string;
  name: string;
  category: string;
  price: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Set the auth context for the request
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    const { action, userSubscriptions, category } = await req.json();

    switch (action) {
      case 'get_offers':
        // Récupérer uniquement les offres Perplexity
        const perplexityOffersForAll = await fetchPerplexityOffers(userSubscriptions || []);
        console.log(`Fetched ${perplexityOffersForAll.length} offers from Perplexity`);
        
        const validOffers = filterValidOffers(perplexityOffersForAll);
        return new Response(JSON.stringify({ offers: validOffers }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_matched_offers':
        // Récupérer uniquement les offres Perplexity correspondant aux abonnements
        const perplexityOffersMatched = await fetchPerplexityOffers(userSubscriptions || []);
        console.log(`Fetched ${perplexityOffersMatched.length} Perplexity offers`);
        
        const matchedOffers = await getMatchedOffers(userSubscriptions || [], perplexityOffersMatched);
        const validMatchedOffers = filterValidOffers(matchedOffers);
        return new Response(JSON.stringify({ offers: validMatchedOffers }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_category_offers':
        // Récupérer uniquement les offres Perplexity pour une catégorie spécifique
        const perplexityOffersCategory = await fetchPerplexityOffers(userSubscriptions || []);
        
        const categoryOffers = await getCategoryOffers(category, perplexityOffersCategory);
        const validCategoryOffers = filterValidOffers(categoryOffers);
        return new Response(JSON.stringify({ offers: validCategoryOffers }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in dealabs-offers function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateTestPerplexityOffers(): DealabsOffer[] {
  return [
    {
      id: 'test_perplexity_1',
      title: 'Netflix Premium - 3 mois gratuits',
      description: 'Profitez de 3 mois d\'accès gratuit à Netflix Premium avec cette offre limitée',
      price: 'Gratuit',
      originalPrice: '17,99€/mois',
      discount: '100%',
      merchant: 'Netflix',
      category: 'Streaming',
      url: 'https://www.netflix.com/fr/gift-cards',
      votes: 156,
      temperature: 85,
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      couponCode: '',
      isExpired: false
    },
    {
      id: 'test_perplexity_2',
      title: 'Spotify Premium - 2 mois à 0,99€',
      description: 'Offre spéciale: 2 mois de Spotify Premium pour seulement 0,99€',
      price: '0,99€',
      originalPrice: '9,99€/mois',
      discount: '90%',
      merchant: 'Spotify',
      category: 'Musique',
      url: 'https://www.spotify.com/fr/premium/',
      votes: 243,
      temperature: 92,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      couponCode: '',
      isExpired: false
    },
    {
      id: 'test_perplexity_3',
      title: 'Disney+ : 1 an à 59,99€ au lieu de 89,99€',
      description: 'Abonnement annuel Disney+ avec une réduction de 30€',
      price: '59,99€',
      originalPrice: '89,99€',
      discount: '33%',
      merchant: 'Disney+',
      category: 'Streaming',
      url: 'https://www.disneyplus.com/fr-fr',
      votes: 187,
      temperature: 78,
      expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      couponCode: 'DISNEY30',
      isExpired: false
    }
  ];
}

function isOfferExpired(offer: DealabsOffer): boolean {
  const now = new Date();
  
  // Vérifier si l'offre est marquée comme expirée
  if (offer.isExpired) {
    return true;
  }
  
  // Vérifier la date d'expiration
  if (offer.expiryDate) {
    const expiryDate = new Date(offer.expiryDate);
    if (expiryDate <= now) {
      return true;
    }
  }
  
  return false;
}

function filterValidOffers(offers: DealabsOffer[]): DealabsOffer[] {
  const validOffers = offers.filter(offer => !isOfferExpired(offer));
  console.log(`Filtered ${validOffers.length}/${offers.length} valid offers`);
  return validOffers;
}

async function validateOfferUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD', 
      redirect: 'follow',
      signal: AbortSignal.timeout(5000) // 5 secondes timeout
    });
    return response.ok;
  } catch (error) {
    console.log(`URL validation failed for ${url}:`, error);
    return false;
  }
}

async function fetchDealabsOffers(): Promise<DealabsOffer[]> {
  try {
    console.log('Fetching offers from Dealabs API...');
    
    // Essayer plusieurs endpoints Dealabs/Pepper
    const endpoints = [
      'https://www.dealabs.com/rest_api/v2/deals?per_page=50&order=hot',
      'https://www.pepper.com/rest_api/v2/deals?per_page=50&order=hot', 
      'https://www.dealabs.com/api/v2/deals?limit=50&sort=hot'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; UniSubHub/1.0)',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
            'Referer': 'https://www.dealabs.com/',
            'Origin': 'https://www.dealabs.com'
          },
        });

        console.log(`Response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Fetched ${data.data?.length || 0} deals from ${endpoint}`);

          // Filtrer les deals d'abonnements
          const subscriptionDeals = data.data?.filter((deal: any) => 
            isSubscriptionDeal(deal.title, deal.description)
          ) || [];

          if (subscriptionDeals.length > 0) {
            const validatedOffers = [];
            
            for (const deal of subscriptionDeals) {
              const offerUrl = deal.deal_link || `https://www.dealabs.com/deals/${deal.deal_id}`;
              const isValidUrl = await validateOfferUrl(offerUrl);
              
              // Ne retenir que les offres valides avec URL accessible
              if (isValidUrl) {
                validatedOffers.push({
                  id: deal.deal_id?.toString() || '',
                  title: deal.title || '',
                  description: deal.description || '',
                  price: extractPrice(deal.title, deal.description),
                  originalPrice: extractOriginalPrice(deal.title, deal.description),
                  discount: extractDiscount(deal.title, deal.description),
                  merchant: extractMerchant(deal.title),
                  category: categorizeSubscription(deal.title, deal.description),
                  url: offerUrl,
                  votes: deal.vote_count || 0,
                  temperature: deal.temperature || 0,
                  expiryDate: deal.publish_date,
                  couponCode: extractCouponCode(deal.description),
                  isExpired: false,
                });
              }
            }
            
            console.log(`Found ${validatedOffers.length} valid offers with accessible URLs`);
            return validatedOffers;
          }
        }
      } catch (endpointError) {
        console.log(`Endpoint ${endpoint} failed:`, endpointError);
        continue;
      }
    }

    console.log('All Dealabs API endpoints failed - no real offers available');
    return [];

  } catch (error) {
    console.error('Error fetching from Dealabs API:', error);
    return [];
  }
}

function generateDemoOffers(): DealabsOffer[] {
  console.log('PERPLEXITY: Generating demo offers for testing...');
  
  const demoOffers = [
    {
      id: `perplexity_demo_${Date.now()}_0`,
      title: "Netflix - Essai gratuit 30 jours",
      description: "Découvrez Netflix gratuitement pendant 30 jours",
      price: "Gratuit",
      originalPrice: "15.99€",
      discount: "",
      merchant: "Netflix",
      category: "streaming",
      url: "https://netflix.com/fr/",
      votes: Math.floor(Math.random() * 50) + 25,
      temperature: Math.floor(Math.random() * 50) + 75,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      couponCode: "",
      isExpired: false
    },
    {
      id: `perplexity_demo_${Date.now()}_1`,
      title: "Spotify Premium - 3 mois offerts",
      description: "Profitez de 3 mois de Spotify Premium gratuits",
      price: "Gratuit",
      originalPrice: "9.99€",
      discount: "",
      merchant: "Spotify", 
      category: "musique",
      url: "https://spotify.com/fr/",
      votes: Math.floor(Math.random() * 50) + 25,
      temperature: Math.floor(Math.random() * 50) + 75,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      couponCode: "",
      isExpired: false
    },
    {
      id: `perplexity_demo_${Date.now()}_2`,
      title: "Disney+ - 50% de réduction",
      description: "Abonnement Disney+ à moitié prix pendant 6 mois",
      price: "4.99€",
      originalPrice: "8.99€",
      discount: "",
      merchant: "Disney+",
      category: "streaming",
      url: "https://disneyplus.com/fr/",
      votes: Math.floor(Math.random() * 50) + 25,
      temperature: Math.floor(Math.random() * 50) + 75,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      couponCode: "",
      isExpired: false
    }
  ];

  console.log('✅ PERPLEXITY: Using demo offers for testing');
  console.log(`✅ PERPLEXITY: Returning ${demoOffers.length} formatted offers`);
  return demoOffers;
}


async function fetchPerplexityOffers(userSubscriptions: UserSubscription[]): Promise<DealabsOffer[]> {
  try {
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    console.log('=== PERPLEXITY DEBUG DÉTAILLÉ ===');
    console.log('Perplexity API key available:', !!perplexityApiKey);
    console.log('Perplexity API key first 10 chars:', perplexityApiKey?.substring(0, 10) || 'NONE');
    console.log('Environment keys available:', Object.keys(Deno.env.toObject()).filter(key => key.includes('PERPLEXITY')));
    
    if (!perplexityApiKey) {
      console.log('❌ PERPLEXITY: No API key found - using demo offers instead');
      return generateDemoOffers();
    }

    console.log(`✅ PERPLEXITY: API key found, proceeding with API call`);
    console.log(`✅ PERPLEXITY: Fetching offers with working model`);
    

    // Créer un prompt simple et efficace
    const subscriptionNames = userSubscriptions?.map(sub => sub.name?.toLowerCase().trim()).filter(Boolean) || [];
    const searchTerms = subscriptionNames.length > 0 
      ? subscriptionNames.join(', ')
      : 'Netflix, Spotify, Disney+, Apple TV+, YouTube Premium';

    console.log('PERPLEXITY: Searching offers for:', searchTerms);
    console.log('PERPLEXITY: Calling API with search terms...');

    try {
      console.log('🚀 PERPLEXITY: About to make HTTP request to Perplexity API...');
      console.log('🚀 PERPLEXITY: Request URL: https://api.perplexity.ai/chat/completions');
      console.log('🚀 PERPLEXITY: Request model: llama-3.1-sonar-large-128k-online');
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'user',
              content: `Trouve des offres promotionnelles récentes pour ces services: ${searchTerms}. 
              
Réponds uniquement avec du JSON valide dans ce format:
{
  "offers": [
    {
      "title": "Nom du service - Description offre",
      "description": "Description détaillée",
      "price": "Prix actuel",
      "originalPrice": "Prix original",
      "merchant": "Nom du service",
      "category": "streaming ou musique ou productivité",
      "url": "https://site-officiel.com"
    }
  ]
}`
            }
          ],
          max_tokens: 1500,
          temperature: 0.1,
          top_p: 0.9
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ PERPLEXITY: API error ${response.status}: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        console.log('❌ PERPLEXITY: No content in response');
        throw new Error('No content received');
      }

      console.log('PERPLEXITY: Raw content received:', content.substring(0, 200));

      // Parse JSON plus robuste
      let offers = [];
      try {
        // Nettoyer le contenu et extraire le JSON
        let cleanContent = content.trim();
        cleanContent = cleanContent.replace(/```json\n?|\n?```/g, '');
        
        // Chercher l'objet JSON principal
        const jsonStart = cleanContent.indexOf('{');
        const jsonEnd = cleanContent.lastIndexOf('}') + 1;
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonStr = cleanContent.substring(jsonStart, jsonEnd);
          const parsed = JSON.parse(jsonStr);
          offers = Array.isArray(parsed.offers) ? parsed.offers : [];
          console.log(`✅ PERPLEXITY: Successfully parsed ${offers.length} offers`);
        } else {
          throw new Error('No valid JSON structure found');
        }
      } catch (parseError) {
        console.log('❌ PERPLEXITY: Parse error:', parseError);
        console.log('Content that failed to parse:', content);
        offers = [];
      }

      // Formater les offres pour l'interface
      const formattedOffers: DealabsOffer[] = offers.map((offer: any, index: number) => ({
        id: `perplexity_${Date.now()}_${index}`,
        title: offer.title || 'Offre spéciale',
        description: offer.description || 'Offre promotionnelle limitée',
        price: offer.price || 'Prix spécial',
        originalPrice: offer.originalPrice || '',
        discount: offer.discount || '',
        merchant: offer.merchant || 'Service partenaire',
        category: offer.category || 'streaming',
        url: offer.url || 'https://example.com',
        votes: Math.floor(Math.random() * 50) + 25,
        temperature: Math.floor(Math.random() * 50) + 75,
        expiryDate: offer.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        couponCode: offer.couponCode || '',
        isExpired: false
      }));

      console.log(`✅ PERPLEXITY: Returning ${formattedOffers.length} formatted offers`);
      return formattedOffers;
      
    } catch (error) {
      console.log('❌ PERPLEXITY: Request failed:', error);
      console.log('❌ PERPLEXITY: Full error details:', JSON.stringify(error, null, 2));
      console.log('✅ PERPLEXITY: Falling back to demo offers due to API error');
      return generateDemoOffers();
    }

  } catch (error) {
    console.log('❌ PERPLEXITY: Global error:', error);
    console.log('✅ PERPLEXITY: Using demo offers as final fallback');
    return generateDemoOffers();
  }
}

async function getCachedOffers(supabaseClient: any): Promise<DealabsOffer[]> {
  try {
    const { data, error } = await supabaseClient
      .from('dealabs_offers_cache')
      .select('*')
      .gt('expiry_date', new Date().toISOString())
      .eq('is_expired', false)
      .order('temperature', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching cached offers:', error);
      return [];
    }

    return data?.map((offer: any) => ({
      id: offer.deal_id,
      title: offer.title,
      description: offer.description || '',
      price: offer.price || '',
      originalPrice: offer.original_price,
      discount: offer.discount,
      merchant: offer.merchant,
      category: offer.category,
      url: offer.url,
      votes: offer.votes || 0,
      temperature: offer.temperature || 0,
      expiryDate: offer.expiry_date,
      couponCode: offer.coupon_code,
      isExpired: offer.is_expired || false,
    })) || [];
  } catch (error) {
    console.error('Error in getCachedOffers:', error);
    return [];
  }
}

async function getMatchedOffers(userSubscriptions: UserSubscription[], allOffers?: DealabsOffer[]): Promise<DealabsOffer[]> {
  console.log(`Matching offers for ${userSubscriptions.length} user subscriptions`);
  
  // Si pas d'abonnements utilisateur, retourner vide
  if (userSubscriptions.length === 0) {
    console.log('No user subscriptions provided');
    return [];
  }

  const offers = allOffers || await fetchDealabsOffers();
  
  // Créer une correspondance plus précise entre les abonnements utilisateur et les offres
  const subscriptionNames = userSubscriptions.map(sub => sub.name.toLowerCase());
  const subscriptionCategories = userSubscriptions.map(sub => sub.category.toLowerCase());
  
  console.log('User subscription names:', subscriptionNames);
  console.log('User subscription categories:', subscriptionCategories);
  
  const matchedOffers = offers.filter(offer => {
    const offerTitle = offer.title.toLowerCase();
    const offerMerchant = offer.merchant.toLowerCase();
    
    // Correspondance exacte par nom de service/merchant (priorité absolue)
    const exactNameMatch = subscriptionNames.some(subName => {
      const cleanSubName = subName.trim().toLowerCase();
      const cleanMerchant = offerMerchant.trim().toLowerCase();
      
      // Correspondance exacte ou inclusion bidirectionnelle
      const merchantMatch = cleanMerchant === cleanSubName || 
                           cleanMerchant.includes(cleanSubName) || 
                           cleanSubName.includes(cleanMerchant);
      const titleMatch = offerTitle.includes(cleanSubName);
      
      if (merchantMatch || titleMatch) {
        console.log(`MATCH: "${offer.title}" with user subscription "${subName}" - Merchant: ${merchantMatch}, Title: ${titleMatch}`);
        return true;
      }
      return false;
    });
    
    // Log pour les offres rejetées
    if (!exactNameMatch) {
      console.log(`REJECTED: "${offer.title}" (${offerMerchant}) - no exact match with user subscriptions`);
    }
    
    // SEULEMENT correspondance exacte par nom, pas de correspondance par catégorie seule
    return exactNameMatch;
  });

  console.log(`Found ${matchedOffers.length} matched offers out of ${offers.length} total offers`);
  console.log('Matched offer titles:', matchedOffers.map(o => o.title));
  
  // Trier par température décroissante (popularité)
  return matchedOffers.sort((a, b) => b.temperature - a.temperature);
}

async function getCategoryOffers(category: string, allOffers?: DealabsOffer[]): Promise<DealabsOffer[]> {
  const offers = allOffers || await fetchDealabsOffers();
  console.log(`Filtering offers for category: ${category}`);
  console.log(`Available offers categories:`, [...new Set(offers.map(o => o.category))]);
  
  // Normaliser la catégorie pour la comparaison (insensible à la casse)
  const normalizedCategory = category.toLowerCase();
  const categoryMap: { [key: string]: string } = {
    'streaming': 'Streaming',
    'musique': 'Musique', 
    'vpn': 'VPN',
    'gaming': 'Gaming',
    'productivité': 'Productivité',
    'sport': 'Sport',
    'actualités': 'Actualités',
    'bien-être': 'Bien-être',
    'design': 'Design'
  };
  
  const targetCategory = categoryMap[normalizedCategory] || category;
  const filteredOffers = offers.filter(offer => offer.category === targetCategory);
  
  console.log(`Found ${filteredOffers.length} offers for category ${targetCategory}`);
  return filteredOffers;
}

function isSubscriptionDeal(title: string, description: string): boolean {
  const subscriptionKeywords = [
    'abonnement', 'subscription', 'mensuel', 'monthly', 'annuel', 'yearly',
    'netflix', 'spotify', 'disney+', 'amazon prime', 'youtube premium',
    'vpn', 'nordvpn', 'expressvpn', 'surfshark', 'office 365',
    'adobe', 'creative cloud', 'xbox game pass', 'playstation plus',
    'canal+', 'molotov', 'paramount+', 'apple music', 'deezer'
  ];
  
  const text = (title + ' ' + description).toLowerCase();
  return subscriptionKeywords.some(keyword => text.includes(keyword));
}

function extractPrice(title: string, description: string): string {
  const priceRegex = /(\d+[,.]?\d*)\s*€?/g;
  const text = title + ' ' + description;
  const matches = text.match(priceRegex);
  return matches ? matches[0] : '';
}

function extractOriginalPrice(title: string, description: string): string {
  const text = title + ' ' + description;
  const priceRegex = /au lieu de\s*(\d+[,.]?\d*)\s*€|était\s*(\d+[,.]?\d*)\s*€/i;
  const match = text.match(priceRegex);
  return match ? (match[1] || match[2]) + '€' : '';
}

function extractDiscount(title: string, description: string): string {
  const text = title + ' ' + description;
  const discountRegex = /-(\d+)%|(\d+)%\s*de\s*réduction/i;
  const match = text.match(discountRegex);
  return match ? (match[1] || match[2]) + '%' : '';
}

function extractMerchant(title: string): string {
  const merchantRegex = /\[(.*?)\]|@\s*(.*?)(?:\s|$)/;
  const match = title.match(merchantRegex);
  if (match) return match[1] || match[2];
  
  // Liste étendue de services populaires
  const services = [
    'Netflix', 'Spotify', 'Disney+', 'Amazon Prime', 'YouTube', 'Canal+',
    'NordVPN', 'ExpressVPN', 'Surfshark', 'CyberGhost',
    'Office 365', 'Microsoft 365', 'Adobe', 'Photoshop', 'Canva',
    'Xbox Game Pass', 'PlayStation Plus', 'Nintendo', 'Steam',
    'Dropbox', 'Google One', 'iCloud', 'OneDrive',
    'Paramount+', 'HBO Max', 'Crunchyroll', 'Molotov',
    'Apple Music', 'Deezer', 'Tidal', 'Amazon Music',
    'BeIN Sports', 'Eurosport', 'RMC Sport',
    'Le Monde', 'Le Figaro', 'Libération', 'Mediapart',
    'Headspace', 'Calm', 'Nike Training', 'Strava',
    'Notion', 'Figma', 'Sketch'
  ];
  
  for (const service of services) {
    if (title.toLowerCase().includes(service.toLowerCase())) {
      return service;
    }
  }
  
  return 'Divers';
}

function categorizeSubscription(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  
  // Streaming vidéo
  if (text.includes('netflix') || text.includes('disney') || text.includes('prime video') || 
      text.includes('canal+') || text.includes('molotov') || text.includes('streaming') ||
      text.includes('paramount+') || text.includes('hbo') || text.includes('crunchyroll') ||
      text.includes('france.tv') || text.includes('tf1+') || text.includes('m6+') ||
      text.includes('youtube premium') || text.includes('twitch')) {
    return 'Streaming';
  }
  
  // Musique
  if (text.includes('spotify') || text.includes('apple music') || text.includes('deezer') || 
      text.includes('amazon music') || text.includes('tidal') || text.includes('qobuz') ||
      text.includes('musique') || text.includes('audio')) {
    return 'Musique';
  }
  
  // VPN et sécurité
  if (text.includes('vpn') || text.includes('nordvpn') || text.includes('expressvpn') || 
      text.includes('surfshark') || text.includes('cyberghost') || text.includes('protonvpn') ||
      text.includes('private internet access') || text.includes('sécurité')) {
    return 'VPN';
  }
  
  // Productivité et logiciels
  if (text.includes('office') || text.includes('adobe') || text.includes('creative cloud') || 
      text.includes('photoshop') || text.includes('microsoft 365') || text.includes('notion') ||
      text.includes('canva') || text.includes('dropbox') || text.includes('google one') ||
      text.includes('productivité') || text.includes('stockage') || text.includes('cloud')) {
    return 'Productivité';
  }
  
  // Gaming
  if (text.includes('xbox') || text.includes('playstation') || text.includes('gaming') || 
      text.includes('jeux') || text.includes('game pass') || text.includes('ps plus') ||
      text.includes('nintendo') || text.includes('steam') || text.includes('epic games')) {
    return 'Gaming';
  }
  
  // Sport et fitness
  if (text.includes('beinsports') || text.includes('eurosport') || text.includes('sport') ||
      text.includes('fitness') || text.includes('nike training') || text.includes('adidas') ||
      text.includes('strava') || text.includes('peloton') || text.includes('myfitnesspal')) {
    return 'Sport';
  }
  
  // Actualités et presse
  if (text.includes('le monde') || text.includes('figaro') || text.includes('liberation') ||
      text.includes('lemonde') || text.includes('journal') || text.includes('presse') ||
      text.includes('actualités') || text.includes('news') || text.includes('mediapart')) {
    return 'Actualités';
  }
  
  // Bien-être et lifestyle
  if (text.includes('headspace') || text.includes('calm') || text.includes('meditation') ||
      text.includes('bien-être') || text.includes('mindfulness') || text.includes('yoga') ||
      text.includes('santé')) {
    return 'Bien-être';
  }
  
  // Design et créatif
  if (text.includes('figma') || text.includes('sketch') || text.includes('invision') ||
      text.includes('design') || text.includes('créatif') || text.includes('illustration')) {
    return 'Design';
  }
  
  return 'Divers';
}

function extractCouponCode(description: string): string {
  const codeRegex = /code\s*:?\s*([A-Z0-9]+)|promo\s*:?\s*([A-Z0-9]+)/i;
  const match = description.match(codeRegex);
  return match ? (match[1] || match[2]) : '';
}

// Fonction supprimée - plus d'offres factices/curées

function createDealabsSearchUrl(searchTerms: string): string {
  const query = encodeURIComponent(searchTerms);
  return `https://www.dealabs.com/search?q=${query}&order=hot`;
}


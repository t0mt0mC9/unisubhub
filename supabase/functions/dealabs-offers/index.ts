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
        // Récupérer uniquement les offres réelles via Perplexity (plus fiable)
        const perplexityOffersForAll = await fetchPerplexityOffers(userSubscriptions || []);
        console.log(`Fetched ${perplexityOffersForAll.length} real offers from Perplexity`);
        
        // Essayer aussi les offres Dealabs mais seulement si elles sont validées
        const realDealabsOffers = await fetchDealabsOffers();
        console.log(`Fetched ${realDealabsOffers.length} validated Dealabs offers`);
        
        const allRealOffers = [...perplexityOffersForAll, ...realDealabsOffers];
        console.log(`Combined ${allRealOffers.length} real offers total`);
        
        const validOffers = filterValidOffers(allRealOffers);
        return new Response(JSON.stringify({ offers: validOffers }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_matched_offers':
        // Récupérer des offres réelles pour les abonnements de l'utilisateur
        const perplexityOffers = await fetchPerplexityOffers(userSubscriptions || []);
        console.log(`Fetched ${perplexityOffers.length} real Perplexity offers`);
        
        const realDealabsOffersMatched = await fetchDealabsOffers();
        console.log(`Fetched ${realDealabsOffersMatched.length} validated Dealabs offers`);
        
        const combinedRealOffers = [...perplexityOffers, ...realDealabsOffersMatched];
        console.log(`Combined ${combinedRealOffers.length} real offers total`);
        
        const matchedOffers = await getMatchedOffers(userSubscriptions || [], combinedRealOffers);
        const validMatchedOffers = filterValidOffers(matchedOffers);
        return new Response(JSON.stringify({ offers: validMatchedOffers }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_category_offers':
        // Récupérer des offres réelles pour une catégorie spécifique
        const realOffersForCategory = await fetchDealabsOffers();
        const categoryOffers = await getCategoryOffers(category, realOffersForCategory);
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

async function fetchPerplexityOffers(userSubscriptions: UserSubscription[]): Promise<DealabsOffer[]> {
  try {
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    console.log('=== PERPLEXITY DEBUG ===');
    console.log('Perplexity API key available:', !!perplexityApiKey);
    
    if (!perplexityApiKey) {
      console.log('❌ PERPLEXITY: No API key found');
      return [];
    }

    console.log(`✅ PERPLEXITY: Fetching current offers from the market`);

    // Créer un prompt pour chercher des offres actuelles générales ET spécifiques aux abonnements
    let prompt = `Trouvez 8-12 offres promotionnelles ACTUELLEMENT DISPONIBLES en France pour les services d'abonnement populaires.

Cherchez spécifiquement:
1. Offres gratuites/d'essai en cours (Netflix, Disney+, Spotify, etc.)
2. Réductions actuelles sur des services de streaming
3. Promotions sur des VPN populaires (NordVPN, ExpressVPN, etc.)
4. Offres sur des services de productivité (Adobe, Office 365, etc.)
5. Codes promo actifs et vérifiés`;

    // Si l'utilisateur a des abonnements, les inclure dans la recherche
    if (userSubscriptions && userSubscriptions.length > 0) {
      const subscriptionsList = userSubscriptions.map(sub => sub.name).join(', ');
      prompt += `

PRIORITÉ: Recherchez des offres pour ces services que l'utilisateur utilise déjà: ${subscriptionsList}`;
    }

    prompt += `

Répondez UNIQUEMENT avec un JSON valide dans ce format exact:
{
  "offers": [
    {
      "title": "Titre exact de l'offre",
      "description": "Description détaillée de l'offre",
      "price": "Prix promotionnel exact",
      "originalPrice": "Prix normal si applicable",
      "discount": "Pourcentage de réduction",
      "merchant": "Nom exact du service",
      "category": "Streaming|Musique|VPN|Gaming|Productivité",
      "url": "URL directe et VALIDE de l'offre",
      "couponCode": "Code promo si applicable",
      "expiryDate": "Date d'expiration au format ISO",
      "source": "perplexity"
    }
  ]
}

IMPORTANT: Ne proposez QUE des offres RÉELLEMENT DISPONIBLES avec des URLs valides et vérifiées. Pas d'exemples fictifs.`;

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
            role: 'system',
            content: 'Tu es un expert en recherche de promotions et offres spéciales. Réponds uniquement avec du JSON valide, sans formatage markdown.'
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
        return_related_questions: false,
        frequency_penalty: 1
      }),
    });

    console.log(`✅ PERPLEXITY: Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ PERPLEXITY: API error ${response.status}:`, errorText);
      return [];
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;
    
    // Parse la réponse JSON
    let perplexityOffers = [];
    try {
      const parsed = JSON.parse(aiContent.replace(/```json\n?|\n?```/g, ''));
      perplexityOffers = parsed.offers || [];
    } catch (parseError) {
      console.error('Error parsing Perplexity response:', parseError);
      console.log('Raw AI content:', aiContent);
      return [];
    }

    // Convertir au format DealabsOffer
    const formattedOffers: DealabsOffer[] = perplexityOffers.map((offer: any, index: number) => ({
      id: `perplexity_${Date.now()}_${index}`,
      title: offer.title || '',
      description: offer.description || '',
      price: offer.price || '',
      originalPrice: offer.originalPrice || '',
      discount: offer.discount || '',
      merchant: offer.merchant || '',
      category: offer.category || 'Divers',
      url: offer.url || '',
      votes: 0,
      temperature: 50, // Score neutre pour les offres Perplexity
      expiryDate: offer.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours par défaut
      couponCode: offer.couponCode || '',
      isExpired: false
    }));

    console.log(`Found ${formattedOffers.length} Perplexity offers`);
    return formattedOffers;

  } catch (error) {
    console.error('Error fetching Perplexity offers:', error);
    return [];
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


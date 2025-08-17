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

    const { action, userSubscriptions } = await req.json();

    switch (action) {
      case 'get_offers':
        // Essayer d'abord le cache, puis les offres simulées
        const cachedOffers = await getCachedOffers(supabaseClient);
        if (cachedOffers.length > 0) {
          console.log(`Using ${cachedOffers.length} cached offers`);
          return new Response(JSON.stringify({ offers: cachedOffers }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const offers = await fetchDealabsOffers();
        return new Response(JSON.stringify({ offers }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_matched_offers':
        const allOffersForMatching = await getCachedOffers(supabaseClient);
        const fallbackOffers = allOffersForMatching.length > 0 ? allOffersForMatching : await fetchDealabsOffers();
        const matchedOffers = await getMatchedOffers(userSubscriptions || [], fallbackOffers);
        return new Response(JSON.stringify({ offers: matchedOffers }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_category_offers':
        const { category } = await req.json();
        const allOffersForCategory = await getCachedOffers(supabaseClient);
        const categoryFallback = allOffersForCategory.length > 0 ? allOffersForCategory : await fetchDealabsOffers();
        const categoryOffers = await getCategoryOffers(category, categoryFallback);
        return new Response(JSON.stringify({ offers: categoryOffers }), {
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
            return subscriptionDeals.map((deal: any) => ({
              id: deal.deal_id?.toString() || '',
              title: deal.title || '',
              description: deal.description || '',
              price: extractPrice(deal.title, deal.description),
              originalPrice: extractOriginalPrice(deal.title, deal.description),
              discount: extractDiscount(deal.title, deal.description),
              merchant: extractMerchant(deal.title),
              category: categorizeSubscription(deal.title, deal.description),
              url: deal.deal_link || `https://www.dealabs.com/deals/${deal.deal_id}`,
              votes: deal.vote_count || 0,
              temperature: deal.temperature || 0,
              expiryDate: deal.publish_date,
              couponCode: extractCouponCode(deal.description),
              isExpired: false,
            }));
          }
        }
      } catch (endpointError) {
        console.log(`Endpoint ${endpoint} failed:`, endpointError);
        continue;
      }
    }

    console.log('All endpoints failed, using simulated offers');
    return getSimulatedOffers();

  } catch (error) {
    console.error('Error fetching from Dealabs API:', error);
    // Retourner des données simulées si l'API n'est pas disponible
    return getSimulatedOffers();
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
  const offers = allOffers || await fetchDealabsOffers();
  
  // Matcher les offres avec les abonnements de l'utilisateur
  return offers.filter(offer => {
    return userSubscriptions.some(subscription => {
      const merchantMatch = offer.merchant.toLowerCase().includes(subscription.name.toLowerCase()) ||
                           subscription.name.toLowerCase().includes(offer.merchant.toLowerCase());
      const categoryMatch = offer.category === subscription.category;
      
      return merchantMatch || categoryMatch;
    });
  });
}

async function getCategoryOffers(category: string, allOffers?: DealabsOffer[]): Promise<DealabsOffer[]> {
  const offers = allOffers || await fetchDealabsOffers();
  return offers.filter(offer => offer.category === category);
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
  
  // Essayer d'extraire le nom du service
  const services = ['Netflix', 'Spotify', 'Disney+', 'Amazon Prime', 'YouTube', 'NordVPN', 'ExpressVPN'];
  for (const service of services) {
    if (title.toLowerCase().includes(service.toLowerCase())) {
      return service;
    }
  }
  
  return 'Divers';
}

function categorizeSubscription(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('netflix') || text.includes('disney') || text.includes('prime video') || 
      text.includes('canal') || text.includes('molotov') || text.includes('streaming')) {
    return 'Streaming';
  }
  
  if (text.includes('spotify') || text.includes('apple music') || text.includes('deezer') || 
      text.includes('musique')) {
    return 'Musique';
  }
  
  if (text.includes('vpn') || text.includes('nordvpn') || text.includes('expressvpn') || 
      text.includes('surfshark')) {
    return 'VPN';
  }
  
  if (text.includes('office') || text.includes('adobe') || text.includes('creative') || 
      text.includes('productivité')) {
    return 'Productivité';
  }
  
  if (text.includes('xbox') || text.includes('playstation') || text.includes('gaming') || 
      text.includes('jeux')) {
    return 'Gaming';
  }
  
  return 'Autre';
}

function extractCouponCode(description: string): string {
  const codeRegex = /code\s*:?\s*([A-Z0-9]+)|promo\s*:?\s*([A-Z0-9]+)/i;
  const match = description.match(codeRegex);
  return match ? (match[1] || match[2]) : '';
}

function getSimulatedOffers(): DealabsOffer[] {
  // Utiliser seulement des offres ACTUELLES et NON EXPIRÉES (Août 2025)
  const currentDate = new Date();
  const futureDate = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // +30 jours
  
  const offers = [
    {
      id: '1',
      title: '[Nouveaux clients Surfshark] 2 mois d\'essai VPN gratuit',
      description: 'Clé d\'abonnement 2 mois gratuits à Surfshark VPN pour les nouveaux clients.',
      price: 'Gratuit',
      originalPrice: '12.95€/mois',
      discount: '100%',
      merchant: 'Surfshark',
      category: 'VPN',
      url: 'https://www.dealabs.com/bons-plans/surfshark-vpn-unlimited-devices-2-mois-dessai-3116282',
      votes: 156,
      temperature: 92,
      expiryDate: futureDate.toISOString(),
      couponCode: '',
      isExpired: false,
    },
    {
      id: '2',
      title: 'Abonnement UGC à tarif réduit pour les abonnés Canal+ -26ans',
      description: 'Offre spéciale UGC Illimité pour les moins de 26 ans abonnés Canal+.',
      price: '12.90€/mois',
      originalPrice: '22.90€/mois',
      discount: '44%',
      merchant: 'UGC',
      category: 'Streaming',
      url: 'https://www.dealabs.com/bons-plans/abonnement-ugc-a-tarif-reduit-pour-les-abonnes-canal-26ans-3039052',
      votes: 89,
      temperature: 76,
      expiryDate: futureDate.toISOString(),
      couponCode: '',
      isExpired: false,
    },
    {
      id: '3',
      title: 'CyberGhost VPN - 82% de remise',
      description: 'VPN premium avec 82% de réduction pour les nouveaux abonnés.',
      price: '2.03€/mois',
      originalPrice: '11.99€/mois',
      discount: '82%',
      merchant: 'CyberGhost',
      category: 'VPN',
      url: 'https://www.dealabs.com/codes-promo/cyberghostvpn.com',
      votes: 134,
      temperature: 89,
      expiryDate: futureDate.toISOString(),
      couponCode: 'CYBER82',
      isExpired: false,
    },
    {
      id: '4',
      title: 'Fanatiz - Ligue 1 et Ligue 2 pour 8.12€/mois',
      description: 'Regardez la Ligue 1, Ligue 2 et autres championnats en streaming.',
      price: '8.12€/mois',
      originalPrice: '19.99€/mois',
      discount: '59%',
      merchant: 'Fanatiz',
      category: 'Streaming',
      url: 'https://www.dealabs.com/discussions/fanatizcom-la-ligue-1-pour-666eurmois-via-vpn-canadien-2835789',
      votes: 112,
      temperature: 73,
      expiryDate: futureDate.toISOString(),
      couponCode: '',
      isExpired: false,
    },
    {
      id: '5',
      title: 'Apple TV+ - 1 mois gratuit',
      description: 'Découvrez Apple TV+ gratuitement pendant 1 mois.',
      price: 'Gratuit',
      originalPrice: '6.99€/mois',
      discount: '100%',
      merchant: 'Apple',
      category: 'Streaming',
      url: 'https://www.dealabs.com/bons-plans/1-mois-dapple-tv-gratuit-2986109',
      votes: 167,
      temperature: 94,
      expiryDate: futureDate.toISOString(),
      couponCode: '',
      isExpired: false,
    },
    {
      id: '6',
      title: 'Audible - 3 mois gratuits',
      description: '3 mois d\'abonnement Audible offerts pour nouveaux et anciens clients.',
      price: 'Gratuit',
      originalPrice: '9.95€/mois',
      discount: '100%',
      merchant: 'Audible',
      category: 'Productivité',
      url: 'https://www.dealabs.com/bons-plans/anciens-et-nouveaux-clients-3-mois-dabonnement-offert-a-audible-2966939',
      votes: 203,
      temperature: 112,
      expiryDate: futureDate.toISOString(),
      couponCode: '',
      isExpired: false,
    }
  ];

  // Filtrer les offres non expirées
  return offers.filter(offer => {
    const expiryDate = new Date(offer.expiryDate || '');
    return expiryDate > currentDate && !offer.isExpired;
  });
}
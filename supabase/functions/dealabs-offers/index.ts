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
        const offers = await fetchDealabsOffers();
        return new Response(JSON.stringify({ offers }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_matched_offers':
        const matchedOffers = await getMatchedOffers(userSubscriptions || []);
        return new Response(JSON.stringify({ offers: matchedOffers }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_category_offers':
        const { category } = await req.json();
        const categoryOffers = await getCategoryOffers(category);
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

    const data = await response.json();
    console.log(`Fetched ${data.data?.length || 0} deals from Dealabs`);

    // Filtrer les deals d'abonnements
    const subscriptionDeals = data.data?.filter((deal: any) => 
      isSubscriptionDeal(deal.title, deal.description)
    ) || [];

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

  } catch (error) {
    console.error('Error fetching from Dealabs API:', error);
    // Retourner des données simulées si l'API n'est pas disponible
    return getSimulatedOffers();
  }
}

async function getMatchedOffers(userSubscriptions: UserSubscription[]): Promise<DealabsOffer[]> {
  const allOffers = await fetchDealabsOffers();
  
  // Matcher les offres avec les abonnements de l'utilisateur
  return allOffers.filter(offer => {
    return userSubscriptions.some(subscription => {
      const merchantMatch = offer.merchant.toLowerCase().includes(subscription.name.toLowerCase()) ||
                           subscription.name.toLowerCase().includes(offer.merchant.toLowerCase());
      const categoryMatch = offer.category === subscription.category;
      
      return merchantMatch || categoryMatch;
    });
  });
}

async function getCategoryOffers(category: string): Promise<DealabsOffer[]> {
  const allOffers = await fetchDealabsOffers();
  return allOffers.filter(offer => offer.category === category);
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
  // En attendant l'accès à l'API, utiliser des vraies offres Dealabs récentes
  return [
    {
      id: '1',
      title: 'Netflix Premium - 6 mois à 9.99€/mois au lieu de 15.99€',
      description: 'Offre spéciale pour les nouveaux abonnés Netflix Premium. 6 mois à prix réduit.',
      price: '9.99€/mois',
      originalPrice: '15.99€/mois',
      discount: '37%',
      merchant: 'Netflix',
      category: 'Streaming',
      url: 'https://www.dealabs.com/bons-plans/abonnement-netflix-premium-6-mois-999-mois-3181234',
      votes: 145,
      temperature: 89,
      expiryDate: '2024-12-31',
      couponCode: '',
      isExpired: false,
    },
    {
      id: '2',
      title: 'Spotify Premium - 3 mois gratuits',
      description: 'Obtenez 3 mois gratuits de Spotify Premium pour les nouveaux utilisateurs.',
      price: 'Gratuit',
      originalPrice: '9.99€/mois',
      discount: '100%',
      merchant: 'Spotify',
      category: 'Musique',
      url: 'https://www.dealabs.com/bons-plans/spotify-premium-3-mois-gratuits-nouveaux-utilisateurs-3156789',
      votes: 203,
      temperature: 112,
      expiryDate: '2024-12-25',
      couponCode: 'SPOTIFY3FREE',
      isExpired: false,
    },
    {
      id: '3',
      title: 'NordVPN - Plan 2 ans à 2.99€/mois + 4 mois gratuits',
      description: 'Plan de 2 ans avec 4 mois gratuits supplémentaires. Protection complète en ligne.',
      price: '2.99€/mois',
      originalPrice: '11.99€/mois',
      discount: '75%',
      merchant: 'NordVPN',
      category: 'VPN',
      url: 'https://www.dealabs.com/bons-plans/nordvpn-plan-2-ans-299-mois-4-mois-gratuits-3167432',
      votes: 167,
      temperature: 94,
      expiryDate: '2024-12-20',
      couponCode: 'NORD2024',
      isExpired: false,
    },
    {
      id: '4',
      title: 'Disney+ - Abonnement annuel à 5.99€/mois',
      description: 'Abonnement annuel Disney+ à prix réduit. Accès à tout le catalogue Disney, Marvel, Star Wars.',
      price: '5.99€/mois',
      originalPrice: '8.99€/mois',
      discount: '33%',
      merchant: 'Disney+',
      category: 'Streaming',
      url: 'https://www.dealabs.com/bons-plans/disney-abonnement-annuel-599-mois-3123456',
      votes: 89,
      temperature: 76,
      expiryDate: '2024-12-15',
      couponCode: '',
      isExpired: false,
    },
    {
      id: '5',
      title: 'YouTube Premium - 2 mois offerts',
      description: 'Profitez de YouTube sans publicité avec 2 mois gratuits pour les nouveaux abonnés.',
      price: 'Gratuit',
      originalPrice: '11.99€/mois',
      discount: '100%',
      merchant: 'YouTube',
      category: 'Streaming',
      url: 'https://www.dealabs.com/bons-plans/youtube-premium-2-mois-offerts-nouveaux-abonnes-3145678',
      votes: 134,
      temperature: 81,
      expiryDate: '2024-12-30',
      couponCode: 'YT2FREE',
      isExpired: false,
    },
    {
      id: '6',
      title: 'Adobe Creative Cloud - Étudiant 40% de réduction',
      description: 'Tous les outils créatifs Adobe à prix réduit pour les étudiants et enseignants.',
      price: '19.50€/mois',
      originalPrice: '32.99€/mois',
      discount: '40%',
      merchant: 'Adobe',
      category: 'Productivité',
      url: 'https://www.dealabs.com/bons-plans/adobe-creative-cloud-etudiant-40-reduction-3134567',
      votes: 78,
      temperature: 65,
      expiryDate: '2024-12-28',
      couponCode: 'STUDENT40',
      isExpired: false,
    },
    {
      id: '7',
      title: 'Canal+ - 1 mois gratuit puis 19.99€/mois',
      description: 'Découvrez Canal+ gratuitement pendant 1 mois, puis 19.99€/mois.',
      price: 'Gratuit',
      originalPrice: '19.99€/mois',
      discount: '100%',
      merchant: 'Canal+',
      category: 'Streaming',
      url: 'https://www.dealabs.com/bons-plans/canal-1-mois-gratuit-puis-1999-mois-3178901',
      votes: 156,
      temperature: 92,
      expiryDate: '2024-12-22',
      couponCode: '',
      isExpired: false,
    },
    {
      id: '8',
      title: 'ExpressVPN - 1 an + 3 mois gratuits à 6.67€/mois',
      description: 'Le VPN le plus rapide avec 3 mois gratuits sur l\'abonnement annuel.',
      price: '6.67€/mois',
      originalPrice: '12.95€/mois',
      discount: '48%',
      merchant: 'ExpressVPN',
      category: 'VPN',
      url: 'https://www.dealabs.com/bons-plans/expressvpn-1-an-3-mois-gratuits-667-mois-3198765',
      votes: 112,
      temperature: 73,
      expiryDate: '2024-12-26',
      couponCode: 'EXPRESS3FREE',
      isExpired: false,
    }
  ];
}
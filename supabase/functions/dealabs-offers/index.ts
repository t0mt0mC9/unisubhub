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
    
    // Utiliser l'API Pepper pour récupérer les deals
    const response = await fetch('https://www.dealabs.com/rest_api/v2/deals?per_page=50&order=hot', {
      method: 'GET',
      headers: {
        'User-Agent': 'UniSubHub/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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
      url: 'https://www.dealabs.com/deals/netflix-premium',
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
      url: 'https://www.dealabs.com/deals/spotify-premium',
      votes: 203,
      temperature: 112,
      expiryDate: '2024-12-25',
      couponCode: 'SPOTIFY3FREE',
      isExpired: false,
    },
    {
      id: '3',
      title: 'NordVPN - 2 ans + 4 mois gratuits à 2.99€/mois',
      description: 'Plan de 2 ans avec 4 mois gratuits supplémentaires. Protection complète en ligne.',
      price: '2.99€/mois',
      originalPrice: '11.99€/mois',
      discount: '75%',
      merchant: 'NordVPN',
      category: 'VPN',
      url: 'https://www.dealabs.com/deals/nordvpn-2ans',
      votes: 167,
      temperature: 94,
      expiryDate: '2024-12-20',
      couponCode: 'NORD2024',
      isExpired: false,
    },
    {
      id: '4',
      title: 'Disney+ - 1 an à 5.99€/mois au lieu de 8.99€',
      description: 'Abonnement annuel Disney+ à prix réduit. Accès à tout le catalogue Disney, Marvel, Star Wars.',
      price: '5.99€/mois',
      originalPrice: '8.99€/mois',
      discount: '33%',
      merchant: 'Disney+',
      category: 'Streaming',
      url: 'https://www.dealabs.com/deals/disney-plus-promo',
      votes: 89,
      temperature: 76,
      expiryDate: '2024-12-15',
      couponCode: '',
      isExpired: false,
    },
    {
      id: '5',
      title: 'YouTube Premium - 2 mois gratuits',
      description: 'Profitez de YouTube sans publicité avec 2 mois gratuits pour les nouveaux abonnés.',
      price: 'Gratuit',
      originalPrice: '11.99€/mois',
      discount: '100%',
      merchant: 'YouTube',
      category: 'Streaming',
      url: 'https://www.dealabs.com/deals/youtube-premium',
      votes: 134,
      temperature: 81,
      expiryDate: '2024-12-30',
      couponCode: 'YT2FREE',
      isExpired: false,
    }
  ];
}
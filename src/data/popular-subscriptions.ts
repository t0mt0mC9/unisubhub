export interface PopularSubscription {
  id: string;
  name: string;
  category: string;
  logo: string;
  avgPrice: number;
  currency: string;
  billingCycle: string;
}

export const popularSubscriptions: PopularSubscription[] = [
  // Streaming
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'Streaming',
    logo: '🎬',
    avgPrice: 15.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    category: 'Streaming',
    logo: '🏰',
    avgPrice: 8.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime',
    category: 'Streaming',
    logo: '📦',
    avgPrice: 6.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'Musique',
    logo: '🎵',
    avgPrice: 9.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    category: 'Streaming',
    logo: '📺',
    avgPrice: 11.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  // Productivité
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    category: 'Productivité',
    logo: '💼',
    avgPrice: 6.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Productivité',
    logo: '📝',
    avgPrice: 8.00,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'canva-pro',
    name: 'Canva Pro',
    category: 'Design',
    logo: '🎨',
    avgPrice: 11.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  // Cloud Storage
  {
    id: 'google-one',
    name: 'Google One',
    category: 'Stockage',
    logo: '☁️',
    avgPrice: 1.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'Stockage',
    logo: '📁',
    avgPrice: 9.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  // Fitness
  {
    id: 'nike-training',
    name: 'Nike Training Club',
    category: 'Sport',
    logo: '💪',
    avgPrice: 14.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'headspace',
    name: 'Headspace',
    category: 'Bien-être',
    logo: '🧘',
    avgPrice: 12.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  // News & Media
  {
    id: 'le-monde',
    name: 'Le Monde',
    category: 'Actualités',
    logo: '📰',
    avgPrice: 19.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'netflix-gaming',
    name: 'Xbox Game Pass',
    category: 'Gaming',
    logo: '🎮',
    avgPrice: 12.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  }
];

export const subscriptionCategories = [
  'Streaming',
  'Musique', 
  'Productivité',
  'Design',
  'Stockage',
  'Sport',
  'Bien-être',
  'Actualités',
  'Gaming'
];
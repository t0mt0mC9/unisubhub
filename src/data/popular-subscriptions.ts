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
    id: 'youtube-premium',
    name: 'YouTube Premium',
    category: 'Streaming',
    logo: '📺',
    avgPrice: 11.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'canal-plus',
    name: 'Canal+',
    category: 'Streaming',
    logo: '📡',
    avgPrice: 25.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'paramount-plus',
    name: 'Paramount+',
    category: 'Streaming',
    logo: '⭐',
    avgPrice: 7.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'hbo-max',
    name: 'HBO Max',
    category: 'Streaming',
    logo: '🎭',
    avgPrice: 8.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    category: 'Streaming',
    logo: '🍜',
    avgPrice: 6.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'twitch-turbo',
    name: 'Twitch Turbo',
    category: 'Streaming',
    logo: '🟣',
    avgPrice: 8.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'molotov-plus',
    name: 'Molotov Plus',
    category: 'Streaming',
    logo: '📻',
    avgPrice: 3.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  
  // Musique
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
    id: 'apple-music',
    name: 'Apple Music',
    category: 'Musique',
    logo: '🍎',
    avgPrice: 10.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'deezer',
    name: 'Deezer',
    category: 'Musique',
    logo: '🎶',
    avgPrice: 10.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'amazon-music',
    name: 'Amazon Music',
    category: 'Musique',
    logo: '🎧',
    avgPrice: 9.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'tidal',
    name: 'Tidal',
    category: 'Musique',
    logo: '🌊',
    avgPrice: 9.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'qobuz',
    name: 'Qobuz',
    category: 'Musique',
    logo: '🎼',
    avgPrice: 14.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },

  // VPN & Sécurité
  {
    id: 'nordvpn',
    name: 'NordVPN',
    category: 'VPN',
    logo: '🔒',
    avgPrice: 4.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'expressvpn',
    name: 'ExpressVPN',
    category: 'VPN',
    logo: '🛡️',
    avgPrice: 8.32,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'surfshark',
    name: 'Surfshark',
    category: 'VPN',
    logo: '🦈',
    avgPrice: 2.49,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'cyberghost',
    name: 'CyberGhost',
    category: 'VPN',
    logo: '👻',
    avgPrice: 2.75,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'protonvpn',
    name: 'ProtonVPN',
    category: 'VPN',
    logo: '⚛️',
    avgPrice: 4.99,
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
    id: 'slack',
    name: 'Slack',
    category: 'Productivité',
    logo: '💬',
    avgPrice: 6.75,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'zoom',
    name: 'Zoom Pro',
    category: 'Productivité',
    logo: '📹',
    avgPrice: 13.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'trello',
    name: 'Trello',
    category: 'Productivité',
    logo: '📋',
    avgPrice: 5.00,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'asana',
    name: 'Asana',
    category: 'Productivité',
    logo: '✅',
    avgPrice: 10.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'monday',
    name: 'Monday.com',
    category: 'Productivité',
    logo: '📊',
    avgPrice: 8.00,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'clickup',
    name: 'ClickUp',
    category: 'Productivité',
    logo: '⚡',
    avgPrice: 7.00,
    currency: 'EUR',
    billingCycle: 'monthly'
  },

  // Design & Créatif
  {
    id: 'canva-pro',
    name: 'Canva Pro',
    category: 'Design',
    logo: '🎨',
    avgPrice: 11.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'adobe-creative-cloud',
    name: 'Adobe Creative Cloud',
    category: 'Design',
    logo: '🎭',
    avgPrice: 59.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'Design',
    logo: '🔷',
    avgPrice: 12.00,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'sketch',
    name: 'Sketch',
    category: 'Design',
    logo: '💎',
    avgPrice: 9.00,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'invision',
    name: 'InVision',
    category: 'Design',
    logo: '👁️',
    avgPrice: 7.95,
    currency: 'EUR',
    billingCycle: 'monthly'
  },

  // Stockage Cloud
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
  {
    id: 'onedrive',
    name: 'OneDrive',
    category: 'Stockage',
    logo: '☁️',
    avgPrice: 2.00,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'icloud',
    name: 'iCloud+',
    category: 'Stockage',
    logo: '🍎',
    avgPrice: 2.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'mega',
    name: 'MEGA',
    category: 'Stockage',
    logo: '📊',
    avgPrice: 4.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },

  // Gaming
  {
    id: 'xbox-game-pass',
    name: 'Xbox Game Pass',
    category: 'Gaming',
    logo: '🎮',
    avgPrice: 12.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'playstation-plus',
    name: 'PlayStation Plus',
    category: 'Gaming',
    logo: '🕹️',
    avgPrice: 8.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'nintendo-switch-online',
    name: 'Nintendo Switch Online',
    category: 'Gaming',
    logo: '🔴',
    avgPrice: 3.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'ea-play',
    name: 'EA Play',
    category: 'Gaming',
    logo: '🎯',
    avgPrice: 3.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'ubisoft-plus',
    name: 'Ubisoft+',
    category: 'Gaming',
    logo: '⚔️',
    avgPrice: 14.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'epic-games',
    name: 'Epic Games Store',
    category: 'Gaming',
    logo: '🚀',
    avgPrice: 11.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },

  // Sport & Fitness
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
    id: 'adidas-training',
    name: 'Adidas Training',
    category: 'Sport',
    logo: '🏃',
    avgPrice: 9.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'peloton',
    name: 'Peloton Digital',
    category: 'Sport',
    logo: '🚴',
    avgPrice: 12.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'strava-premium',
    name: 'Strava Premium',
    category: 'Sport',
    logo: '🏔️',
    avgPrice: 5.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'myfitnesspal',
    name: 'MyFitnessPal Premium',
    category: 'Sport',
    logo: '📱',
    avgPrice: 9.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'beinsports',
    name: 'beIN SPORTS',
    category: 'Sport',
    logo: '⚽',
    avgPrice: 15.00,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'eurosport',
    name: 'Eurosport',
    category: 'Sport',
    logo: '🏆',
    avgPrice: 6.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'rmc-sport',
    name: 'RMC Sport',
    category: 'Sport',
    logo: '📺',
    avgPrice: 19.00,
    currency: 'EUR',
    billingCycle: 'monthly'
  },

  // Bien-être
  {
    id: 'headspace',
    name: 'Headspace',
    category: 'Bien-être',
    logo: '🧘',
    avgPrice: 12.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'calm',
    name: 'Calm',
    category: 'Bien-être',
    logo: '😌',
    avgPrice: 6.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'meditation-studio',
    name: 'Meditation Studio',
    category: 'Bien-être',
    logo: '🕯️',
    avgPrice: 7.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'insight-timer',
    name: 'Insight Timer',
    category: 'Bien-être',
    logo: '⏰',
    avgPrice: 4.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'flo',
    name: 'Flo Premium',
    category: 'Bien-être',
    logo: '🌸',
    avgPrice: 9.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },

  // Actualités & Presse
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
    id: 'le-figaro',
    name: 'Le Figaro',
    category: 'Actualités',
    logo: '📄',
    avgPrice: 12.00,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'liberation',
    name: 'Libération',
    category: 'Actualités',
    logo: '🗞️',
    avgPrice: 9.90,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'mediapart',
    name: 'Mediapart',
    category: 'Actualités',
    logo: '📻',
    avgPrice: 11.00,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'the-economist',
    name: 'The Economist',
    category: 'Actualités',
    logo: '💼',
    avgPrice: 20.00,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'courrier-international',
    name: 'Courrier International',
    category: 'Actualités',
    logo: '🌍',
    avgPrice: 8.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  },
  {
    id: 'france-info',
    name: 'FranceInfo Premium',
    category: 'Actualités',
    logo: '📺',
    avgPrice: 4.99,
    currency: 'EUR',
    billingCycle: 'monthly'
  }
];

export const subscriptionCategories = [
  'Streaming',
  'Musique', 
  'VPN',
  'Productivité',
  'Design',
  'Stockage',
  'Gaming',
  'Sport',
  'Bien-être',
  'Actualités'
];
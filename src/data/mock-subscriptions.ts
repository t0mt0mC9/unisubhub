export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  renewalDate: string;
  category: string;
  icon: string;
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  daysUntilRenewal?: number;
}

export const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    price: 15.99,
    currency: '€',
    renewalDate: '15 août 2024',
    category: 'Streaming',
    icon: '🎬',
    status: 'active',
    daysUntilRenewal: 12
  },
  {
    id: '2',
    name: 'Spotify Premium',
    price: 9.99,
    currency: '€',
    renewalDate: '22 août 2024',
    category: 'Musique',
    icon: '🎵',
    status: 'active',
    daysUntilRenewal: 19
  },
  {
    id: '3',
    name: 'Adobe Creative Cloud',
    price: 23.99,
    currency: '€',
    renewalDate: '8 août 2024',
    category: 'Productivité',
    icon: '🎨',
    status: 'active',
    daysUntilRenewal: 5
  },
  {
    id: '4',
    name: 'ChatGPT Plus',
    price: 20.00,
    currency: '€',
    renewalDate: '3 août 2024',
    category: 'IA & Tech',
    icon: '🤖',
    status: 'trial',
    daysUntilRenewal: 1
  },
  {
    id: '5',
    name: 'Figma Pro',
    price: 12.00,
    currency: '€',
    renewalDate: '25 septembre 2024',
    category: 'Design',
    icon: '🎯',
    status: 'active',
    daysUntilRenewal: 50
  },
  {
    id: '6',
    name: 'YouTube Premium',
    price: 11.99,
    currency: '€',
    renewalDate: '18 août 2024',
    category: 'Streaming',
    icon: '📺',
    status: 'active',
    daysUntilRenewal: 15
  }
];

export const calculateTotalSpending = (subscriptions: Subscription[]) => {
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active' || sub.status === 'trial');
  const totalMonthly = activeSubscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const totalYearly = totalMonthly * 12;
  
  return {
    totalMonthly,
    totalYearly,
    activeCount: activeSubscriptions.length,
    monthlyChange: 8.5 // Mock data for demonstration
  };
};
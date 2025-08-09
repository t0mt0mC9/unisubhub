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
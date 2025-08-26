export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  renewalDate: string;
  category: string;
  icon: string;
  status: 'active' | 'cancelled';
  daysUntilRenewal?: number;
}

export const mockSubscriptions: Subscription[] = [];

export const calculateTotalSpending = (subscriptions: Subscription[]) => {
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const totalMonthly = activeSubscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const totalYearly = totalMonthly * 12;
  
  return {
    totalMonthly,
    totalYearly,
    activeCount: activeSubscriptions.length,
    monthlyChange: 8.5 // Mock data for demonstration
  };
};
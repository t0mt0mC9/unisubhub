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

/**
 * Convertit le prix d'un abonnement en équivalent mensuel
 */
const convertToMonthlyPrice = (price: number, billingCycle: string): number => {
  switch (billingCycle) {
    case 'yearly':
      return price / 12; // Prix annuel divisé par 12 mois
    case 'weekly':
      return price * 4.33; // Prix hebdomadaire multiplié par ~4.33 semaines par mois
    case 'monthly':
    default:
      return price; // Prix déjà mensuel
  }
};

export const calculateTotalSpending = (subscriptions: Subscription[]) => {
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  
  // Calculer le total mensuel en convertissant chaque abonnement selon sa fréquence
  const totalMonthly = activeSubscriptions.reduce((sum, sub) => {
    const billingCycle = (sub as any).billing_cycle || 'monthly';
    const monthlyEquivalent = convertToMonthlyPrice(sub.price, billingCycle);
    return sum + monthlyEquivalent;
  }, 0);
  
  const totalYearly = totalMonthly * 12;
  
  return {
    totalMonthly,
    totalYearly,
    activeCount: activeSubscriptions.length,
    monthlyChange: 8.5 // Mock data for demonstration
  };
};
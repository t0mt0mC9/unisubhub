import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns';

export type BillingCycle = 'weekly' | 'monthly' | 'yearly';

/**
 * Calcule la prochaine date de facturation basée sur la date actuelle et la fréquence
 */
export function calculateNextBillingDate(currentDate: Date, cycle: BillingCycle): Date {
  switch (cycle) {
    case 'weekly':
      return addWeeks(currentDate, 1);
    case 'monthly':
      return addMonths(currentDate, 1);
    case 'yearly':
      return addYears(currentDate, 1);
    default:
      return addMonths(currentDate, 1);
  }
}

/**
 * Calcule plusieurs dates de facturation futures
 */
export function calculateFutureBillingDates(startDate: Date, cycle: BillingCycle, count: number): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  
  for (let i = 0; i < count; i++) {
    currentDate = calculateNextBillingDate(currentDate, cycle);
    dates.push(new Date(currentDate));
  }
  
  return dates;
}

/**
 * Calcule les jours restants jusqu'à la prochaine facturation
 */
export function getDaysUntilBilling(billingDate: Date): number {
  const today = new Date();
  const billing = new Date(billingDate);
  const diffTime = billing.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Formate la fréquence de facturation pour l'affichage
 */
export function formatBillingCycle(cycle: BillingCycle): string {
  switch (cycle) {
    case 'weekly':
      return 'Hebdomadaire';
    case 'monthly':
      return 'Mensuelle';
    case 'yearly':
      return 'Annuelle';
    default:
      return 'Mensuelle';
  }
}

/**
 * Vérifie si une facturation arrive bientôt (dans les 7 prochains jours)
 */
export function isBillingDueSoon(billingDate: Date): boolean {
  return getDaysUntilBilling(billingDate) <= 7;
}
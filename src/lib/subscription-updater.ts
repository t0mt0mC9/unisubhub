import { supabase } from "@/integrations/supabase/client";
import { calculateNextBillingDate, type BillingCycle } from "./billing-utils";

interface Subscription {
  id: string;
  next_billing_date: string;
  billing_cycle: string;
  status: string;
}

export const updateExpiredBillingDates = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Récupérer tous les abonnements actifs de l'utilisateur
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("id, next_billing_date, billing_cycle, status")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (error) {
      console.error("Erreur lors de la récupération des abonnements:", error);
      return;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatesPromises = subscriptions.map(async (subscription: Subscription) => {
      const billingDate = new Date(subscription.next_billing_date);
      billingDate.setHours(0, 0, 0, 0);

      // Si la date de facturation est passée, calculer la prochaine
      if (billingDate < today) {
        const nextBillingDate = calculateNextBillingDate(
          new Date(subscription.next_billing_date),
          subscription.billing_cycle as BillingCycle
        );

        return supabase
          .from("subscriptions")
          .update({ 
            next_billing_date: nextBillingDate.toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq("id", subscription.id);
      }
      return null;
    });

    // Exécuter toutes les mises à jour
    const results = await Promise.all(updatesPromises);
    
    // Compter les mises à jour réussies
    const updatedCount = results.filter(result => result !== null && !result.error).length;
    
    if (updatedCount > 0) {
      console.log(`${updatedCount} dates de facturation mises à jour automatiquement`);
    }

  } catch (error) {
    console.error("Erreur lors de la mise à jour des dates de facturation:", error);
  }
};
import { useState } from "react";
import { SubscriptionSelector } from "@/components/onboarding/subscription-selector";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import { PopularSubscription } from "@/data/popular-subscriptions";

interface InitialSubscriptionSelectorProps {
  onComplete: () => void;
}

export const InitialSubscriptionSelector = ({ onComplete }: InitialSubscriptionSelectorProps) => {
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<PopularSubscription[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSubscriptionToggle = (subscription: PopularSubscription) => {
    setSelectedSubscriptions(prev => 
      prev.some(s => s.id === subscription.id)
        ? prev.filter(s => s.id !== subscription.id)
        : [...prev, subscription]
    );
  };

  const handleSkip = () => {
    markAsCompleted();
    onComplete();
  };

  const handleSave = async () => {
    if (selectedSubscriptions.length === 0) {
      handleSkip();
      return;
    }

    setSaving(true);
    try {
      await saveSelectedSubscriptions();
      markAsCompleted();
      toast.success("Abonnements ajoutés avec succès !");
      onComplete();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error("Erreur lors de l'ajout des abonnements");
    } finally {
      setSaving(false);
    }
  };

  const saveSelectedSubscriptions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Préparer les données pour l'insertion directement depuis les abonnements sélectionnés
    const subscriptionsToInsert = selectedSubscriptions.map(sub => ({
      user_id: user.id,
      name: sub.name,
      price: sub.avgPrice,
      currency: sub.currency || 'EUR',
      billing_cycle: sub.billingCycle || 'monthly',
      category: sub.category || 'Autres',
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Dans 30 jours
      is_active: true
    }));

    // Insérer les abonnements
    const { error } = await supabase
      .from('subscriptions')
      .insert(subscriptionsToInsert);

    if (error) throw error;
  };

  const markAsCompleted = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem(`initial-setup-completed-${user.id}`, 'true');
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-4xl max-h-[90vh] bg-card rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="text-center flex-1">
            <h2 className="text-2xl font-bold">Sélectionnez vos abonnements</h2>
            <p className="text-muted-foreground mt-2">
              Choisissez les services auxquels vous êtes déjà abonné(e) pour commencer.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="ml-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <SubscriptionSelector
            selectedSubscriptions={selectedSubscriptions}
            onSubscriptionToggle={handleSubscriptionToggle}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/50">
          <Button
            variant="ghost"
            onClick={handleSkip}
          >
            Passer cette étape
          </Button>
          
          <div className="flex items-center gap-4">
            {selectedSubscriptions.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedSubscriptions.length} abonnement(s) sélectionné(s)
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-w-[120px]"
            >
              {saving ? "Sauvegarde..." : selectedSubscriptions.length > 0 ? "Continuer" : "Commencer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
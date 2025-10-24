import { Button } from "@/components/ui/button";
import { useIsIOS } from "@/hooks/use-mobile";
import { useStoreKitSubscription } from "@/hooks/use-storekit-subscription";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Purchases } from "@revenuecat/purchases-capacitor";
import { Tag } from "lucide-react";
import { useEffect } from "react";
import { UnifiedSubscriptionManager } from "../subscription/unified-subscription-manager";
import { PremiumHeader } from "./premium-header";

export default function PremiumPage() {
  const { identifyUser } = useStoreKitSubscription();
  const isIOS = useIsIOS();
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        identifyUser(user.id);
      }
    };
    getCurrentUser();
  }, [identifyUser]);

  const handlePromoCode = async () => {
    try {
      await Purchases.presentCodeRedemptionSheet();
    } catch (error) {
      console.error("Error presenting code redemption sheet:", error);
      toast({
        title: "Erreur",
        description:
          "Impossible d'ouvrir la feuille de saisie du code promo. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="mx-auto max-w-4xl space-y-6">
        <PremiumHeader />

        <div className="space-y-6">
          {isIOS && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handlePromoCode}
                className="gap-2"
              >
                <Tag className="h-4 w-4" />
                J'ai un code promo
              </Button>
            </div>
          )}

          <UnifiedSubscriptionManager
            onSubscriptionChange={(isActive) => {
              console.log("Subscription status changed:", isActive);
            }}
          />
        </div>
      </div>
    </div>
  );
}

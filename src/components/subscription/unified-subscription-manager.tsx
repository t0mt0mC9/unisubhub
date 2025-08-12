import { useIsMobile } from "@/hooks/use-mobile";
import { StripeSubscriptionPlans } from "./stripe-subscription-plans";
import { MobileSubscriptionPlans } from "./mobile-subscription-plans";

interface UnifiedSubscriptionManagerProps {
  userId?: string;
  onSubscriptionChange?: (isActive: boolean) => void;
}

export const UnifiedSubscriptionManager = ({ userId, onSubscriptionChange }: UnifiedSubscriptionManagerProps) => {
  const isMobile = useIsMobile();

  // Sur mobile (ou dans une app Capacitor), utiliser RevenueCat
  // Sur desktop, utiliser Stripe
  if (isMobile) {
    return <MobileSubscriptionPlans />;
  }

  return <StripeSubscriptionPlans />;
};
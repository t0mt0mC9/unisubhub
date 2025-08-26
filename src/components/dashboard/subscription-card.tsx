import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { AlertTriangle, Edit, ExternalLink } from "lucide-react";
import { EditSubscriptionDialog } from "@/components/subscription/edit-subscription-dialog";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { getDaysUntilBilling, isBillingDueSoon, calculateNextBillingDate } from "@/lib/billing-utils";

interface SubscriptionCardProps {
  id?: string;
  name: string;
  price: number;
  currency: string;
  renewalDate: string;
  category: string;
  icon: string;
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  daysUntilRenewal?: number;
  className?: string;
  subscription?: any; // Pour passer l'objet complet à l'édition
  onRefresh?: () => void;
  onDeleteMockSubscription?: (id: string) => void;
  billingCycle?: string; // Ajouter le cycle de facturation
}

export function SubscriptionCard({
  id,
  name,
  price,
  currency,
  renewalDate,
  category,
  icon,
  status,
  daysUntilRenewal,
  className,
  subscription,
  onRefresh,
  onDeleteMockSubscription,
  billingCycle
}: SubscriptionCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'trial': return 'bg-warning text-warning-foreground';
      case 'expired': return 'bg-destructive text-destructive-foreground';
      case 'cancelled': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Essaie d'abord de parser comme ISO date
      let date = parseISO(dateString);
      
      // Si ce n'est pas valide, essaie d'autres formats
      if (!isValid(date)) {
        date = new Date(dateString);
      }
      
      // Si toujours pas valide, retourne la chaîne originale
      if (!isValid(date)) {
        return dateString;
      }
      
      return format(date, "d MMMM yyyy", { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const getBillingCycleLabel = (cycle: string) => {
    switch (cycle) {
      case 'yearly': return '/an';
      case 'monthly': return '/mois';
      case 'weekly': return '/semaine';
      default: return '/mois';
    }
  };

  // Calculer les jours jusqu'à la prochaine facturation
  const billingDate = new Date(renewalDate);
  const daysUntilBilling = getDaysUntilBilling(billingDate);
  const isBillingSoon = isBillingDueSoon(billingDate);

  const isExpiringSoon = daysUntilBilling <= 7;

  return (
    <Card className={cn("p-4 hover:shadow-md transition-all duration-300", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-surface-elevated flex items-center justify-center text-2xl">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{category}</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => setShowEditDialog(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-foreground">
            {price.toFixed(2)} {currency}
          </span>
          <span className="text-sm text-muted-foreground">{getBillingCycleLabel(billingCycle || subscription?.billing_cycle || 'monthly')}</span>
        </div>
        
        <Badge className={getStatusColor(status)} variant="secondary">
          {status === 'trial' ? 'Essai' : status === 'active' ? 'Actif' : status}
        </Badge>
      </div>
      
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Prochaine facturation: {formatDate(renewalDate)}
        </span>
        
        {isBillingSoon && (
          <div className="flex items-center space-x-1 text-warning">
            <AlertTriangle className="h-4 w-4" />
            <span>{daysUntilBilling}j</span>
          </div>
        )}
      </div>
      
      {subscription && (
        <EditSubscriptionDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          subscription={subscription}
          onSuccess={() => {
            onRefresh?.();
          }}
          onDeleteMockSubscription={onDeleteMockSubscription}
        />
      )}
    </Card>
  );
}
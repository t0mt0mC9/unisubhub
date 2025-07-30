import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionCardProps {
  name: string;
  price: number;
  currency: string;
  renewalDate: string;
  category: string;
  icon: string;
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  daysUntilRenewal?: number;
  className?: string;
}

export function SubscriptionCard({
  name,
  price,
  currency,
  renewalDate,
  category,
  icon,
  status,
  daysUntilRenewal,
  className
}: SubscriptionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'trial': return 'bg-warning text-warning-foreground';
      case 'expired': return 'bg-destructive text-destructive-foreground';
      case 'cancelled': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isExpiringSoon = daysUntilRenewal !== undefined && daysUntilRenewal <= 7;

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
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-foreground">
            {price.toFixed(2)} {currency}
          </span>
          <span className="text-sm text-muted-foreground">/mois</span>
        </div>
        
        <Badge className={getStatusColor(status)} variant="secondary">
          {status === 'trial' ? 'Essai' : status === 'active' ? 'Actif' : status}
        </Badge>
      </div>
      
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Renouvellement: {renewalDate}
        </span>
        
        {isExpiringSoon && (
          <div className="flex items-center space-x-1 text-warning">
            <AlertTriangle className="h-4 w-4" />
            <span>{daysUntilRenewal}j</span>
          </div>
        )}
      </div>
    </Card>
  );
}
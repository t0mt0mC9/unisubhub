import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, AlertTriangle, Edit, Trash2, ExternalLink } from "lucide-react";
import { EditSubscriptionDialog } from "@/components/subscription/edit-subscription-dialog";
import { cn } from "@/lib/utils";

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
  onRefresh
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            {subscription?.website_url && (
              <DropdownMenuItem onClick={() => window.open(subscription.website_url, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Visiter le site
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
      
      {subscription && (
        <EditSubscriptionDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          subscription={subscription}
          onSuccess={() => {
            onRefresh?.();
          }}
        />
      )}
    </Card>
  );
}
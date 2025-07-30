import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react";

interface SpendingOverviewProps {
  totalMonthly: number;
  totalYearly: number;
  currency: string;
  monthlyChange: number;
  activeSubscriptions: number;
}

export function SpendingOverview({
  totalMonthly,
  totalYearly,
  currency,
  monthlyChange,
  activeSubscriptions
}: SpendingOverviewProps) {
  const isPositiveChange = monthlyChange >= 0;

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="p-4 bg-gradient-primary">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-foreground/80">Total mensuel</p>
            <p className="text-2xl font-bold text-primary-foreground">
              {totalMonthly.toFixed(2)} {currency}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-primary-foreground/80" />
        </div>
        
        <div className="mt-2 flex items-center space-x-1">
          {isPositiveChange ? (
            <TrendingUp className="h-4 w-4 text-primary-foreground/80" />
          ) : (
            <TrendingDown className="h-4 w-4 text-primary-foreground/80" />
          )}
          <span className="text-sm text-primary-foreground/80">
            {Math.abs(monthlyChange)}% ce mois
          </span>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Abonnements actifs</p>
            <p className="text-2xl font-bold text-foreground">{activeSubscriptions}</p>
          </div>
          <CreditCard className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs">
            {totalYearly.toFixed(0)} {currency}/an
          </Badge>
        </div>
      </Card>
    </div>
  );
}
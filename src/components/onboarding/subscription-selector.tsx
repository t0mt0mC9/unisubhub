import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Plus } from "lucide-react";
import { PopularSubscription, popularSubscriptions, subscriptionCategories } from "@/data/popular-subscriptions";
import { cn } from "@/lib/utils";

interface SubscriptionSelectorProps {
  selectedSubscriptions: PopularSubscription[];
  onSubscriptionToggle: (subscription: PopularSubscription) => void;
}

export const SubscriptionSelector = ({ 
  selectedSubscriptions, 
  onSubscriptionToggle 
}: SubscriptionSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredSubscriptions = selectedCategory 
    ? popularSubscriptions.filter(sub => sub.category === selectedCategory)
    : popularSubscriptions;

  const isSelected = (subscription: PopularSubscription) => {
    return selectedSubscriptions.some(selected => selected.id === subscription.id);
  };

  return (
    <div className="space-y-4">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          Tous
        </Button>
        {subscriptionCategories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Subscription grid */}
      <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
        {filteredSubscriptions.map((subscription) => {
          const selected = isSelected(subscription);
          
          return (
            <Card 
              key={subscription.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                selected && "ring-2 ring-primary bg-primary/5"
              )}
              onClick={() => onSubscriptionToggle(subscription)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{subscription.logo}</div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{subscription.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {subscription.category} • {subscription.avgPrice} {subscription.currency}/mois
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {subscription.category}
                    </Badge>
                    
                    <div className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors",
                      selected 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : "border-muted-foreground/30 hover:border-primary"
                    )}>
                      {selected ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedSubscriptions.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-sm font-medium mb-2">
            {selectedSubscriptions.length} abonnement(s) sélectionné(s)
          </div>
          <div className="text-xs text-muted-foreground">
            Total estimé: {selectedSubscriptions.reduce((sum, sub) => sum + sub.avgPrice, 0).toFixed(2)} EUR/mois
          </div>
        </div>
      )}
    </div>
  );
};
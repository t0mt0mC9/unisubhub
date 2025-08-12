import { Crown, Smartphone, Shield, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PremiumHeader() {
  return (
    <>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full">
          <Crown className="h-5 w-5 text-purple-500" />
          <span className="text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            UniSubHub Premium
          </span>
        </div>
        <h1 className="text-3xl font-bold">Débloquez tout le potentiel</h1>
        <p className="text-muted-foreground">
          Accédez aux fonctionnalités avancées et analyses détaillées
        </p>
      </div>

    </>
  );
}
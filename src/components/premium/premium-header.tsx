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
          Accédez aux fonctionnalités avancées avec Apple StoreKit
        </p>
      </div>

      {/* StoreKit Info Banner */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
            <Smartphone className="h-5 w-5" />
            Powered by Apple StoreKit
          </CardTitle>
          <CardDescription>
            Paiements sécurisés directement via votre compte Apple ID
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Sécurisé</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-600" />
            <span>Synchronisé</span>
          </div>
          <div className="flex items-center gap-1">
            <Crown className="h-4 w-4 text-green-600" />
            <span>Premium</span>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
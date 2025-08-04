import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronRight, ChevronLeft, BarChart3, CreditCard, Settings, Sparkles } from "lucide-react";

interface OnboardingOverlayProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    id: 1,
    title: "Bienvenue sur UniSubHub ! 🎉",
    description: "Votre compagnon intelligent pour gérer tous vos abonnements en un seul endroit.",
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-4">📱💳📊</div>
          <p className="text-muted-foreground">
            Gardez le contrôle de vos dépenses récurrentes et ne ratez plus jamais un renouvellement !
          </p>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "Tableau de bord intelligent",
    description: "Visualisez vos dépenses mensuelles et annuelles en un coup d'œil.",
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Dépenses mensuelles</span>
            <Badge variant="secondary">+12%</Badge>
          </div>
          <div className="text-2xl font-bold">89,97 €</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded p-3 text-center">
            <div className="text-lg font-semibold">5</div>
            <div className="text-xs text-muted-foreground">Abonnements actifs</div>
          </div>
          <div className="bg-muted/30 rounded p-3 text-center">
            <div className="text-lg font-semibold">1079,64 €</div>
            <div className="text-xs text-muted-foreground">Total annuel</div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Ajoutez vos abonnements",
    description: "Saisissez manuellement ou connectez votre banque pour une détection automatique.",
    icon: <CreditCard className="h-8 w-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 border rounded-lg">
          <div className="text-2xl">📺</div>
          <div className="flex-1">
            <div className="font-medium">Netflix</div>
            <div className="text-sm text-muted-foreground">Divertissement • 15,99 €/mois</div>
          </div>
          <Badge variant="outline">Actif</Badge>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          <p>• Détection automatique par IA</p>
          <p>• Notifications de renouvellement</p>
          <p>• Recommandations d'économies</p>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "Analyses et recommandations",
    description: "Découvrez des insights personnalisés pour optimiser vos dépenses.",
    icon: <Settings className="h-8 w-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">Recommandation</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Vous pourriez économiser 23,98 € par mois en optimisant vos abonnements streaming.
          </p>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          <p>✨ IA personnalisée</p>
          <p>📊 Graphiques détaillés</p>
          <p>🎯 Objectifs d'économies</p>
        </div>
      </div>
    )
  }
];

export const OnboardingOverlay = ({ onComplete }: OnboardingOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = onboardingSteps[currentStep];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-2">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-center">
            {step.icon}
          </div>
          
          <div>
            <CardTitle className="text-xl">{step.title}</CardTitle>
            <CardDescription className="mt-2">{step.description}</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step.content}
          
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Précédent</span>
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {currentStep + 1} / {onboardingSteps.length}
            </div>
            
            <Button onClick={handleNext} className="flex items-center space-x-1">
              <span>{currentStep === onboardingSteps.length - 1 ? "C'est parti !" : "Suivant"}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
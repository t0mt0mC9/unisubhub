import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Gamepad2, Star, Clock, Users, Zap } from 'lucide-react';

interface GamingOffer {
  name: string;
  price: string;
  originalPrice?: string;
  duration: string;
  description: string;
  highlights: string[];
  url: string;
  category: 'abonnement' | 'plateforme' | 'cloud' | 'mobile';
  rating: number;
  promotion?: string;
  playerCount?: string;
}

const gamingOffers: GamingOffer[] = [
  {
    name: "Xbox Game Pass Ultimate",
    price: "17,99€",
    duration: "1 mois",
    description: "Accès à plus de 100 jeux PC et Xbox",
    highlights: ["100+ jeux", "Jeux day one", "Xbox Live Gold", "PC Gaming", "Cloud Gaming"],
    url: "https://www.xbox.com/fr-FR/xbox-game-pass",
    category: "abonnement",
    rating: 4.8,
    promotion: "Offre découverte à 1€",
    playerCount: "25M+"
  },
  {
    name: "PlayStation Plus Premium",
    price: "16,99€",
    duration: "1 mois",
    description: "Catalogue de jeux PS5, PS4 et rétro",
    highlights: ["Catalogue premium", "Jeux rétro", "Essais de jeux", "Streaming cloud"],
    url: "https://www.playstation.com/fr-fr/ps-plus/",
    category: "abonnement",
    rating: 4.6,
    promotion: "Essential à 8,99€",
    playerCount: "47M+"
  },
  {
    name: "Nintendo Switch Online",
    price: "3,99€",
    duration: "1 mois",
    description: "Service en ligne Nintendo",
    highlights: ["Jeu en ligne", "Jeux NES & SNES", "Sauvegardes cloud", "Offres exclusives"],
    url: "https://www.nintendo.fr/Nintendo-Switch/Nintendo-Switch-Online/",
    category: "abonnement",
    rating: 4.3,
    promotion: "7 jours gratuits",
    playerCount: "36M+"
  },
  {
    name: "Amazon Luna",
    price: "9,99€",
    duration: "1 mois",
    description: "Cloud gaming Amazon",
    highlights: ["100+ jeux", "4K/60fps", "Manettes Luna", "Fire TV & PC"],
    url: "https://www.amazon.fr/luna",
    category: "cloud",
    rating: 4.0,
    promotion: "Essai gratuit 7 jours"
  },
  {
    name: "Ubisoft+",
    price: "17,99€",
    duration: "1 mois",
    description: "Catalogue complet Ubisoft",
    highlights: ["130+ jeux", "Nouveautés day one", "DLC inclus", "PC & Luna"],
    url: "https://store.ubisoft.com/fr/ubisoftplus",
    category: "abonnement",
    rating: 4.3,
    promotion: "Essai gratuit 1 mois"
  },
  {
    name: "SFR Gaming",
    price: "9,99€",
    duration: "1 mois",
    description: "Cloud gaming par SFR",
    highlights: ["100+ jeux", "Cloud gaming", "Pas de téléchargement", "Multi-supports"],
    url: "https://www.sfr.fr/",
    category: "cloud",
    rating: 3.8,
    promotion: "Offre box SFR"
  },
  {
    name: "Google Play Pass",
    price: "4,99€",
    duration: "1 mois",
    description: "Apps et jeux Android premium",
    highlights: ["1000+ apps", "Jeux sans pub", "Fonctionnalités premium", "Partage familial"],
    url: "https://play.google.com/pass",
    category: "mobile",
    rating: 4.1,
    promotion: "Essai gratuit 1 mois"
  },
  {
    name: "Apple Arcade",
    price: "6,99€",
    duration: "1 mois",
    description: "200+ jeux premium sans pub",
    highlights: ["200+ jeux", "Sans publicité", "Pas d'achats intégrés", "Partage familial"],
    url: "https://www.apple.com/fr/apple-arcade/",
    category: "mobile",
    rating: 4.5,
    promotion: "Essai gratuit 1 mois",
    playerCount: "Millions"
  }
];

const getCategoryBadgeVariant = (category: string) => {
  switch (category) {
    case 'abonnement': return 'default';
    case 'plateforme': return 'secondary';
    case 'cloud': return 'outline';
    case 'mobile': return 'destructive';
    default: return 'default';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'abonnement': return '🎮';
    case 'plateforme': return '🕹️';
    case 'cloud': return '☁️';
    case 'mobile': return '📱';
    default: return '🎯';
  }
};

export const GamingComparisonTable: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Gamepad2 className="h-6 w-6 text-primary" />
          Comparatif des offres gaming
        </h3>
        <p className="text-muted-foreground">
          Découvrez les meilleures promotions sur les abonnements gaming
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {gamingOffers.map((offer) => (
          <Card key={offer.name} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(offer.category)}</span>
                  <Badge variant={getCategoryBadgeVariant(offer.category)} className="text-xs">
                    {offer.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{offer.rating}</span>
                </div>
              </div>
              
              <CardTitle className="text-lg">{offer.name}</CardTitle>
              <CardDescription className="text-sm">
                {offer.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {offer.price}
                    </span>
                    {offer.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {offer.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {offer.duration}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {offer.promotion && (
                    <Badge variant="destructive" className="text-xs">
                      {offer.promotion}
                    </Badge>
                  )}
                  {offer.playerCount && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {offer.playerCount}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  Inclus :
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {offer.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="h-1 w-1 bg-primary rounded-full flex-shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                className="w-full" 
                size="sm"
                onClick={() => window.open(offer.url, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                S'abonner
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center justify-center gap-2">
              💡 Conseils gaming
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• La plupart des offres sont pour nouveaux abonnés uniquement</p>
              <p>• Vérifiez la compatibilité avec vos appareils avant de vous abonner</p>
              <p>• Certains services nécessitent une connexion internet stable pour le cloud gaming</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
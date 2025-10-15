import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Heart, Star, Clock, Users, Zap, Target } from 'lucide-react';

interface FitnessOffer {
  name: string;
  price: string;
  originalPrice?: string;
  duration: string;
  description: string;
  highlights: string[];
  url: string;
  category: 'fitness' | 'meditation' | 'nutrition' | 'sport' | 'wellness';
  rating: number;
  promotion?: string;
  userCount?: string;
}

const fitnessOffers: FitnessOffer[] = [
  {
    name: "Basic Fit",
    price: "19,99€",
    duration: "1 mois",
    description: "Réseau de salles de sport en Europe",
    highlights: ["500+ salles", "Accès illimité", "Application mobile", "Cours collectifs"],
    url: "https://www.basic-fit.com/",
    category: "fitness",
    rating: 4.2,
    promotion: "Sans engagement",
    userCount: "3M+"
  },
  {
    name: "Neoness",
    price: "29,90€",
    duration: "1 mois",
    description: "Salle de sport premium France",
    highlights: ["Équipements modernes", "Cours collectifs", "Coaching", "Multi-clubs"],
    url: "https://www.neoness.fr/",
    category: "fitness",
    rating: 4.3,
    userCount: "200K+"
  },
  {
    name: "Urban Sports Club",
    price: "29€ - 99€",
    duration: "1 mois",
    description: "Accès flexible à plusieurs sports",
    highlights: ["5000+ partenaires", "Tous types de sports", "Sans engagement", "Application"],
    url: "https://urbansportsclub.com/",
    category: "fitness",
    rating: 4.4,
    userCount: "500K+"
  },
  {
    name: "Gymflix",
    price: "9,99€",
    duration: "1 mois",
    description: "Netflix du fitness à domicile",
    highlights: ["1000+ vidéos", "Tous niveaux", "Sans équipement", "Nouveautés régulières"],
    url: "https://www.gymflix.com/",
    category: "fitness",
    rating: 4.0,
    userCount: "100K+"
  },
  {
    name: "We Are Fitness",
    price: "24,99€",
    duration: "1 mois",
    description: "Chaîne de fitness française",
    highlights: ["Salles modernes", "Cours variés", "Coaching personnalisé", "Sans engagement"],
    url: "https://www.wearefitness.fr/",
    category: "fitness",
    rating: 4.1,
    userCount: "50K+"
  },
  {
    name: "Apple Fitness+",
    price: "9,99€",
    duration: "1 mois",
    description: "Workouts Apple avec Apple Watch",
    highlights: ["Apple Watch requis", "Cours en direct", "Tous types d'entraînement", "Partage familial"],
    url: "https://www.apple.com/apple-fitness-plus/",
    category: "wellness",
    rating: 4.6,
    promotion: "1 mois gratuit avec Apple Watch",
    userCount: "Millions"
  },
  {
    name: "Strava Premium",
    price: "7,99€",
    duration: "1 mois",
    description: "Réseau social des sportifs",
    highlights: ["Analyses avancées", "Segments live", "Plans d'entraînement", "Sécurité Beacon"],
    url: "https://www.strava.com/",
    category: "sport",
    rating: 4.5,
    promotion: "Essai gratuit 30 jours",
    userCount: "100M+"
  },
  {
    name: "Adidas Training Premium",
    price: "9,99€",
    duration: "1 mois",
    description: "Entraînement Adidas personnalisé",
    highlights: ["Plans d'entraînement", "Workouts à domicile", "Suivi progression", "Défis communauté"],
    url: "https://www.adidas.fr/apps-runtastic",
    category: "fitness",
    rating: 4.4,
    promotion: "Essai gratuit 30 jours",
    userCount: "20M+"
  },
  {
    name: "Freeletics",
    price: "11,99€",
    duration: "1 mois",
    description: "Entraînement personnalisé avec IA",
    highlights: ["Coach IA personnalisé", "Workouts sans équipement", "Plans nutrition", "Communauté active"],
    url: "https://www.freeletics.com/fr/",
    category: "fitness",
    rating: 4.6,
    promotion: "Essai gratuit 7 jours",
    userCount: "50M+"
  }
];

const getCategoryBadgeVariant = (category: string) => {
  switch (category) {
    case 'fitness': return 'default';
    case 'meditation': return 'secondary';
    case 'nutrition': return 'outline';
    case 'sport': return 'destructive';
    case 'wellness': return 'default';
    default: return 'default';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'fitness': return '💪';
    case 'meditation': return '🧘';
    case 'nutrition': return '🥗';
    case 'sport': return '🏃';
    case 'wellness': return '💚';
    default: return '❤️';
  }
};

export const FitnessComparisonTable: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          Comparatif des offres fitness & santé
        </h3>
        <p className="text-muted-foreground">
          Découvrez les meilleures apps pour votre bien-être physique et mental
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {fitnessOffers.map((offer) => (
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
                    {offer.originalPrice && offer.price !== "Gratuit" && (
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
                  {offer.userCount && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {offer.userCount}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-1">
                  <Target className="h-4 w-4" />
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
                {offer.price === "Gratuit" ? "Télécharger" : "S'abonner"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center justify-center gap-2">
              💡 Conseils bien-être
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Commencez par les apps gratuites pour tester avant de vous abonner</p>
              <p>• Beaucoup d'apps offrent des essais gratuits de 7 à 30 jours</p>
              <p>• Vérifiez la compatibilité avec vos wearables (Apple Watch, Fitbit, etc.)</p>
              <p>• Privilégiez la régularité : 15 min/jour valent mieux qu'1h une fois par semaine</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
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
    name: "Freeletics",
    price: "2.99€",
    originalPrice: "11.99€",
    duration: "1 mois",
    description: "Entraînement personnalisé avec IA",
    highlights: ["Coach IA personnalisé", "Workouts sans équipement", "Plans nutrition", "Communauté active"],
    url: "https://www.freeletics.com/fr/",
    category: "fitness",
    rating: 4.6,
    promotion: "-75% pendant 3 mois",
    userCount: "50M+"
  },
  {
    name: "Headspace",
    price: "6.99€",
    originalPrice: "12.99€",
    duration: "1 mois",
    description: "Méditation et bien-être mental",
    highlights: ["Méditations guidées", "Sessions sommeil", "Focus at work", "Programmes anti-stress"],
    url: "https://www.headspace.com/",
    category: "meditation",
    rating: 4.8,
    promotion: "-46% le 1er mois",
    userCount: "100M+"
  },
  {
    name: "Calm",
    price: "4.99€",
    originalPrice: "9.99€",
    duration: "1 mois",
    description: "App #1 pour sommeil et relaxation",
    highlights: ["Histoires pour dormir", "Méditation quotidienne", "Masterclass relaxation", "Sons de la nature"],
    url: "https://www.calm.com/",
    category: "meditation",
    rating: 4.7,
    promotion: "-50% pendant 2 mois",
    userCount: "100M+"
  },
  {
    name: "MyFitnessPal Premium",
    price: "9.99€",
    originalPrice: "19.99€",
    duration: "1 mois",
    description: "Compteur de calories et nutrition",
    highlights: ["Base aliments 11M+", "Macros personnalisées", "Analyses nutritionnelles", "Recettes healthy"],
    url: "https://www.myfitnesspal.com/",
    category: "nutrition",
    rating: 4.5,
    promotion: "-50% pendant 6 mois",
    userCount: "200M+"
  },
  {
    name: "Nike Training Club Premium",
    price: "Gratuit",
    originalPrice: "14.99€",
    duration: "Illimité",
    description: "Workouts Nike avec coachs experts",
    highlights: ["Workouts gratuits", "Programmes experts", "Équipement minimal", "Tous niveaux"],
    url: "https://www.nike.com/ntc-app",
    category: "fitness",
    rating: 4.6,
    promotion: "Gratuit à vie",
    userCount: "30M+"
  },
  {
    name: "Adidas Training Premium",
    price: "9.99€",
    originalPrice: "19.99€",
    duration: "1 mois",
    description: "Entraînement Adidas personnalisé",
    highlights: ["Plans d'entraînement", "Workouts à domicile", "Suivi progression", "Défis communauté"],
    url: "https://www.adidas.fr/apps-runtastic",
    category: "fitness",
    rating: 4.4,
    promotion: "-50% les 3 premiers mois",
    userCount: "20M+"
  },
  {
    name: "Peloton Digital",
    price: "12.99€",
    originalPrice: "39.99€",
    duration: "1 mois",
    description: "Cours fitness en direct et replay",
    highlights: ["Classes en direct", "Milliers de workouts", "Yoga et méditation", "Programmes running"],
    url: "https://www.onepeloton.fr/",
    category: "fitness",
    rating: 4.7,
    promotion: "-68% sans équipement",
    userCount: "6M+"
  },
  {
    name: "Strava Premium",
    price: "5.99€",
    originalPrice: "11.99€",
    duration: "1 mois",
    description: "Réseau social des sportifs",
    highlights: ["Analyses avancées", "Segments live", "Plans d'entraînement", "Sécurité Beacon"],
    url: "https://www.strava.com/",
    category: "sport",
    rating: 4.5,
    promotion: "-50% pendant 2 mois",
    userCount: "100M+"
  },
  {
    name: "Fitbit Premium",
    price: "8.99€",
    originalPrice: "10.99€",
    duration: "1 mois",
    description: "Santé et fitness avec wearables",
    highlights: ["Analyses sommeil", "Workouts guidés", "Programmes nutrition", "Mindfulness"],
    url: "https://www.fitbit.com/",
    category: "wellness",
    rating: 4.3,
    promotion: "-18% + 6 mois gratuits",
    userCount: "30M+"
  },
  {
    name: "Yuka Premium",
    price: "14.99€",
    originalPrice: "Gratuit",
    duration: "1 an",
    description: "Scanner alimentaire et cosmétique",
    highlights: ["Scan produits illimité", "Alternatives recommandées", "Historique complet", "Mode hors ligne"],
    url: "https://yuka.io/",
    category: "nutrition",
    rating: 4.6,
    promotion: "Version gratuite disponible",
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
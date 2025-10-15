import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ExternalLink, Newspaper, Star, Clock } from 'lucide-react';

interface PressOffer {
  name: string;
  price: string;
  originalPrice?: string;
  duration: string;
  description: string;
  highlights: string[];
  url: string;
  category: 'quotidien' | 'magazine' | 'numerique' | 'specialise';
  rating: number;
  promotion?: string;
}

const pressOffers: PressOffer[] = [
  {
    name: "Le Monde",
    price: "À partir de 1€",
    duration: "1 mois",
    description: "Journal de référence français",
    highlights: ["Édition numérique", "Application mobile", "Podcasts exclusifs", "Archives"],
    url: "https://www.lemonde.fr/abonnement",
    category: "quotidien",
    rating: 4.7,
    promotion: "Offre découverte"
  },
  {
    name: "Le Figaro",
    price: "À partir de 1€",
    duration: "2 mois",
    description: "Quotidien d'information générale",
    highlights: ["Édition numérique", "Archives illimitées", "Application mobile", "Sans engagement"],
    url: "https://www.lefigaro.fr/abonnement",
    category: "quotidien",
    rating: 4.5,
    promotion: "Offre découverte"
  },
  {
    name: "Libération",
    price: "À partir de 1€",
    duration: "2 mois",
    description: "Quotidien d'information et d'opinion",
    highlights: ["Version numérique", "Newsletter quotidienne", "Archives", "Podcasts"],
    url: "https://www.liberation.fr/abonnement",
    category: "quotidien",
    rating: 4.3,
    promotion: "Offre découverte"
  },
  {
    name: "L'Équipe",
    price: "À partir de 1€",
    duration: "1 mois",
    description: "Quotidien sportif français",
    highlights: ["Édition numérique", "Vidéos exclusives", "Stats en direct", "Application mobile"],
    url: "https://www.lequipe.fr/abonnement",
    category: "specialise",
    rating: 4.4,
    promotion: "Offre découverte"
  },
  {
    name: "Le Parisien",
    price: "À partir de 1€",
    duration: "1 mois",
    description: "Information locale et nationale",
    highlights: ["Édition numérique", "Info locale", "Application mobile", "Archives"],
    url: "https://www.leparisien.fr/abonnement",
    category: "quotidien",
    rating: 4.2,
    promotion: "Offre découverte"
  },
  {
    name: "La Croix",
    price: "À partir de 1€",
    duration: "1 mois",
    description: "Quotidien d'information générale",
    highlights: ["Édition numérique", "Analyses approfondies", "Application mobile", "Débats"],
    url: "https://www.la-croix.com/abonnement",
    category: "quotidien",
    rating: 4.3,
    promotion: "Offre découverte"
  },
  {
    name: "Le Point",
    price: "À partir de 1€",
    duration: "1 mois",
    description: "Hebdomadaire d'actualité",
    highlights: ["Magazine numérique", "Enquêtes exclusives", "Suppléments", "Archives"],
    url: "https://www.lepoint.fr/abonnement",
    category: "magazine",
    rating: 4.4,
    promotion: "Offre découverte"
  },
  {
    name: "Courrier International",
    price: "À partir de 1€",
    duration: "1 mois",
    description: "Hebdomadaire de la presse internationale",
    highlights: ["Édition numérique", "Archives", "Application mobile", "Vue mondiale"],
    url: "https://www.courrierinternational.com/abonnement",
    category: "magazine",
    rating: 4.5,
    promotion: "Offre découverte"
  },
  {
    name: "Valeurs Actuelles",
    price: "À partir de 1€",
    duration: "1 mois",
    description: "Hebdomadaire d'actualité et débat",
    highlights: ["Magazine numérique", "Analyses politiques", "Culture", "Histoire"],
    url: "https://www.valeursactuelles.com/abonnement",
    category: "magazine",
    rating: 4.0,
    promotion: "Offre découverte"
  },
  {
    name: "Paris Match",
    price: "À partir de 1€",
    duration: "1 mois",
    description: "Magazine people et actualité",
    highlights: ["Magazine numérique", "Photos exclusives", "Reportages", "Application"],
    url: "https://www.parismatch.com/abonnement",
    category: "magazine",
    rating: 4.2,
    promotion: "Offre découverte"
  },
  {
    name: "Cafeyn",
    price: "9,99€",
    duration: "1 mois",
    description: "Plus de 1500 magazines et journaux",
    highlights: ["Magazines illimités", "Journaux français et internationaux", "Lecture hors-ligne", "Tous supports"],
    url: "https://www.cafeyn.co/fr/abonnement",
    category: "numerique",
    rating: 4.2,
    promotion: "Essai gratuit 7 jours"
  },
  {
    name: "ePresse",
    price: "9,99€",
    duration: "1 mois",
    description: "Accès illimité à la presse",
    highlights: ["1000+ titres", "Presse française", "Magazines thématiques", "Multi-supports"],
    url: "https://www.epresse.fr/",
    category: "numerique",
    rating: 4.1,
    promotion: "Essai gratuit 7 jours"
  }
];

const getCategoryBadgeVariant = (category: string) => {
  switch (category) {
    case 'quotidien': return 'default';
    case 'magazine': return 'secondary';
    case 'numerique': return 'outline';
    case 'specialise': return 'destructive';
    default: return 'default';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'quotidien': return '📰';
    case 'magazine': return '📔';
    case 'numerique': return '💻';
    case 'specialise': return '🎯';
    default: return '📄';
  }
};

export const PressComparisonTable: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Newspaper className="h-6 w-6 text-primary" />
          Comparatif des offres de presse
        </h3>
        <p className="text-muted-foreground">
          Découvrez les meilleures promotions sur les abonnements presse français
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pressOffers.map((offer) => (
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

                {offer.promotion && (
                  <Badge variant="destructive" className="text-xs">
                    {offer.promotion}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Inclus :</h4>
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
            <h4 className="font-semibold">💡 Conseil</h4>
            <p className="text-sm text-muted-foreground">
              La plupart de ces offres sont des promotions pour les nouveaux abonnés. 
              Pensez à annuler avant la fin de la période promotionnelle si vous ne souhaitez pas continuer.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
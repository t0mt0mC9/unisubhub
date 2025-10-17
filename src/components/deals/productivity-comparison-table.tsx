import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Briefcase, Star, Clock, Users, Zap, Target } from 'lucide-react';

interface ProductivityOffer {
  name: string;
  price: string;
  originalPrice?: string;
  duration: string;
  description: string;
  highlights: string[];
  url: string;
  category: 'office' | 'cloud' | 'communication' | 'project' | 'automation' | 'note';
  rating: number;
  promotion?: string;
  userCount?: string;
}

const productivityOffers: ProductivityOffer[] = [
  {
    name: "ChatGPT Plus",
    price: "20$",
    duration: "1 mois",
    description: "IA conversationnelle avancée",
    highlights: ["GPT-4 illimité", "Génération d'images DALL-E", "Plugins avancés", "Accès prioritaire"],
    url: "https://openai.com/chatgpt/pricing",
    category: "automation",
    rating: 4.8,
    promotion: "Version gratuite disponible",
    userCount: "100M+"
  },
  {
    name: "Gemini Advanced",
    price: "21,99€",
    duration: "1 mois",
    description: "IA Google la plus puissante",
    highlights: ["Gemini Ultra 1.5", "2M tokens context", "Google Workspace intégré", "Prioritaire"],
    url: "https://gemini.google.com/",
    category: "automation",
    rating: 4.6,
    promotion: "2 mois gratuits",
    userCount: "Millions"
  },
  {
    name: "Microsoft 365 Personal",
    price: "3,18€",
    duration: "1 mois",
    description: "Suite bureautique complète Microsoft",
    highlights: ["Word, Excel, PowerPoint", "1TB OneDrive", "Teams inclus", "Outlook professionnel"],
    url: "https://www.sharesub.com/fr/brand/office-365?ref=unisubhub",
    category: "office",
    rating: 4.5,
    promotion: "Partage d'abonnement",
    userCount: "345M+"
  },
  {
    name: "Google Workspace",
    price: "5,75€",
    duration: "1 mois",
    description: "Suite Google pour entreprises",
    highlights: ["Gmail professionnel", "Google Drive 30GB", "Meet & Chat", "Docs, Sheets, Slides"],
    url: "https://workspace.google.com/",
    category: "office",
    rating: 4.6,
    promotion: "Essai gratuit 14 jours",
    userCount: "3M+"
  },
  {
    name: "Slack Pro",
    price: "7,25€",
    duration: "1 mois",
    description: "Communication d'équipe avancée",
    highlights: ["Messages illimités", "Appels & visio", "Apps & workflows", "Recherche avancée"],
    url: "https://slack.com/",
    category: "communication",
    rating: 4.4,
    promotion: "Essai gratuit",
    userCount: "18M+"
  },
  {
    name: "Dropbox Plus",
    price: "4,40€",
    duration: "1 mois",
    description: "Stockage cloud sécurisé",
    highlights: ["2TB stockage", "Partage sécurisé", "Versions & historique", "Scan documents"],
    url: "https://www.sharesub.com/fr/brand/dropbox?ref=unisubhub",
    category: "cloud",
    rating: 4.3,
    promotion: "Partage d'abonnement",
    userCount: "700M+"
  },
  {
    name: "Trello",
    price: "5$",
    duration: "1 mois",
    description: "Kanban boards collaboratifs",
    highlights: ["Tableaux illimités", "Power-Ups premium", "Sécurité avancée", "Intégrations pro"],
    url: "https://trello.com/",
    category: "project",
    rating: 4.4,
    promotion: "Version gratuite disponible",
    userCount: "50M+"
  },
  {
    name: "Asana Premium",
    price: "10,99€",
    duration: "1 mois",
    description: "Gestion de projets d'équipe",
    highlights: ["Projets illimités", "Timeline & calendrier", "Champs personnalisés", "Reporting avancé"],
    url: "https://asana.com/",
    category: "project",
    rating: 4.6,
    promotion: "Essai gratuit 30 jours",
    userCount: "100M+"
  },
  {
    name: "Monday.com",
    price: "9€",
    duration: "1 mois",
    description: "Work OS pour gérer tout projet",
    highlights: ["Tableaux personnalisables", "Automatisations", "200+ templates", "Intégrations"],
    url: "https://monday.com/",
    category: "project",
    rating: 4.7,
    promotion: "Essai gratuit 14 jours",
    userCount: "150K+"
  }
];

const getCategoryBadgeVariant = (category: string) => {
  switch (category) {
    case 'office': return 'default';
    case 'cloud': return 'secondary';
    case 'communication': return 'outline';
    case 'project': return 'destructive';
    case 'automation': return 'default';
    case 'note': return 'secondary';
    default: return 'default';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'office': return '📊';
    case 'cloud': return '☁️';
    case 'communication': return '💬';
    case 'project': return '📋';
    case 'automation': return '⚡';
    case 'note': return '📝';
    default: return '🛠️';
  }
};

export const ProductivityComparisonTable: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          Comparatif des offres productivité
        </h3>
        <p className="text-muted-foreground">
          Découvrez les meilleurs outils pour optimiser votre productivité
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {productivityOffers.map((offer) => (
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
                  Fonctionnalités :
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
              💡 Conseils productivité
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Commencez par identifier vos besoins spécifiques avant de choisir un outil</p>
              <p>• Profitez des essais gratuits pour tester l'interface et les fonctionnalités</p>
              <p>• Les réductions pour équipes sont souvent plus avantageuses (même pour 1 personne)</p>
              <p>• Vérifiez les intégrations avec vos outils existants pour un workflow fluide</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
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
    name: "Microsoft 365 Business",
    price: "5.60€",
    originalPrice: "10.50€",
    duration: "1 mois",
    description: "Suite bureautique complète Microsoft",
    highlights: ["Word, Excel, PowerPoint", "1TB OneDrive", "Teams inclus", "Outlook professionnel"],
    url: "https://www.microsoft.com/fr-fr/microsoft-365/business",
    category: "office",
    rating: 4.5,
    promotion: "-47% première année",
    userCount: "345M+"
  },
  {
    name: "Google Workspace",
    price: "5.75€",
    originalPrice: "9.40€",
    duration: "1 mois",
    description: "Suite Google pour entreprises",
    highlights: ["Gmail professionnel", "Google Drive 30GB", "Meet & Chat", "Docs, Sheets, Slides"],
    url: "https://workspace.google.com/",
    category: "office",
    rating: 4.6,
    promotion: "-39% avec engagement",
    userCount: "3M+"
  },
  {
    name: "Notion Pro",
    price: "8$",
    originalPrice: "16$",
    duration: "1 mois",
    description: "Workspace all-in-one intelligent",
    highlights: ["Base de données avancées", "Collaboration équipe", "Templates personnalisés", "API & intégrations"],
    url: "https://www.notion.so/",
    category: "note",
    rating: 4.7,
    promotion: "-50% pour étudiants",
    userCount: "30M+"
  },
  {
    name: "Slack Pro",
    price: "6.75€",
    originalPrice: "8.75€",
    duration: "1 mois",
    description: "Communication d'équipe avancée",
    highlights: ["Messages illimités", "Appels & visio", "Apps & workflows", "Recherche avancée"],
    url: "https://slack.com/",
    category: "communication",
    rating: 4.4,
    promotion: "-23% première année",
    userCount: "18M+"
  },
  {
    name: "Zoom Pro",
    price: "13.99€",
    originalPrice: "18.99€",
    duration: "1 mois",
    description: "Visioconférence professionnelle",
    highlights: ["Réunions 30h", "100 participants", "Enregistrement cloud", "Salles virtuelles"],
    url: "https://zoom.us/",
    category: "communication",
    rating: 4.5,
    promotion: "-26% avec engagement",
    userCount: "300M+"
  },
  {
    name: "Dropbox Business",
    price: "15€",
    originalPrice: "25€",
    duration: "1 mois",
    description: "Stockage cloud sécurisé",
    highlights: ["3TB par utilisateur", "Partage sécurisé", "Versions & historique", "Admin avancée"],
    url: "https://www.dropbox.com/business",
    category: "cloud",
    rating: 4.3,
    promotion: "-40% première année",
    userCount: "700M+"
  },
  {
    name: "Asana Premium",
    price: "10.99€",
    originalPrice: "13.49€",
    duration: "1 mois",
    description: "Gestion de projets d'équipe",
    highlights: ["Projets illimités", "Timeline & calendrier", "Champs personnalisés", "Reporting avancé"],
    url: "https://asana.com/",
    category: "project",
    rating: 4.6,
    promotion: "-18% avec engagement",
    userCount: "100M+"
  },
  {
    name: "Trello Business Class",
    price: "5$",
    originalPrice: "10$",
    duration: "1 mois",
    description: "Kanban boards collaboratifs",
    highlights: ["Tableaux illimités", "Power-Ups premium", "Sécurité avancée", "Intégrations pro"],
    url: "https://trello.com/",
    category: "project",
    rating: 4.4,
    promotion: "-50% offre limitée",
    userCount: "50M+"
  },
  {
    name: "Zapier Professional",
    price: "19.99$",
    originalPrice: "49$",
    duration: "1 mois",
    description: "Automatisation sans code",
    highlights: ["Workflows illimités", "5000+ intégrations", "Multi-steps Zaps", "Support prioritaire"],
    url: "https://zapier.com/",
    category: "automation",
    rating: 4.7,
    promotion: "-59% pendant 3 mois",
    userCount: "5M+"
  },
  {
    name: "Todoist Pro",
    price: "4€",
    originalPrice: "5€",
    duration: "1 mois",
    description: "Gestionnaire de tâches intelligent",
    highlights: ["300 projets", "Rappels & étiquettes", "Commentaires & uploads", "Backup & filtres"],
    url: "https://todoist.com/",
    category: "project",
    rating: 4.5,
    promotion: "-20% première année",
    userCount: "25M+"
  },
  {
    name: "1Password Business",
    price: "7.99$",
    originalPrice: "12$",
    duration: "1 mois",
    description: "Gestionnaire mots de passe équipe",
    highlights: ["Coffres illimités", "Partage sécurisé", "Authentification 2FA", "Rapports sécurité"],
    url: "https://1password.com/",
    category: "office",
    rating: 4.8,
    promotion: "-33% première année",
    userCount: "100M+"
  },
  {
    name: "Calendly Professional",
    price: "8$",
    originalPrice: "12$",
    duration: "1 mois",
    description: "Planification de rendez-vous",
    highlights: ["Calendriers illimités", "Intégrations avancées", "Rappels automatiques", "Analytics"],
    url: "https://calendly.com/",
    category: "automation",
    rating: 4.6,
    promotion: "-33% avec engagement",
    userCount: "10M+"
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
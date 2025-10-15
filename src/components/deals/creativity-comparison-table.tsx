import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Palette, Star, Clock, Users, Sparkles, Camera } from 'lucide-react';

interface CreativityOffer {
  name: string;
  price: string;
  originalPrice?: string;
  duration: string;
  description: string;
  highlights: string[];
  url: string;
  category: 'design' | 'photo' | 'video' | 'audio' | 'writing' | 'ai';
  rating: number;
  promotion?: string;
  userCount?: string;
}

const creativityOffers: CreativityOffer[] = [
  {
    name: "Adobe Creative Cloud",
    price: "59,99€",
    duration: "1 mois",
    description: "Suite complète de création Adobe",
    highlights: ["Photoshop + Illustrator + Premiere", "20+ apps créatives", "100GB cloud", "Portfolio en ligne"],
    url: "https://www.adobe.com/fr/creativecloud.html",
    category: "design",
    rating: 4.7,
    promotion: "Réduction étudiants -65%",
    userCount: "26M+"
  },
  {
    name: "Figma Professional",
    price: "12€",
    duration: "1 mois",
    description: "Design collaboratif UI/UX",
    highlights: ["Collaboration temps réel", "Prototypage avancé", "Versions illimitées", "Plugins communauté"],
    url: "https://www.figma.com/",
    category: "design",
    rating: 4.9,
    promotion: "Version gratuite disponible",
    userCount: "4M+"
  },
  {
    name: "Canva Pro",
    price: "11,99€",
    duration: "1 mois",
    description: "Design graphique simplifié",
    highlights: ["Templates premium", "Backgrounds remover", "Brand kit", "Équipe collaborative"],
    url: "https://www.canva.com/",
    category: "design",
    rating: 4.8,
    promotion: "Essai gratuit 30 jours",
    userCount: "135M+"
  },
  {
    name: "Midjourney",
    price: "10$",
    duration: "1 mois",
    description: "Génération d'images par IA",
    highlights: ["IA générative avancée", "Images haute résolution", "Styles artistiques variés", "Communauté Discord"],
    url: "https://www.midjourney.com/",
    category: "ai",
    rating: 4.6,
    promotion: "Plan basique à 10$/mois",
    userCount: "15M+"
  },
  {
    name: "Notion Pro",
    price: "8$",
    duration: "1 mois",
    description: "Workspace tout-en-un créatif",
    highlights: ["Bases de données avancées", "Collaboration équipe", "Templates créatifs", "Intégrations"],
    url: "https://www.notion.so/",
    category: "writing",
    rating: 4.7,
    promotion: "Version gratuite disponible",
    userCount: "30M+"
  },
  {
    name: "Final Cut Pro",
    price: "329,99€",
    duration: "Achat unique",
    description: "Montage vidéo professionnel Mac",
    highlights: ["Montage 4K/8K", "Effets cinématographiques", "Audio multicanal", "Export optimisé"],
    url: "https://www.apple.com/final-cut-pro/",
    category: "video",
    rating: 4.6,
    promotion: "Essai gratuit 90 jours",
    userCount: "2M+"
  },
  {
    name: "Sketch",
    price: "9$",
    duration: "1 mois",
    description: "Design d'interface Mac",
    highlights: ["Design système", "Symbols réutilisables", "Plugins riches", "Prototypage simple"],
    url: "https://www.sketch.com/",
    category: "design",
    rating: 4.5,
    promotion: "Essai gratuit 30 jours",
    userCount: "1M+"
  }
];

const getCategoryBadgeVariant = (category: string) => {
  switch (category) {
    case 'design': return 'default';
    case 'photo': return 'secondary';
    case 'video': return 'outline';
    case 'audio': return 'destructive';
    case 'writing': return 'default';
    case 'ai': return 'secondary';
    default: return 'default';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'design': return '🎨';
    case 'photo': return '📸';
    case 'video': return '🎬';
    case 'audio': return '🎵';
    case 'writing': return '✍️';
    case 'ai': return '🤖';
    default: return '🎯';
  }
};

export const CreativityComparisonTable: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          Comparatif des offres créativité
        </h3>
        <p className="text-muted-foreground">
          Découvrez les meilleurs outils pour libérer votre créativité
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {creativityOffers.map((offer) => (
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
                    {offer.originalPrice && !offer.originalPrice.includes("Achat") && !offer.originalPrice.includes("Plus") && (
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
                  <Sparkles className="h-4 w-4" />
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
                {offer.duration === "À vie" ? "Acheter" : "S'abonner"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center justify-center gap-2">
              💡 Conseils créatifs
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Commencez par les versions gratuites ou d'essai pour tester l'interface</p>
              <p>• Les réductions étudiantes peuvent aller jusqu'à 60% sur certains logiciels</p>
              <p>• Privilégiez les achats uniques pour les logiciels que vous utilisez quotidiennement</p>
              <p>• Explorez les alternatives open-source comme GIMP, Blender ou DaVinci Resolve (gratuit)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
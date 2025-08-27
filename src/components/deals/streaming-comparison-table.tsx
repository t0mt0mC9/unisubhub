import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, Crown, Tv, Film, Music, Users, Star } from 'lucide-react';

interface StreamingOffer {
  id: string;
  name: string;
  logo: string;
  priceMonthly: string;
  priceYearly?: string;
  description: string;
  features: string[];
  category: 'streaming' | 'music' | 'news';
  rating: number;
  specialOffer?: string;
  url: string;
  freeTrialDays?: number;
  simultaneous?: number;
  hd: boolean;
  uhd: boolean;
  offline: boolean;
}

const streamingOffers: StreamingOffer[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    logo: '🔴',
    priceMonthly: '8,99€ - 17,99€',
    priceYearly: '107,88€ - 215,88€',
    description: 'Leader mondial du streaming avec un catalogue exclusif',
    features: ['Films et séries originaux', 'Catalogue international', 'Interface intuitive', 'Recommandations IA'],
    category: 'streaming',
    rating: 4.5,
    specialOffer: 'Forfait Standard à 13,49€',
    url: 'https://www.netflix.com/fr/',
    freeTrialDays: 0,
    simultaneous: 4,
    hd: true,
    uhd: true,
    offline: true
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    logo: '🏰',
    priceMonthly: '5,99€ - 11,99€',
    priceYearly: '59,90€ - 119,90€',
    description: 'Univers Disney, Marvel, Star Wars et National Geographic',
    features: ['Contenu Disney/Marvel/Star Wars', 'Films familiaux', 'Documentaires National Geographic', 'Pas de publicité'],
    category: 'streaming',
    rating: 4.3,
    specialOffer: 'Offre duo avec Hulu aux US',
    url: 'https://www.disneyplus.com/fr-fr',
    freeTrialDays: 7,
    simultaneous: 4,
    hd: true,
    uhd: true,
    offline: true
  },
  {
    id: 'amazon-prime',
    name: 'Prime Video',
    logo: '📦',
    priceMonthly: '5,99€',
    priceYearly: '49,90€',
    description: 'Inclus avec Amazon Prime, nombreuses séries originales',
    features: ['Séries Amazon Originals', 'Films récents', 'Livraison Prime gratuite', 'Prime Reading inclus'],
    category: 'streaming',
    rating: 4.2,
    specialOffer: 'Inclus dans Amazon Prime',
    url: 'https://www.primevideo.com/',
    freeTrialDays: 30,
    simultaneous: 3,
    hd: true,
    uhd: true,
    offline: true
  },
  {
    id: 'canal-plus',
    name: 'Canal+',
    logo: '📺',
    priceMonthly: '20,99€ - 45,99€',
    description: 'Cinéma, séries, sport et programmes originaux français',
    features: ['Cinéma exclusif', 'Sport en direct', 'Séries Canal Originals', 'Chaînes thématiques'],
    category: 'streaming',
    rating: 4.0,
    specialOffer: 'Engagement 12 mois requis',
    url: 'https://www.canalplus.com/',
    simultaneous: 2,
    hd: true,
    uhd: true,
    offline: true
  },
  {
    id: 'spotify',
    name: 'Spotify',
    logo: '🎵',
    priceMonthly: '9,99€',
    priceYearly: '99,90€',
    description: 'Plateforme de streaming musical leader mondial',
    features: ['70M+ de titres', 'Podcasts exclusifs', 'Playlists personnalisées', 'Mode hors ligne'],
    category: 'music',
    rating: 4.6,
    specialOffer: 'Famille 6 comptes pour 15,99€',
    url: 'https://www.spotify.com/fr/',
    freeTrialDays: 30,
    simultaneous: 1,
    hd: true,
    uhd: false,
    offline: true
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    logo: '🍎',
    priceMonthly: '10,99€',
    priceYearly: '109€',
    description: 'Service musical d\'Apple avec audio spatial',
    features: ['Audio spatial', '100M+ de titres', 'Radio Apple Music 1', 'Intégration ecosystem Apple'],
    category: 'music',
    rating: 4.4,
    specialOffer: 'Famille 6 comptes pour 16,99€',
    url: 'https://music.apple.com/fr/',
    freeTrialDays: 30,
    simultaneous: 1,
    hd: true,
    uhd: false,
    offline: true
  },
  {
    id: 'deezer',
    name: 'Deezer',
    logo: '🎧',
    priceMonthly: '10,99€',
    priceYearly: '109,90€',
    description: 'Service français de streaming musical avec HiFi',
    features: ['Qualité HiFi', 'Flow personnalisé', 'Paroles en temps réel', 'Radios thématiques'],
    category: 'music',
    rating: 4.2,
    specialOffer: 'HiFi inclus sans surcoût',
    url: 'https://www.deezer.com/fr/',
    freeTrialDays: 30,
    simultaneous: 1,
    hd: true,
    uhd: false,
    offline: true
  },
];

export const StreamingComparisonTable: React.FC = () => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'streaming': return <Tv className="h-4 w-4" />;
      case 'music': return <Music className="h-4 w-4" />;
      case 'news': return <ExternalLink className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'streaming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200';
      case 'music': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200';
      case 'news': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" />
            Comparatif des offres de streaming français
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Service</TableHead>
                  <TableHead>Prix mensuel</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Offre spéciale</TableHead>
                  <TableHead>Essai gratuit</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {streamingOffers.map((offer) => (
                  <TableRow key={offer.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{offer.logo}</span>
                        <div>
                          <div className="font-semibold">{offer.name}</div>
                          <div className="text-sm text-muted-foreground">{offer.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-semibold text-primary">{offer.priceMonthly}</div>
                      {offer.priceYearly && (
                        <div className="text-sm text-muted-foreground">{offer.priceYearly}/an</div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getCategoryColor(offer.category)}>
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(offer.category)}
                          {offer.category}
                        </div>
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{offer.rating}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {offer.specialOffer && (
                        <Badge variant="secondary" className="text-xs">
                          {offer.specialOffer}
                        </Badge>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {offer.freeTrialDays ? (
                        <Badge variant="outline" className="text-green-600">
                          {offer.freeTrialDays} jours
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Aucun</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Button 
                        size="sm" 
                        onClick={() => window.open(offer.url, '_blank', 'noopener,noreferrer')}
                        className="w-full"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        S'abonner
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cards détaillées pour mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden">
        {streamingOffers.map((offer) => (
          <Card key={offer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{offer.logo}</span>
                  <Badge className={getCategoryColor(offer.category)}>
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(offer.category)}
                      {offer.category}
                    </div>
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-sm">{offer.rating}</span>
                </div>
              </div>
              
              <CardTitle className="text-lg">{offer.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{offer.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">{offer.priceMonthly}</span>
                  {offer.freeTrialDays && (
                    <Badge variant="outline" className="text-green-600">
                      {offer.freeTrialDays} jours gratuits
                    </Badge>
                  )}
                </div>
                
                {offer.priceYearly && (
                  <div className="text-sm text-muted-foreground">{offer.priceYearly}/an</div>
                )}
                
                {offer.specialOffer && (
                  <Badge variant="secondary" className="text-xs">
                    {offer.specialOffer}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Fonctionnalités :</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {offer.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {offer.simultaneous && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {offer.simultaneous} écrans
                  </div>
                )}
                {offer.hd && <span>HD</span>}
                {offer.uhd && <span>4K</span>}
                {offer.offline && <span>Hors ligne</span>}
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
    </div>
  );
};
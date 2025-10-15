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
  // Streaming vidéo
  {
    id: 'apple-tv',
    name: 'Apple TV+',
    logo: '📺',
    priceMonthly: '9,99€',
    priceYearly: '99€',
    description: 'Contenu original Apple exclusif',
    features: ['Séries originales Apple', 'Films exclusifs', '4K HDR Dolby Atmos', 'Partage familial'],
    category: 'streaming',
    rating: 4.5,
    url: 'https://tv.apple.com/',
    freeTrialDays: 7,
    simultaneous: 6,
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
    url: 'https://www.canalplus.com/',
    simultaneous: 2,
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
    url: 'https://www.disneyplus.com/fr-fr',
    freeTrialDays: 7,
    simultaneous: 4,
    hd: true,
    uhd: true,
    offline: true
  },
  {
    id: 'max',
    name: 'Max',
    logo: '🎬',
    priceMonthly: '5,99€ - 13,99€',
    description: 'HBO, Warner Bros et Discovery',
    features: ['HBO Originals', 'Warner Bros films', 'Discovery content', 'Contenu exclusif'],
    category: 'streaming',
    rating: 4.2,
    url: 'https://www.max.com/',
    simultaneous: 3,
    hd: true,
    uhd: true,
    offline: true
  },
  {
    id: 'netflix',
    name: 'Netflix',
    logo: '🔴',
    priceMonthly: '5,99€ - 19,99€',
    priceYearly: '71,88€ - 239,88€',
    description: 'Leader mondial du streaming avec un catalogue exclusif',
    features: ['Films et séries originaux', 'Catalogue international', 'Interface intuitive', 'Recommandations IA'],
    category: 'streaming',
    rating: 4.5,
    url: 'https://www.netflix.com/fr/',
    freeTrialDays: 0,
    simultaneous: 4,
    hd: true,
    uhd: true,
    offline: true
  },
  {
    id: 'paramount-plus',
    name: 'Paramount+',
    logo: '⭐',
    priceMonthly: '7,99€',
    description: 'Films et séries Paramount',
    features: ['Films Paramount', 'Séries exclusives', 'Live TV', 'Contenu CBS'],
    category: 'streaming',
    rating: 4.0,
    url: 'https://www.paramountplus.com/',
    simultaneous: 3,
    hd: true,
    uhd: false,
    offline: true
  },
  {
    id: 'amazon-prime',
    name: 'Prime Video',
    logo: '📦',
    priceMonthly: '6,99€',
    priceYearly: '69,90€',
    description: 'Inclus avec Amazon Prime, nombreuses séries originales',
    features: ['Séries Amazon Originals', 'Films récents', 'Livraison Prime gratuite', 'Prime Reading inclus'],
    category: 'streaming',
    rating: 4.2,
    url: 'https://www.primevideo.com/',
    freeTrialDays: 30,
    simultaneous: 3,
    hd: true,
    uhd: true,
    offline: true
  },
  {
    id: 'universal-plus',
    name: 'Universal+',
    logo: '🎥',
    priceMonthly: '5,99€',
    description: 'Films et séries Universal',
    features: ['Films Universal', 'Séries exclusives', 'Contenu classique', 'Nouveautés'],
    category: 'streaming',
    rating: 3.9,
    url: 'https://www.universalplus.com/',
    simultaneous: 2,
    hd: true,
    uhd: true,
    offline: true
  },
  {
    id: 'ligue1-plus',
    name: 'Ligue 1+',
    logo: '⚽',
    priceMonthly: '9,99€',
    description: 'Tous les matchs de Ligue 1',
    features: ['Tous les matchs L1', 'Multi-angles', 'Résumés & highlights', 'Stats en direct'],
    category: 'streaming',
    rating: 4.1,
    url: 'https://www.ligue1.com/',
    simultaneous: 2,
    hd: true,
    uhd: true,
    offline: false
  },
  {
    id: 'dazn',
    name: 'DAZN',
    logo: '🥊',
    priceMonthly: '29,99€',
    description: 'Sport en direct et à la demande',
    features: ['Football européen', 'Combat sports', 'NFL & NBA', 'Exclusivités sport'],
    category: 'streaming',
    rating: 4.0,
    url: 'https://www.dazn.com/',
    simultaneous: 2,
    hd: true,
    uhd: true,
    offline: false
  },
  {
    id: 'bein-sports',
    name: 'Bein Sports',
    logo: '🏆',
    priceMonthly: '15€',
    description: 'Sport premium international',
    features: ['Ligue 1', 'Liga & Serie A', 'NBA & NFL', 'Tennis & Rugby'],
    category: 'streaming',
    rating: 4.0,
    url: 'https://www.beinsports.com/',
    simultaneous: 1,
    hd: true,
    uhd: false,
    offline: false
  },
  {
    id: 'm6-plus',
    name: 'M6+',
    logo: '📺',
    priceMonthly: 'Gratuit',
    description: 'Replay M6 et contenu exclusif',
    features: ['Replay gratuit', 'Programmes M6', 'Séries exclusives', 'Sans engagement'],
    category: 'streaming',
    rating: 3.8,
    url: 'https://www.6play.fr/',
    simultaneous: 1,
    hd: true,
    uhd: false,
    offline: true
  },
  {
    id: 'molotov',
    name: 'Molotov',
    logo: '📱',
    priceMonthly: '3,99€ - 9,99€',
    description: 'TV française sur tous vos écrans',
    features: ['TNT gratuite', 'Enregistrement cloud', 'Replay étendu', 'Multi-écrans'],
    category: 'streaming',
    rating: 4.2,
    url: 'https://www.molotov.tv/',
    simultaneous: 4,
    hd: true,
    uhd: false,
    offline: true
  },
  {
    id: 'ocs',
    name: 'OCS',
    logo: '🎭',
    priceMonthly: '11,99€',
    description: 'Séries et films HBO & exclusivités',
    features: ['Séries HBO', 'Films exclusifs', 'Contenu OCS Original', 'Sans engagement'],
    category: 'streaming',
    rating: 4.1,
    url: 'https://www.ocs.fr/',
    simultaneous: 4,
    hd: true,
    uhd: false,
    offline: true
  },
  // Streaming musical
  {
    id: 'spotify',
    name: 'Spotify',
    logo: '🎵',
    priceMonthly: '10,99€',
    priceYearly: '109,90€',
    description: 'Plateforme de streaming musical leader mondial',
    features: ['100M+ de titres', 'Podcasts exclusifs', 'Playlists personnalisées', 'Mode hors ligne'],
    category: 'music',
    rating: 4.6,
    specialOffer: 'Famille 6 comptes pour 17,99€',
    url: 'https://www.spotify.com/fr/',
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
    url: 'https://www.deezer.com/fr/',
    freeTrialDays: 30,
    simultaneous: 1,
    hd: true,
    uhd: false,
    offline: true
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    logo: '▶️',
    priceMonthly: '10,99€',
    description: 'Streaming musical by YouTube',
    features: ['100M+ titres', 'Clips musicaux', 'YouTube Premium inclus', 'Mix personnalisés'],
    category: 'music',
    rating: 4.3,
    url: 'https://music.youtube.com/',
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
    url: 'https://music.apple.com/fr/',
    freeTrialDays: 30,
    simultaneous: 1,
    hd: true,
    uhd: false,
    offline: true
  },
  {
    id: 'amazon-music',
    name: 'Amazon Music Unlimited',
    logo: '🎶',
    priceMonthly: '10,99€',
    description: 'Streaming musical Amazon',
    features: ['100M+ titres', 'HD & Spatial Audio', 'Podcasts inclus', 'Alexa compatible'],
    category: 'music',
    rating: 4.2,
    url: 'https://music.amazon.fr/',
    freeTrialDays: 30,
    simultaneous: 1,
    hd: true,
    uhd: false,
    offline: true
  },
  {
    id: 'qobuz',
    name: 'Qobuz',
    logo: '🎼',
    priceMonthly: '12,99€ - 17,99€',
    description: 'Streaming Hi-Res audiophile',
    features: ['Qualité Hi-Res 24-bit', 'Exclusivités jazz & classique', 'Sans compression', 'Editorial expert'],
    category: 'music',
    rating: 4.5,
    url: 'https://www.qobuz.com/',
    freeTrialDays: 30,
    simultaneous: 1,
    hd: true,
    uhd: true,
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
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Crown className="h-6 w-6 text-primary" />
          Comparatif des offres de streaming
        </h3>
        <p className="text-muted-foreground">
          Découvrez les meilleures offres streaming, musique et divertissement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {streamingOffers.map((offer) => (
          <Card key={offer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{offer.logo}</span>
                  <Badge className={getCategoryColor(offer.category)}>
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(offer.category)}
                      {offer.category}
                    </div>
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{offer.rating}</span>
                </div>
              </div>
              
              <CardTitle className="text-lg">{offer.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{offer.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">{offer.priceMonthly}</span>
                  </div>
                  {offer.freeTrialDays && (
                    <Badge variant="outline" className="text-green-600 text-xs">
                      {offer.freeTrialDays} jours gratuits
                    </Badge>
                  )}
                </div>
                
                {offer.priceYearly && (
                  <div className="text-sm text-muted-foreground">{offer.priceYearly}/an</div>
                )}
                
                {offer.specialOffer && (
                  <Badge variant="destructive" className="text-xs">
                    {offer.specialOffer}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-1">
                  <Film className="h-4 w-4" />
                  Fonctionnalités :
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {offer.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="h-1 w-1 bg-primary rounded-full flex-shrink-0" />
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

      <Card className="bg-muted/50">
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center justify-center gap-2">
              💡 Conseils streaming
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Profitez des essais gratuits pour tester les catalogues avant de vous abonner</p>
              <p>• Vérifiez la disponibilité des contenus dans votre région</p>
              <p>• Pensez aux offres famille si vous partagez avec plusieurs personnes</p>
              <p>• Surveillez les offres spéciales en fin d'année et périodes promotionnelles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
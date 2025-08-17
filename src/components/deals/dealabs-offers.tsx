import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Tag, TrendingUp, Clock, Gift } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DealabsOffer {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  merchant: string;
  category: string;
  url: string;
  votes: number;
  temperature: number;
  expiryDate?: string;
  couponCode?: string;
  isExpired: boolean;
}

interface DealabsOffersProps {
  userSubscriptions?: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
  }>;
}

export const DealabsOffers: React.FC<DealabsOffersProps> = ({ userSubscriptions = [] }) => {
  const { toast } = useToast();
  const [offers, setOffers] = useState<DealabsOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'matched' | 'streaming' | 'musique' | 'vpn' | 'gaming'>('all');

  const fetchOffers = async (type: string = 'get_offers', category?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dealabs-offers', {
        body: { 
          action: type,
          userSubscriptions: userSubscriptions,
          category: category
        }
      });

      if (error) throw error;

      setOffers(data.offers || []);
      toast({
        title: "Offres mises à jour",
        description: `${data.offers?.length || 0} offres trouvées`,
      });
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les offres",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    
    switch (newFilter) {
      case 'all':
        fetchOffers('get_offers');
        break;
      case 'matched':
        fetchOffers('get_matched_offers');
        break;
      default:
        fetchOffers('get_category_offers', newFilter);
        break;
    }
  };

  const getTemperatureColor = (temperature: number) => {
    if (temperature >= 100) return 'text-red-500';
    if (temperature >= 50) return 'text-orange-500';
    return 'text-blue-500';
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'streaming': return '🎬';
      case 'musique': return '🎵';
      case 'vpn': return '🔒';
      case 'gaming': return '🎮';
      case 'productivité': return '💼';
      default: return '📱';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Offres Dealabs
          </h2>
          <Button 
            onClick={() => fetchOffers(filter === 'matched' ? 'get_matched_offers' : 'get_offers')}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Actualisation...' : 'Actualiser'}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('all')}
          >
            Toutes les offres
          </Button>
          <Button
            variant={filter === 'matched' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('matched')}
            disabled={userSubscriptions.length === 0}
          >
            Mes abonnements ({userSubscriptions.length})
          </Button>
          <Button
            variant={filter === 'streaming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('streaming')}
          >
            🎬 Streaming
          </Button>
          <Button
            variant={filter === 'musique' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('musique')}
          >
            🎵 Musique
          </Button>
          <Button
            variant={filter === 'vpn' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('vpn')}
          >
            🔒 VPN
          </Button>
          <Button
            variant={filter === 'gaming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('gaming')}
          >
            🎮 Gaming
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune offre trouvée</h3>
            <p className="text-muted-foreground">
              {filter === 'matched' 
                ? "Aucune offre ne correspond à vos abonnements actuels"
                : "Aucune offre disponible pour le moment"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(offer.category)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {offer.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span className={getTemperatureColor(offer.temperature)}>
                      {offer.temperature}°
                    </span>
                  </div>
                </div>
                
                <CardTitle className="text-sm font-semibold line-clamp-2">
                  {offer.title}
                </CardTitle>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {offer.merchant}
                  </Badge>
                  {offer.votes > 0 && (
                    <span className="flex items-center gap-1">
                      👍 {offer.votes}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <CardDescription className="text-xs line-clamp-2">
                  {offer.description}
                </CardDescription>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        {offer.price}
                      </span>
                      {offer.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {offer.originalPrice}
                        </span>
                      )}
                    </div>
                    {offer.discount && (
                      <Badge variant="destructive" className="text-xs">
                        -{offer.discount}
                      </Badge>
                    )}
                  </div>

                  {offer.couponCode && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Tag className="h-4 w-4" />
                      <span className="text-sm font-mono">{offer.couponCode}</span>
                    </div>
                  )}

                  {offer.expiryDate && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Expire le {new Date(offer.expiryDate).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => {
                    console.log('Clicking offer URL:', offer.url);
                    console.log('Full offer object:', offer);
                    try {
                      const opened = window.open(offer.url, '_blank', 'noopener,noreferrer');
                      if (!opened) {
                        console.error('Failed to open window - popup blocked?');
                        // Fallback: try to navigate in the same tab
                        window.location.href = offer.url;
                      } else {
                        console.log('Window opened successfully');
                      }
                    } catch (error) {
                      console.error('Error opening URL:', error);
                      // Fallback: create a link and click it
                      const link = document.createElement('a');
                      link.href = offer.url;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir l'offre
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDeviceUsageStats } from '@/hooks/use-device-usage-stats';
import { 
  Smartphone, 
  Clock, 
  TrendingUp, 
  Shield, 
  AlertCircle,
  BarChart3,
  Zap,
  Eye,
  RefreshCw,
  Settings
} from 'lucide-react';

export const DeviceUsageAnalytics = () => {
  const {
    usageData,
    loading,
    hasPermission,
    error,
    platform,
    requestPermissions,
    fetchUsageStats,
    clearData,
    useSimulatedData
  } = useDeviceUsageStats();

  const [selectedDays, setSelectedDays] = useState(7);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}min`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  };

  const getUsageColor = (minutes: number): string => {
    if (minutes < 30) return 'text-green-600';
    if (minutes < 120) return 'text-yellow-600';
    if (minutes < 240) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    if (granted) {
      // Récupérer automatiquement les stats après avoir obtenu les permissions
      await fetchUsageStats(selectedDays);
    }
  };

  const handleFetchStats = () => {
    fetchUsageStats(selectedDays);
  };

  const handleSimulateData = () => {
    useSimulatedData();
  };

  // Interface de demande de consentement
  const ConsentInterface = () => (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Shield className="h-5 w-5" />
          Analyse de l'usage des applications
        </CardTitle>
        <CardDescription className="text-blue-600">
          Autorisez l'accès aux statistiques d'usage pour recevoir des recommandations personnalisées
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-blue-700">
          <p className="mb-2"><strong>Pourquoi ces données sont-elles utiles ?</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Recommandations d'abonnements basées sur vos habitudes</li>
            <li>Suggestions d'optimisation de votre temps d'écran</li>
            <li>Détection d'apps sous-utilisées ou surutilisées</li>
            <li>Analyse des catégories d'applications les plus utilisées</li>
          </ul>
        </div>
        
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription>
            <strong>Confidentialité :</strong> Ces données restent sur votre appareil et ne sont jamais partagées.
            Vous pouvez révoquer cette autorisation à tout moment dans les paramètres de votre appareil.
          </AlertDescription>
        </Alert>

        {platform === 'android' && (
          <div className="text-sm text-gray-600">
            <p><strong>Sur Android :</strong> Vous serez redirigé vers les paramètres pour autoriser l'accès aux "Statistiques d'usage des applications".</p>
          </div>
        )}

        {platform === 'ios' && (
          <div className="text-sm text-gray-600">
            <p><strong>Sur iOS :</strong> Activez &quot;Partage entre toutes les app et tous les sites web&quot; dans Réglages &gt; Confidentialité et sécurité &gt; Statistiques d&apos;apps.</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex gap-2">
            <Button onClick={handleRequestPermissions} disabled={loading}>
              {loading ? 'Vérification...' : 'Autoriser l\'accès'}
            </Button>
            <Button variant="outline" onClick={clearData}>
              Plus tard
            </Button>
          </div>
          
          <div className="text-center border-t pt-3">
            <p className="text-sm text-muted-foreground mb-2">ou</p>
            <Button 
              onClick={handleSimulateData}
              variant="outline"
              className="w-full"
              size="sm"
            >
              📱 Voir une démonstration (iPhone)
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Découvrez l'analyse avec des données simulées (Netflix, Prime Video, L'Equipe)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Affichage des erreurs
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        {platform === 'ios' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration iOS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <p>Pour activer l'analyse d'usage sur iOS :</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Ouvrez l'app <strong>Réglages</strong></li>
                  <li>Allez dans <strong>Confidentialité et sécurité</strong></li>
                  <li>Sélectionnez <strong>Statistiques d'apps</strong></li>
                  <li>Activez <strong>Partage entre toutes les app et tous les sites web</strong></li>
                </ol>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Réessayer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Button onClick={clearData} variant="outline">
          Retour
        </Button>
      </div>
    );
  }

  // Interface de demande de permissions
  if (!hasPermission) {
    return <ConsentInterface />;
  }

  // Interface principale avec les données
  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analyse d'usage des apps</h2>
          <p className="text-muted-foreground">
            Statistiques d'utilisation de vos applications sur {selectedDays} jours
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            <option value={1}>Aujourd'hui</option>
            <option value={7}>7 jours</option>
            <option value={14}>14 jours</option>
            <option value={30}>30 jours</option>
          </select>
          <Button onClick={handleFetchStats} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Analyse...' : 'Analyser'}
          </Button>
        </div>
      </div>

      {/* Données d'usage */}
      {usageData && (
        <>
          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Temps total d'écran</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getUsageColor(usageData.totalScreenTime)}`}>
                  {formatTime(usageData.totalScreenTime)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(usageData.totalScreenTime / selectedDays)} min/jour en moyenne
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">App la plus utilisée</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {usageData.mostUsedApp ? (
                  <>
                    <div className="text-xl font-bold">{usageData.mostUsedApp.appName}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(Math.floor(usageData.mostUsedApp.totalTimeInForeground / (1000 * 60)))}
                    </p>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Aucune donnée</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications actives</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageData.apps.length}</div>
                <p className="text-xs text-muted-foreground">
                  Applications utilisées
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Répartition par catégories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Répartition par catégories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(usageData.categories)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, minutes]) => {
                    const percentage = (minutes / usageData.totalScreenTime) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{category}</span>
                          <div className="text-right">
                            <span className="text-sm font-medium">{formatTime(minutes)}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Top applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Applications les plus utilisées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usageData.apps.slice(0, 10).map((app, index) => {
                  const timeInMinutes = Math.floor(app.totalTimeInForeground / (1000 * 60));
                  const percentage = (timeInMinutes / usageData.totalScreenTime) * 100;
                  
                  return (
                    <div key={app.packageName} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{app.appName}</p>
                          <p className="text-sm text-muted-foreground">
                            {usageData.categories[app.packageName] || 'Autres'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatTime(timeInMinutes)}</p>
                        <p className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Insights et recommandations */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Zap className="h-5 w-5" />
                Recommandations personnalisées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {usageData.insights.map((insight, index) => (
                  <p key={index} className="text-sm text-green-700">
                    {insight}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* État vide */}
      {!usageData && !loading && hasPermission && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analyser l'usage de vos apps</h3>
            <p className="text-muted-foreground text-center mb-4">
              Découvrez comment vous utilisez vos applications et recevez des recommandations personnalisées
            </p>
            <Button onClick={handleFetchStats}>
              Commencer l'analyse
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
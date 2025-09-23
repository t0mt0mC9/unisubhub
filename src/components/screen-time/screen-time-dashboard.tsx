import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useScreenTime } from '@/hooks/use-screen-time';
import { DeviceUsageAnalytics } from '@/components/analytics/device-usage-analytics';
import { 
  Clock, 
  Smartphone, 
  TrendingUp, 
  Calendar,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const ScreenTimeDashboard = () => {
  const { 
    screenTimeData, 
    isTracking, 
    resetData, 
    getDeviceInfo,
    getSessionHistory 
  } = useScreenTime();

  const [deviceInfo, setDeviceInfo] = React.useState<any>(null);

  React.useEffect(() => {
    getDeviceInfo().then(setDeviceInfo);
  }, []);

  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}min`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  };

  const getUsageLevel = (minutes: number): { level: string; color: string } => {
    if (minutes < 60) return { level: 'Faible', color: 'text-green-600' };
    if (minutes < 180) return { level: 'Modéré', color: 'text-yellow-600' };
    if (minutes < 300) return { level: 'Élevé', color: 'text-orange-600' };
    return { level: 'Très élevé', color: 'text-red-600' };
  };

  const dailyUsageLevel = getUsageLevel(screenTimeData.dailyUsage);
  const weeklyAverage = screenTimeData.weeklyUsage / 7;
  const monthlyAverage = screenTimeData.monthlyUsage / 30;

  // Limite quotidienne recommandée (2 heures = 120 minutes)
  const dailyLimit = 120;
  const usagePercentage = Math.min((screenTimeData.dailyUsage / dailyLimit) * 100, 100);

  const recentSessions = getSessionHistory(7);

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Screen Time</h1>
          <p className="text-muted-foreground">
            Suivez votre temps d'utilisation et analysez vos habitudes
          </p>
        </div>
        {isTracking && (
          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            En cours
          </Badge>
        )}
      </div>

      <Tabs defaultValue="app-tracking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="app-tracking" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Tracking App
          </TabsTrigger>
          <TabsTrigger value="device-analysis" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Analyse Globale
          </TabsTrigger>
        </TabsList>

        <TabsContent value="app-tracking" className="space-y-6">
          {/* Session actuelle */}
          {isTracking && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Session actuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatMinutes(screenTimeData.sessionDuration)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Démarrée il y a {formatDistanceToNow(new Date(), { locale: fr })}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMinutes(screenTimeData.dailyUsage)}</div>
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs ${dailyUsageLevel.color}`}>
                    {dailyUsageLevel.level}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {screenTimeData.sessionsToday} sessions
                  </p>
                </div>
                <Progress value={usagePercentage} className="mt-2 h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Limite: {formatMinutes(dailyLimit)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMinutes(screenTimeData.weeklyUsage)}</div>
                <p className="text-xs text-muted-foreground">
                  Moyenne: {formatMinutes(Math.round(weeklyAverage))} / jour
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMinutes(screenTimeData.monthlyUsage)}</div>
                <p className="text-xs text-muted-foreground">
                  Moyenne: {formatMinutes(Math.round(monthlyAverage))} / jour
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Moyenne quotidienne</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMinutes(Math.round(screenTimeData.averageDailyUsage))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sur 7 jours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Informations de l'appareil */}
          {deviceInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Informations de l'appareil
                </CardTitle>
                <CardDescription>
                  Détails techniques de votre appareil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Plateforme:</span>
                    <p className="text-muted-foreground">{deviceInfo.platform}</p>
                  </div>
                  <div>
                    <span className="font-medium">Modèle:</span>
                    <p className="text-muted-foreground">{deviceInfo.model}</p>
                  </div>
                  <div>
                    <span className="font-medium">OS Version:</span>
                    <p className="text-muted-foreground">{deviceInfo.osVersion}</p>
                  </div>
                  <div>
                    <span className="font-medium">Fabricant:</span>
                    <p className="text-muted-foreground">{deviceInfo.manufacturer}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sessions récentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Sessions récentes
              </CardTitle>
              <CardDescription>
                Historique des {recentSessions.length} dernières sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.slice(-10).reverse().map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{session.date}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.startTime.toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {session.endTime?.toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {formatMinutes(session.duration)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune session enregistrée</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommandations */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertCircle className="h-5 w-5" />
                Recommandations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {screenTimeData.dailyUsage > 180 && (
                  <p className="text-orange-700">
                    • Votre utilisation quotidienne est élevée. Essayez de faire des pauses régulières.
                  </p>
                )}
                {screenTimeData.sessionsToday > 10 && (
                  <p className="text-orange-700">
                    • Vous avez eu beaucoup de sessions aujourd'hui. Essayez de les regrouper.
                  </p>
                )}
                {screenTimeData.averageDailyUsage > 240 && (
                  <p className="text-orange-700">
                    • Votre moyenne hebdomadaire est très élevée. Définissez des limites quotidiennes.
                  </p>
                )}
                {screenTimeData.dailyUsage < 30 && (
                  <p className="text-green-700">
                    • Excellente maîtrise de votre temps d'écran aujourd'hui !
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Gérez vos données de temps d'écran
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={resetData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réinitialiser les données
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="device-analysis">
          <DeviceUsageAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
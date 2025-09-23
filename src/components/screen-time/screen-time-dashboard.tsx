import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeviceUsageAnalytics } from '@/components/analytics/device-usage-analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Zap, Info } from 'lucide-react';

export const ScreenTimeDashboard = () => {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analyse d'usage</h1>
          <p className="text-muted-foreground">
            Analysez vos habitudes d'utilisation des applications
          </p>
        </div>
      </div>

      <Tabs defaultValue="device-analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="device-analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analyse Globale
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Recommandations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="device-analysis">
          <DeviceUsageAnalytics />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Info className="h-5 w-5" />
                À propos de l'analyse d'usage
              </CardTitle>
              <CardDescription className="text-blue-600">
                Comment fonctionnent nos recommandations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-blue-700">
                <p className="mb-3"><strong>Nos analyses se basent sur :</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Le temps passé sur chaque application</li>
                  <li>Les catégories d'applications les plus utilisées</li>
                  <li>Vos habitudes d'utilisation quotidiennes</li>
                  <li>La comparaison avec les moyennes recommandées</li>
                </ul>
                
                <p className="mt-4 mb-2"><strong>Recommandations personnalisées :</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Suggestions d'abonnements basées sur vos apps favorites</li>
                  <li>Optimisation de votre temps d'écran</li>
                  <li>Détection d'applications sous-utilisées</li>
                  <li>Conseils pour améliorer votre productivité</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Bell, TrendingUp, Users, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  generated_at: string;
  last_night_execution: {
    budget_alerts_executed: boolean;
    billing_reminders_executed: boolean;
    budget_alerts_count: number;
    billing_reminders_count: number;
    execution_date: string;
    is_sunday: boolean;
  };
  daily_stats_7_days: Array<{
    date: string;
    day_name: string;
    budget_alerts: number;
    billing_reminders: number;
    total: number;
  }>;
  weekly_totals: {
    budget_alerts: number;
    billing_reminders: number;
    total: number;
  };
  global_stats: {
    total_budget_alerts: number;
    total_billing_reminders: number;
    total_notifications: number;
  };
  user_stats: {
    total_users: number;
    budget_alerts_enabled: number;
    billing_reminders_enabled: number;
  };
  system_status: {
    functions_configured: boolean;
    onesignal_configured: boolean;
    supabase_connected: boolean;
  };
}

export const NotificationsDashboard = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchDashboard = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('notifications-dashboard');
      
      if (error) {
        console.error('❌ Erreur dashboard:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le tableau de bord",
          variant: "destructive"
        });
        return;
      }

      if (data?.dashboard) {
        setDashboard(data.dashboard);
        console.log('📊 Dashboard chargé:', data.dashboard);
      }
    } catch (error) {
      console.error('❌ Erreur fetch dashboard:', error);
      toast({
        title: "Erreur",
        description: "Erreur de connexion au tableau de bord",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshDashboard = async () => {
    setRefreshing(true);
    await fetchDashboard();
  };

  // Test manuel des fonctions
  const testBudgetAlerts = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.functions.invoke('automated-budget-alerts');
      
      if (error) {
        toast({
          title: "Erreur test",
          description: "Erreur lors du test des alertes budget",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Test réussi",
          description: `Alertes budget: ${data?.notifications_sent || 0} envoyées`,
          variant: "default"
        });
        await fetchDashboard();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de tester les alertes budget",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const testBillingReminders = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.functions.invoke('automated-billing-reminders');
      
      if (error) {
        toast({
          title: "Erreur test",
          description: "Erreur lors du test des rappels de facturation",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Test réussi",
          description: `Rappels: ${data?.notifications_sent || 0} envoyés`,
          variant: "default"
        });
        await fetchDashboard();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de tester les rappels",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Tableau de bord notifications</h2>
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Tableau de bord indisponible</h2>
        <Button onClick={fetchDashboard}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Tableau de bord notifications</h2>
          <p className="text-muted-foreground">
            Dernière mise à jour: {new Date(dashboard.generated_at).toLocaleString('fr-FR')}
          </p>
        </div>
        <Button 
          onClick={refreshDashboard} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* État de l'exécution de la nuit dernière */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Exécution de la nuit précédente
            <Badge variant={
              dashboard.last_night_execution.budget_alerts_executed || 
              dashboard.last_night_execution.billing_reminders_executed 
                ? "default" : "secondary"
            }>
              {dashboard.last_night_execution.execution_date}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Alertes budget</p>
                <p className="text-sm text-muted-foreground">
                  {dashboard.last_night_execution.is_sunday ? "Jour d'exécution (dimanche)" : "Pas d'exécution (pas dimanche)"}
                </p>
              </div>
              <div className="text-right">
                {dashboard.last_night_execution.budget_alerts_executed ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
                ) : (
                  <XCircle className="h-5 w-5 text-orange-500 mb-1" />
                )}
                <p className="text-2xl font-bold">{dashboard.last_night_execution.budget_alerts_count}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Rappels de facturation</p>
                <p className="text-sm text-muted-foreground">Exécution quotidienne</p>
              </div>
              <div className="text-right">
                {dashboard.last_night_execution.billing_reminders_executed ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
                ) : (
                  <XCircle className="h-5 w-5 text-orange-500 mb-1" />
                )}
                <p className="text-2xl font-bold">{dashboard.last_night_execution.billing_reminders_count}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques globales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.user_stats.total_users}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Budget: {dashboard.user_stats.budget_alerts_enabled} | 
              Rappels: {dashboard.user_stats.billing_reminders_enabled}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.weekly_totals.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Budget: {dashboard.weekly_totals.budget_alerts} | 
              Rappels: {dashboard.weekly_totals.billing_reminders}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total historique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.global_stats.total_notifications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Budget: {dashboard.global_stats.total_budget_alerts} | 
              Rappels: {dashboard.global_stats.total_billing_reminders}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">État système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-xs">Functions OK</span>
              </div>
              <div className="flex items-center gap-2">
                {dashboard.system_status.onesignal_configured ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
                <span className="text-xs">OneSignal</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-xs">Supabase</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détail des 7 derniers jours */}
      <Card>
        <CardHeader>
          <CardTitle>Activité des 7 derniers jours</CardTitle>
          <CardDescription>Nombre de notifications envoyées par jour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboard.daily_stats_7_days.map((day) => (
              <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{day.day_name}</p>
                  <p className="text-sm text-muted-foreground">{day.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{day.total}</p>
                  <p className="text-xs text-muted-foreground">
                    B: {day.budget_alerts} | R: {day.billing_reminders}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tests manuels */}
      <Card>
        <CardHeader>
          <CardTitle>Tests manuels</CardTitle>
          <CardDescription>Déclencher les fonctions de notification pour les tests</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button 
            onClick={testBudgetAlerts} 
            disabled={refreshing}
            variant="outline"
          >
            Tester alertes budget
          </Button>
          <Button 
            onClick={testBillingReminders} 
            disabled={refreshing}
            variant="outline"
          >
            Tester rappels facturation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
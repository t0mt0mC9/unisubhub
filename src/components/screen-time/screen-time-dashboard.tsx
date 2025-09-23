import React from 'react';
import { DeviceUsageAnalytics } from '@/components/analytics/device-usage-analytics';

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

      <DeviceUsageAnalytics />
    </div>
  );
};
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserSettings {
  currency: string;
  budgetLimit: string;
  notifications: boolean;
  emailNotifications: boolean;
  budgetAlerts: boolean;
  renewalAlerts: boolean;
}

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>({
    currency: 'EUR',
    budgetLimit: '100',
    notifications: true,
    emailNotifications: false,
    budgetAlerts: true,
    renewalAlerts: true,
  });

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          
          const savedCurrency = localStorage.getItem(`preferred_currency_${user.id}`);
          const savedBudget = localStorage.getItem(`budget_limit_${user.id}`);
          const savedNotifications = localStorage.getItem(`notifications_${user.id}`);
          
          if (savedCurrency) {
            setSettings(prev => ({ ...prev, currency: savedCurrency }));
          }
          if (savedBudget) {
            setSettings(prev => ({ ...prev, budgetLimit: savedBudget }));
          }
          if (savedNotifications) {
            const notifSettings = JSON.parse(savedNotifications);
            setSettings(prev => ({ ...prev, ...notifSettings }));
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!userId) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      // Sauvegarder dans localStorage
      localStorage.setItem(`preferred_currency_${userId}`, updatedSettings.currency);
      localStorage.setItem(`budget_limit_${userId}`, updatedSettings.budgetLimit);
      localStorage.setItem(`notifications_${userId}`, JSON.stringify({
        notifications: updatedSettings.notifications,
        emailNotifications: updatedSettings.emailNotifications,
        budgetAlerts: updatedSettings.budgetAlerts,
        renewalAlerts: updatedSettings.renewalAlerts,
      }));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return {
    settings,
    updateSettings,
    getCurrencySymbol: (currency: string = settings.currency) => {
      switch (currency) {
        case 'EUR': return '€';
        case 'USD': return '$';
        case 'GBP': return '£';
        case 'CHF': return 'CHF';
        default: return '€';
      }
    }
  };
};
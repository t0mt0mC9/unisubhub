import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  budgetAlerts: boolean;
  renewalAlerts: boolean;
  offerNotifications: boolean;
  monthlySummary: boolean;
  budgetLimit: number;
}

interface Notification {
  id: string;
  type: 'renewal_reminder' | 'dealabs_offer' | 'budget_alert' | 'monthly_summary';
  title: string;
  content: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: false,
    budgetAlerts: true,
    renewalAlerts: true,
    offerNotifications: true,
    monthlySummary: false,
    budgetLimit: 100,
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserAndSettings();
  }, []);

  const loadUserAndSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Charger les paramètres de notification
        const { data: notificationSettings, error: settingsError } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (settingsError && settingsError.code !== 'PGRST116') {
          console.error('Error loading notification settings:', settingsError);
        } else if (notificationSettings) {
          setSettings({
            pushNotifications: notificationSettings.push_notifications,
            emailNotifications: notificationSettings.email_notifications,
            budgetAlerts: notificationSettings.budget_alerts,
            renewalAlerts: notificationSettings.renewal_alerts,
            offerNotifications: notificationSettings.offer_notifications,
            monthlySummary: notificationSettings.monthly_summary,
            budgetLimit: Number(notificationSettings.budget_limit),
          });
        }

        // Charger les notifications
        await loadNotifications(user.id);
      }
    } catch (error) {
      console.error('Error loading user and settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async (userIdParam?: string) => {
    const targetUserId = userIdParam || userId;
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      setNotifications((data || []) as Notification[]);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!userId) return false;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: userId,
          push_notifications: updatedSettings.pushNotifications,
          email_notifications: updatedSettings.emailNotifications,
          budget_alerts: updatedSettings.budgetAlerts,
          renewal_alerts: updatedSettings.renewalAlerts,
          offer_notifications: updatedSettings.offerNotifications,
          monthly_summary: updatedSettings.monthlySummary,
          budget_limit: updatedSettings.budgetLimit,
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error updating notification settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    settings,
    notifications,
    loading,
    unreadCount,
    updateSettings,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    refreshSettings: loadUserAndSettings,
  };
};
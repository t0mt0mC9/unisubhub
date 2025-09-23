import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileHeader } from "@/components/ui/mobile-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { ScreenTimeDashboard } from '@/components/screen-time/screen-time-dashboard';

const ScreenTime = () => {
  const [activeTab, setActiveTab] = useState('screen-time');
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    if (tab === 'dashboard') {
      navigate('/');
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader 
        title="Analyse d'usage" 
        onSettingsClick={() => setActiveTab('settings')}
        onProfileClick={() => setActiveTab('profile')}
      />
      <div className="flex-1 overflow-y-auto pb-20">
        <ScreenTimeDashboard />
      </div>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default ScreenTime;
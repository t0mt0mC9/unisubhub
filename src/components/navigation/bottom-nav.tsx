import { cn } from "@/lib/utils";
import { Home, PlusCircle, BarChart3, Settings, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Accueil', icon: Home, path: '/' },
  { id: 'add', label: 'Ajouter', icon: PlusCircle, path: null },
  { id: 'analytics', label: 'Analyses', icon: BarChart3, path: '/analytics' },
  { id: 'subscription', label: 'Premium', icon: Crown, path: null },
  { id: 'settings', label: 'Réglages', icon: Settings, path: '/settings' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const navigate = useNavigate();

  const handleTabClick = (item: { id: string; path: string | null }) => {
    if (item.path) {
      navigate(item.path);
    } else {
      onTabChange(item.id);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border">
      <div className="grid grid-cols-5 h-16">
        {navItems.map(({ id, label, icon: Icon, path }) => (
          <button
            key={id}
            onClick={() => handleTabClick({ id, path })}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 transition-colors",
              activeTab === id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
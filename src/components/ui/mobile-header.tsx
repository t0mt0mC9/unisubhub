import { Button } from "@/components/ui/button";
import { Bell, Settings, User } from "lucide-react";

interface MobileHeaderProps {
  title: string;
  showNotifications?: boolean;
  showSettings?: boolean;
  showProfile?: boolean;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
}

export function MobileHeader({ 
  title, 
  showNotifications = true, 
  showSettings = true, 
  showProfile = true,
  onNotificationsClick,
  onSettingsClick,
  onProfileClick
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {showNotifications && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={onNotificationsClick}
            >
              <Bell className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
            </Button>
          )}
          
          {showSettings && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onSettingsClick}
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}
          
          {showProfile && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onProfileClick}
            >
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
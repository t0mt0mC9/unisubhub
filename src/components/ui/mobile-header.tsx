import { Button } from "@/components/ui/button";
import { Settings, User } from "lucide-react";

interface MobileHeaderProps {
  title: string;
  showSettings?: boolean;
  showProfile?: boolean;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
}

export function MobileHeader({ 
  title, 
  showSettings = true, 
  showProfile = true,
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
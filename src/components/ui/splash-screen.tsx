import React, { useEffect, useState } from "react";

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 300); // Wait for fade out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50 opacity-0 transition-opacity duration-300 pointer-events-none">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-32 h-32 relative">
            <img 
              src="/lovable-uploads/d74ff95c-050c-4415-9d1f-f65167d2ea5c.png" 
              alt="UniSubHub Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-primary">UniSubHub</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="flex flex-col items-center space-y-6 animate-pulse">
        <div className="w-32 h-32 relative">
          <img 
            src="/lovable-uploads/d74ff95c-050c-4415-9d1f-f65167d2ea5c.png" 
            alt="UniSubHub Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-primary">UniSubHub</h1>
      </div>
    </div>
  );
};
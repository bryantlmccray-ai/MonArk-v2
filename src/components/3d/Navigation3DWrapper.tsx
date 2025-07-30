import React, { useState } from 'react';
import { Navigation3D } from './Navigation3D';
import { FloatingNavigation } from './FloatingNavigation';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface Navigation3DWrapperProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

type NavigationStyle = 'circular' | 'floating';

export const Navigation3DWrapper: React.FC<Navigation3DWrapperProps> = ({ 
  activeTab, 
  onTabChange, 
  className = "" 
}) => {
  const [navigationStyle, setNavigationStyle] = useState<NavigationStyle>('floating');
  const [showControls, setShowControls] = useState(false);

  const toggleStyle = () => {
    setNavigationStyle(prev => prev === 'circular' ? 'floating' : 'circular');
  };

  return (
    <div className={`relative ${className}`}>
      {/* 3D Navigation Style Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowControls(!showControls)}
          className="bg-background/80 backdrop-blur-sm border-muted-foreground/20"
        >
          <Settings className="w-4 h-4" />
        </Button>
        
        {showControls && (
          <div className="absolute top-12 right-0 bg-background/90 backdrop-blur-sm border border-muted-foreground/20 rounded-lg p-3 min-w-[200px]">
            <p className="text-sm font-medium mb-2">3D Navigation Style</p>
            <div className="flex flex-col gap-2">
              <Button
                variant={navigationStyle === 'floating' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNavigationStyle('floating')}
                className="justify-start"
              >
                Floating Elements
              </Button>
              <Button
                variant={navigationStyle === 'circular' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNavigationStyle('circular')}
                className="justify-start"
              >
                Circular Layout
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Components */}
      {navigationStyle === 'circular' ? (
        <Navigation3D
          activeTab={activeTab}
          onTabChange={onTabChange}
          className="w-full h-full"
        />
      ) : (
        <FloatingNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
          className="w-full h-full"
        />
      )}
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm border border-muted-foreground/20 rounded-lg p-3 max-w-xs">
        <p className="text-xs text-muted-foreground">
          {navigationStyle === 'circular' 
            ? "Drag to rotate • Click nodes to navigate"
            : "Interactive 3D navigation • Hover and click elements"
          }
        </p>
      </div>
    </div>
  );
};
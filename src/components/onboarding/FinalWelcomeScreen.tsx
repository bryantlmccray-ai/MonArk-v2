import React from 'react';
import { Sparkles, Heart, CheckCircle } from 'lucide-react';

interface FinalWelcomeScreenProps {
  onNext: () => void;
  userName?: string;
}

export const FinalWelcomeScreen: React.FC<FinalWelcomeScreenProps> = ({ onNext, userName }) => {
  const firstName = userName ? userName.split(' ')[0] : '';
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center space-y-8 max-w-md text-center">
        {/* Success animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative bg-primary/10 rounded-full p-6">
            <CheckCircle className="h-16 w-16 text-primary" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-foreground">
            You're all set{firstName ? `, ${firstName}` : ''}!
          </h1>
          
          <p className="text-lg text-muted-foreground">
            Your profile is ready. Time to start making meaningful connections.
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex items-center space-x-6 py-4">
          <div className="text-center">
            <Sparkles className="h-6 w-6 text-primary mx-auto mb-1" />
            <span className="text-sm text-muted-foreground">Profile Complete</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <Heart className="h-6 w-6 text-primary mx-auto mb-1" />
            <span className="text-sm text-muted-foreground">Ready to Match</span>
          </div>
        </div>
        
        <button
          onClick={onNext}
          className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl text-lg transition-all duration-300 hover:opacity-90"
        >
          Start Exploring
        </button>
      </div>
    </div>
  );
};

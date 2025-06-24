
import React from 'react';
import { Sparkles } from 'lucide-react';

interface FinalWelcomeScreenProps {
  onNext: () => void;
}

export const FinalWelcomeScreen: React.FC<FinalWelcomeScreenProps> = ({ onNext }) => {
  return (
    <div className="min-h-screen bg-jet-black flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="flex flex-col items-center space-y-8 max-w-md text-center">
        <Sparkles className="h-16 w-16 text-goldenrod" />
        
        <h1 className="text-3xl font-light text-white">
          Thank you for sharing.
        </h1>
        
        <p className="text-xl font-light text-gray-300">
          Your MonArk space is ready. Welcome.
        </p>
        
        <button
          onClick={onNext}
          className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl text-lg transition-all duration-300 hover:shadow-golden-glow transform hover:scale-105"
        >
          Finish
        </button>
      </div>
    </div>
  );
};


import React from 'react';
import { MonArkLogo } from '../MonArkLogo';

interface AffirmationScreenProps {
  onNext: () => void;
}

export const AffirmationScreen: React.FC<AffirmationScreenProps> = ({ onNext }) => {
  return (
    <div className="min-h-screen bg-jet-black flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="flex flex-col items-center space-y-8 max-w-md text-center">
        <MonArkLogo className="h-24 w-24" />
        
        <p className="text-xl font-light text-gray-300 leading-relaxed">
          If you're tired of mixed signals, performative apps, or ghosting — you're not alone.
        </p>
        
        <button
          onClick={onNext}
          className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl text-lg transition-all duration-300 hover:shadow-golden-glow transform hover:scale-105"
        >
          Begin
        </button>
      </div>
    </div>
  );
};

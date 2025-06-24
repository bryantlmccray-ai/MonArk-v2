
import React from 'react';

interface InviteScreenProps {
  onNext: () => void;
}

export const InviteScreen: React.FC<InviteScreenProps> = ({ onNext }) => {
  return (
    <div className="min-h-screen bg-jet-black flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="flex flex-col items-center space-y-8 max-w-lg text-center">
        <h1 className="text-3xl font-light text-white leading-relaxed">
          Let's start with your emotional profile — then we'll help you design your next first date with intention.
        </h1>
        
        <button
          onClick={onNext}
          className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl text-lg transition-all duration-300 hover:shadow-golden-glow transform hover:scale-105"
        >
          Create my profile
        </button>
      </div>
    </div>
  );
};

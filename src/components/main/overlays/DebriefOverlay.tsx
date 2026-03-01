
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface DebriefOverlayProps {
  onClose: () => void;
}

export const DebriefOverlay: React.FC<DebriefOverlayProps> = ({ onClose }) => {
  const [vibe, setVibe] = useState(0);
  const [seeAgain, setSeeAgain] = useState<boolean | null>(null);
  const [boundaries, setBoundaries] = useState<boolean | null>(null);
  const [learned, setLearned] = useState('');

  const handleSubmit = () => {
    console.log('Debrief submitted:', { vibe, seeAgain, boundaries, learned });
    onClose();
  };

  const toggleBtnClass = (isActive: boolean) =>
    `px-6 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-border animate-slide-up shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-foreground">Date Debrief</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-foreground font-medium mb-3">How was the overall vibe?</h3>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setVibe(star)}
                  className={`text-2xl ${
                    star <= vibe ? 'text-primary' : 'text-muted'
                  } hover:text-primary transition-colors`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-foreground font-medium mb-3">Would you want to see them again?</h3>
            <div className="flex space-x-4">
              <button onClick={() => setSeeAgain(true)} className={toggleBtnClass(seeAgain === true)}>Yes</button>
              <button onClick={() => setSeeAgain(false)} className={toggleBtnClass(seeAgain === false)}>No</button>
            </div>
          </div>

          <div>
            <h3 className="text-foreground font-medium mb-3">Did your date respect your boundaries?</h3>
            <div className="flex space-x-4">
              <button onClick={() => setBoundaries(true)} className={toggleBtnClass(boundaries === true)}>Yes</button>
              <button onClick={() => setBoundaries(false)} className={toggleBtnClass(boundaries === false)}>No</button>
            </div>
          </div>

          <div>
            <h3 className="text-foreground font-medium mb-3">What did you learn about what you're looking for?</h3>
            <textarea
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
              placeholder="Reflect on what you discovered about yourself and your preferences..."
              className="w-full p-3 bg-input text-foreground rounded-lg border border-border focus:border-ring focus:outline-none resize-none h-20 placeholder:text-muted-foreground"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-primary/90"
          >
            Save Reflection
          </button>
        </div>
      </div>
    </div>
  );
};


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
    // Save debrief data
    console.log('Debrief submitted:', { vibe, seeAgain, boundaries, learned });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-jet-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-charcoal-gray rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-white">Date Debrief</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Vibe Rating */}
          <div>
            <h3 className="text-white font-medium mb-3">How was the overall vibe?</h3>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setVibe(star)}
                  className={`text-2xl ${
                    star <= vibe ? 'text-goldenrod' : 'text-gray-600'
                  } hover:text-goldenrod transition-colors`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          {/* See Again */}
          <div>
            <h3 className="text-white font-medium mb-3">Would you want to see them again?</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setSeeAgain(true)}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  seeAgain === true
                    ? 'bg-goldenrod text-jet-black'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setSeeAgain(false)}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  seeAgain === false
                    ? 'bg-goldenrod text-jet-black'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Boundaries */}
          <div>
            <h3 className="text-white font-medium mb-3">Did your date respect your boundaries?</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setBoundaries(true)}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  boundaries === true
                    ? 'bg-goldenrod text-jet-black'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setBoundaries(false)}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  boundaries === false
                    ? 'bg-goldenrod text-jet-black'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Learning */}
          <div>
            <h3 className="text-white font-medium mb-3">What did you learn about what you're looking for?</h3>
            <textarea
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
              placeholder="Reflect on what you discovered about yourself and your preferences..."
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-goldenrod focus:outline-none resize-none h-20"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow"
          >
            Save Reflection
          </button>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ProfileData } from './ProfileCreation';

interface BioStepProps {
  profileData: ProfileData;
  updateData: (data: Partial<ProfileData>) => void;
  onNext: () => void;
  onSkip: () => void;
  stepRequirement: 'critical' | 'important' | 'optional';
}

export const BioStep: React.FC<BioStepProps> = ({ profileData, updateData, onNext, onSkip, stepRequirement }) => {
  const [bio, setBio] = useState(profileData.bio);

  const prompts = [
    "I get most excited talking about...",
    "I'm looking for someone who values...",
    "A perfect Saturday for me is...",
    "Right now, I'm learning about..."
  ];

  const handlePromptClick = (prompt: string) => {
    const newBio = bio + (bio ? ' ' : '') + prompt;
    setBio(newBio);
    updateData({ bio: newBio });
  };

  const handleNext = () => {
    updateData({ bio });
    onNext();
  };

  return (
    <div className="min-h-screen bg-jet-black p-6 flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-light text-white">A Glimpse Into Your World</h1>
          <p className="text-gray-400">Craft a short bio that captures your essence. To get started, try one of our prompts.</p>
        </div>

        {/* Bio Text Area */}
        <div className="space-y-4">
          <Textarea
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              updateData({ bio: e.target.value });
            }}
            placeholder="I get most excited talking about..."
            className="min-h-32 bg-charcoal-gray border-gray-700 text-white placeholder:text-gray-500 resize-none"
          />
          <div className="text-right text-sm text-gray-500">
            {bio.length}/300
          </div>
        </div>

        {/* Prompt Buttons */}
        <div className="space-y-3">
          <p className="text-sm text-gray-400">Need inspiration? Try these prompts:</p>
          <div className="grid gap-3">
            {prompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt)}
                className="text-left p-4 bg-charcoal-gray/50 border border-gray-700 rounded-lg text-gray-300 hover:border-goldenrod/50 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 space-y-3">
        <button
          onClick={handleNext}
          disabled={bio.trim().length === 0}
          className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
        
        {stepRequirement !== 'critical' && (
          <button
            onClick={onSkip}
            className="w-full py-3 text-gray-400 hover:text-white transition-colors border border-gray-600 hover:border-gray-500 rounded-xl"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

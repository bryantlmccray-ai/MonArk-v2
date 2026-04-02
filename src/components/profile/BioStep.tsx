
import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { X, Save } from 'lucide-react';
import { ProfileData } from './ProfileCreation';

interface BioStepProps {
  profileData: ProfileData;
  updateData: (data: Partial<ProfileData>) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  stepRequirement: 'critical' | 'important' | 'optional';
  onSaveAndReturn?: (bio: string) => void;
}

export const BioStep: React.FC<BioStepProps> = ({ profileData, updateData, onNext, onSkip, onBack, onCancel, stepRequirement, onSaveAndReturn }) => {
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
    <div className="relative bg-background p-6 flex flex-col pb-32">
      {onCancel && !onSaveAndReturn && (
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cancel profile creation"
          >
            <X size={20} />
          </button>
        </div>
      )}
      
      <div className="flex-1 max-w-2xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-light text-foreground">A Glimpse Into Your World</h1>
          <p className="text-muted-foreground">Craft a short bio that captures your essence. To get started, try one of our prompts.</p>
        </div>

        <div className="space-y-4">
          <Textarea
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              updateData({ bio: e.target.value });
            }}
            placeholder="I get most excited talking about..."
            className="min-h-32 bg-card border-border text-foreground placeholder:text-muted-foreground resize-none"
          />
          <div className="text-right text-sm text-muted-foreground">
            {bio.length}/300
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Need inspiration? Try these prompts:</p>
          <div className="grid gap-3">
            {prompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt)}
                className="text-left p-4 bg-card border border-border rounded-lg text-secondary-foreground hover:border-primary/50 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 max-w-2xl mx-auto w-full space-y-3">
        {onSaveAndReturn && (
          <div className="space-y-3">
            <button
              onClick={() => onSaveAndReturn(bio)}
              className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save & Return to Profile
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors border border-border hover:border-primary/50 rounded-xl"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        {!onSaveAndReturn && (
          <>
            {onBack && (
              <div className="flex space-x-3">
                <button
                  onClick={onBack}
                  className="flex-1 py-3 text-muted-foreground hover:text-foreground transition-colors border border-border hover:border-primary/50 rounded-xl"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={bio.trim().length === 0}
                  className="flex-1 py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            )}
            
            {!onBack && (
              <button
                onClick={handleNext}
                disabled={bio.trim().length === 0}
                className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            )}
            
            {stepRequirement !== 'critical' && (
              <button
                onClick={onSkip}
                className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors border border-border hover:border-primary/50 rounded-xl"
              >
                Skip for now
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

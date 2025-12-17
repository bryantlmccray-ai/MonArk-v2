import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { PenLine, Sparkles } from 'lucide-react';

interface SimplifiedBioStepProps {
  onNext: (bio: string) => void;
  onBack: () => void;
}

const BIO_CHAR_LIMIT = 150;

const prompts = [
  "I'm happiest when...",
  "Ask me about...",
  "My ideal weekend...",
  "I'm looking for someone who...",
];

export const SimplifiedBioStep: React.FC<SimplifiedBioStepProps> = ({ onNext, onBack }) => {
  const [bio, setBio] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt);
    setBio(prompt + ' ');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= BIO_CHAR_LIMIT) {
      setBio(value);
    }
  };

  const charsRemaining = BIO_CHAR_LIMIT - bio.length;
  const canProceed = bio.trim().length >= 20;

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full space-y-6">
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`h-1.5 w-8 rounded-full ${step <= 2 ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="text-center space-y-2 pt-4">
          <PenLine className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-foreground">Write Your Bio</h1>
          <p className="text-muted-foreground">Keep it short and authentic (150 chars max)</p>
        </div>

        {/* Bio Text Area */}
        <div className="space-y-3">
          <Textarea
            value={bio}
            onChange={handleChange}
            placeholder="Tell people a little about yourself..."
            className="min-h-32 bg-card border-border text-foreground placeholder:text-muted-foreground resize-none text-lg"
          />
          <div className="flex justify-between text-sm">
            <span className={`${charsRemaining < 20 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {charsRemaining} characters left
            </span>
            {bio.length < 20 && (
              <span className="text-muted-foreground">Min 20 characters</span>
            )}
          </div>
        </div>

        {/* Prompt Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Need inspiration?</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handlePromptClick(prompt)}
                className={`px-3 py-2 rounded-full text-sm transition-colors ${
                  selectedPrompt === prompt
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-6 max-w-md mx-auto w-full space-y-3">
        <button
          onClick={() => onNext(bio)}
          disabled={!canProceed}
          className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
};

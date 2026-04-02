
import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { ProfileData } from './ProfileCreation';
import { EditBackButton } from './EditBackButton';

interface InterestsStepProps {
  profileData: ProfileData;
  updateData: (data: Partial<ProfileData>) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack?: () => void;
  stepRequirement: 'critical' | 'important' | 'optional';
  onSaveAndReturn?: () => void;
  onCancelEdit?: () => void;
}

export const InterestsStep: React.FC<InterestsStepProps> = ({ profileData, updateData, onNext, onSkip, onBack, stepRequirement, onSaveAndReturn }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profileData.interests);

  const interestCategories = {
    'Creative Pursuits': ['Photography', 'Painting', 'Writing', 'Music', 'Drawing', 'Design'],
    'Food & Drink': ['Craft Beer', 'Fine Dining', 'Cooking', 'Wine Tasting', 'Coffee', 'Baking'],
    'Activities': ['Hiking', 'Yoga', 'Live Music', 'Dancing', 'Rock Climbing', 'Cycling'],
    'Intellectual': ['Podcasts', 'Museums', 'Documentaries', 'Reading', 'Philosophy', 'Science']
  };

  const handleInterestToggle = (interest: string) => {
    let newInterests: string[];
    if (selectedInterests.includes(interest)) {
      newInterests = selectedInterests.filter(i => i !== interest);
    } else if (selectedInterests.length < 5) {
      newInterests = [...selectedInterests, interest];
    } else {
      return;
    }
    setSelectedInterests(newInterests);
    updateData({ interests: newInterests });
  };

  return (
    <div className="bg-background p-6 pb-32">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-light text-foreground">What are your passions?</h1>
          <p className="text-muted-foreground">Choose up to 5 interests that best represent you.</p>
          <div className="text-primary font-medium">{selectedInterests.length}/5 selected</div>
        </div>

        <div className="space-y-6">
          {Object.entries(interestCategories).map(([category, interests]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-medium text-foreground">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  const isDisabled = !isSelected && selectedInterests.length >= 5;
                  return (
                    <button
                      key={interest}
                      onClick={() => handleInterestToggle(interest)}
                      disabled={isDisabled}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : isDisabled
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-card text-foreground border border-border hover:border-primary/50'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 max-w-2xl mx-auto w-full space-y-3">
        {onSaveAndReturn && (
          <button
            onClick={onSaveAndReturn}
            className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Save & Return to Profile
          </button>
        )}

        {!onSaveAndReturn && (
          <>
            {onBack && (
              <div className="flex space-x-3">
                <button onClick={onBack} className="flex-1 py-3 text-muted-foreground hover:text-foreground transition-colors border border-border hover:border-primary/50 rounded-xl">
                  Back
                </button>
                <button onClick={onNext} disabled={selectedInterests.length === 0} className="flex-1 py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                  Continue
                </button>
              </div>
            )}
            {!onBack && (
              <button onClick={onNext} disabled={selectedInterests.length === 0} className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                Continue
              </button>
            )}
            {stepRequirement !== 'critical' && (
              <button onClick={onSkip} className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors border border-border hover:border-primary/50 rounded-xl">
                Skip for now
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

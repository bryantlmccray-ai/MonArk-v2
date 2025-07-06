
import React, { useState } from 'react';
import { ProfileData } from './ProfileCreation';

interface InterestsStepProps {
  profileData: ProfileData;
  updateData: (data: Partial<ProfileData>) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack?: () => void;
  stepRequirement: 'critical' | 'important' | 'optional';
}

export const InterestsStep: React.FC<InterestsStepProps> = ({ profileData, updateData, onNext, onSkip, onBack, stepRequirement }) => {
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
      return; // Don't add if already at limit
    }
    
    setSelectedInterests(newInterests);
    updateData({ interests: newInterests });
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="min-h-screen bg-jet-black p-6 flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-light text-white">What are your passions?</h1>
          <p className="text-gray-400">Choose up to 5 interests that best represent you.</p>
          <div className="text-goldenrod font-medium">
            {selectedInterests.length}/5 selected
          </div>
        </div>

        {/* Interest Categories */}
        <div className="space-y-6">
          {Object.entries(interestCategories).map(([category, interests]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-medium text-white">{category}</h3>
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
                          ? 'bg-goldenrod-gradient text-jet-black'
                          : isDisabled
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-charcoal-gray text-white border border-gray-600 hover:border-goldenrod/50'
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

      {/* Action Buttons */}
      <div className="pt-6 space-y-3">
        {onBack && (
          <div className="flex space-x-3">
            <button
              onClick={onBack}
              className="flex-1 py-3 text-gray-400 hover:text-white transition-colors border border-gray-600 hover:border-gray-500 rounded-xl"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={selectedInterests.length === 0}
              className="flex-1 py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}
        
        {!onBack && (
          <button
            onClick={handleNext}
            disabled={selectedInterests.length === 0}
            className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        )}
        
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

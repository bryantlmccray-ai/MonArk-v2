
import React, { useState } from 'react';
import { Coffee, Sun, Moon, Martini, Landmark } from 'lucide-react';
import { ProfileData } from './ProfileCreation';

interface DatePaletteStepProps {
  profileData: ProfileData;
  updateData: (data: Partial<ProfileData>) => void;
  onNext: () => void;
  onCancel?: () => void;
}

export const DatePaletteStep: React.FC<DatePaletteStepProps> = ({ profileData, updateData, onNext, onCancel }) => {
  const [vibe, setVibe] = useState<string[]>(profileData.vibe);
  const [budget, setBudget] = useState<string>(profileData.budget);
  const [timeOfDay, setTimeOfDay] = useState<string[]>(profileData.timeOfDay);
  const [activityType, setActivityType] = useState<string[]>(profileData.activityType);

  const vibeOptions = ['Romantic', 'Casual', 'Adventurous', 'Intellectual', 'Lively', 'Cozy'];
  const budgetOptions = ['$', '$$', '$$$', '$$$$'];
  
  const timeOptions = [
    { value: 'Morning', icon: Coffee, label: 'Morning' },
    { value: 'Afternoon', icon: Sun, label: 'Afternoon' },
    { value: 'Evening', icon: Moon, label: 'Evening' }
  ];

  const activityOptions = [
    { value: 'Food & Drink', icon: Martini, label: 'Food & Drink' },
    { value: 'Arts & Culture', icon: Landmark, label: 'Arts & Culture' }
  ];

  const toggleMultiSelect = (value: string, currentArray: string[], setter: (arr: string[]) => void) => {
    if (currentArray.includes(value)) {
      setter(currentArray.filter(item => item !== value));
    } else {
      setter([...currentArray, value]);
    }
  };

  const handleNext = () => {
    updateData({ vibe, budget, timeOfDay, activityType });
    onNext();
  };

  return (
    <div className="min-h-screen bg-jet-black p-6 flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-light text-white">Design Your Perfect Date</h1>
          <p className="text-gray-400">Set your Date Palette. The AI Concierge uses this to craft bespoke recommendations for you and your matches.</p>
        </div>

        {/* Vibe Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Vibe</h3>
          <div className="flex flex-wrap gap-2">
            {vibeOptions.map((option) => (
              <button
                key={option}
                onClick={() => toggleMultiSelect(option, vibe, setVibe)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  vibe.includes(option)
                    ? 'bg-goldenrod-gradient text-jet-black'
                    : 'bg-charcoal-gray text-white border border-gray-600 hover:border-goldenrod/50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Budget</h3>
          <div className="flex gap-2">
            {budgetOptions.map((option) => (
              <button
                key={option}
                onClick={() => setBudget(option)}
                className={`px-6 py-3 rounded-lg text-lg font-medium transition-all duration-200 ${
                  budget === option
                    ? 'bg-goldenrod-gradient text-jet-black'
                    : 'bg-charcoal-gray text-white border border-gray-600 hover:border-goldenrod/50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Time of Day Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Time of Day</h3>
          <div className="flex gap-3">
            {timeOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => toggleMultiSelect(value, timeOfDay, setTimeOfDay)}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-200 ${
                  timeOfDay.includes(value)
                    ? 'bg-goldenrod-gradient text-jet-black'
                    : 'bg-charcoal-gray text-white border border-gray-600 hover:border-goldenrod/50'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Activity Type Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Activity Type</h3>
          <div className="flex gap-3">
            {activityOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => toggleMultiSelect(value, activityType, setActivityType)}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-200 ${
                  activityType.includes(value)
                    ? 'bg-goldenrod-gradient text-jet-black'
                    : 'bg-charcoal-gray text-white border border-gray-600 hover:border-goldenrod/50'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 space-y-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full py-4 bg-transparent border border-gray-600 text-gray-400 font-semibold rounded-xl transition-all duration-300 hover:border-gray-500 hover:text-gray-300"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleNext}
          className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

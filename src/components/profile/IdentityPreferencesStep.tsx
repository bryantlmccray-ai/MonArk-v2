
import React, { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { ProfileData } from './ProfileCreation';

interface IdentityPreferencesStepProps {
  profileData: ProfileData;
  updateData: (data: Partial<ProfileData>) => void;
  onNext: () => void;
  onSkip?: () => void;
  stepRequirement: 'optional' | 'important';
}

interface IdentityData {
  genderIdentity: string;
  genderIdentityCustom?: string;
  sexualOrientation: string;
  sexualOrientationCustom?: string;
  preferenceToSee: string[];
  preferenceToBeSeenBy: string[];
  discoveryPrivacyMode: string;
  identityVisibility: boolean;
}

const GENDER_IDENTITIES = [
  'Man', 'Woman', 'Nonbinary', 'Genderfluid', 'Agender', 
  'Demigender', 'Two-Spirit', 'Questioning', 'Custom'
];

const SEXUAL_ORIENTATIONS = [
  'Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 
  'Queer', 'Asexual', 'Demisexual', 'Questioning', 'Custom'
];

const DISCOVERY_PREFERENCES = [
  'Men', 'Women', 'Nonbinary people', 'Genderfluid people',
  'Agender people', 'Demigender people', 'Two-Spirit people',
  'Queer folks', 'Everyone open to connection'
];

export const IdentityPreferencesStep: React.FC<IdentityPreferencesStepProps> = ({
  profileData,
  updateData,
  onNext,
  onSkip,
}) => {
  const [identityData, setIdentityData] = useState<IdentityData>({
    genderIdentity: '',
    genderIdentityCustom: '',
    sexualOrientation: '',
    sexualOrientationCustom: '',
    preferenceToSee: [],
    preferenceToBeSeenBy: [],
    discoveryPrivacyMode: 'open',
    identityVisibility: true,
  });

  const [showCustomGender, setShowCustomGender] = useState(false);
  const [showCustomOrientation, setShowCustomOrientation] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const updateIdentityData = (updates: Partial<IdentityData>) => {
    setIdentityData(prev => ({ ...prev, ...updates }));
  };

  const handleGenderSelect = (gender: string) => {
    if (gender === 'Custom') {
      setShowCustomGender(true);
    } else {
      setShowCustomGender(false);
      updateIdentityData({ genderIdentity: gender, genderIdentityCustom: '' });
    }
  };

  const handleOrientationSelect = (orientation: string) => {
    if (orientation === 'Custom') {
      setShowCustomOrientation(true);
    } else {
      setShowCustomOrientation(false);
      updateIdentityData({ sexualOrientation: orientation, sexualOrientationCustom: '' });
    }
  };

  const togglePreference = (preference: string, type: 'see' | 'beSeenBy') => {
    const field = type === 'see' ? 'preferenceToSee' : 'preferenceToBeSeenBy';
    const current = identityData[field];
    
    if (current.includes(preference)) {
      updateIdentityData({ [field]: current.filter(p => p !== preference) });
    } else {
      updateIdentityData({ [field]: [...current, preference] });
    }
  };

  const handleNext = () => {
    updateData({
      ...profileData,
      identityPreferences: identityData,
    });
    onNext();
  };

  const canProceed = identityData.genderIdentity && identityData.sexualOrientation && identityData.preferenceToSee.length > 0;

  const renderStep0 = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-light text-foreground">About You</h2>
        <p className="text-muted-foreground">Help us understand your identity so we can create meaningful connections</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-foreground font-medium mb-4">How do you identify?</h3>
          <div className="grid grid-cols-2 gap-3">
            {GENDER_IDENTITIES.map((gender) => (
              <button
                key={gender}
                onClick={() => handleGenderSelect(gender)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  identityData.genderIdentity === gender
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <span className="text-foreground font-medium">{gender}</span>
                {identityData.genderIdentity === gender && (
                  <Check className="h-4 w-4 text-primary ml-2 inline-block" />
                )}
              </button>
            ))}
          </div>
          
          {showCustomGender && (
            <div className="mt-4 animate-fade-in">
              <input
                type="text"
                placeholder="Please specify your gender identity"
                value={identityData.genderIdentityCustom}
                onChange={(e) => updateIdentityData({ 
                  genderIdentity: 'Custom',
                  genderIdentityCustom: e.target.value 
                })}
                className="w-full p-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-foreground font-medium mb-4">Your orientation</h3>
          <div className="grid grid-cols-2 gap-3">
            {SEXUAL_ORIENTATIONS.map((orientation) => (
              <button
                key={orientation}
                onClick={() => handleOrientationSelect(orientation)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  identityData.sexualOrientation === orientation
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <span className="text-foreground font-medium">{orientation}</span>
                {identityData.sexualOrientation === orientation && (
                  <Check className="h-4 w-4 text-primary ml-2 inline-block" />
                )}
              </button>
            ))}
          </div>
          
          {showCustomOrientation && (
            <div className="mt-4 animate-fade-in">
              <input
                type="text"
                placeholder="Please specify your sexual orientation"
                value={identityData.sexualOrientationCustom}
                onChange={(e) => updateIdentityData({ 
                  sexualOrientation: 'Custom',
                  sexualOrientationCustom: e.target.value 
                })}
                className="w-full p-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setCurrentStep(1)}
        disabled={!identityData.genderIdentity || !identityData.sexualOrientation}
        className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-light text-foreground">Connection Preferences</h2>
        <p className="text-muted-foreground">Who are you most open to connecting with emotionally or romantically?</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-foreground font-medium mb-4">I'm open to connecting with</h3>
          <div className="grid grid-cols-1 gap-3">
            {DISCOVERY_PREFERENCES.map((preference) => (
              <button
                key={preference}
                onClick={() => togglePreference(preference, 'see')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                  identityData.preferenceToSee.includes(preference)
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">{preference}</span>
                  {identityData.preferenceToSee.includes(preference) && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <h4 className="text-foreground font-medium mb-2">Privacy Options</h4>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={identityData.identityVisibility}
                onChange={(e) => updateIdentityData({ identityVisibility: e.target.checked })}
                className="w-4 h-4 text-primary bg-transparent border-border rounded focus:ring-primary"
              />
              <span className="text-secondary-foreground">Show my identity on my profile</span>
            </label>
            
            <div className="space-y-2">
              <span className="text-secondary-foreground text-sm">Discovery visibility:</span>
              <div className="flex space-x-2">
                {['open', 'limited', 'private'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateIdentityData({ discoveryPrivacyMode: mode })}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      identityData.discoveryPrivacyMode === mode
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep(0)}
          className="flex-1 py-4 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex-1 py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete Setup
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {currentStep === 0 ? renderStep0() : renderStep1()}
      </div>
    </div>
  );
};

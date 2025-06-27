
import React, { useState, useEffect } from 'react';
import { Check, X, Edit3 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

interface IdentityPreferencesSettingsProps {
  onClose: () => void;
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

export const IdentityPreferencesSettings: React.FC<IdentityPreferencesSettingsProps> = ({ onClose }) => {
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  
  const [identityData, setIdentityData] = useState({
    genderIdentity: '',
    genderIdentityCustom: '',
    sexualOrientation: '',
    sexualOrientationCustom: '',
    preferenceToSee: [] as string[],
    preferenceToBeSeenBy: [] as string[],
    discoveryPrivacyMode: 'open',
    identityVisibility: true,
  });
  
  const [showCustomGender, setShowCustomGender] = useState(false);
  const [showCustomOrientation, setShowCustomOrientation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setIdentityData({
        genderIdentity: profile.gender_identity || '',
        genderIdentityCustom: profile.gender_identity_custom || '',
        sexualOrientation: profile.sexual_orientation || '',
        sexualOrientationCustom: profile.sexual_orientation_custom || '',
        preferenceToSee: profile.preference_to_see || [],
        preferenceToBeSeenBy: profile.preference_to_be_seen_by || [],
        discoveryPrivacyMode: profile.discovery_privacy_mode || 'open',
        identityVisibility: profile.identity_visibility ?? true,
      });
      
      setShowCustomGender(profile.gender_identity === 'Custom');
      setShowCustomOrientation(profile.sexual_orientation === 'Custom');
    }
  }, [profile]);

  const updateIdentityData = (updates: any) => {
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

  const togglePreference = (preference: string) => {
    const current = identityData.preferenceToSee;
    
    if (current.includes(preference)) {
      updateIdentityData({
        preferenceToSee: current.filter(p => p !== preference)
      });
    } else {
      updateIdentityData({
        preferenceToSee: [...current, preference]
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const success = await updateProfile({
        gender_identity: identityData.genderIdentity,
        gender_identity_custom: identityData.genderIdentityCustom,
        sexual_orientation: identityData.sexualOrientation,
        sexual_orientation_custom: identityData.sexualOrientationCustom,
        preference_to_see: identityData.preferenceToSee,
        preference_to_be_seen_by: identityData.preferenceToBeSeenBy,
        discovery_privacy_mode: identityData.discoveryPrivacyMode,
        identity_visibility: identityData.identityVisibility,
      });

      if (success) {
        toast({
          title: "Preferences updated",
          description: "Your identity and discovery preferences have been saved.",
        });
        onClose();
      } else {
        toast({
          title: "Update failed",
          description: "There was an error saving your preferences. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Update failed",
        description: "There was an error saving your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-jet-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-charcoal-gray rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Edit3 className="h-5 w-5 text-goldenrod" />
            <h2 className="text-xl font-medium text-white">Identity & Discovery Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Gender Identity */}
          <div>
            <h3 className="text-white font-medium mb-4">How do you identify?</h3>
            <div className="grid grid-cols-2 gap-3">
              {GENDER_IDENTITIES.map((gender) => (
                <button
                  key={gender}
                  onClick={() => handleGenderSelect(gender)}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 text-sm ${
                    identityData.genderIdentity === gender
                      ? 'border-goldenrod bg-goldenrod/10 shadow-golden-glow'
                      : 'border-gray-700 bg-gray-800/50 hover:border-goldenrod/50'
                  }`}
                >
                  <span className="text-white font-medium">{gender}</span>
                  {identityData.genderIdentity === gender && (
                    <Check className="h-4 w-4 text-goldenrod ml-2 inline-block" />
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
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:border-goldenrod focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Sexual Orientation */}
          <div>
            <h3 className="text-white font-medium mb-4">Your orientation</h3>
            <div className="grid grid-cols-2 gap-3">
              {SEXUAL_ORIENTATIONS.map((orientation) => (
                <button
                  key={orientation}
                  onClick={() => handleOrientationSelect(orientation)}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 text-sm ${
                    identityData.sexualOrientation === orientation
                      ? 'border-goldenrod bg-goldenrod/10 shadow-golden-glow'
                      : 'border-gray-700 bg-gray-800/50 hover:border-goldenrod/50'
                  }`}
                >
                  <span className="text-white font-medium">{orientation}</span>
                  {identityData.sexualOrientation === orientation && (
                    <Check className="h-4 w-4 text-goldenrod ml-2 inline-block" />
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
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:border-goldenrod focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Discovery Preferences */}
          <div>
            <h3 className="text-white font-medium mb-4">Who are you open to connecting with?</h3>
            <div className="grid grid-cols-1 gap-3">
              {DISCOVERY_PREFERENCES.map((preference) => (
                <button
                  key={preference}
                  onClick={() => togglePreference(preference)}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                    identityData.preferenceToSee.includes(preference)
                      ? 'border-goldenrod bg-goldenrod/10 shadow-golden-glow'
                      : 'border-gray-700 bg-gray-800/50 hover:border-goldenrod/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{preference}</span>
                    {identityData.preferenceToSee.includes(preference) && (
                      <Check className="h-5 w-5 text-goldenrod" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Options */}
          <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700">
            <h4 className="text-white font-medium mb-3">Privacy & Visibility</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={identityData.identityVisibility}
                  onChange={(e) => updateIdentityData({ identityVisibility: e.target.checked })}
                  className="w-4 h-4 text-goldenrod bg-transparent border-gray-600 rounded focus:ring-goldenrod"
                />
                <span className="text-gray-300">Show my identity on my profile</span>
              </label>
              
              <div className="space-y-2">
                <span className="text-gray-300 text-sm">Discovery visibility:</span>
                <div className="flex space-x-2">
                  {['open', 'limited', 'private'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateIdentityData({ discoveryPrivacyMode: mode })}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        identityData.discoveryPrivacyMode === mode
                          ? 'bg-goldenrod text-jet-black'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !identityData.genderIdentity || !identityData.sexualOrientation || identityData.preferenceToSee.length === 0}
              className="flex-1 py-3 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

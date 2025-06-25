
import React, { useState } from 'react';
import { Shield, Heart, AlertTriangle, ExternalLink, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '../ui/checkbox';

interface RIFConsentScreenProps {
  onConsent: (consented: boolean) => void;
}

export const RIFConsentScreen: React.FC<RIFConsentScreenProps> = ({ onConsent }) => {
  const [consents, setConsents] = useState({
    rif_enabled: false,
    ai_personalization: false,
    reflection_prompts: false,
    data_sharing: false
  });

  const handleConsentChange = (key: keyof typeof consents) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveConsent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('rif_settings')
        .upsert({
          user_id: user.id,
          rif_enabled: consents.rif_enabled,
          ai_personalization_enabled: consents.ai_personalization,
          reflection_prompts_enabled: consents.reflection_prompts,
          data_sharing_consent: consents.data_sharing,
          last_consent_update: new Date().toISOString()
        });

      onConsent(consents.rif_enabled);
    } catch (error) {
      console.error('Error saving RIF consent:', error);
    }
  };

  const handleSkip = () => {
    onConsent(false);
  };

  return (
    <div className="min-h-screen bg-jet-black flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-4">
          <Heart className="h-16 w-16 text-goldenrod mx-auto" />
          <h1 className="text-3xl font-light text-white">MonArk Wellness Features</h1>
          <p className="text-gray-300 text-base">
            Help us personalize your dating experience with emotional intelligence insights
          </p>
        </div>

        <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <span className="text-orange-400 font-medium">Important Disclaimers</span>
          </div>
          <ul className="text-orange-200 text-sm space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-orange-400 mt-1">•</span>
              <span>MonArk is not a substitute for therapy or mental health treatment</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-orange-400 mt-1">•</span>
              <span>All emotional tools are for reflection only and do not constitute clinical advice</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-orange-400 mt-1">•</span>
              <span>If you're experiencing a crisis, please contact a licensed professional</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-medium text-lg">Choose Your Wellness Experience</h3>
          
          <div className="space-y-4">
            <div 
              className="flex items-start space-x-3 p-4 rounded-lg border border-gray-700 hover:border-goldenrod/50 transition-colors cursor-pointer"
              onClick={() => handleConsentChange('rif_enabled')}
            >
              <Checkbox
                checked={consents.rif_enabled}
                onChange={() => handleConsentChange('rif_enabled')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-goldenrod" />
                  <span className="text-white font-medium">Enable RIF Profile</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Create your Relational Intelligence Framework profile for personalized insights and better matches
                </p>
              </div>
            </div>

            <div 
              className="flex items-start space-x-3 p-4 rounded-lg border border-gray-700 hover:border-goldenrod/50 transition-colors cursor-pointer"
              onClick={() => handleConsentChange('ai_personalization')}
            >
              <Checkbox
                checked={consents.ai_personalization}
                onChange={() => handleConsentChange('ai_personalization')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-goldenrod" />
                  <span className="text-white font-medium">AI Personalization</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Use your emotional profile to personalize match suggestions and date recommendations
                </p>
              </div>
            </div>

            <div 
              className="flex items-start space-x-3 p-4 rounded-lg border border-gray-700 hover:border-goldenrod/50 transition-colors cursor-pointer"
              onClick={() => handleConsentChange('reflection_prompts')}
            >
              <Checkbox
                checked={consents.reflection_prompts}
                onChange={() => handleConsentChange('reflection_prompts')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-goldenrod" />
                  <span className="text-white font-medium">Reflection Prompts</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Receive gentle prompts for emotional check-ins and post-date reflections
                </p>
              </div>
            </div>

            <div 
              className="flex items-start space-x-3 p-4 rounded-lg border border-gray-700 hover:border-goldenrod/50 transition-colors cursor-pointer"
              onClick={() => handleConsentChange('data_sharing')}
            >
              <Checkbox
                checked={consents.data_sharing}
                onChange={() => handleConsentChange('data_sharing')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4 text-goldenrod" />
                  <span className="text-white font-medium">Anonymous Research</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Help improve MonArk by sharing anonymized wellness trends (optional)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ExternalLink className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300 text-sm font-medium">Need Support?</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Crisis Lifeline:</span>
              <a href="tel:988" className="text-goldenrod hover:underline">988</a>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Crisis Text Line:</span>
              <a href="sms:741741" className="text-goldenrod hover:underline">Text HOME to 741741</a>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-4 bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors hover:bg-gray-600"
          >
            Skip for Now
          </button>
          
          <button
            onClick={handleSaveConsent}
            className="flex-1 py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl text-lg transition-all duration-300 hover:shadow-golden-glow transform hover:scale-105"
          >
            Continue
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          You can change these settings anytime in your Privacy Dashboard
        </p>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Shield, Heart, AlertTriangle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

  return (
    <div className="min-h-screen bg-jet-black flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-4">
          <Heart className="h-12 w-12 text-goldenrod mx-auto" />
          <h1 className="text-2xl font-light text-white">MonArk Wellness Features</h1>
          <p className="text-gray-300 text-sm">
            Help us personalize your experience with emotional intelligence insights
          </p>
        </div>

        <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <span className="text-orange-400 font-medium">Important Disclaimers</span>
          </div>
          <ul className="text-orange-200 text-sm space-y-1">
            <li>• MonArk is not a substitute for therapy or mental health treatment</li>
            <li>• All emotional tools are for reflection only and do not constitute clinical advice</li>
            <li>• If you're experiencing a crisis, please contact a licensed professional</li>
          </ul>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={consents.rif_enabled}
                onChange={() => handleConsentChange('rif_enabled')}
                className="mt-1 h-4 w-4 text-goldenrod"
              />
              <div>
                <span className="text-white font-medium">Enable RIF Profile</span>
                <p className="text-gray-400 text-sm">Allow MonArk to create your Relational Intelligence Framework profile for personalized insights</p>
              </div>
            </label>

            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={consents.ai_personalization}
                onChange={() => handleConsentChange('ai_personalization')}
                className="mt-1 h-4 w-4 text-goldenrod"
              />
              <div>
                <span className="text-white font-medium">AI Personalization</span>
                <p className="text-gray-400 text-sm">Use your RIF profile to personalize match suggestions and date recommendations</p>
              </div>
            </label>

            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={consents.reflection_prompts}
                onChange={() => handleConsentChange('reflection_prompts')}
                className="mt-1 h-4 w-4 text-goldenrod"
              />
              <div>
                <span className="text-white font-medium">Reflection Prompts</span>
                <p className="text-gray-400 text-sm">Receive gentle prompts for emotional check-ins and post-date reflections</p>
              </div>
            </label>

            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={consents.data_sharing}
                onChange={() => handleConsentChange('data_sharing')}
                className="mt-1 h-4 w-4 text-goldenrod"
              />
              <div>
                <span className="text-white font-medium">Anonymous Research</span>
                <p className="text-gray-400 text-sm">Help improve MonArk by sharing anonymized wellness trends (optional)</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 text-sm">
          <ExternalLink className="h-4 w-4 text-gray-400" />
          <span className="text-gray-400">Need support? </span>
          <a href="tel:988" className="text-goldenrod hover:underline">Crisis Lifeline: 988</a>
        </div>

        <button
          onClick={handleSaveConsent}
          className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl text-lg transition-all duration-300 hover:shadow-golden-glow transform hover:scale-105"
        >
          Continue with Settings
        </button>
      </div>
    </div>
  );
};

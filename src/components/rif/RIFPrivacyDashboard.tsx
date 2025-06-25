
import React, { useState, useEffect } from 'react';
import { Shield, Eye, Trash2, Download, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const RIFPrivacyDashboard: React.FC = () => {
  const [rifProfile, setRifProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadRIFData();
    loadSettings();
  }, []);

  const loadRIFData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('rif_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      setRifProfile(data);
    } catch (error) {
      console.error('Error loading RIF profile:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('rif_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setSettings(data);
    } catch (error) {
      console.error('Error loading RIF settings:', error);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('rif_settings')
        .update({ [key]: value, last_consent_update: new Date().toISOString() })
        .eq('user_id', user.id);

      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const deleteAllRIFData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete all RIF-related data
      await Promise.all([
        supabase.from('rif_profiles').delete().eq('user_id', user.id),
        supabase.from('rif_feedback').delete().eq('user_id', user.id),
        supabase.from('rif_recommendations').delete().eq('user_id', user.id)
      ]);

      // Reset settings
      await supabase
        .from('rif_settings')
        .update({
          rif_enabled: false,
          ai_personalization_enabled: false,
          reflection_prompts_enabled: false,
          data_sharing_consent: false
        })
        .eq('user_id', user.id);

      setRifProfile(null);
      setShowDeleteConfirm(false);
      loadSettings();
    } catch (error) {
      console.error('Error deleting RIF data:', error);
    }
  };

  const downloadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileData, feedbackData, recommendationsData] = await Promise.all([
        supabase.from('rif_profiles').select('*').eq('user_id', user.id),
        supabase.from('rif_feedback').select('*').eq('user_id', user.id),
        supabase.from('rif_recommendations').select('*').eq('user_id', user.id)
      ]);

      const exportData = {
        profile: profileData.data,
        feedback: feedbackData.data,
        recommendations: recommendationsData.data,
        exported_at: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'monark_rif_data.json';
      a.click();
    } catch (error) {
      console.error('Error downloading data:', error);
    }
  };

  if (!settings) {
    return <div className="min-h-screen bg-jet-black flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-jet-black p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <Shield className="h-8 w-8 text-goldenrod mx-auto mb-2" />
          <h1 className="text-xl font-light text-white">Privacy Dashboard</h1>
          <p className="text-gray-400 text-sm">Manage your emotional wellness data</p>
        </div>

        {rifProfile && (
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <h3 className="text-white font-medium flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Your RIF Profile
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-gray-400">Intent Clarity: <span className="text-goldenrod">{rifProfile.intent_clarity}/10</span></div>
              <div className="text-gray-400">Pacing: <span className="text-goldenrod">{rifProfile.pacing_preferences}/10</span></div>
              <div className="text-gray-400">Emotional Readiness: <span className="text-goldenrod">{rifProfile.emotional_readiness}/10</span></div>
              <div className="text-gray-400">Boundary Respect: <span className="text-goldenrod">{rifProfile.boundary_respect}/10</span></div>
            </div>
            <p className="text-xs text-gray-500">Last updated: {new Date(rifProfile.updated_at).toLocaleDateString()}</p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-white font-medium">Privacy Controls</h3>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-gray-300">RIF Profile Enabled</span>
              <input
                type="checkbox"
                checked={settings.rif_enabled}
                onChange={(e) => updateSetting('rif_enabled', e.target.checked)}
                className="h-4 w-4 text-goldenrod"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-gray-300">AI Personalization</span>
              <input
                type="checkbox"
                checked={settings.ai_personalization_enabled}
                onChange={(e) => updateSetting('ai_personalization_enabled', e.target.checked)}
                className="h-4 w-4 text-goldenrod"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-gray-300">Reflection Prompts</span>
              <input
                type="checkbox"
                checked={settings.reflection_prompts_enabled}
                onChange={(e) => updateSetting('reflection_prompts_enabled', e.target.checked)}
                className="h-4 w-4 text-goldenrod"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-gray-300">Anonymous Research</span>
              <input
                type="checkbox"
                checked={settings.data_sharing_consent}
                onChange={(e) => updateSetting('data_sharing_consent', e.target.checked)}
                className="h-4 w-4 text-goldenrod"
              />
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={downloadData}
            className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download My Data</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center space-x-2 p-3 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete All RIF Data</span>
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-jet-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full space-y-4">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Confirm Deletion</span>
              </div>
              <p className="text-gray-300 text-sm">
                This will permanently delete all your RIF data, including your emotional profile, feedback, and recommendations. This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAllRIFData}
                  className="flex-1 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

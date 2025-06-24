
import React, { useState } from 'react';
import { Settings, ShieldCheck, Edit } from 'lucide-react';
import { ProfileCreation } from '../profile/ProfileCreation';

interface ProfileProps {
  onOpenTrustScore: () => void;
  onOpenSettings: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onOpenTrustScore, onOpenSettings }) => {
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  if (showProfileCreation) {
    return (
      <ProfileCreation 
        onComplete={() => {
          setHasProfile(true);
          setShowProfileCreation(false);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-jet-black p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-light text-white">Profile</h1>
          </div>
          <button
            onClick={onOpenSettings}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Settings className="h-6 w-6" />
          </button>
        </div>

        {!hasProfile ? (
          /* Profile Creation Prompt */
          <div className="text-center space-y-6 pt-16">
            <div className="w-32 h-32 rounded-full bg-charcoal-gray/50 border-2 border-dashed border-gray-600 mx-auto flex items-center justify-center">
              <Edit className="h-12 w-12 text-gray-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-medium text-white">Create Your Profile</h2>
              <p className="text-gray-400">Tell your story and set your dating preferences</p>
            </div>
            
            <button
              onClick={() => setShowProfileCreation(true)}
              className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow"
            >
              Start Profile Creation
            </button>
          </div>
        ) : (
          /* Existing Profile Display */
          <>
            {/* Profile Header */}
            <div className="text-center space-y-4">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
                alt="Profile"
                className="w-32 h-32 rounded-full mx-auto border-4 border-goldenrod/30"
              />
              
              <div className="flex items-center justify-center space-x-2">
                <h2 className="text-2xl font-medium text-white">Jordan, 29</h2>
                <ShieldCheck className="h-6 w-6 text-goldenrod" />
              </div>
            </div>

            {/* Trust Score Section */}
            <div className="bg-charcoal-gray rounded-xl p-6 border border-gray-800">
              <h3 className="text-white font-medium text-lg mb-2">MonArk Trust Score</h3>
              <p className="text-gray-400 text-sm mb-4">
                Build trust through verification and authentic connections
              </p>
              
              <button
                onClick={onOpenTrustScore}
                className="w-full py-3 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow"
              >
                Get Verified & Build Trust
              </button>
            </div>

            {/* Profile Sections */}
            <div className="space-y-4">
              <div className="bg-charcoal-gray rounded-xl p-4 border border-gray-800">
                <h4 className="text-white font-medium mb-2">About Me</h4>
                <p className="text-gray-300 text-sm">
                  I believe in authentic connections and meaningful conversations. Looking for someone who values personal growth and genuine experiences.
                </p>
              </div>
              
              <div className="bg-charcoal-gray rounded-xl p-4 border border-gray-800">
                <h4 className="text-white font-medium mb-2">What I'm Looking For</h4>
                <p className="text-gray-300 text-sm">
                  Someone who's emotionally available and ready to build something real. I value honesty, kindness, and shared adventures.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

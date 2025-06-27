
import React, { useState } from 'react';
import { Settings, ShieldCheck, Edit, LogOut } from 'lucide-react';
import { ProfileCreation } from '../profile/ProfileCreation';
import { RelationalCompass } from '../rif/RelationalCompass';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface ProfileProps {
  onOpenTrustScore: () => void;
  onOpenSettings: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onOpenTrustScore, onOpenSettings }) => {
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-jet-black p-6 flex items-center justify-center">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );
  }

  if (showProfileCreation) {
    return (
      <ProfileCreation 
        onComplete={() => {
          setShowProfileCreation(false);
        }} 
      />
    );
  }

  const hasCompleteProfile = profile?.is_profile_complete;

  return (
    <div className="min-h-screen bg-jet-black p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-light text-white">Profile</h1>
            {user?.email && (
              <p className="text-gray-400 text-sm">{user.email}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="h-6 w-6" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>

        {!hasCompleteProfile ? (
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
              {profile?.photos?.[0] ? (
                <img
                  src={profile.photos[0]}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto border-4 border-goldenrod/30 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto border-4 border-goldenrod/30 bg-charcoal-gray flex items-center justify-center">
                  <Edit className="h-12 w-12 text-gray-500" />
                </div>
              )}
              
              <div className="flex items-center justify-center space-x-2">
                <h2 className="text-2xl font-medium text-white">
                  {user?.user_metadata?.name || 'User'}{profile?.age ? `, ${profile.age}` : ''}
                </h2>
                <ShieldCheck className="h-6 w-6 text-goldenrod" />
              </div>
            </div>

            {/* Relational Compass Section */}
            <RelationalCompass />

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
              {profile?.bio && (
                <div className="bg-charcoal-gray rounded-xl p-4 border border-gray-800">
                  <h4 className="text-white font-medium mb-2">About Me</h4>
                  <p className="text-gray-300 text-sm">{profile.bio}</p>
                </div>
              )}
              
              {profile?.interests && profile.interests.length > 0 && (
                <div className="bg-charcoal-gray rounded-xl p-4 border border-gray-800">
                  <h4 className="text-white font-medium mb-2">My Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-goldenrod/20 text-goldenrod text-sm rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowProfileCreation(true)}
                className="w-full py-3 bg-charcoal-gray border border-gray-700 text-white rounded-xl transition-colors hover:border-goldenrod/50"
              >
                Edit Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

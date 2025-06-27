
import React, { useState } from 'react';
import { Settings, ShieldCheck, Edit, LogOut, MapPin } from 'lucide-react';
import { ProfileCreation } from '../profile/ProfileCreation';
import { RelationalCompass } from '../rif/RelationalCompass';
import { LocationConsentModal } from '../location/LocationConsentModal';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useLocation } from '@/hooks/useLocation';

interface ProfileProps {
  onOpenTrustScore: () => void;
  onOpenSettings: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onOpenTrustScore, onOpenSettings }) => {
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const { clearLocation } = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleLocationUpdate = () => {
    // Refresh will happen automatically via the profile hook
  };

  const handleClearLocation = async () => {
    await clearLocation();
  };

  const getLocationDisplay = () => {
    if (!profile?.location_data) return null;
    
    const { city, state, country, manual_override } = profile.location_data;
    const location = state ? `${city}, ${state}` : `${city}, ${country}`;
    
    return {
      text: location,
      isManual: manual_override,
    };
  };

  const locationDisplay = getLocationDisplay();

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

              {/* Location Display */}
              {locationDisplay && profile?.show_location_on_profile && (
                <div className="flex items-center justify-center space-x-1 text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {locationDisplay.isManual ? 'Based in' : 'Near'} {locationDisplay.text}
                  </span>
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="bg-charcoal-gray rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-goldenrod" />
                  <h3 className="text-white font-medium text-lg">Location</h3>
                </div>
                {profile?.location_consent && (
                  <button
                    onClick={handleClearLocation}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {profile?.location_consent && locationDisplay ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">{locationDisplay.text}</span>
                    <span className="text-xs text-gray-500">
                      {locationDisplay.isManual ? 'Manual' : 'Approximate'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className="w-full py-2 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Update Location
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm">
                    Share your approximate location to connect with people nearby
                  </p>
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className="w-full py-3 bg-goldenrod-gradient text-jet-black font-medium rounded-xl transition-all duration-300 hover:shadow-golden-glow"
                  >
                    Add Location
                  </button>
                </div>
              )}
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

      {/* Location Consent Modal */}
      <LocationConsentModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSuccess={handleLocationUpdate}
      />
    </div>
  );
};

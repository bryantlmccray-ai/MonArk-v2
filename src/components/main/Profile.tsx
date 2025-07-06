
import React, { useState } from 'react';
import { Settings, ShieldCheck, Edit, LogOut, MapPin, TrendingUp, Calendar } from 'lucide-react';
import { ProfileCreation } from '../profile/ProfileCreation';
import { RelationalCompass } from '../rif/RelationalCompass';
import { LocationConsentModal } from '../location/LocationConsentModal';
import { AnalyticsConsentModal } from '../analytics/AnalyticsConsentModal';
import { MonthlyRecapModal } from '../analytics/MonthlyRecapModal';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useLocation } from '@/hooks/useLocation';
import { useMonthlyAnalytics } from '@/hooks/useMonthlyAnalytics';
import { useToast } from '@/hooks/use-toast';

interface ProfileProps {
  onOpenTrustScore: () => void;
  onOpenSettings: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onOpenTrustScore, onOpenSettings }) => {
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const { clearLocation } = useLocation();
  const { analyticsEnabled } = useMonthlyAnalytics();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
      // Clear session data and sign out
      await signOut();
      
      // Clear any additional local storage data
      localStorage.removeItem('hasCompletedOnboarding');
      localStorage.removeItem('profileData');
      
      // Clear any cookies if needed
      document.cookie = 'authToken=; Max-Age=0; path=/;';
      document.cookie = 'refreshToken=; Max-Age=0; path=/;';
      
      toast({
        title: "Signed out successfully",
        description: "You've been signed out of your account.",
      });
      
      // Redirect will happen automatically through the auth state change
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Even if server-side logout fails, clear local data
      localStorage.removeItem('hasCompletedOnboarding');
      localStorage.removeItem('profileData');
      
      toast({
        title: "Signed out locally",
        description: "You've been signed out locally. Please refresh if needed.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
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
              disabled={isSigningOut}
            >
              <Settings className="h-6 w-6" />
            </button>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
              title="Sign Out"
            >
              {isSigningOut ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
              ) : (
                <LogOut className="h-6 w-6" />
              )}
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
              disabled={isSigningOut}
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
                    disabled={isSigningOut}
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
                    disabled={isSigningOut}
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
                    disabled={isSigningOut}
                  >
                    Add Location
                  </button>
                </div>
              )}
            </div>

            {/* Relational Compass Section */}
            <RelationalCompass />

            {/* MonArk Moments Section */}
            <div className="bg-charcoal-gray rounded-xl p-6 border border-gray-800">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-goldenrod" />
                <h3 className="text-white font-medium text-lg">MonArk Moments</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Get personalized monthly insights about your dating journey
              </p>
              
              <div className="space-y-3">
                {analyticsEnabled ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-goldenrod/10 rounded-lg border border-goldenrod/30">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-goldenrod" />
                        <span className="text-white text-sm">Analytics Enabled</span>
                      </div>
                      <button
                        onClick={() => setShowAnalyticsModal(true)}
                        className="text-xs text-goldenrod hover:text-goldenrod/80 transition-colors"
                        disabled={isSigningOut}
                      >
                        Manage
                      </button>
                    </div>
                    <button
                      onClick={() => setShowRecapModal(true)}
                      className="w-full py-3 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow"
                      disabled={isSigningOut}
                    >
                      View This Month's Recap
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAnalyticsModal(true)}
                    className="w-full py-3 bg-transparent border border-goldenrod text-goldenrod rounded-xl transition-colors hover:bg-goldenrod/10"
                    disabled={isSigningOut}
                  >
                    Enable MonArk Moments
                  </button>
                )}
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
                disabled={isSigningOut}
              >
                Get Verified & Build Trust
              </button>
            </div>

            {/* Cohesive Profile Overview */}
            <div className="bg-gradient-to-br from-charcoal-gray via-charcoal-gray/95 to-charcoal-gray/90 rounded-2xl p-6 border border-gray-800/50 backdrop-blur-sm">
              <div className="space-y-6">
                {/* Bio Section */}
                {profile?.bio && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-goldenrod to-goldenrod/60 rounded-full"></div>
                      <h3 className="text-white font-light text-lg">About</h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed pl-5 italic">
                      "{profile.bio}"
                    </p>
                  </div>
                )}

                {/* Interests & Goals Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Interests */}
                  {profile?.interests && profile.interests.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-white font-medium text-sm uppercase tracking-wide opacity-90">
                        Passions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-gradient-to-r from-goldenrod/20 to-goldenrod/10 text-goldenrod text-xs rounded-full border border-goldenrod/20 hover:border-goldenrod/40 transition-all duration-200"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Relationship Goals */}
                  {(profile as any)?.relationship_goals && (profile as any).relationship_goals.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-white font-medium text-sm uppercase tracking-wide opacity-90">
                        Looking For
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(profile as any).relationship_goals.map((goal: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-gradient-to-r from-rose-500/20 to-purple-500/20 text-rose-300 text-xs rounded-full border border-rose-500/20 hover:border-rose-500/40 transition-all duration-200"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Details Grid */}
                {((profile as any)?.occupation || (profile as any)?.education_level || (profile as any)?.height_cm || (profile as any)?.exercise_habits || (profile as any)?.smoking_status || (profile as any)?.drinking_status) && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-px bg-gradient-to-r from-transparent via-goldenrod/50 to-transparent"></div>
                      <h4 className="text-white font-medium text-sm uppercase tracking-wide opacity-90 px-2">
                        Details
                      </h4>
                      <div className="flex-1 h-px bg-gradient-to-r from-goldenrod/50 via-transparent to-transparent"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Professional Info */}
                      {((profile as any)?.occupation || (profile as any)?.education_level || (profile as any)?.height_cm) && (
                        <div className="space-y-3">
                          {(profile as any)?.occupation && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
                              <span className="text-gray-400 text-sm flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                <span>Work</span>
                              </span>
                              <span className="text-gray-200 text-sm font-medium">{(profile as any).occupation}</span>
                            </div>
                          )}
                          {(profile as any)?.education_level && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
                              <span className="text-gray-400 text-sm flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                <span>Education</span>
                              </span>
                              <span className="text-gray-200 text-sm font-medium">{(profile as any).education_level}</span>
                            </div>
                          )}
                          {(profile as any)?.height_cm && (
                            <div className="flex items-center justify-between py-2">
                              <span className="text-gray-400 text-sm flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                <span>Height</span>
                              </span>
                              <span className="text-gray-200 text-sm font-medium">
                                {Math.floor((profile as any).height_cm / 30.48)}'{Math.round(((profile as any).height_cm / 2.54) % 12)}"
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Lifestyle Info */}
                      {((profile as any)?.exercise_habits || (profile as any)?.smoking_status || (profile as any)?.drinking_status) && (
                        <div className="space-y-3">
                          {(profile as any)?.exercise_habits && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
                              <span className="text-gray-400 text-sm flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                                <span>Exercise</span>
                              </span>
                              <span className="text-gray-200 text-sm font-medium">{(profile as any).exercise_habits}</span>
                            </div>
                          )}
                          {(profile as any)?.smoking_status && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
                              <span className="text-gray-400 text-sm flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                                <span>Smoking</span>
                              </span>
                              <span className="text-gray-200 text-sm font-medium">{(profile as any).smoking_status}</span>
                            </div>
                          )}
                          {(profile as any)?.drinking_status && (
                            <div className="flex items-center justify-between py-2">
                              <span className="text-gray-400 text-sm flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                                <span>Drinking</span>
                              </span>
                              <span className="text-gray-200 text-sm font-medium">{(profile as any).drinking_status}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                console.log('Edit Profile button clicked');
                setShowProfileCreation(true);
              }}
              className="w-full py-3 bg-charcoal-gray border border-gray-700 text-white rounded-xl transition-colors hover:border-goldenrod/50"
              disabled={isSigningOut}
            >
              Edit Profile
            </button>

            {/* Sign Out Section */}
            <div className="pt-6 border-t border-gray-700">
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full py-3 bg-transparent border border-gray-600 text-gray-400 rounded-xl transition-colors hover:border-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSigningOut ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </>
                )}
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

      {/* Analytics Consent Modal */}
      <AnalyticsConsentModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
      />

      {/* Monthly Recap Modal */}
      <MonthlyRecapModal
        isOpen={showRecapModal}
        onClose={() => setShowRecapModal(false)}
      />
    </div>
  );
};

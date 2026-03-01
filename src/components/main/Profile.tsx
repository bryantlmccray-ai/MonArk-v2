
import React, { useState } from 'react';
import { Settings, ShieldCheck, Edit, LogOut, MapPin, TrendingUp, Calendar } from 'lucide-react';
import { ProfileCreation } from '../profile/ProfileCreation';
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
      await signOut();
      localStorage.removeItem('hasCompletedOnboarding');
      localStorage.removeItem('profileData');
      document.cookie = 'authToken=; Max-Age=0; path=/;';
      document.cookie = 'refreshToken=; Max-Age=0; path=/;';
      toast({ title: "Signed out successfully", description: "You've been signed out of your account." });
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.removeItem('hasCompletedOnboarding');
      localStorage.removeItem('profileData');
      toast({ title: "Signed out locally", description: "You've been signed out locally. Please refresh if needed.", variant: "destructive" });
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleLocationUpdate = () => {};
  const handleClearLocation = async () => { await clearLocation(); };

  const getLocationDisplay = () => {
    if (!profile?.location_data) return null;
    const { city, state, country, manual_override } = profile.location_data;
    const location = state ? `${city}, ${state}` : `${city}, ${country}`;
    return { text: location, isManual: manual_override };
  };

  const locationDisplay = getLocationDisplay();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-foreground text-lg font-body">Loading profile...</div>
      </div>
    );
  }

  if (showProfileCreation) {
    return (
      <ProfileCreation 
        onComplete={() => setShowProfileCreation(false)}
        onCancel={() => { console.log('Profile creation cancelled'); setShowProfileCreation(false); }}
      />
    );
  }

  const hasCompleteProfile = profile?.is_profile_complete;

  return (
    <div className="bg-background">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">Profile</h1>
            {user?.email && (
              <p className="text-muted-foreground text-xs mt-0.5">{user.email}</p>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={onOpenSettings}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all active:scale-95"
              disabled={isSigningOut}
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all disabled:opacity-50 active:scale-95"
              title="Sign Out"
            >
              {isSigningOut ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
              ) : (
                <LogOut className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {!hasCompleteProfile ? (
          <div className="text-center space-y-5 pt-10">
            <div className="w-28 h-28 rounded-full bg-secondary border-2 border-dashed border-border mx-auto flex items-center justify-center">
              <Edit className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-serif font-bold text-foreground">Create Your Profile</h2>
              <p className="text-muted-foreground text-sm">Tell your story and set your dating preferences</p>
            </div>
            <button
              onClick={() => setShowProfileCreation(true)}
              className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] shadow-[0_1px_3px_hsl(var(--primary)/0.15)]"
              disabled={isSigningOut}
            >
              Start Profile Creation
            </button>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="text-center space-y-4">
              {profile?.photos?.[0] ? (
                <img
                  src={profile.photos[0]}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto ring-4 ring-primary/20 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto ring-4 ring-primary/20 bg-secondary flex items-center justify-center">
                  <Edit className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              
              <div className="flex items-center justify-center space-x-2">
                <h2 className="text-2xl font-serif text-foreground">
                  {user?.user_metadata?.name || 'User'}{profile?.age ? `, ${profile.age}` : ''}
                </h2>
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>

              {locationDisplay && profile?.show_location_on_profile && (
                <div className="flex items-center justify-center space-x-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {locationDisplay.isManual ? 'Based in' : 'Near'} {locationDisplay.text}
                  </span>
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="bg-card rounded-2xl p-5 border border-border/60 shadow-[0_1px_3px_rgba(100,80,60,0.04)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="text-foreground font-semibold text-[15px]">Location</h3>
                </div>
                {profile?.location_consent && (
                  <button onClick={handleClearLocation} className="text-xs text-muted-foreground hover:text-foreground transition-colors" disabled={isSigningOut}>Clear</button>
                )}
              </div>
              
              {profile?.location_consent && locationDisplay ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-foreground text-sm">{locationDisplay.text}</span>
                    <span className="text-[11px] text-muted-foreground">{locationDisplay.isManual ? 'Manual' : 'Approximate'}</span>
                  </div>
                  <button onClick={() => setShowLocationModal(true)} className="w-full py-2 text-sm bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors" disabled={isSigningOut}>
                    Update Location
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-muted-foreground text-sm">Share your approximate location to connect with people nearby</p>
                  <button onClick={() => setShowLocationModal(true)} className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-xl transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]" disabled={isSigningOut}>
                    Add Location
                  </button>
                </div>
              )}
            </div>

            {/* Profile Overview */}
            <div className="bg-card rounded-2xl p-5 border border-border/60 shadow-[0_1px_3px_rgba(100,80,60,0.04)]">
              <div className="space-y-6">
                {profile?.bio && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/40 rounded-full"></div>
                      <h3 className="text-foreground font-medium text-lg">About</h3>
                    </div>
                    <p className="text-secondary-foreground text-sm leading-relaxed pl-5 italic">"{profile.bio}"</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {profile?.interests && profile.interests.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-foreground font-medium text-sm uppercase tracking-wider opacity-80">Passions</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, index) => (
                          <span key={index} className="px-3 py-1.5 bg-primary/10 text-primary text-xs rounded-full border border-primary/15 hover:border-primary/30 transition-all duration-200">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(profile as any)?.relationship_goals && (profile as any).relationship_goals.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-foreground font-medium text-sm uppercase tracking-wider opacity-80">Looking For</h4>
                      <div className="flex flex-wrap gap-2">
                        {(profile as any).relationship_goals.map((goal: string, index: number) => (
                          <span key={index} className="px-3 py-1.5 bg-rosegold/10 text-rosegold text-xs rounded-full border border-rosegold/15 hover:border-rosegold/30 transition-all duration-200">
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {((profile as any)?.occupation || (profile as any)?.education_level || (profile as any)?.height_cm || (profile as any)?.exercise_habits || (profile as any)?.smoking_status || (profile as any)?.drinking_status) && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                      <h4 className="text-foreground font-medium text-sm uppercase tracking-wider opacity-80 px-2">Details</h4>
                      <div className="flex-1 h-px bg-gradient-to-r from-primary/30 via-transparent to-transparent"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {((profile as any)?.occupation || (profile as any)?.education_level || (profile as any)?.height_cm) && (
                        <div className="space-y-3">
                          {(profile as any)?.occupation && (
                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                              <span className="text-muted-foreground text-sm flex items-center space-x-2"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div><span>Work</span></span>
                              <span className="text-foreground text-sm font-medium">{(profile as any).occupation}</span>
                            </div>
                          )}
                          {(profile as any)?.education_level && (
                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                              <span className="text-muted-foreground text-sm flex items-center space-x-2"><div className="w-1.5 h-1.5 bg-primary/70 rounded-full"></div><span>Education</span></span>
                              <span className="text-foreground text-sm font-medium">{(profile as any).education_level}</span>
                            </div>
                          )}
                          {(profile as any)?.height_cm && (
                            <div className="flex items-center justify-between py-2">
                              <span className="text-muted-foreground text-sm flex items-center space-x-2"><div className="w-1.5 h-1.5 bg-primary/50 rounded-full"></div><span>Height</span></span>
                              <span className="text-foreground text-sm font-medium">
                                {Math.floor((profile as any).height_cm / 30.48)}'{Math.round(((profile as any).height_cm / 2.54) % 12)}"
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {((profile as any)?.exercise_habits || (profile as any)?.smoking_status || (profile as any)?.drinking_status) && (
                        <div className="space-y-3">
                          {(profile as any)?.exercise_habits && (
                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                              <span className="text-muted-foreground text-sm flex items-center space-x-2"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div><span>Exercise</span></span>
                              <span className="text-foreground text-sm font-medium">{(profile as any).exercise_habits}</span>
                            </div>
                          )}
                          {(profile as any)?.smoking_status && (
                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                              <span className="text-muted-foreground text-sm flex items-center space-x-2"><div className="w-1.5 h-1.5 bg-destructive/60 rounded-full"></div><span>Smoking</span></span>
                              <span className="text-foreground text-sm font-medium">{(profile as any).smoking_status}</span>
                            </div>
                          )}
                          {(profile as any)?.drinking_status && (
                            <div className="flex items-center justify-between py-2">
                              <span className="text-muted-foreground text-sm flex items-center space-x-2"><div className="w-1.5 h-1.5 bg-goldenrod/60 rounded-full"></div><span>Drinking</span></span>
                              <span className="text-foreground text-sm font-medium">{(profile as any).drinking_status}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MonArk Moments */}
            <div className="bg-card rounded-2xl p-5 border border-border/60 shadow-[0_1px_3px_rgba(100,80,60,0.04)]">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="text-foreground font-medium text-lg">MonArk Moments</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">Get personalized monthly insights about your dating journey</p>
              
              <div className="space-y-3">
                {analyticsEnabled ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-foreground text-sm">Analytics Enabled</span>
                      </div>
                      <button onClick={() => setShowAnalyticsModal(true)} className="text-xs text-primary hover:text-primary/80 transition-colors" disabled={isSigningOut}>Manage</button>
                    </div>
                    <button onClick={() => setShowRecapModal(true)} className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-primary/90 hover:shadow-warm-glow" disabled={isSigningOut}>
                      View This Month's Recap
                    </button>
                  </>
                ) : (
                  <button onClick={() => setShowAnalyticsModal(true)} className="w-full py-3 bg-transparent border border-primary text-primary rounded-xl transition-colors hover:bg-primary/10" disabled={isSigningOut}>
                    Enable MonArk Moments
                  </button>
                )}
              </div>
            </div>

            {/* Trust Score */}
            <div className="bg-card rounded-2xl p-5 border border-border/60 shadow-[0_1px_3px_rgba(100,80,60,0.04)]">
              <h3 className="text-foreground font-medium text-lg mb-2">MonArk Trust Score</h3>
              <p className="text-muted-foreground text-sm mb-4">Build trust through verification and authentic connections</p>
              <button onClick={onOpenTrustScore} className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-primary/90 hover:shadow-warm-glow" disabled={isSigningOut}>
                Get Verified & Build Trust
              </button>
            </div>

            <button
              onClick={() => { console.log('Edit Profile button clicked'); setShowProfileCreation(true); }}
              className="w-full py-3 bg-secondary border border-border text-foreground rounded-xl transition-all hover:border-primary/30 hover:bg-secondary/80"
              disabled={isSigningOut}
            >
              Edit Profile
            </button>

            {/* Sign Out */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full py-3 bg-transparent border border-border text-muted-foreground rounded-xl transition-all hover:border-destructive/50 hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSigningOut ? (
                  <><div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div><span>Signing out...</span></>
                ) : (
                  <><LogOut className="h-4 w-4" /><span>Sign Out</span></>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <LocationConsentModal isOpen={showLocationModal} onClose={() => setShowLocationModal(false)} onSuccess={handleLocationUpdate} />
      <AnalyticsConsentModal isOpen={showAnalyticsModal} onClose={() => setShowAnalyticsModal(false)} />
      <MonthlyRecapModal isOpen={showRecapModal} onClose={() => setShowRecapModal(false)} />
    </div>
  );
};


import React, { useState, useCallback } from 'react';
import { PhotoLightbox } from '@/components/ui/PhotoLightbox';
import { Settings, ShieldCheck, Edit, LogOut, MapPin, TrendingUp, Calendar, Heart, Briefcase, GraduationCap, Ruler, Dumbbell, Cigarette, Wine, Sparkles, Camera, Palette, Clock, DollarSign, Eye } from 'lucide-react';
import { ProfileCreation } from '../profile/ProfileCreation';
import { LocationConsentModal } from '../location/LocationConsentModal';
import { AnalyticsConsentModal } from '../analytics/AnalyticsConsentModal';
import { MonthlyRecapModal } from '../analytics/MonthlyRecapModal';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useLocation } from '@/hooks/useLocation';
import { useMonthlyAnalytics } from '@/hooks/useMonthlyAnalytics';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
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
  const userName = user?.user_metadata?.name || 'User';
  const firstName = userName.split(' ')[0];

  // Height conversion helper
  const formatHeight = (cm: number) => {
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm / 2.54) % 12);
    return `${feet}'${inches}"`;
  };

  // Date preference labels
  const vibeLabels: Record<string, string> = {
    'adventurous': 'Adventurous',
    'chill': 'Laid-back',
    'romantic': 'Romantic',
    'intellectual': 'Intellectual',
    'creative': 'Creative',
    'active': 'Active',
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
  };

  return (
    <div className="bg-background">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Bar */}
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
            {/* Hero Profile Card — Editorial Magazine Style */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeUp}
              className="relative rounded-2xl overflow-hidden bg-card border border-border/60 shadow-[0_4px_24px_rgba(100,80,60,0.08)]"
            >
              {/* Cover Photo Area */}
              {profile?.photos?.[0] ? (
                <div className="relative aspect-[16/10] overflow-hidden cursor-pointer" onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}>
                  <img
                    src={profile.photos[0]}
                    alt="Profile"
                    loading="lazy"
                    className="w-full h-full object-cover hover:brightness-95 transition-all duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent pointer-events-none" />
                  
                  {/* Name overlay on photo */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
                    <div className="flex items-end gap-3">
                      <div>
                        <h2 className="text-3xl font-serif text-foreground tracking-tight drop-shadow-sm">
                          {userName}{profile?.age ? `, ${profile.age}` : ''}
                        </h2>
                        {locationDisplay && profile?.show_location_on_profile && (
                          <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {locationDisplay.isManual ? 'Based in' : 'Near'} {locationDisplay.text}
                          </p>
                        )}
                      </div>
                      <ShieldCheck className="h-6 w-6 text-primary ml-auto flex-shrink-0" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 pb-6 text-center">
                  <div className="w-28 h-28 rounded-full mx-auto bg-secondary flex items-center justify-center mb-4">
                    <Camera className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-serif text-foreground">
                    {userName}{profile?.age ? `, ${profile.age}` : ''}
                  </h2>
                  {locationDisplay && profile?.show_location_on_profile && (
                    <p className="text-muted-foreground text-sm flex items-center justify-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {locationDisplay.text}
                    </p>
                  )}
                </div>
              )}

              {/* Photo Strip */}
              {profile?.photos && profile.photos.length > 1 && (
                <div className="px-5 pb-5 -mt-2">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {profile.photos.slice(1).map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt={`Photo ${i + 2}`}
                        loading="lazy"
                        className="w-20 h-20 rounded-xl object-cover border-2 border-card flex-shrink-0 shadow-sm cursor-pointer hover:brightness-90 transition-all duration-200"
                        onClick={() => { setLightboxIndex(i + 1); setLightboxOpen(true); }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Bio — Pull Quote Style */}
            {profile?.bio && (
              <motion.div
                initial="hidden"
                animate="visible"
                custom={1}
                variants={fadeUp}
                className="relative bg-card rounded-2xl p-6 border border-border/60 shadow-[0_1px_3px_rgba(100,80,60,0.04)]"
              >
                <div className="absolute top-4 left-5 text-5xl font-serif text-primary/20 leading-none select-none">"</div>
                <p className="text-foreground/90 text-[15px] leading-relaxed font-body pl-6 pr-2 pt-4 italic">
                  {profile.bio}
                </p>
                <div className="mt-3 pl-6">
                  <div className="w-10 h-0.5 bg-primary/30 rounded-full" />
                </div>
              </motion.div>
            )}

            {/* Passions & Interests */}
            {profile?.interests && profile.interests.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                custom={2}
                variants={fadeUp}
                className="bg-card rounded-2xl p-6 border border-border/60 shadow-[0_1px_3px_rgba(100,80,60,0.04)]"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-foreground font-serif text-lg">Passions</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-3.5 py-1.5 text-sm font-body rounded-full bg-primary/5 text-foreground border-primary/15 hover:bg-primary/10 transition-colors"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Relationship Goals */}
            {profile?.relationship_goals && profile.relationship_goals.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                custom={3}
                variants={fadeUp}
                className="bg-card rounded-2xl p-6 border border-border/60 shadow-[0_1px_3px_rgba(100,80,60,0.04)]"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-rosegold/10 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-rosegold" />
                  </div>
                  <h3 className="text-foreground font-serif text-lg">Looking For</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.relationship_goals.map((goal, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-3.5 py-1.5 text-sm font-body rounded-full bg-rosegold/5 text-foreground border-rosegold/15"
                    >
                      {goal}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Life Details — Two-Column Grid */}
            {(profile?.occupation || profile?.education_level || profile?.height_cm || profile?.exercise_habits || profile?.smoking_status || profile?.drinking_status) && (
              <motion.div
                initial="hidden"
                animate="visible"
                custom={4}
                variants={fadeUp}
                className="bg-card rounded-2xl p-6 border border-border/60 shadow-[0_1px_3px_rgba(100,80,60,0.04)]"
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Eye className="h-4 w-4 text-accent" />
                  </div>
                  <h3 className="text-foreground font-serif text-lg">At a Glance</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {profile?.occupation && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                      <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Work</p>
                        <p className="text-foreground text-sm font-medium">{profile.occupation}</p>
                      </div>
                    </div>
                  )}
                  {profile?.education_level && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                      <GraduationCap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Education</p>
                        <p className="text-foreground text-sm font-medium">{profile.education_level}</p>
                      </div>
                    </div>
                  )}
                  {profile?.height_cm && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                      <Ruler className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Height</p>
                        <p className="text-foreground text-sm font-medium">{formatHeight(profile.height_cm)}</p>
                      </div>
                    </div>
                  )}
                  {profile?.exercise_habits && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                      <Dumbbell className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Exercise</p>
                        <p className="text-foreground text-sm font-medium">{profile.exercise_habits}</p>
                      </div>
                    </div>
                  )}
                  {profile?.smoking_status && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                      <Cigarette className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Smoking</p>
                        <p className="text-foreground text-sm font-medium">{profile.smoking_status}</p>
                      </div>
                    </div>
                  )}
                  {profile?.drinking_status && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                      <Wine className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Drinking</p>
                        <p className="text-foreground text-sm font-medium">{profile.drinking_status}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Date Palette */}
            {profile?.date_preferences && (profile.date_preferences.vibe?.length > 0 || profile.date_preferences.activityType?.length > 0 || profile.date_preferences.timeOfDay?.length > 0) && (
              <motion.div
                initial="hidden"
                animate="visible"
                custom={5}
                variants={fadeUp}
                className="bg-card rounded-2xl p-6 border border-border/60 shadow-[0_1px_3px_rgba(100,80,60,0.04)]"
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-goldenrod/10 flex items-center justify-center">
                    <Palette className="h-4 w-4 text-goldenrod" />
                  </div>
                  <h3 className="text-foreground font-serif text-lg">Date Palette</h3>
                </div>
                <div className="space-y-4">
                  {profile.date_preferences.vibe?.length > 0 && (
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Vibe</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.date_preferences.vibe.map((v: string, i: number) => (
                          <Badge key={i} variant="outline" className="px-3 py-1 text-xs rounded-full bg-goldenrod/5 border-goldenrod/15 text-foreground">
                            {vibeLabels[v] || v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.date_preferences.activityType?.length > 0 && (
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Activities</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.date_preferences.activityType.map((a: string, i: number) => (
                          <Badge key={i} variant="outline" className="px-3 py-1 text-xs rounded-full bg-primary/5 border-primary/15 text-foreground">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4">
                    {profile.date_preferences.timeOfDay?.length > 0 && (
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Time
                        </p>
                        <p className="text-foreground text-sm font-medium">{profile.date_preferences.timeOfDay.join(', ')}</p>
                      </div>
                    )}
                    {profile.date_preferences.budget && (
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> Budget
                        </p>
                        <p className="text-foreground text-sm font-medium">{profile.date_preferences.budget}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Location Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={6}
              variants={fadeUp}
              className="bg-card rounded-2xl p-5 border border-border/60 shadow-[0_1px_3px_rgba(100,80,60,0.04)]"
            >
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
            </motion.div>

            {/* MonArk Moments */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={7}
              variants={fadeUp}
              className="bg-card rounded-2xl p-5 border border-border/60 shadow-[0_1px_3px_rgba(100,80,60,0.04)]"
            >
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
            </motion.div>

            {/* Trust Score */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={8}
              variants={fadeUp}
              className="bg-card rounded-2xl p-5 border border-border/60 shadow-[0_1px_3px_rgba(100,80,60,0.04)]"
            >
              <h3 className="text-foreground font-medium text-lg mb-2">MonArk Trust Score</h3>
              <p className="text-muted-foreground text-sm mb-4">Build trust through verification and authentic connections</p>
              <button onClick={onOpenTrustScore} className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-primary/90 hover:shadow-warm-glow" disabled={isSigningOut}>
                Get Verified & Build Trust
              </button>
            </motion.div>

            <button
              onClick={() => { setShowProfileCreation(true); }}
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

      {profile?.photos && profile.photos.length > 0 && (
        <PhotoLightbox
          photos={profile.photos}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          name={userName}
        />
      )}
    </div>
  );
};

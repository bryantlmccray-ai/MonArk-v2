import React, { useMemo } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, Lock, Camera, FileText, Brain, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface ProfileGateProps {
  children: React.ReactNode;
  featureName?: string;
  onNavigateToProfile?: () => void;
}

/**
 * ProfileGate - Blocks access to features until profile is complete
 * Shows progress percentage and a checklist of what's missing
 */
export const ProfileGate: React.FC<ProfileGateProps> = ({ 
  children, 
  featureName = 'this feature',
  onNavigateToProfile
}) => {
  const { profile, loading } = useProfile();
  const { isDemoMode } = useAuth();

  // Calculate completion percentage
  const { completionPct, missingItems } = useMemo(() => {
    if (!profile) return { completionPct: 0, missingItems: ['photo', 'bio', 'rif'] };
    const checks = [
      { key: 'photo', done: !!(profile.photos && profile.photos.length > 0), label: 'Add a profile photo', icon: 'camera' },
      { key: 'bio', done: !!(profile.bio && profile.bio.trim().length > 20), label: 'Write your bio (20+ chars)', icon: 'bio' },
      { key: 'rif', done: !!(profile.rif_archetype || profile.dating_style), label: 'Complete the RIF quiz', icon: 'rif' },
    ];
    const done = checks.filter(c => c.done).length;
    return {
      completionPct: Math.round((done / checks.length) * 100),
      missingItems: checks.filter(c => !c.done),
    };
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (isDemoMode && !profile) {
    return <>{children}</>;
  }

  if (!profile?.is_profile_complete) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <Card className="max-w-md w-full border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="pb-3 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl font-serif">Almost there</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Your profile is <span className="font-semibold text-primary">{completionPct}% complete</span> — finish {missingItems.length === 1 ? 'this step' : `these ${missingItems.length} steps`} to unlock {featureName}.
            </p>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>

            {/* Missing items checklist */}
            <div className="space-y-2">
              {missingItems.map((item) => (
                <button
                  key={item.key}
                  onClick={onNavigateToProfile}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted/70 hover:border-primary/30 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {item.icon === 'camera' && <Camera className="w-4 h-4 text-primary" />}
                    {item.icon === 'bio' && <FileText className="w-4 h-4 text-primary" />}
                    {item.icon === 'rif' && <Brain className="w-4 h-4 text-primary" />}
                  </div>
                  <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{item.label}</span>
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground/30 ml-auto group-hover:text-primary/50 transition-colors" />
                </button>
              ))}
            </div>

            {onNavigateToProfile && (
              <Button 
                onClick={onNavigateToProfile}
                className="w-full gap-2 mt-2"
              >
                <UserCircle className="w-4 h-4" />
                Go to My Profile
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProfileGate;

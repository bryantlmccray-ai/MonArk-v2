import React, { useState } from 'react';
import { AuthGuard } from '@/components/common/AuthGuard';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { RIFQuizFlow } from '@/components/rif/RIFQuizFlow';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

const DashboardContent: React.FC = () => {
  const { signOut } = useAuth();
  const { updateProfile, refetchProfile } = useProfile();
  const { toast } = useToast();
  const [showRIF, setShowRIF] = useState(false);

  const handleRIFComplete = async (answers: Record<number, string>) => {
    try {
      const success = await updateProfile({ rif_quiz_answers: answers });
      if (success) {
        await refetchProfile();
        toast({
          title: "RIF Complete ✦",
          description: "Your Relational Intelligence profile is now active.",
        });
        setShowRIF(false);
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to save your RIF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  if (showRIF) {
    return <RIFQuizFlow onComplete={handleRIFComplete} onBack={() => setShowRIF(false)} />;
  }

  return (
    <DashboardHome
      onStartRIF={() => setShowRIF(true)}
      onSignOut={handleSignOut}
      onNavigate={(section) => {
        // Future: navigate to profile/matches/settings sections
        console.log('Navigate to:', section);
      }}
    />
  );
};

const Dashboard: React.FC = () => (
  <AuthGuard fallbackPath="/">
    <DashboardContent />
  </AuthGuard>
);

export default Dashboard;

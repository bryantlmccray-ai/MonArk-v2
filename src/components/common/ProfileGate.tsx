 import React from 'react';
 import { useProfile } from '@/hooks/useProfile';
 import { useAuth } from '@/hooks/useAuth';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { UserCircle, Lock } from 'lucide-react';
 import { LoadingSpinner } from './LoadingSpinner';
 
 interface ProfileGateProps {
   children: React.ReactNode;
   featureName?: string;
   onNavigateToProfile?: () => void;
 }
 
 /**
  * ProfileGate - Blocks access to features until profile is complete
  * Shows a clear message and CTA to complete profile
  */
 export const ProfileGate: React.FC<ProfileGateProps> = ({ 
   children, 
   featureName = 'this feature',
   onNavigateToProfile
 }) => {
   const { profile, loading } = useProfile();
   const { isDemoMode } = useAuth();
 
   // Show loading while fetching profile
   if (loading) {
     return (
       <div className="flex items-center justify-center py-12">
         <LoadingSpinner />
       </div>
     );
   }
 
   // In demo mode with no profile, allow access for demonstration
   if (isDemoMode && !profile) {
     return <>{children}</>;
   }
 
   // Block access if profile is not complete
   if (!profile?.is_profile_complete) {
     return (
       <div className="flex items-center justify-center min-h-[60vh] p-6">
         <Card className="max-w-md w-full text-center border-border/50 bg-card/50 backdrop-blur">
           <CardHeader className="pb-4">
             <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
               <Lock className="w-8 h-8 text-primary" />
             </div>
             <CardTitle className="text-xl font-serif">Complete Your Profile</CardTitle>
             <CardDescription className="text-muted-foreground mt-2">
               To access {featureName}, please complete your profile first.
             </CardDescription>
           </CardHeader>
           <CardContent className="pt-0">
             <p className="text-sm text-muted-foreground mb-6">
               A complete profile helps us find better matches for you and ensures a safe community.
             </p>
             {onNavigateToProfile && (
               <Button 
                 onClick={onNavigateToProfile}
                 className="w-full gap-2"
               >
                 <UserCircle className="w-4 h-4" />
                 Complete Your Profile
               </Button>
             )}
           </CardContent>
         </Card>
       </div>
     );
   }
 
   // Profile is complete, render children
   return <>{children}</>;
 };
 
 export default ProfileGate;
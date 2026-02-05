 import React from 'react';
 import { Lock, MessageCircle } from 'lucide-react';
 import { Card, CardContent } from '@/components/ui/card';
 
 interface MessagingLockCardProps {
   matchName?: string;
 }
 
 /**
  * MessagingLockCard - Shown when messaging is not available
  * Displays a clear message that messaging unlocks after matching
  */
 export const MessagingLockCard: React.FC<MessagingLockCardProps> = ({ 
   matchName = 'this person' 
 }) => {
   return (
     <Card className="border-border/50 bg-card/50 backdrop-blur">
       <CardContent className="flex flex-col items-center text-center py-8 px-6">
         <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-4">
           <div className="relative">
             <MessageCircle className="w-7 h-7 text-muted-foreground" />
             <Lock className="w-4 h-4 text-muted-foreground absolute -bottom-1 -right-1 bg-card rounded-full p-0.5" />
           </div>
         </div>
         
         <h3 className="font-semibold text-foreground mb-2">
           Messaging Unlocks After Matching
         </h3>
         
         <p className="text-sm text-muted-foreground max-w-xs">
           You'll be able to message {matchName} once you've both expressed interest.
         </p>
       </CardContent>
     </Card>
   );
 };
 
 export default MessagingLockCard;
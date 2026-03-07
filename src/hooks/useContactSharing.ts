import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface ContactShare {
  id: string;
  sharer_user_id: string;
  recipient_user_id: string;
  conversation_id: string;
  shared_at: string;
}

export const useContactSharing = (conversationId: string, matchUserId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [myPhoneNumber, setMyPhoneNumber] = useState<string | null>(null);
  const [matchPhoneNumber, setMatchPhoneNumber] = useState<string | null>(null);
  const [iHaveShared, setIHaveShared] = useState(false);
  const [theyHaveShared, setTheyHaveShared] = useState(false);

  // Fetch current sharing status and phone numbers
  useEffect(() => {
    if (!user || !conversationId || !matchUserId) return;

    const fetchContactStatus = async () => {
      try {
        // Get my phone number
        const { data: myProfile } = await supabase
          .from('user_profiles')
          .select('phone_number')
          .eq('user_id', user.id)
          .maybeSingle();

        setMyPhoneNumber(myProfile?.phone_number || null);

        // Check if I have shared with them
        const { data: myShare } = await supabase
          .from('contact_shares')
          .select('id')
          .eq('sharer_user_id', user.id)
          .eq('recipient_user_id', matchUserId)
          .maybeSingle();

        setIHaveShared(!!myShare);

        // Check if they have shared with me
        const { data: theirShare } = await supabase
          .from('contact_shares')
          .select('id')
          .eq('sharer_user_id', matchUserId)
          .eq('recipient_user_id', user.id)
          .maybeSingle();

        setTheyHaveShared(!!theirShare);

        // BILATERAL CONSENT: Only show match's phone number if BOTH parties have shared
        const bothConsented = !!myShare && !!theirShare;
        if (bothConsented) {
          const { data: matchProfile } = await supabase
            .from('user_profiles')
            .select('phone_number')
            .eq('user_id', matchUserId)
            .maybeSingle();

          setMatchPhoneNumber(matchProfile?.phone_number || null);
        }
      } catch (error) {
        console.error('Error fetching contact status:', error);
      }
    };

    fetchContactStatus();

    // Set up real-time subscription for contact shares
    const channel = supabase
      .channel(`contact_shares_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contact_shares',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newShare = payload.new as ContactShare;
          if (newShare.sharer_user_id === matchUserId) {
            setTheyHaveShared(true);
            // Only reveal phone number if we have also shared (bilateral consent)
            if (iHaveShared) {
              supabase
                .from('user_profiles')
                .select('phone_number')
                .eq('user_id', matchUserId)
                .maybeSingle()
                .then(({ data }) => {
                  setMatchPhoneNumber(data?.phone_number || null);
                });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, conversationId, matchUserId]);

  const shareContact = async () => {
    if (!user || !myPhoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please add your phone number to your profile first.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('share-contact', {
        body: {
          recipientUserId: matchUserId,
          conversationId,
        },
      });

      if (error) throw error;

      if (data.success) {
        setIHaveShared(true);
        toast({
          title: "Contact shared!",
          description: `Your phone number has been shared with your match.`,
        });
        return true;
      }
    } catch (error: any) {
      console.error('Error sharing contact:', error);
      toast({
        title: "Failed to share contact",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
    return false;
  };

  return {
    loading,
    myPhoneNumber,
    matchPhoneNumber,
    iHaveShared,
    theyHaveShared,
    shareContact,
    canShare: !!myPhoneNumber && !iHaveShared,
  };
};

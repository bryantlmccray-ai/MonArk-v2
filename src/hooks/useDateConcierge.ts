
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface DateProposal {
  id: string;
  creator_user_id: string;
  recipient_user_id: string;
  conversation_id: string;
  title: string;
  activity: string;
  location_type: string | null;
  vibe: string | null;
  time_suggestion: string | null;
  rationale: string | null;
  status: string;
  ai_generated: boolean;
  proposal_data: any;
  created_at: string;
  updated_at: string;
}

export interface DateJournalEntry {
  id: string;
  date_proposal_id: string | null;
  user_id: string;
  partner_name: string;
  date_title: string;
  date_activity: string;
  date_completed: string | null;
  rating: number | null;
  reflection_notes: string | null;
  learned_insights: string | null;
  would_repeat: boolean | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ConversationTracker {
  id: string;
  user_id: string;
  match_user_id: string;
  conversation_id: string;
  message_count: number;
  mutual_engagement_score: number;
  last_activity: string;
  ai_concierge_triggered: boolean;
  created_at: string;
  updated_at: string;
}

export const useDateConcierge = () => {
  const [proposals, setProposals] = useState<DateProposal[]>([]);
  const [journalEntries, setJournalEntries] = useState<DateJournalEntry[]>([]);
  const [conversations, setConversations] = useState<ConversationTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's date proposals
  const fetchProposals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('date_proposals')
        .select('*')
        .or(`creator_user_id.eq.${user.id},recipient_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  // Fetch journal entries
  const fetchJournalEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('date_journal')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJournalEntries(data || []);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    }
  };

  // Fetch conversation trackers
  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversation_tracker')
        .select('*')
        .or(`user_id.eq.${user.id},match_user_id.eq.${user.id}`)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Generate AI date proposal
  const generateDateProposal = async (
    matchUserId: string,
    conversationId: string,
    userInterests: string[],
    matchInterests: string[],
    recentMessages?: string[]
  ): Promise<DateProposal | null> => {
    if (!user) return null;

    try {
      // Mock AI generation for now - in production, this would call an AI service
      const activities = [
        'Coffee and art gallery walk',
        'Cooking class together',
        'Sunset picnic in the park',
        'Wine tasting and conversation',
        'Museum visit and lunch',
        'Hiking and scenic views',
        'Farmers market and brunch',
        'Live music and tapas'
      ];

      const vibes = ['Relaxed', 'Creative', 'Adventurous', 'Intimate', 'Cultural'];
      const locationTypes = ['Indoor', 'Outdoor', 'Mixed'];

      const activity = activities[Math.floor(Math.random() * activities.length)];
      const vibe = vibes[Math.floor(Math.random() * vibes.length)];
      const locationType = locationTypes[Math.floor(Math.random() * locationTypes.length)];

      const commonInterests = userInterests.filter(interest => 
        matchInterests.includes(interest)
      );

      const rationale = commonInterests.length > 0 
        ? `Based on your shared interests in ${commonInterests.slice(0, 2).join(' and ')}, this activity combines both of your passions while creating space for meaningful conversation.`
        : 'This activity provides a perfect balance of engagement and conversation, allowing you both to discover new shared interests.';

      const proposalData = {
        user_interests: userInterests,
        match_interests: matchInterests,
        common_interests: commonInterests,
        generation_context: recentMessages ? 'chat_analysis' : 'profile_based'
      };

      const { data, error } = await supabase
        .from('date_proposals')
        .insert({
          creator_user_id: user.id,
          recipient_user_id: matchUserId,
          conversation_id: conversationId,
          title: `${vibe} ${activity}`,
          activity: activity,
          location_type: locationType,
          vibe: vibe,
          time_suggestion: 'This weekend',
          rationale: rationale,
          proposal_data: proposalData
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Date idea generated! 🎉",
        description: "Your AI concierge has crafted a personalized date proposal.",
      });

      await fetchProposals();
      return data;
    } catch (error) {
      console.error('Error generating date proposal:', error);
      toast({
        title: "Something went wrong",
        description: "Unable to generate date proposal. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  // Update proposal status
  const updateProposalStatus = async (proposalId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('date_proposals')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', proposalId);

      if (error) throw error;
      await fetchProposals();

      toast({
        title: "Proposal updated",
        description: `Date proposal ${status} successfully.`,
      });
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast({
        title: "Update failed",
        description: "Unable to update proposal status.",
        variant: "destructive"
      });
    }
  };

  // Create journal entry
  const createJournalEntry = async (entryData: Partial<DateJournalEntry>) => {
    if (!user) return;

    try {
      // Ensure required fields are present and properly typed
      const insertData = {
        user_id: user.id,
        partner_name: entryData.partner_name || '',
        date_title: entryData.date_title || '',
        date_activity: entryData.date_activity || '',
        date_proposal_id: entryData.date_proposal_id || null,
        date_completed: entryData.date_completed || null,
        rating: entryData.rating || null,
        reflection_notes: entryData.reflection_notes || null,
        learned_insights: entryData.learned_insights || null,
        would_repeat: entryData.would_repeat || null,
        tags: entryData.tags || []
      };

      const { error } = await supabase
        .from('date_journal')
        .insert(insertData);

      if (error) throw error;
      await fetchJournalEntries();

      toast({
        title: "Journal entry saved! 📝",
        description: "Your date experience has been recorded.",
      });
    } catch (error) {
      console.error('Error creating journal entry:', error);
      toast({
        title: "Save failed",
        description: "Unable to save journal entry.",
        variant: "destructive"
      });
    }
  };

  // Update conversation engagement
  const updateConversationEngagement = async (
    conversationId: string,
    matchUserId: string,
    messageCount: number,
    engagementScore: number
  ) => {
    if (!user) return;

    try {
      const { data: existing, error: fetchError } = await supabase
        .from('conversation_tracker')
        .select('*')
        .eq('conversation_id', conversationId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existing) {
        // Update existing tracker
        const { error } = await supabase
          .from('conversation_tracker')
          .update({
            message_count: messageCount,
            mutual_engagement_score: engagementScore,
            last_activity: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new tracker
        const { error } = await supabase
          .from('conversation_tracker')
          .insert({
            user_id: user.id,
            match_user_id: matchUserId,
            conversation_id: conversationId,
            message_count: messageCount,
            mutual_engagement_score: engagementScore
          });

        if (error) throw error;
      }

      await fetchConversations();
    } catch (error) {
      console.error('Error updating conversation engagement:', error);
    }
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchProposals(),
          fetchJournalEntries(),
          fetchConversations()
        ]);
        setLoading(false);
      };
      loadData();
    }
  }, [user]);

  return {
    proposals,
    journalEntries,
    conversations,
    loading,
    generateDateProposal,
    updateProposalStatus,
    createJournalEntry,
    updateConversationEngagement,
    refetch: async () => {
      await fetchProposals();
      await fetchJournalEntries();
      await fetchConversations();
    }
  };
};

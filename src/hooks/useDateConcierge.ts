import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useConversationReadiness } from './useConversationReadiness';
import { Tables } from '@/integrations/supabase/types';
import { sanitizeConciergePayload } from '@/lib/aiSanitizer';
import { useNotifications } from './useNotifications';
// --- Venue intelligence (additive) ---
import { useVenues } from './useVenues';
import { useVenueRecommendations } from './useVenueRecommendations';
import type { RIFScores } from '@/lib/venueMatching';

type Message = Tables<'messages'>;

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

/**
 * Options for venue recommendations inside the date concierge flow.
 * Pass activeConversationId + rifScores when the chat readiness threshold is crossed.
 */
export interface VenueRecommendationOptions {
  /** The Supabase conversation_id for the active chat thread */
  activeConversationId: string;
  /** The current user's five-pillar RIF scores */
  rifScores: RIFScores;
  /** Max venues to surface (default 3) */
  limit?: number;
}

export const useDateConcierge = (venueOptions?: VenueRecommendationOptions) => {
  const [proposals, setProposals] = useState<DateProposal[]>([]);
  const [journalEntries, setJournalEntries] = useState<DateJournalEntry[]>([]);
  const [conversations, setConversations] = useState<ConversationTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { analyzeReadiness, setCooldown, updatePattern } = useConversationReadiness();
  const { sendEmailNotification } = useNotifications();

  // --- Venue intelligence (additive) ---
  const { venues: allVenues } = useVenues();
  const venueRecs = useVenueRecommendations(
    venueOptions
      ? {
          conversationId: venueOptions.activeConversationId,
          userId: user?.id ?? '',
          rifScores: venueOptions.rifScores,
          venues: allVenues,
          limit: venueOptions.limit ?? 3,
        }
      : {
          // Disabled state - no conversation active yet
          conversationId: '',
          userId: '',
          rifScores: {
            emotional_intelligence: 50,
            communication_style: 50,
            lifestyle_alignment: 50,
            relationship_readiness: 50,
            growth_orientation: 50,
          },
          venues: [],
          limit: 3,
        }
  );

  // Fetch user's date proposals
  const fetchProposals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('date_proposals')
        .select('*')
        .or(`creator_user_id.eq.${user.id},recipient_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching proposals:', error);
        setProposals([]);
        return;
      }
      setProposals(data || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setProposals([]);
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

      if (error) {
        console.error('Error fetching conversations:', error);
        setConversations([]);
        return;
      }
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    }
  };

  // Generate AI date proposal using real OpenAI integration
  const generateDateProposal = async (
    matchUserId: string,
    conversationId: string,
    userInterests: string[],
    matchInterests: string[],
    recentMessages?: string[]
  ): Promise<DateProposal | null> => {
    if (!user) return null;

    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('bio, location')
        .eq('user_id', user.id)
        .single();

      const { data: matchProfile } = await supabase
        .from('public_user_profiles')
        .select('bio')
        .eq('user_id', matchUserId)
        .single();

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-date-concierge', {
        body: sanitizeConciergePayload({
          matchUserId,
          conversationId,
          userInterests,
          matchInterests,
          recentMessages,
          userLocation: userProfile?.location,
          userProfile,
          matchProfile,
          currentUserId: user.id
        })
      });

      if (aiError) {
        console.error('AI date concierge error:', aiError);
        throw new Error('Failed to generate AI proposal');
      }

      const proposalData = aiError ? aiResponse.fallback : aiResponse;

      const { data, error } = await supabase
        .from('date_proposals')
        .insert({
          creator_user_id: user.id,
          recipient_user_id: matchUserId,
          conversation_id: conversationId,
          title: proposalData.title,
          activity: proposalData.activity,
          location_type: proposalData.location_type,
          vibe: proposalData.vibe,
          time_suggestion: proposalData.time_suggestion,
          rationale: proposalData.rationale,
          proposal_data: proposalData
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Date idea generated!",
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
        title: "Journal entry saved!",
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

  // Check if conversation is ready for AI concierge suggestion with RIF integration
  const checkConversationReadiness = async (
    conversationId: string,
    matchUserId: string
  ): Promise<{ shouldTrigger: boolean; confidence: number; triggers: string[] }> => {
    if (!user) return { shouldTrigger: false, confidence: 0, triggers: [] };

    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      const messagesTyped = messages as Message[];
      updatePattern(conversationId, messagesTyped);
      
      const readinessAnalysis = analyzeReadiness(conversationId, messagesTyped);
      
      const { data: userRifProfile } = await supabase
        .from('rif_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      const { data: matchRifProfile } = await supabase
        .from('rif_profiles')
        .select('*')
        .eq('user_id', matchUserId)
        .eq('is_active', true)
        .maybeSingle();

      const conversation = conversations.find(c => c.conversation_id === conversationId);
      
      if (conversation?.ai_concierge_triggered) {
        return { 
          shouldTrigger: false, 
          confidence: 0, 
          triggers: ['AI concierge already triggered for this conversation'] 
        };
      }

      const rifTriggers: string[] = [];
      let rifConfidenceModifier = 1.0;
      let minMessageThreshold = 8;
      let minEngagementThreshold = 0.6;

      if (userRifProfile) {
        if (userRifProfile.pacing_preferences <= 3) {
          minMessageThreshold = 15;
          minEngagementThreshold = 0.7;
          rifTriggers.push('User prefers slow pacing - higher thresholds applied');
        } else if (userRifProfile.pacing_preferences >= 8) {
          minMessageThreshold = 6;
          minEngagementThreshold = 0.5;
          rifTriggers.push('User prefers fast pacing - lower thresholds applied');
        }

        if (userRifProfile.emotional_readiness < 5) {
          rifConfidenceModifier *= 0.8;
          rifTriggers.push('Lower emotional readiness - reduced confidence');
        } else if (userRifProfile.emotional_readiness >= 8) {
          rifConfidenceModifier *= 1.2;
          rifTriggers.push('High emotional readiness - increased confidence');
        }

        if (userRifProfile.boundary_respect >= 7 && userRifProfile.intent_clarity >= 7) {
          rifConfidenceModifier *= 1.1;
          rifTriggers.push('High boundary respect and intent clarity');
        } else if (userRifProfile.boundary_respect < 5) {
          rifConfidenceModifier *= 0.9;
          rifTriggers.push('Lower boundary comfort - proceeding cautiously');
        }
      }

      if (userRifProfile && matchRifProfile) {
        const pacingDifference = Math.abs(userRifProfile.pacing_preferences - matchRifProfile.pacing_preferences);
        if (pacingDifference <= 2) {
          rifConfidenceModifier *= 1.15;
          rifTriggers.push('Compatible pacing preferences detected');
        } else if (pacingDifference >= 5) {
          rifConfidenceModifier *= 0.85;
          rifTriggers.push('Significant pacing differences - adjusted timing');
        }
      }

      const messageCount = messagesTyped.length;
      const engagementScore = conversation?.mutual_engagement_score || 0;
      
      if (messageCount < minMessageThreshold) {
        return { 
          shouldTrigger: false, 
          confidence: 0, 
          triggers: [`Insufficient conversation history (need at least ${minMessageThreshold} messages based on RIF profile)`] 
        };
      }

      if (engagementScore < minEngagementThreshold) {
        return { 
          shouldTrigger: false, 
          confidence: 0, 
          triggers: [`Engagement score ${engagementScore.toFixed(2)} below RIF-adjusted threshold of ${minEngagementThreshold}`] 
        };
      }

      const adjustedConfidence = readinessAnalysis.confidence * rifConfidenceModifier;
      const confidenceThreshold = userRifProfile?.intent_clarity >= 8 ? 0.65 : 0.7;

      const shouldTrigger = readinessAnalysis.isReady && adjustedConfidence >= confidenceThreshold;

      if (shouldTrigger) {
        try {
          const { data: matchProf } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', matchUserId)
            .single();
          const matchFirstName = matchProf?.name?.split(' ')?.[0] || 'your match';

          await sendEmailNotification(
            'date_proposal',
            'The vibe is right - plan a date with ' + matchFirstName,
            'Your conversation with ' + matchFirstName + ' is flowing beautifully. It looks like a great moment to suggest a date! Open MonArk and tap Plan a Date to let the AI concierge craft a personalized idea for both of you.',
            undefined,
            'https://monark.app/matches?action=plan_date&match=' + matchUserId
          );

          await markConciergeTriggered(conversationId, 24);
        } catch (notifError) {
          console.error('Date nudge notification failed (non-fatal):', notifError);
        }
      }

      return {
        shouldTrigger,
        confidence: adjustedConfidence,
        triggers: [...readinessAnalysis.triggers, ...rifTriggers]
      };
    } catch (error) {
      console.error('Error checking conversation readiness:', error);
      return { shouldTrigger: false, confidence: 0, triggers: ['Error analyzing conversation'] };
    }
  };

  // Mark AI concierge as triggered and set cooldown
  const markConciergeTriggered = async (conversationId: string, cooldownHours: number = 24) => {
    try {
      const { error } = await supabase
        .from('conversation_tracker')
        .update({ ai_concierge_triggered: true })
        .eq('conversation_id', conversationId);

      if (error) throw error;

      setCooldown(conversationId, cooldownHours);
      
      await fetchConversations();
    } catch (error) {
      console.error('Error marking concierge triggered:', error);
    }
  };

  // Reset AI concierge trigger status
  const resetConciergeStatus = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversation_tracker')
        .update({ ai_concierge_triggered: false })
        .eq('conversation_id', conversationId);

      if (error) throw error;
      await fetchConversations();
    } catch (error) {
      console.error('Error resetting concierge status:', error);
    }
  };

  // Update conversation engagement with readiness analysis
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

  // Dismiss proposal for current user
  const dismissProposal = async (proposalId: string) => {
    if (!user) return;

    try {
      const { data: proposal } = await supabase
        .from('date_proposals')
        .select('creator_user_id, recipient_user_id')
        .eq('id', proposalId)
        .single();

      if (!proposal) throw new Error('Proposal not found');

      const isCreator = proposal.creator_user_id === user.id;
      const isRecipient = proposal.recipient_user_id === user.id;

      if (!isCreator && !isRecipient) {
        throw new Error('Not authorized to dismiss this proposal');
      }

      const updateField = isCreator ? 'dismissed_by_creator_at' : 'dismissed_by_recipient_at';
      
      const { error } = await supabase
        .from('date_proposals')
        .update({ 
          [updateField]: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', proposalId);

      if (error) throw error;
      await fetchProposals();

      toast({
        title: "Proposal dismissed",
        description: "Date proposal has been hidden from your active list."
      });
    } catch (error) {
      console.error('Error dismissing proposal:', error);
      toast({
        title: "Dismiss failed",
        description: "Unable to dismiss proposal. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Restore dismissed proposal
  const restoreProposal = async (proposalId: string) => {
    if (!user) return;

    try {
      const { data: proposal } = await supabase
        .from('date_proposals')
        .select('creator_user_id, recipient_user_id')
        .eq('id', proposalId)
        .single();

      if (!proposal) throw new Error('Proposal not found');

      const isCreator = proposal.creator_user_id === user.id;
      const isRecipient = proposal.recipient_user_id === user.id;

      if (!isCreator && !isRecipient) {
        throw new Error('Not authorized to restore this proposal');
      }

      const updateField = isCreator ? 'dismissed_by_creator_at' : 'dismissed_by_recipient_at';
      
      const { error } = await supabase
        .from('date_proposals')
        .update({ 
          [updateField]: null,
          updated_at: new Date().toISOString() 
        })
        .eq('id', proposalId);

      if (error) throw error;
      await fetchProposals();

      toast({
        title: "Proposal restored",
        description: "Date proposal has been restored to your active list."
      });
    } catch (error) {
      console.error('Error restoring proposal:', error);
      toast({
        title: "Restore failed",
        description: "Unable to restore proposal. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    proposals,
    journalEntries,
    conversations,
    loading,
    generateDateProposal,
    updateProposalStatus,
    dismissProposal,
    restoreProposal,
    createJournalEntry,
    updateConversationEngagement,
    checkConversationReadiness,
    markConciergeTriggered,
    resetConciergeStatus,
    // --- Venue intelligence (additive) ---
    venueRecommendations: venueRecs.venues,
    venueLoading: venueRecs.loading,
    venueConfidence: venueRecs.confidence,
    refetch: async () => {
      await fetchProposals();
      await fetchJournalEntries();
      await fetchConversations();
    }
  };
};

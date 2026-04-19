import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MapPin, Clock, Heart, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useDateConcierge, DateProposal } from '@/hooks/useDateConcierge';
import { useAuth } from '@/hooks/useAuth';
import { useRIF, normalizeRIFScore } from '@/hooks/useRIF';
import { supabase } from '@/integrations/supabase/client';
import { VenueRecommendationStrip } from '@/components/date-concierge/VenueRecommendationStrip';
import type { RIFScores } from '@/lib/venueMatching';

interface MatchDateSuggestionCardProps {
  conversationId: string;
  matchUserId: string;
  matchName: string;
}

export const MatchDateSuggestionCard: React.FC<MatchDateSuggestionCardProps> = ({
  conversationId,
  matchUserId,
  matchName,
}) => {
  const [proposal, setProposal] = useState<DateProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { user } = useAuth();
  const { rifProfile } = useRIF();

  // Map RIF profile to the 5-pillar RIFScores shape used by venue matching.
  // The stored RIF uses different pillar names; we map the closest equivalents.
  const rifScores: RIFScores = {
    emotional_intelligence: rifProfile ? normalizeRIFScore(rifProfile.emotional_readiness) : 50,
    communication_style: rifProfile ? normalizeRIFScore(rifProfile.intent_clarity) : 50,
    lifestyle_alignment: rifProfile ? normalizeRIFScore(rifProfile.pacing_preferences) : 50,
    relationship_readiness: rifProfile ? normalizeRIFScore(rifProfile.post_date_alignment) : 50,
    growth_orientation: rifProfile ? normalizeRIFScore(rifProfile.boundary_respect) : 50,
  };

  const {
    updateProposalStatus,
    venueRecommendations,
    venueLoading,
    venueConfidence,
  } = useDateConcierge({
    activeConversationId: conversationId,
    rifScores,
  });

  useEffect(() => {
    const fetchProposal = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('date_proposals')
          .select('*')
          .eq('conversation_id', conversationId)
          .eq('ai_generated', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          setProposal(data[0]);
        }
      } catch (err) {
        console.error('Error fetching match date proposal:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [conversationId, user]);

  if (loading || !proposal || dismissed) return null;
  if (proposal.status === 'declined' || proposal.status === 'completed') return null;

  const isCreator = user?.id === proposal.creator_user_id;
  const isRecipient = user?.id === proposal.recipient_user_id;
  const isAccepted = proposal.status === 'accepted';

  const handleAccept = async () => {
    await updateProposalStatus(proposal.id, 'accepted');
    setProposal({ ...proposal, status: 'accepted' });
  };

  const handleDecline = async () => {
    await updateProposalStatus(proposal.id, 'declined');
    setDismissed(true);
  };

  return (
    <Card className="border-primary/20 bg-primary/5 mb-4 overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Curated Date Idea
              </p>
              <p className="text-xs text-muted-foreground">
                Personalized for you & {matchName}
              </p>
            </div>
          </div>
          {isAccepted && (
            <Badge variant="outline" className="text-xs border-green-500/30 text-green-600 bg-green-500/10">
              Accepted
            </Badge>
          )}
        </div>

        {/* Title */}
        <h4 className="text-base font-medium text-foreground mb-2">
          {proposal.title}
        </h4>

        {/* Quick details */}
        <div className="flex flex-wrap gap-3 mb-3 text-sm text-muted-foreground">
          {proposal.vibe && (
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-primary" />
              {proposal.vibe}
            </span>
          )}
          {proposal.location_type && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {proposal.location_type}
            </span>
          )}
          {proposal.time_suggestion && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {proposal.time_suggestion}
            </span>
          )}
        </div>

        {/* Expandable details */}
        {expanded && (
          <div className="space-y-3 mb-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="bg-background/60 rounded-lg p-3">
              <p className="text-sm font-medium text-foreground mb-1">Activity</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {proposal.activity}
              </p>
            </div>

            {proposal.rationale && (
              <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                <p className="text-sm font-medium text-foreground mb-1">Why this works</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {proposal.rationale}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Venue recommendations strip */}
        <VenueRecommendationStrip
          venues={venueRecommendations}
          loading={venueLoading}
          confidence={venueConfidence}
          rifScores={rifScores}
          className="mb-3"
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted-foreground"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 mr-1" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 mr-1" />
                Details
              </>
            )}
          </Button>

          <div className="flex-1" />

          {proposal.status === 'proposed' && isRecipient && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDecline}
                className="text-xs text-muted-foreground"
              >
                Not for me
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                className="text-xs"
              >
                <Calendar className="w-3.5 h-3.5 mr-1" />
                Let's do it
              </Button>
            </>
          )}

          {proposal.status === 'proposed' && isCreator && (
            <span className="text-xs text-muted-foreground">
              Waiting for {matchName}'s response
            </span>
          )}

          {isAccepted && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateProposalStatus(proposal.id, 'completed')}
              className="text-xs"
            >
              Mark Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, MessageCircle, Heart, Zap, RotateCcw, Archive, Info, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
const formatTimeAgo = (dateStr: string) => {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: false });
  } catch {
    return '';
  }
};
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AfterDateFeedback } from '../feedback/AfterDateFeedback';
import { DateProposalCard } from '../date-concierge/DateProposalCard';
import { ChatModal } from '../chat/ChatModal';
import { useDateConcierge } from '@/hooks/useDateConcierge';
import { useAuth } from '@/hooks/useAuth';
import { useAfterDateFeedback } from '@/hooks/useAfterDateFeedback';
import { useConversations } from '@/hooks/useConversations';

// ── RIF compatibility helper ───────────────────────────────────────────────────
// We allow messaging when a connection is in the user's connections list
// AND their RIF scores are reasonably aligned (score >= 0.5 = 50% compatibility)
// This removes the strict mutual-match requirement while still honoring intentionality
const getRIFAlignmentLabel = (score: number): { label: string; color: string } => {
  if (score >= 0.8) return { label: 'Strong RIF alignment', color: 'text-emerald-600' };
  if (score >= 0.6) return { label: 'Good RIF alignment', color: 'text-primary' };
  if (score >= 0.4) return { label: 'Moderate alignment', color: 'text-amber-600' };
  return { label: 'Low alignment', color: 'text-muted-foreground' };
};

// ── How matching works tip ─────────────────────────────────────────────────────
const HowItWorksTip: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => (
  <div className="bg-card border border-primary/20 rounded-2xl p-4 shadow-sm relative">
    <button
      onClick={onDismiss}
      className="absolute top-3 right-3 p-1 rounded-full hover:bg-secondary/50 transition-colors"
      aria-label="Dismiss"
    >
      <X className="w-3.5 h-3.5 text-muted-foreground" />
    </button>
    <div className="flex items-start gap-3 pr-5">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">How MonArk matching works</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          When a profile appears in your Connections, you can message them directly — no waiting for
          both sides to connect first. MonArk uses your{' '}
          <span className="font-medium text-foreground">Relational Intelligence (RIF) scores</span>{' '}
          to surface people whose pacing, emotional readiness, and values genuinely complement yours.
          The stronger the alignment, the more intentional the connection.
        </p>
        <p className="text-xs text-primary font-medium mt-2">
          ✦ Start a conversation. MonArk handles the curation.
        </p>
      </div>
    </div>
  </div>
);

export const Conversations: React.FC = () => {
  const { user } = useAuth();
  const { conversations: realConversations, loading: conversationsLoading } = useConversations();
  const { proposals, updateConversationEngagement, dismissProposal, restoreProposal } = useDateConcierge();
  const { pendingFeedback, showFeedback, setShowFeedback, dismissFeedback } = useAfterDateFeedback();
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeChatConversation, setActiveChatConversation] = useState<any>(null);
  const [feedbackConversation, setFeedbackConversation] = useState<{
    id: string;
    name: string;
    itineraryId: string;
  } | null>(null);

  // Tip banner state — shown once, dismissed to localStorage
  const [tipDismissed, setTipDismissed] = useState(() => {
    try {
      return localStorage.getItem('monark-connections-tip-v1') === 'true';
    } catch {
      return false;
    }
  });
  const dismissTip = () => {
    setTipDismissed(true);
    try {
      localStorage.setItem('monark-connections-tip-v1', 'true');
    } catch {}
  };

  // Use real conversations from Supabase
  const conversations = realConversations.map((conv: any) => {
    const rifScore = conv.rif_compatibility_score ?? conv.mutual_engagement_score ?? 0;
    return {
      id: conv.id,
      name: conv.otherUser?.name || conv.match_name || conv.name || 'Your match',
      image: conv.otherUser?.avatar_url || conv.match_photo || conv.image || '',
      lastMessage: conv.lastMessage?.content || conv.last_message || 'Start the conversation',
      time: conv.last_activity ? formatTimeAgo(conv.last_activity) : '',
      isNewMatch: (conv.message_count || 0) <= 1,
      lastActivity: conv.last_activity ? new Date(conv.last_activity) : new Date(),
      messageCount: conv.message_count || 0,
      mutualEngagement: conv.mutual_engagement_score || 0,
      // RIF compatibility score — 0 to 1
      rifCompatibility: typeof rifScore === 'number' ? rifScore : 0,
      conversationId: conv.conversation_id,
      userId: user?.id || '',
      hadDate: false,
    };
  });

  useEffect(() => {
    if (!user) return;
    conversations.forEach((conv) => {
      updateConversationEngagement(conv.conversationId, conv.userId, conv.messageCount, conv.mutualEngagement);
    });
  }, [user]);

  const handleConversationClick = (conversation: any) => {
    setActiveChatConversation(conversation);
    setShowChatModal(true);
  };

  const handleEndConversation = (conversationId: string, message: string, reason?: string) => {
    setShowChatModal(false);
    setActiveChatConversation(null);
  };

  const relevantProposals = proposals.filter((proposal) => {
    const isInvolvedConversation = conversations.some(
      (conv) => conv.conversationId === proposal.conversation_id
    );
    if (!isInvolvedConversation) return false;
    const isCreator = proposal.creator_user_id === user?.id;
    const dismissedField = isCreator
      ? (proposal as any).dismissed_by_creator_at
      : (proposal as any).dismissed_by_recipient_at;
    return !dismissedField && (proposal.status === 'proposed' || proposal.status === 'accepted');
  });

  const dismissedProposals = proposals.filter((proposal) => {
    const isInvolvedConversation = conversations.some(
      (conv) => conv.conversationId === proposal.conversation_id
    );
    if (!isInvolvedConversation) return false;
    const isCreator = proposal.creator_user_id === user?.id;
    const dismissedField = isCreator
      ? (proposal as any).dismissed_by_creator_at
      : (proposal as any).dismissed_by_recipient_at;
    return !!dismissedField || proposal.status === 'declined';
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-foreground mb-4">Sign In Required</h2>
          <p className="text-muted-foreground">Please sign in to view your conversations.</p>
        </div>
      </div>
    );
  }

  const hasNoRealConversations = !conversationsLoading && realConversations.length === 0;

  return (
    <div className="bg-background px-5 pt-3 pb-8">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">Connections</h1>
          <p className="text-muted-foreground text-sm mt-0.5">People MonArk has connected you with</p>
        </div>

        {/* How it works tip — shown until dismissed */}
        {!tipDismissed && <HowItWorksTip onDismiss={dismissTip} />}

        {/* Empty state */}
        {hasNoRealConversations && (
          <div className="text-center py-16 space-y-5">
            <div className="w-20 h-20 rounded-full bg-[#EDE6DF] mx-auto flex items-center justify-center">
              <span className="font-editorial-headline text-[#A08C6E] text-2xl tracking-tight">MA</span>
            </div>
            <div className="space-y-2">
              <h2 className="font-editorial italic text-xl text-foreground">
                Your connections will appear here.
              </h2>
              <p className="font-body text-sm text-muted-foreground max-w-xs mx-auto">
                When MonArk curates a match for you, you'll be able to message them directly — no
                waiting room, no mutual tap required. RIF alignment guides who lands here.
              </p>
            </div>
          </div>
        )}

        {/* Date Proposals Section */}
        {(relevantProposals.length > 0 || dismissedProposals.length > 0) && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Date Proposals</h2>
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/60 h-10">
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm"
                >
                  Active ({relevantProposals.length})
                </TabsTrigger>
                <TabsTrigger
                  value="dismissed"
                  className="data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm"
                >
                  <Archive className="h-3.5 w-3.5 mr-1" />
                  Dismissed ({dismissedProposals.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="mt-3">
                {relevantProposals.length > 0 ? (
                  <div className="grid gap-3">
                    {relevantProposals.slice(0, 2).map((proposal) => (
                      <DateProposalCard key={proposal.id} proposal={proposal} onDismiss={dismissProposal} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-card rounded-2xl border border-border/60">
                    <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No active date proposals</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="dismissed" className="mt-3">
                {dismissedProposals.length > 0 ? (
                  <div className="grid gap-3">
                    {dismissedProposals.map((proposal) => (
                      <div key={proposal.id} className="relative">
                        <DateProposalCard proposal={proposal} />
                        <div className="absolute top-3 right-3">
                          <Button
                            onClick={() => restoreProposal(proposal.id)}
                            size="sm"
                            variant="outline"
                            className="h-8 border-primary/20 text-primary hover:bg-primary/10"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-card rounded-2xl border border-border/60">
                    <Archive className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No dismissed proposals</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Conversations list */}
        {!hasNoRealConversations && conversations.length > 0 && (
          <div className="space-y-2.5">
            <h2 className="text-base font-semibold text-foreground">Messages</h2>
            {conversations.map((conversation) => {
              const rifInfo = getRIFAlignmentLabel(conversation.rifCompatibility);
              return (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                  className="bg-card rounded-2xl p-4 border border-border/60 hover:border-primary/20 transition-all duration-200 cursor-pointer group shadow-[0_1px_3px_rgba(100,80,60,0.04)] hover:shadow-[0_2px_8px_rgba(100,80,60,0.08)] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {conversation.image ? (
                        <img
                          src={conversation.image}
                          alt={conversation.name}
                          loading="lazy"
                          className="w-12 h-12 rounded-full ring-2 ring-border/80 group-hover:ring-primary/25 transition-all object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full ring-2 ring-border/80 bg-[#EDE6DF] flex items-center justify-center">
                          <span className="font-serif text-[#A08C6E] text-lg">
                            {conversation.name?.[0] || 'M'}
                          </span>
                        </div>
                      )}
                      {conversation.isNewMatch && (
                        <div className="absolute top-0 -left-0.5 w-3 h-3 bg-primary rounded-full border-2 border-card" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-foreground text-[15px] ${
                            conversation.isNewMatch ? 'font-bold' : 'font-semibold'
                          }`}
                        >
                          {conversation.name}
                        </h3>
                        {conversation.isNewMatch && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-medium rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm truncate mt-0.5 ${
                          conversation.isNewMatch ? 'text-primary font-semibold' : 'text-muted-foreground'
                        }`}
                      >
                        {conversation.lastMessage}
                      </p>
                      {/* RIF alignment badge */}
                      {conversation.rifCompatibility > 0 && (
                        <p className={`text-[10px] mt-0.5 ${rifInfo.color}`}>
                          ✦ {rifInfo.label}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConversationClick(conversation);
                        }}
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs border-primary/20 text-primary hover:bg-primary/10 rounded-lg"
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1" />
                        Message
                      </Button>
                      {conversation.isNewMatch && <Sparkles className="h-4 w-4 text-primary" />}
                      <span className="text-muted-foreground text-xs ml-1">{conversation.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showChatModal && activeChatConversation && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => {
            setShowChatModal(false);
            setActiveChatConversation(null);
          }}
          conversationId={activeChatConversation.conversationId}
          matchUserId={activeChatConversation.userId}
          matchName={activeChatConversation.name}
          matchImage={activeChatConversation.image}
        />
      )}

      {feedbackConversation && (
        <AfterDateFeedback
          itineraryId={feedbackConversation.itineraryId}
          matchUserId={feedbackConversation.id}
          matchName={feedbackConversation.name}
          open={!!feedbackConversation}
          onClose={() => setFeedbackConversation(null)}
        />
      )}

      {showFeedback && pendingFeedback && (
        <AfterDateFeedback
          itineraryId={pendingFeedback.itineraryId}
          matchUserId={pendingFeedback.matchUserId}
          matchName={pendingFeedback.matchName}
          open={showFeedback}
          onClose={dismissFeedback}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, MessageCircle, Heart, Zap, RotateCcw, Archive } from 'lucide-react';
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

export const Conversations: React.FC = () => {
  const { user } = useAuth();
  const { conversations: realConversations, loading: conversationsLoading } = useConversations();
  const { proposals, updateConversationEngagement, dismissProposal, restoreProposal } = useDateConcierge();
  const { pendingFeedback, showFeedback, setShowFeedback, dismissFeedback } = useAfterDateFeedback();
  
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeChatConversation, setActiveChatConversation] = useState<any>(null);
  const [feedbackConversation, setFeedbackConversation] = useState<{id: string; name: string; itineraryId: string} | null>(null);

  // Use real conversations from Supabase, no hardcoded demo data
  const conversations = realConversations.map((conv: any) => ({
    id: conv.id,
    name: conv.match_name || conv.name || 'Connection',
    image: conv.match_photo || conv.image || '',
    lastMessage: conv.last_message || 'Start the conversation',
    time: conv.last_activity ? formatTimeAgo(conv.last_activity) : '',
    isNewMatch: (conv.message_count || 0) <= 1,
    lastActivity: conv.last_activity ? new Date(conv.last_activity) : new Date(),
    messageCount: conv.message_count || 0,
    mutualEngagement: conv.mutual_engagement_score || 0,
    conversationId: conv.conversation_id,
    userId: user?.id || '',
    hadDate: false,
  }));

  useEffect(() => {
    if (!user) return;
    conversations.forEach(conv => {
      updateConversationEngagement(conv.conversationId, conv.userId, conv.messageCount, conv.mutualEngagement);
    });
  }, [user]);

  const handleConversationClick = (conversation: any) => {
    setActiveChatConversation(conversation);
    setShowChatModal(true);
  };

  const handleSendMessage = async (conversationId: string, message: string) => {
    console.log(`Message sent via ChatInterface for ${conversationId}`);
  };

  const handleEndConversation = (conversationId: string, message: string, reason?: string) => {
    console.log(`Ending conversation ${conversationId} with message:`, message, 'Reason:', reason);
    setShowChatModal(false);
    setActiveChatConversation(null);
  };

  const relevantProposals = proposals.filter(proposal => {
    const isInvolvedConversation = conversations.some(conv => conv.conversationId === proposal.conversation_id);
    if (!isInvolvedConversation) return false;
    const isCreator = proposal.creator_user_id === user?.id;
    const dismissedField = isCreator ? (proposal as any).dismissed_by_creator_at : (proposal as any).dismissed_by_recipient_at;
    return !dismissedField && (proposal.status === 'proposed' || proposal.status === 'accepted');
  });

  const dismissedProposals = proposals.filter(proposal => {
    const isInvolvedConversation = conversations.some(conv => conv.conversationId === proposal.conversation_id);
    if (!isInvolvedConversation) return false;
    const isCreator = proposal.creator_user_id === user?.id;
    const dismissedField = isCreator ? (proposal as any).dismissed_by_creator_at : (proposal as any).dismissed_by_recipient_at;
    return !!dismissedField || proposal.status === 'declined';
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-foreground mb-4">Sign In Required</h2>
          <p className="text-muted-foreground">Please sign in to view your conversations and start chatting.</p>
        </div>
      </div>
    );
  }

  // Show empty state when user has no real conversations
  const hasNoRealConversations = !conversationsLoading && realConversations.length === 0;

  return (
    <div className="bg-background">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">Conversations</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Meaningful connections await</p>
        </div>

        {/* Empty state for new users */}
        {hasNoRealConversations && (
          <div className="text-center py-16 space-y-5">
            <div className="w-20 h-20 rounded-full bg-[#EDE6DF] mx-auto flex items-center justify-center">
              <span className="font-editorial-headline text-[#A08C6E] text-2xl tracking-tight">MA</span>
            </div>
            <div className="space-y-2">
              <h2 className="font-editorial italic text-xl text-foreground">Your connections will appear here.</h2>
              <p className="font-body text-sm text-muted-foreground max-w-xs mx-auto">
                When you and an introduction are both ready, the conversation begins.
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
                            title="Restore proposal"
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

        {/* Conversations List */}
        <div className="space-y-2.5">
          <h2 className="text-base font-semibold text-foreground">Messages</h2>
          
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationClick(conversation)}
              className="bg-card rounded-2xl p-4 border border-border/60 hover:border-primary/20 transition-all duration-200 cursor-pointer group shadow-[0_1px_3px_rgba(100,80,60,0.04)] hover:shadow-[0_2px_8px_rgba(100,80,60,0.08)] active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative flex-shrink-0">
                  <img
                    src={conversation.image}
                    alt={conversation.name}
                    loading="lazy"
                    className="w-12 h-12 rounded-full ring-2 ring-border/80 group-hover:ring-primary/25 transition-all object-cover"
                  />
                  {conversation.isNewMatch && (
                    <div className="absolute top-0 -left-0.5 w-3 h-3 bg-primary rounded-full border-2 border-card" />
                  )}
                  {conversation.mutualEngagement > 0.7 && conversation.messageCount > 15 && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full border-2 border-card flex items-center justify-center">
                      <Calendar className="h-2 w-2 text-primary-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-foreground text-[15px] ${conversation.isNewMatch ? 'font-bold' : 'font-semibold'}`}>
                      {conversation.name}
                    </h3>
                    {conversation.hadDate && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-medium rounded-full">
                        Date completed
                      </span>
                    )}
                    {conversation.isNewMatch && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-medium rounded-full">
                        New match
                      </span>
                    )}
                    {conversation.mutualEngagement > 0.7 && conversation.messageCount > 15 && !conversation.hadDate && (
                      <Badge 
                        variant="secondary" 
                        className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] rounded-full border-none flex items-center gap-1 animate-pulse"
                      >
                        <Zap className="h-3 w-3" />
                        <span>Ready for date!</span>
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm truncate mt-0.5 ${
                    conversation.isNewMatch 
                      ? 'text-primary font-semibold' 
                      : 'text-muted-foreground'
                  }`}>
                    {conversation.lastMessage}
                  </p>
                </div>
                
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
                    Chat
                  </Button>
                  
                  {conversation.hadDate && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFeedbackConversation({
                          id: conversation.conversationId,
                          name: conversation.name,
                          itineraryId: ''
                        });
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-primary hover:bg-primary/10 rounded-lg"
                      title="Rate Date"
                    >
                      <Heart className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  
                  {conversation.isNewMatch && (
                    <Sparkles className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-muted-foreground text-xs ml-1">
                    {conversation.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showChatModal && activeChatConversation && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => { setShowChatModal(false); setActiveChatConversation(null); }}
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

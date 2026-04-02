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
  const { proposals, updateConversationEngagement, dismissProposal, restoreProposal } = useDateConcierge();
  const { pendingFeedback, showFeedback, setShowFeedback, dismissFeedback } = useAfterDateFeedback();
  
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeChatConversation, setActiveChatConversation] = useState<any>(null);
  const [feedbackConversation, setFeedbackConversation] = useState<{id: string; name: string; itineraryId: string} | null>(null);

  const conversations = [
    {
      id: 1,
      name: 'Maya',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b047?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'That sounds like an amazing experience!',
      time: '2h',
      isNewMatch: false,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      messageCount: 24,
      mutualEngagement: 0.8,
      conversationId: 'conv_maya_001',
      userId: user?.id || '76cc75e6-3228-4b19-97b5-f455639f6109'
    },
    {
      id: 2,
      name: 'Alex',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'New Match! Ready to start the chat?',
      time: '1d',
      isNewMatch: true,
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
      messageCount: 1,
      mutualEngagement: 0.3,
      conversationId: 'conv_alex_001',
      userId: user?.id || '76cc75e6-3228-4b19-97b5-f455639f6109'
    },
    {
      id: 3,
      name: 'Jordan',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'I love that idea for our first date',
      time: '3d',
      isNewMatch: false,
      lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      messageCount: 18,
      mutualEngagement: 0.9,
      hadDate: true,
      conversationId: 'conv_jordan_001',
      userId: user?.id || '76cc75e6-3228-4b19-97b5-f455639f6109'
    },
  ];

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

  return (
    <div className="bg-background">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">Conversations</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Meaningful connections await</p>
        </div>

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
                  {conversation.mutualEngagement > 0.7 && conversation.messageCount > 15 && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full border-2 border-card flex items-center justify-center">
                      <Calendar className="h-2 w-2 text-primary-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-foreground font-semibold text-[15px]">
                      {conversation.name}
                    </h3>
                    {conversation.hadDate && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-medium rounded-full">
                        Date completed
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
                      ? 'text-primary font-medium' 
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

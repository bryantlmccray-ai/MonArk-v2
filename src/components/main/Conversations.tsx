import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Plus, MessageCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RIFBehavioralNudge } from '../rif/RIFBehavioralNudge';
import { RIFPostDateFeedback } from '../rif/RIFPostDateFeedback';
import { AIConciergeModal } from '../date-concierge/AIConciergeModal';
import { DateProposalCard } from '../date-concierge/DateProposalCard';
import { DateJournalEntryComponent } from '../date-concierge/DateJournalEntry';
import { ConversationHelper } from '../conversation/ConversationHelper';
import { ChatModal } from '../chat/ChatModal';
import { useRIF } from '@/hooks/useRIF';
import { useDateConcierge } from '@/hooks/useDateConcierge';
import { useConversationNudges } from '@/hooks/useConversationNudges';
import { useAuth } from '@/hooks/useAuth';

export const Conversations: React.FC = () => {
  const { user } = useAuth();
  const { rifSettings } = useRIF();
  const { proposals, updateConversationEngagement } = useDateConcierge();
  const { updateConversationActivity } = useConversationNudges();
  
  const [showNudge, setShowNudge] = useState(false);
  const [showPostDateFeedback, setShowPostDateFeedback] = useState(false);
  const [showConciergeModal, setShowConciergeModal] = useState(false);
  const [showJournalEntry, setShowJournalEntry] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeChatConversation, setActiveChatConversation] = useState<any>(null);
  const [nudgeType, setNudgeType] = useState<'conversation_pacing' | 'emotional_check' | 'boundary_reminder' | 'reflection_prompt'>('conversation_pacing');
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [activeConversation, setActiveConversation] = useState<any>(null);

  // Generate proper UUIDs for mock users
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
      userId: user?.id || '76cc75e6-3228-4b19-97b5-f455639f6109' // Use current user or fallback
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

  // Update conversation engagement scores
  useEffect(() => {
    if (!user) return;
    
    conversations.forEach(conv => {
      updateConversationEngagement(
        conv.conversationId,
        conv.userId,
        conv.messageCount,
        conv.mutualEngagement
      );
      updateConversationActivity(
        conv.conversationId,
        conv.messageCount,
        conv.mutualEngagement
      );
    });
  }, [user]);

  // Check for AI concierge triggers
  useEffect(() => {
    const highEngagementConvs = conversations.filter(
      conv => conv.mutualEngagement > 0.7 && conv.messageCount > 15
    );

    if (highEngagementConvs.length > 0 && Math.random() > 0.6) {
      setTimeout(() => {
        setActiveConversation(highEngagementConvs[0]);
        setShowConciergeModal(true);
      }, 3000);
    }
  }, []);

  // Simulate RIF nudges based on conversation patterns
  useEffect(() => {
    if (!rifSettings?.rif_enabled) return;

    const timer = setTimeout(() => {
      const activeConversation = conversations.find(c => c.messageCount > 20);
      if (activeConversation) {
        setNudgeType('conversation_pacing');
        setShowNudge(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [rifSettings]);

  // Removed automatic post-date feedback trigger - now manual via button

  const handleConversationClick = (conversation: any) => {
    // Open chat modal for direct messaging
    setActiveChatConversation(conversation);
    setShowChatModal(true);

    // Check if this conversation should trigger AI concierge
    if (conversation.mutualEngagement > 0.7 && conversation.messageCount > 10) {
      setActiveConversation(conversation);
      setTimeout(() => setShowConciergeModal(true), 1000);
    }

    if (rifSettings?.rif_enabled && conversation.messageCount > 15) {
      setNudgeType('emotional_check');
      setTimeout(() => setShowNudge(true), 2000);
    }
  };

  const handleSendMessage = async (conversationId: string, message: string) => {
    // This is now handled by the ChatInterface component
    console.log(`Message sent via ChatInterface for ${conversationId}`);
  };

  const handleEndConversation = (conversationId: string, message: string, reason?: string) => {
    console.log(`Ending conversation ${conversationId} with message:`, message, 'Reason:', reason);
    setShowChatModal(false);
    setActiveChatConversation(null);
  };

  const relevantProposals = proposals.filter(proposal => 
    conversations.some(conv => conv.conversationId === proposal.conversation_id)
  );

  // Show authentication message if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-jet-black p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-white mb-4">Sign In Required</h2>
          <p className="text-gray-400">Please sign in to view your conversations and start chatting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jet-black p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-light text-white">Conversations</h1>
            <p className="text-gray-400 text-sm mt-1">Meaningful connections await</p>
          </div>
          {rifSettings?.rif_enabled && (
            <div className="bg-charcoal-gray/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-goldenrod/30">
              <div className="text-xs text-goldenrod font-medium">RIF Insights Active</div>
              <div className="text-xs text-gray-400">Emotional guidance enabled</div>
            </div>
          )}
        </div>

        {/* Date Proposals Section */}
        {relevantProposals.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">Active Date Proposals</h2>
              <Button
                onClick={() => setShowJournalEntry(true)}
                size="sm"
                className="bg-goldenrod/20 hover:bg-goldenrod/30 text-goldenrod border border-goldenrod/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Journal Entry
              </Button>
            </div>
            <div className="grid gap-4">
              {relevantProposals.slice(0, 2).map((proposal) => (
                <DateProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Messages</h2>
          </div>
          
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationClick(conversation)}
              className="bg-charcoal-gray rounded-xl p-4 border border-gray-800 hover:border-goldenrod/30 transition-all duration-300 cursor-pointer relative"
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={conversation.image}
                    alt={conversation.name}
                    className="w-12 h-12 rounded-full cursor-pointer"
                  />
                  {rifSettings?.rif_enabled && conversation.messageCount > 10 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-goldenrod rounded-full border border-jet-black animate-pulse" />
                  )}
                  {conversation.mutualEngagement > 0.7 && conversation.messageCount > 15 && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border border-jet-black flex items-center justify-center">
                      <Calendar className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-medium cursor-pointer">
                      {conversation.name}
                    </h3>
                    {conversation.hadDate && (
                      <div className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full border border-purple-600/30">
                        Date completed
                      </div>
                    )}
                    {conversation.mutualEngagement > 0.7 && conversation.messageCount > 15 && (
                      <div className="px-2 py-1 bg-goldenrod/20 text-goldenrod text-xs rounded-full border border-goldenrod/30 flex items-center space-x-1">
                        <Sparkles className="h-3 w-3" />
                        <span>Plan a date</span>
                      </div>
                    )}
                    {rifSettings?.rif_enabled && conversation.messageCount > 15 && (
                      <div className="px-2 py-1 bg-goldenrod/20 text-goldenrod text-xs rounded-full border border-goldenrod/30">
                        Active chat
                      </div>
                    )}
                  </div>
                  <p className={`text-sm ${
                    conversation.isNewMatch 
                      ? 'text-goldenrod' 
                      : 'text-gray-400'
                  }`}>
                    {conversation.lastMessage}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConversationClick(conversation);
                    }}
                    size="sm"
                    className="bg-goldenrod/20 hover:bg-goldenrod/30 text-goldenrod border border-goldenrod/30"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Chat
                  </Button>
                  
                  {conversation.hadDate && rifSettings?.rif_enabled && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedConversation(conversation.name);
                        setShowPostDateFeedback(true);
                      }}
                      size="sm"
                      className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30"
                      title="Post-Date Reflection"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {conversation.isNewMatch && (
                    <Sparkles className="h-5 w-5 text-goldenrod" />
                  )}
                  <span className="text-gray-500 text-xs">
                    {conversation.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Modal */}
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

      {/* AI Concierge Modal */}
      {showConciergeModal && activeConversation && (
        <AIConciergeModal
          isOpen={showConciergeModal}
          onClose={() => setShowConciergeModal(false)}
          matchUserId={activeConversation.userId}
          matchName={activeConversation.name}
          conversationId={activeConversation.conversationId}
          recentMessages={['Sample message 1', 'Sample message 2']}
        />
      )}

      {/* Date Journal Entry Modal */}
      <DateJournalEntryComponent
        isOpen={showJournalEntry}
        onClose={() => setShowJournalEntry(false)}
      />

      {/* RIF Behavioral Nudge */}
      {showNudge && rifSettings?.rif_enabled && (
        <RIFBehavioralNudge
          type={nudgeType}
          context={{
            conversationDuration: 2,
            messageCount: 24,
            lastActivity: new Date()
          }}
          onDismiss={() => setShowNudge(false)}
          onAction={() => setShowNudge(false)}
        />
      )}

      {/* Post-Date Feedback */}
      {showPostDateFeedback && selectedConversation && (
        <RIFPostDateFeedback
          dateName={selectedConversation}
          onComplete={() => setShowPostDateFeedback(false)}
          onSkip={() => setShowPostDateFeedback(false)}
        />
      )}
    </div>
  );
};

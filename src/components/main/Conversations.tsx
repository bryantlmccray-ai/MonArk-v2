
import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { RIFBehavioralNudge } from '../rif/RIFBehavioralNudge';
import { RIFPostDateFeedback } from '../rif/RIFPostDateFeedback';
import { useRIF } from '@/hooks/useRIF';

export const Conversations: React.FC = () => {
  const { rifSettings } = useRIF();
  const [showNudge, setShowNudge] = useState(false);
  const [showPostDateFeedback, setShowPostDateFeedback] = useState(false);
  const [nudgeType, setNudgeType] = useState<'conversation_pacing' | 'emotional_check' | 'boundary_reminder' | 'reflection_prompt'>('conversation_pacing');
  const [selectedConversation, setSelectedConversation] = useState<string>('');

  const conversations = [
    {
      id: 1,
      name: 'Maya',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b047?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'That sounds like an amazing experience!',
      time: '2h',
      isNewMatch: false,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      messageCount: 24
    },
    {
      id: 2,
      name: 'Alex',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'New Match! Ready to start the chat?',
      time: '1d',
      isNewMatch: true,
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      messageCount: 1
    },
    {
      id: 3,
      name: 'Jordan',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'I love that idea for our first date',
      time: '3d',
      isNewMatch: false,
      lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      messageCount: 18,
      hadDate: true // This person had a date
    },
  ];

  // Simulate RIF nudges based on conversation patterns
  useEffect(() => {
    if (!rifSettings?.rif_enabled) return;

    const timer = setTimeout(() => {
      const activeConversation = conversations.find(c => c.messageCount > 20);
      if (activeConversation) {
        setNudgeType('conversation_pacing');
        setShowNudge(true);
      }
    }, 5000); // Show nudge after 5 seconds

    return () => clearTimeout(timer);
  }, [rifSettings]);

  // Show post-date feedback for conversations that had dates
  useEffect(() => {
    if (!rifSettings?.rif_enabled) return;

    const dateConversation = conversations.find(c => c.hadDate);
    if (dateConversation && Math.random() > 0.7) { // 30% chance to show feedback prompt
      setTimeout(() => {
        setSelectedConversation(dateConversation.name);
        setShowPostDateFeedback(true);
      }, 2000);
    }
  }, [rifSettings]);

  const handleConversationClick = (conversation: any) => {
    if (rifSettings?.rif_enabled && conversation.messageCount > 15) {
      // Trigger emotional check-in for active conversations
      setNudgeType('emotional_check');
      setShowNudge(true);
    }
  };

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

        <div className="space-y-4">
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
                    className="w-12 h-12 rounded-full"
                  />
                  {rifSettings?.rif_enabled && conversation.messageCount > 10 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-goldenrod rounded-full border border-jet-black animate-pulse" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-medium">
                      {conversation.name}
                    </h3>
                    {conversation.hadDate && (
                      <div className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full border border-purple-600/30">
                        Date completed
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

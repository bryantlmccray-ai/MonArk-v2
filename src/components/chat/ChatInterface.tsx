
import React, { useState, useRef, useEffect } from 'react';
import { Send, MoreVertical, Shield, Video, Calendar, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ConversationHelper } from '@/components/conversation/ConversationHelper';
import { UserActionsModal } from '@/components/safety/UserActionsModal';
import { AIConciergeModal } from '@/components/date-concierge/AIConciergeModal';
import { VideoCallModal } from '@/components/video/VideoCallModal';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useDateConcierge } from '@/hooks/useDateConcierge';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useRealTimePresence } from '@/hooks/useRealTimePresence';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  conversationId: string;
  matchUserId: string;
  matchName: string;
  matchImage?: string;
  onClose?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  matchUserId,
  matchName,
  matchImage,
  onClose
}) => {
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showUserActions, setShowUserActions] = useState(false);
  const [showConcierge, setShowConcierge] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { messages, loading, sendMessage } = useMessages(conversationId);
  const { user } = useAuth();
  const { checkConversationReadiness } = useDateConcierge();
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(conversationId);
  const { isUserOnline } = useRealTimePresence();

  // Typing timeout ref
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if conversation is ready for AI concierge
  useEffect(() => {
    if (messages.length > 15 && user) {
      checkConversationReadiness(conversationId, matchUserId).then((readiness) => {
        if (readiness.shouldTrigger && readiness.confidence > 0.7) {
          // Could show a subtle prompt or notification
          console.log('Conversation ready for AI concierge:', readiness);
        }
      });
    }
  }, [messages.length, conversationId, matchUserId, user]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        stopTyping();
      }
    };
  }, [stopTyping]);

  // Handle typing indicator
  const handleTyping = (text: string) => {
    setMessageText(text);
    
    if (text.trim()) {
      // Start typing if not already
      startTyping(matchName);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 2000);
    } else {
      // Stop typing immediately if text is empty
      stopTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;
    
    // Stop typing indicator
    stopTyping();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  
    setIsSending(true);
    const success = await sendMessage(messageText, matchUserId);
  
    if (success) {
      setMessageText('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
    setIsSending(false);
  };

  // Get delivery status icon
  const getDeliveryStatusIcon = (message: any) => {
    if (message.sender_user_id !== user?.id) return null;
    
    switch (message.delivery_status) {
      case 'sending':
        return <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />;
      case 'delivered':
        return <Check className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-goldenrod" />;
      case 'failed':
        return <div className="w-3 h-3 bg-red-500 rounded-full" />;
      default:
        return <Check className="h-3 w-3" />;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConversationHelperSend = async (message: string) => {
    await sendMessage(message, matchUserId);
  };

  const handleConversationHelperEnd = async (message: string, reason?: string) => {
    // Send the farewell message
    await sendMessage(message, matchUserId);
    
    // Send a system message about the conversation ending
    if (reason) {
      await sendMessage(`Conversation ended: ${reason}`, matchUserId, 'system');
    }
    
    // Close the chat interface
    onClose?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-jet-black">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={matchImage} alt={matchName} />
            <AvatarFallback className="bg-goldenrod text-jet-black">
              {matchName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-white font-medium">{matchName}</h3>
            <p className="text-gray-400 text-sm">
              {isUserOnline(matchUserId) ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Online
                </span>
              ) : (
                'Last seen recently'
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ConversationHelper
            conversationId={conversationId}
            matchName={matchName}
            onSendMessage={handleConversationHelperSend}
            onEndConversation={handleConversationHelperEnd}
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-charcoal-gray border-gray-700">
              <DropdownMenuItem
                onClick={() => setShowConcierge(true)}
                className="text-white hover:bg-goldenrod/20 cursor-pointer"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Plan a Date
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={() => setShowVideoCall(true)}
                className="text-white hover:bg-blue-500/20 cursor-pointer"
              >
                <Video className="h-4 w-4 mr-2" />
                Video Call
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-gray-600" />
              
              <DropdownMenuItem
                onClick={() => setShowUserActions(true)}
                className="text-red-400 hover:bg-red-500/20 cursor-pointer"
              >
                <Shield className="h-4 w-4 mr-2" />
                Report or Block
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>Start your conversation with {matchName}</p>
            <p className="text-sm mt-1">Say hello and share what's on your mind!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_user_id === user?.id;
            const isSystemMessage = message.message_type === 'system';
            
            if (isSystemMessage) {
              return (
                <div key={message.id} className="text-center">
                  <div className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full inline-block">
                    {message.content}
                  </div>
                </div>
              );
            }
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                  {!isOwnMessage && (
                    <Avatar className="h-6 w-6 mb-1">
                      <AvatarImage src={matchImage} alt={matchName} />
                      <AvatarFallback className="bg-goldenrod text-jet-black text-xs">
                        {matchName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwnMessage
                        ? 'bg-goldenrod text-jet-black ml-2'
                        : 'bg-charcoal-gray text-white mr-2'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                     <p className={`text-xs mt-1 flex items-center justify-between ${
                       isOwnMessage ? 'text-jet-black/70' : 'text-gray-400'
                     }`}>
                       <span>{format(new Date(message.created_at), 'HH:mm')}</span>
                       {getDeliveryStatusIcon(message)}
                     </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md">
              <Avatar className="h-6 w-6 mb-1">
                <AvatarImage src={matchImage} alt={matchName} />
                <AvatarFallback className="bg-goldenrod text-jet-black text-xs">
                  {matchName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="px-4 py-2 rounded-2xl bg-charcoal-gray text-white mr-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${matchName}...`}
              className="min-h-[44px] max-h-32 resize-none bg-charcoal-gray border-gray-700 text-white placeholder-gray-400 focus:border-goldenrod"
              disabled={isSending}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            className="bg-goldenrod hover:bg-goldenrod/90 text-jet-black h-11 px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Safety Actions Modal */}
      <UserActionsModal
        isOpen={showUserActions}
        onClose={() => setShowUserActions(false)}
        userId={matchUserId}
        userName={matchName}
        conversationId={conversationId}
      />

      {/* AI Date Concierge Modal */}
      <AIConciergeModal
        isOpen={showConcierge}
        onClose={() => setShowConcierge(false)}
        matchUserId={matchUserId}
        matchName={matchName}
        conversationId={conversationId}
        recentMessages={messages.slice(-10).map(m => m.content)}
      />

      {/* Video Call Modal */}
      <VideoCallModal
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        matchName={matchName}
        matchImage={matchImage}
        conversationId={conversationId}
      />
    </div>
  );
};

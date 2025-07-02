
import React, { useState, useRef, useEffect } from 'react';
import { Send, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ConversationHelper } from '@/components/conversation/ConversationHelper';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { messages, loading, sendMessage } = useMessages(conversationId);
  const { user } = useAuth();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;
    
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
            <p className="text-gray-400 text-sm">Active now</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ConversationHelper
            conversationId={conversationId}
            matchName={matchName}
            onSendMessage={handleConversationHelperSend}
            onEndConversation={handleConversationHelperEnd}
          />
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
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
                    <p className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-jet-black/70' : 'text-gray-400'
                    }`}>
                      {format(new Date(message.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
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
              onChange={(e) => setMessageText(e.target.value)}
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
    </div>
  );
};

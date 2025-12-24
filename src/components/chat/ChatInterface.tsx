import React, { useState, useRef, useEffect } from 'react';
import { Send, MoreVertical, Shield, Check, CheckCheck, UserX, Phone, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ReportBlockModal } from '@/components/safety/ReportBlockModal';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useRealTimePresence } from '@/hooks/useRealTimePresence';
import { useContactSharing } from '@/hooks/useContactSharing';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showUnmatchConfirm, setShowUnmatchConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { messages, loading, sendMessage } = useMessages(conversationId);
  const { user } = useAuth();
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(conversationId);
  const { isUserOnline } = useRealTimePresence();
  const { 
    loading: shareLoading, 
    matchPhoneNumber, 
    iHaveShared, 
    theyHaveShared, 
    shareContact, 
    canShare 
  } = useContactSharing(conversationId, matchUserId);

  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        stopTyping();
      }
    };
  }, [stopTyping]);

  const handleTyping = (text: string) => {
    setMessageText(text);
    
    if (text.trim()) {
      startTyping(matchName);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => stopTyping(), 2000);
    } else {
      stopTyping();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;
    
    stopTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  
    setIsSending(true);
    const success = await sendMessage(messageText, matchUserId);
  
    if (success) {
      setMessageText('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
    setIsSending(false);
  };

  const getDeliveryStatusIcon = (message: any) => {
    if (message.sender_user_id !== user?.id) return null;
    
    switch (message.delivery_status) {
      case 'sending':
        return <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />;
      case 'delivered':
        return <Check className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      case 'failed':
        return <div className="w-3 h-3 bg-destructive rounded-full" />;
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

  const handleUnmatch = async () => {
    if (!user) return;
    
    try {
      // Delete matches where current user and match user are involved
      // Match 1: user_id = current user AND liked_user_id = match user
      // Match 2: user_id = match user AND liked_user_id = current user
      const { error } = await supabase
        .from('matches')
        .delete()
        .or(
          `and(user_id.eq.${user.id},liked_user_id.eq.${matchUserId}),and(user_id.eq.${matchUserId},liked_user_id.eq.${user.id})`
        );

      if (error) throw error;
      
      toast.success('Unmatched successfully');
      onClose?.();
    } catch (error) {
      console.error('Error unmatching:', error);
      toast.error('Failed to unmatch');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={matchImage} alt={matchName} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {matchName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-foreground font-medium">{matchName}</h3>
            <p className="text-muted-foreground text-sm">
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
        
        {/* Share Contact Button */}
        {canShare ? (
          <Button
            variant="outline"
            size="sm"
            onClick={shareContact}
            disabled={shareLoading}
            className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Phone className="h-4 w-4 mr-1" />
            Share Contact
          </Button>
        ) : iHaveShared && theyHaveShared && matchPhoneNumber ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`tel:${matchPhoneNumber}`)}
            className="text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
          >
            <PhoneCall className="h-4 w-4 mr-1" />
            {matchPhoneNumber}
          </Button>
        ) : iHaveShared ? (
          <span className="text-xs text-muted-foreground px-2">Contact shared ✓</span>
        ) : null}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setShowUnmatchConfirm(true)}
              className="text-muted-foreground"
            >
              <UserX className="h-4 w-4 mr-2" />
              Unmatch
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => setShowUserActions(true)}
              className="text-destructive"
            >
              <Shield className="h-4 w-4 mr-2" />
              Report or Block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Contact Shared Banner */}
      {theyHaveShared && matchPhoneNumber && (
        <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-400">
              <Phone className="h-4 w-4 inline mr-1" />
              {matchName} shared their number: <span className="font-medium">{matchPhoneNumber}</span>
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`tel:${matchPhoneNumber}`)}
              className="text-green-400 hover:text-green-300"
            >
              Call
            </Button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Start your conversation with {matchName}</p>
            <p className="text-sm mt-1">Say hello!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_user_id === user?.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                  {!isOwnMessage && (
                    <Avatar className="h-6 w-6 mb-1">
                      <AvatarImage src={matchImage} alt={matchName} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {matchName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground ml-2'
                        : 'bg-secondary text-secondary-foreground mr-2'
                    }`}
                  >
                    <p>{message.content}</p>
                    <div className={`text-xs mt-1 flex items-center justify-between gap-2 ${
                      isOwnMessage ? 'text-primary-foreground/70' : 'text-secondary-foreground/70'
                    }`}>
                      <span>{format(new Date(message.created_at), 'HH:mm')}</span>
                      {getDeliveryStatusIcon(message)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-secondary">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end space-x-2">
          <Textarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${matchName}...`}
            className="min-h-[44px] max-h-32 resize-none flex-1"
            disabled={isSending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            className="h-11 px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Unmatch Confirmation */}
      <AlertDialog open={showUnmatchConfirm} onOpenChange={setShowUnmatchConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unmatch {matchName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your match and conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnmatch} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Unmatch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report/Block Modal */}
      <ReportBlockModal
        isOpen={showUserActions}
        onClose={() => setShowUserActions(false)}
        userId={matchUserId}
        userName={matchName}
        conversationId={conversationId}
      />
    </div>
  );
};

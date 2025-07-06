
import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ChatInterface } from './ChatInterface';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  matchUserId: string;
  matchName: string;
  matchImage?: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  matchUserId,
  matchName,
  matchImage
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] p-0 bg-jet-black border-gray-800">
        <VisuallyHidden>
          <DialogTitle>Chat with {matchName}</DialogTitle>
          <DialogDescription>Real-time conversation with your match</DialogDescription>
        </VisuallyHidden>
        <ChatInterface
          conversationId={conversationId}
          matchUserId={matchUserId}
          matchName={matchName}
          matchImage={matchImage}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

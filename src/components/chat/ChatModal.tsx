
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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

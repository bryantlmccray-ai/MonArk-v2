
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Heart, X } from 'lucide-react';

interface GracefulExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: (message: string, reason?: string) => void;
  matchName?: string;
}

export const GracefulExitModal: React.FC<GracefulExitModalProps> = ({
  isOpen,
  onClose,
  onConfirmExit,
  matchName = 'them'
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [exitReason, setExitReason] = useState('');

  const exitTemplates = [
    {
      id: 'no_fit',
      message: "Thanks for chatting! I don't think we're quite the right fit, but I wish you well in your search."
    },
    {
      id: 'step_back',
      message: "This has been lovely, but I'm going to step back for now. Best of luck!"
    },
    {
      id: 'different_things',
      message: "I appreciate your time, but I think we're looking for different things. Take care!"
    },
    {
      id: 'no_romantic_match',
      message: "I've enjoyed getting to know you, but I don't feel we're a romantic match. Wishing you the best!"
    },
    {
      id: 'focus_elsewhere',
      message: "Thanks for the great conversation! I'm going to focus on other connections right now."
    }
  ];

  const exitReasons = [
    { id: 'no_connection', label: 'Not feeling a connection' },
    { id: 'different_goals', label: 'Looking for different things' },
    { id: 'pacing_mismatch', label: 'Conversation pace felt off' },
    { id: 'values_mismatch', label: 'Different values or interests' },
    { id: 'prefer_not_say', label: 'Prefer not to say' }
  ];

  const handleConfirmExit = () => {
    const messageToSend = customMessage || selectedTemplate;
    if (messageToSend) {
      onConfirmExit(messageToSend, exitReason);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedTemplate('');
    setCustomMessage('');
    setExitReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-charcoal-gray border border-gray-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-white">
            <Heart className="h-5 w-5 text-red-400" />
            <span>End Conversation Kindly</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-gray-300 text-sm leading-relaxed">
            It's okay if this connection isn't right for you. Let's help you close this conversation 
            with kindness and respect for {matchName}.
          </p>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-goldenrod">Choose a message template:</h4>
            <div className="space-y-2">
              {exitTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.message)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedTemplate === template.message
                      ? 'border-goldenrod bg-goldenrod/10 text-goldenrod'
                      : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <p className="text-sm">{template.message}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-goldenrod">Or write your own message:</h4>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Write a kind closing message..."
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 min-h-[80px]"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-goldenrod">
              What led to this decision? (Optional - helps us improve)
            </h4>
            <RadioGroup value={exitReason} onValueChange={setExitReason}>
              {exitReasons.map((reason) => (
                <div key={reason.id} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={reason.id} 
                    id={reason.id}
                    className="border-gray-600 text-goldenrod"
                  />
                  <Label 
                    htmlFor={reason.id} 
                    className="text-sm text-gray-300 cursor-pointer"
                  >
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-800">
            <Button
              onClick={handleConfirmExit}
              disabled={!customMessage && !selectedTemplate}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              Send & Close Conversation
            </Button>
            <Button
              onClick={handleClose}
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            This will end the conversation respectfully and notify {matchName} of your decision.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

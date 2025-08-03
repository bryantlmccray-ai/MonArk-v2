
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
      <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-2xl max-w-lg max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-slate-100 font-light text-xl tracking-wide">
            <Heart className="h-5 w-5 text-rose-400" />
            <span>End Conversation Kindly</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          <p className="text-slate-300 text-sm leading-relaxed font-light">
            It's okay if this connection isn't right for you. Let's help you close this conversation 
            with kindness and respect for {matchName}.
          </p>

          <div className="space-y-6">
            <h4 className="text-sm font-medium text-slate-200 tracking-wide">Choose a message template:</h4>
            <div className="space-y-3">
              {exitTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.message)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                    selectedTemplate === template.message
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-300 shadow-lg backdrop-blur-sm'
                      : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600/50 hover:bg-slate-700/40 text-slate-300 backdrop-blur-sm'
                  }`}
                >
                  <p className="text-sm font-light leading-relaxed">{template.message}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-200 tracking-wide">Or write your own message:</h4>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Write a kind closing message..."
              className="bg-slate-800/40 border-slate-700/50 text-slate-300 placeholder-slate-500 min-h-[80px] rounded-xl focus:border-amber-500/50 focus:ring-amber-500/20 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-200 tracking-wide">
              What led to this decision? (Optional - helps us improve)
            </h4>
            <RadioGroup value={exitReason} onValueChange={setExitReason}>
              {exitReasons.map((reason) => (
                <div key={reason.id} className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={reason.id} 
                    id={reason.id}
                    className="border-slate-600 text-amber-400"
                  />
                  <Label 
                    htmlFor={reason.id} 
                    className="text-sm text-slate-300 cursor-pointer font-light"
                  >
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex space-x-4 pt-6 border-t border-slate-700/50">
            <Button
              onClick={handleConfirmExit}
              disabled={!customMessage && !selectedTemplate}
              className="flex-1 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-medium shadow-lg tracking-wide"
            >
              Send & Close Conversation
            </Button>
            <Button
              onClick={handleClose}
              variant="outline" 
              className="border-slate-600 text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 font-medium tracking-wide"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-slate-400 text-center font-light">
            This will end the conversation respectfully and notify {matchName} of your decision.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

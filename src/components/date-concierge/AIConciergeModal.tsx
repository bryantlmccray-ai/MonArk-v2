
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, MapPin, Clock, MessageCircle } from 'lucide-react';
import { useDateConcierge, DateProposal } from '@/hooks/useDateConcierge';
import { useProfile } from '@/hooks/useProfile';

interface AIConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchUserId: string;
  matchName: string;
  conversationId: string;
  recentMessages?: string[];
}

export const AIConciergeModal: React.FC<AIConciergeModalProps> = ({
  isOpen,
  onClose,
  matchUserId,
  matchName,
  conversationId,
  recentMessages
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState<DateProposal | null>(null);
  const [step, setStep] = useState<'intro' | 'generating' | 'proposal' | 'sent'>('intro');
  
  const { generateDateProposal } = useDateConcierge();
  const { profile } = useProfile();

  const handleGenerateProposal = async () => {
    setStep('generating');
    setIsGenerating(true);

    // Mock user interests - in production, this would come from profiles
    const userInterests = profile?.interests || ['coffee', 'art', 'hiking'];
    const matchInterests = ['music', 'art', 'cooking', 'coffee']; // Mock match interests

    const proposal = await generateDateProposal(
      matchUserId,
      conversationId,
      userInterests,
      matchInterests,
      recentMessages
    );

    if (proposal) {
      setGeneratedProposal(proposal);
      setStep('proposal');
    }
    
    setIsGenerating(false);
  };

  const handleSendProposal = () => {
    setStep('sent');
    setTimeout(() => {
      onClose();
      setStep('intro');
      setGeneratedProposal(null);
    }, 2000);
  };

  const handleEditProposal = () => {
    // For now, just regenerate - in production, this would open an edit interface
    handleGenerateProposal();
  };

  const renderIntroStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-goldenrod/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-goldenrod" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Ready to plan something special?
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          Your AI concierge has noticed great chemistry in your conversation with {matchName}. 
          Let's create a personalized date experience that brings out the best in both of you.
        </p>
      </div>

      <div className="bg-jet-black/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center space-x-3 text-sm text-gray-300">
          <MessageCircle className="h-4 w-4 text-goldenrod" />
          <span>Analyzing your conversation flow</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-300">
          <Heart className="h-4 w-4 text-goldenrod" />
          <span>Matching shared interests and values</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-300">
          <MapPin className="h-4 w-4 text-goldenrod" />
          <span>Curating location and activity options</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 border-gray-600 text-gray-300 hover:text-white"
        >
          Maybe Later
        </Button>
        <Button
          onClick={handleGenerateProposal}
          className="flex-1 bg-goldenrod hover:bg-goldenrod/90 text-jet-black font-semibold"
        >
          Let's Plan This! ✨
        </Button>
      </div>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="space-y-6 text-center py-8">
      <div className="w-16 h-16 bg-goldenrod/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
        <Sparkles className="h-8 w-8 text-goldenrod animate-spin" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Crafting your perfect date...
        </h3>
        <p className="text-gray-400 text-sm">
          Analyzing compatibility and creating a personalized experience
        </p>
      </div>
    </div>
  );

  const renderProposalStep = () => {
    if (!generatedProposal) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            Your Personalized Date Idea
          </h3>
          <p className="text-gray-400 text-sm">
            Curated just for you and {matchName}
          </p>
        </div>

        <div className="bg-gradient-to-r from-goldenrod/10 to-purple-600/10 rounded-xl p-6 border border-goldenrod/30">
          <h4 className="text-lg font-semibold text-white mb-3">
            {generatedProposal.title}
          </h4>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-3 text-sm">
              <Heart className="h-4 w-4 text-goldenrod" />
              <span className="text-gray-300">Vibe: {generatedProposal.vibe}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <MapPin className="h-4 w-4 text-goldenrod" />
              <span className="text-gray-300">Setting: {generatedProposal.location_type}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Clock className="h-4 w-4 text-goldenrod" />
              <span className="text-gray-300">Timing: {generatedProposal.time_suggestion}</span>
            </div>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            {generatedProposal.rationale}
          </p>

          <div className="bg-jet-black/30 rounded-lg p-3">
            <p className="text-white text-sm font-medium mb-1">Activity Details:</p>
            <p className="text-gray-300 text-sm">{generatedProposal.activity}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handleEditProposal}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:text-white"
            disabled={isGenerating}
          >
            Try Another Idea
          </Button>
          <Button
            onClick={handleSendProposal}
            className="flex-1 bg-goldenrod hover:bg-goldenrod/90 text-jet-black font-semibold"
          >
            Send to {matchName} 💫
          </Button>
        </div>
      </div>
    );
  };

  const renderSentStep = () => (
    <div className="space-y-6 text-center py-8">
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
        <Heart className="h-8 w-8 text-green-400" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Date proposal sent! 🎉
        </h3>
        <p className="text-gray-400 text-sm">
          {matchName} will receive your thoughtful date idea. 
          You'll both be notified when they respond.
        </p>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 'intro':
        return renderIntroStep();
      case 'generating':
        return renderGeneratingStep();
      case 'proposal':
        return renderProposalStep();
      case 'sent':
        return renderSentStep();
      default:
        return renderIntroStep();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-charcoal-gray border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            AI Date Concierge
          </DialogTitle>
        </DialogHeader>
        {renderCurrentStep()}
      </DialogContent>
    </Dialog>
  );
};

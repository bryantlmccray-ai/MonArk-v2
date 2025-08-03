
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
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Ready to plan something special?
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Your AI concierge has noticed great chemistry in your conversation with {matchName}. 
          Let's create a personalized date experience that brings out the best in both of you.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center space-x-3 text-sm text-gray-700">
          <MessageCircle className="h-4 w-4 text-blue-600" />
          <span>Analyzing your conversation flow</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-700">
          <Heart className="h-4 w-4 text-blue-600" />
          <span>Matching shared interests and values</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-700">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span>Curating location and activity options</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Maybe Later
        </Button>
        <Button
          onClick={handleGenerateProposal}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Let's Plan This! ✨
        </Button>
      </div>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="space-y-6 text-center py-8">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
        <Sparkles className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Crafting your perfect date...
        </h3>
        <p className="text-gray-600 text-sm">
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Your Personalized Date Idea
          </h3>
          <p className="text-gray-600 text-sm">
            Curated just for you and {matchName}
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            {generatedProposal.title}
          </h4>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-3 text-sm">
              <Heart className="h-4 w-4 text-blue-600" />
              <span className="text-gray-700">Vibe: {generatedProposal.vibe}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-gray-700">Setting: {generatedProposal.location_type}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-gray-700">Timing: {generatedProposal.time_suggestion}</span>
            </div>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {generatedProposal.rationale}
          </p>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-gray-900 text-sm font-medium mb-1">Activity Details:</p>
            <p className="text-gray-700 text-sm">{generatedProposal.activity}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handleEditProposal}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={isGenerating}
          >
            Try Another Idea
          </Button>
          <Button
            onClick={handleSendProposal}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Send to {matchName} 💫
          </Button>
        </div>
      </div>
    );
  };

  const renderSentStep = () => (
    <div className="space-y-6 text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Heart className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Date proposal sent! 🎉
        </h3>
        <p className="text-gray-600 text-sm">
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
      <DialogContent className="bg-white border border-gray-300 text-gray-900 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-center">
            AI Date Concierge
          </DialogTitle>
        </DialogHeader>
        {renderCurrentStep()}
      </DialogContent>
    </Dialog>
  );
};

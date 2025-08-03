
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
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ring-1 ring-amber-200/50">
          <Sparkles className="h-10 w-10 text-amber-600" />
        </div>
        <h3 className="text-2xl font-light text-slate-800 mb-3 tracking-wide">
          Ready to plan something special?
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed max-w-sm mx-auto">
          Your AI concierge has noticed great chemistry in your conversation with {matchName}. 
          Let's create a personalized date experience that brings out the best in both of you.
        </p>
      </div>

      <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl p-6 space-y-4 border border-slate-200/50 shadow-sm">
        <div className="flex items-center space-x-4 text-sm text-slate-700">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-amber-600" />
          </div>
          <span className="font-medium">Analyzing your conversation flow</span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-slate-700">
          <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
            <Heart className="h-4 w-4 text-rose-600" />
          </div>
          <span className="font-medium">Matching shared interests and values</span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-slate-700">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <MapPin className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="font-medium">Curating location and activity options</span>
        </div>
      </div>

      <div className="flex space-x-4 pt-2">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 border-slate-300 text-slate-600 hover:bg-slate-50 font-medium tracking-wide"
        >
          Maybe Later
        </Button>
        <Button
          onClick={handleGenerateProposal}
          className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-medium shadow-lg tracking-wide"
        >
          Let's Plan This! ✨
        </Button>
      </div>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="space-y-8 text-center py-12">
      <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-lg ring-1 ring-amber-200/50">
        <Sparkles className="h-10 w-10 text-amber-600 animate-spin" />
      </div>
      <div>
        <h3 className="text-2xl font-light text-slate-800 mb-3 tracking-wide">
          Crafting your perfect date...
        </h3>
        <p className="text-slate-600 text-sm max-w-sm mx-auto">
          Analyzing compatibility and creating a personalized experience
        </p>
      </div>
    </div>
  );

  const renderProposalStep = () => {
    if (!generatedProposal) return null;

    return (
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-light text-slate-800 mb-3 tracking-wide">
            Your Personalized Date Idea
          </h3>
          <p className="text-slate-600 text-sm">
            Curated just for you and {matchName}
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 via-white to-rose-50 rounded-2xl p-8 border border-amber-200/50 shadow-xl">
          <h4 className="text-xl font-light text-slate-800 mb-6 tracking-wide">
            {generatedProposal.title}
          </h4>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-4 text-sm">
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                <Heart className="h-4 w-4 text-rose-600" />
              </div>
              <span className="text-slate-700 font-medium">Vibe: {generatedProposal.vibe}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-slate-700 font-medium">Setting: {generatedProposal.location_type}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-slate-700 font-medium">Timing: {generatedProposal.time_suggestion}</span>
            </div>
          </div>

          <p className="text-slate-700 text-sm leading-relaxed mb-6 font-light">
            {generatedProposal.rationale}
          </p>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 shadow-sm">
            <p className="text-slate-800 text-sm font-medium mb-2 tracking-wide">Activity Details:</p>
            <p className="text-slate-700 text-sm font-light leading-relaxed">{generatedProposal.activity}</p>
          </div>
        </div>

        <div className="flex space-x-4 pt-2">
          <Button
            onClick={handleEditProposal}
            variant="outline"
            className="flex-1 border-slate-300 text-slate-600 hover:bg-slate-50 font-medium tracking-wide"
            disabled={isGenerating}
          >
            Try Another Idea
          </Button>
          <Button
            onClick={handleSendProposal}
            className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-medium shadow-lg tracking-wide"
          >
            Send to {matchName} 💫
          </Button>
        </div>
      </div>
    );
  };

  const renderSentStep = () => (
    <div className="space-y-8 text-center py-12">
      <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto shadow-lg ring-1 ring-emerald-200/50">
        <Heart className="h-10 w-10 text-emerald-600" />
      </div>
      <div>
        <h3 className="text-2xl font-light text-slate-800 mb-3 tracking-wide">
          Date proposal sent! 🎉
        </h3>
        <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
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
      <DialogContent className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-2xl max-w-md backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-slate-800 text-center font-light text-xl tracking-wide">
            AI Date Concierge
          </DialogTitle>
        </DialogHeader>
        {renderCurrentStep()}
      </DialogContent>
    </Dialog>
  );
};

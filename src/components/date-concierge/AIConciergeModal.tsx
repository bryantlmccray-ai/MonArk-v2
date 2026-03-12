
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

    const userInterests = profile?.interests || ['coffee', 'art', 'hiking'];
    const matchInterests = ['music', 'art', 'cooking', 'coffee'];

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
    handleGenerateProposal();
  };

  const renderIntroStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-light text-foreground mb-3 tracking-wide">
          Ready to plan something special?
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto font-medium">
          Your AI concierge has noticed great chemistry in your conversation with {matchName}. 
          Let's create a personalized date experience that brings out the best in both of you.
        </p>
      </div>

      <div className="bg-muted/50 rounded-xl p-6 space-y-4 border border-border">
        <div className="flex items-center space-x-4 text-sm text-foreground/80">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Analyzing your conversation flow</span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-foreground/80">
          <Heart className="h-5 w-5 text-destructive/60" />
          <span className="font-medium">Matching shared interests and values</span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-foreground/80">
          <MapPin className="h-5 w-5 text-primary" />
          <span className="font-medium">Curating location and activity options</span>
        </div>
      </div>

      <div className="flex space-x-4 pt-2">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1"
        >
          Maybe Later
        </Button>
        <Button
          onClick={handleGenerateProposal}
          className="flex-1"
        >
          Let's Plan This! ✨
        </Button>
      </div>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="space-y-8 text-center py-12">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
        <Sparkles className="h-8 w-8 text-primary animate-spin" />
      </div>
      <div>
        <h3 className="text-2xl font-light text-foreground mb-3 tracking-wide">
          Crafting your perfect date...
        </h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium">
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
          <h3 className="text-2xl font-light text-foreground mb-3 tracking-wide">
            Your Personalized Date Idea
          </h3>
          <p className="text-muted-foreground text-sm font-medium">
            Curated just for you and {matchName}
          </p>
        </div>

        <div className="bg-muted/50 rounded-2xl p-8 border border-border">
          <h4 className="text-xl font-light text-foreground mb-6 tracking-wide">
            {generatedProposal.title}
          </h4>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-4 text-sm">
              <Heart className="h-5 w-5 text-destructive/60" />
              <span className="text-foreground/80 font-medium">Vibe: {generatedProposal.vibe}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-foreground/80 font-medium">Setting: {generatedProposal.location_type}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <Clock className="h-5 w-5 text-accent" />
              <span className="text-foreground/80 font-medium">Timing: {generatedProposal.time_suggestion}</span>
            </div>
          </div>

          <p className="text-foreground/70 text-sm leading-relaxed mb-6 font-medium">
            {generatedProposal.rationale}
          </p>

          <div className="bg-secondary rounded-xl p-4 border border-border">
            <p className="text-foreground text-sm font-semibold mb-2 tracking-wide">Activity Details:</p>
            <p className="text-foreground/70 text-sm font-medium leading-relaxed">{generatedProposal.activity}</p>
          </div>
        </div>

        <div className="flex space-x-4 pt-2">
          <Button
            onClick={handleEditProposal}
            variant="outline"
            className="flex-1"
            disabled={isGenerating}
          >
            Try Another Idea
          </Button>
          <Button
            onClick={handleSendProposal}
            className="flex-1"
          >
            Send to {matchName}
          </Button>
        </div>
      </div>
    );
  };

  const renderSentStep = () => (
    <div className="space-y-8 text-center py-12">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <Heart className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h3 className="text-2xl font-light text-foreground mb-3 tracking-wide">
          Date proposal sent! 🎉
        </h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed font-medium">
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
      <DialogContent className="bg-card border-2 border-border shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.15)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-center font-light text-xl tracking-wide">
            AI Date Concierge
          </DialogTitle>
        </DialogHeader>
        {renderCurrentStep()}
      </DialogContent>
    </Dialog>
  );
};

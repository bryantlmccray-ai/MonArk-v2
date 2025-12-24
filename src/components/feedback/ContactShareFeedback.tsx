import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Check, X, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface ContactShareFeedbackProps {
  matchName: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (
    didMeet: boolean,
    rating: number,
    seeAgain: 'yes' | 'maybe' | 'no',
    comment?: string
  ) => Promise<boolean>;
  loading?: boolean;
}

export const ContactShareFeedback = ({ 
  matchName, 
  open, 
  onClose,
  onSubmit,
  loading = false
}: ContactShareFeedbackProps) => {
  const [step, setStep] = useState(1);
  const [didMeet, setDidMeet] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [seeAgain, setSeeAgain] = useState<'yes' | 'maybe' | 'no' | null>(null);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleDidMeet = (met: boolean) => {
    setDidMeet(met);
    if (met) {
      setStep(2);
    } else {
      // If they didn't meet, skip to end with minimal feedback
      handleSubmitNoMeet();
    }
  };

  const handleSubmitNoMeet = async () => {
    const success = await onSubmit(false, 0, 'maybe', undefined);
    if (success) {
      toast.info("Thanks for letting us know! We hope you connect soon.");
      resetAndClose();
    } else {
      toast.error('Failed to submit feedback');
    }
  };

  const handleRating = (stars: number) => {
    setRating(stars);
    setStep(3);
  };

  const handleSeeAgain = (response: 'yes' | 'maybe' | 'no') => {
    setSeeAgain(response);
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    if (didMeet === null || rating === 0 || seeAgain === null) return;
    
    const success = await onSubmit(didMeet, rating, seeAgain, comment.trim() || undefined);
    if (success) {
      toast.success("Thanks for your feedback! It helps us improve your matches.");
      resetAndClose();
    } else {
      toast.error('Failed to submit feedback');
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setDidMeet(null);
    setRating(0);
    setSeeAgain(null);
    setComment('');
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground text-center">
              Did you meet up with {matchName}?
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={() => handleDidMeet(true)}
                disabled={loading}
                className="w-full p-4 rounded-xl border-2 border-border hover:border-green-500 hover:bg-green-500/10 transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-foreground font-medium">Yes, we met!</span>
              </button>

              <button
                onClick={() => handleDidMeet(false)}
                disabled={loading}
                className="w-full p-4 rounded-xl border-2 border-border hover:border-muted-foreground/50 transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <X className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-foreground font-medium">Not yet</span>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-foreground text-center">
              How was your date?
            </h3>
            
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  disabled={loading}
                  className="p-2 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoveredStar || rating) 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-muted-foreground/40'
                    }`} 
                  />
                </button>
              ))}
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground px-4">
              <span>Not great</span>
              <span>Amazing!</span>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground text-center">
              Would you see {matchName} again?
            </h3>
            
            <div className="space-y-2">
              <button
                onClick={() => handleSeeAgain('yes')}
                disabled={loading}
                className="w-full p-4 rounded-xl border-2 border-border hover:border-green-500 hover:bg-green-500/10 transition-all"
              >
                <span className="text-foreground font-medium">Yes, definitely!</span>
              </button>

              <button
                onClick={() => handleSeeAgain('maybe')}
                disabled={loading}
                className="w-full p-4 rounded-xl border-2 border-border hover:border-yellow-500 hover:bg-yellow-500/10 transition-all"
              >
                <span className="text-foreground font-medium">Maybe</span>
              </button>

              <button
                onClick={() => handleSeeAgain('no')}
                disabled={loading}
                className="w-full p-4 rounded-xl border-2 border-border hover:border-muted-foreground/50 transition-all"
              >
                <span className="text-foreground font-medium">Probably not</span>
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground text-center">
              Any other thoughts? (Optional)
            </h3>
            
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share what went well or what could be better..."
                className="pl-10 min-h-[100px] resize-none"
                maxLength={500}
              />
            </div>
            
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </p>

            <Button
              onClick={handleFinalSubmit}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
            
            <button
              onClick={handleFinalSubmit}
              disabled={loading}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip and submit
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">
            Quick Check-in 💭
          </DialogTitle>
        </DialogHeader>

        {/* Progress dots */}
        {step > 1 && (
          <div className="flex justify-center gap-2 pb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        )}

        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};

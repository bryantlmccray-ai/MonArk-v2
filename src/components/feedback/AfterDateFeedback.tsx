import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Check, X, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AfterDateFeedbackProps {
  itineraryId: string;
  matchUserId: string;
  matchName: string;
  open: boolean;
  onClose: () => void;
}

export const AfterDateFeedback = ({ 
  itineraryId, 
  matchUserId, 
  matchName, 
  open, 
  onClose 
}: AfterDateFeedbackProps) => {
  const [step, setStep] = useState(1);
  const [didMeet, setDidMeet] = useState<'yes' | 'no' | 'rescheduled' | null>(null);
  const [rating, setRating] = useState(0);
  const [seeAgain, setSeeAgain] = useState<'yes' | 'no' | 'maybe' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!didMeet || rating === 0 || !seeAgain) {
      toast.error('Please answer all questions');
      return;
    }

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Submit feedback
      const { error } = await supabase
        .from('itinerary_feedback')
        .insert({
          itinerary_id: itineraryId,
          user_id: user.id,
          feeling: rating >= 4 ? 'great' : rating >= 3 ? 'neutral' : 'not_a_fit',
          action_taken: seeAgain === 'yes' ? 'advance' : 'kind_close',
          eq_adjustments: {
            did_meet: didMeet,
            rating,
            see_again: seeAgain
          }
        });

      if (error) throw error;

      // Check for Second-Meet Credit (if rating 4+)
      if (rating >= 4 && seeAgain === 'yes') {
        await checkSecondMeetCredit(user.id, itineraryId, matchUserId, rating);
      }

      // Log analytics
      await supabase
        .from('behavior_analytics')
        .insert({
          user_id: user.id,
          event_type: 'date_feedback_submitted',
          event_data: {
            itinerary_id: itineraryId,
            did_meet: didMeet,
            rating,
            see_again: seeAgain
          }
        });

      toast.success('Thanks for your feedback!');
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if both users rated 4+ to unlock Second-Meet Credit
  const checkSecondMeetCredit = async (
    userId: string, 
    itinId: string, 
    matchId: string, 
    userRating: number
  ) => {
    try {
      // Check if match also rated 4+
      const { data: matchFeedback } = await supabase
        .from('itinerary_feedback')
        .select('eq_adjustments')
        .eq('itinerary_id', itinId)
        .eq('user_id', matchId)
        .maybeSingle();

      const matchRating = (matchFeedback?.eq_adjustments as any)?.rating;
      
      if (matchRating && matchRating >= 4 && userRating >= 4) {
        // Both rated 4+ - create notification for bonus match
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'second_meet_credit',
            title: '🎉 Second-Meet Credit Unlocked!',
            message: `You and ${matchName} both had a great time! Enjoy a bonus match credit.`,
            data: { match_user_id: matchId, itinerary_id: itinId }
          });

        toast.success('🎉 Second-Meet Credit unlocked! You both had a great time.');
      }
    } catch (error) {
      console.error('Error checking second-meet credit:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground text-center">
              Did you meet up with {matchName}?
            </h3>
            
            <div className="space-y-2">
              <button
                onClick={() => { setDidMeet('yes'); setStep(2); }}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  didMeet === 'yes' 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-border hover:border-green-500/50'
                }`}
              >
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-foreground font-medium">Yes, we met!</span>
              </button>

              <button
                onClick={() => { setDidMeet('no'); onClose(); toast.info('No worries! Let us know when you do meet.'); }}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  didMeet === 'no' 
                    ? 'border-red-500 bg-red-500/10' 
                    : 'border-border hover:border-red-500/50'
                }`}
              >
                <X className="w-5 h-5 text-red-500" />
                <span className="text-foreground font-medium">No, we didn't meet</span>
              </button>

              <button
                onClick={() => { setDidMeet('rescheduled'); onClose(); toast.info('Good luck on your rescheduled date!'); }}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  didMeet === 'rescheduled' 
                    ? 'border-yellow-500 bg-yellow-500/10' 
                    : 'border-border hover:border-yellow-500/50'
                }`}
              >
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className="text-foreground font-medium">Rescheduled</span>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground text-center">
              How was it?
            </h3>
            
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => { setRating(star); setStep(3); }}
                  className="p-2 transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-10 h-10 transition-colors ${
                      star <= rating 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                </button>
              ))}
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground px-2">
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
                onClick={() => setSeeAgain('yes')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  seeAgain === 'yes' 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-border hover:border-green-500/50'
                }`}
              >
                <span className="text-foreground font-medium">Yes, definitely!</span>
              </button>

              <button
                onClick={() => setSeeAgain('maybe')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  seeAgain === 'maybe' 
                    ? 'border-yellow-500 bg-yellow-500/10' 
                    : 'border-border hover:border-yellow-500/50'
                }`}
              >
                <span className="text-foreground font-medium">Maybe</span>
              </button>

              <button
                onClick={() => setSeeAgain('no')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  seeAgain === 'no' 
                    ? 'border-red-500 bg-red-500/10' 
                    : 'border-border hover:border-red-500/50'
                }`}
              >
                <span className="text-foreground font-medium">No</span>
              </button>
            </div>

            {seeAgain && (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-4"
                size="lg"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === 1 ? 'Quick Check-in' : step === 2 ? 'Rate Your Date' : 'One Last Question'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Smile, Meh, Frown, Calendar, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AfterActionFeedbackModalProps {
  itineraryId: string;
  open: boolean;
  onClose: () => void;
}

export const AfterActionFeedbackModal = ({ itineraryId, open, onClose }: AfterActionFeedbackModalProps) => {
  const [feeling, setFeeling] = useState<'great' | 'neutral' | 'not_a_fit' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAction = async (action: 'advance' | 'kind_close') => {
    if (!feeling) {
      toast.error('Please share how you felt first');
      return;
    }

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Submit feedback
      const feedbackData: any = {
        itinerary_id: itineraryId,
        user_id: user.id,
        feeling,
        action_taken: action
      };

      if (action === 'advance') {
        // Generate next plan suggestion
        feedbackData.next_plan_suggested = {
          suggested_days_ahead: feeling === 'great' ? 3 : 7,
          suggested_duration: feeling === 'great' ? 120 : 90
        };
      } else {
        // Kind close message
        feedbackData.close_message_sent = getKindCloseMessage(feeling);
      }

      // Add EQ adjustments based on feeling
      feedbackData.eq_adjustments = getEQAdjustments(feeling);

      const { error } = await supabase
        .from('itinerary_feedback')
        .insert(feedbackData);

      if (error) throw error;

      // Log analytics
      await supabase
        .from('behavior_analytics')
        .insert({
          user_id: user.id,
          event_type: 'feedback_submitted',
          event_data: {
            itinerary_id: itineraryId,
            feeling,
            action
          }
        });

      toast.success(
        action === 'advance' 
          ? 'Great! We\'ll suggest your next step' 
          : 'Message sent thoughtfully'
      );
      
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>How did it feel?</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feeling Selection */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">
              Your honest reflection helps us learn and improve
            </p>
            
            <button
              onClick={() => setFeeling('great')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                feeling === 'great' 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-border hover:border-green-500/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Smile className={`w-6 h-6 ${feeling === 'great' ? 'text-green-500' : 'text-muted-foreground'}`} />
                <div>
                  <div className="font-semibold text-foreground">Great connection</div>
                  <div className="text-xs text-muted-foreground">Felt natural and aligned</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setFeeling('neutral')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                feeling === 'neutral' 
                  ? 'border-yellow-500 bg-yellow-500/10' 
                  : 'border-border hover:border-yellow-500/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Meh className={`w-6 h-6 ${feeling === 'neutral' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                <div>
                  <div className="font-semibold text-foreground">It was okay</div>
                  <div className="text-xs text-muted-foreground">Not bad, but not quite right</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setFeeling('not_a_fit')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                feeling === 'not_a_fit' 
                  ? 'border-red-500 bg-red-500/10' 
                  : 'border-border hover:border-red-500/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Frown className={`w-6 h-6 ${feeling === 'not_a_fit' ? 'text-red-500' : 'text-muted-foreground'}`} />
                <div>
                  <div className="font-semibold text-foreground">Not a fit</div>
                  <div className="text-xs text-muted-foreground">Wasn't what I was looking for</div>
                </div>
              </div>
            </button>
          </div>

          {/* Action Buttons */}
          {feeling && (
            <div className="space-y-2 pt-4 border-t">
              <p className="text-sm font-medium text-foreground mb-3">
                What would you like to do?
              </p>
              
              <Button
                onClick={() => handleAction('advance')}
                disabled={submitting}
                className="w-full"
                size="lg"
                variant={feeling === 'great' ? 'default' : 'outline'}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {feeling === 'great' ? 'Plan the Next Step' : 'Maybe Try Again'}
              </Button>

              <Button
                onClick={() => handleAction('kind_close')}
                disabled={submitting}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send a Kind Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

function getKindCloseMessage(feeling: 'great' | 'neutral' | 'not_a_fit'): string {
  const messages = {
    great: "I had a really nice time connecting with you. I think we're looking for different things right now, but I appreciated getting to know you.",
    neutral: "Thank you for meeting up. I think our paths are headed in different directions, but I wish you all the best.",
    not_a_fit: "I appreciate you taking the time to meet. I don't think we're the right match, but I hope you find what you're looking for."
  };
  return messages[feeling];
}

function getEQAdjustments(feeling: 'great' | 'neutral' | 'not_a_fit') {
  return {
    confidence_adjustment: feeling === 'great' ? 0.1 : feeling === 'neutral' ? 0 : -0.05,
    needs_recalibration: feeling === 'not_a_fit'
  };
}
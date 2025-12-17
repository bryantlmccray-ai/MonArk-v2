import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  useRifBeta, 
  FeelingDuring, 
  StandoutQuality, 
  NextPreference,
  FEELING_LABELS,
  STANDOUT_LABELS,
  NEXT_PREFERENCE_LABELS
} from '@/hooks/useRifBeta';
import { Sparkles, Heart, MessageCircle, Zap, Users, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostDateReflectionProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName?: string;
  onComplete?: () => void;
}

const FEELING_ICONS: Record<FeelingDuring, React.ReactNode> = {
  energized_engaged: <Zap className="h-5 w-5" />,
  comfortable_not_excited: <Heart className="h-5 w-5" />,
  anxious_drained: <Users className="h-5 w-5" />,
  not_great_fit: <MessageCircle className="h-5 w-5" />
};

const STANDOUT_ICONS: Record<StandoutQuality, React.ReactNode> = {
  conversation_flow: <MessageCircle className="h-4 w-4" />,
  shared_values: <Heart className="h-4 w-4" />,
  physical_chemistry: <Sparkles className="h-4 w-4" />,
  listened_well: <Users className="h-4 w-4" />,
  nothing_specific: <CheckCircle className="h-4 w-4" />
};

export const PostDateReflection: React.FC<PostDateReflectionProps> = ({
  isOpen,
  onClose,
  partnerName: initialPartnerName = '',
  onComplete
}) => {
  const { toast } = useToast();
  const { saveReflection } = useRifBeta();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partnerName, setPartnerName] = useState(initialPartnerName);
  const [feeling, setFeeling] = useState<FeelingDuring | null>(null);
  const [standouts, setStandouts] = useState<StandoutQuality[]>([]);
  const [nextPref, setNextPref] = useState<NextPreference | null>(null);
  const [differentDescription, setDifferentDescription] = useState('');

  const resetForm = () => {
    setStep(1);
    setPartnerName(initialPartnerName);
    setFeeling(null);
    setStandouts([]);
    setNextPref(null);
    setDifferentDescription('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleStandout = (quality: StandoutQuality) => {
    if (quality === 'nothing_specific') {
      setStandouts(['nothing_specific']);
    } else {
      setStandouts(prev => {
        const filtered = prev.filter(s => s !== 'nothing_specific');
        if (filtered.includes(quality)) {
          return filtered.filter(s => s !== quality);
        }
        return [...filtered, quality];
      });
    }
  };

  const handleSubmit = async () => {
    if (!partnerName || !feeling || standouts.length === 0 || !nextPref) {
      toast({
        title: "Missing Information",
        description: "Please complete all questions",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await saveReflection({
        partner_name: partnerName,
        feeling_during: feeling,
        standout_qualities: standouts,
        next_preference: nextPref,
        different_energy_description: nextPref === 'different_energy' ? differentDescription : undefined
      });

      toast({
        title: "Reflection Saved",
        description: "Thanks for sharing! This helps us find better matches for you."
      });

      handleClose();
      onComplete?.();
    } catch (error) {
      console.error('Error saving reflection:', error);
      toast({
        title: "Error",
        description: "Failed to save reflection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return partnerName.trim().length > 0 && feeling !== null;
    if (step === 2) return standouts.length > 0;
    if (step === 3) return nextPref !== null && (nextPref !== 'different_energy' || differentDescription.trim().length > 0);
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-charcoal-gray border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-goldenrod" />
            Post-Date Reflection
          </DialogTitle>
          <p className="text-sm text-gray-400 mt-1">
            Quick check-in to help us find better matches (30 seconds)
          </p>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map(s => (
            <div 
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                s <= step ? "bg-goldenrod" : "bg-gray-700"
              )}
            />
          ))}
        </div>

        <div className="space-y-6">
          {/* Step 1: Partner name + Feeling */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Who did you go out with?</label>
                <Input
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Their name"
                  className="bg-jet-black border-gray-700 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-3">How did you feel during the date?</label>
                <div className="grid gap-2">
                  {(Object.entries(FEELING_LABELS) as [FeelingDuring, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setFeeling(key)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                        feeling === key
                          ? "border-goldenrod bg-goldenrod/10 text-white"
                          : "border-gray-700 bg-jet-black text-gray-300 hover:border-gray-600"
                      )}
                    >
                      <span className={feeling === key ? "text-goldenrod" : "text-gray-500"}>
                        {FEELING_ICONS[key]}
                      </span>
                      <span className="text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Standout qualities */}
          {step === 2 && (
            <div>
              <label className="text-sm text-gray-400 block mb-3">What stood out to you? (select all that apply)</label>
              <div className="grid gap-2">
                {(Object.entries(STANDOUT_LABELS) as [StandoutQuality, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleStandout(key)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                      standouts.includes(key)
                        ? "border-goldenrod bg-goldenrod/10 text-white"
                        : "border-gray-700 bg-jet-black text-gray-300 hover:border-gray-600"
                    )}
                  >
                    <span className={standouts.includes(key) ? "text-goldenrod" : "text-gray-500"}>
                      {STANDOUT_ICONS[key]}
                    </span>
                    <span className="text-sm">{label}</span>
                    {standouts.includes(key) && (
                      <CheckCircle className="h-4 w-4 text-goldenrod ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Next preference */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-3">For your next date, would you prefer someone who:</label>
                <div className="grid gap-2">
                  {(Object.entries(NEXT_PREFERENCE_LABELS) as [NextPreference, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setNextPref(key)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                        nextPref === key
                          ? "border-goldenrod bg-goldenrod/10 text-white"
                          : "border-gray-700 bg-jet-black text-gray-300 hover:border-gray-600"
                      )}
                    >
                      <span className="text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {nextPref === 'different_energy' && (
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Describe the energy you'd prefer:</label>
                  <Textarea
                    value={differentDescription}
                    onChange={(e) => setDifferentDescription(e.target.value)}
                    placeholder="e.g., More calm and relaxed, or more adventurous..."
                    className="bg-jet-black border-gray-700 text-white"
                    rows={2}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="ghost"
            onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
            className="text-gray-400"
          >
            {step > 1 ? 'Back' : 'Skip'}
          </Button>
          
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="bg-goldenrod text-jet-black hover:bg-goldenrod/90"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-goldenrod text-jet-black hover:bg-goldenrod/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Reflection'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDateReflection;

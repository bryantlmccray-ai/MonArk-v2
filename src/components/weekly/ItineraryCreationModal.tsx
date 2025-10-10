import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Share2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ItineraryCreationModalProps {
  open: boolean;
  onClose: () => void;
  onCreateItinerary: (mode: 'discovery' | 'matched' | 'byo', counterpartUserId?: string) => Promise<void>;
}

export const ItineraryCreationModal = ({ open, onClose, onCreateItinerary }: ItineraryCreationModalProps) => {
  const [mode, setMode] = useState<'discovery' | 'matched' | 'byo'>('discovery');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    await onCreateItinerary(mode);
    setCreating(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your Itinerary</DialogTitle>
          <DialogDescription>
            Choose how you'd like to use this experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Selection */}
          <div className="space-y-2">
            <button
              onClick={() => setMode('discovery')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                mode === 'discovery' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-semibold text-foreground">Discovery Match</div>
              <div className="text-sm text-muted-foreground mt-1">
                Share with someone from your matches
              </div>
            </button>

            <button
              onClick={() => setMode('matched')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                mode === 'matched' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-semibold text-foreground">Confirmed Match</div>
              <div className="text-sm text-muted-foreground mt-1">
                Plan with someone you've already connected with
              </div>
            </button>

            <button
              onClick={() => setMode('byo')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                mode === 'byo' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-semibold text-foreground">Bring Your Own</div>
              <div className="text-sm text-muted-foreground mt-1">
                Get a shareable link for anyone
              </div>
            </button>
          </div>

          {/* Safety Features */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Safety included:</strong> Location sharing is on, SOS is visible, and consent guidelines are shown.
            </AlertDescription>
          </Alert>

          {/* Consent Nudge */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Remember:</strong> Clear communication and mutual consent make great dates. Check in about preferences and boundaries.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating} className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              {creating ? 'Creating...' : 'Create Plan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
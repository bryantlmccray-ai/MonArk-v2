import { useState } from 'react';
import { useWeeklyOptions } from '@/hooks/useWeeklyOptions';
import { WeeklyOptionsCard } from './WeeklyOptionsCard';
import { VendorBrowser } from './VendorBrowser';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Calendar, MessageSquare, Copy, Check, Phone, Store, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const WeeklyOptionsList = () => {
  const { options, loading, generating, acceptOption, passOption, refetch } = useWeeklyOptions();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [createdItinerary, setCreatedItinerary] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [shareContact, setShareContact] = useState('');
  const [showVendorBrowser, setShowVendorBrowser] = useState(false);

  const handleAccept = async (optionId: string) => {
    setProcessingId(optionId);
    const result = await acceptOption(optionId);
    setProcessingId(null);
    if (result) {
      setCreatedItinerary(result);
    }
  };

  const handlePass = async (optionId: string) => {
    setProcessingId(optionId);
    await passOption(optionId);
    setProcessingId(null);
  };

  const handleCopyLink = async () => {
    if (createdItinerary?.share_link) {
      await navigator.clipboard.writeText(createdItinerary.share_link);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWithFriend = () => {
    if (!shareContact.trim() || !createdItinerary) return;
    
    const itinerary = createdItinerary.itinerary;
    const dateTime = itinerary?.time_window?.start 
      ? format(new Date(itinerary.time_window.start), 'EEE, MMM d at h:mm a')
      : 'TBD';
    
    const message = `Hey! I'm going on a date: "${itinerary?.title}" on ${dateTime}. Here's my safety link: ${createdItinerary.share_link}`;
    
    if (shareContact.includes('@')) {
      window.open(`mailto:${shareContact}?subject=My Date Plans&body=${encodeURIComponent(message)}`);
    } else {
      window.open(`sms:${shareContact}?body=${encodeURIComponent(message)}`);
    }
    
    toast.success('Opening share...');
    setShareContact('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const activeOptions = options.filter(o => !o.is_expired && !o.tapped_at);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground tracking-tight">Your Weekly Options</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            3 curated experiences, pick one to plan your date
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={generating}
          className="h-9"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${generating ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Options Grid */}
      {activeOptions.length === 0 ? (
        <div className="text-center py-14 bg-card rounded-2xl border border-border/60">
          <Calendar className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm mb-1">
            {generating ? 'Generating your options...' : 'No options available this week'}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            New options arrive every Sunday
          </p>
          {!generating && (
            <Button onClick={refetch} size="sm">
              Generate Options
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeOptions.map((option) => (
            <WeeklyOptionsCard
              key={option.id}
              option={option}
              onAccept={() => handleAccept(option.id)}
              onPass={() => handlePass(option.id)}
              isProcessing={processingId === option.id}
            />
          ))}
        </div>
      )}

      {/* Success Modal - Simple Share */}
      <Dialog open={!!createdItinerary} onOpenChange={() => setCreatedItinerary(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Date Plan Created!
            </DialogTitle>
            <DialogDescription>
              Share this link with your match to confirm the date
            </DialogDescription>
          </DialogHeader>

          {createdItinerary && (
            <div className="space-y-4">
              {/* Date Summary */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="font-semibold text-foreground">{createdItinerary.itinerary?.title}</div>
                {createdItinerary.itinerary?.time_window && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(createdItinerary.itinerary.time_window.start), 'EEE, MMM d · h:mm a')}
                  </div>
                )}
                {createdItinerary.itinerary?.location_data?.address && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {createdItinerary.itinerary.location_data.address}
                  </div>
                )}
              </div>

              {/* Share Link */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Share Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={createdItinerary.share_link || ''}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm bg-muted rounded-md border border-border"
                  />
                  <Button onClick={handleCopyLink} variant="outline" size="icon">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Share with Friend */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Share with a Friend
                </label>
                <p className="text-xs text-muted-foreground">
                  Let someone know your plans for safety
                </p>
                <div className="flex gap-2">
                  <Input
                    value={shareContact}
                    onChange={(e) => setShareContact(e.target.value)}
                    placeholder="Phone or email"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleShareWithFriend} 
                    variant="outline"
                    disabled={!shareContact.trim()}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setShowVendorBrowser(true)} variant="outline" className="flex-1">
                  <Store className="w-4 h-4 mr-2" />
                  Browse Vendors
                </Button>
                <Button onClick={() => setCreatedItinerary(null)} className="flex-1">
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Vendor Browser Modal */}
      <Dialog open={showVendorBrowser} onOpenChange={setShowVendorBrowser}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <VendorBrowser
            itineraryId={createdItinerary?.itinerary?.id}
            onClose={() => setShowVendorBrowser(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

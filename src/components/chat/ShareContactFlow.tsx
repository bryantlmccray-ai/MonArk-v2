import React from 'react';
import { useContactSharing } from '@/hooks/useContactSharing';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Mail, Phone, Instagram, Loader2 } from 'lucide-react';

type FlowState = 'idle' | 'pending' | 'mutual' | 'declined';

interface ShareContactFlowProps {
  conversationId: string;
  matchUserId: string;
  matchedUserName: string;
  onClose?: () => void;
  modal?: boolean;
}

function PulseDot() {
  return (
    <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse mr-1.5" />
  );
}

function IconCircle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-[60px] h-[60px] rounded-full border border-border flex items-center justify-center mx-auto mb-5 ${className}`}>
      {children}
    </div>
  );
}

function StateIdle({ name, onShare, onDecline, loading }: {
  name: string;
  onShare: () => void;
  onDecline: () => void;
  loading: boolean;
}) {
  return (
    <>
      <IconCircle className="bg-primary/10 border-primary/30">
        <span className="text-2xl text-primary">◎</span>
      </IconCircle>
      <h3 className="font-serif text-xl text-foreground text-center mb-3 leading-tight">
        Ready to connect with {name}?
      </h3>
      <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6 font-light">
        When both of you express interest, MonArk will share your contact details.
        Nothing is revealed until alignment is mutual.
      </p>
      <div className="flex gap-2.5">
        <Button
          variant="outline"
          onClick={onDecline}
          disabled={loading}
          className="flex-1 rounded-full uppercase tracking-wider text-xs"
        >
          Not yet
        </Button>
        <Button
          onClick={onShare}
          disabled={loading}
          className="flex-1 rounded-full uppercase tracking-wider text-xs"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Share my contact'}
        </Button>
      </div>
    </>
  );
}

function StatePending({ name }: { name: string }) {
  return (
    <>
      <IconCircle className="bg-accent/10 border-accent/30">
        <span className="text-2xl text-accent">⧖</span>
      </IconCircle>
      <h3 className="font-serif text-xl text-foreground text-center mb-3 leading-tight">
        Interest sent.
      </h3>
      <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6 font-light">
        <PulseDot />
        Waiting for {name} to respond. When they express interest too, your
        contact details will be shared simultaneously.
      </p>
      <div className="bg-muted/50 rounded-xl p-3.5 mt-2">
        <p className="text-xs text-accent text-center tracking-wider uppercase">
          You'll receive a notification when alignment is confirmed.
        </p>
      </div>
    </>
  );
}

function StateMutual({ name, phone, email }: { name: string; phone?: string | null; email?: string | null }) {
  const hasContact = phone || email;
  return (
    <>
      <IconCircle className="bg-primary/10 border-primary/30">
        <span className="text-2xl text-primary">✦</span>
      </IconCircle>
      <h3 className="font-serif text-xl text-primary text-center mb-3 leading-tight">
        Mutual interest. You're connected.
      </h3>
      <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6 font-light">
        Both you and {name} have expressed interest. Your contact details have
        been shared with each other.
      </p>

      {hasContact && (
        <div className="bg-muted/50 rounded-xl p-5 mt-2 border border-primary/15">
          <div className="text-[10px] uppercase tracking-[0.2em] text-accent mb-3">{name}'s Contact</div>
          {email && (
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[11px] uppercase tracking-wider text-accent flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </span>
              <a href={`mailto:${email}`} className="text-sm text-foreground no-underline hover:text-primary transition-colors">
                {email}
              </a>
            </div>
          )}
          {phone && (
            <div className="flex justify-between items-center">
              <span className="text-[11px] uppercase tracking-wider text-accent flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone
              </span>
              <a href={`tel:${phone}`} className="text-sm text-foreground no-underline hover:text-primary transition-colors">
                {phone}
              </a>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-primary text-center mt-5 italic">
        Date well.
      </p>
    </>
  );
}

function StateDeclined({ name }: { name: string }) {
  return (
    <>
      <IconCircle className="bg-muted border-border">
        <span className="text-2xl text-muted-foreground">○</span>
      </IconCircle>
      <h3 className="font-serif text-xl text-foreground text-center mb-3 leading-tight">
        Not this time.
      </h3>
      <p className="text-sm text-muted-foreground text-center leading-relaxed font-light">
        Contact wasn't exchanged with {name}. That's okay — not every
        match becomes a connection, and that's part of the process.
      </p>
      <p className="text-xs text-accent text-center italic mt-4">
        Your next three arrive Monday.
      </p>
    </>
  );
}

export const ShareContactFlow: React.FC<ShareContactFlowProps> = ({
  conversationId,
  matchUserId,
  matchedUserName,
  onClose,
  modal = false,
}) => {
  const {
    loading,
    matchPhoneNumber,
    iHaveShared,
    theyHaveShared,
    shareContact,
    canShare,
  } = useContactSharing(conversationId, matchUserId);

  const [declined, setDeclined] = React.useState(false);

  // Derive flow state from hook
  let state: FlowState = 'idle';
  if (declined) {
    state = 'declined';
  } else if (iHaveShared && theyHaveShared) {
    state = 'mutual';
  } else if (iHaveShared) {
    state = 'pending';
  }

  const handleShare = async () => {
    await shareContact();
  };

  const handleDecline = () => {
    setDeclined(true);
  };

  const content = (
    <div className="bg-card rounded-2xl p-8 max-w-[400px] w-full shadow-lg relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xl leading-none transition-colors"
        >
          ×
        </button>
      )}

      {state === 'idle' && (
        <StateIdle
          name={matchedUserName}
          onShare={handleShare}
          onDecline={handleDecline}
          loading={loading}
        />
      )}
      {state === 'pending' && <StatePending name={matchedUserName} />}
      {state === 'mutual' && (
        <StateMutual
          name={matchedUserName}
          phone={matchPhoneNumber}
        />
      )}
      {state === 'declined' && <StateDeclined name={matchedUserName} />}
    </div>
  );

  if (!modal) return content;

  return (
    <Dialog open onOpenChange={() => onClose?.()}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[420px]">
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default ShareContactFlow;

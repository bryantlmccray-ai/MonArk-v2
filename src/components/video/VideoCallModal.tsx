import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Settings,
  Monitor,
  MessageCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchName: string;
  matchImage?: string;
  conversationId: string;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  matchName,
  matchImage,
  conversationId
}) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setCallStatus('connected');
        toast({
          title: "Connected",
          description: `Video call with ${matchName} started`,
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, matchName]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    toast({
      title: "Call Ended",
      description: `Video call with ${matchName} ended`,
    });
    setTimeout(() => {
      onClose();
      setCallStatus('connecting');
      setCallDuration(0);
    }, 1000);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    toast({ description: `Camera ${!isVideoEnabled ? 'enabled' : 'disabled'}` });
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    toast({ description: `Microphone ${!isAudioEnabled ? 'enabled' : 'disabled'}` });
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast({ description: `Screen sharing ${!isScreenSharing ? 'started' : 'stopped'}` });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 bg-card border-2 border-border shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.15)]">
        <div className="flex flex-col h-full">
          {/* Call Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                {matchImage ? (
                  <img src={matchImage} alt={matchName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-primary-foreground font-semibold">{matchName.charAt(0)}</span>
                )}
              </div>
              <div>
                <h3 className="text-foreground font-semibold">{matchName}</h3>
                <p className="text-muted-foreground text-sm">
                  {callStatus === 'connecting' && 'Connecting...'}
                  {callStatus === 'connected' && formatDuration(callDuration)}
                  {callStatus === 'ended' && 'Call ended'}
                </p>
              </div>
            </div>
            
            {callStatus === 'connected' && (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Video Area */}
          <div className="flex-1 relative bg-muted">
            {callStatus === 'connecting' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Video className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">Connecting to {matchName}...</p>
                  <p className="text-muted-foreground text-sm mt-1">Please wait</p>
                </div>
              </div>
            ) : callStatus === 'ended' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PhoneOff className="h-8 w-8 text-destructive" />
                  </div>
                  <p className="text-foreground font-medium">Call ended</p>
                  <p className="text-muted-foreground text-sm mt-1">Duration: {formatDuration(callDuration)}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <div className="w-48 h-48 bg-primary/10 rounded-full flex items-center justify-center">
                    {matchImage ? (
                      <img src={matchImage} alt={matchName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-6xl text-primary font-light">{matchName.charAt(0)}</span>
                    )}
                  </div>
                </div>

                <div className="absolute top-4 right-4 w-48 h-36 bg-muted rounded-xl overflow-hidden border-2 border-border">
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    {isVideoEnabled ? (
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Video className="h-6 w-6 text-primary" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <VideoOff className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Call Controls */}
          {callStatus === 'connected' && (
            <div className="p-6 border-t border-border">
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={toggleAudio}
                  size="lg"
                  variant={isAudioEnabled ? 'secondary' : 'destructive'}
                  className="rounded-full w-14 h-14"
                >
                  {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </Button>

                <Button
                  onClick={toggleVideo}
                  size="lg"
                  variant={isVideoEnabled ? 'secondary' : 'destructive'}
                  className="rounded-full w-14 h-14"
                >
                  {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </Button>

                <Button
                  onClick={toggleScreenShare}
                  size="lg"
                  variant={isScreenSharing ? 'default' : 'secondary'}
                  className="rounded-full w-14 h-14"
                >
                  <Monitor className="h-6 w-6" />
                </Button>

                <Button
                  onClick={handleEndCall}
                  size="lg"
                  variant="destructive"
                  className="rounded-full w-14 h-14"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </div>
          )}

          {callStatus === 'connecting' && (
            <div className="p-6 border-t border-border">
              <div className="flex items-center justify-center">
                <Button
                  onClick={handleEndCall}
                  size="lg"
                  variant="destructive"
                  className="rounded-full w-14 h-14"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

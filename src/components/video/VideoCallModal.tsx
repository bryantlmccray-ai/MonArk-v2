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

  // Simulate call duration timer
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

  // Simulate connecting then connected
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
    toast({
      description: `Camera ${!isVideoEnabled ? 'enabled' : 'disabled'}`,
    });
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    toast({
      description: `Microphone ${!isAudioEnabled ? 'enabled' : 'disabled'}`,
    });
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast({
      description: `Screen sharing ${!isScreenSharing ? 'started' : 'stopped'}`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 bg-jet-black border-gray-800">
        <div className="flex flex-col h-full">
          {/* Call Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-goldenrod rounded-full flex items-center justify-center">
                {matchImage ? (
                  <img src={matchImage} alt={matchName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-jet-black font-medium">{matchName.charAt(0)}</span>
                )}
              </div>
              <div>
                <h3 className="text-white font-medium">{matchName}</h3>
                <p className="text-gray-400 text-sm">
                  {callStatus === 'connecting' && 'Connecting...'}
                  {callStatus === 'connected' && formatDuration(callDuration)}
                  {callStatus === 'ended' && 'Call ended'}
                </p>
              </div>
            </div>
            
            {callStatus === 'connected' && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Video Area */}
          <div className="flex-1 relative bg-gray-900">
            {callStatus === 'connecting' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-goldenrod/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Video className="h-8 w-8 text-goldenrod" />
                  </div>
                  <p className="text-white">Connecting to {matchName}...</p>
                  <p className="text-gray-400 text-sm mt-1">Please wait</p>
                </div>
              </div>
            ) : callStatus === 'ended' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PhoneOff className="h-8 w-8 text-red-400" />
                  </div>
                  <p className="text-white">Call ended</p>
                  <p className="text-gray-400 text-sm mt-1">Duration: {formatDuration(callDuration)}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Remote Video (Main) */}
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <div className="w-48 h-48 bg-goldenrod/20 rounded-full flex items-center justify-center">
                    {matchImage ? (
                      <img src={matchImage} alt={matchName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-6xl text-goldenrod font-light">{matchName.charAt(0)}</span>
                    )}
                  </div>
                </div>

                {/* Local Video (Picture-in-Picture) */}
                <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600">
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                    {isVideoEnabled ? (
                      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Video className="h-6 w-6 text-blue-400" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center">
                        <VideoOff className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Call Controls */}
          {callStatus === 'connected' && (
            <div className="p-6 border-t border-gray-800">
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={toggleAudio}
                  size="lg"
                  className={`rounded-full w-14 h-14 ${
                    isAudioEnabled 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </Button>

                <Button
                  onClick={toggleVideo}
                  size="lg"
                  className={`rounded-full w-14 h-14 ${
                    isVideoEnabled 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </Button>

                <Button
                  onClick={toggleScreenShare}
                  size="lg"
                  className={`rounded-full w-14 h-14 ${
                    isScreenSharing 
                      ? 'bg-goldenrod hover:bg-goldenrod/90 text-jet-black'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  <Monitor className="h-6 w-6" />
                </Button>

                <Button
                  onClick={handleEndCall}
                  size="lg"
                  className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600 text-white"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </div>
          )}

          {/* Connecting State Controls */}
          {callStatus === 'connecting' && (
            <div className="p-6 border-t border-gray-800">
              <div className="flex items-center justify-center">
                <Button
                  onClick={handleEndCall}
                  size="lg"
                  className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600 text-white"
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
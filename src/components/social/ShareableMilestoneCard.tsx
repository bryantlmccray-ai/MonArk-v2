import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import monarkLogoHorizontal from '@/assets/monark-logo-horizontal.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, Download, Check, Loader2, Copy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface ShareableMilestoneCardProps {
  variant?: 'story' | 'feed';
  milestoneType?: 'first-match' | 'first-date' | 'connection' | 'weekly-insight';
  headline?: string;
  subtext?: string;
  accentColor?: 'terracotta' | 'sage' | 'navy';
  showShareButton?: boolean;
}

export const ShareableMilestoneCard: React.FC<ShareableMilestoneCardProps> = ({
  variant = 'story',
  milestoneType = 'first-match',
  headline = 'MY FIRST MATCH',
  subtext,
  accentColor = 'terracotta',
  showShareButton = true
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const isStory = variant === 'story';
  
  // Aspect ratio classes
  const containerClass = isStory 
    ? 'aspect-[9/16] max-w-[360px]' 
    : 'aspect-square max-w-[400px]';

  // Color palette based on accent
  const accentColors = {
    terracotta: {
      accent: 'hsl(15, 45%, 55%)',
      accentLight: 'hsl(15, 35%, 75%)',
      glow: 'rgba(194, 130, 104, 0.3)'
    },
    sage: {
      accent: 'hsl(140, 25%, 45%)',
      accentLight: 'hsl(140, 20%, 65%)',
      glow: 'rgba(130, 160, 130, 0.3)'
    },
    navy: {
      accent: 'hsl(220, 40%, 25%)',
      accentLight: 'hsl(220, 30%, 45%)',
      glow: 'rgba(60, 80, 120, 0.3)'
    }
  };

  const colors = accentColors[accentColor];

  // Milestone-specific icons/symbols
  const getMilestoneSymbol = () => {
    switch (milestoneType) {
      case 'first-match':
        return '◇';
      case 'first-date':
        return '◈';
      case 'connection':
        return '◆';
      case 'weekly-insight':
        return '○';
      default:
        return '◇';
    }
  };

  // Generate image from card
  const generateImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) {
      console.error('Card ref not found');
      return null;
    }

    try {
      // Wait for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#1a1a2e', // Fallback background
        useCORS: true,
        logging: false,
        allowTaint: true,
        foreignObjectRendering: false
      });

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error('Failed to create blob from canvas');
            }
            resolve(blob);
          }, 
          'image/png', 
          1.0
        );
      });
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to capture image');
      return null;
    }
  };

  // Share via Web Share API
  const handleShare = async () => {
    setIsSharing(true);

    try {
      const imageBlob = await generateImage();
      
      if (!imageBlob) {
        setIsSharing(false);
        return;
      }

      const file = new File([imageBlob], `monark-${milestoneType}-${Date.now()}.png`, {
        type: 'image/png'
      });

      // Check if Web Share API is available and supports files
      const canShareFiles = typeof navigator !== 'undefined' && 
                           navigator.share && 
                           navigator.canShare && 
                           navigator.canShare({ files: [file] });
      
      if (canShareFiles) {
        try {
          await navigator.share({
            files: [file],
            title: 'MonArk Milestone',
            text: `${headline} #MonArk #DatingJourney`
          });
          
          setShareSuccess(true);
          toast.success('Shared successfully!');
          setTimeout(() => setShareSuccess(false), 2000);
        } catch (shareError: any) {
          // User cancelled or share failed
          if (shareError.name === 'AbortError') {
            // User cancelled, no error message needed
          } else {
            console.error('Share failed:', shareError);
            // Fallback to download
            await handleDownload(imageBlob);
          }
        }
      } else {
        // Web Share API not supported - download and show instructions
        await handleDownload(imageBlob);
        toast.info('Image downloaded! Open Instagram and share from your gallery.');
      }
    } catch (error: any) {
      console.error('Share error:', error);
      toast.error('Something went wrong. Try the download button instead.');
    } finally {
      setIsSharing(false);
    }
  };

  // Download image fallback
  const handleDownload = async (existingBlob?: Blob) => {
    setIsSharing(true);

    try {
      const imageBlob = existingBlob || await generateImage();
      
      if (!imageBlob) {
        toast.error('Failed to generate image');
        setIsSharing(false);
        return;
      }

      const url = URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `monark-${milestoneType}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Image downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* The card itself */}
      <div 
        ref={cardRef}
        className={`${containerClass} relative overflow-hidden rounded-2xl`}
        style={{
          background: 'linear-gradient(165deg, hsl(220, 25%, 12%) 0%, hsl(220, 30%, 8%) 100%)'
        }}
      >
        {/* Grain texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Abstract journey line - the "Ark" motif */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M -10 75 Q 25 65, 40 50 T 70 35 T 110 20"
            fill="none"
            stroke={colors.accent}
            strokeWidth="0.3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 1, 0],
              opacity: [0, 0.6, 0.6, 0]
            }}
            transition={{ 
              duration: 4, 
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 1
            }}
          />
          <motion.path
            d="M -5 80 Q 30 70, 45 55 T 75 40 T 115 25"
            fill="none"
            stroke={colors.accentLight}
            strokeWidth="0.15"
            strokeLinecap="round"
            strokeDasharray="2 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 1, 0],
              opacity: [0, 0.4, 0.4, 0]
            }}
            transition={{ 
              duration: 4.5, 
              ease: "easeInOut",
              delay: 0.3,
              repeat: Infinity,
              repeatDelay: 0.5
            }}
          />
        </svg>

        {/* Subtle glow effect - pulsing */}
        <motion.div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: colors.glow }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity
          }}
        />

        {/* Content container */}
        <div className="relative z-10 h-full flex flex-col justify-between p-8">
          {/* Top section - decorative */}
          <motion.div 
            className="flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div 
              className="text-3xl opacity-20"
              style={{ color: colors.accent }}
            >
              {getMilestoneSymbol()}
            </div>
          </motion.div>

          {/* Middle section - main content */}
          <div className={`flex-1 flex flex-col ${isStory ? 'justify-center' : 'justify-center'} items-start`}>
            {/* Pre-headline */}
            <motion.p 
              className="text-sm tracking-[0.25em] uppercase mb-4 font-light"
              style={{ 
                color: colors.accentLight,
                fontFamily: "'Inter', 'system-ui', sans-serif"
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              This week my ark brought me
            </motion.p>

            {/* Main headline */}
            <motion.h1 
              className="text-3xl md:text-4xl font-normal tracking-[0.15em] leading-tight mb-6"
              style={{ 
                fontFamily: "'Canela', 'Playfair Display', 'Georgia', serif",
                color: 'hsl(35, 30%, 92%)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {headline}
            </motion.h1>

            {/* Optional subtext */}
            {subtext && (
              <motion.p 
                className="text-sm opacity-60 max-w-[200px]"
                style={{ 
                  fontFamily: "'Inter', 'system-ui', sans-serif",
                  color: 'hsl(35, 20%, 80%)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.7 }}
              >
                {subtext}
              </motion.p>
            )}

            {/* Emotional Intelligence indicator */}
            <motion.div 
              className="mt-8 flex items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center border"
                style={{ 
                  borderColor: colors.accent,
                  background: `${colors.accent}15`
                }}
              >
                <span 
                  className="text-xs"
                  style={{ color: colors.accent }}
                >
                  EQ
                </span>
              </div>
              <span 
                className="text-xs tracking-wider opacity-50"
                style={{ color: 'hsl(35, 20%, 80%)' }}
              >
                Emotional Intelligence Match
              </span>
            </motion.div>
          </div>

          {/* Bottom section - branding */}
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <img src={monarkLogoHorizontal} alt="MonArk — Date well." className="h-8 w-auto object-contain brightness-110" />
            <Badge 
              variant="outline" 
              className="border-white/20 bg-white/5 text-white/60 text-[10px] tracking-wider"
            >
              BETA
            </Badge>
          </motion.div>
        </div>
      </div>

      {/* Share buttons */}
      {showShareButton && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleShare}
            disabled={isSharing}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {isSharing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : shareSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {shareSuccess ? 'Shared!' : 'Share to Instagram'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleDownload()}
            disabled={isSharing}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      )}
    </div>
  );
};

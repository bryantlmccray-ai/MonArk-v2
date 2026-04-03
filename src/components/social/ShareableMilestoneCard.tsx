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
  accentColor?: 'gold' | 'linen' | 'walnut';
  showShareButton?: boolean;
}

export const ShareableMilestoneCard: React.FC<ShareableMilestoneCardProps> = ({
  variant = 'story',
  milestoneType = 'first-match',
  headline = 'MY FIRST MATCH',
  subtext,
  accentColor = 'gold',
  showShareButton = true
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const isStory = variant === 'story';
  
  const containerClass = isStory 
    ? 'aspect-[9/16] max-w-[360px]' 
    : 'aspect-square max-w-[400px]';

  // Brand-aligned color palette
  const accentColors = {
    gold: {
      accent: '#A08C6E',
      accentLight: '#D9D0C5',
      glow: 'rgba(160, 140, 110, 0.3)',
      isDark: true,
    },
    linen: {
      accent: '#E8DED4',
      accentLight: '#F2EDE8',
      glow: 'rgba(232, 222, 212, 0.3)',
      isDark: true,
    },
    walnut: {
      accent: '#4A3E30',
      accentLight: '#6B5D4E',
      glow: 'rgba(74, 62, 48, 0.3)',
      isDark: true,
    }
  };

  const colors = accentColors[accentColor];

  const getMilestoneSymbol = () => {
    switch (milestoneType) {
      case 'first-match': return { symbol: '◇', label: 'First Match milestone' };
      case 'first-date': return { symbol: '◈', label: 'First Date milestone' };
      case 'connection': return { symbol: '◆', label: 'New Connection milestone' };
      case 'weekly-insight': return { symbol: '○', label: 'Weekly Insight milestone' };
      default: return { symbol: '◇', label: 'Milestone' };
    }
  };

  const handleCopyImage = async () => {
    setIsSharing(true);
    try {
      const imageBlob = await generateImage();
      if (!imageBlob) { toast.error('Failed to generate image'); return; }
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': imageBlob })]);
      toast.success('Image copied to clipboard!');
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Copy not supported in this browser. Try downloading instead.');
    } finally { setIsSharing(false); }
  };

  const generateImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#1a1a2e', useCORS: true, logging: false, allowTaint: true, foreignObjectRendering: false });
      return new Promise((resolve) => { canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0); });
    } catch (error) { console.error('Error generating image:', error); toast.error('Failed to capture image'); return null; }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const imageBlob = await generateImage();
      if (!imageBlob) { setIsSharing(false); return; }
      const file = new File([imageBlob], `monark-${milestoneType}-${Date.now()}.png`, { type: 'image/png' });
      const canShareFiles = typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare({ files: [file] });
      if (canShareFiles) {
        try {
          await navigator.share({ files: [file], title: 'MonArk Milestone', text: `${headline} #MonArk #DatingJourney` });
          setShareSuccess(true); toast.success('Shared successfully!'); setTimeout(() => setShareSuccess(false), 2000);
        } catch (shareError: any) {
          if (shareError.name !== 'AbortError') { await handleDownload(imageBlob); }
        }
      } else { await handleDownload(imageBlob); toast.info('Image downloaded! Open Instagram and share from your gallery.'); }
    } catch (error: any) { console.error('Share error:', error); toast.error('Something went wrong. Try the download button instead.'); } finally { setIsSharing(false); }
  };

  const handleDownload = async (existingBlob?: Blob) => {
    setIsSharing(true);
    try {
      const imageBlob = existingBlob || await generateImage();
      if (!imageBlob) { toast.error('Failed to generate image'); setIsSharing(false); return; }
      const url = URL.createObjectURL(imageBlob);
      const link = document.createElement('a'); link.href = url; link.download = `monark-${milestoneType}-${Date.now()}.png`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
      toast.success('Image downloaded!');
    } catch (error) { console.error('Download error:', error); toast.error('Failed to download image'); } finally { setIsSharing(false); }
  };

  // Footer text color based on card darkness
  const footerTextColor = accentColor === 'linen' ? '#3D3428' : '#A08C6E';

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        ref={cardRef}
        className={`${containerClass} relative overflow-hidden rounded-2xl`}
        style={{ background: 'linear-gradient(165deg, hsl(220, 25%, 12%) 0%, hsl(220, 30%, 8%) 100%)' }}
      >
        {/* Grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

        {/* Journey line motif */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path d="M -10 75 Q 25 65, 40 50 T 70 35 T 110 20" fill="none" stroke={colors.accent} strokeWidth="0.3" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.6, 0.6, 0] }} transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }} />
          <motion.path d="M -5 80 Q 30 70, 45 55 T 75 40 T 115 25" fill="none" stroke={colors.accentLight} strokeWidth="0.15" strokeLinecap="round" strokeDasharray="2 4" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.4, 0.4, 0] }} transition={{ duration: 4.5, ease: "easeInOut", delay: 0.3, repeat: Infinity, repeatDelay: 0.5 }} />
        </svg>

        {/* Glow */}
        <motion.div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: colors.glow }} animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }} />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-8">
          <motion.div className="flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-3xl opacity-20 cursor-help" style={{ color: colors.accent }}>{getMilestoneSymbol().symbol}</div>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs">{getMilestoneSymbol().label}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>

          <div className={`flex-1 flex flex-col justify-center items-start`}>
            <motion.p className="text-sm tracking-[0.25em] uppercase mb-4 font-light" style={{ color: colors.accentLight, fontFamily: "'Inter', 'system-ui', sans-serif" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              This week my ark brought me
            </motion.p>
            <motion.h1 className="text-3xl md:text-4xl font-normal tracking-[0.15em] leading-tight mb-6" style={{ fontFamily: "'Canela', 'Playfair Display', 'Georgia', serif", color: 'hsl(35, 30%, 92%)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              {headline}
            </motion.h1>
            {subtext && (
              <motion.p className="text-sm opacity-60 max-w-[200px]" style={{ fontFamily: "'Inter', 'system-ui', sans-serif", color: 'hsl(35, 20%, 80%)' }} initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.7 }}>
                {subtext}
              </motion.p>
            )}
            <motion.div className="mt-8 flex items-center gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ borderColor: colors.accent, background: `${colors.accent}15` }}>
                <span className="text-xs" style={{ color: colors.accent }}>EQ</span>
              </div>
              <span className="text-xs tracking-wider opacity-50" style={{ color: 'hsl(35, 20%, 80%)' }}>Emotional Intelligence Match</span>
            </motion.div>
          </div>

          {/* Footer — MonArk wordmark + Date well. */}
          <motion.div className="flex items-center justify-between" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <div className="flex items-center gap-3">
              <img src={monarkLogoHorizontal} alt="MonArk" className="h-8 w-auto object-contain brightness-110" />
            </div>
            <span className="font-body text-[11px] uppercase tracking-[0.15em]" style={{ color: footerTextColor }}>
              Date well.
            </span>
          </motion.div>
        </div>
      </div>

      {/* Share buttons */}
      {showShareButton && (
        <div className="flex items-center gap-3">
          <Button onClick={handleShare} disabled={isSharing} className="gap-2 bg-[#A08C6E] hover:bg-[#A08C6E]/90 text-[#F0EBE3] rounded-[40px]">
            {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : shareSuccess ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {shareSuccess ? 'Shared!' : 'Share to Instagram'}
          </Button>
          <Button variant="outline" onClick={() => handleDownload()} disabled={isSharing} className="gap-2 rounded-[40px]">
            <Download className="h-4 w-4" /> Download
          </Button>
          <Button variant="outline" onClick={handleCopyImage} disabled={isSharing} className="gap-2 rounded-[40px]">
            <Copy className="h-4 w-4" /> Copy Image
          </Button>
        </div>
      )}
    </div>
  );
};

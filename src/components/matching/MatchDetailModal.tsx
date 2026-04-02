import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, X, MapPin, Briefcase, GraduationCap, 
  ChevronLeft, ChevronRight, Sparkles, Target,
  MessageCircle, Flag
} from 'lucide-react';
import { ReportBlockModal } from '@/components/safety/ReportBlockModal';
import { PhotoLightbox } from '@/components/ui/PhotoLightbox';

interface MatchProfile {
  id: string;
  name?: string;
  photos?: string[];
  bio?: string;
  age?: number;
  location?: string;
  interests?: string[];
  occupation?: string;
  education_level?: string;
  compatibility_score?: number;
  match_reason?: string;
  relationship_goals?: string[];
  height_cm?: number;
  exercise_habits?: string;
  smoking_status?: string;
  drinking_status?: string;
}

interface MatchDetailModalProps {
  match: MatchProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: () => void;
  onPass: () => void;
  isProcessing?: boolean;
  isCurated?: boolean;
}

export const MatchDetailModal = ({
  match,
  isOpen,
  onClose,
  onLike,
  onPass,
  isProcessing,
  isCurated
}: MatchDetailModalProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showReportBlock, setShowReportBlock] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!match) return null;

  const photos = match.photos?.length ? match.photos : ['/placeholder.svg'];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const formatHeight = (cm?: number) => {
    if (!cm) return null;
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm % 30.48) / 2.54);
    return `${feet}'${inches}"`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-card h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-none sm:rounded-lg [&>button]:z-20">
        {/* Scrollable body: photo + content */}
        <ScrollArea className="flex-1 min-h-0">
          {/* Photo carousel */}
          <div className="relative aspect-[4/5] sm:aspect-[4/4] bg-muted">
            <img
              src={photos[currentPhotoIndex]}
              alt={`${match.name}'s photo`}
              className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all duration-200"
              onClick={() => setLightboxOpen(true)}
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/80 to-accent/60';
                fallback.innerHTML = `<span class="text-primary-foreground font-serif text-5xl opacity-90">${(match.name || 'M').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}</span>`;
                target.parentNode?.insertBefore(fallback, target);
              }}
              crossOrigin="anonymous"
            />
            
            {/* Photo navigation */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                {/* Photo indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPhotoIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Curated badge */}
            {isCurated && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary/90 text-primary-foreground">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Curated for You
                </Badge>
              </div>
            )}

            {/* Compatibility score */}
            {match.compatibility_score && (
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-foreground/80 text-white border-none backdrop-blur-md text-xs font-medium">
                  {Math.round(match.compatibility_score * 100)}% Match
                </Badge>
              </div>
            )}

            {/* Name overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16">
              <h2 className="text-2xl font-bold text-white">
                {match.name}, {match.age}
              </h2>
              {match.location && (
                <p className="text-white/80 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {match.location}
                </p>
              )}
            </div>
          </div>

          {/* Profile content — inside same scroll container */}
          <div className="p-6 space-y-6">
            {/* Compatibility insight — gold-bordered highlight */}
            {match.match_reason && (
              <div className="relative p-4 rounded-xl border border-[hsl(var(--primary))] bg-gradient-to-r from-[hsl(var(--primary)/0.08)] to-[hsl(var(--primary)/0.03)] shadow-[0_2px_12px_-4px_hsl(var(--primary)/0.2)]">
                <div className="flex items-start gap-3">
                  <span className="text-[hsl(var(--primary))] text-lg leading-none mt-0.5 flex-shrink-0">✦</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--primary))] font-medium mb-1">Why we matched you</p>
                    <p className="text-sm text-foreground leading-relaxed italic font-light">"{match.match_reason}"</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick info */}
            <div className="flex flex-wrap gap-2">
              {match.occupation && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {match.occupation}
                </Badge>
              )}
              {match.education_level && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {match.education_level}
                </Badge>
              )}
              {match.height_cm && (
                <Badge variant="outline">
                  {formatHeight(match.height_cm)}
                </Badge>
              )}
            </div>

            {/* Bio */}
            {match.bio && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">About</h3>
                <p className="text-muted-foreground">{match.bio}</p>
              </div>
            )}

            {/* Interests */}
            {match.interests && match.interests.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {match.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* What they're looking for */}
            {match.relationship_goals && match.relationship_goals.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Looking For</h3>
                <div className="flex flex-wrap gap-2">
                  {match.relationship_goals.map((goal) => (
                    <Badge key={goal} variant="outline" className="text-primary border-primary/30">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Lifestyle */}
            {(match.exercise_habits || match.smoking_status || match.drinking_status) && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Lifestyle</h3>
                <div className="flex flex-wrap gap-2">
                  {match.exercise_habits && (
                    <Badge variant="outline">{match.exercise_habits}</Badge>
                  )}
                  {match.smoking_status && (
                    <Badge variant="outline">{match.smoking_status}</Badge>
                  )}
                  {match.drinking_status && (
                    <Badge variant="outline">{match.drinking_status}</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Scroll fade indicator */}
        <div className="pointer-events-none h-6 -mt-6 relative z-10 bg-gradient-to-t from-card to-transparent flex-shrink-0" />

        {/* Action buttons - sticky footer */}
        <div className="flex-shrink-0 p-4 border-t border-border bg-card space-y-2">
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 h-14"
              onClick={onPass}
              disabled={isProcessing}
            >
              <X className="w-6 h-6 mr-2" />
              Pass
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14"
              onClick={onLike}
              disabled={isProcessing}
            >
              <Heart className="w-6 h-6 mr-2" />
              Like
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-destructive"
            onClick={() => setShowReportBlock(true)}
          >
            <Flag className="w-4 h-4 mr-2" />
            Report or Block
          </Button>
        </div>

        {match && (
          <ReportBlockModal
            isOpen={showReportBlock}
            onClose={() => setShowReportBlock(false)}
            userId={match.id}
            userName={match.name || 'This user'}
          />
        )}

        <PhotoLightbox
          photos={photos}
          initialIndex={currentPhotoIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          name={match.name}
        />
      </DialogContent>
    </Dialog>
  );
};
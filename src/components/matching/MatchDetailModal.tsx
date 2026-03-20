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
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-card max-h-[90vh]">
        {/* Photo carousel */}
        <div className="relative aspect-[4/5] bg-muted">
          <img
            src={photos[currentPhotoIndex]}
            alt={`${match.name}'s photo`}
            className="w-full h-full object-cover"
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
              <Badge variant="secondary" className="bg-black/60 text-white border-none">
                <Target className="w-3 h-3 mr-1" />
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

        {/* Profile content */}
        <ScrollArea className="max-h-[40vh]">
          <div className="p-6 space-y-6">
            {/* Match reason (if curated) */}
            {match.match_reason && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium text-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Why we matched you
                </p>
                <p className="text-sm text-foreground mt-1">{match.match_reason}</p>
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

        {/* Action buttons - sticky footer */}
        <div className="p-4 border-t border-border bg-card space-y-2">
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
              className="flex-1 h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
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
      </DialogContent>
    </Dialog>
  );
};
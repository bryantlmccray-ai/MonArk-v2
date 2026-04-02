import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useCuratedMatches, CuratedMatch } from '@/hooks/useCuratedMatches';
import { useDatingPool, DatingPoolMatch } from '@/hooks/useDatingPool';
import { MatchDetailModal } from './MatchDetailModal';
import { MatchRevealCeremony } from './MatchRevealCeremony';
import { MutualMatchModal } from './MutualMatchModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Sparkles, Users, Calendar, Heart, MapPin, 
  ChevronRight, Target, Coffee, Wine, Palette, Music, Compass,
  Moon
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { WeeklyRhythmPlans } from '@/components/weekly/WeeklyRhythmPlans';
 import { ApiErrorFallback } from '@/components/common/ApiErrorFallback';
 import { useActionProtection } from '@/hooks/useActionProtection';

// Fallback gradient placeholder when external images fail to load
const ImageWithFallback = ({ src, alt, className, loading }: { src: string; alt: string; className?: string; loading?: 'lazy' | 'eager' }) => {
  const [failed, setFailed] = useState(false);
  const initials = (alt || 'M').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  if (failed || !src || src === '/placeholder.svg') {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-primary/80 to-accent/60`}>
        <span className="text-primary-foreground font-serif text-4xl opacity-90">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => setFailed(true)}
      crossOrigin="anonymous"
    />
  );
};

interface UnifiedMatch {
  id: string;
  userId: string;
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
  isCurated: boolean;
}

// Demo data for testing - beautiful, realistic profiles
const DEMO_CURATED_MATCHES: UnifiedMatch[] = [
  {
    id: 'demo-1',
    userId: 'demo-user-1',
    name: 'Sophia',
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop'],
    bio: 'Art curator by day, salsa dancer by night. Looking for someone to explore hidden gallery openings and late-night taco spots.',
    age: 28,
    location: 'Brooklyn, NY',
    interests: ['Contemporary Art', 'Dance', 'Wine Tasting', 'Travel'],
    occupation: 'Art Curator',
    education_level: 'Masters',
    compatibility_score: 0.94,
    match_reason: 'You both value creativity and spontaneous adventures',
    isCurated: true
  },
  {
    id: 'demo-2',
    userId: 'demo-user-2',
    name: 'Marcus',
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop'],
    bio: 'Jazz pianist and coffee enthusiast. I believe the best conversations happen over pour-overs and vinyl records.',
    age: 31,
    location: 'Manhattan, NY',
    interests: ['Jazz', 'Coffee', 'Vinyl Records', 'Philosophy'],
    occupation: 'Music Producer',
    education_level: 'Bachelors',
    compatibility_score: 0.89,
    match_reason: 'Shared love for intimate conversations and artistic expression',
    isCurated: true
  },
  {
    id: 'demo-3',
    userId: 'demo-user-3',
    name: 'Elena',
    photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop'],
    bio: 'Architect with a passion for sustainable design. Weekends are for farmers markets and rooftop sunsets.',
    age: 29,
    location: 'West Village, NY',
    interests: ['Architecture', 'Sustainability', 'Cooking', 'Yoga'],
    occupation: 'Architect',
    education_level: 'Masters',
    compatibility_score: 0.92,
    match_reason: 'Both seeking intentional, meaningful connections',
    isCurated: true
  }
];

const DEMO_POOL_MATCHES: UnifiedMatch[] = [
  {
    id: 'demo-pool-1',
    userId: 'demo-pool-user-1',
    name: 'James',
    photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop'],
    bio: 'Documentary filmmaker exploring stories that matter.',
    age: 32,
    location: 'SoHo, NY',
    interests: ['Film', 'Travel', 'Storytelling'],
    occupation: 'Filmmaker',
    compatibility_score: 0.78,
    isCurated: false
  },
  {
    id: 'demo-pool-2',
    userId: 'demo-pool-user-2',
    name: 'Maya',
    photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop'],
    bio: 'Plant mom and pottery enthusiast.',
    age: 27,
    location: 'Williamsburg, NY',
    interests: ['Plants', 'Pottery', 'Hiking'],
    occupation: 'Interior Designer',
    compatibility_score: 0.82,
    isCurated: false
  },
  {
    id: 'demo-pool-3',
    userId: 'demo-pool-user-3',
    name: 'David',
    photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop'],
    bio: 'Chef specializing in farm-to-table cuisine.',
    age: 30,
    location: 'Chelsea, NY',
    interests: ['Cooking', 'Wine', 'Farmers Markets'],
    occupation: 'Executive Chef',
    compatibility_score: 0.85,
    isCurated: false
  },
  {
    id: 'demo-pool-4',
    userId: 'demo-pool-user-4',
    name: 'Aria',
    photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop'],
    bio: 'Classical violinist with a love for jazz.',
    age: 26,
    location: 'Upper West Side, NY',
    interests: ['Music', 'Theater', 'Reading'],
    occupation: 'Musician',
    compatibility_score: 0.80,
    isCurated: false
  }
];

export const SundayMatches = () => {
  const navigate = useNavigate();
  const { 
    matches: curatedMatches, 
    loading: curatedLoading, 
    acceptMatch: acceptCurated, 
    passMatch: passCurated,
    getNextRefreshDate 
  } = useCuratedMatches();
  
  const { 
    pool, 
    loading: poolLoading, 
    likePoolMatch, 
     passPoolMatch,
  } = useDatingPool();

  const [selectedMatch, setSelectedMatch] = useState<UnifiedMatch | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [mutualMatch, setMutualMatch] = useState<{ name: string; photo?: string; conversationId?: string } | null>(null);
  const [activeTab, setActiveTab] = useState('curated');
   const [actionError, setActionError] = useState<Error | null>(null);
   
   // Abuse protection for like/pass actions
   const { protectedAction, isProcessing: isActionBlocked } = useActionProtection({ debounceMs: 800 });

  const loading = curatedLoading || poolLoading;
  const nextRefresh = getNextRefreshDate();

  // Convert to unified format
  const unifiedCurated: UnifiedMatch[] = curatedMatches.map((m: CuratedMatch) => ({
    id: m.id,
    userId: m.matched_user_id,
    name: m.profile.name,
    photos: m.profile.photos,
    bio: m.profile.bio,
    age: m.profile.age,
    location: m.profile.location,
    interests: m.profile.interests,
    occupation: m.profile.occupation,
    education_level: m.profile.education_level,
    compatibility_score: m.compatibility_score,
    match_reason: m.match_reason,
    isCurated: true
  }));

  const unifiedPool: UnifiedMatch[] = pool.map((m: DatingPoolMatch) => ({
    id: m.id,
    userId: m.pool_user_id,
    name: m.profile.name,
    photos: m.profile.photos,
    bio: m.profile.bio,
    age: m.profile.age,
    location: m.profile.location,
    interests: m.profile.interests,
    occupation: m.profile.occupation,
    education_level: m.profile.education_level,
    compatibility_score: m.compatibility_score,
    isCurated: false
  }));

  const handleLike = async () => {
    if (!selectedMatch) return;
     if (isActionBlocked) return;
    
     setProcessingId(selectedMatch.id);
     setActionError(null);
     
     await protectedAction(async () => {
       try {
         let result: { success: boolean; isMutual?: boolean; conversationId?: string; matchName?: string; matchPhoto?: string };
         
         if (selectedMatch.isCurated) {
           result = await acceptCurated(selectedMatch.id);
         } else {
           result = await likePoolMatch(selectedMatch.id);
         }
 
         // Check for mutual match
         if (result.success && result.isMutual) {
           setMutualMatch({
             name: result.matchName || selectedMatch.name || 'Your Match',
             photo: result.matchPhoto || selectedMatch.photos?.[0],
             conversationId: result.conversationId
           });
         }
         
         setSelectedMatch(null);
         return result;
       } catch (error) {
         console.error('Error liking match:', error);
         setActionError(error instanceof Error ? error : new Error('Failed to like match'));
         throw error;
       } finally {
         setProcessingId(null);
       }
     });
  };

  const handlePass = async () => {
    if (!selectedMatch) return;
     if (isActionBlocked) return;
    
    setProcessingId(selectedMatch.id);
     setActionError(null);
    
     await protectedAction(async () => {
       try {
         if (selectedMatch.isCurated) {
           await passCurated(selectedMatch.id);
         } else {
           await passPoolMatch(selectedMatch.id);
         }
         
         setSelectedMatch(null);
         return true;
       } catch (error) {
         console.error('Error passing match:', error);
         setActionError(error instanceof Error ? error : new Error('Failed to pass match'));
         throw error;
       } finally {
         setProcessingId(null);
       }
     });
  };

  const handleStartChat = () => {
    if (mutualMatch?.conversationId) {
      navigate(`/chat/${mutualMatch.conversationId}`);
    }
    setMutualMatch(null);
  };

  const handlePlanDate = () => {
    if (mutualMatch?.conversationId) {
      navigate(`/chat/${mutualMatch.conversationId}`);
    }
    setMutualMatch(null);
  };

  const [showWelcomeTip, setShowWelcomeTip] = useState(() => {
    return !localStorage.getItem('monark-welcome-tip-dismissed');
  });

  const dismissWelcomeTip = () => {
    localStorage.setItem('monark-welcome-tip-dismissed', 'true');
    setShowWelcomeTip(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  // Use demo data if no real matches available
  const displayCurated = unifiedCurated.length > 0 ? unifiedCurated : DEMO_CURATED_MATCHES;
  const displayPool = unifiedPool.length > 0 ? unifiedPool : DEMO_POOL_MATCHES;
  const isUsingDemoData = unifiedCurated.length === 0 && unifiedPool.length === 0;

  const totalMatches = displayCurated.length + displayPool.length;

  return (
    <div className="bg-background">

      {/* Welcome Tip Banner */}
      {showWelcomeTip && (
        <div className="bg-primary/5 border-b border-primary/10 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <p className="text-sm font-body text-foreground/80">
              <span className="font-medium text-foreground">Welcome to MonArk.</span>{' '}
              Your profile lives in the tab below — refine it anytime.
            </p>
            <Button variant="ghost" size="sm" onClick={dismissWelcomeTip} className="shrink-0 text-[10px] uppercase tracking-[0.15em] text-primary hover:text-primary/80 font-caption">
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Demo Mode Ribbon */}
      {isUsingDemoData && (
        <div className="px-4 pt-3 pb-1">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 px-5 py-2 rounded-full border border-primary/25 bg-primary/[0.04]"
                 style={{ boxShadow: '0 0 12px rgba(139,105,20,0.06)' }}>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary/70 font-caption whitespace-nowrap">
                ✦ This is a preview of your curated experience
              </p>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="border-b border-border/30 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-caption flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-primary/70" />
            {displayCurated.length} curated this week
          </p>
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/[0.06] border border-primary/15"
               style={{ boxShadow: '0 0 10px rgba(139,105,20,0.05)' }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary/30 animate-[pulse_2.5s_cubic-bezier(0.4,0,0.6,1)_infinite]"></span>
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary/15 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '0.5s' }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/70" style={{ boxShadow: '0 0 6px rgba(139,105,20,0.4)' }}></span>
            </span>
            <span className="text-[10px] font-caption text-primary/80 tracking-[0.12em] uppercase">
              Next drop {formatDistanceToNow(nextRefresh, { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-5">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-muted/40 border border-border/30 rounded-xl h-11">
              <TabsTrigger value="curated" className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] font-caption data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all">
                <Sparkles className="w-3 h-3" />
                Your 3
              </TabsTrigger>
              <TabsTrigger value="plans" className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] font-caption data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all">
                <Moon className="w-3 h-3" />
                Plans
              </TabsTrigger>
              <TabsTrigger value="pool" className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] font-caption data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all">
                <Users className="w-3 h-3" />
                Explore
              </TabsTrigger>
            </TabsList>

            {/* Curated Matches Tab */}
            <TabsContent value="curated" className="space-y-4">
              <MatchRevealCeremony matchCount={displayCurated.length} storageKey="monark-sunday-reveal">

              {/* Featured Match — spotlight card */}
              {displayCurated[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="relative cursor-pointer group"
                  onClick={() => setSelectedMatch(displayCurated[0])}
                >
                  <Card className="relative overflow-hidden border-primary/10 bg-card shadow-[0_2px_20px_rgba(90,70,50,0.08)] hover:shadow-[0_8px_32px_rgba(90,70,50,0.14)] transition-shadow duration-500">
                    <div className="aspect-[4/5] relative">
                      <ImageWithFallback
                        src={displayCurated[0].photos?.[0] || '/placeholder.svg'}
                        alt={displayCurated[0].name || 'Match'}
                        loading="eager"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                      
                      {/* Top badges */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] font-caption shadow-lg flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Top Match
                        </span>
                        {displayCurated[0].compatibility_score && (
                          <span className="bg-foreground/80 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide">
                            {Math.round(displayCurated[0].compatibility_score * 100)}% Match
                          </span>
                        )}
                      </div>
                      
                      {/* Bottom info */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-2xl font-editorial text-white tracking-tight mb-0.5">
                          {displayCurated[0].name}, {displayCurated[0].age}
                        </h3>
                        <p className="text-white/70 text-sm font-body flex items-center gap-1 mb-3">
                          <MapPin className="w-3 h-3" />
                          {displayCurated[0].location}
                        </p>
                        {displayCurated[0].match_reason && (
                          <p className="text-white/80 text-xs font-body bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-lg inline-block border border-white/10">
                            {displayCurated[0].match_reason}
                          </p>
                        )}
                      </div>

                      {/* Hover label */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <span className="bg-card/95 backdrop-blur-sm text-foreground text-[10px] uppercase tracking-[0.2em] font-caption px-4 py-2 rounded-full shadow-lg border border-border/50">
                          See full profile
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
              
              {/* Secondary curated matches */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {displayCurated.slice(1).map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="cursor-pointer group"
                    onClick={() => setSelectedMatch(match)}
                  >
                    <Card className="overflow-hidden border-border/30 bg-card shadow-[0_2px_12px_rgba(90,70,50,0.06)] hover:shadow-[0_6px_24px_rgba(90,70,50,0.12)] transition-shadow duration-500">
                      <div className="aspect-[3/4] relative">
                        <ImageWithFallback
                          src={match.photos?.[0] || '/placeholder.svg'}
                          alt={match.name || 'Match'}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        
                        {match.compatibility_score && (
                          <span className="absolute top-2.5 right-2.5 bg-foreground/80 text-white backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wide shadow-md">
                            {Math.round(match.compatibility_score * 100)}% Match
                          </span>
                        )}
                        
                        <div className="absolute bottom-0 left-0 right-0 p-3.5">
                          <p className="font-editorial text-white text-lg tracking-tight">
                            {match.name}, {match.age}
                          </p>
                          <p className="text-white/60 text-[11px] font-body flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {match.location}
                          </p>
                        </div>

                        {/* Hover label */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <span className="bg-card/95 backdrop-blur-sm text-foreground text-[9px] uppercase tracking-[0.2em] font-caption px-3 py-1.5 rounded-full shadow-md border border-border/50">
                            See profile
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
              </MatchRevealCeremony>
            </TabsContent>

            {/* Rhythm Plans Tab */}
            <TabsContent value="plans" className="space-y-4">
              <WeeklyRhythmPlans />
            </TabsContent>

            {/* Pool Tab */}
            <TabsContent value="pool" className="space-y-4">
              <div className="text-center pb-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-caption">
                  More compatible people this week
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {displayPool.map((match) => (
                  <PoolCard 
                    key={match.id}
                    match={match}
                    onClick={() => setSelectedMatch(match)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
      </div>

      {/* Match Detail Modal */}
      <MatchDetailModal
        match={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onLike={handleLike}
        onPass={handlePass}
        isProcessing={processingId === selectedMatch?.id}
        isCurated={selectedMatch?.isCurated}
      />

      {/* Mutual Match Celebration */}
      <MutualMatchModal
        isOpen={!!mutualMatch}
        onClose={() => setMutualMatch(null)}
        matchName={mutualMatch?.name || ''}
        matchPhoto={mutualMatch?.photo}
        onStartChat={handleStartChat}
        onPlanDate={handlePlanDate}
      />
    </div>
  );
};

// Curated match card - larger, more prominent
const MatchCard = ({ match, onClick }: { match: UnifiedMatch; onClick: () => void }) => {
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-elevated transition-all duration-500 border-primary/15 group"
      onClick={onClick}
    >
      <div className="flex">
        <div className="w-32 h-40 flex-shrink-0 overflow-hidden">
          <ImageWithFallback
            src={match.photos?.[0] || '/placeholder.svg'}
            alt={match.name || 'Match'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        
        <CardContent className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-foreground text-lg">
                {match.name}, {match.age}
              </h3>
              {match.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {match.location}
                </p>
              )}
            </div>
            {match.compatibility_score && (
              <Badge className="bg-primary/15 text-primary border-none">
                <Target className="w-3 h-3 mr-1" />
                {Math.round(match.compatibility_score * 100)}%
              </Badge>
            )}
          </div>

          {match.match_reason && (
            <p className="text-sm text-primary mb-2 line-clamp-1">
              <Sparkles className="w-3 h-3 inline mr-1" />
              {match.match_reason}
            </p>
          )}

          <div className="flex flex-wrap gap-1 mb-3">
            {match.interests?.slice(0, 3).map((interest) => (
              <Badge key={interest} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
          </div>

          <div className="flex items-center text-sm text-primary font-medium">
            View Full Profile
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

const PoolCard = ({ match, onClick }: { match: UnifiedMatch; onClick: () => void }) => {
  return (
    <Card 
      className="overflow-hidden cursor-pointer border-border/30 bg-card shadow-[0_2px_12px_rgba(90,70,50,0.06)] hover:shadow-[0_6px_24px_rgba(90,70,50,0.12)] transition-shadow duration-500 group"
      onClick={onClick}
    >
      <div className="relative aspect-[3/4]">
        <ImageWithFallback
          src={match.photos?.[0] || '/placeholder.svg'}
          alt={match.name || 'Match'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Hover overlay with tap hint */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 text-white text-xs font-medium bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Heart className="w-3 h-3" />
            Tap to view
          </span>
        </div>

        {match.compatibility_score && (
          <span className="absolute top-2.5 right-2.5 bg-black/40 text-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-caption tracking-wider">
            {Math.round(match.compatibility_score * 100)}%
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <p className="font-editorial text-white text-sm tracking-tight">
            {match.name}, {match.age}
          </p>
          {match.location && (
            <p className="text-white/60 text-[11px] font-body flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5" />
              {match.location}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
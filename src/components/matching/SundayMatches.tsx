import { useState, useMemo } from 'react';
import { useCuratedMatches, CuratedMatch } from '@/hooks/useCuratedMatches';
import { useDatingPool, DatingPoolMatch } from '@/hooks/useDatingPool';
import { MatchDetailModal } from './MatchDetailModal';
import { MutualMatchModal } from './MutualMatchModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Sparkles, Users, Calendar, Heart, MapPin, 
  ChevronRight, Target, Sun, Coffee, Wine, Palette, Music, Compass,
  Moon
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { WeeklyRhythmPlans } from '@/components/weekly/WeeklyRhythmPlans';

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
    passPoolMatch 
  } = useDatingPool();

  const [selectedMatch, setSelectedMatch] = useState<UnifiedMatch | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [mutualMatch, setMutualMatch] = useState<{ name: string; photo?: string; conversationId?: string } | null>(null);
  const [activeTab, setActiveTab] = useState('curated');
  
  // Check if this is the user's first visit to show welcome tip - must be before any early returns
  const [showWelcomeTip, setShowWelcomeTip] = useState(() => {
    return !sessionStorage.getItem('monark-welcome-tip-dismissed');
  });

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
    
    setProcessingId(selectedMatch.id);
    
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

    setProcessingId(null);
    setSelectedMatch(null);
  };

  const handlePass = async () => {
    if (!selectedMatch) return;
    
    setProcessingId(selectedMatch.id);
    
    if (selectedMatch.isCurated) {
      await passCurated(selectedMatch.id);
    } else {
      await passPoolMatch(selectedMatch.id);
    }

    setProcessingId(null);
    setSelectedMatch(null);
  };

  const handleStartChat = () => {
    if (mutualMatch?.conversationId) {
      navigate(`/chat/${mutualMatch.conversationId}`);
    }
    setMutualMatch(null);
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

  const dismissWelcomeTip = () => {
    sessionStorage.setItem('monark-welcome-tip-dismissed', 'true');
    setShowWelcomeTip(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Tip Banner */}
      {showWelcomeTip && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-foreground">
                Welcome to MonArk! View and edit your profile anytime in the <strong>Profile</strong> tab below.
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={dismissWelcomeTip}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              Got it
            </Button>
          </div>
        </div>
      )}

      {/* Demo Mode Banner */}
      {isUsingDemoData && (
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b border-primary/20 px-4 py-3">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm text-foreground">
              ✨ <span className="font-medium">Preview Mode</span> — These are example matches to show you what to expect
            </p>
          </div>
        </div>
      )}

      {/* Hero Header - User Centered Design */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="px-4 py-8 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sun className="w-4 h-4" />
            Your Weekly Matches
          </div>
          
          <h1 className="text-3xl font-serif text-foreground mb-2">
            Curated Just For You
          </h1>
          
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            {displayCurated.length} hand-picked matches based on your values and what matters most to you
          </p>
          
          <Badge variant="outline" className="flex items-center gap-1 mx-auto w-fit">
            <Calendar className="w-3 h-3" />
            Refreshes {formatDistanceToNow(nextRefresh, { addSuffix: true })}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* This section removed - we always show demo data now */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="curated" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Your 3</span>
                <span className="sm:hidden">Matches</span>
              </TabsTrigger>
              <TabsTrigger value="plans" className="flex items-center gap-2">
                <Moon className="w-4 h-4" />
                <span className="hidden sm:inline">Date Plans</span>
                <span className="sm:hidden">Plans</span>
              </TabsTrigger>
              <TabsTrigger value="pool" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Explore</span>
                <span className="sm:hidden">Pool</span>
              </TabsTrigger>
            </TabsList>

            {/* Curated Matches Tab */}
            <TabsContent value="curated" className="space-y-6">
              {/* Featured Match - First one gets spotlight */}
              {displayCurated[0] && (
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl opacity-60" />
                  <Card 
                    className="relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 border-primary/30 bg-card"
                    onClick={() => setSelectedMatch(displayCurated[0])}
                  >
                    <div className="aspect-[4/5] relative">
                      <img
                        src={displayCurated[0].photos?.[0] || '/placeholder.svg'}
                        alt={displayCurated[0].name || 'Match'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Top badge */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        <Badge className="bg-primary text-primary-foreground px-3 py-1">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Top Match
                        </Badge>
                        {displayCurated[0].compatibility_score && (
                          <Badge className="bg-black/60 text-white border-none">
                            {Math.round(displayCurated[0].compatibility_score * 100)}% Match
                          </Badge>
                        )}
                      </div>
                      
                      {/* Bottom info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-serif text-white mb-1">
                          {displayCurated[0].name}, {displayCurated[0].age}
                        </h3>
                        <p className="text-white/80 flex items-center gap-1 mb-2">
                          <MapPin className="w-4 h-4" />
                          {displayCurated[0].location}
                        </p>
                        {displayCurated[0].match_reason && (
                          <p className="text-primary-foreground/90 text-sm bg-primary/80 backdrop-blur px-3 py-2 rounded-lg inline-block">
                            {displayCurated[0].match_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              )}
              
              {/* Other curated matches */}
              <div className="grid grid-cols-2 gap-4">
                {displayCurated.slice(1).map((match) => (
                  <Card 
                    key={match.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50"
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="aspect-[3/4] relative">
                      <img
                        src={match.photos?.[0] || '/placeholder.svg'}
                        alt={match.name || 'Match'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      
                      {match.compatibility_score && (
                        <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground border-none text-xs">
                          {Math.round(match.compatibility_score * 100)}%
                        </Badge>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="font-semibold text-white">
                          {match.name}, {match.age}
                        </p>
                        <p className="text-white/70 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {match.location}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Rhythm Plans Tab */}
            <TabsContent value="plans" className="space-y-4">
              <WeeklyRhythmPlans />
            </TabsContent>

            {/* Pool Tab */}
            <TabsContent value="pool" className="space-y-4">
              <div className="text-center pb-2">
                <p className="text-sm text-muted-foreground">
                  More compatible people to explore this week
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
      />
    </div>
  );
};

// Curated match card - larger, more prominent
const MatchCard = ({ match, onClick }: { match: UnifiedMatch; onClick: () => void }) => {
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-primary/20"
      onClick={onClick}
    >
      <div className="flex">
        {/* Photo */}
        <div className="w-32 h-40 flex-shrink-0">
          <img
            src={match.photos?.[0] || '/placeholder.svg'}
            alt={match.name || 'Match'}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content */}
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
              <Badge className="bg-primary/10 text-primary border-none">
                <Target className="w-3 h-3 mr-1" />
                {Math.round(match.compatibility_score * 100)}%
              </Badge>
            )}
          </div>

          {/* Match reason */}
          {match.match_reason && (
            <p className="text-sm text-primary mb-2 line-clamp-1">
              <Sparkles className="w-3 h-3 inline mr-1" />
              {match.match_reason}
            </p>
          )}

          {/* Interests preview */}
          <div className="flex flex-wrap gap-1 mb-3">
            {match.interests?.slice(0, 3).map((interest) => (
              <Badge key={interest} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
          </div>

          {/* View profile CTA */}
          <div className="flex items-center text-sm text-primary font-medium">
            View Full Profile
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

// Pool match card - compact grid style
const PoolCard = ({ match, onClick }: { match: UnifiedMatch; onClick: () => void }) => {
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="relative aspect-[3/4]">
        <img
          src={match.photos?.[0] || '/placeholder.svg'}
          alt={match.name || 'Match'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Compatibility badge */}
        {match.compatibility_score && (
          <Badge 
            className="absolute top-2 right-2 bg-black/60 text-white border-none text-xs"
          >
            {Math.round(match.compatibility_score * 100)}%
          </Badge>
        )}

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="font-semibold text-white text-sm">
            {match.name}, {match.age}
          </p>
          {match.location && (
            <p className="text-white/80 text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {match.location}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
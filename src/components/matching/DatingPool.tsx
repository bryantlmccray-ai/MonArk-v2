import { useState } from 'react';
import { useDatingPool } from '@/hooks/useDatingPool';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, X, MapPin, Briefcase, GraduationCap, Users, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const DatingPool = () => {
  const { pool, loading, likePoolMatch, passPoolMatch, pendingCount } = useDatingPool();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch which pool users have already liked/expressed interest in the current user
  const { data: theyLikedSet = new Set<string>() } = useQuery({
    queryKey: ['pool-they-liked', user?.id],
    queryFn: async () => {
      if (!user?.id) return new Set<string>();
      const poolUserIds = pool.map(m => m.pool_user_id).filter(Boolean);
      if (!poolUserIds.length) return new Set<string>();
      const { data } = await supabase
        .from('matches')
        .select('user_id')
        .eq('liked_user_id', user.id)
        .in('user_id', poolUserIds)
        .eq('is_mutual', false);
      return new Set<string>((data ?? []).map((r: any) => r.user_id));
    },
    enabled: !!user?.id && pool.length > 0,
    staleTime: 60_000,
  });

  const handleLike = async (matchId: string) => {
    setProcessingId(matchId);
    await likePoolMatch(matchId);
    setProcessingId(null);
  };

  const handlePass = async (matchId: string) => {
    setProcessingId(matchId);
    await passPoolMatch(matchId);
    setProcessingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground text-sm font-medium">
          <Users className="w-4 h-4" />
          Your Dating Pool
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Explore This Week
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Beyond your 3 curated matches, browse these 10 compatible people.
          Less personalized, but more choices.
        </p>
      </div>

      {/* Pool count */}
      <div className="text-center text-sm text-muted-foreground">
        {pendingCount} of 10 remaining this week
      </div>

      {/* Pool Grid or Empty State */}
      {pool.length === 0 ? (
        <div className="text-center py-12 bg-card/50 rounded-xl border border-border/50">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
            <Users className="w-8 h-8 text-secondary-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Your matches are being curated
          </h3>
          <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
            We're reviewing profiles that align with your relational style. We'll notify you when your first introductions are ready.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {pool.map((match) => (
            <Card 
              key={match.id} 
              className={`overflow-hidden cursor-pointer transition-all duration-200 ${
                expandedId === match.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setExpandedId(expandedId === match.id ? null : match.id)}
            >
              <div className="relative aspect-[3/4]">
                <img
                  src={match.profile.photos?.[0] || '/placeholder.svg'}
                  alt={match.profile.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Basic info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-semibold text-white">
                    {match.profile.name}, {match.profile.age}
                  </p>
                  {match.profile.location && (
                    <p className="text-white/80 text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {match.profile.location}
                    </p>
                  )}
                </div>

                {/* They liked you badge — highest conversion signal */}
                {theyLikedSet.has(match.pool_user_id) && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-semibold shadow-md">
                    <Sparkles className="w-3 h-3" />
                    Interested in you
                  </div>
                )}
                {/* Compatibility badge */}
                {match.compatibility_score && (
                  <Badge 
                    className="absolute top-2 right-2 bg-foreground/80 text-white border-none text-xs font-medium backdrop-blur-md"
                  >
                    {Math.round(match.compatibility_score * 100)}% Match
                  </Badge>
                )}
              </div>

              {/* Expanded content */}
              {expandedId === match.id && (
                <CardContent className="p-3 space-y-3">
                  {/* Bio */}
                  {match.profile.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {match.profile.bio}
                    </p>
                  )}

                  {/* Quick info */}
                  <div className="flex flex-wrap gap-1">
                    {match.profile.occupation && (
                      <Badge variant="secondary" className="text-xs">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {match.profile.occupation}
                      </Badge>
                    )}
                  </div>

                  {/* Interests */}
                  <div className="flex flex-wrap gap-1">
                    {match.profile.interests?.slice(0, 3).map((interest) => (
                      <Badge key={interest} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={processingId === match.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePass(match.id);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-pink-500 hover:bg-pink-600"
                      disabled={processingId === match.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(match.id);
                      }}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { 
  Users, ChevronLeft, ChevronRight, Heart, X, 
  Sparkles, MapPin, Briefcase, GraduationCap, Calendar,
  Check, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CurationUser {
  id: string;
  user_id: string;
  priority: number;
  needs_curation: boolean;
  user_profile?: {
    bio: string;
    age: number;
    location: string;
    interests: string[];
    photos: string[];
    gender_identity: string;
  };
  profile?: {
    name: string;
    email: string;
  };
}

interface PotentialMatch {
  user_id: string;
  name?: string;
  bio?: string;
  age?: number;
  location?: string;
  interests?: string[];
  photos?: string[];
  occupation?: string;
  education_level?: string;
  compatibility_score: number;
}

interface CuratedMatch {
  id: string;
  matched_user_id: string;
  match_reason: string;
  compatibility_score: number;
  matched_profile?: {
    bio: string;
    age: number;
    location: string;
    interests: string[];
    photos: string[];
  };
  matched_name?: {
    name: string;
  };
}

export default function AdminMatchCuration() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  
  const [queue, setQueue] = useState<CurationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<CurationUser | null>(null);
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [curatedMatches, setCuratedMatches] = useState<CuratedMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [addingMatch, setAddingMatch] = useState<string | null>(null);
  const [matchReason, setMatchReason] = useState('');
  const [curationNotes, setCurationNotes] = useState('');

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      loadCurationQueue();
    }
  }, [adminLoading, isAdmin]);

  const loadCurationQueue = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('match-delivery', {
        body: { action: 'get_curation_queue' }
      });

      if (error) throw error;
      setQueue(data.queue || []);
    } catch (error) {
      console.error('Error loading curation queue:', error);
      toast.error('Failed to load curation queue');
    } finally {
      setLoading(false);
    }
  };

  const selectUser = async (user: CurationUser) => {
    setSelectedUser(user);
    setLoadingMatches(true);
    setCuratedMatches([]);
    setPotentialMatches([]);

    try {
      // Load current curated matches and potential matches
      const [matchesRes, potentialRes] = await Promise.all([
        supabase.functions.invoke('match-delivery', {
          body: { action: 'get_user_matches', user_id: user.user_id }
        }),
        supabase.functions.invoke('match-delivery', {
          body: { action: 'get_potential_matches', user_id: user.user_id }
        })
      ]);

      if (matchesRes.error) throw matchesRes.error;
      if (potentialRes.error) throw potentialRes.error;

      setCuratedMatches(matchesRes.data.curated || []);
      setPotentialMatches(potentialRes.data.candidates || []);
    } catch (error) {
      console.error('Error loading matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoadingMatches(false);
    }
  };

  const addCuratedMatch = async (targetUserId: string, score: number) => {
    if (!selectedUser) return;
    
    setAddingMatch(targetUserId);
    try {
      const { data, error } = await supabase.functions.invoke('match-delivery', {
        body: {
          action: 'add_curated_match',
          user_id: selectedUser.user_id,
          target_user_id: targetUserId,
          match_reason: matchReason || 'Curated by admin based on compatibility',
          curation_notes: curationNotes,
          compatibility_score: score
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('Match added successfully');
      setMatchReason('');
      setCurationNotes('');
      
      // Refresh matches
      await selectUser(selectedUser);
    } catch (error: any) {
      console.error('Error adding match:', error);
      toast.error(error.message || 'Failed to add match');
    } finally {
      setAddingMatch(null);
    }
  };

  const removeCuratedMatch = async (matchedUserId: string) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase.functions.invoke('match-delivery', {
        body: {
          action: 'remove_curated_match',
          user_id: selectedUser.user_id,
          target_user_id: matchedUserId
        }
      });

      if (error) throw error;
      toast.success('Match removed');
      await selectUser(selectedUser);
    } catch (error) {
      console.error('Error removing match:', error);
      toast.error('Failed to remove match');
    }
  };

  const generatePool = async () => {
    if (!selectedUser) return;

    try {
      const { data, error } = await supabase.functions.invoke('match-delivery', {
        body: { action: 'generate_pool', user_id: selectedUser.user_id }
      });

      if (error) throw error;
      toast.success(`Generated dating pool with ${data.pool_size} candidates`);
    } catch (error) {
      console.error('Error generating pool:', error);
      toast.error('Failed to generate pool');
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Match Curation</h1>
              <p className="text-sm text-muted-foreground">Curate weekly matches for users</p>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {queue.length} users need curation
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Curation Queue */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Curation Queue</CardTitle>
              <CardDescription>Users waiting for manual match curation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[70vh] overflow-y-auto">
              {queue.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  All caught up! No users need curation.
                </p>
              ) : (
                queue.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => selectUser(user)}
                    className={`w-full p-3 rounded-lg border transition-colors text-left ${
                      selectedUser?.id === user.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.user_profile?.photos?.[0]} />
                        <AvatarFallback>
                          {user.profile?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {user.profile?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.user_profile?.age} • {user.user_profile?.location || 'No location'}
                        </p>
                      </div>
                      {user.priority > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Priority {user.priority}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Main Curation Area */}
          <Card className="lg:col-span-2">
            {selectedUser ? (
              <>
                <CardHeader className="border-b border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={selectedUser.user_profile?.photos?.[0]} />
                        <AvatarFallback className="text-xl">
                          {selectedUser.profile?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{selectedUser.profile?.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>{selectedUser.user_profile?.age} years old</span>
                          {selectedUser.user_profile?.location && (
                            <>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              <span>{selectedUser.user_profile.location}</span>
                            </>
                          )}
                        </CardDescription>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedUser.user_profile?.interests?.slice(0, 5).map((interest) => (
                            <Badge key={interest} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={curatedMatches.length >= 3 ? 'default' : 'outline'}>
                        {curatedMatches.length}/3 curated
                      </Badge>
                      <Button size="sm" variant="outline" onClick={generatePool}>
                        Generate Pool
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {loadingMatches ? (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Current Curated Matches */}
                      {curatedMatches.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Curated Matches ({curatedMatches.length}/3)
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {curatedMatches.map((match) => (
                              <div key={match.id} className="relative p-3 rounded-lg border border-primary/30 bg-primary/5">
                                <button
                                  onClick={() => removeCuratedMatch(match.matched_user_id)}
                                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage src={match.matched_profile?.photos?.[0]} />
                                    <AvatarFallback>
                                      {match.matched_name?.name?.charAt(0) || 'M'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {match.matched_name?.name || 'Unknown'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {Math.round((match.compatibility_score || 0) * 100)}% match
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Match Reason Input */}
                      {curatedMatches.length < 3 && (
                        <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                          <Input
                            placeholder="Match reason (e.g., 'Both love hiking and photography')"
                            value={matchReason}
                            onChange={(e) => setMatchReason(e.target.value)}
                          />
                          <Textarea
                            placeholder="Curation notes (internal)"
                            value={curationNotes}
                            onChange={(e) => setCurationNotes(e.target.value)}
                            rows={2}
                          />
                        </div>
                      )}

                      {/* Potential Matches */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-pink-500" />
                          Potential Matches ({potentialMatches.length})
                        </h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {potentialMatches.map((candidate) => (
                            <div
                              key={candidate.user_id}
                              className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                            >
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={candidate.photos?.[0]} />
                                <AvatarFallback>
                                  {candidate.name?.charAt(0) || 'C'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-foreground">
                                    {candidate.name || 'Unknown'}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round((candidate.compatibility_score || 0) * 100)}%
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                                  {candidate.age && <span>{candidate.age} y/o</span>}
                                  {candidate.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {candidate.location}
                                    </span>
                                  )}
                                  {candidate.occupation && (
                                    <span className="flex items-center gap-1">
                                      <Briefcase className="w-3 h-3" />
                                      {candidate.occupation}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {candidate.interests?.slice(0, 3).map((interest) => (
                                    <Badge key={interest} variant="secondary" className="text-xs">
                                      {interest}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                disabled={curatedMatches.length >= 3 || addingMatch === candidate.user_id}
                                onClick={() => addCuratedMatch(candidate.user_id, candidate.compatibility_score)}
                              >
                                {addingMatch === candidate.user_id ? (
                                  <LoadingSpinner className="w-4 h-4" />
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 mr-1" />
                                    Add
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a user from the queue to start curating their matches
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import {
  Users, Heart, X, Sparkles, MapPin, Brain,
  ShieldAlert, CheckCircle2, Clock, ArrowLeft,
  ThumbsUp, ThumbsDown, Flag, RefreshCw, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AIDecision {
  id: string;
  user_id: string;
  match_user_id: string;
  compatibility_score: number;
  match_reason: string;
  curator_confidence: number;
  curator_flags: string[];
  curation_model: string;
  status: string;
  position: number;
  week_start: string;
  created_at: string;
  admin_override?: string;
  admin_flag?: string;
  user_profile?: {
    bio: string;
    age: number;
    location: string;
    interests: string[];
    photos: string[];
  };
  matched_profile?: {
    bio: string;
    age: number;
    location: string;
    interests: string[];
    photos: string[];
  };
  user_name?: string;
  matched_name?: string;
}

type FilterMode = 'flagged' | 'low_confidence' | 'all' | 'overridden';

export default function AdminMatchCuration() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AIDecision | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('flagged');
  const [overrideNote, setOverrideNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!adminLoading && isAdmin) loadDecisions();
  }, [adminLoading, isAdmin, filterMode]);

  const loadDecisions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('curated_matches')
        .select(`
          *,
          user_profile:user_profiles!curated_matches_user_id_fkey(bio, age, location, interests, photos),
          matched_profile:user_profiles!curated_matches_match_user_id_fkey(bio, age, location, interests, photos),
          user_name:profiles!curated_matches_user_id_fkey(name),
          matched_name:profiles!curated_matches_match_user_id_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterMode === 'flagged') {
        query = query.not('curator_flags', 'eq', '{}');
      } else if (filterMode === 'low_confidence') {
        query = query.lt('curator_confidence', 0.65);
      } else if (filterMode === 'overridden') {
        query = query.not('admin_override', 'is', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDecisions((data || []) as AIDecision[]);
    } catch (err) {
      console.error('Error loading AI decisions:', err);
      toast.error('Failed to load AI decisions');
    } finally {
      setLoading(false);
    }
  };

  const applyOverride = async (action: 'approve' | 'reject' | 'flag') => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const updatePayload: Record<string, any> = {
        admin_override: action,
        admin_flag: overrideNote || null,
      };
      if (action === 'reject') updatePayload.status = 'admin_rejected';
      if (action === 'approve') updatePayload.status = 'admin_approved';

      const { error } = await supabase
        .from('curated_matches')
        .update(updatePayload)
        .eq('id', selected.id);

      if (error) throw error;

      toast.success(
        action === 'approve' ? 'Match approved' :
        action === 'reject' ? 'Match removed from user queue' :
        'Match flagged for review'
      );
      setOverrideNote('');
      setSelected(null);
      loadDecisions();
    } catch (err: any) {
      toast.error(err.message || 'Override failed');
    } finally {
      setSubmitting(false);
    }
  };

  const confidenceBadge = (score: number) => {
    if (score >= 0.8) return <Badge className="bg-green-500/10 text-green-700 border-green-500/30">High confidence</Badge>;
    if (score >= 0.65) return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">Medium confidence</Badge>;
    return <Badge className="bg-destructive/10 text-destructive border-destructive/30">Low confidence</Badge>;
  };

  const flagCount = decisions.filter(d => d.curator_flags?.length > 0).length;
  const lowConfCount = decisions.filter(d => (d.curator_confidence ?? 1) < 0.65).length;
  const overriddenCount = decisions.filter(d => d.admin_override).length;

  if (adminLoading || (loading && decisions.length === 0)) {
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
            <p className="text-muted-foreground">You don’t have permission to access this page.</p>
            <Button onClick={() => navigate('/')} className="mt-4">Go Home</Button>
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
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Match Review
              </h1>
              <p className="text-sm text-muted-foreground">
                Review AI curation decisions — flag edge cases or override picks
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadDecisions} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3 overflow-x-auto">
          {([
            { key: 'flagged', label: 'AI Flagged', count: flagCount, icon: ShieldAlert },
            { key: 'low_confidence', label: 'Low Confidence', count: lowConfCount, icon: Clock },
            { key: 'all', label: 'All Decisions', count: decisions.length, icon: Eye },
            { key: 'overridden', label: 'Overridden', count: overriddenCount, icon: CheckCircle2 },
          ] as { key: FilterMode; label: string; count: number; icon: any }[]).map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilterMode(key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filterMode === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filterMode === key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Decision List */}
            <div className="lg:col-span-1 space-y-2 max-h-[80vh] overflow-y-auto pr-1">
              {decisions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-green-500 mb-3" />
                    <p className="font-medium text-foreground">All clear</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      No AI decisions match this filter right now.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                decisions.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setSelected(d); setOverrideNote(''); }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selected?.id === d.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40 bg-card'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex -space-x-2 shrink-0">
                        <Avatar className="w-8 h-8 border-2 border-background">
                          <AvatarImage src={d.user_profile?.photos?.[0]} />
                          <AvatarFallback className="text-xs">{(d.user_name as any)?.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <Avatar className="w-8 h-8 border-2 border-background">
                          <AvatarImage src={d.matched_profile?.photos?.[0]} />
                          <AvatarFallback className="text-xs">{(d.matched_name as any)?.name?.[0] || 'M'}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {(d.user_name as any)?.name || 'User'} → {(d.matched_name as any)?.name || 'Match'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((d.compatibility_score || 0) * 100)}% match · pos #{d.position}
                        </p>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {d.curator_flags?.length > 0 && (
                            <Badge variant="destructive" className="text-xs px-1 py-0">
                              <Flag className="w-2.5 h-2.5 mr-0.5" />
                              {d.curator_flags.length} flag{d.curator_flags.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                          {(d.curator_confidence ?? 1) < 0.65 && (
                            <Badge className="text-xs px-1 py-0 bg-yellow-500/10 text-yellow-700 border-yellow-500/30">
                              Low conf
                            </Badge>
                          )}
                          {d.admin_override && (
                            <Badge className="text-xs px-1 py-0 bg-blue-500/10 text-blue-700 border-blue-500/30">
                              {d.admin_override}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Decision Detail + Override Panel */}
            <div className="lg:col-span-2">
              {selected ? (
                <Card>
                  <CardHeader className="border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          AI Decision Detail
                        </CardTitle>
                        <CardDescription>
                          Generated by {selected.curation_model || 'ai-match-curator-v1'} ·{' '}
                          {new Date(selected.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {confidenceBadge(selected.curator_confidence ?? 1)}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6 space-y-6">
                    {/* Pair display */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={selected.user_profile?.photos?.[0]} />
                          <AvatarFallback>{(selected.user_name as any)?.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium text-sm">{(selected.user_name as any)?.name || 'User'}</p>
                        {selected.user_profile?.age && (
                          <p className="text-xs text-muted-foreground">{selected.user_profile.age} y/o</p>
                        )}
                        {selected.user_profile?.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {selected.user_profile.location}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 justify-center">
                          {selected.user_profile?.interests?.slice(0, 3).map(i => (
                            <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <Heart className="w-6 h-6 text-primary" />
                        <span className="text-lg font-bold text-primary">
                          {Math.round((selected.compatibility_score || 0) * 100)}%
                        </span>
                        <span className="text-xs text-muted-foreground">#{ selected.position}</span>
                      </div>

                      <div className="flex-1 flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={selected.matched_profile?.photos?.[0]} />
                          <AvatarFallback>{(selected.matched_name as any)?.name?.[0] || 'M'}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium text-sm">{(selected.matched_name as any)?.name || 'Match'}</p>
                        {selected.matched_profile?.age && (
                          <p className="text-xs text-muted-foreground">{selected.matched_profile.age} y/o</p>
                        )}
                        {selected.matched_profile?.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {selected.matched_profile.location}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 justify-center">
                          {selected.matched_profile?.interests?.slice(0, 3).map(i => (
                            <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* AI reasoning */}
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        AI Match Reasoning
                      </p>
                      <p className="text-sm text-foreground">{selected.match_reason}</p>
                    </div>

                    {/* Flags */}
                    {selected.curator_flags?.length > 0 && (
                      <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                        <p className="text-xs font-semibold text-destructive uppercase tracking-wide mb-2 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          AI Flags
                        </p>
                        <ul className="space-y-1">
                          {selected.curator_flags.map((flag, i) => (
                            <li key={i} className="text-sm text-destructive/80 flex items-start gap-1.5">
                              <span className="mt-0.5">•</span>
                              {flag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Existing override */}
                    {selected.admin_override && (
                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                          Admin Override: {selected.admin_override}
                        </p>
                        {selected.admin_flag && (
                          <p className="text-sm text-muted-foreground">{selected.admin_flag}</p>
                        )}
                      </div>
                    )}

                    {/* Override controls */}
                    <div className="space-y-3 pt-2 border-t border-border">
                      <p className="text-sm font-medium text-foreground">Admin Action</p>
                      <Textarea
                        placeholder="Add a note about this decision (optional)..."
                        value={overrideNote}
                        onChange={e => setOverrideNote(e.target.value)}
                        rows={2}
                      />
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          disabled={submitting}
                          onClick={() => applyOverride('approve')}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1.5" />
                          Approve pick
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          disabled={submitting}
                          onClick={() => applyOverride('reject')}
                        >
                          <ThumbsDown className="w-4 h-4 mr-1.5" />
                          Remove pick
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-yellow-500/40 text-yellow-700 hover:bg-yellow-50"
                          disabled={submitting}
                          onClick={() => applyOverride('flag')}
                        >
                          <Flag className="w-4 h-4 mr-1.5" />
                          Flag for later
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium text-foreground">Select an AI decision to review</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Approve, reject, or flag any pick the AI made this week
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

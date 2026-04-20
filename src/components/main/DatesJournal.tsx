import React, { useState } from 'react';
import { Calendar, Star, Sparkles, BookOpen, X, Trophy, Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RifInsightsCard } from '@/components/rif/RifInsightsCard';
import { toast } from 'sonner';

interface DatesJournalProps {
      onStartDebrief: () => void;
      initialTab?: 'dates' | 'ark';
      onDateCompleted?: (partnerName?: string) => void;
}

interface LocalEntry {
      id: string;
      text: string;
      date: string;
}

// --- Milestones section ---
const MILESTONE_DEFINITIONS = [
    {
            id: 'first-match',
            icon: Heart,
            title: 'First Match',
            description: 'You received your first curated match - your journey begins.',
            color: 'bg-pink-500/10 border-pink-500/20 text-pink-700',
            iconColor: 'text-pink-500',
    },
    {
            id: 'first-date',
            icon: Calendar,
            title: 'First Date',
            description: 'You completed your first date and added a journal entry.',
            color: 'bg-primary/10 border-primary/20 text-primary',
            iconColor: 'text-primary',
    },
    {
            id: 'five-dates',
            icon: Star,
            title: '5 Dates Logged',
            description: 'Five dates reflected on - you are building real momentum.',
            color: 'bg-amber-500/10 border-amber-500/20 text-amber-700',
            iconColor: 'text-amber-500',
    },
    {
            id: 'rif-complete',
            icon: Trophy,
            title: 'RIF Complete',
            description: 'Your Relational Intelligence Framework profile is fully built.',
            color: 'bg-green-500/10 border-green-500/20 text-green-700',
            iconColor: 'text-green-600',
    },
    {
            id: 'shareable',
            icon: Share2,
            title: 'Milestone Shared',
            description: 'You shared a milestone card - your story inspires others.',
            color: 'bg-violet-500/10 border-violet-500/20 text-violet-700',
            iconColor: 'text-violet-500',
    },
    ];

const MilestonesSection: React.FC<{ completedDateCount: number }> = ({ completedDateCount }) => {
      const { user } = useAuth();

      const { data: rifProfile } = useQuery({
    queryKey: ['rif-profile-milestones', user?.id],
              queryFn: async () => {
                        if (!user?.id) return null;
                        const { data } = await supabase
                          .from('rif_profiles')
                          .select('id')
                          .eq('user_id', user.id)
                          .maybeSingle();
                        return data;
              },
              enabled: !!user?.id,
      });

      const { data: matchCount = 0 } = useQuery({
              queryKey: ['match-count-milestones', user?.id],
              queryFn: async () => {
                        if (!user?.id) return 0;
                        const { count } = await supabase
                          .from('curated_matches' as any)
                          .select('*', { count: 'exact', head: true })
                          .eq('user_id', user.id);
                        return count ?? 0;
              },
              enabled: !!user?.id,
      });

      const earnedIds = new Set<string>();
      if (matchCount > 0) earnedIds.add('first-match');
      if (completedDateCount >= 1) earnedIds.add('first-date');
      if (completedDateCount >= 5) earnedIds.add('five-dates');
      if (rifProfile) earnedIds.add('rif-complete');

      const earned = MILESTONE_DEFINITIONS.filter((m) => earnedIds.has(m.id));
      const upcoming = MILESTONE_DEFINITIONS.filter((m) => !earnedIds.has(m.id));

      return (
              <div className="space-y-4">
                  {earned.length > 0 && (
                          <div>
                                    <h4 className="text-[10px] font-caption text-muted-foreground/60 uppercase tracking-widest mb-3">
                                                Earned
                                    </h4>h4>
                                    <div className="space-y-2">
                                        {earned.map(({ id, icon: Icon, title, description, color, iconColor }) => (
                                            <div
                                                                key={id}
                                                                className={`flex items-start gap-3 p-4 rounded-2xl border ${color}`}
                                                              >
                                                            <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center shrink-0 mt-0.5">
                                                                              <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
                                                            </div>div>
                                                            <div className="flex-1 min-w-0">
                                                                              <p className="text-sm font-semibold leading-tight">{title}</p>p>
                                                                              <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{description}</p>p>
                                                            </div>div>
                                                            <Trophy className="w-4 h-4 opacity-60 shrink-0 mt-0.5" />
                                            </div>div>
                                          ))}
                                    </div>div>
                          </div>div>
                    )}
              
                  {upcoming.length > 0 && (
                          <div>
                                    <h4 className="text-[10px] font-caption text-muted-foreground/60 uppercase tracking-widest mb-3">
                                                Upcoming
                                    </h4>h4>
                                    <div className="space-y-2">
                                        {upcoming.map(({ id, icon: Icon, title, description }) => (
                                            <div
                                                                key={id}
                                                                className="flex items-start gap-3 p-4 rounded-2xl border border-border/40 bg-muted/30 opacity-60"
                                                              >
                                                            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                                                              <Icon className="w-4.5 h-4.5 text-muted-foreground" />
                                                            </div>div>
                                                            <div className="flex-1 min-w-0">
                                                                              <p className="text-sm font-semibold text-muted-foreground leading-tight">{title}</p>p>
                                                                              <p className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed">{description}</p>p>
                                                            </div>div>
                                            </div>div>
                                          ))}
                                    </div>div>
                          </div>div>
                    )}
              
                  {earned.length === 0 && upcoming.length === 0 && (
                          <div className="text-center py-10 bg-card rounded-2xl border border-border/60">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                                <Trophy className="w-5 h-5 text-primary" />
                                    </div>div>
                                    <p className="font-serif italic text-foreground text-base mb-2">Your milestones live here.</p>p>
                                    <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                                                Keep going - your first milestone is just around the corner.
                                    </p>p>
                          </div>div>
                    )}
              </div>div>
            );
};

export const DatesJournal: React.FC<DatesJournalProps> = ({ onStartDebrief, onDateCompleted }) => {
      const { user } = useAuth();
      const [showEntryModal, setShowEntryModal] = useState(false);
      const [entryText, setEntryText] = useState('');
      const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
      const [localEntries, setLocalEntries] = useState<LocalEntry[]>([]);
      const [activeTab, setActiveTab] = useState<'journal' | 'milestones'>('journal');
      const queryClient = useQueryClient();
    
      const { data: completedDates = [] } = useQuery({
              queryKey: ['date-journal', user?.id],
              queryFn: async () => {
                        if (!user?.id) return [];
                        const { data, error } = await supabase
                                    .from('date_journal')
                                    .select('*')
                                    .eq('user_id', user.id)
                                    .order('created_at', { ascending: false });
                        if (error) throw error;
                        return (data || []).map((d: any) => ({
                                    id: d.id,
                                    name: d.partner_name,
                                    date: d.date_completed || d.created_at,
                                    rating: d.rating || 0,
                                    venue: d.date_activity || d.date_title,
                                    hasReflection: !!d.reflection_notes,
                        }));
              },
              enabled: !!user?.id,
      });
    
      const saveEntryMutation = useMutation({
              mutationFn: async () => {
                        if (!user?.id || !entryText.trim()) throw new Error('Missing data');
                        const { error } = await supabase.from('date_journal').insert({
                                    user_id: user.id,
                                    reflection_notes: entryText.trim(),
                                    date_completed: entryDate,
                                    date_title: 'Journal entry',
                                    rating: 0,
                        });
                        if (error) throw error;
              },
              onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['date-journal', user?.id] });
                        toast.success('Entry saved');
                        setEntryText('');
                        setEntryDate(new Date().toISOString().slice(0, 10));
                        setShowEntryModal(false);
              },
              onError: () => toast.error('Failed to save entry'),
      });
    
      const handleSaveEntry = () => {
              if (!entryText.trim()) return;
              const newEntry: LocalEntry = {
                        id: Date.now().toString(),
                        text: entryText.trim(),
                        date: entryDate,
              };
              setLocalEntries(prev => [newEntry, ...prev]);
              saveEntryMutation.mutate();
              setEntryText('');
              setEntryDate(new Date().toISOString().slice(0, 10));
              setShowEntryModal(false);
      };
    
      return (
              <div className="bg-background">
                    <div className="max-w-2xl mx-auto space-y-6">
                        {/* Header */}
                            <div className="text-center space-y-2">
                                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold tracking-wider uppercase">
                                                  <BookOpen className="w-3 h-3" />
                                                  Your Journey
                                      </div>div>
                                      <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">Date Journal</h1>h1>
                                      <p className="text-muted-foreground font-body text-sm">Reflect on the moments that matter</p>p>
                            </div>div>
                    
                        {/* Tab Toggle: Journal | Milestones */}
                            <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit mx-auto">
                                {(['journal', 'milestones'] as const).map((t) => (
                              <button
                                                key={t}
                                                onClick={() => setActiveTab(t)}
                                                className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                                    activeTab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                              >
                                  {t === 'journal' ? (
                                                                  <span className="flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Journal</span>span>
                                                                ) : (
                                                                  <span className="flex items-center gap-1.5"><Trophy className="w-3 h-3" /> Milestones</span>span>
                                            )}
                              </button>button>
                            ))}
                            </div>div>
                    
                        {activeTab === 'milestones' ? (
                            <MilestonesSection completedDateCount={completedDates.length} />
                          ) : (
                            <>
                                {/* Local entries */}
                                {localEntries.length > 0 && (
                                              <div className="space-y-3">
                                                              <h3 className="text-base font-semibold text-foreground">Your Entries</h3>h3>
                                                  {localEntries.map((entry) => (
                                                                    <div key={entry.id} className="bg-card rounded-2xl p-4 border border-border/60 shadow-[0_1px_3px_rgba(100,80,60,0.04)]">
                                                                                        <p className="text-xs text-muted-foreground mb-1">
                                                                                            {new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                                                            </p>p>
                                                                                        <p className="text-sm text-foreground font-body leading-relaxed line-clamp-3">{entry.text}</p>p>
                                                                    </div>div>
                                                                  ))}
                                              </div>div>
                                        )}
                            
                                {/* MonArk Insights */}
                                        <RifInsightsCard />
                            
                                        <div className="space-y-3">
                                                      <h3 className="text-base font-semibold text-foreground">Completed Dates</h3>h3>
                                            {completedDates.length > 0 ? (
                                                completedDates.map((date: any) => (
                                                                      <div
                                                                                              key={date.id}
                                                                                              className="bg-card rounded-2xl p-4 border border-border/60 hover:border-primary/20 transition-all duration-200 group shadow-[0_1px_3px_rgba(100,80,60,0.04)] hover:shadow-[0_2px_8px_rgba(100,80,60,0.08)]"
                                                                                            >
                                                                                          <div className="flex justify-between items-start">
                                                                                                                <div className="flex items-center gap-3.5">
                                                                                                                                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                                                                                                                                                                  <Calendar className="w-5 h-5 text-primary" />
                                                                                                                                            </div>div>
                                                                                                                                        <div>
                                                                                                                                                                  <h3 className="text-foreground font-semibold text-[15px]">{date.name}</h3>h3>
                                                                                                                                                                  <p className="text-muted-foreground text-xs mt-0.5">
                                                                                                                                                                      {new Date(date.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                                                                                                                                                                              &bull; {date.venue}
                                                                                                                                                                      </p>p>
                                                                                                                                            </div>div>
                                                                                                                    </div>div>
                                                                                                                <div className="flex items-center gap-0.5">
                                                                                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                                                                                          <Star
                                                                                                                                                          key={star}
                                                                                                                                                          className={`w-3.5 h-3.5 ${
                                                                                                                                                                                            star <= date.rating ? 'text-primary fill-primary' : 'text-muted-foreground/25'
                                                                                                                                                              }`}
                                                                                                                                                        />
                                                                                                                        ))}
                                                                                                                    </div>div>
                                                                                              </div>div>
                                                                          {!date.hasReflection && onDateCompleted ? (
                                                                                                                      <div className="mt-3 space-y-1.5">
                                                                                                                                              <p className="text-xs text-muted-foreground italic font-body pl-0.5">
                                                                                                                                                                        How did {date.venue?.toLowerCase()} with {date.name} go?
                                                                                                                                                  </p>p>
                                                                                                                                              <Button
                                                                                                                                                                            variant="outline"
                                                                                                                                                                            size="sm"
                                                                                                                                                                            onClick={() => onDateCompleted(date.name)}
                                                                                                                                                                            className="w-full border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/30 transition-all h-9 text-xs"
                                                                                                                                                                          >
                                                                                                                                                                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                                                                                                                                                        Add Reflection
                                                                                                                                                  </Button>Button>
                                                                                                                          </div>div>
                                                                                                                    ) : date.hasReflection ? (
                                                                                                                      <Button
                                                                                                                                                  variant="ghost"
                                                                                                                                                  size="sm"
                                                                                                                                                  onClick={() => onStartDebrief()}
                                                                                                                                                  className="mt-3 w-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all h-9 text-xs"
                                                                                                                                                >
                                                                                                                                              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                                                                                                                                              View Reflection
                                                                                                                          </Button>Button>
                                                                                                                    ) : null}
                                                                      </div>div>
                                                                    ))
                                              ) : localEntries.length === 0 ? (
                                                <div className="text-center py-16 bg-card rounded-2xl border border-border/60">
                                                                  <div className="w-16 h-16 rounded-full bg-[#E8DED4] flex items-center justify-center mx-auto mb-4">
                                                                                      <span className="font-serif text-lg text-[#A08C6E] tracking-wide">MA</span>span>
                                                                  </div>div>
                                                                  <p className="font-editorial italic text-foreground text-xl mb-2">Your story starts here.</p>p>
                                                                  <p className="text-sm text-muted-foreground font-body max-w-xs mx-auto mb-6">
                                                                                      Every introduction, every date, every moment worth keeping - your journal holds it all.
                                                                  </p>p>
                                                                  <button
                                                                                          onClick={() => setShowEntryModal(true)}
                                                                                          className="inline-flex items-center px-6 py-2.5 bg-[#A08C6E] text-[#F0EBE3] font-body font-medium text-xs tracking-[0.15em] uppercase rounded-[40px] hover:bg-[#A08C6E]/90 transition-all"
                                                                                        >
                                                                                      ADD YOUR FIRST ENTRY
                                                                  </button>button>
                                                </div>div>
                                              ) : null}
                                        </div>div>
                            </>>
                          )}
                    </div>div>
              
                  {/* Entry Modal */}
                    <Dialog open={showEntryModal} onOpenChange={setShowEntryModal}>
                            <DialogContent className="sm:max-w-md">
                                      <DialogHeader>
                                                  <DialogTitle className="font-serif text-lg">New Journal Entry</DialogTitle>DialogTitle>
                                      </DialogHeader>DialogHeader>
                                      <div className="space-y-4 pt-2">
                                                  <div>
                                                                <label className="text-xs font-body text-muted-foreground mb-1 block">Date</label>label>
                                                                <Input
                                                                                    type="date"
                                                                                    value={entryDate}
                                                                                    onChange={(e) => setEntryDate(e.target.value)}
                                                                                    className="font-body text-sm"
                                                                                  />
                                                  </div>div>
                                                  <div>
                                                                <label className="text-xs font-body text-muted-foreground mb-1 block">What happened? How did it feel?</label>label>
                                                                <Textarea
                                                                                    value={entryText}
                                                                                    onChange={(e) => setEntryText(e.target.value)}
                                                                                    placeholder="Write about your experience..."
                                                                                    className="min-h-[120px] font-body text-sm resize-none"
                                                                                  />
                                                  </div>div>
                                                  <div className="flex gap-2 justify-end">
                                                                <Button variant="outline" onClick={() => setShowEntryModal(false)} className="text-sm">
                                                                                Cancel
                                                                </Button>Button>
                                                                <Button
                                                                                    onClick={handleSaveEntry}
                                                                                    disabled={!entryText.trim() || saveEntryMutation.isPending}
                                                                                    className="text-sm"
                                                                                  >
                                                                    {saveEntryMutation.isPending ? 'Saving...' : 'Save Entry'}
                                                                </Button>Button>
                                                  </div>div>
                                      </div>div>
                            </DialogContent>DialogContent>
                    </Dialog>Dialog>
              </div>div>
            );
};</></div>

import React, { useState } from 'react';
import { Calendar, Star, Sparkles, BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

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

export const DatesJournal: React.FC<DatesJournalProps> = ({ onStartDebrief, onDateCompleted }) => {
  const { user } = useAuth();
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryText, setEntryText] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [localEntries, setLocalEntries] = useState<LocalEntry[]>([]);

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

  const handleSaveEntry = () => {
    if (!entryText.trim()) return;
    setLocalEntries(prev => [{
      id: crypto.randomUUID(),
      text: entryText.trim(),
      date: entryDate,
    }, ...prev]);
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
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">Date Journal</h1>
          <p className="text-muted-foreground font-body text-sm">Reflect on the moments that matter</p>
        </div>

        {/* Local entries */}
        {localEntries.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-foreground">Your Entries</h3>
            {localEntries.map((entry) => (
              <div key={entry.id} className="bg-card rounded-2xl p-4 border border-border/60 shadow-[0_1px_3px_rgba(100,80,60,0.04)]">
                <p className="text-xs text-muted-foreground mb-1">
                  {new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-sm text-foreground font-body leading-relaxed line-clamp-3">{entry.text}</p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Completed Dates</h3>

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
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold text-[15px]">{date.name}</h3>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {new Date(date.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} • {date.venue}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= date.rating 
                            ? 'text-primary fill-primary' 
                            : 'text-muted-foreground/25'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {!date.hasReflection && onDateCompleted ? (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs text-muted-foreground italic font-body pl-0.5">
                      How did {date.venue?.toLowerCase()} with {date.name} go?
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDateCompleted(date.name)}
                      className="w-full border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/30 transition-all h-9 text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Add Reflection
                    </Button>
                  </div>
                ) : date.hasReflection ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStartDebrief()}
                    className="mt-3 w-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all h-9 text-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                    View Reflection
                  </Button>
                ) : null}
              </div>
            ))
          ) : localEntries.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border/60">
              {/* MA compass monogram */}
              <div className="w-16 h-16 rounded-full bg-[#E8DED4] flex items-center justify-center mx-auto mb-4">
                <span className="font-serif text-lg text-[#A08C6E] tracking-wide">MA</span>
              </div>
              <p className="font-editorial italic text-foreground text-xl mb-2">Your story starts here.</p>
              <p className="text-sm text-muted-foreground font-body max-w-xs mx-auto mb-6">
                Every introduction, every date, every moment worth keeping — your journal holds it all.
              </p>
              <button
                onClick={() => setShowEntryModal(true)}
                className="inline-flex items-center px-6 py-2.5 bg-[#A08C6E] text-[#F0EBE3] font-body font-medium text-xs tracking-[0.15em] uppercase rounded-[40px] hover:bg-[#A08C6E]/90 transition-all"
              >
                ADD YOUR FIRST ENTRY
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Entry Modal */}
      <Dialog open={showEntryModal} onOpenChange={setShowEntryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">New Journal Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-body text-muted-foreground mb-1 block">Date</label>
              <Input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="font-body text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-body text-muted-foreground mb-1 block">What happened? How did it feel?</label>
              <Textarea
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
                placeholder="Write about your experience..."
                className="min-h-[120px] font-body text-sm resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEntryModal(false)} className="text-sm">
                Cancel
              </Button>
              <Button onClick={handleSaveEntry} disabled={!entryText.trim()} className="text-sm">
                Save Entry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
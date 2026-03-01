import React from 'react';
import { Calendar, Star, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DatesJournalProps {
  onStartDebrief: () => void;
  initialTab?: 'dates' | 'ark';
  onDateCompleted?: (partnerName?: string) => void;
}

export const DatesJournal: React.FC<DatesJournalProps> = ({ onStartDebrief, onDateCompleted }) => {
  const completedDates = [
    { id: '1', name: 'Maya', date: '2024-01-15', rating: 5, venue: 'Coffee Shop', hasReflection: false },
    { id: '2', name: 'Jordan', date: '2024-01-10', rating: 4, venue: 'Art Gallery', hasReflection: true },
  ];

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

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Completed Dates</h3>

          {completedDates.length > 0 ? (
            completedDates.map((date) => (
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
                {!date.hasReflection && onDateCompleted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDateCompleted(date.name)}
                    className="mt-3 w-full border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/30 transition-all h-9 text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Add Reflection
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-14 bg-card rounded-2xl border border-border/60">
              <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-7 h-7 text-primary/50" />
              </div>
              <p className="text-foreground font-medium text-sm mb-1">No completed dates yet</p>
              <p className="text-xs text-muted-foreground">
                Accept a weekly option to plan your first date!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

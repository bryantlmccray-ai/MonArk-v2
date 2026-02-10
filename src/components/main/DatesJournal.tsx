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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wider uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            Your Journey
          </div>
          <h1 className="text-3xl font-serif text-foreground">Date Journal</h1>
          <p className="text-muted-foreground font-body text-base">Reflect on the moments that matter</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-foreground font-medium text-lg">Completed Dates</h3>
          </div>

          {completedDates.length > 0 ? (
            completedDates.map((date) => (
              <div
                key={date.id}
                className="bg-card rounded-xl p-5 border border-border hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold text-lg">{date.name}</h3>
                      <p className="text-muted-foreground text-sm mt-0.5">
                        {new Date(date.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} • {date.venue}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= date.rating 
                            ? 'text-primary fill-primary' 
                            : 'text-muted-foreground/30'
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
                    className="mt-4 w-full border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Add Reflection
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-card/50 rounded-xl border border-border">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary/60" />
              </div>
              <p className="text-foreground font-medium mb-1">No completed dates yet</p>
              <p className="text-sm text-muted-foreground">
                Accept a weekly option to plan your first date!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Calendar, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DatesJournalProps {
  onStartDebrief: () => void;
  initialTab?: 'dates' | 'ark';
  onDateCompleted?: (partnerName?: string) => void;
}

export const DatesJournal: React.FC<DatesJournalProps> = ({ onStartDebrief, onDateCompleted }) => {
  // Simple past dates view - shows completed dates with ratings
  // Placeholder data - will be populated from itineraries in full implementation
  const completedDates = [
    { id: '1', name: 'Maya', date: '2024-01-15', rating: 5, venue: 'Coffee Shop', hasReflection: false },
    { id: '2', name: 'Jordan', date: '2024-01-10', rating: 4, venue: 'Art Gallery', hasReflection: true },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Date Journal</h1>
          <p className="text-muted-foreground">Track your dating journey</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-foreground font-medium text-lg">Completed Dates</h3>
          </div>

          {completedDates.length > 0 ? (
            completedDates.map((date) => (
              <div
                key={date.id}
                className="bg-card rounded-xl p-4 border border-border"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-medium">{date.name}</h3>
                      <p className="text-muted-foreground text-sm">
                        {new Date(date.date).toLocaleDateString()} • {date.venue}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= date.rating 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {/* Add Reflection Button */}
                {!date.hasReflection && onDateCompleted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDateCompleted(date.name)}
                    className="mt-3 w-full border-goldenrod/50 text-goldenrod hover:bg-goldenrod/10"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Add Reflection
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-card/50 rounded-xl border border-border">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No completed dates yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Accept a weekly option to plan your first date!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

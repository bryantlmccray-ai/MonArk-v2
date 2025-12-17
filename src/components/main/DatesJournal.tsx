import React, { useState } from 'react';
import { RelationalCompass } from '../rhythm/RelationalCompass';
import { InsightsModule } from '../rhythm/InsightsModule';
import { ReflectionPrompt } from '../rhythm/ReflectionPrompt';
import { useRhythm } from '@/hooks/useRhythm';
import { Calendar, Star } from 'lucide-react';

interface DatesJournalProps {
  onStartDebrief: () => void;
  initialTab?: 'dates' | 'ark';
}

export const DatesJournal: React.FC<DatesJournalProps> = ({ onStartDebrief, initialTab = 'dates' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { rifState, insights, reflections, currentPrompt, loading, saveReflection } = useRhythm();

  const tabs = [
    { id: 'dates' as const, label: 'Past Dates' },
    { id: 'ark' as const, label: 'Your RIF Ark' },
  ];

  // Simple past dates view - just shows completed dates with ratings
  const renderDates = () => {
    // Placeholder for completed dates - will be populated from itineraries
    const completedDates = [
      { id: '1', name: 'Maya', date: '2024-01-15', rating: 5, venue: 'Coffee Shop' },
      { id: '2', name: 'Jordan', date: '2024-01-10', rating: 4, venue: 'Art Gallery' },
    ];

    return (
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
    );
  };

  const renderArk = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl p-6 border border-border animate-pulse">
              <div className="h-6 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <RelationalCompass rifState={rifState} />
        <InsightsModule insights={insights} />
        <ReflectionPrompt
          currentPrompt={currentPrompt}
          reflections={reflections}
          onSaveReflection={saveReflection}
        />
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dates':
        return renderDates();
      case 'ark':
        return renderArk();
      default:
        return renderDates();
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">
            Dates & Insights
          </h1>
          <p className="text-muted-foreground">Track your dating journey</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-card rounded-xl p-1.5 border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

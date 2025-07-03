
import React, { useState } from 'react';
import { RelationalCompass } from '../rhythm/RelationalCompass';
import { InsightsModule } from '../rhythm/InsightsModule';
import { ReflectionPrompt } from '../rhythm/ReflectionPrompt';
import { JournalEngagementFeatures } from '../journal/JournalEngagementFeatures';
import { JournalInsightsDashboard } from '../journal/JournalInsightsDashboard';
import { JournalEntryModal } from '../journal/JournalEntryModal';
import { GrowthTimeline } from '../journal/GrowthTimeline';
import { useRhythm } from '@/hooks/useRhythm';
import { useJournalEngagement } from '@/hooks/useJournalEngagement';

interface DatesJournalProps {
  onStartDebrief: () => void;
}

export const DatesJournal: React.FC<DatesJournalProps> = ({ onStartDebrief }) => {
  const [showInsightsDashboard, setShowInsightsDashboard] = useState(false);
  const [showJournalEntryModal, setShowJournalEntryModal] = useState(false);
  const { rifState, insights, reflections, currentPrompt, loading, saveReflection } = useRhythm();
  const {
    journalEntries,
    currentStreak,
    weeklyGoal,
    entriesThisWeek,
    achievements,
    insights: journalInsights,
    loading: journalLoading,
    setReminder,
    refetchEntries
  } = useJournalEngagement();


  const renderContent = () => {
    if (showInsightsDashboard) {
      return (
        <JournalInsightsDashboard
          onBack={() => setShowInsightsDashboard(false)}
          journalEntries={journalEntries}
        />
      );
    }

    if (loading) {
      return (
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-charcoal-gray rounded-xl p-6 border border-gray-800 animate-pulse">
              <div className="h-6 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Growth Timeline */}
        <GrowthTimeline />

        {/* Journal Entries */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium text-lg">Recent Entries</h3>
            <button
              onClick={() => setShowJournalEntryModal(true)}
              className="px-4 py-2 bg-goldenrod text-jet-black font-semibold rounded-lg hover:bg-goldenrod/90 transition-colors"
            >
              + New Entry
            </button>
          </div>
          {journalLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-charcoal-gray rounded-xl p-4 border border-gray-800 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : journalEntries.length > 0 ? (
            journalEntries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="bg-charcoal-gray rounded-xl p-4 border border-gray-800"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-medium">{entry.partner_name}</h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(entry.date_completed).toLocaleDateString()} • {entry.date_activity}
                    </p>
                  </div>
                  {entry.rating && (
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div
                          key={star}
                          className={`h-4 w-4 ${
                            star <= entry.rating! ? 'text-goldenrod' : 'text-gray-600'
                          }`}
                        >
                          ⭐
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {entry.learned_insights && (
                  <p className="text-gray-300 text-sm">{entry.learned_insights}</p>
                )}
                
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-goldenrod/20 text-goldenrod text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No journal entries yet.</p>
              <p className="text-gray-500 text-sm mt-1">Start journaling to track your dating insights!</p>
            </div>
          )}
        </div>

        {/* Engagement Features */}
        <JournalEngagementFeatures
          totalEntries={journalEntries.length}
          currentStreak={currentStreak}
          weeklyGoal={weeklyGoal}
          entriesThisWeek={entriesThisWeek}
          insights={journalInsights}
          achievements={achievements}
          onViewInsights={() => setShowInsightsDashboard(true)}
          onSetReminder={() => setReminder(true)}
          onUpdateWeeklyGoal={(newGoal) => {
            // This would update the goal in the hook
            console.log('Updating weekly goal to:', newGoal);
          }}
        />

        {/* Relational Compass */}
        <RelationalCompass rifState={rifState} />
        
        {/* Insights Module */}
        <InsightsModule insights={insights} />

        {/* Reflection Prompt */}
        <ReflectionPrompt
          currentPrompt={currentPrompt}
          reflections={reflections}
          onSaveReflection={saveReflection}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-display font-semibold journal-header-text bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Dates & Insights
          </h1>
          <p className="text-gray-400 text-lg font-light tracking-wide">Reflect, grow, and understand your dating journey</p>
        </div>

        {renderContent()}
        
        {/* Journal Entry Modal */}
        <JournalEntryModal
          isOpen={showJournalEntryModal}
          onClose={() => setShowJournalEntryModal(false)}
          onSaved={() => {
            refetchEntries();
            setShowJournalEntryModal(false);
          }}
        />
      </div>
    </div>
  );
};

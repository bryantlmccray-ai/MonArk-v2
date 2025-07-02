
import React, { useState } from 'react';
import { RelationalCompass } from '../rhythm/RelationalCompass';
import { InsightsModule } from '../rhythm/InsightsModule';
import { ReflectionPrompt } from '../rhythm/ReflectionPrompt';
import { JournalEngagementFeatures } from '../journal/JournalEngagementFeatures';
import { JournalInsightsDashboard } from '../journal/JournalInsightsDashboard';
import { useRhythm } from '@/hooks/useRhythm';
import { useJournalEngagement } from '@/hooks/useJournalEngagement';

interface DatesJournalProps {
  onStartDebrief: () => void;
}

export const DatesJournal: React.FC<DatesJournalProps> = ({ onStartDebrief }) => {
  const [activeTab, setActiveTab] = useState('journal');
  const [showInsightsDashboard, setShowInsightsDashboard] = useState(false);
  const { rifState, insights, reflections, currentPrompt, loading, saveReflection } = useRhythm();
  const {
    journalEntries,
    currentStreak,
    weeklyGoal,
    entriesThisWeek,
    achievements,
    insights: journalInsights,
    loading: journalLoading,
    setReminder
  } = useJournalEngagement();

  const tabs = [
    { id: 'upcoming', label: 'Upcoming & Ideas' },
    { id: 'journal', label: 'My Journal' },
    { id: 'rhythm', label: 'My Rhythm' },
  ];

  const pastDates = [
    {
      id: 1,
      name: 'Maya',
      date: 'March 10',
      activity: 'Coffee & Art Gallery',
      hasDebrief: true,
      vibe: 4,
      learned: 'I really value deep conversations about art and creativity.',
    },
    {
      id: 2,
      name: 'Jordan',
      date: 'March 8',
      activity: 'Hiking & Picnic',
      hasDebrief: false,
    },
  ];

  const renderUpcoming = () => (
    <div className="space-y-6">
      <div className="bg-charcoal-gray rounded-xl p-6 border border-gray-800">
        <h3 className="text-white font-medium text-lg mb-4">AI Date Concierge</h3>
        <p className="text-gray-400 mb-6">Let's design your next meaningful experience</p>
        
        <div className="space-y-4">
          <div>
            <label className="text-white text-sm mb-2 block">AI Collaboration Level</label>
            <div className="flex space-x-2">
              {['Guided', 'Balanced', 'Creative'].map((level) => (
                <button
                  key={level}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-goldenrod hover:text-jet-black transition-colors"
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          <button className="w-full py-3 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow">
            Start Planning
          </button>
        </div>
      </div>
    </div>
  );

  const renderJournal = () => {
    if (showInsightsDashboard) {
      return (
        <JournalInsightsDashboard
          onBack={() => setShowInsightsDashboard(false)}
          journalEntries={journalEntries}
        />
      );
    }

    return (
      <div className="space-y-6">
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
        />

        {/* Journal Entries */}
        <div className="space-y-4">
          <h3 className="text-white font-medium text-lg">Recent Entries</h3>
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
      </div>
    );
  };

  const renderRhythm = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-charcoal-gray rounded-xl p-6 border border-gray-800 animate-pulse">
              <div className="h-6 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-6">
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

  const renderContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return renderUpcoming();
      case 'journal':
        return renderJournal();
      case 'rhythm':
        return renderRhythm();
      default:
        return renderUpcoming();
    }
  };

  return (
    <div className="min-h-screen bg-jet-black p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-light text-white">Dates & Journal</h1>
          <p className="text-gray-400 text-sm mt-1">Plan, reflect, and grow</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-charcoal-gray/50 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-goldenrod text-jet-black'
                  : 'text-gray-400 hover:text-white'
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

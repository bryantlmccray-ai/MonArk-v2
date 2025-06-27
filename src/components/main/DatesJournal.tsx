
import React, { useState } from 'react';
import { RelationalCompass } from '../rhythm/RelationalCompass';
import { InsightsModule } from '../rhythm/InsightsModule';
import { ReflectionPrompt } from '../rhythm/ReflectionPrompt';
import { useRhythm } from '@/hooks/useRhythm';

interface DatesJournalProps {
  onStartDebrief: () => void;
}

export const DatesJournal: React.FC<DatesJournalProps> = ({ onStartDebrief }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { rifState, insights, reflections, currentPrompt, loading, saveReflection } = useRhythm();

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

  const renderJournal = () => (
    <div className="space-y-4">
      {pastDates.map((date) => (
        <div
          key={date.id}
          className="bg-charcoal-gray rounded-xl p-4 border border-gray-800"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-white font-medium">{date.name}</h3>
              <p className="text-gray-400 text-sm">{date.date} • {date.activity}</p>
            </div>
          </div>
          
          {date.hasDebrief ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Vibe:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className={`h-4 w-4 ${
                        star <= date.vibe! ? 'text-goldenrod' : 'text-gray-600'
                      }`}
                    >
                      ⭐
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-gray-300 text-sm">{date.learned}</p>
            </div>
          ) : (
            <button
              onClick={onStartDebrief}
              className="w-full py-2 bg-goldenrod/20 text-goldenrod border border-goldenrod/30 rounded-lg text-sm hover:bg-goldenrod hover:text-jet-black transition-colors"
            >
              Start Debrief
            </button>
          )}
        </div>
      ))}
    </div>
  );

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

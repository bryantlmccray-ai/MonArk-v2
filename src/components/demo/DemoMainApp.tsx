import React, { useState } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { X, MessageCircle, Calendar, User, BookOpen, Coffee, Palette, TreeDeciduous } from 'lucide-react';

interface DemoMainAppProps {
  onClose: () => void;
}

export const DemoMainApp: React.FC<DemoMainAppProps> = ({ onClose }) => {
  const { demoData } = useDemo();
  const [activeTab, setActiveTab] = useState<'weekly' | 'conversations' | 'journal' | 'profile'>('weekly');

  const TabButton = ({ tab, icon: Icon, label, isActive, onClick }: any) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-goldenrod/20 text-goldenrod' 
          : 'text-gray-400 hover:text-white hover:bg-charcoal-gray/50'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  // MVP: Weekly Options view - your 3 curated options
  const WeeklyView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white mb-2">Your 3 Options</h2>
        <p className="text-gray-300">Curated date ideas for this week</p>
      </div>
      
      <div className="grid gap-4">
        <div className="bg-charcoal-gray/50 rounded-xl p-5 border border-goldenrod/20 hover:border-goldenrod/40 transition-colors">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Coffee Walk</h3>
              <p className="text-goldenrod text-sm">Low-key, conversation-focused</p>
            </div>
            <span className="text-2xl">☕</span>
          </div>
          <p className="text-gray-300 text-sm mb-4">A relaxed coffee walk through the park - perfect for deep conversations.</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-goldenrod/10 text-goldenrod text-xs rounded-full">Quiet</span>
            <span className="px-2 py-1 bg-goldenrod/10 text-goldenrod text-xs rounded-full">Outdoors</span>
          </div>
        </div>
        <div className="bg-charcoal-gray/50 rounded-xl p-5 border border-goldenrod/20 hover:border-goldenrod/40 transition-colors">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Art Gallery</h3>
              <p className="text-goldenrod text-sm">Cultural, engaging</p>
            </div>
            <span className="text-2xl">🎨</span>
          </div>
          <p className="text-gray-300 text-sm mb-4">Explore a local gallery together - great conversation starters.</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-goldenrod/10 text-goldenrod text-xs rounded-full">Indoor</span>
            <span className="px-2 py-1 bg-goldenrod/10 text-goldenrod text-xs rounded-full">Cultural</span>
          </div>
        </div>
        <div className="bg-charcoal-gray/50 rounded-xl p-5 border border-goldenrod/20 hover:border-goldenrod/40 transition-colors">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Botanical Garden</h3>
              <p className="text-goldenrod text-sm">Peaceful, scenic</p>
            </div>
            <span className="text-2xl">🌳</span>
          </div>
          <p className="text-gray-300 text-sm mb-4">Stroll through beautiful gardens at golden hour.</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-goldenrod/10 text-goldenrod text-xs rounded-full">Nature</span>
            <span className="px-2 py-1 bg-goldenrod/10 text-goldenrod text-xs rounded-full">Evening</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ConversationsView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white mb-2">Conversations</h2>
        <p className="text-gray-300">Chat with your matches</p>
      </div>
      
      <div className="space-y-3">
        {demoData.conversations.map((conversation) => (
          <div 
            key={conversation.id}
            className="bg-charcoal-gray/50 rounded-xl p-4 border border-goldenrod/20 hover:border-goldenrod/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <img 
                src={conversation.matchPhoto} 
                alt={conversation.matchName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium">{conversation.matchName}</h3>
                <p className="text-gray-400 text-sm truncate">{conversation.lastMessage}</p>
              </div>
              {conversation.unreadCount > 0 && (
                <span className="bg-goldenrod text-jet-black text-xs font-bold px-2 py-1 rounded-full">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const JournalView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white mb-2">Date Journal</h2>
        <p className="text-gray-300">Reflect on your dating experiences</p>
      </div>
      
      <div className="space-y-3">
        {demoData.journalEntries.map((entry) => (
          <div 
            key={entry.id}
            className="bg-charcoal-gray/50 rounded-xl p-4 border border-goldenrod/20"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white font-medium">{entry.title}</h3>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < entry.rating ? 'text-goldenrod' : 'text-gray-600'}>★</span>
                ))}
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-2">{entry.partner} • {entry.date}</p>
            <p className="text-gray-300 text-sm">{entry.reflection}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const ProfileView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white mb-2">Your Profile</h2>
      </div>
      
      <div className="bg-charcoal-gray/50 rounded-xl p-6 border border-goldenrod/20">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-goldenrod to-yellow-600 flex items-center justify-center">
            <User className="h-12 w-12 text-jet-black" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white">{demoData.currentUser.name}</h3>
            <p className="text-gray-400">{demoData.currentUser.age} • {demoData.currentUser.location}</p>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div>
            <h4 className="text-goldenrod text-sm font-medium mb-2">About</h4>
            <p className="text-gray-300 text-sm">{demoData.currentUser.bio}</p>
          </div>
          
          <div>
            <h4 className="text-goldenrod text-sm font-medium mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {demoData.currentUser.interests.map((interest) => (
                <span key={interest} className="px-3 py-1 bg-goldenrod/10 text-goldenrod text-sm rounded-full">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-jet-black z-50 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h1 className="text-xl font-semibold text-goldenrod">MonArk Demo</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {activeTab === 'weekly' && <WeeklyView />}
        {activeTab === 'conversations' && <ConversationsView />}
        {activeTab === 'journal' && <JournalView />}
        {activeTab === 'profile' && <ProfileView />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-charcoal-gray/95 backdrop-blur-xl border-t border-gray-800 p-2">
        <div className="flex justify-around">
          <TabButton 
            tab="weekly" 
            icon={Calendar} 
            label="Your 3" 
            isActive={activeTab === 'weekly'}
            onClick={() => setActiveTab('weekly')}
          />
          <TabButton 
            tab="conversations" 
            icon={MessageCircle} 
            label="Chats" 
            isActive={activeTab === 'conversations'}
            onClick={() => setActiveTab('conversations')}
          />
          <TabButton 
            tab="journal" 
            icon={BookOpen} 
            label="Journal" 
            isActive={activeTab === 'journal'}
            onClick={() => setActiveTab('journal')}
          />
          <TabButton 
            tab="profile" 
            icon={User} 
            label="Profile" 
            isActive={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { X, Heart, MessageCircle, Map, Calendar, User, Settings } from 'lucide-react';
import { ProfileSelectionOverlay } from '@/components/main/ProfileSelectionOverlay';

interface DemoMainAppProps {
  onClose: () => void;
}

export const DemoMainApp: React.FC<DemoMainAppProps> = ({ onClose }) => {
  const { demoData } = useDemo();
  const [activeTab, setActiveTab] = useState<'discovery' | 'conversations' | 'journal' | 'profile'>('discovery');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

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

  const DiscoveryView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white mb-2">Discover Connections</h2>
        <p className="text-gray-300">Explore profiles with enhanced compatibility insights</p>
      </div>
      
      <div className="grid gap-4">
        {demoData.profiles.map((profile) => (
          <div 
            key={profile.id}
            className="bg-charcoal-gray/50 rounded-xl p-4 border border-goldenrod/20 hover:border-goldenrod/40 transition-colors cursor-pointer"
            onClick={() => setSelectedProfile(profile)}
          >
            <div className="flex items-center space-x-4">
              <img 
                src={profile.photos[0]} 
                alt={profile.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-white">{profile.name}, {profile.age}</h3>
                <p className="text-sm text-gray-300 line-clamp-2">{profile.bio}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {profile.interests.slice(0, 3).map((interest, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-goldenrod/20 text-goldenrod rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">85%</div>
                <div className="text-xs text-gray-400">Compatible</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ConversationsView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white mb-2">Active Conversations</h2>
        <p className="text-gray-300">Connect with your matches through meaningful dialogue</p>
      </div>
      
      <div className="space-y-3">
        {demoData.conversations.map((conversation) => (
          <div 
            key={conversation.id}
            className="bg-charcoal-gray/50 rounded-xl p-4 border border-goldenrod/20 hover:border-goldenrod/40 transition-colors cursor-pointer"
            onClick={() => setSelectedConversation(conversation)}
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src={conversation.matchPhoto}
                  alt={conversation.matchName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {conversation.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-goldenrod text-jet-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white">{conversation.matchName}</h3>
                <p className="text-sm text-gray-300 truncate">{conversation.lastMessage}</p>
              </div>
              <div className="text-xs text-gray-400">{conversation.timestamp}</div>
            </div>
          </div>
        ))}
      </div>

      {selectedConversation && (
        <div className="fixed inset-0 bg-jet-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-charcoal-gray/95 rounded-2xl w-full max-w-md h-96 border border-goldenrod/30 flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-medium text-white">{selectedConversation.matchName}</h3>
              <button 
                onClick={() => setSelectedConversation(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {selectedConversation.messages.map((message: any) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-goldenrod text-jet-black' 
                      : 'bg-charcoal-gray text-white'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  className="flex-1 bg-jet-black/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder:text-gray-400"
                />
                <Button className="bg-goldenrod-gradient text-jet-black">Send</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const JournalView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white mb-2">Dating Journal</h2>
        <p className="text-gray-300">Track your experiences and grow through reflection</p>
      </div>
      
      <div className="space-y-4">
        {demoData.journalEntries.map((entry) => (
          <div key={entry.id} className="bg-charcoal-gray/50 rounded-xl p-4 border border-goldenrod/20">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-white">{entry.title}</h3>
                <p className="text-sm text-gray-300">with {entry.partner} • {entry.date}</p>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Heart 
                    key={i}
                    className={`h-4 w-4 ${i < entry.rating ? 'text-goldenrod fill-goldenrod' : 'text-gray-600'}`}
                  />
                ))}
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-3">{entry.reflection}</p>
            
            <div className="flex flex-wrap gap-1">
              {entry.insights.map((insight, idx) => (
                <span key={idx} className="text-xs px-2 py-1 bg-goldenrod/20 text-goldenrod rounded-full">
                  {insight}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ProfileView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white mb-2">Your Profile</h2>
        <p className="text-gray-300">Manage your identity and preferences</p>
      </div>
      
      <div className="bg-charcoal-gray/50 rounded-xl p-6 border border-goldenrod/20">
        <div className="flex items-center space-x-4 mb-6">
          <img 
            src={demoData.currentUser.photos[0]}
            alt={demoData.currentUser.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold text-white">{demoData.currentUser.name}, {demoData.currentUser.age}</h3>
            <p className="text-gray-300">{demoData.currentUser.location}</p>
          </div>
        </div>
        
        <p className="text-gray-300 mb-4">{demoData.currentUser.bio}</p>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-white mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {demoData.currentUser.interests.map((interest, idx) => (
                <span key={idx} className="px-3 py-1 bg-goldenrod/20 text-goldenrod rounded-full text-sm">
                  {interest}
                </span>
              ))}
            </div>
          </div>
          
          {demoData.currentUser.rifProfile && (
            <div>
              <h4 className="font-medium text-white mb-2">RIF Profile</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-jet-black/50 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Intent Clarity</div>
                  <div className="text-lg font-medium text-goldenrod">
                    {demoData.currentUser.rifProfile.intent_clarity}/10
                  </div>
                </div>
                <div className="bg-jet-black/50 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Emotional Readiness</div>
                  <div className="text-lg font-medium text-goldenrod">
                    {demoData.currentUser.rifProfile.emotional_readiness}/10
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-jet-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-charcoal-gray/50 border-b border-goldenrod/30 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-goldenrod-gradient rounded-full flex items-center justify-center">
              <span className="text-jet-black font-bold text-sm">M</span>
            </div>
            <span className="text-white font-medium">MonArk Demo</span>
          </div>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="text-white border-white/30 hover:bg-white/10"
          >
            <X className="h-4 w-4 mr-2" />
            Exit Demo
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-charcoal-gray/30 border-b border-gray-700 p-4">
        <div className="flex justify-center space-x-2 max-w-4xl mx-auto">
          <TabButton 
            tab="discovery" 
            icon={Map} 
            label="Discovery" 
            isActive={activeTab === 'discovery'}
            onClick={() => setActiveTab('discovery')}
          />
          <TabButton 
            tab="conversations" 
            icon={MessageCircle} 
            label="Messages" 
            isActive={activeTab === 'conversations'}
            onClick={() => setActiveTab('conversations')}
          />
          <TabButton 
            tab="journal" 
            icon={Calendar} 
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'discovery' && <DiscoveryView />}
          {activeTab === 'conversations' && <ConversationsView />}
          {activeTab === 'journal' && <JournalView />}
          {activeTab === 'profile' && <ProfileView />}
        </div>
      </div>

      {/* Profile Selection Overlay */}
      {selectedProfile && (
        <ProfileSelectionOverlay
          profile={selectedProfile}
          currentUserProfile={demoData.currentUser.rifProfile}
          onClose={() => setSelectedProfile(null)}
          onLike={() => {
            setSelectedProfile(null);
            // Could add a toast notification here
          }}
          onMessage={() => {
            setSelectedProfile(null);
            setActiveTab('conversations');
            // Could add the profile to conversations
          }}
        />
      )}
    </div>
  );
};
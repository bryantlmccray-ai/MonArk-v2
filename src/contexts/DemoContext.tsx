import React, { createContext, useContext, useState } from 'react';

interface MockUser {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio: string;
  interests: string[];
  location: string;
  rifProfile?: {
    intent_clarity: number;
    pacing_preferences: number;
    emotional_readiness: number;
    boundary_respect: number;
  };
}

interface MockConversation {
  id: string;
  matchName: string;
  matchPhoto: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: {
    id: string;
    content: string;
    sender: 'user' | 'match';
    timestamp: string;
  }[];
}

interface MockJournalEntry {
  id: string;
  title: string;
  partner: string;
  activity: string;
  date: string;
  rating: number;
  reflection: string;
  insights: string[];
}

interface DemoData {
  currentUser: MockUser;
  profiles: MockUser[];
  conversations: MockConversation[];
  journalEntries: MockJournalEntry[];
  isInDemo: boolean;
}

interface DemoContextType {
  demoData: DemoData;
  setDemoMode: (enabled: boolean) => void;
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInDemo, setIsInDemo] = useState(false);

  const mockCurrentUser: MockUser = {
    id: 'demo-user',
    name: 'Alex',
    age: 28,
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
    bio: 'Passionate about meaningful connections and authentic conversations. Love exploring new places and trying new experiences.',
    interests: ['Photography', 'Hiking', 'Coffee', 'Travel', 'Cooking'],
    location: 'San Francisco, CA',
    rifProfile: {
      intent_clarity: 8,
      pacing_preferences: 6,
      emotional_readiness: 7,
      boundary_respect: 9,
    }
  };

  const mockProfiles: MockUser[] = [
    {
      id: '1',
      name: 'Sarah',
      age: 26,
      photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b1fc?w=400'],
      bio: 'Art lover and coffee enthusiast. Looking for someone who appreciates deep conversations and spontaneous adventures.',
      interests: ['Art', 'Coffee', 'Books', 'Museums', 'Wine'],
      location: 'San Francisco, CA',
      rifProfile: {
        intent_clarity: 8,
        pacing_preferences: 6,
        emotional_readiness: 9,
        boundary_respect: 8,
      }
    },
    {
      id: '2',
      name: 'Jordan',
      age: 30,
      photos: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'],
      bio: 'Outdoor enthusiast and tech professional. Believe in taking time to build genuine connections.',
      interests: ['Hiking', 'Technology', 'Rock Climbing', 'Craft Beer'],
      location: 'Oakland, CA',
      rifProfile: {
        intent_clarity: 7,
        pacing_preferences: 8,
        emotional_readiness: 6,
        boundary_respect: 7,
      }
    },
    {
      id: '3',
      name: 'Maya',
      age: 27,
      photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'],
      bio: 'Yoga instructor and mindfulness practitioner. Seeking authentic connections with emotionally available people.',
      interests: ['Yoga', 'Meditation', 'Healthy Living', 'Music'],
      location: 'Berkeley, CA',
      rifProfile: {
        intent_clarity: 9,
        pacing_preferences: 4,
        emotional_readiness: 9,
        boundary_respect: 9,
      }
    }
  ];

  const mockConversations: MockConversation[] = [
    {
      id: 'conv-1',
      matchName: 'Sarah',
      matchPhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b1fc?w=400',
      lastMessage: 'That sounds like an amazing coffee shop! Would love to check it out together.',
      timestamp: '2 hours ago',
      unreadCount: 2,
      messages: [
        {
          id: 'msg-1',
          content: 'Hey! I saw you love photography too. Do you have a favorite spot in the city?',
          sender: 'match',
          timestamp: '1 day ago'
        },
        {
          id: 'msg-2',
          content: 'Yes! I actually love shooting around the Golden Gate Bridge area, especially during golden hour. What about you?',
          sender: 'user',
          timestamp: '1 day ago'
        },
        {
          id: 'msg-3',
          content: 'That sounds amazing! I\'ve been meaning to explore more photography spots. Also, I noticed you mentioned coffee - have you been to Blue Bottle on Mint Plaza?',
          sender: 'match',
          timestamp: '4 hours ago'
        },
        {
          id: 'msg-4',
          content: 'That sounds like an amazing coffee shop! Would love to check it out together.',
          sender: 'match',
          timestamp: '2 hours ago'
        }
      ]
    },
    {
      id: 'conv-2',
      matchName: 'Jordan',
      matchPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      lastMessage: 'I\'m free this weekend if you want to try that hiking trail!',
      timestamp: '1 day ago',
      unreadCount: 0,
      messages: [
        {
          id: 'msg-5',
          content: 'Hi Alex! I love that you\'re into hiking. Any recommendations for trails around the Bay Area?',
          sender: 'match',
          timestamp: '3 days ago'
        },
        {
          id: 'msg-6',
          content: 'Hey Jordan! Mount Tamalpais has some incredible views. The main trail isn\'t too challenging but the payoff is amazing.',
          sender: 'user',
          timestamp: '2 days ago'
        },
        {
          id: 'msg-7',
          content: 'I\'m free this weekend if you want to try that hiking trail!',
          sender: 'match',
          timestamp: '1 day ago'
        }
      ]
    }
  ];

  const mockJournalEntries: MockJournalEntry[] = [
    {
      id: 'journal-1',
      title: 'Coffee Date at Ritual',
      partner: 'Emma',
      activity: 'Coffee & Conversation',
      date: '2024-06-28',
      rating: 4,
      reflection: 'Great conversation about travel and books. She has a wonderful sense of humor and we share similar values about work-life balance.',
      insights: ['Good conversation flow', 'Shared interests in travel', 'Similar life goals']
    },
    {
      id: 'journal-2',
      title: 'Hiking at Muir Woods',
      partner: 'David',
      activity: 'Nature Walk',
      date: '2024-06-25',
      rating: 5,
      reflection: 'Amazing day exploring nature together. David is incredibly thoughtful and we had deep conversations about life goals and values.',
      insights: ['Strong emotional connection', 'Shared love for nature', 'Great communication style']
    },
    {
      id: 'journal-3',
      title: 'Art Gallery Opening',
      partner: 'Lisa',
      activity: 'Cultural Event',
      date: '2024-06-20',
      rating: 3,
      reflection: 'Interesting evening but felt like we were looking for different things. Still enjoyable and learned a lot about contemporary art.',
      insights: ['Different relationship goals', 'Cultural compatibility', 'Good as friends']
    }
  ];

  const demoData: DemoData = {
    currentUser: mockCurrentUser,
    profiles: mockProfiles,
    conversations: mockConversations,
    journalEntries: mockJournalEntries,
    isInDemo
  };

  const setDemoMode = (enabled: boolean) => {
    setIsInDemo(enabled);
  };

  const exitDemo = () => {
    setIsInDemo(false);
  };

  return (
    <DemoContext.Provider value={{ demoData, setDemoMode, exitDemo }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
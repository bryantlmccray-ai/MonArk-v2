
import React from 'react';
import { Sparkles } from 'lucide-react';

export const Conversations: React.FC = () => {
  const conversations = [
    {
      id: 1,
      name: 'Maya',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b047?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'That sounds like an amazing experience!',
      time: '2h',
      isNewMatch: false,
    },
    {
      id: 2,
      name: 'Alex',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'New Match! Ready to start the chat?',
      time: '1d',
      isNewMatch: true,
    },
    {
      id: 3,
      name: 'Jordan',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'I love that idea for our first date',
      time: '3d',
      isNewMatch: false,
    },
  ];

  return (
    <div className="min-h-screen bg-jet-black p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-light text-white">Conversations</h1>
          <p className="text-gray-400 text-sm mt-1">Meaningful connections await</p>
        </div>

        <div className="space-y-4">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="bg-charcoal-gray rounded-xl p-4 border border-gray-800 hover:border-goldenrod/30 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={conversation.image}
                  alt={conversation.name}
                  className="w-12 h-12 rounded-full"
                />
                
                <div className="flex-1">
                  <h3 className="text-white font-medium">
                    {conversation.name}
                  </h3>
                  <p className={`text-sm ${
                    conversation.isNewMatch 
                      ? 'text-goldenrod' 
                      : 'text-gray-400'
                  }`}>
                    {conversation.lastMessage}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {conversation.isNewMatch && (
                    <Sparkles className="h-5 w-5 text-goldenrod" />
                  )}
                  <span className="text-gray-500 text-xs">
                    {conversation.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

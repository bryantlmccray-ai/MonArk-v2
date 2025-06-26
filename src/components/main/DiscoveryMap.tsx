
import React, { useState, useEffect } from 'react';
import { RIFProfileCard } from './RIFProfileCard';
import { useRIF } from '@/hooks/useRIF';

export const DiscoveryMap: React.FC = () => {
  const [selectedPin, setSelectedPin] = useState<number | null>(null);
  const { rifProfile } = useRIF();

  const locations = [
    { id: 1, name: 'DOWNTOWN', x: 40, y: 30 },
    { id: 2, name: 'OHIO CITY', x: 25, y: 45 },
    { id: 3, name: 'TREMONT', x: 35, y: 55 },
    { id: 4, name: 'UNIVERSITY CIRCLE', x: 65, y: 35 },
    { id: 5, name: 'LITTLE ITALY', x: 68, y: 40 },
    { id: 6, name: 'GORDON SQUARE', x: 22, y: 38 },
    { id: 7, name: 'LAKEWOOD', x: 15, y: 50 },
    { id: 8, name: 'SHAKER HEIGHTS', x: 75, y: 50 },
  ];

  // Mock RIF profiles for demo users
  const profilePins = [
    { 
      id: 1, x: 42, y: 35, name: 'Alex', age: 28, 
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rifProfile: { intent_clarity: 8, pacing_preferences: 3, emotional_readiness: 9, boundary_respect: 8 }
    },
    { 
      id: 2, x: 58, y: 42, name: 'Maya', age: 26, 
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b047?w=150&h=150&fit=crop&crop=face',
      rifProfile: { intent_clarity: 6, pacing_preferences: 7, emotional_readiness: 7, boundary_respect: 9 }
    },
    { 
      id: 3, x: 30, y: 48, name: 'Jordan', age: 29, 
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rifProfile: { intent_clarity: 9, pacing_preferences: 5, emotional_readiness: 8, boundary_respect: 7 }
    },
    { 
      id: 4, x: 67, y: 38, name: 'Sam', age: 27, 
      image: 'https://images.unsplash.com/photo-1539571696247-f4d8e4e47f66?w=150&h=150&fit=crop&crop=face',
      rifProfile: { intent_clarity: 5, pacing_preferences: 8, emotional_readiness: 6, boundary_respect: 6 }
    },
    { 
      id: 5, x: 38, y: 32, name: 'Casey', age: 30, 
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      rifProfile: { intent_clarity: 7, pacing_preferences: 4, emotional_readiness: 8, boundary_respect: 9 }
    },
    { 
      id: 6, x: 26, y: 52, name: 'Riley', age: 25, 
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
      rifProfile: { intent_clarity: 8, pacing_preferences: 6, emotional_readiness: 7, boundary_respect: 8 }
    },
  ];

  return (
    <div className="min-h-screen bg-jet-black relative overflow-hidden">
      {/* Dark map background with grid overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
            url('https://images.unsplash.com/photo-1574169208507-84376144848b?w=1200&h=800&fit=crop&crop=edges')
          `,
          backgroundSize: '2rem 2rem, 2rem 2rem, cover',
          backgroundPosition: '0 0, 0 0, center',
          opacity: 0.1
        }}
      />
      
      {/* Location Labels */}
      {locations.map((location) => (
        <div
          key={location.id}
          className="absolute text-xs font-semibold text-white/40 uppercase tracking-wider pointer-events-none"
          style={{
            left: `${location.x}%`,
            top: `${location.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {location.name}
        </div>
      ))}

      {/* Enhanced Profile Pins with RIF data */}
      {profilePins.map((pin) => (
        <div
          key={pin.id}
          className="absolute"
          style={{
            left: `${pin.x}%`,
            top: `${pin.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <RIFProfileCard
            userProfile={pin.rifProfile}
            currentUserProfile={rifProfile || undefined}
            name={pin.name}
            age={pin.age}
            image={pin.image}
            onClick={() => setSelectedPin(selectedPin === pin.id ? null : pin.id)}
          />
        </div>
      ))}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <h1 className="text-2xl font-light text-white">Discover</h1>
        <p className="text-gray-400 text-sm mt-1">Find meaningful connections with emotional awareness</p>
      </div>
    </div>
  );
};

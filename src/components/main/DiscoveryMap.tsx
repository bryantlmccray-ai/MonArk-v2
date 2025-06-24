
import React, { useState } from 'react';

export const DiscoveryMap: React.FC = () => {
  const [selectedPin, setSelectedPin] = useState<number | null>(null);

  const locations = [
    { id: 1, name: 'DOWNTOWN', x: 40, y: 30 },
    { id: 2, name: 'OHIO CITY', x: 25, y: 45 },
    { id: 3, name: 'TREMONT', x: 35, y: 55 },
    { id: 4, name: 'UNIVERSITY CIRCLE', x: 65, y: 35 },
  ];

  const profilePins = [
    { id: 1, x: 42, y: 35, name: 'Alex', age: 28, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
    { id: 2, x: 58, y: 42, name: 'Maya', age: 26, image: 'https://images.unsplash.com/photo-1494790108755-2616b612b047?w=150&h=150&fit=crop&crop=face' },
    { id: 3, x: 30, y: 48, name: 'Jordan', age: 29, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { id: 4, x: 67, y: 38, name: 'Sam', age: 27, image: 'https://images.unsplash.com/photo-1539571696247-f4d8e4e47f66?w=150&h=150&fit=crop&crop=face' },
  ];

  return (
    <div className="min-h-screen bg-jet-black relative overflow-hidden">
      {/* Background Map with Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-10 bg-map-grid bg-grid"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1577473506174-7deb5a8b2a6b?w=800&h=800&fit=crop')`,
        }}
      />
      
      {/* Location Labels */}
      {locations.map((location) => (
        <div
          key={location.id}
          className="absolute text-xs font-semibold text-white/60 uppercase tracking-wider"
          style={{
            left: `${location.x}%`,
            top: `${location.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {location.name}
        </div>
      ))}

      {/* Profile Pins */}
      {profilePins.map((pin) => (
        <div
          key={pin.id}
          className="absolute cursor-pointer"
          style={{
            left: `${pin.x}%`,
            top: `${pin.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          onClick={() => setSelectedPin(selectedPin === pin.id ? null : pin.id)}
        >
          <div className={`relative ${selectedPin === pin.id ? 'animate-ping-slow' : ''}`}>
            <img
              src={pin.image}
              alt={pin.name}
              className={`w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                selectedPin === pin.id
                  ? 'border-goldenrod shadow-golden-glow scale-110'
                  : 'border-white/30 hover:border-goldenrod/50'
              }`}
            />
            {selectedPin === pin.id && (
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-charcoal-gray/95 backdrop-blur-xl rounded-lg px-3 py-2 border border-goldenrod/30 animate-scale-in">
                <p className="text-white font-medium text-sm">{pin.name}, {pin.age}</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <h1 className="text-2xl font-light text-white">Discover</h1>
        <p className="text-gray-400 text-sm mt-1">Find meaningful connections nearby</p>
      </div>
    </div>
  );
};

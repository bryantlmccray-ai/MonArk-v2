import React, { useState } from 'react';
import { ProfileSelectionOverlay } from '@/components/main/ProfileSelectionOverlay';
import { Button } from '@/components/ui/button';

const mockProfiles = {
  highCompatibility: {
    profile: {
      id: 1,
      name: "Sarah",
      age: 28,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b1fc?w=400",
      bio: "Love hiking, coffee, and meaningful conversations. Looking for someone who values emotional intelligence and authentic connections.",
      interests: ["Photography", "Hiking", "Coffee", "Reading", "Yoga"],
      distance: 2,
      rifProfile: {
        intent_clarity: 8,
        pacing_preferences: 6,
        emotional_readiness: 9,
        boundary_respect: 8,
      }
    },
    currentUser: {
      intent_clarity: 8,
      pacing_preferences: 7,
      emotional_readiness: 8,
      boundary_respect: 9,
    }
  },
  mediumCompatibility: {
    profile: {
      id: 2,
      name: "Alex",
      age: 32,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      bio: "Entrepreneur and adventure seeker. Believe in taking things slow and building genuine connections. Always up for trying new experiences.",
      interests: ["Travel", "Cooking", "Rock Climbing", "Music"],
      distance: 5,
      rifProfile: {
        intent_clarity: 5,
        pacing_preferences: 8,
        emotional_readiness: 6,
        boundary_respect: 7,
      }
    },
    currentUser: {
      intent_clarity: 8,
      pacing_preferences: 4,
      emotional_readiness: 8,
      boundary_respect: 9,
    }
  },
  lowCompatibility: {
    profile: {
      id: 3,
      name: "Jordan",
      age: 26,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      bio: "Fast-paced lifestyle, love spontaneous adventures. Looking for someone who can keep up and isn't afraid of taking risks in love and life.",
      interests: ["Skydiving", "Motorcycles", "Nightlife", "Extreme Sports"],
      distance: 8,
      rifProfile: {
        intent_clarity: 3,
        pacing_preferences: 9,
        emotional_readiness: 4,
        boundary_respect: 5,
      }
    },
    currentUser: {
      intent_clarity: 8,
      pacing_preferences: 3,
      emotional_readiness: 8,
      boundary_respect: 9,
    }
  }
};

export const ProfileCompatibilityDemo: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<keyof typeof mockProfiles>('highCompatibility');
  const [showOverlay, setShowOverlay] = useState(false);

  const currentMock = mockProfiles[selectedProfile];

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Profile Compatibility Demo</h2>
        <p className="text-gray-300">Test the enhanced compatibility section with different scenarios</p>
      </div>

      <div className="flex justify-center space-x-4 flex-wrap gap-2">
        <Button
          onClick={() => setSelectedProfile('highCompatibility')}
          variant={selectedProfile === 'highCompatibility' ? 'default' : 'outline'}
          className="text-sm"
        >
          High Compatibility (85%)
        </Button>
        <Button
          onClick={() => setSelectedProfile('mediumCompatibility')}
          variant={selectedProfile === 'mediumCompatibility' ? 'default' : 'outline'}
          className="text-sm"
        >
          Medium Compatibility (65%)
        </Button>
        <Button
          onClick={() => setSelectedProfile('lowCompatibility')}
          variant={selectedProfile === 'lowCompatibility' ? 'default' : 'outline'}
          className="text-sm"
        >
          Low Compatibility (45%)
        </Button>
      </div>

      <div className="text-center">
        <Button
          onClick={() => setShowOverlay(true)}
          className="bg-goldenrod-gradient text-jet-black font-medium px-8 py-3 hover:shadow-golden-glow transition-all duration-300"
        >
          Show Profile Overlay
        </Button>
      </div>

      <div className="bg-charcoal-gray/50 rounded-lg p-4 text-sm text-gray-300">
        <h3 className="font-medium text-white mb-2">Current Test Scenario:</h3>
        <p><strong>Profile:</strong> {currentMock.profile.name}, {currentMock.profile.age}</p>
        <p><strong>Compatibility Level:</strong> {selectedProfile.replace('Compatibility', ' Compatibility')}</p>
        <p><strong>Bio:</strong> {currentMock.profile.bio}</p>
      </div>

      {showOverlay && (
        <ProfileSelectionOverlay
          profile={currentMock.profile}
          currentUserProfile={currentMock.currentUser}
          onClose={() => setShowOverlay(false)}
          onLike={() => {
            setShowOverlay(false);
            alert('Liked! (Demo action)');
          }}
          onMessage={() => {
            setShowOverlay(false);
            alert('Message sent! (Demo action)');
          }}
        />
      )}
    </div>
  );
};
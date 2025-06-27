
import React, { useState } from 'react';
import { Filter, X, Heart, Clock, Shield, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DiscoveryFiltersProps {
  onFiltersChange: (filters: DiscoveryFilters) => void;
  rifProfile?: any;
}

export interface DiscoveryFilters {
  ageRange: [number, number];
  maxDistance: number;
  interests: string[];
  rifCompatibility: {
    pacing: boolean;
    emotional: boolean;
    boundaries: boolean;
    intent: boolean;
  };
  showOnlyHighCompatibility: boolean;
}

const availableInterests = [
  'Art', 'Music', 'Sports', 'Travel', 'Food', 'Books', 'Movies', 'Fitness',
  'Photography', 'Gaming', 'Nature', 'Technology', 'Dancing', 'Yoga'
];

export const DiscoveryFilters: React.FC<DiscoveryFiltersProps> = ({
  onFiltersChange,
  rifProfile
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<DiscoveryFilters>({
    ageRange: [22, 35],
    maxDistance: 25,
    interests: [],
    rifCompatibility: {
      pacing: false,
      emotional: false,
      boundaries: false,
      intent: false
    },
    showOnlyHighCompatibility: false
  });

  const updateFilters = (newFilters: Partial<DiscoveryFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const toggleInterest = (interest: string) => {
    const newInterests = filters.interests.includes(interest)
      ? filters.interests.filter(i => i !== interest)
      : [...filters.interests, interest];
    updateFilters({ interests: newInterests });
  };

  const toggleRIFFilter = (key: keyof typeof filters.rifCompatibility) => {
    updateFilters({
      rifCompatibility: {
        ...filters.rifCompatibility,
        [key]: !filters.rifCompatibility[key]
      }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.interests.length > 0) count++;
    if (Object.values(filters.rifCompatibility).some(v => v)) count++;
    if (filters.showOnlyHighCompatibility) count++;
    return count;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-charcoal-gray/50 backdrop-blur-sm rounded-lg p-2 border border-goldenrod/30 text-white hover:bg-charcoal-gray/70 transition-colors"
      >
        <Filter className="h-4 w-4" />
        <span className="text-sm">Filters</span>
        {getActiveFiltersCount() > 0 && (
          <Badge variant="secondary" className="bg-goldenrod text-jet-black text-xs">
            {getActiveFiltersCount()}
          </Badge>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 bg-charcoal-gray/95 backdrop-blur-xl rounded-xl p-4 border border-goldenrod/30 w-80 z-20 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium">Discovery Filters</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Age Range */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Age Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="18"
                  max="50"
                  value={filters.ageRange[0]}
                  onChange={(e) => updateFilters({ 
                    ageRange: [parseInt(e.target.value), filters.ageRange[1]] 
                  })}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-12">
                  {filters.ageRange[0]}-{filters.ageRange[1]}
                </span>
              </div>
            </div>

            {/* Distance */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Max Distance: {filters.maxDistance} miles
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={filters.maxDistance}
                onChange={(e) => updateFilters({ maxDistance: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Shared Interests</label>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {availableInterests.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                      filters.interests.includes(interest)
                        ? 'bg-goldenrod text-jet-black border-goldenrod'
                        : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-goldenrod/50'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* RIF Compatibility Filters */}
            {rifProfile && (
              <div>
                <label className="text-sm text-gray-300 mb-2 block">RIF Compatibility</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.rifCompatibility.pacing}
                      onChange={() => toggleRIFFilter('pacing')}
                      className="rounded"
                    />
                    <Clock className="h-3 w-3 text-blue-400" />
                    <span className="text-xs text-gray-300">Similar Pacing</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.rifCompatibility.emotional}
                      onChange={() => toggleRIFFilter('emotional')}
                      className="rounded"
                    />
                    <Heart className="h-3 w-3 text-red-400" />
                    <span className="text-xs text-gray-300">Emotional Readiness</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.rifCompatibility.boundaries}
                      onChange={() => toggleRIFFilter('boundaries')}
                      className="rounded"
                    />
                    <Shield className="h-3 w-3 text-purple-400" />
                    <span className="text-xs text-gray-300">Boundary Respect</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.rifCompatibility.intent}
                      onChange={() => toggleRIFFilter('intent')}
                      className="rounded"
                    />
                    <Target className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-gray-300">Clear Intent</span>
                  </label>
                </div>

                <label className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-700">
                  <input
                    type="checkbox"
                    checked={filters.showOnlyHighCompatibility}
                    onChange={(e) => updateFilters({ showOnlyHighCompatibility: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-xs text-goldenrod">Show only high compatibility</span>
                </label>
              </div>
            )}

            <Button
              onClick={() => {
                setFilters({
                  ageRange: [22, 35],
                  maxDistance: 25,
                  interests: [],
                  rifCompatibility: {
                    pacing: false,
                    emotional: false,
                    boundaries: false,
                    intent: false
                  },
                  showOnlyHighCompatibility: false
                });
                onFiltersChange({
                  ageRange: [22, 35],
                  maxDistance: 25,
                  interests: [],
                  rifCompatibility: {
                    pacing: false,
                    emotional: false,
                    boundaries: false,
                    intent: false
                  },
                  showOnlyHighCompatibility: false
                });
              }}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

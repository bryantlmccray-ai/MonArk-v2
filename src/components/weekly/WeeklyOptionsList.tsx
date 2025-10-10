import { useState } from 'react';
import { useWeeklyOptions } from '@/hooks/useWeeklyOptions';
import { WeeklyOptionsCard } from './WeeklyOptionsCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { ItineraryCreationModal } from './ItineraryCreationModal';

export const WeeklyOptionsList = () => {
  const { options, loading, generating, createItinerary, logOptionView, refetch } = useWeeklyOptions();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleTap = (optionId: string) => {
    setSelectedOptionId(optionId);
    setShowModal(true);
  };

  const handleCreateItinerary = async (
    mode: 'discovery' | 'matched' | 'byo',
    counterpartUserId?: string
  ) => {
    if (!selectedOptionId) return;
    
    const result = await createItinerary(selectedOptionId, mode, counterpartUserId);
    if (result) {
      setShowModal(false);
      setSelectedOptionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Weekly Options</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Three curated experiences, personalized for you
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={generating}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Options Grid */}
      {options.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {generating ? 'Generating your options...' : 'No options available this week'}
          </p>
          {!generating && (
            <Button onClick={refetch}>
              Generate Options
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((option) => (
            <WeeklyOptionsCard
              key={option.id}
              option={option}
              onTap={() => handleTap(option.id)}
              onView={() => logOptionView(option.id)}
            />
          ))}
        </div>
      )}

      {/* Itinerary Creation Modal */}
      {selectedOptionId && (
        <ItineraryCreationModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onCreateItinerary={handleCreateItinerary}
        />
      )}
    </div>
  );
};
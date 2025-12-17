import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationStepProps {
  onNext: (location: string) => void;
  onBack: () => void;
}

export const LocationStep: React.FC<LocationStepProps> = ({ onNext, onBack }) => {
  const [location, setLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Not supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // For now, we'll just use a placeholder - in production, you'd reverse geocode
          const { latitude, longitude } = position.coords;
          // Simple approximation - in production use a geocoding service
          setLocation(`Near ${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
          toast({
            title: "Location detected",
            description: "You can edit this if needed",
          });
        } catch (error) {
          console.error('Geocoding error:', error);
          toast({
            title: "Couldn't get location name",
            description: "Please enter your city manually",
            variant: "destructive",
          });
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: "Location access denied",
          description: "Please enter your city manually",
          variant: "destructive",
        });
        setIsGettingLocation(false);
      }
    );
  };

  const canProceed = location.trim().length >= 2;

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full space-y-6">
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`h-1.5 w-8 rounded-full ${step <= 3 ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="text-center space-y-2 pt-4">
          <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-foreground">Where Are You?</h1>
          <p className="text-muted-foreground">Help us find people near you</p>
        </div>

        {/* Location Input */}
        <div className="space-y-4">
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State or Neighborhood"
              className="pl-12 py-6 bg-card border-border text-foreground placeholder:text-muted-foreground text-lg"
            />
          </div>

          {/* Use Current Location Button */}
          <button
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className="w-full flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            <Navigation className={`h-5 w-5 ${isGettingLocation ? 'animate-pulse' : ''}`} />
            <span>{isGettingLocation ? 'Getting location...' : 'Use my current location'}</span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground text-center">
            Your exact location is never shared. Only approximate distance is shown to matches.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-6 max-w-md mx-auto w-full space-y-3">
        <button
          onClick={() => onNext(location)}
          disabled={!canProceed}
          className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from '@/hooks/useLocation';

interface LocationConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LocationConsentModal: React.FC<LocationConsentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [manualState, setManualState] = useState('');
  const [manualCountry, setManualCountry] = useState('');
  const { loading, requestLocationAccess, setManualLocation } = useLocation();

  const handleAllowLocation = async () => {
    const result = await requestLocationAccess();
    if (result) {
      onSuccess?.();
      onClose();
    }
  };

  const handleManualSubmit = async () => {
    if (!manualCity.trim()) return;
    
    const success = await setManualLocation(
      manualCity.trim(),
      manualState.trim(),
      manualCountry.trim() || 'USA'
    );
    
    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-2xl w-full max-w-md border-2 border-border shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.2)]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              {showManualForm ? 'Enter Your Location' : 'Allow Approximate Location?'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showManualForm ? (
            <div className="space-y-4">
              <p className="text-foreground/80 text-sm leading-relaxed font-medium">
                To show people nearby, we use your general area — not your exact location. 
                Your privacy is protected by only storing your city and approximate coordinates.
              </p>
              
              <div className="bg-muted/50 rounded-xl p-4">
                <h4 className="text-foreground font-semibold mb-2">What we collect:</h4>
                <ul className="text-xs text-muted-foreground space-y-1 font-medium">
                  <li>• City and state/region</li>
                  <li>• Approximate coordinates (1km accuracy)</li>
                  <li>• No street addresses or precise GPS data</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleAllowLocation}
                  disabled={loading}
                  className="w-full py-3"
                >
                  {loading ? 'Getting Location...' : 'Allow Location Access'}
                </Button>
                
                <Button
                  onClick={() => setShowManualForm(true)}
                  variant="outline"
                  className="w-full"
                >
                  Enter Manually
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-foreground/80 text-sm font-medium">
                Enter your city and state to connect with people nearby.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-foreground font-medium mb-1">City *</label>
                  <Input
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    placeholder="e.g., Brooklyn"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-foreground font-medium mb-1">State/Region</label>
                  <Input
                    value={manualState}
                    onChange={(e) => setManualState(e.target.value)}
                    placeholder="e.g., NY"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-foreground font-medium mb-1">Country</label>
                  <Input
                    value={manualCountry}
                    onChange={(e) => setManualCountry(e.target.value)}
                    placeholder="e.g., USA"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowManualForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleManualSubmit}
                  disabled={!manualCity.trim() || loading}
                  className="flex-1"
                >
                  {loading ? 'Saving...' : 'Save Location'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

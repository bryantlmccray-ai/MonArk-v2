
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
    <div className="fixed inset-0 bg-jet-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-charcoal-gray/95 backdrop-blur-xl rounded-2xl w-full max-w-md border border-goldenrod/30 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-goldenrod" />
            <h2 className="text-xl font-semibold text-white">
              {showManualForm ? 'Enter Your Location' : 'Allow Approximate Location?'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showManualForm ? (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                To show people nearby, we use your general area — not your exact location. 
                Your privacy is protected by only storing your city and approximate coordinates.
              </p>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">What we collect:</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• City and state/region</li>
                  <li>• Approximate coordinates (1km accuracy)</li>
                  <li>• No street addresses or precise GPS data</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleAllowLocation}
                  disabled={loading}
                  className="w-full bg-goldenrod-gradient text-jet-black font-medium py-3 hover:shadow-golden-glow transition-all duration-300"
                >
                  {loading ? 'Getting Location...' : 'Allow Location Access'}
                </Button>
                
                <Button
                  onClick={() => setShowManualForm(true)}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:border-goldenrod/50"
                >
                  Enter Manually
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Enter your city and state to connect with people nearby.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">City *</label>
                  <Input
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    placeholder="e.g., Brooklyn"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">State/Region</label>
                  <Input
                    value={manualState}
                    onChange={(e) => setManualState(e.target.value)}
                    placeholder="e.g., NY"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Country</label>
                  <Input
                    value={manualCountry}
                    onChange={(e) => setManualCountry(e.target.value)}
                    placeholder="e.g., USA"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowManualForm(false)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300"
                >
                  Back
                </Button>
                <Button
                  onClick={handleManualSubmit}
                  disabled={!manualCity.trim() || loading}
                  className="flex-1 bg-goldenrod-gradient text-jet-black font-medium"
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

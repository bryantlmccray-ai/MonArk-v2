
import { useState, useCallback } from 'react';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

export interface LocationData {
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  accuracy: 'coarse' | 'manual';
  manual_override: boolean;
}

export const useLocation = () => {
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useProfile();

  const getCurrentLocation = useCallback(async (): Promise<GeolocationPosition | null> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<LocationData> => {
    // Using a free geocoding service (Nominatim)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    // Round coordinates to 2 decimal places for privacy (roughly 1km accuracy)
    const roundedLat = Math.round(lat * 100) / 100;
    const roundedLng = Math.round(lng * 100) / 100;

    return {
      city: data.address.city || data.address.town || data.address.village || 'Unknown',
      state: data.address.state || data.address.region || '',
      country: data.address.country || 'Unknown',
      lat: roundedLat,
      lng: roundedLng,
      accuracy: 'coarse',
      manual_override: false,
    };
  }, []);

  const requestLocationAccess = useCallback(async (): Promise<LocationData | null> => {
    setLoading(true);
    try {
      const position = await getCurrentLocation();
      const locationData = await reverseGeocode(
        position.coords.latitude,
        position.coords.longitude
      );

      // Save to profile
      await updateProfile({
        location_data: locationData,
        location_consent: true,
      });

      toast.success('Location updated successfully');
      return locationData;
    } catch (error) {
      console.error('Location access failed:', error);
      toast.error('Unable to access location. You can enter it manually.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getCurrentLocation, reverseGeocode, updateProfile]);

  const setManualLocation = useCallback(async (city: string, state: string, country: string): Promise<boolean> => {
    setLoading(true);
    try {
      const locationData: LocationData = {
        city,
        state,
        country,
        lat: 0,
        lng: 0,
        accuracy: 'manual',
        manual_override: true,
      };

      const success = await updateProfile({
        location_data: locationData,
        location_consent: true,
      });

      if (success) {
        toast.success('Location updated successfully');
      }
      return success;
    } catch (error) {
      console.error('Manual location save failed:', error);
      toast.error('Failed to save location');
      return false;
    } finally {
      setLoading(false);
    }
  }, [updateProfile]);

  const clearLocation = useCallback(async (): Promise<boolean> => {
    try {
      const success = await updateProfile({
        location_data: null,
        location_consent: false,
      });

      if (success) {
        toast.success('Location cleared');
      }
      return success;
    } catch (error) {
      console.error('Clear location failed:', error);
      toast.error('Failed to clear location');
      return false;
    }
  }, [updateProfile]);

  return {
    loading,
    requestLocationAccess,
    setManualLocation,
    clearLocation,
  };
};

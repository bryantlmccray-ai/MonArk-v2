
import { useState, useCallback } from 'react';
import { useProfile } from './useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LocationData {
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  accuracy: 'coarse' | 'manual';
  manual_override: boolean;
  neighborhood?: string;
  metro_area?: string;
  transit_score?: number;
  walkability_score?: number;
}

export interface CityData {
  id: string;
  name: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
  population: number;
  metro_area: string;
  transit_systems: string[];
}

export interface NeighborhoodData {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  transit_score: number;
  walkability_score: number;
}

export type DistanceMode = 'walking' | 'driving' | 'transit';

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

  const findNearestNeighborhood = useCallback(async (lat: number, lng: number): Promise<NeighborhoodData | null> => {
    try {
      const { data, error } = await supabase
        .rpc('find_nearest_neighborhood', { user_lat: lat, user_lng: lng });
      
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error finding nearest neighborhood:', error);
      return null;
    }
  }, []);

  const detectCity = useCallback(async (cityName: string, state: string, country: string): Promise<CityData | null> => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .ilike('name', cityName)
        .eq('state', state)
        .eq('country', country)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error detecting city:', error);
      return null;
    }
  }, []);

  const getNeighborhoodsInCity = useCallback(async (cityName: string, state: string, country: string): Promise<NeighborhoodData[]> => {
    try {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('*')
        .eq('city', cityName)
        .eq('state', state)
        .eq('country', country)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching neighborhoods:', error);
      return [];
    }
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

    const cityName = data.address.city || data.address.town || data.address.village || 'Unknown';
    const stateName = data.address.state || data.address.region || '';
    const countryName = data.address.country || 'Unknown';

    // Try to find neighborhood and city data
    const [nearestNeighborhood, cityData] = await Promise.all([
      findNearestNeighborhood(roundedLat, roundedLng),
      detectCity(cityName, stateName, countryName)
    ]);

    return {
      city: cityName,
      state: stateName,
      country: countryName,
      lat: roundedLat,
      lng: roundedLng,
      accuracy: 'coarse',
      manual_override: false,
      neighborhood: nearestNeighborhood?.name,
      metro_area: cityData?.metro_area,
      transit_score: nearestNeighborhood?.transit_score,
      walkability_score: nearestNeighborhood?.walkability_score,
    };
  }, [findNearestNeighborhood, detectCity]);

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

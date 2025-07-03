import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CityData, NeighborhoodData } from './useLocation';

export interface VenueData {
  id: string;
  name: string;
  venue_type: {
    name: string;
    category: string;
    icon: string;
  };
  neighborhood: NeighborhoodData;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  price_level: number;
  is_lgbtq_friendly: boolean;
  operating_hours: any;
}

export const useCityDiscovery = () => {
  const [loading, setLoading] = useState(false);

  // Get all neighborhoods in a city
  const getCityNeighborhoods = useCallback(async (cityName: string, state: string, country: string): Promise<NeighborhoodData[]> => {
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
      console.error('Error fetching city neighborhoods:', error);
      return [];
    }
  }, []);

  // Get venues in a specific neighborhood
  const getNeighborhoodVenues = useCallback(async (neighborhoodId: string): Promise<VenueData[]> => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select(`
          *,
          venue_type:venue_types(*),
          neighborhood:neighborhoods(*)
        `)
        .eq('neighborhood_id', neighborhoodId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching neighborhood venues:', error);
      return [];
    }
  }, []);

  // Get venues by category in a city
  const getVenuesByCategory = useCallback(async (
    cityName: string, 
    state: string, 
    country: string, 
    category: string
  ): Promise<VenueData[]> => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select(`
          *,
          venue_type:venue_types(*),
          neighborhood:neighborhoods(*)
        `)
        .eq('neighborhood.city', cityName)
        .eq('neighborhood.state', state)
        .eq('neighborhood.country', country)
        .eq('venue_type.category', category);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching venues by category:', error);
      return [];
    }
  }, []);

  // Find venues near a location
  const findNearbyVenues = useCallback(async (
    lat: number, 
    lng: number, 
    radiusKm: number = 2,
    category?: string
  ): Promise<VenueData[]> => {
    setLoading(true);
    try {
      let query = supabase
        .from('venues')
        .select(`
          *,
          venue_type:venue_types(*),
          neighborhood:neighborhoods(*)
        `);

      if (category) {
        query = query.eq('venue_type.category', category);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Filter by distance (client-side for now)
      const filteredVenues = (data || []).filter(venue => {
        const distance = calculateDistance(lat, lng, venue.lat, venue.lng);
        return distance <= radiusKm;
      });

      return filteredVenues;
    } catch (error) {
      console.error('Error finding nearby venues:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to calculate distance
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get city statistics
  const getCityStats = useCallback(async (cityName: string, state: string, country: string) => {
    try {
      const [cityData, neighborhoods, venueCount] = await Promise.all([
        supabase
          .from('cities')
          .select('*')
          .eq('name', cityName)
          .eq('state', state)
          .eq('country', country)
          .single(),
        supabase
          .from('neighborhoods')
          .select('*')
          .eq('city', cityName)
          .eq('state', state)
          .eq('country', country),
        supabase
          .from('venues')
          .select('id', { count: 'exact' })
          .eq('neighborhood.city', cityName)
      ]);

      return {
        city: cityData.data,
        neighborhoodCount: neighborhoods.data?.length || 0,
        venueCount: venueCount.count || 0,
        avgTransitScore: neighborhoods.data?.reduce((sum, n) => sum + (n.transit_score || 0), 0) / (neighborhoods.data?.length || 1),
        avgWalkabilityScore: neighborhoods.data?.reduce((sum, n) => sum + (n.walkability_score || 0), 0) / (neighborhoods.data?.length || 1),
      };
    } catch (error) {
      console.error('Error fetching city stats:', error);
      return null;
    }
  }, []);

  return {
    loading,
    getCityNeighborhoods,
    getNeighborhoodVenues,
    getVenuesByCategory,
    findNearbyVenues,
    getCityStats,
    calculateDistance,
  };
};
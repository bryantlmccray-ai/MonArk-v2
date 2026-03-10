import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Venue {
  id: string;
  name: string;
  address: string | null;
  description: string | null;
  photos: string[];
  website_url: string | null;
  phone: string | null;
  category: string;
  vibe_tags: string[];
  price_level: number | null;
  rating: number | null;
  is_lgbtq_friendly: boolean;
  lat: number;
  lng: number;
}

export interface VendorProfile {
  id: string;
  name: string;
  category: string;
  description: string | null;
  photos: string[];
  website_url: string | null;
  phone: string | null;
  email: string | null;
  price_level: number;
  vibe_tags: string[];
  is_lgbtq_friendly: boolean;
}

export type VendorItem = 
  | { type: 'venue'; data: Venue }
  | { type: 'vendor'; data: VendorProfile };

export const useVendors = (filters?: { category?: string; vibe?: string }) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, [filters?.category, filters?.vibe]);

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([loadVenues(), loadVendors()]);
    } finally {
      setLoading(false);
    }
  };

  const loadVenues = async () => {
    try {
      let query = supabase
        .from('venues')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false, nullsFirst: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.vibe) {
        query = query.contains('vibe_tags', [filters.vibe]);
      }

      const { data, error } = await query;
      if (error) throw error;
      setVenues((data as any) || []);
    } catch (error) {
      console.error('Error loading venues:', error);
    }
  };

  const loadVendors = async () => {
    try {
      let query = supabase
        .from('vendor_profiles')
        .select('*')
        .order('name');

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.vibe) {
        query = query.contains('vibe_tags', [filters.vibe]);
      }

      const { data, error } = await query;
      if (error) throw error;
      setVendors((data as any) || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  const allItems: VendorItem[] = [
    ...venues.map(v => ({ type: 'venue' as const, data: v })),
    ...vendors.map(v => ({ type: 'vendor' as const, data: v })),
  ];

  const addVendorToItinerary = async (
    itineraryId: string,
    item: VendorItem,
    role: string = 'primary'
  ) => {
    try {
      const insertData: any = {
        itinerary_id: itineraryId,
        role,
      };

      if (item.type === 'venue') {
        insertData.venue_id = item.data.id;
      } else {
        insertData.vendor_profile_id = item.data.id;
      }

      const { error } = await supabase
        .from('itinerary_vendors')
        .insert(insertData);

      if (error) throw error;
      toast.success(`${item.data.name} added to your date plan!`);
      return true;
    } catch (error) {
      console.error('Error adding vendor:', error);
      toast.error('Failed to add vendor');
      return false;
    }
  };

  return {
    venues,
    vendors,
    allItems,
    loading,
    addVendorToItinerary,
    refetch: loadAll,
  };
};

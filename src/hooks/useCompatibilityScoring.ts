import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DiscoveryProfile } from '@/hooks/useDiscoveryProfiles';

export interface CompatibilityScore {
  overall_score: number;
  rif_compatibility: number;
  interest_similarity: number;
  behavioral_alignment: number;
  location_proximity: number;
  confidence_level: number;
  highlights: string[];
}

export interface UserFeedback {
  target_user_id: string;
  interaction_type: 'like' | 'pass' | 'message' | 'block';
  feedback_score: number; // 1-10 scale
  interaction_context?: string;
}

export const useCompatibilityScoring = () => {
  const [compatibilityCache, setCompatibilityCache] = useState<Map<string, CompatibilityScore>>(new Map());
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Calculate interest similarity using Jaccard index
  const calculateInterestSimilarity = (userInterests: string[], targetInterests: string[]): number => {
    if (!userInterests?.length || !targetInterests?.length) return 0;
    
    const set1 = new Set(userInterests.map(i => i.toLowerCase()));
    const set2 = new Set(targetInterests.map(i => i.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  };

  // Calculate behavioral pattern alignment
  const calculateBehavioralAlignment = (userRIF: any, targetRIF: any): number => {
    if (!userRIF || !targetRIF) return 0.5;

    const dimensions = ['intent_clarity', 'pacing_preferences', 'emotional_readiness', 'boundary_respect'];
    let totalAlignment = 0;
    let weightSum = 0;

    dimensions.forEach(dim => {
      const userScore = userRIF[dim] || 0;
      const targetScore = targetRIF[dim] || 0;
      
      // Calculate alignment (closer scores = higher alignment)
      const alignment = 1 - Math.abs(userScore - targetScore) / 10;
      
      // Weight certain dimensions more heavily
      const weight = dim === 'boundary_respect' ? 1.5 : 
                    dim === 'emotional_readiness' ? 1.3 : 1.0;
      
      totalAlignment += alignment * weight;
      weightSum += weight;
    });

    return totalAlignment / weightSum;
  };

  // ML-enhanced compatibility scoring
  const calculateEnhancedCompatibility = async (profile: DiscoveryProfile): Promise<CompatibilityScore> => {
    try {
      // Get current user's profile and RIF data
      const { data: currentUserProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      const { data: currentUserRIF } = await supabase
        .from('rif_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();

      // Calculate individual compatibility components
      const interestSimilarity = calculateInterestSimilarity(
        currentUserProfile?.interests || [], 
        profile.interests || []
      );

      const behavioralAlignment = calculateBehavioralAlignment(
        currentUserRIF, 
        profile.rifProfile
      );

      // Location proximity score (closer = higher score)
      const locationProximity = profile.distance ? 
        Math.max(0, 1 - (profile.distance / 50)) : 0.5; // Normalize to 50km max

      // RIF compatibility (existing calculation)
      const rifCompatibility = profile.rifProfile && currentUserRIF ? 
        await calculateRIFCompatibility(currentUserRIF, profile.rifProfile) : 0.5;

      // ML-weighted overall score
      const weights = {
        rif: 0.35,
        interests: 0.25,
        behavioral: 0.25,
        location: 0.15
      };

      const overallScore = 
        (rifCompatibility * weights.rif) +
        (interestSimilarity * weights.interests) +
        (behavioralAlignment * weights.behavioral) +
        (locationProximity * weights.location);

      // Generate highlights based on strong compatibility areas
      const highlights = [];
      if (rifCompatibility > 0.8) highlights.push('Strong emotional alignment');
      if (interestSimilarity > 0.6) highlights.push('Many shared interests');
      if (behavioralAlignment > 0.7) highlights.push('Compatible communication styles');
      if (locationProximity > 0.8) highlights.push('Lives nearby');

      // Calculate confidence based on available data
      const dataCompleteness = [
        profile.rifProfile ? 1 : 0,
        profile.interests?.length ? 1 : 0,
        profile.distance ? 1 : 0,
        currentUserRIF ? 1 : 0
      ].reduce((a, b) => a + b, 0) / 4;

      return {
        overall_score: overallScore,
        rif_compatibility: rifCompatibility,
        interest_similarity: interestSimilarity,
        behavioral_alignment: behavioralAlignment,
        location_proximity: locationProximity,
        confidence_level: dataCompleteness,
        highlights
      };
    } catch (error) {
      console.error('Error calculating enhanced compatibility:', error);
      return {
        overall_score: 0.5,
        rif_compatibility: 0.5,
        interest_similarity: 0.5,
        behavioral_alignment: 0.5,
        location_proximity: 0.5,
        confidence_level: 0.2,
        highlights: []
      };
    }
  };

  const calculateRIFCompatibility = async (userRIF: any, targetRIF: any): Promise<number> => {
    try {
      const { data, error } = await supabase.functions.invoke('rif-engine', {
        body: {
          action: 'calculate_compatibility',
          data: { 
            user_rif: userRIF,
            target_rif: targetRIF
          }
        }
      });

      if (error) throw error;
      return data?.compatibility?.overall_compatibility || 0.5;
    } catch (error) {
      console.error('Error calling RIF compatibility:', error);
      return 0.5;
    }
  };

  // Submit user feedback for ML learning
  const submitFeedback = async (feedback: UserFeedback) => {
    try {
      if (!user) return;

      await supabase
        .from('user_compatibility_feedback')
        .insert({
          user_id: user.id,
          target_user_id: feedback.target_user_id,
          interaction_type: feedback.interaction_type,
          feedback_score: feedback.feedback_score,
          interaction_context: feedback.interaction_context,
          timestamp: new Date().toISOString()
        });

      // Trigger ML model retraining (async)
      supabase.functions.invoke('ml-compatibility-trainer', {
        body: { user_id: user.id }
      }).catch(console.error);

    } catch (error) {
      console.error('Error submitting compatibility feedback:', error);
    }
  };

  // Get compatibility score for a profile (with caching)
  const getCompatibilityScore = async (profile: DiscoveryProfile): Promise<CompatibilityScore> => {
    const cacheKey = profile.user_id;
    
    if (compatibilityCache.has(cacheKey)) {
      return compatibilityCache.get(cacheKey)!;
    }

    setLoading(true);
    const score = await calculateEnhancedCompatibility(profile);
    
    setCompatibilityCache(prev => new Map(prev).set(cacheKey, score));
    setLoading(false);
    
    return score;
  };

  // Batch calculate compatibility for multiple profiles
  const batchCalculateCompatibility = async (profiles: DiscoveryProfile[]): Promise<Map<string, CompatibilityScore>> => {
    setLoading(true);
    const results = new Map<string, CompatibilityScore>();
    
    // Calculate in parallel but with rate limiting
    const batchSize = 5;
    for (let i = 0; i < profiles.length; i += batchSize) {
      const batch = profiles.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async profile => ({
          id: profile.user_id,
          score: await calculateEnhancedCompatibility(profile)
        }))
      );
      
      batchResults.forEach(result => {
        results.set(result.id, result.score);
      });
    }
    
    setCompatibilityCache(results);
    setLoading(false);
    
    return results;
  };

  return {
    getCompatibilityScore,
    batchCalculateCompatibility,
    submitFeedback,
    loading,
    compatibilityCache
  };
};
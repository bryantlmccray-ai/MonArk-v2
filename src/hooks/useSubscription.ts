/**
 * useSubscription.ts — MonArk Subscription Hook
 *
 * Provides reactive subscription state and feature gating throughout the app.
 *
 * Usage:
 *   const { tier, isPlus, isMonarch, hasFeature, showPaywall, setShowPaywall } = useSubscription();
 *
 *   // Gate a feature
 *   if (!hasFeature('conversation_tracker')) {
 *     setShowPaywall(true);
 *     return;
 *   }
 *
 *   // Check tier directly
 *   {isPlus && <PlusOnlyComponent />}
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = "free" | "plus" | "monarch";

interface SubscriptionState {
  tier: SubscriptionTier;
  status: string;
  expiresAt: string | null;
  trialEndsAt: string | null;
  loading: boolean;
}

// Feature → minimum tier mapping
const FEATURE_TIERS: Record<string, SubscriptionTier[]> = {
  // Free tier (everyone)
  view_matches: ["free", "plus", "monarch"],
  basic_profile: ["free", "plus", "monarch"],
  rif_quiz: ["free", "plus", "monarch"],

  // Plus tier
  unlimited_matches: ["plus", "monarch"],
  conversation_tracker: ["plus", "monarch"],
  date_concierge: ["plus", "monarch"],
  weekly_eq_insights: ["plus", "monarch"],

  // Monarch tier
  priority_curation: ["monarch"],
  venue_concierge: ["monarch"],
  relationship_coaching: ["monarch"],
  advanced_analytics: ["monarch"],
};

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    tier: "free",
    status: "inactive",
    expiresAt: null,
    trialEndsAt: null,
    loading: true,
  });
  const [showPaywall, setShowPaywall] = useState(false);

  // Fetch subscription state from Supabase
  useEffect(() => {
    let mounted = true;

    async function fetchSubscription() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || !mounted) return;

        const { data, error } = await supabase
          .from("user_profiles")
          .select(
            "subscription_tier, subscription_status, subscription_expires_at, trial_ends_at"
          )
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (mounted && data) {
          setState({
            tier: (data.subscription_tier as SubscriptionTier) || "free",
            status: data.subscription_status || "inactive",
            expiresAt: data.subscription_expires_at,
            trialEndsAt: data.trial_ends_at,
            loading: false,
          });
        }
      } catch (err) {
        console.error("Failed to fetch subscription:", err);
        if (mounted) {
          setState({
            tier: "free",
            status: "inactive",
            expiresAt: null,
            trialEndsAt: null,
            loading: false,
          });
        }
      }
    }

    fetchSubscription();

    // Listen for realtime changes to subscription — use user-scoped channel name
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupChannel = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted || !user) return;

      channel = supabase
        .channel(`subscription-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "user_profiles",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const row = payload.new as Record<string, unknown>;
            setState({
              tier: (row.subscription_tier as SubscriptionTier) || "free",
              status: (row.subscription_status as string) || "inactive",
              expiresAt: row.subscription_expires_at as string | null,
              trialEndsAt: row.trial_ends_at as string | null,
              loading: false,
            });
          }
        )
        .subscribe();
    };

    setupChannel();

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Check if user has access to a specific feature
  const hasFeature = useCallback(
    (featureName: string): boolean => {
      if (state.loading) return false;

      const allowedTiers = FEATURE_TIERS[featureName];
      if (!allowedTiers) return false;

      // Check if current tier is in the allowed list AND status is active
      const tierActive =
        state.status === "active" || state.tier === "free";
      return allowedTiers.includes(state.tier) && tierActive;
    },
    [state.tier, state.status, state.loading]
  );

  // Convenience: gate a feature and auto-show paywall if blocked
  const requireFeature = useCallback(
    (featureName: string): boolean => {
      const allowed = hasFeature(featureName);
      if (!allowed) setShowPaywall(true);
      return allowed;
    },
    [hasFeature]
  );

  // Display-friendly tier label (never shows "Free")
  const tierLabel = state.tier === "monarch"
    ? "Inner Ark"
    : state.tier === "plus"
    ? "The Ark"
    : "Early Access";

  return {
    // State
    tier: state.tier,
    status: state.status,
    expiresAt: state.expiresAt,
    trialEndsAt: state.trialEndsAt,
    loading: state.loading,

    // Tier checks
    isFree: state.tier === "free",
    isPlus: state.tier === "plus" || state.tier === "monarch",
    isMonarch: state.tier === "monarch",
    isActive: state.status === "active" || state.tier === "free",
    isTrialing: state.trialEndsAt ? new Date(state.trialEndsAt) > new Date() : false,

    // Display
    tierLabel,

    // Feature gating
    hasFeature,
    requireFeature,

    // Paywall control
    showPaywall,
    setShowPaywall,
  };
}

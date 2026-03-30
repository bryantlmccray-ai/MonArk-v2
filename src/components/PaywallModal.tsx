/**
 * PaywallModal.tsx — MonArk Subscription Paywall
 *
 * Full MonArk brand system applied.
 * Integrates with RevenueCat for purchase flow and Supabase for tier state.
 *
 * Usage:
 *   <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
 *
 * Required env vars (set in Lovable project settings):
 *   VITE_REVENUECAT_API_KEY — RevenueCat public SDK key
 *   VITE_SUPABASE_URL — MonArk Supabase project URL
 *   VITE_SUPABASE_ANON_KEY — MonArk Supabase anon key
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── MonArk Brand Tokens ─────────────────────────────────────
const tokens = {
  background: "#E8DED4",
  card: "#F2EDE8",
  bone: "#EDE6DF",
  sand: "#D9D0C5",
  foreground: "#3D3428",
  primary: "#A08C6E",
  accent: "#7A5040",
  dustyRose: "#C48880",
  rosegold: "#A06050",
  warmGlow: "#B89870",
  olive: "#6B7040",
  darkBg: "#1A1C24",
  darkNavy: "#1C1F2E",
  goldOnDark: "#D4B896",
  whiteSoft: "#F0EBE3",
};

// ─── Tier Definitions ────────────────────────────────────────
type TierKey = "free" | "plus" | "monarch";

interface TierConfig {
  name: string;
  tagline: string;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
  productId: string;
}

const tiers: Record<TierKey, TierConfig> = {
  free: {
    name: "Free",
    tagline: "Begin with intention",
    price: "$0",
    period: "",
    features: [
      "3 curated matches per week",
      "Basic RIF profile",
      "Neighborhood discovery",
      "Community safety features",
    ],
    highlighted: false,
    productId: "",
  },
  plus: {
    name: "Plus",
    tagline: "Date with depth",
    price: "$14.99",
    period: "/mo",
    features: [
      "Everything in Free",
      "Unlimited curated matches",
      "Conversation tracker",
      "AI date concierge",
      "Weekly EQ insights",
      "Priority match delivery",
    ],
    highlighted: true,
    productId: "monark_plus_monthly",
  },
  monarch: {
    name: "Monarch",
    tagline: "The full experience",
    price: "$29.99",
    period: "/mo",
    features: [
      "Everything in Plus",
      "Priority curation queue",
      "Venue concierge",
      "Relationship coaching",
      "Advanced analytics",
      "Early access to features",
    ],
    highlighted: false,
    productId: "monark_monarch_monthly",
  },
};

// ─── Styles ──────────────────────────────────────────────────
const styles = {
  overlay: {
    position: "fixed" as const,
    inset: 0,
    backgroundColor: "rgba(26, 28, 36, 0.7)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "24px",
  },
  modal: {
    backgroundColor: tokens.card,
    borderRadius: "20px",
    maxWidth: "920px",
    width: "100%",
    padding: "48px 40px",
    position: "relative" as const,
    boxShadow: "0 24px 80px rgba(61, 52, 40, 0.2)",
    maxHeight: "90vh",
    overflowY: "auto" as const,
  },
  closeButton: {
    position: "absolute" as const,
    top: "20px",
    right: "20px",
    background: "none",
    border: "none",
    color: tokens.sand,
    fontSize: "24px",
    cursor: "pointer",
    padding: "8px",
    lineHeight: 1,
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "40px",
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "36px",
    fontWeight: 400,
    color: tokens.foreground,
    marginBottom: "8px",
  },
  subtitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "16px",
    fontWeight: 300,
    color: tokens.accent,
    letterSpacing: "0.02em",
  },
  tiersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "32px",
  },
  tierCard: (highlighted: boolean, isSelected: boolean) => ({
    backgroundColor: highlighted ? tokens.foreground : tokens.background,
    borderRadius: "16px",
    padding: "32px 24px",
    border: isSelected
      ? `2px solid ${tokens.primary}`
      : highlighted
      ? "none"
      : `1px solid ${tokens.bone}`,
    cursor: "pointer",
    transition: "all 0.25s ease",
    position: "relative" as const,
    transform: isSelected ? "scale(1.02)" : "none",
  }),
  tierBadge: {
    position: "absolute" as const,
    top: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: tokens.primary,
    color: tokens.whiteSoft,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    padding: "4px 16px",
    borderRadius: "20px",
  },
  tierName: (highlighted: boolean) => ({
    fontFamily: "'Playfair Display', serif",
    fontSize: "24px",
    fontWeight: 400,
    color: highlighted ? tokens.whiteSoft : tokens.foreground,
    marginBottom: "4px",
  }),
  tierTagline: (highlighted: boolean) => ({
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    fontWeight: 300,
    fontStyle: "italic" as const,
    color: highlighted ? tokens.goldOnDark : tokens.accent,
    marginBottom: "20px",
  }),
  tierPrice: (highlighted: boolean) => ({
    fontFamily: "'Playfair Display', serif",
    fontSize: "32px",
    fontWeight: 700,
    color: highlighted ? tokens.goldOnDark : tokens.primary,
    marginBottom: "4px",
  }),
  tierPeriod: (highlighted: boolean) => ({
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    fontWeight: 300,
    color: highlighted ? tokens.sand : tokens.accent,
    marginBottom: "24px",
  }),
  featureList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  featureItem: (highlighted: boolean) => ({
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    fontWeight: 300,
    color: highlighted ? tokens.sand : tokens.foreground,
    padding: "6px 0",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  }),
  featureCheck: (highlighted: boolean) => ({
    color: highlighted ? tokens.goldOnDark : tokens.primary,
    flexShrink: 0,
    marginTop: "2px",
    fontSize: "14px",
  }),
  ctaButton: (highlighted: boolean, loading: boolean) => ({
    width: "100%",
    padding: "14px 32px",
    borderRadius: "40px",
    border: highlighted ? "none" : `1.5px solid ${tokens.primary}`,
    backgroundColor: highlighted ? tokens.primary : "transparent",
    color: highlighted ? tokens.whiteSoft : tokens.primary,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    fontWeight: 500,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    cursor: loading ? "wait" : "pointer",
    opacity: loading ? 0.6 : 1,
    transition: "all 0.25s ease",
    marginTop: "24px",
  }),
  footer: {
    textAlign: "center" as const,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12px",
    color: tokens.sand,
    lineHeight: 1.6,
  },
  // Mobile responsive override
  mobileGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  },
};

// ─── Component ───────────────────────────────────────────────
interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: TierKey;
}

export default function PaywallModal({
  isOpen,
  onClose,
  currentTier = "free",
}: PaywallModalProps) {
  const [selectedTier, setSelectedTier] = useState<TierKey>(
    currentTier === "free" ? "plus" : currentTier
  );
  const [loading, setLoading] = useState(false);
  const [isMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );

  if (!isOpen) return null;

  const handlePurchase = async (tier: TierKey) => {
    if (tier === "free" || tier === currentTier) {
      onClose();
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const productId = tiers[tier].productId;

      // RevenueCat purchase flow
      // In production, this calls the RevenueCat SDK
      // For web, we use the RevenueCat Billing API
      const rcApiKey = import.meta.env.VITE_REVENUECAT_API_KEY;

      if (rcApiKey) {
        // Production: RevenueCat Web SDK purchase
        const response = await fetch(
          `https://api.revenuecat.com/v1/subscribers/${user.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${rcApiKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          // Trigger the purchase modal from RevenueCat
          // The webhook will handle the rest via sync-subscription edge function
          window.open(
            `https://pay.rev.cat/${productId}?app_user_id=${user.id}`,
            "_blank",
            "width=500,height=700"
          );
        }
      } else {
        // Development: directly update tier for testing
        const { error } = await supabase
          .from("user_profiles")
          .update({
            subscription_tier: tier,
            subscription_status: "active",
          })
          .eq("user_id", user.id);

        if (error) throw error;
      }

      onClose();
    } catch (err) {
      console.error("Purchase failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        <button style={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Choose your path</h2>
          <p style={styles.subtitle}>
            Every tier is designed with intention. Upgrade when you're ready.
          </p>
        </div>

        {/* Tier Cards */}
        <div style={isMobile ? styles.mobileGrid : styles.tiersGrid}>
          {(Object.keys(tiers) as TierKey[]).map((key) => {
            const tier = tiers[key];
            const isSelected = selectedTier === key;
            const isCurrent = currentTier === key;

            return (
              <div
                key={key}
                style={styles.tierCard(tier.highlighted, isSelected)}
                onClick={() => setSelectedTier(key)}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 32px rgba(61, 52, 40, 0.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                {tier.highlighted && (
                  <div style={styles.tierBadge}>Recommended</div>
                )}

                <div style={styles.tierName(tier.highlighted)}>{tier.name}</div>
                <div style={styles.tierTagline(tier.highlighted)}>
                  {tier.tagline}
                </div>

                <div style={styles.tierPrice(tier.highlighted)}>
                  {tier.price}
                </div>
                <div style={styles.tierPeriod(tier.highlighted)}>
                  {tier.period || "\u00A0"}
                </div>

                <ul style={styles.featureList}>
                  {tier.features.map((feature, i) => (
                    <li key={i} style={styles.featureItem(tier.highlighted)}>
                      <span style={styles.featureCheck(tier.highlighted)}>
                        &#10003;
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  style={styles.ctaButton(tier.highlighted, loading && isSelected)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchase(key);
                  }}
                  disabled={loading || isCurrent}
                  onMouseEnter={(e) => {
                    if (tier.highlighted) {
                      e.currentTarget.style.backgroundColor = tokens.warmGlow;
                    } else {
                      e.currentTarget.style.backgroundColor = tokens.sand;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (tier.highlighted) {
                      e.currentTarget.style.backgroundColor = tokens.primary;
                    } else {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {isCurrent
                    ? "Current plan"
                    : loading && isSelected
                    ? "Processing..."
                    : key === "free"
                    ? "Stay on Free"
                    : `Upgrade to ${tier.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p>Cancel anytime. No questions asked.</p>
          <p style={{ marginTop: "4px", opacity: 0.7 }}>
            Subscriptions are managed securely through RevenueCat.
          </p>
        </div>
      </div>
    </div>
  );
}

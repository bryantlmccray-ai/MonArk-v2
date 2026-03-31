/**
 * PaywallModal.tsx — MonArk Subscription Paywall
 *
 * Two paid tiers: The Ark and The Inner Ark, with monthly/quarterly toggle.
 * Redirects to RevenueCat web billing for purchase.
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────
type TierKey = "free" | "plus" | "monarch";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: TierKey;
}

// ─── Tier Config ─────────────────────────────────────────────
const TIERS = [
  {
    key: "free" as TierKey,
    name: "Free",
    tagline: "Explore with intention",
    monthly: 0,
    quarterlyPerMonth: 0,
    quarterlySavings: 0,
    features: [
      "3 curated matches per week",
      "Basic RIF profile",
      "Neighborhood discovery",
      "Community safety features",
    ],
    productIdMonthly: "",
    productIdQuarterly: "",
    highlighted: false,
  },
  {
    key: "plus" as TierKey,
    name: "The Ark",
    tagline: "The full MonArk experience",
    monthly: 39.99,
    quarterlyPerMonth: 33.99,
    quarterlySavings: 18,
    features: [
      'Weekly "Your 3" curated matches',
      "Access to Discovery Map",
      "In-app messaging",
      "Close the Loop anti-ghosting",
      "Basic RIF compatibility insights",
      "MonArk venue recommendations",
    ],
    productIdMonthly: "monark_ark_monthly",
    productIdQuarterly: "monark_ark_quarterly",
    highlighted: true,
  },
  {
    key: "monarch" as TierKey,
    name: "The Inner Ark",
    tagline: "Deeper insights, wider reach",
    monthly: 79.99,
    quarterlyPerMonth: 67.99,
    quarterlySavings: 36,
    features: [
      "Everything in The Ark",
      "Priority match queue",
      "5 curated matches instead of 3",
      "Full RIF compatibility report",
      "Concierge date planning",
      "Early access to new features",
      "Inner Ark badge",
    ],
    productIdMonthly: "monark_inner_ark_monthly",
    productIdQuarterly: "monark_inner_ark_quarterly",
    highlighted: false,
  },
];

// ─── Brand Tokens ────────────────────────────────────────────
const t = {
  bg: "#E8DED4",
  card: "#F2EDE8",
  bone: "#EDE6DF",
  sand: "#D9D0C5",
  fg: "#3D3428",
  primary: "#A08C6E",
  accent: "#7A5040",
  warmGlow: "#B89870",
  darkBg: "#1A1C24",
  darkNavy: "#1C1F2E",
  goldOnDark: "#D4B896",
  white: "#F0EBE3",
};

export default function PaywallModal({
  isOpen,
  onClose,
  currentTier = "free",
}: PaywallModalProps) {
  const [isQuarterly, setIsQuarterly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async (tierKey: TierKey) => {
    if (tierKey === "free" || tierKey === currentTier) {
      onClose();
      return;
    }

    const tier = TIERS.find((t) => t.key === tierKey);
    if (!tier) return;

    setLoading(tierKey);

    try {
      const rcApiKey = import.meta.env.VITE_REVENUECAT_API_KEY;

      if (!rcApiKey) {
        toast({
          title: "Payment not available",
          description: "Subscription system is not configured yet. Please contact support.",
          variant: "destructive",
        });
        setLoading(null);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const productId = isQuarterly
        ? tier.productIdQuarterly
        : tier.productIdMonthly;

      if (!productId) {
        throw new Error("Product not configured. Please contact support.");
      }

      // RevenueCat web billing — redirect to hosted checkout
      const billingUrl = `https://pay.rev.cat/${rcApiKey}?app_user_id=${encodeURIComponent(user.id)}&product=${encodeURIComponent(productId)}`;
      window.open(billingUrl, "_blank", "noopener,noreferrer");

      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Purchase failed. Please try again.";
      console.error("Purchase failed:", message);
      toast({
        title: "Purchase failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(26,28,36,0.7)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "24px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        style={{
          backgroundColor: t.card,
          borderRadius: "20px",
          maxWidth: "960px",
          width: "100%",
          padding: "48px 40px",
          position: "relative",
          boxShadow: "0 24px 80px rgba(61,52,40,0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "none",
            border: "none",
            color: t.sand,
            fontSize: 24,
            cursor: "pointer",
            padding: 8,
            lineHeight: 1,
          }}
        >
          &times;
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              fontWeight: 400,
              color: t.fg,
              marginBottom: 8,
            }}
          >
            Choose your path
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 300,
              color: t.accent,
            }}
          >
            Every tier is designed with intention.
          </p>
        </div>

        {/* Billing Toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginBottom: 36,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: isQuarterly ? 300 : 500,
              color: isQuarterly ? t.sand : t.fg,
              transition: "all 0.2s",
            }}
          >
            Monthly
          </span>
          <Switch
            checked={isQuarterly}
            onCheckedChange={setIsQuarterly}
          />
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: isQuarterly ? 500 : 300,
              color: isQuarterly ? t.fg : t.sand,
              transition: "all 0.2s",
            }}
          >
            Quarterly
          </span>
        </div>

        {/* Tier Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              typeof window !== "undefined" && window.innerWidth < 768
                ? "1fr"
                : "repeat(3, 1fr)",
            gap: 20,
            marginBottom: 32,
          }}
        >
          {TIERS.map((tier) => {
            const isCurrent = currentTier === tier.key;
            const price = isQuarterly ? tier.quarterlyPerMonth : tier.monthly;
            const isHighlighted = tier.highlighted;
            const isLoading = loading === tier.key;

            return (
              <div
                key={tier.key}
                style={{
                  backgroundColor: isHighlighted ? t.fg : t.bg,
                  borderRadius: 16,
                  padding: "32px 24px",
                  border: isHighlighted ? "none" : `1px solid ${t.bone}`,
                  position: "relative",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(61,52,40,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {isHighlighted && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: t.primary,
                      color: t.white,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      padding: "4px 16px",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 24,
                    fontWeight: 400,
                    color: isHighlighted ? t.white : t.fg,
                    marginBottom: 4,
                  }}
                >
                  {tier.name}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 300,
                    fontStyle: "italic",
                    color: isHighlighted ? t.goldOnDark : t.accent,
                    marginBottom: 20,
                  }}
                >
                  {tier.tagline}
                </div>

                {/* Price with animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${tier.key}-${isQuarterly}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 32,
                        fontWeight: 700,
                        color: isHighlighted ? t.goldOnDark : t.primary,
                        marginBottom: 4,
                      }}
                    >
                      {price === 0 ? "$0" : `$${price.toFixed(2)}`}
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: 300,
                        color: isHighlighted ? t.sand : t.accent,
                        marginBottom: isQuarterly && tier.quarterlySavings > 0 ? 4 : 24,
                      }}
                    >
                      {price === 0 ? "\u00A0" : "/mo"}
                    </div>
                    {isQuarterly && tier.quarterlySavings > 0 && (
                      <div
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          fontWeight: 500,
                          color: isHighlighted ? "#8BC28B" : "#5A8A5A",
                          marginBottom: 20,
                        }}
                      >
                        Save ${tier.quarterlySavings} — billed $
                        {(tier.quarterlyPerMonth * 3).toFixed(2)}/quarter
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {tier.features.map((feature, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: 300,
                        color: isHighlighted ? t.sand : t.fg,
                        padding: "6px 0",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          color: isHighlighted ? t.goldOnDark : t.primary,
                          flexShrink: 0,
                          marginTop: 2,
                          fontSize: 14,
                        }}
                      >
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(tier.key)}
                  disabled={isLoading || isCurrent}
                  style={{
                    width: "100%",
                    padding: "14px 32px",
                    borderRadius: 40,
                    border: isHighlighted
                      ? "none"
                      : `1.5px solid ${t.primary}`,
                    backgroundColor: isHighlighted ? t.primary : "transparent",
                    color: isHighlighted ? t.white : t.primary,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: isLoading ? "wait" : "pointer",
                    opacity: isLoading ? 0.6 : 1,
                    transition: "all 0.25s ease",
                    marginTop: 24,
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.backgroundColor = isHighlighted
                        ? t.warmGlow
                        : t.sand;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.backgroundColor = isHighlighted
                        ? t.primary
                        : "transparent";
                    }
                  }}
                >
                  {isCurrent
                    ? "Current plan"
                    : isLoading
                    ? "Processing..."
                    : tier.key === "free"
                    ? "Stay on Free"
                    : `Upgrade to ${tier.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: t.sand,
            lineHeight: 1.6,
          }}
        >
          <p>Cancel anytime. No questions asked.</p>
          <p style={{ marginTop: 4, opacity: 0.7 }}>
            Subscriptions managed securely through RevenueCat.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

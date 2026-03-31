import { useState } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface MonArkPricingProps {
  onSelectPlan?: (planName: string) => void;
}

const TIERS = {
  ark: {
    name: "The Ark",
    monthly: 59,
    quarterlyPerMonth: 47,
    quarterlySavings: 36,
    badge: null,
    description:
      "The full MonArk experience. Three curated connections every week, built on emotional intelligence.",
    features: [
      'Weekly "Your 3" curated matches',
      "Access to Discovery Map",
      "In-app messaging",
      "Close the Loop anti-ghosting feature",
      "Basic RIF compatibility insights",
      "MonArk venue recommendations with matches",
    ],
    cta: "Join The Ark",
    accent: false,
  },
  innerArk: {
    name: "The Inner Ark",
    monthly: 129,
    quarterlyPerMonth: 103,
    quarterlySavings: 78,
    badge: "Most Intentional",
    description:
      "The elevated experience. Deeper insights, wider reach, and concierge-level curation.",
    features: [
      "Everything in The Ark",
      "Priority match queue — first pick before standard members",
      "Expanded match pool — 5 curated instead of 3",
      "Full RIF compatibility report per match",
      "Concierge date planning suggestions",
      "Early access to new features",
      "Inner Ark badge — visible signal of seriousness",
    ],
    cta: "Go Deeper",
    accent: true,
  },
};

const FOUNDING = {
  name: "Founding Members",
  tagline: "First 200 Signups",
  description:
    "Lock in lifetime pricing and get full access to every Inner Ark feature as we roll them out. Founding Members shape the platform from day one — with a direct line to the team building MonArk.",
  cta: "Claim Founding Access",
};

const easeOut = [0.22, 1, 0.36, 1] as const;

export const MonArkPricing = ({ onSelectPlan }: MonArkPricingProps = {}) => {
  const [isQuarterly, setIsQuarterly] = useState(false);

  return (
    <section id="pricing" className="bg-background py-20 px-6 scroll-mt-16">
      <div className="max-w-[1100px] mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: easeOut }}
        >
          <p className="font-caption text-primary mb-3">Membership</p>
          <h2 className="font-editorial text-4xl md:text-[42px] text-foreground mb-3">
            Invest in how you connect
          </h2>
          <p className="font-body text-base text-muted-foreground max-w-[520px] mx-auto">
            No free tier. No swiping. Every MonArk member is here with intention.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={`text-sm font-body transition-all duration-300 ${
              isQuarterly
                ? "text-muted-foreground font-normal"
                : "text-foreground font-semibold"
            }`}
          >
            Monthly
          </span>
          <Switch
            checked={isQuarterly}
            onCheckedChange={setIsQuarterly}
            className="data-[state=checked]:bg-primary"
          />
          <span
            className={`text-sm font-body transition-all duration-300 ${
              isQuarterly
                ? "text-foreground font-semibold"
                : "text-muted-foreground font-normal"
            }`}
          >
            Quarterly
          </span>
          {isQuarterly && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full tracking-wide uppercase"
            >
              Save 20%
            </motion.span>
          )}
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {Object.values(TIERS).map((tier, idx) => {
            const price = isQuarterly ? tier.quarterlyPerMonth : tier.monthly;
            const quarterlyTotal = (tier.quarterlyPerMonth * 3);
            const isAccent = tier.accent;
            const cardKey = `${tier.name}-${isQuarterly ? 'q' : 'm'}`;

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: easeOut }}
                whileHover={{ y: -4 }}
                className={`relative flex flex-col rounded-2xl p-8 md:p-10 transition-shadow duration-300 ${
                  isAccent
                    ? "bg-[hsl(230_18%_15%)] shadow-[0_8px_40px_rgba(28,31,46,0.3)] hover:shadow-[0_12px_48px_rgba(28,31,46,0.4)]"
                    : "bg-card border border-border shadow-editorial hover:shadow-elevated"
                }`}
              >
                {/* Badge */}
                {tier.badge && (
                  <Badge className="absolute -top-3 right-6 bg-primary text-primary-foreground text-[11px] tracking-[0.12em] uppercase px-4 py-1.5 rounded-full">
                    {tier.badge}
                  </Badge>
                )}

                {/* Tier Name */}
                <h3
                  className={`font-editorial text-2xl mb-2 ${
                    isAccent
                      ? "text-[hsl(30_40%_72%)]"
                      : "text-foreground"
                  }`}
                >
                  {tier.name}
                </h3>

                {/* Description */}
                <p
                  className={`font-body text-sm leading-relaxed mb-6 ${
                    isAccent ? "text-[hsl(240_6%_64%)]" : "text-muted-foreground"
                  }`}
                >
                  {tier.description}
                </p>

                {/* Price */}
                <div className="mb-7">
                  <motion.div
                    key={`${tier.name}-${isQuarterly}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span
                      className={`font-editorial-headline text-5xl leading-none ${
                        isAccent ? "text-[hsl(28_38%_94%)]" : "text-foreground"
                      }`}
                    >
                      ${price.toFixed(2).split(".")[0]}
                    </span>
                    <span
                      className={`text-xl font-medium align-super ${
                        isAccent ? "text-[hsl(30_40%_72%)]" : "text-primary"
                      }`}
                    >
                      .{price.toFixed(2).split(".")[1]}
                    </span>
                    <span
                      className={`text-sm ml-1 ${
                        isAccent ? "text-[hsl(240_6%_46%)]" : "text-muted-foreground"
                      }`}
                    >
                      /mo
                    </span>
                  </motion.div>
                  {isQuarterly && (
                    <motion.div
                      className="mt-1.5 flex items-center gap-2"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <p
                        className={`text-xs ${
                          isAccent ? "text-[hsl(240_6%_46%)]" : "text-muted-foreground"
                        }`}
                      >
                        Billed ${quarterlyTotal.toFixed(2)} every 3 months
                      </p>
                      <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Save ${tier.quarterlySavings}
                      </span>
                    </motion.div>
                  )}
                  <p
                    className={`text-xs italic font-editorial mt-2 ${
                      isAccent ? "text-[hsl(30_40%_72%/0.7)]" : "text-primary/70"
                    }`}
                  >
                    {isAccent ? "Only 8 spots remaining this month" : "Only 12 spots remaining this month"}
                  </p>
                </div>

                {/* Divider */}
                <div
                  className={`h-px mb-6 ${
                    isAccent
                      ? "bg-[hsl(30_40%_72%/0.15)]"
                      : "bg-border"
                  }`}
                />

                {/* Features */}
                <ul className="list-none p-0 m-0 mb-8 flex-1 space-y-3.5">
                  {tier.features.map((feature, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2.5 text-sm leading-relaxed ${
                        isAccent ? "text-[hsl(240_6%_78%)]" : "text-foreground/80"
                      }`}
                    >
                      <span
                        className={`text-sm leading-[21px] shrink-0 ${
                          isAccent ? "text-[hsl(30_40%_72%)]" : "text-primary"
                        }`}
                      >
                        ✦
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => onSelectPlan?.(tier.name)}
                  className={`w-full py-3.5 px-8 rounded-full font-body text-sm font-medium tracking-[0.12em] uppercase transition-all duration-300 ${
                    isAccent
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-transparent text-primary border-[1.5px] border-primary hover:bg-muted"
                  }`}
                >
                  {tier.cta}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Founding Members Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="bg-[hsl(230_18%_15%)] rounded-2xl p-8 md:p-10 flex items-center justify-between gap-8 flex-wrap shadow-[0_4px_24px_rgba(28,31,46,0.2)]"
        >
          <div className="flex-1 min-w-[280px]">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-editorial text-2xl text-[hsl(30_40%_72%)]">
                {FOUNDING.name}
              </h3>
              <Badge className="bg-[hsl(30_40%_72%)] text-[hsl(230_18%_15%)] text-[11px] tracking-[0.12em] uppercase px-2.5 py-0.5 rounded-full hover:bg-[hsl(30_40%_72%)]">
                Invite Only
              </Badge>
            </div>
            <p className="font-body text-sm leading-relaxed text-[hsl(240_6%_64%)] max-w-[540px]">
              {FOUNDING.description}
            </p>
          </div>
          <button
            onClick={() => onSelectPlan?.("Founding Members")}
            className="py-3.5 px-8 rounded-full border-[1.5px] border-[hsl(30_40%_72%)] bg-transparent text-[hsl(30_40%_72%)] font-body text-sm font-medium tracking-[0.12em] uppercase transition-all duration-300 hover:bg-[hsl(30_40%_72%/0.1)] whitespace-nowrap"
          >
            {FOUNDING.cta}
          </button>
        </motion.div>

        {/* Bottom Note */}
        <p className="text-center text-[13px] text-muted-foreground mt-8 italic font-editorial">
          No swiping. No algorithms. No free tier. Just intention.
        </p>
      </div>
    </section>
  );
};

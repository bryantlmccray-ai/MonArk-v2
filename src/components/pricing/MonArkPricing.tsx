import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface MonArkPricingProps {
  onSelectPlan?: (planName: string) => void;
}

const TIERS = {
  ark: {
    name: "The Ark",
    monthly: 39.99,
    quarterlyPerMonth: 29.99,
    quarterlyTotal: 89.97,
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
    cta: "RESERVE YOUR SPOT — THE ARK",
    accent: false,
  },
  innerArk: {
    name: "The Inner Ark",
    monthly: 79.99,
    quarterlyPerMonth: 59.99,
    quarterlyTotal: 179.97,
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
    cta: "RESERVE YOUR SPOT — THE INNER ARK",
    accent: true,
  },
};

const FOUNDING = {
  name: "Founding Members",
  tagline: "First 200 Signups",
  description:
    "Lock in lifetime pricing and get full access to every Inner Ark feature as we roll them out. Founding Members shape the platform from day one — with a direct line to the team building MonArk.",
  cta: "CLAIM MY FOUNDING SPOT",
};

const VALID_INVITE_CODE = "MONARK2026";

const FoundingMembersBanner = ({ onSelectPlan }: { onSelectPlan?: (plan: string) => void }) => {
  const [inviteCode, setInviteCode] = useState("");
  const [codeState, setCodeState] = useState<"idle" | "valid" | "invalid">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleVerify = () => {
    if (inviteCode.trim().toUpperCase() === VALID_INVITE_CODE) {
      setCodeState("valid");
      setTimeout(() => onSelectPlan?.("Founding Members"), 600);
    } else {
      setCodeState("invalid");
    }
  };

  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: easeOut }}
      className="relative bg-[hsl(230_18%_12%)] rounded-2xl p-8 md:p-12 shadow-[0_8px_40px_rgba(28,31,46,0.4)] border border-[hsl(30_40%_72%/0.15)] overflow-hidden"
    >
      {/* Decorative corner flourishes */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[hsl(30_40%_72%/0.2)] rounded-tl-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[hsl(30_40%_72%/0.2)] rounded-br-2xl pointer-events-none" />

      {/* Subtle gold gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(30_40%_72%/0.04)] via-transparent to-[hsl(30_40%_72%/0.02)] pointer-events-none rounded-2xl" />

      <div className="relative z-10">
        {/* Exclusive label */}
        <div className="flex items-center gap-2 mb-5">
          <div className="h-px flex-1 max-w-[40px] bg-[hsl(30_40%_72%/0.3)]" />
          <span className="text-[10px] font-caption text-[hsl(30_40%_72%/0.6)] tracking-[0.3em] uppercase">By Invitation Only</span>
          <div className="h-px flex-1 max-w-[40px] bg-[hsl(30_40%_72%/0.3)]" />
        </div>

        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-editorial text-2xl sm:text-3xl text-[hsl(30_40%_82%)]">
            {FOUNDING.name}
          </h3>
          <Badge className="bg-[hsl(30_40%_72%)] text-[hsl(230_18%_12%)] text-[10px] tracking-[0.15em] uppercase px-3 py-1 rounded-full hover:bg-[hsl(30_40%_72%)] font-medium">
            ★ {FOUNDING.tagline}
          </Badge>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-editorial text-3xl text-[hsl(30_40%_72%)]">$35</span>
          <span className="text-sm font-body text-[hsl(240_6%_55%)]">/mo — locked for life</span>
        </div>

        <p className="font-body text-xs text-[hsl(30_40%_72%/0.8)] mb-4">
          First 200 members only. Your rate is locked for life.
        </p>

        <p className="font-body text-sm leading-relaxed text-[hsl(240_6%_58%)] max-w-[520px] mb-8">
          {FOUNDING.description}
        </p>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(30_40%_72%/0.2)] to-transparent mb-8" />

        {/* Invite code input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-md">
          <input
            ref={inputRef}
            type="text"
            value={inviteCode}
            onChange={(e) => { setInviteCode(e.target.value); setCodeState("idle"); }}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            placeholder="Enter invite code"
            className="flex-1 px-5 py-3.5 rounded-full bg-[hsl(230_18%_17%)] border border-[hsl(30_40%_72%/0.25)] text-[hsl(30_40%_85%)] placeholder:text-[hsl(240_6%_40%)] font-body text-sm tracking-[0.05em] focus:outline-none focus:border-[hsl(30_40%_72%/0.6)] focus:shadow-[0_0_20px_hsl(30_40%_72%/0.1)] transition-all duration-300"
          />
          <button
            onClick={handleVerify}
            className="py-3.5 px-8 rounded-full bg-[#A08C6E] text-[#F0EBE3] font-body text-xs font-medium tracking-[0.15em] uppercase transition-all duration-300 hover:bg-[#A08C6E]/90 hover:shadow-[0_0_24px_hsl(30_40%_72%/0.15)] whitespace-nowrap"
          >
            {FOUNDING.cta}
          </button>
        </div>

        {/* Feedback messages */}
        <motion.div
          initial={false}
          animate={{ height: codeState !== "idle" ? "auto" : 0, opacity: codeState !== "idle" ? 1 : 0 }}
          className="overflow-hidden"
        >
          {codeState === "valid" && (
            <div className="mt-5 flex items-center gap-3 bg-[hsl(140_40%_20%/0.2)] border border-[hsl(140_40%_50%/0.2)] rounded-xl px-5 py-3.5">
              <span className="text-[hsl(30_40%_72%)]">★</span>
              <p className="text-sm font-editorial text-[hsl(140_40%_70%)] italic">
                Welcome, Founding Member. Redirecting you now...
              </p>
            </div>
          )}
          {codeState === "invalid" && (
            <div className="mt-5 bg-[hsl(230_18%_17%)] border border-[hsl(30_40%_72%/0.15)] rounded-xl px-5 py-3.5">
              <p className="text-sm font-body text-[hsl(240_6%_62%)] leading-relaxed">
                This tier is by invitation only.{' '}
                <button onClick={() => onSelectPlan?.("Waitlist")} className="text-[hsl(30_40%_72%)] underline underline-offset-4 decoration-[hsl(30_40%_72%/0.4)] hover:decoration-[hsl(30_40%_72%)] hover:text-[hsl(30_40%_85%)] transition-all">
                  Join the waitlist
                </button>{' '}
                to be considered.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
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
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: easeOut }}
        >
          <p className="font-caption text-primary mb-3">Membership</p>
          <h2 className="font-editorial text-4xl md:text-[42px] text-foreground mb-3">
            Invest in how you connect
          </h2>
          <p className="font-body text-base text-muted-foreground max-w-[520px] mx-auto">
            No free tier. No swiping. Every MonArk member is here with intention. Every member pays — because serious daters deserve serious matches.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="inline-flex items-center bg-secondary rounded-full p-1 gap-0.5">
            <button
              onClick={() => setIsQuarterly(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
                !isQuarterly
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsQuarterly(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300 flex items-center gap-2 ${
                isQuarterly
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Quarterly
              <span className="text-[10px] font-semibold bg-[hsl(140_45%_42%)] text-[#F0EBE3] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        {/* Founding Members Banner with Invite Code */}
        <div className="mb-12">
          <FoundingMembersBanner onSelectPlan={onSelectPlan} />
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {Object.values(TIERS).map((tier, idx) => {
            const price = isQuarterly ? tier.quarterlyPerMonth : tier.monthly;
            const quarterlyTotal = (tier.quarterlyPerMonth * 3);
            const isAccent = tier.accent;

            return (
              <motion.div
                key={tier.name}
                initial={false}
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
                        Save 25%
                      </span>
                    </motion.div>
                  )}
                  <p
                    className={`text-xs mt-2 ${
                      isAccent ? "text-[hsl(140_45%_55%)]" : "text-[hsl(140_45%_42%)]"
                    }`}
                  >
                    Locked in at launch. No charge until we go live.
                  </p>
                  <p
                    className={`text-xs font-medium mt-1 ${
                      isAccent ? "text-[hsl(30_40%_72%/0.7)]" : "text-muted-foreground"
                    }`}
                  >
                    {isAccent ? "Cancel anytime · Priority access" : "Cancel anytime"}
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
                      <span className="inline">{feature}</span>
                      {feature.includes('Inner Ark badge') && (
                        <span className="inline-flex items-center gap-0.5 ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/15 text-[10px] font-semibold text-primary whitespace-nowrap">✦ Inner Ark</span>
                      )}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => onSelectPlan?.(tier.name)}
                  className={`w-full py-3.5 px-8 rounded-[40px] font-body text-sm font-medium tracking-[0.12em] uppercase transition-all duration-300 ${
                    isAccent
                      ? "bg-[#A08C6E] text-[#F0EBE3] hover:bg-[#A08C6E]/90"
                      : "bg-[#A08C6E] text-[#F0EBE3] hover:bg-[#A08C6E]/90"
                  }`}
                >
                  {tier.cta}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <p className="text-center text-[13px] text-muted-foreground mt-8 italic font-editorial">
          No swiping. No algorithms. No free tier. Just intention.
        </p>
      </div>
    </section>
  );
};

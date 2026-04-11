import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MonArkLogo } from '@/components/MonArkLogo';
import monarkLogoHorizontal from '@/assets/monark-logo-horizontal.png';
import { PenLine, Heart, MapPin, ArrowRight, Instagram, Menu, X, HelpCircle, MessageCircleHeart, ChevronDown } from 'lucide-react';
import { MonArkPricing } from '@/components/pricing/MonArkPricing';
import { motion } from 'framer-motion';
import founderPortrait from '@/assets/founder-bryant.jpeg';
import gracePortrait from '@/assets/team/grace-omalley.png';
import { useDemo } from '@/contexts/DemoContext';
import { DemoMainApp } from './DemoMainApp';
import { WaitlistModal } from './WaitlistModal';
import { SignInModal } from '@/components/auth/SignInModal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const easeOut = [0.22, 1, 0.36, 1] as const;

const SectionDivider = () => (
  <div className="flex items-center justify-center py-2">
    <div className="h-px w-12 bg-border" />
    <div className="mx-3 h-1 w-1 rounded-full bg-primary/40" />
    <div className="h-px w-12 bg-border" />
  </div>
);

interface EnhancedLandingPageProps {
  onExitToApp?: () => void;
  onStartDemo?: () => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export const EnhancedLandingPage: React.FC<EnhancedLandingPageProps> = ({ onExitToApp, onStartDemo, onSignIn, onSignUp }) => {
  const { demoData, setDemoMode } = useDemo();
  const [showFullDemo, setShowFullDemo] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [waitlistPlan, setWaitlistPlan] = useState<string | undefined>();
  const [waitlistEmail, setWaitlistEmail] = useState<string | undefined>();
  const [heroEmail, setHeroEmail] = useState('');
  const [heroSubmitted, setHeroSubmitted] = useState(false);
  const [heroSubmitting, setHeroSubmitting] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const openWaitlist = (plan?: string, email?: string) => {
    setWaitlistPlan(plan);
    setWaitlistEmail(email);
    setShowWaitlistModal(true);
  };

  const startFullDemo = () => {
    if (onStartDemo) {
      onStartDemo();
    } else {
      setDemoMode(true);
      setShowFullDemo(true);
    }
  };

  if (showFullDemo) {
    return <DemoMainApp onClose={onExitToApp ? onExitToApp : () => setShowFullDemo(false)} />;
  }

  return (
    <div id="main-content" className="min-h-screen bg-background relative isolate">
      <div className="relative">
      {/* ═══════════ STICKY NAV ═══════════ */}
      <nav className="sticky top-0 z-50 bg-background/95 border-b border-border/50" style={{ backdropFilter: 'none' }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <img src={monarkLogoHorizontal} alt="MonArk" className="h-10 object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors tracking-wide">How It Works</a>
            <a href="#pricing" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors tracking-wide">Pricing</a>
            <button
              onClick={() => setShowSignInModal(true)}
              className="text-sm font-body text-foreground hover:text-primary transition-colors tracking-wide"
            >
              Sign In
            </button>
          </div>
          <button
            onClick={() => openWaitlist()}
            className="hidden md:block text-sm font-body font-medium tracking-[0.08em] uppercase px-5 py-2 rounded-full border border-primary bg-transparent text-primary hover:bg-primary/10 transition-all duration-300"
          >
            Join the Waitlist
          </button>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <motion.div
            className="absolute inset-y-0 right-0 w-full max-w-xs bg-card border-l border-border shadow-[var(--shadow-elevated)] flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <img src={monarkLogoHorizontal} alt="MonArk" className="h-8 object-contain" />
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-foreground" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col gap-2 p-5">
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-base font-body font-medium text-foreground py-3 border-b border-border/50 transition-colors hover:text-primary">How It Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-base font-body font-medium text-foreground py-3 border-b border-border/50 transition-colors hover:text-primary">Pricing</a>
              <button onClick={() => { setMobileMenuOpen(false); setShowSignInModal(true); }} className="text-base font-body font-medium text-foreground py-3 border-b border-border/50 transition-colors hover:text-primary text-left">Sign In</button>
            </div>
            <div className="p-5 border-t border-border">
              <Button onClick={() => { setMobileMenuOpen(false); openWaitlist(); }} className="w-full py-3 text-sm tracking-[0.08em] font-body">
                JOIN THE WAITLIST
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ═══════════ HERO — Emotional Hook ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-secondary/40" />

        {/* Warm ambient orbs — subtle */}
        <motion.div
          className="absolute top-16 left-1/3 w-[420px] h-[420px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--color-rosegold) / 0.06) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 pt-8 pb-6 sm:pt-12 sm:pb-8">
          <div className="text-center space-y-7">
            {/* Brand */}
            <motion.div
              className="space-y-5"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOut }}
            >
              <MonArkLogo size="xl" animated={true} rotateOnLoad={true} className="mx-auto" />

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-editorial-headline italic text-foreground leading-[1.08] tracking-tight px-2">
                  Dating shouldn't feel like a second job.
                </h1>
                <div className="w-16 h-px mx-auto bg-primary/30" />
                <p className="text-xs font-caption tracking-[0.2em] uppercase text-primary/70 mt-1 mb-0">We match you on how you love, not just who you are.</p>
                <p className="max-w-xl mx-auto text-base sm:text-lg font-body text-foreground/75 leading-relaxed px-2">
                                MonArk gives you 3 curated introductions every week — matched on <a href="#rif-framework" className="underline underline-offset-2 text-foreground/90 hover:text-foreground transition-colors">how you love</a>a>, not just who you are. No swiping. No algorithm games. Just people who actually align with how you connect, communicate, and build.</a>
                </p>
              </div>
            </motion.div>

            {/* As Heard On — inline in hero */}
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: easeOut }}
            >
              <p className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground">As Heard On</p>
              <a href="https://open.spotify.com/episode/3AcuI12nSrUWqGvwPFwNGP" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#121212] rounded-full px-5 py-2.5 shadow-lg hover:scale-105 transition-transform cursor-pointer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.502 17.305a.749.749 0 0 1-1.03.249c-2.822-1.725-6.373-2.116-10.558-1.159a.75.75 0 0 1-.333-1.462c4.578-1.048 8.508-.597 11.672 1.342a.75.75 0 0 1 .249 1.03zm1.468-3.263a.937.937 0 0 1-1.287.308c-3.228-1.984-8.152-2.56-11.97-1.401a.938.938 0 0 1-.543-1.795c4.36-1.322 9.776-.682 13.492 1.601a.937.937 0 0 1 .308 1.287zm.126-3.403C15.675 8.567 9.106 8.348 5.304 9.502a1.124 1.124 0 1 1-.652-2.152c4.37-1.325 11.627-1.07 16.215 1.56a1.124 1.124 0 0 1-1.771 1.13z" fill="#1DB954"/>
                </svg>
                <span className="font-editorial italic text-white text-sm sm:text-base">Save Me a Spot</span>
                <span className="text-white/50 text-sm hidden sm:inline">—</span>
                <span className="text-white/50 text-xs sm:text-sm hidden sm:inline">Chicago's relationship wellness podcast</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#1DB954] ml-1"><polygon points="4,2 14,8 4,14" fill="currentColor"/></svg>
              </a>
            </motion.div>

            {/* Pull Quote Cards */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-lg mx-auto"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: easeOut }}
            >
              {[
                { quote: "You're doing my investigation for me.", name: "Aisha" },
                { quote: "MonArk feels like comfort.", name: "Samuel" },
              ].map((item, i) => (
                <div key={i} className="flex-1 bg-[#EDE6DF] rounded-xl p-5 text-center">
                  <p className="font-editorial italic text-[#A08C6E] text-sm leading-relaxed mb-2">
                    "{item.quote}"
                  </p>
                  <p className="font-body text-xs uppercase tracking-[0.15em] text-foreground/60">
                    — {item.name} · Early Access Member, Chicago
                  </p>
                </div>
              ))}
            </motion.div>

            {/* ── Primary CTA Card ── */}
            <motion.div
              className="max-w-sm mx-auto"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: easeOut }}
            >
              <div className="relative group">
                <div className="absolute -inset-1.5 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 bg-primary/20" />

                <div className="relative bg-card rounded-2xl p-7 border border-border shadow-[var(--shadow-elevated)]">
                  <p className="text-[10px] font-caption text-primary tracking-[0.2em] mb-2">LIMITED EARLY ACCESS</p>

                  <h2 className="text-2xl sm:text-3xl font-editorial-headline text-foreground mb-1">Get Your 3</h2>
                  <p className="text-sm text-muted-foreground font-body mb-4">Reserve your spot among intentional daters</p>

                  {heroSubmitted ? (
                    <p className="font-editorial italic text-[#A08C6E] text-base text-center py-3">
                      You're on the list. We'll be in touch.
                    </p>
                  ) : (
                    <div className="flex gap-2 mb-3">
                      <input
                        type="email"
                        value={heroEmail}
                        onChange={(e) => setHeroEmail(e.target.value)}
                        placeholder="Enter your email"
                        aria-label="Enter your email to join the MonArk waitlist"
                        className="flex-1 h-14 px-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground font-body text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring w-full"
                      />
                      <Button
                        disabled={heroSubmitting}
                        onClick={() => {
                          if (!heroEmail) return;
                          setHeroSubmitting(true);
                          openWaitlist(undefined, heroEmail);
                          setTimeout(() => { setHeroSubmitted(true); setHeroSubmitting(false); }, 400);
                        }}
                        className="h-14 px-6 text-sm tracking-[0.08em] font-body shrink-0"
                      >
                        Reserve My Spot
                      </Button>
                    </div>
                  )}

                  <div className="text-center space-y-1.5">
                    <p className="text-[13px] text-muted-foreground font-body">
                      Ready to get started?{' '}
                      <button onClick={() => onSignUp?.()} className="text-primary font-semibold hover:underline transition-colors">
                        Sign up
                      </button>
                    </p>
                    <p className="text-[13px] text-muted-foreground font-body">
                      Already have an account?{' '}
                      <button onClick={() => setShowSignInModal(true)} className="text-primary font-medium hover:underline transition-colors">
                        Sign in
                      </button>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border mt-3">
                    <p className="text-sm text-muted-foreground font-body leading-relaxed text-center italic">
                      "Answer 15 thoughtful questions. We find people who get you."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* App Store badges in hero */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="inline-flex items-center px-5 py-2.5 rounded-[40px] border-[1.5px] border-muted-foreground/30 text-muted-foreground/50 font-body text-xs tracking-[0.08em] cursor-not-allowed select-none opacity-60">
                App Store — Coming Soon
              </span>
              <span className="inline-flex items-center px-5 py-2.5 rounded-[40px] border-[1.5px] border-muted-foreground/30 text-muted-foreground/50 font-body text-xs tracking-[0.08em] cursor-not-allowed select-none opacity-60">
                Google Play — Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="flex justify-center pb-6"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-6 w-6 text-primary/50" />
        </motion.div>
      </section>

      {/* ═══════════ RIF SECTION ═══════════ */}
      <section id="rif-framework" className="py-16 bg-background scroll-mt-16">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            <h2 className="text-3xl sm:text-4xl font-editorial-headline text-foreground mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Relational Intelligence Framework
            </h2>
            <p className="font-body font-medium text-base text-[#A08C6E] tracking-wide mb-6">
              The intelligence behind your introductions.
            </p>
            <div className="max-w-[520px] mx-auto">
              <p className="font-body text-sm text-foreground leading-relaxed mb-8">
                Most platforms sort by photos and proximity. MonArk sorts by emotional readiness, relational values, and behavioral compatibility — a proprietary framework we call RIF. Your 3 weekly introductions aren't random. They're the result of a system built to surface alignment, not just attraction.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {['Emotional Readiness', 'Relational Values', 'Behavioral Compatibility'].map((pill) => (
                <span
                  key={pill}
                  className="font-body text-xs font-medium uppercase tracking-[0.15em] text-[#7A6A55] bg-[#EDE6DF] px-5 py-2 rounded-full"
                >
                  {pill}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="py-16 bg-background scroll-mt-16">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-editorial-headline text-foreground mb-3">How Smart Matching Works</h2>
            <p className="text-xs sm:text-sm font-caption text-muted-foreground tracking-[0.15em] uppercase max-w-lg mx-auto leading-relaxed">Your RIF — a 15-question profile that reads how you connect, not just who you are. Relational intelligence curates your perfect 3.</p>
            <SectionDivider />
          </motion.div>

          <div className="grid md:grid-cols-4 gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-6 px-6 md:mx-0 md:px-0">
            {[
              { icon: PenLine, num: "1", title: "Take the RIF", desc: "15 questions about how you communicate, connect, and date. Takes 5 minutes." },
              { icon: Heart, num: "2", title: "Get Your 3", desc: "Every Sunday, your 3 curated matches drop in-app — no email required. Fit your style, not just your type." },
              { icon: MapPin, num: "3", title: "Date With Intention", desc: "We suggest premium first dates at vetted venues. No awkward coffee shop roulette." },
              { icon: MessageCircleHeart, num: "4", title: "Close the Loop", desc: "No ghosting. After every date, choose to advance or send a kind, automated closure. Everyone gets respect.", highlight: true },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`text-center p-6 rounded-2xl border transition-all duration-400 group min-w-[260px] md:min-w-0 snap-center ${
                  item.highlight
                    ? "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30 hover:shadow-[var(--shadow-elevated)]"
                    : "border-transparent bg-card/0 hover:bg-card hover:border-border hover:shadow-[var(--shadow-editorial)]"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                  item.highlight
                    ? "bg-primary/10 border-primary/25 group-hover:bg-primary/15 group-hover:border-primary/35"
                    : "bg-secondary border-border group-hover:bg-primary/10 group-hover:border-primary/20"
                }`}>
                  <item.icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-3xl font-editorial-headline text-primary/30 leading-none">{item.num}</span>
                <h3 className="font-editorial-headline text-lg text-foreground mt-2 mb-2">{item.title}</h3>
                {item.highlight && (
                  <span className="inline-block text-[9px] font-caption text-primary tracking-[0.15em] uppercase bg-primary/10 px-2.5 py-0.5 rounded-full mb-2">Anti-Ghosting</span>
                )}
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-center mt-10 text-sm font-caption text-muted-foreground tracking-[0.12em] uppercase"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.2 }}
          >
            No swipes. No chaos. Just connection that feels like alignment.
          </motion.p>

          {/* Match Profile Card Mockups */}
          <motion.div
            className="mt-14 mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-center text-xs font-caption text-primary tracking-[0.2em] uppercase mb-8">Every Sunday morning, your 3 arrive.</p>
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                { photo: "/images/matches/jordan.jpg", name: "Jordan", age: 28, location: "River North, Chicago", score: 92, tagline: "Strong communicator · Values depth", reason: "You both value slow-building trust and direct communication.", interests: ["Live Jazz", "Cooking", "Hiking"] },
                { photo: "/images/matches/marcus.jpg", name: "Marcus", age: 31, location: "Lincoln Park, Chicago", score: 85, tagline: "Intentional dater · Emotionally present", reason: "Complementary conflict styles—he speaks up, you reflect first.", interests: ["Poetry", "Yoga", "Art Museums"] },
                { photo: "/images/matches/priya.jpg", name: "Priya", age: 27, location: "West Loop, Chicago", score: 78, tagline: "Curious spirit · Steady pacing", reason: "Shared pacing preference and aligned relationship goals.", interests: ["Film", "Running", "Travel"] },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  className="bg-[hsl(230_18%_15%)] border border-[hsl(30_40%_72%/0.15)] rounded-2xl p-5 shadow-[0_4px_24px_rgba(28,31,46,0.3)] hover:border-[hsl(30_40%_72%/0.35)] transition-all duration-300"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.4, delay: 0.12 * i }}
                >
                  {/* Badge */}
                  <div className="mb-3">
                    <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">✦ Your Match</span>
                  </div>
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <img src={card.photo} alt={`${card.name}, ${card.age} — MonArk member`} loading="lazy" className="w-12 h-12 rounded-full object-cover shrink-0 border border-primary/20" />
                    <div>
                      <h4 className="font-serif text-lg text-[hsl(40_30%_88%)] leading-tight">{card.name}, {card.age}</h4>
                      <span className="text-[11px] text-[hsl(30_40%_72%/0.7)] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {card.location}
                      </span>
                      <span className="text-[11px] text-primary/80 mt-0.5 block">{card.tagline}</span>
                    </div>
                  </div>

                  {/* RIF Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[hsl(30_40%_72%/0.5)]">RIF Compatibility</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-primary">{card.score}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-[hsl(230_18%_22%)]">
                      <div
                        className="h-1 rounded-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${card.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {card.interests.map((interest, idx) => (
                      <span key={idx} className="text-[11px] px-2.5 py-1 rounded-full border border-[hsl(30_40%_72%/0.2)] text-[hsl(30_40%_72%/0.8)] bg-[hsl(30_40%_72%/0.05)]">
                        {interest}
                      </span>
                    ))}
                  </div>

                  {/* Match Reason */}
                  <div className="bg-[hsl(230_18%_12%)] rounded-xl p-3 border-l-[3px] border-primary">
                    <div className="text-[9px] uppercase tracking-[0.2em] text-[hsl(30_40%_72%/0.4)] mb-1">Why we curated this match</div>
                    <p className="text-[12px] text-[hsl(40_30%_88%/0.85)] leading-relaxed italic font-light">"{card.reason}"</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>


          {/* Sample RIF Question Preview */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h3 className="text-center font-editorial-headline text-xl sm:text-2xl text-foreground mb-2">A Glimpse Into Your RIF</h3>
            <p className="text-center text-xs font-caption text-primary tracking-[0.2em] uppercase mb-8">The questions that power smarter matches</p>
            <div className="flex flex-col gap-4 max-w-2xl mx-auto">
              {[
                { num: "Q3", text: "How do you typically show up in conflict — do you go quiet or speak up immediately?" },
                { num: "Q7", text: "What does emotional safety look like to you in a relationship?" },
                { num: "Q12", text: "Are you looking for something to build slowly, or do you know quickly when someone is right?" },
              ].map((q, i) => (
                <motion.div
                  key={i}
                  className="relative bg-[hsl(230_18%_15%)] border border-[hsl(30_40%_72%/0.2)] rounded-2xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(28,31,46,0.25)] hover:border-[hsl(30_40%_72%/0.4)] transition-all duration-300"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[hsl(30_40%_72%/0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HelpCircle className="w-4.5 h-4.5 text-[hsl(30_40%_72%)]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="font-editorial-headline text-base sm:text-lg text-[hsl(30_40%_85%)] leading-relaxed italic">"{q.text}"</p>
                    </div>
                  </div>
                  <span className="absolute top-4 right-5 text-[10px] font-caption text-[hsl(30_40%_72%/0.4)] tracking-[0.15em] uppercase">{q.num}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-center mt-6 text-xs text-muted-foreground font-body">15 thoughtful questions. 5 minutes. That's all it takes to unlock smarter matches.</p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FOUNDER STORY ═══════════ */}
      <section className="py-16 bg-secondary/30 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div
            className="text-center mb-10"

            {/* ========== DISCOVER MODE ========== */}
                  <section className="py-20 bg-foreground text-background overflow-hidden">
                            <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
                                        <motion.div
                                                        className="text-center"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true, amount: 0.1 }}
                                                        transition={{ duration: 0.6, ease: easeOut }}
                                                      >
                                                      <p className="text-xs font-caption tracking-[0.15em] uppercase text-background/50 mb-3">Between Sundays</p>p>
                                                      <h2 className="text-3xl sm:text-4xl font-editorial-headline text-background mb-4">
                                                                      Stay in the signal.
                                                      </h2>h2>
                                                      <p className="text-base font-body text-background/70 leading-relaxed max-w-xl mx-auto mb-10">
                                                                      Explore Discover Mode — a daily-capped browse experience that feeds your preferences directly into next Sunday's curation. The more you explore, the smarter your matches get.
                                                      </p>p>
                                                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10">
                                                        {[
                                                        { icon: "📍", label: "Nearby by RIF compatibility" },
                                                        { icon: "🔁", label: "Daily cap keeps it intentional" },
                                                        { icon: "✦", label: "Every signal sharpens Sunday" },
                                                                        ].map((pill) => (
                                                                                            <span
                                                                                                                  key={pill.label}
                                                                                                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-background/20 text-sm font-body text-background/80"
                                                                                                                >
                                                                                                                <span>{pill.icon}</span>span>
                                                                                              {pill.label}
                                                                                              </span>span>
                                                                                          ))}
                                                      </div>div>
                                                      <p className="text-sm font-body italic text-background/40">
                                                                      Your 3 still only drop once a week. Discover just makes them better.
                                                      </p>p>
                                        </motion.div>motion.div>
                            </div>div>
                  </section>section></section>
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-editorial-headline text-foreground mb-2">Why I Built MonArk</h2>
            <p className="text-sm font-body text-muted-foreground tracking-[0.08em] uppercase">A Founder's Note on Intentional Dating</p>
            <SectionDivider />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Founder Image */}
            <motion.div
              className="relative order-2 md:order-1"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1, margin: "-80px" }}
              transition={{ duration: 0.8, ease: easeOut }}
            >
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary/20 via-border to-primary/15 blur-sm" />
              <motion.div
                className="relative overflow-hidden rounded-xl shadow-[var(--shadow-luxury)]"
                whileHover={{ scale: 1.015 }}
                transition={{ duration: 0.4, ease: easeOut }}
              >
                <img
                  src={founderPortrait}
                  alt="Bryant McCray, MonArk Founder"
                  loading="lazy"
                  className="w-full h-auto object-cover"
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-card/8 to-transparent"
                  initial={{ x: "-100%" }}
                  whileInView={{ x: "100%" }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>

            {/* Text */}
            <motion.div
              className="space-y-5 order-1 md:order-2"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.15, ease: easeOut }}
            >
              <p className="text-base text-muted-foreground font-body leading-relaxed">
                I spent years on dating apps that felt more like slot machines than places to find real connection.
              </p>
              <p className="text-base text-muted-foreground font-body leading-relaxed">
                Sure, we could meet people. But finding someone who truly <em className="font-medium not-italic text-foreground">got</em> you? That was rare.
              </p>
              <p className="text-base text-muted-foreground font-body leading-relaxed">
                I wanted something intentional. A way to match on emotional compatibility, not just a hot profile pic.
                A way to make first dates feel effortless, not awkward.
              </p>
              <p className="text-base text-muted-foreground font-body leading-relaxed">
                That's why MonArk matches on communication style, not just demographics.
              </p>
              <div className="pt-3">
                <p
                  className="text-muted-foreground"
                  style={{ fontFamily: "'Pinyon Script', cursive", fontSize: '1.6rem', letterSpacing: '0.01em', lineHeight: 1.3 }}
                >
                  — Bryant McCray
                </p>
                <p className="text-xs text-muted-foreground font-body tracking-[0.15em] uppercase mt-0.5">
                  CEO & Founder
                </p>
                <p className="font-editorial italic text-[#A08C6E] text-sm mt-3">
                  As heard on <em>Save Me a Spot</em> — Chicago's leading relationship wellness podcast
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      
      {/* ═══════════ DISCOVER MODE ═══════════ */}
      <section className="py-20 bg-foreground text-background overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="text-xs font-caption tracking-[0.15em] uppercase text-background/50 mb-3">Between Sundays</p>
            <h2 className="text-3xl sm:text-4xl font-editorial-headline text-background mb-4">
              Stay in the signal.
            </h2>
            <p className="text-base font-body text-background/70 leading-relaxed max-w-xl mx-auto mb-10">
              Discover Mode lets you browse by RIF compatibility between drop days — a daily-capped experience that feeds your preferences directly into next Sunday's curation. Every signal sharpens your matches.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10">
              {[
                { icon: "📍", label: "Nearby by RIF compatibility" },
                { icon: "🔁", label: "Daily cap keeps it intentional" },
                { icon: "✦", label: "Every signal sharpens Sunday" },
              ].map((pill) => (
                <span
                  key={pill.label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-background/20 text-sm font-body text-background/80"
                >
                  <span>{pill.icon}</span>
                  {pill.label}
                </span>
              ))}
            </div>

            <p className="text-sm font-body italic text-background/50">
              Between Sundays, explore. But your 3 still only drop once a week.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ BUILT WITH CARE ═══════════ */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-editorial-headline text-foreground mb-2">Built with Care</h2>
            <SectionDivider />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10">
            {[
              { img: founderPortrait, name: "Bryant McCray", role: "CEO & Founder", bio: "" },
              { img: gracePortrait, name: "Grace O'Malley", role: "Relationship Therapist & Clinical Advisor", bio: "Licensed clinical social worker advising on emotional health and relationship dynamics." },
            ].map((member, i) => (
              <motion.div
                key={member.name}
                className="text-center space-y-3 group"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1, margin: "-40px" }}
                transition={{ duration: 0.6, ease: easeOut, delay: i * 0.08 }}
              >
                <motion.div
                  className="relative mx-auto w-28 h-28"
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.4, ease: easeOut }}
                >
                  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary/25 via-border to-primary/20" />
                  <div className="relative w-full h-full overflow-hidden rounded-full shadow-[var(--shadow-editorial)]">
                    <img
                      src={member.img}
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
                <div>
                  <h3 className="font-editorial-headline text-lg text-foreground">{member.name}</h3>
                  <p className="text-xs text-primary font-caption tracking-[0.1em] uppercase mt-0.5">{member.role}</p>
                </div>
                {member.bio && (
                  <p className="text-sm text-muted-foreground font-body leading-relaxed px-2">
                    {member.bio}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS — From Early Access Members ═══════════ */}
      <section className="py-16 bg-background">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-editorial-headline italic text-2xl sm:text-[28px] text-foreground mb-2">From Early Access Members</h2>
            <SectionDivider />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {[
              { quote: "I've tried every app. MonArk is the first time I felt like someone was actually paying attention to who I am.", name: "Janelle · Early Access Member, Chicago" },
              { quote: "Three people, once a week. It sounds simple until you realize how much thought went into each one.", name: "Marcus T. · Early Access Member, Chicago" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: idx * 0.12, ease: easeOut }}
                className="bg-[hsl(230_18%_15%)] rounded-2xl p-7 flex flex-col justify-between shadow-[0_8px_32px_rgba(28,31,46,0.25)]"
              >
                <p className="text-[hsl(240_6%_78%)] font-body text-sm leading-relaxed mb-6 italic">
                  "{item.quote}"
                </p>
                <p className="text-[hsl(30_40%_72%)] font-caption text-xs tracking-[0.12em] uppercase">
                  — {item.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* ═══════════ SKEPTIC COMPARISON ═══════════ */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            <h2 className="font-editorial-headline italic text-3xl sm:text-[32px] text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              You've tried the apps.
            </h2>
            <p className="font-body font-medium text-base text-[#A08C6E]">
              Here's what's different.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* The Apps column */}
            <motion.div
              className="bg-[#EDE6DF] rounded-xl border border-[#EDE6DF] p-6 sm:p-8"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              <h3 className="font-editorial-headline text-lg text-foreground/70 mb-5">The apps</h3>
              <ul className="space-y-4">
                {[
                  'Infinite scroll, infinite ghosting',
                  'Optimized for engagement, not connection',
                  'You decide everything alone',
                  'Photos first, person second',
                ].map((item, i) => (
                  <li key={i} className="font-body text-sm text-foreground/70 leading-relaxed flex items-start gap-2.5">
                    <span className="text-foreground/30 mt-0.5">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* MonArk column */}
            <motion.div
              className="bg-[#EDE6DF] rounded-xl border border-[#EDE6DF] border-l-[3px] border-l-[#A08C6E] p-6 sm:p-8"
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
            >
              <h3 className="font-editorial-headline text-lg text-foreground mb-5">MonArk</h3>
              <ul className="space-y-4">
                {[
                  '3 curated introductions per week',
                  'Optimized for relational alignment',
                  'RIF works before you ever see a name',
                  'Person first. Always.',
                ].map((item, i) => (
                  <li key={i} className="font-body text-sm text-foreground leading-relaxed flex items-start gap-2.5">
                    <span className="text-[#A08C6E] mt-0.5">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <SectionDivider />
      <MonArkPricing onSelectPlan={(planName) => openWaitlist(planName)} />

      {/* Early access line below pricing */}
      <div className="text-center pb-8 -mt-4">
        <p className="font-body text-[13px] text-foreground/75">
          Early Access members receive matches immediately upon launch. No waiting period.
        </p>
      </div>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-editorial-headline text-foreground mb-2">Your Questions, Answered</h2>
            <SectionDivider />
          </motion.div>

          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: "Will I get email notifications?", a: "MonArk keeps your experience intentional and inbox-free. Your Sunday batch delivery, \'no matches this week\' updates, and post-date journal prompts are all delivered in-app — no email flooding. You stay in control, and in the moment." },
              { q: "How does curation actually work?", a: "MonArk uses the Relational Intelligence Framework (RIF) — a behavioral assessment rooted in emotional intelligence research. Your responses shape a compatibility profile that powers your weekly curated introductions." },
              { q: "What if none of my 3 interest me?", a: "You can pass on any introduction. Your feedback refines future curation. MonArk learns from every decision you make." },
              { q: "Is MonArk inclusive of all sexual orientations and gender identities?", a: "Yes. MonArk is designed for all adults seeking intentional connection, regardless of orientation or identity. Curation is always preference-informed." },
              { q: "How is my personal data protected?", a: "Your data is never sold. Your profile is never publicly searchable. MonArk uses encrypted storage and strict access controls. Full details are in our Privacy Policy." },
              { q: "What's the difference between The Compass and The Ark?", a: "The Compass is for members ready to date intentionally. The Ark adds advanced relationship tooling — deeper journaling, milestone tracking, and priority placement in the curation queue." },
              { q: "How do I get a Founding Member invite code?", a: "Founding Member codes are distributed by invitation from the MonArk team. Join the waitlist and you may receive one based on early interest and waitlist position." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-[#F2EDE8] rounded-xl border-none px-6">
                <AccordionTrigger className="font-editorial-headline text-base text-foreground hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Waitlist Modal */}
      <WaitlistModal isOpen={showWaitlistModal} onClose={() => { setShowWaitlistModal(false); setWaitlistPlan(undefined); setWaitlistEmail(undefined); }} sourcePage="enhanced-landing" selectedPlan={waitlistPlan} initialEmail={waitlistEmail} />
      <SignInModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />

      {/* ═══════════ INSTAGRAM ═══════════ */}
      <section className="py-14 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
          <div className="text-center mb-8">
            <a
              href="https://www.instagram.com/monark.eq/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 group"
            >
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] shadow-md group-hover:shadow-lg transition-shadow duration-300">
                <Instagram className="h-5 w-5 text-card" />
              </div>
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-editorial-headline text-foreground group-hover:text-primary transition-colors">
                  @monark.eq
                </h2>
                <p className="text-xs text-muted-foreground font-body">Follow us on Instagram</p>
              </div>
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            {[
              { src: "/images/instagram/ig-1.png", alt: "MonArk — Brand grid" },
              { src: "/images/instagram/ig-2.png", alt: "MonArk — Date well bar scene" },
              { src: "/images/instagram/ig-3.png", alt: "MonArk — Date well lifestyle" },
              { src: "/images/instagram/ig-4.png", alt: "MonArk — What consumers are saying" },
            ].map((image, i) => (
              <a
                key={i}
                href="https://www.instagram.com/monark.eq/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-elevated transition-all duration-400 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/50 transition-all duration-300 flex items-center justify-center">
                  <Instagram className="h-7 w-7 text-card opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 delay-75" />
                </div>
              </a>
            ))}
          </div>

          <p className="text-center mt-6 text-sm text-muted-foreground font-body">
            @monark.eq — Follow our journey
          </p>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="py-12 bg-muted border-t border-border">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 text-center">
          <img src={monarkLogoHorizontal} alt="MonArk — Date well." className="h-10 w-auto object-contain mx-auto mb-6" />


          <p className="text-muted-foreground font-body text-sm mb-5">
            &copy; {new Date().getFullYear()} MonArk. Dating reimagined with Smart Matching.
          </p>

          {/* App Store Badges */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="inline-flex items-center px-5 py-2.5 rounded-[40px] border-[1.5px] border-muted-foreground/30 text-muted-foreground/50 font-body text-xs tracking-[0.08em] cursor-not-allowed select-none opacity-60">
              App Store — Coming Soon
            </span>
            <span className="inline-flex items-center px-5 py-2.5 rounded-[40px] border-[1.5px] border-muted-foreground/30 text-muted-foreground/50 font-body text-xs tracking-[0.08em] cursor-not-allowed select-none opacity-60">
              Google Play — Coming Soon
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-body text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground hover:underline transition-colors">How It Works</a>
            <span className="text-border">·</span>
            <a href="#pricing" className="hover:text-foreground hover:underline transition-colors">Pricing</a>
            <span className="text-border">·</span>
            <a href="/privacy" className="hover:text-foreground hover:underline transition-colors">Privacy Policy</a>
            <span className="text-border">·</span>
            <a href="/terms" className="hover:text-foreground hover:underline transition-colors">Terms of Service</a>
            <span className="text-border">·</span>
            <button onClick={() => setShowSignInModal(true)} className="hover:text-foreground hover:underline transition-colors">Sign In</button>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

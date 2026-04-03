import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MonArkLogo } from '@/components/MonArkLogo';
import monarkLogoHorizontal from '@/assets/monark-logo-horizontal.png';
import { PenLine, Heart, MapPin, ArrowRight, Instagram, Menu, X, HelpCircle, MessageCircleHeart } from 'lucide-react';
import { MonArkPricing } from '@/components/pricing/MonArkPricing';
import { motion } from 'framer-motion';
import founderPortrait from '@/assets/founder-bryant.jpeg';
import gracePortrait from '@/assets/team/grace-omalley.png';
import { useDemo } from '@/contexts/DemoContext';
import { DemoMainApp } from './DemoMainApp';
import { WaitlistModal } from './WaitlistModal';
import { SignInModal } from '@/components/auth/SignInModal';

// Instagram feed images
import igArtOfDating from '@/assets/instagram/ig-art-of-dating.png';
import igOurPromise from '@/assets/instagram/ig-our-promise.png';
import igWomanPortrait from '@/assets/instagram/ig-woman-portrait.png';
import igManSuit from '@/assets/instagram/ig-man-suit.png';
import igWelcomeCircle from '@/assets/instagram/ig-welcome-circle.png';
import igChampagne from '@/assets/instagram/ig-champagne.png';
import igSunglasses from '@/assets/instagram/ig-sunglasses.png';
import igTestimonials from '@/assets/instagram/ig-testimonials.png';

const instagramImages = [
  igWomanPortrait,
  igArtOfDating,
  igChampagne,
  igTestimonials,
];

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
}

export const EnhancedLandingPage: React.FC<EnhancedLandingPageProps> = ({ onExitToApp, onStartDemo, onSignIn }) => {
  const { demoData, setDemoMode } = useDemo();
  const [showFullDemo, setShowFullDemo] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [waitlistPlan, setWaitlistPlan] = useState<string | undefined>();
  const [waitlistEmail, setWaitlistEmail] = useState<string | undefined>();
  const [heroEmail, setHeroEmail] = useState('');

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
    <div className="min-h-screen bg-background relative">
      <div className="relative">
      {/* ═══════════ STICKY NAV ═══════════ */}
      <nav className="sticky top-0 z-50 bg-background/95 border-b border-border/50" style={{ backdropFilter: 'none' }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <img src={monarkLogoHorizontal} alt="MonArk" className="h-10 object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors tracking-wide">How It Works</a>
            <a href="#pricing" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors tracking-wide">Pricing</a>
            <button
              onClick={() => setShowSignInModal(true)}
              className="text-sm font-body font-medium text-primary hover:text-primary/80 transition-colors tracking-wide"
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
              <button onClick={() => { setMobileMenuOpen(false); setShowSignInModal(true); }} className="text-base font-body font-medium text-primary py-3 border-b border-border/50 transition-colors hover:text-primary/80 text-left">Sign In</button>
            </div>
            <div className="p-5 border-t border-border">
              <Button onClick={() => { setMobileMenuOpen(false); openWaitlist(); }} className="w-full py-3 text-sm tracking-[0.08em] font-body">
                JOIN THE WAITLIST
              </Button>
            </div>
          </motion.div>
        </div>
      )}
  const [showSignInModal, setShowSignInModal] = useState(false);

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-secondary/40" />

        {/* Warm ambient orbs — subtle */}
        <motion.div
          className="absolute top-16 left-1/3 w-[420px] h-[420px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--color-rosegold) / 0.06) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 pt-8 pb-16 sm:pt-12 sm:pb-20">
          <div className="text-center space-y-7">
            {/* Brand */}
            <motion.div
              className="space-y-5"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOut }}
            >
              <MonArkLogo size="xl" animated={true} rotateOnLoad={true} className="mx-auto" />

              <div className="space-y-3">
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-editorial-headline text-foreground leading-[0.92] tracking-tight">
                  Mon<span className="text-accent">A</span>rk
                </h1>
                <div className="w-16 h-px mx-auto bg-primary/30" />
                <p className="text-xs sm:text-sm font-caption text-muted-foreground tracking-[0.25em] uppercase">
                  3 curated matches. Every week.
                </p>
                <p className="text-[11px] font-body text-muted-foreground/70 tracking-wide mt-1">
                  Powered by your Relational Intelligence Profile (RIF)
                </p>
              </div>
            </motion.div>

            {/* Value Prop */}
            <motion.p
              className="max-w-lg mx-auto text-base md:text-lg font-body text-muted-foreground leading-relaxed"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: easeOut }}
            >
              No endless swiping. No algorithm games. Just{' '}
              <a href="#how-it-works" className="text-foreground font-medium hover:text-primary transition-colors underline underline-offset-4 decoration-primary/40">Smart Matching</a> that
              understands how you connect, communicate, and love.
            </motion.p>

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
                  <p className="text-sm text-muted-foreground font-body mb-4">Join 250+ intentional daters on the waitlist</p>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="email"
                      value={heroEmail}
                      onChange={(e) => setHeroEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 h-11 px-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground font-body text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
                    />
                    <Button
                      onClick={() => openWaitlist(undefined, heroEmail || undefined)}
                      className="h-11 px-5 text-sm tracking-[0.08em] font-body shrink-0"
                    >
                      JOIN
                    </Button>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground font-body leading-relaxed text-center italic">
                      "Answer 15 thoughtful questions. We find people who get you."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Secondary CTA */}
            <motion.div
              className="space-y-2 pt-1"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
            </motion.div>
          </div>
        </div>
      </section>



      <section id="how-it-works" className="py-16 bg-background scroll-mt-16">
        <div className="max-w-4xl mx-auto px-5">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 1 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-editorial-headline text-foreground mb-3">How Smart Matching Works</h2>
            <p className="text-xs sm:text-sm font-caption text-muted-foreground tracking-[0.15em] uppercase max-w-lg mx-auto leading-relaxed">Your RIF — a 15-question profile that reads how you connect, not just who you are. Relational intelligence curates your perfect 3.</p>
            <SectionDivider />
          </motion.div>

          <div className="grid md:grid-cols-4 gap-5">
            {[
              { icon: PenLine, num: "01", title: "Take the RIF", desc: "15 questions about how you communicate, connect, and date. Takes 5 minutes." },
              { icon: Heart, num: "02", title: "Get Your 3", desc: "Every Sunday, receive 3 matches who fit your style—not just your type." },
              { icon: MapPin, num: "03", title: "Date With Intention", desc: "We suggest premium first dates at vetted venues. No awkward coffee shop roulette." },
              { icon: MessageCircleHeart, num: "04", title: "Close the Loop", desc: "No ghosting. After every date, choose to advance or send a kind, automated closure. Everyone gets respect.", highlight: true },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`text-center p-6 rounded-2xl border transition-all duration-400 group ${
                  item.highlight
                    ? "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30 hover:shadow-[var(--shadow-elevated)]"
                    : "border-transparent bg-card/0 hover:bg-card hover:border-border hover:shadow-[var(--shadow-editorial)]"
                }`}
                initial={{ opacity: 1 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
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
            initial={{ opacity: 1 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            No swipes. No chaos. Just connection that feels like alignment.
          </motion.p>

          {/* Match Profile Card Mockups */}
          <motion.div
            className="mt-14 mb-14"
            initial={{ opacity: 1 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-center text-xs font-caption text-primary tracking-[0.2em] uppercase mb-8">Every Sunday morning, your 3 arrive.</p>
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                { photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop", name: "Jordan", age: 28, location: "Brooklyn, NY", score: 92, tagline: "Strong communicator · Values depth", reason: "You both value slow-building trust and direct communication.", interests: ["Live Jazz", "Cooking", "Hiking"] },
                { photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", name: "Marcus", age: 31, location: "Manhattan, NY", score: 85, tagline: "Intentional dater · Emotionally present", reason: "Complementary conflict styles—he speaks up, you reflect first.", interests: ["Poetry", "Yoga", "Art Museums"] },
                { photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop", name: "Priya", age: 27, location: "Park Slope, NY", score: 78, tagline: "Curious spirit · Steady pacing", reason: "Shared pacing preference and aligned relationship goals.", interests: ["Film", "Running", "Travel"] },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  className="bg-[hsl(230_18%_15%)] border border-[hsl(30_40%_72%/0.15)] rounded-2xl p-5 shadow-[0_4px_24px_rgba(28,31,46,0.3)] hover:border-[hsl(30_40%_72%/0.35)] transition-all duration-300"
                  initial={{ opacity: 1 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.12 * i }}
                >
                  {/* Badge */}
                  <div className="mb-3">
                    <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">✦ Your Match</span>
                  </div>
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <img src={card.photo} alt={card.name} className="w-12 h-12 rounded-full object-cover shrink-0 border border-primary/20" />
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
            initial={{ opacity: 1 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
                  initial={{ opacity: 1 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
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
        <div className="max-w-4xl mx-auto px-5">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 1 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
              initial={{ opacity: 1 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
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
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>

            {/* Text */}
            <motion.div
              className="space-y-5 order-1 md:order-2"
              initial={{ opacity: 1 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
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
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ BUILT WITH CARE ═══════════ */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-5">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 1 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
                initial={{ opacity: 1 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
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

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="py-16 bg-background">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 1 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-caption text-primary tracking-[0.2em] uppercase mb-2">What Members Are Saying</p>
            <p className="text-sm text-muted-foreground font-body mb-3">Voices from the waitlist.</p>
            <SectionDivider />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: "MonArk feels like comfort.", name: "Sarah, Brooklyn" },
              { quote: "You're doing my investigation for me.", name: "James, Manhattan" },
              { quote: "If someone is putting in the work versus checking a few boxes, that shows their intent.", name: "Priya, Park Slope" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 1 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
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

      {/* ═══════════ PRICING ═══════════ */}
      <SectionDivider />
      <MonArkPricing onSelectPlan={(planName) => openWaitlist(planName)} />

      {/* Waitlist Modal */}
      <WaitlistModal isOpen={showWaitlistModal} onClose={() => { setShowWaitlistModal(false); setWaitlistPlan(undefined); setWaitlistEmail(undefined); }} sourcePage="enhanced-landing" selectedPlan={waitlistPlan} initialEmail={waitlistEmail} />

      {/* ═══════════ INSTAGRAM ═══════════ */}
      <section className="py-14 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-5">
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
            {instagramImages.map((image, i) => (
              <a
                key={i}
                href="https://www.instagram.com/monark.eq/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-elevated transition-all duration-400 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
              >
                <img
                  src={image}
                  alt={`MonArk Instagram post ${i + 1}`}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/50 transition-all duration-300 flex items-center justify-center">
                  <Instagram className="h-7 w-7 text-card opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 delay-75" />
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.instagram.com/monark.eq/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card/60 backdrop-blur-sm text-foreground hover:bg-card hover:border-primary/30 transition-all duration-300 font-body text-sm tracking-wide"
            >
              View More on Instagram
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="py-12 bg-muted border-t border-border">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <img src={monarkLogoHorizontal} alt="MonArk — Date well." className="h-10 w-auto object-contain mx-auto mb-6" />

          <div className="mb-6">
            <a
              href="https://www.instagram.com/monark.eq/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card/60 backdrop-blur-sm text-foreground hover:bg-card transition-all duration-300 group"
            >
              <Instagram className="h-4 w-4 text-primary group-hover:text-foreground transition-colors" />
              <span className="text-sm font-body tracking-wide">@monark.eq</span>
            </a>
          </div>

          <p className="text-muted-foreground font-body text-sm mb-5">
            &copy; {new Date().getFullYear()} MonArk. Dating reimagined with Smart Matching.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-body text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground hover:underline transition-colors">How It Works</a>
            <span className="text-border">·</span>
            <a href="#pricing" className="hover:text-foreground hover:underline transition-colors">Pricing</a>
            <span className="text-border">·</span>
            <a href="/privacy" className="hover:text-foreground hover:underline transition-colors">Privacy Policy</a>
            <span className="text-border">·</span>
            <a href="/terms" className="hover:text-foreground hover:underline transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

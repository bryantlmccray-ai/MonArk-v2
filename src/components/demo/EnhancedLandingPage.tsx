import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MonArkLogo } from '@/components/MonArkLogo';
import monarkLogoHorizontal from '@/assets/monark-logo-horizontal.png';
import { PenLine, Heart, MapPin, ArrowRight, Instagram } from 'lucide-react';
import { MonArkPricing } from '@/components/pricing/MonArkPricing';
import { motion } from 'framer-motion';
import founderPortrait from '@/assets/founder-bryant.jpeg';
import sheezaPortrait from '@/assets/team/sheeza-anwar.png';
import suryaPortrait from '@/assets/team/surya-nulu.png';
import gracePortrait from '@/assets/team/grace-omalley.png';
import { useDemo } from '@/contexts/DemoContext';
import { DemoMainApp } from './DemoMainApp';
import { WaitlistModal } from './WaitlistModal';

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
  igManSuit,
  igOurPromise,
  igWelcomeCircle,
  igChampagne,
  igSunglasses,
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
}

export const EnhancedLandingPage: React.FC<EnhancedLandingPageProps> = ({ onExitToApp, onStartDemo }) => {
  const { demoData, setDemoMode } = useDemo();
  const [showFullDemo, setShowFullDemo] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);

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
      {/* ═══════════ STICKY NAV ═══════════ */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <img src={monarkLogoHorizontal} alt="MonArk" className="h-7 object-contain" />
          </div>
          <div className="hidden sm:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors tracking-wide"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors tracking-wide"
            >
              Pricing
            </a>
          </div>
          <button
            onClick={() => setShowWaitlistModal(true)}
            className="text-sm font-body font-medium tracking-[0.08em] uppercase px-5 py-2 rounded-full border border-primary bg-transparent text-primary hover:bg-primary/10 transition-all duration-300"
          >
            Join the Waitlist
          </button>
        </div>
      </nav>

      {/* Subtle warm texture overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />

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

        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 pt-14 pb-16 sm:pt-20 sm:pb-20">
          <div className="text-center space-y-7">
            {/* Brand */}
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0, y: 24 }}
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
              </div>
            </motion.div>

            {/* Value Prop */}
            <motion.p
              className="max-w-lg mx-auto text-base md:text-lg font-body text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: easeOut }}
            >
              No endless swiping. No algorithm games. Just{' '}
              <span className="text-foreground font-medium">Smart Matching</span> that
              understands how you connect, communicate, and love.
            </motion.p>

            {/* ── Primary CTA Card ── */}
            <motion.div
              className="max-w-sm mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: easeOut }}
            >
              <div className="relative group">
                <div className="absolute -inset-1.5 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 bg-primary/20" />

                <div className="relative bg-card rounded-2xl p-7 border border-border shadow-[var(--shadow-elevated)]">
                  <p className="text-[10px] font-caption text-primary tracking-[0.2em] mb-2">LIMITED EARLY ACCESS</p>
                  <h2 className="text-2xl sm:text-3xl font-editorial-headline text-foreground mb-1">Get Your 3</h2>
                  <p className="text-sm text-muted-foreground font-body mb-6">Join 500+ intentional daters on the waitlist</p>

                  <Button
                    onClick={() => setShowWaitlistModal(true)}
                    className="w-full py-5 text-sm tracking-[0.08em] font-body"
                    size="lg"
                  >
                    REQUEST EARLY ACCESS
                  </Button>

                  <div className="mt-5 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground font-body leading-relaxed text-center italic">
                      "Answer 10 thoughtful questions. We find people who get you."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Secondary CTA */}
            <motion.div
              className="space-y-2 pt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              {onExitToApp && (
                <div>
                  <Button
                    onClick={onExitToApp}
                    variant="outline"
                    className="px-8 py-3 text-sm tracking-[0.08em] font-body"
                  >
                    FIND YOUR ARK, SIGN UP HERE
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>



      <section id="how-it-works" className="py-16 bg-background scroll-mt-16">
        <div className="max-w-4xl mx-auto px-5">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-editorial-headline text-foreground mb-3">How Smart Matching Works</h2>
            <p className="text-xs sm:text-sm font-caption text-muted-foreground tracking-[0.15em] uppercase">Relational intelligence curates your perfect 3</p>
            <SectionDivider />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: PenLine, num: "01", title: "Take the RIF", desc: "10 questions about how you communicate, connect, and date. Takes 5 minutes." },
              { icon: Heart, num: "02", title: "Get Your 3", desc: "Every Sunday, receive 3 matches who fit your style—not just your type." },
              { icon: MapPin, num: "03", title: "Date With Intention", desc: "We suggest premium first dates at vetted venues. No awkward coffee shop roulette." },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="text-center p-6 rounded-2xl border border-transparent bg-card/0 hover:bg-card hover:border-border hover:shadow-[var(--shadow-editorial)] transition-all duration-400 group"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-secondary border border-border group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                  <item.icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-3xl font-editorial-headline text-primary/30 leading-none">{item.num}</span>
                <h3 className="font-editorial-headline text-lg text-foreground mt-2 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-center mt-10 text-sm font-caption text-muted-foreground tracking-[0.12em] uppercase"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            No swipes. No chaos. Just connection that feels like alignment.
          </motion.p>
        </div>
      </section>

      {/* ═══════════ FOUNDER STORY ═══════════ */}
      <section className="py-16 bg-secondary/30 overflow-hidden">
        <div className="max-w-4xl mx-auto px-5">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
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
              initial={{ opacity: 0, x: -30 }}
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
                  initial={{ x: "-100%", opacity: 0 }}
                  whileInView={{ x: "100%", opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>

            {/* Text */}
            <motion.div
              className="space-y-5 order-1 md:order-2"
              initial={{ opacity: 0, x: 30 }}
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

      {/* ═══════════ TEAM ═══════════ */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-5">
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-editorial-headline text-foreground mb-2">Meet the Team</h2>
            <p className="text-xs sm:text-sm font-caption text-muted-foreground tracking-[0.15em] uppercase">The people behind intentional dating</p>
            <SectionDivider />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { img: sheezaPortrait, name: "Sheeza Anwar", role: "Internal Systems & Automation Engineer", bio: "Focused on building reliable tools that help teams work better." },
              { img: suryaPortrait, name: "Surya Teja Nulu", role: "Founding Mobile & AI Engineer", bio: "AI engineer and computer science graduate student. Focused on building practical, scalable AI systems." },
              { img: gracePortrait, name: "Grace O'Malley", role: "Relationship Therapist & Clinical Advisor", bio: "Relationship therapist and licensed clinical social worker. Advises on emotional health and relationship dynamics." },
            ].map((member, i) => (
              <motion.div
                key={member.name}
                className="text-center space-y-3 group"
                initial={{ opacity: 0, y: 24 }}
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
                <p className="text-sm text-muted-foreground font-body leading-relaxed px-2">
                  {member.bio}
                </p>
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
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-caption text-primary tracking-[0.2em] uppercase mb-2">What Members Are Saying</p>
            <SectionDivider />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                quote: "MonArk matched me with someone who actually gets me. Three dates in and I already feel more connection than a year of swiping.",
                name: "DeShawn M.",
                city: "Chicago",
              },
              {
                quote: "I deleted Hinge the same week I joined. The RIF compatibility insight before my date? Game changer.",
                name: "Aaliyah R.",
                city: "Chicago",
              },
              {
                quote: "No more guessing games. MonArk introduced me to someone I actually want to call back.",
                name: "Jordan P.",
                city: "Chicago",
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12, ease: easeOut }}
                className="bg-[hsl(230_18%_15%)] rounded-2xl p-7 flex flex-col justify-between shadow-[0_8px_32px_rgba(28,31,46,0.25)]"
              >
                <p className="text-[hsl(240_6%_78%)] font-body text-sm leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <p className="text-[hsl(30_40%_72%)] font-caption text-xs tracking-[0.12em] uppercase">
                  — {testimonial.name}, {testimonial.city}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <SectionDivider />
      <MonArkPricing onSelectPlan={() => setShowWaitlistModal(true)} />

      {/* Waitlist Modal */}
      <WaitlistModal isOpen={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} sourcePage="enhanced-landing" />

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
          <div className="flex items-center justify-center gap-8 text-sm">
            <a href="/privacy" className="text-muted-foreground hover:text-foreground hover:underline font-body transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-muted-foreground hover:text-foreground hover:underline font-body transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

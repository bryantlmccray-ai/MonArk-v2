import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MonArkLogo } from '@/components/MonArkLogo';
import { PenLine, Heart, MapPin, ArrowRight, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';
import founderPortrait from '@/assets/founder-portrait.jpeg';
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
    <div className="min-h-screen bg-bone relative">
      {/* Subtle warm texture overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />

      {/* Hero Section — emotionally warm, cinematic */}
      <section className="relative overflow-hidden">
        {/* Layered warm gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-bone via-parchment to-sand" />
        <div className="absolute inset-0 bg-gradient-to-br from-rosegold/5 via-transparent to-goldenrod/3" />
        
        {/* Warm ambient orbs */}
        <motion.div
          className="absolute top-16 left-1/3 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsla(15, 50%, 65%, 0.08) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, hsla(35, 55%, 52%, 0.06) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <div className="text-center space-y-10">
            {/* Brand & Tagline */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <MonArkLogo size="xl" animated={true} rotateOnLoad={true} className="mx-auto" />
              
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif font-semibold text-charcoal leading-[0.9] tracking-tight">
                  Mon<span className="text-rosegold">A</span>rk
                </h1>
                <div className="w-20 h-[2px] mx-auto" style={{ background: "linear-gradient(to right, transparent, hsl(var(--color-rosegold)), transparent)" }} />
                <p className="text-sm md:text-base font-body tracking-[0.25em] text-charcoal-soft uppercase max-w-lg mx-auto">
                  3 curated matches. Every week.
                </p>
              </div>
            </motion.div>

            {/* Value Prop — stronger, warmer copy */}
            <motion.div
              className="max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-base md:text-lg font-body text-charcoal-soft leading-relaxed">
                No endless swiping. No algorithm games. Just{' '}
                <span className="text-charcoal font-medium">Smart Matching</span> that 
                understands how you connect, communicate, and love.
              </p>
            </motion.div>

            {/* Glassmorphism Waitlist CTA — warmer, deeper */}
            <motion.div
              className="max-w-md mx-auto"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative group">
                {/* Warm glow behind card */}
                <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"
                  style={{ background: "linear-gradient(135deg, hsla(15, 50%, 65%, 0.2), hsla(35, 55%, 52%, 0.15), hsla(350, 45%, 60%, 0.1))" }}
                />
                
                <div className="relative bg-white/80 backdrop-blur-2xl rounded-2xl p-8 border border-white/60 shadow-luxury">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 via-transparent to-rosegold/5 pointer-events-none" />
                  
                  <div className="relative text-center mb-6">
                    <p className="text-xs font-caption text-rosegold-deep tracking-[0.2em] mb-3">LIMITED EARLY ACCESS</p>
                    <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-charcoal mb-2">Get Your 3</h2>
                    <p className="text-sm text-charcoal-soft font-body">Join 500+ intentional daters on the waitlist</p>
                  </div>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      onClick={() => setShowWaitlistModal(true)}
                      className="relative w-full py-4 text-sm tracking-[0.1em] font-body text-white rounded-xl shadow-warm-glow hover:shadow-lg transition-all duration-300"
                      style={{ background: "linear-gradient(135deg, hsl(var(--color-taupe)), hsl(var(--color-rosegold-deep)))" }}
                    >
                      <span className="relative z-10">REQUEST EARLY ACCESS</span>
                    </Button>
                  </motion.div>

                  <div className="relative mt-5 pt-5 border-t border-rosegold/10">
                    <p className="text-sm text-charcoal font-body leading-relaxed text-center italic">
                      "Answer 10 thoughtful questions. We find people who get you."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Demo Button — warmer styling */}
            <motion.div
              className="space-y-3 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button
                onClick={startFullDemo}
                variant="outline"
                className="px-8 py-3 text-sm tracking-[0.1em] font-body bg-transparent border border-rosegold/25 text-charcoal hover:bg-rosegold/5 hover:border-rosegold/40 rounded-xl transition-all duration-300"
              >
                EXPERIENCE THE APP
              </Button>
              
              {onExitToApp && (
                <div>
                  <Button
                    onClick={onExitToApp}
                    variant="ghost"
                    className="px-6 py-2 text-xs tracking-[0.1em] font-body text-charcoal-muted hover:text-charcoal"
                  >
                    RETURN HOME
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-20 bg-gradient-to-b from-bone to-sand/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <a 
              href="https://www.instagram.com/monark.eq/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 group"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Instagram className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl sm:text-3xl font-editorial-headline text-charcoal group-hover:text-taupe transition-colors">
                  @monark.eq
                </h2>
                <p className="text-sm text-charcoal-soft font-body">Follow us on Instagram</p>
              </div>
            </a>
          </div>

          {/* Instagram Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {instagramImages.map((image, i) => (
              <a
                key={i}
                href="https://www.instagram.com/monark.eq/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'backwards' }}
              >
                <img 
                  src={image} 
                  alt={`MonArk Instagram post ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <Instagram className="h-8 w-8 text-white transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100" />
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://www.instagram.com/monark.eq/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-taupe/30 bg-white/50 backdrop-blur-sm text-charcoal hover:bg-white/70 hover:border-taupe/50 transition-all duration-300 font-body text-sm tracking-wide"
            >
              View More on Instagram
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* How It Works Section — warmer cards with hover */}
      <section className="py-20 bg-gradient-to-b from-sand/30 to-bone">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-5xl font-serif font-semibold text-charcoal mb-4">How Smart Matching Works</h2>
            <p className="text-sm md:text-base font-body tracking-[0.15em] text-charcoal-soft uppercase">Relational intelligence curates your perfect 3</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: PenLine, num: "01", title: "Take the RIF", desc: "10 questions about how you communicate, connect, and date. Takes 5 minutes." },
              { icon: Heart, num: "02", title: "Get Your 3", desc: "Every Sunday, receive 3 matches who fit your style—not just your type." },
              { icon: MapPin, num: "03", title: "Date With Intention", desc: "We suggest premium first dates at vetted venues. No awkward coffee shop roulette." },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="text-center space-y-4 p-6 rounded-2xl transition-all duration-500 hover:bg-white/60 hover:shadow-elevated group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                  style={{ 
                    background: "linear-gradient(135deg, hsla(15, 50%, 65%, 0.08), hsla(35, 55%, 52%, 0.06))",
                    border: "1px solid hsla(15, 50%, 65%, 0.15)",
                  }}
                >
                  <item.icon className="h-8 w-8 text-charcoal" strokeWidth={1.5} />
                </div>
                <div className="text-4xl font-serif font-semibold text-rosegold/60">{item.num}</div>
                <h3 className="font-serif font-semibold text-xl text-charcoal">{item.title}</h3>
                <p className="text-sm text-charcoal-soft font-body leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-base font-body tracking-[0.15em] text-charcoal-muted uppercase">
              No swipes. No chaos. Just connection that feels like alignment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founder Story Section */}
      <section className="py-20 bg-gradient-to-b from-bone to-sand/40 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-5xl font-serif font-semibold text-charcoal mb-4">Why I Built MonArk</h2>
            <p className="text-base text-charcoal-soft font-body leading-relaxed uppercase tracking-[0.1em]">A Founder's Note on Intentional Dating</p>
            <div className="w-16 h-[2px] mx-auto mt-6" style={{ background: "linear-gradient(to right, transparent, hsl(var(--color-rosegold)), transparent)" }} />
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Founder Image with Luxury Animation */}
            <motion.div 
              className="relative order-2 md:order-1"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Ambient glow behind image */}
              <motion.div 
                className="absolute -inset-4 bg-gradient-to-br from-goldenrod/15 via-taupe/10 to-dusty-rose/15 rounded-2xl blur-2xl"
                animate={{ 
                  opacity: [0.5, 0.7, 0.5],
                  scale: [1, 1.02, 1]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
              
              {/* Gold frame accent */}
              <motion.div 
                className="absolute -inset-1 rounded-xl bg-gradient-to-br from-goldenrod/40 via-taupe/20 to-goldenrod/30"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3 }}
              />
              
              {/* Image container */}
              <motion.div 
                className="relative overflow-hidden rounded-lg shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <img 
                  src={founderPortrait} 
                  alt="MonArk Founder" 
                  className="w-full h-auto object-cover"
                />
                
                {/* Subtle shine overlay */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%", opacity: 0 }}
                  whileInView={{ x: "100%", opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
            
            {/* Text Content */}
            <motion.div 
              className="space-y-6 order-1 md:order-2"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-base text-charcoal-soft font-body leading-relaxed tracking-wide">
                I spent years on dating apps that felt more like slot machines than places to find real connection.
              </p>
              
              <p className="text-base text-charcoal-soft font-body leading-relaxed tracking-wide">
                Sure, we could meet people. But finding someone who truly <em className="font-medium not-italic">got</em> you? That was rare.
              </p>
              
              <p className="text-base text-charcoal-soft font-body leading-relaxed tracking-wide">
                I wanted something intentional. A way to match on emotional compatibility, not just a hot profile pic. 
                A way to make first dates feel effortless, not awkward.
              </p>
              
              <p className="text-base text-charcoal font-body leading-relaxed tracking-wide font-medium">
                That's why MonArk matches on communication style, not just demographics.
              </p>
              
              <p className="text-base text-taupe font-body tracking-wide italic mt-8">
                — Bryant McCray, CEO & Founder
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-b from-sand/40 to-bone">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl sm:text-5xl font-serif font-semibold text-charcoal mb-4">Meet the Team</h2>
            <p className="text-sm md:text-base font-body tracking-[0.15em] text-charcoal-soft uppercase">The people behind intentional dating</p>
            <div className="w-16 h-[2px] mx-auto mt-6" style={{ background: "linear-gradient(to right, transparent, hsl(var(--color-rosegold)), transparent)" }} />
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Team Member 1 - Sheeza Anwar */}
            <motion.div 
              className="text-center space-y-4 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div 
                className="relative mx-auto w-32 h-32"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Ambient glow behind image */}
                <motion.div 
                  className="absolute -inset-2 bg-gradient-to-br from-goldenrod/15 via-taupe/10 to-dusty-rose/15 rounded-full blur-xl"
                  animate={{ 
                    opacity: [0.5, 0.7, 0.5],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
                
                {/* Gold frame accent */}
                <motion.div 
                  className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-goldenrod/40 via-taupe/20 to-goldenrod/30"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                />
                
                {/* Image container */}
                <motion.div 
                  className="relative w-full h-full overflow-hidden rounded-full shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img 
                    src={sheezaPortrait} 
                    alt="Sheeza Anwar" 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Subtle shine overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                    initial={{ x: "-100%", opacity: 0 }}
                    whileInView={{ x: "100%", opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                  />
                </motion.div>
              </motion.div>
              <div>
                <h3 className="font-editorial-headline text-xl text-charcoal">Sheeza Anwar</h3>
                <p className="text-sm text-taupe font-body tracking-wide uppercase">Internal Systems & Automation Engineer</p>
              </div>
              <p className="text-sm text-charcoal-soft font-body leading-relaxed">
                Focused on building reliable tools that help teams work better.
              </p>
            </motion.div>
            
            {/* Team Member 2 - Surya Teja Nulu */}
            <motion.div 
              className="text-center space-y-4 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              <motion.div 
                className="relative mx-auto w-32 h-32"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Ambient glow behind image */}
                <motion.div 
                  className="absolute -inset-2 bg-gradient-to-br from-goldenrod/15 via-taupe/10 to-dusty-rose/15 rounded-full blur-xl"
                  animate={{ 
                    opacity: [0.5, 0.7, 0.5],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
                
                {/* Gold frame accent */}
                <motion.div 
                  className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-goldenrod/40 via-taupe/20 to-goldenrod/30"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                />
                
                {/* Image container */}
                <motion.div 
                  className="relative w-full h-full overflow-hidden rounded-full shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img 
                    src={suryaPortrait} 
                    alt="Surya Teja Nulu" 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* MonArk logo overlay */}
                  <div className="absolute inset-0 flex items-end justify-center pb-3">
                    <div className="bg-charcoal/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center space-x-1">
                      <span className="text-[8px] font-serif text-ivory tracking-wider">MonArk</span>
                      <span className="text-[6px] text-ivory/70 italic font-body">Date well.</span>
                    </div>
                  </div>
                  
                  {/* Subtle shine overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                    initial={{ x: "-100%", opacity: 0 }}
                    whileInView={{ x: "100%", opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                  />
                </motion.div>
              </motion.div>
              <div>
                <h3 className="font-editorial-headline text-xl text-charcoal">Surya Teja Nulu</h3>
                <p className="text-sm text-taupe font-body tracking-wide uppercase">Founding Mobile & AI Engineer</p>
              </div>
              <p className="text-sm text-charcoal-soft font-body leading-relaxed">
                AI engineer and computer science graduate student. Focused on building practical, scalable AI systems.
              </p>
            </motion.div>
            
            {/* Team Member 3 - Grace O'Malley */}
            <motion.div 
              className="text-center space-y-4 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
              <motion.div 
                className="relative mx-auto w-32 h-32"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Ambient glow behind image */}
                <motion.div 
                  className="absolute -inset-2 bg-gradient-to-br from-goldenrod/15 via-taupe/10 to-dusty-rose/15 rounded-full blur-xl"
                  animate={{ 
                    opacity: [0.5, 0.7, 0.5],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
                
                {/* Gold frame accent */}
                <motion.div 
                  className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-goldenrod/40 via-taupe/20 to-goldenrod/30"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                />
                
                {/* Image container */}
                <motion.div 
                  className="relative w-full h-full overflow-hidden rounded-full shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img 
                    src={gracePortrait} 
                    alt="Grace O'Malley" 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Subtle shine overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                    initial={{ x: "-100%", opacity: 0 }}
                    whileInView={{ x: "100%", opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                  />
                </motion.div>
              </motion.div>
              <div>
                <h3 className="font-editorial-headline text-xl text-charcoal">Grace O'Malley</h3>
                <p className="text-sm text-taupe font-body tracking-wide uppercase">Relationship Therapist & Clinical Advisor</p>
              </div>
              <p className="text-sm text-charcoal-soft font-body leading-relaxed">
                Relationship therapist and licensed clinical social worker. Advises on emotional health and relationship dynamics.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-b from-bone to-sand/50">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl sm:text-5xl font-serif font-semibold text-charcoal mb-4">Early-Bird Access</h2>
            <p className="text-sm md:text-base font-body tracking-[0.15em] text-charcoal-soft uppercase">Limited-time founding member pricing</p>
          </motion.div>

          <motion.div
            className="relative group max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"
              style={{ background: "linear-gradient(135deg, hsla(15, 50%, 65%, 0.2), hsla(35, 55%, 52%, 0.15), hsla(350, 45%, 60%, 0.1))" }}
            />
            
            <div className="relative bg-white/80 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 border border-white/60 shadow-luxury">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-rosegold/5 pointer-events-none" />
              
              <div className="relative text-center mb-8">
                <div className="inline-flex items-baseline space-x-2">
                  <span className="text-5xl sm:text-7xl font-serif font-semibold text-charcoal">$35</span>
                  <span className="text-xl text-charcoal-soft font-body">/mo</span>
                </div>
                <p className="text-lg font-serif font-semibold text-charcoal mt-2">Core Access</p>
              </div>

              <div className="relative space-y-6">
                <div className="space-y-3">
                  <h3 className="font-serif font-semibold text-lg text-charcoal">Your 3 Every Week</h3>
                  <p className="text-charcoal-soft text-sm font-body leading-relaxed">
                    3 curated matches every Sunday, powered by Smart Matching. Each comes with an AI-suggested date idea.
                  </p>
                </div>

                <div className="border-t border-rosegold/10 pt-6">
                  <h3 className="font-serif font-semibold text-lg text-charcoal mb-3">Ark AI Concierge</h3>
                  <p className="text-charcoal-soft text-sm font-body leading-relaxed">
                    Chat-based AI that personalizes your date options and helps coordinate plans.
                  </p>
                </div>

                <div className="border-t border-rosegold/10 pt-6">
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      onClick={() => setShowWaitlistModal(true)}
                      className="w-full py-3 text-sm tracking-[0.1em] font-body text-white rounded-xl shadow-warm-glow"
                      style={{ background: "linear-gradient(135deg, hsl(var(--color-taupe)), hsl(var(--color-rosegold-deep)))" }}
                    >
                      JOIN WAITLIST
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Waitlist Modal */}
      <WaitlistModal isOpen={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} sourcePage="enhanced-landing" />

      {/* Footer — warm and grounded */}
      <footer className="py-16" style={{ background: "linear-gradient(180deg, hsl(var(--color-sand)), hsl(30, 20%, 88%))" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <MonArkLogo size="md" variant="compact" className="mx-auto mb-8" />
          
          <div className="mb-8">
            <a 
              href="https://www.instagram.com/monark.eq/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border bg-white/60 backdrop-blur-sm text-charcoal hover:bg-white/80 transition-all duration-300 group"
              style={{ borderColor: "hsla(15, 50%, 65%, 0.2)" }}
            >
              <Instagram className="h-4 w-4 text-rosegold group-hover:text-charcoal transition-colors" />
              <span className="text-sm font-body tracking-wide">@monark.eq</span>
            </a>
          </div>
          
          <p className="text-charcoal-soft font-body text-sm mb-6">
            &copy; {new Date().getFullYear()} MonArk. Dating reimagined with Smart Matching.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <a href="/privacy" className="text-charcoal-muted hover:text-charcoal hover:underline font-body transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-charcoal-muted hover:text-charcoal hover:underline font-body transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

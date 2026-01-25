import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MonArkLogo } from '@/components/MonArkLogo';
import { PenLine, Heart, MapPin, ArrowRight, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';
import founderPortrait from '@/assets/founder-portrait.jpeg';
import sheezaPortrait from '@/assets/team/sheeza-anwar.png';
import suryaPortrait from '@/assets/team/surya-nulu.png';
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
      {/* Subtle texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Layered gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sand/40 via-bone to-parchment/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-goldenrod/5" />
        
        {/* Romantic ambient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-goldenrod/8 rounded-full blur-3xl animate-gentle-pulse" />
        <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-dusty-rose/5 rounded-full blur-3xl animate-gentle-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-32">
          <div className="text-center space-y-12">
            {/* Brand & Tagline */}
            <div className="space-y-8">
              <MonArkLogo size="xl" animated={true} rotateOnLoad={true} className="mx-auto" />
              
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-6xl lg:text-8xl font-editorial-headline text-charcoal leading-[0.85] tracking-tight">
                  MonArk
                </h1>
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-taupe to-transparent mx-auto"></div>
                <p className="text-sm md:text-base font-body tracking-[0.2em] text-charcoal-soft uppercase max-w-lg mx-auto">
                  3 curated matches. Every week.
                </p>
              </div>
            </div>

            {/* Value Prop - warmer copy */}
            <div className="max-w-2xl mx-auto">
              <p className="text-sm md:text-base font-body tracking-[0.15em] text-charcoal-soft leading-relaxed uppercase">
                No endless swiping. No algorithm games. Just <span className="text-charcoal font-medium">Smart Matching</span> that 
                understands how you connect, communicate, and love.
              </p>
            </div>

            {/* Glassmorphism Waitlist CTA */}
            <div className="max-w-md mx-auto">
              <div className="relative group">
                {/* Glow effect behind card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-goldenrod/20 via-taupe/10 to-dusty-rose/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                
                <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-2xl">
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="relative text-center mb-6">
                    <p className="text-xs font-caption text-goldenrod tracking-widest mb-3">LIMITED EARLY ACCESS</p>
                    <h2 className="text-2xl font-editorial-headline text-charcoal mb-2">Get Your 3</h2>
                    <p className="text-sm text-charcoal-soft font-body">Join 500+ intentional daters on the waitlist</p>
                  </div>

                  <Button
                    onClick={() => setShowWaitlistModal(true)}
                    className="relative w-full py-4 text-sm tracking-wide font-body bg-gradient-to-r from-taupe to-taupe/90 hover:from-taupe/90 hover:to-taupe text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <span className="relative z-10">REQUEST EARLY ACCESS</span>
                  </Button>

                  <div className="relative mt-5 pt-5 border-t border-taupe/10">
                    <p className="text-sm text-charcoal font-body leading-relaxed text-center italic">
                      "Answer 10 thoughtful questions. We find people who get you."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Button */}
            <div className="space-y-4 pt-4">
              <Button
                onClick={startFullDemo}
                variant="outline"
                className="px-8 py-3 text-sm tracking-wide font-body bg-transparent border border-taupe/30 text-charcoal hover:bg-taupe/10 hover:border-taupe/50 rounded-xl transition-all duration-300"
              >
                EXPERIENCE THE APP
              </Button>
              
              {onExitToApp && (
                <div>
                  <Button
                    onClick={onExitToApp}
                    variant="ghost"
                    className="editorial-button-ghost px-6 py-2 text-xs tracking-wide font-body"
                  >
                    RETURN HOME
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-20 bg-gradient-to-b from-bone to-charcoal-gray/5">
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

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-charcoal-gray/5 to-charcoal-gray/15">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-editorial-headline text-charcoal mb-4">How Smart Matching Works</h2>
            <p className="text-sm md:text-base font-body tracking-[0.1em] text-charcoal-soft uppercase">We use relational intelligence to curate your perfect 3</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="border border-taupe/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <PenLine className="h-8 w-8 text-charcoal" strokeWidth={1.5} />
              </div>
              <div className="text-4xl font-editorial-headline text-charcoal">01</div>
              <h3 className="font-editorial-headline text-xl text-charcoal">Take the RIF</h3>
              <p className="text-sm text-charcoal-soft font-body leading-relaxed">
                10 questions about how you communicate, connect, and date. Takes 5 minutes.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="border border-taupe/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <Heart className="h-8 w-8 text-charcoal" strokeWidth={1.5} />
              </div>
              <div className="text-4xl font-editorial-headline text-charcoal">02</div>
              <h3 className="font-editorial-headline text-xl text-charcoal">Get Your 3</h3>
              <p className="text-sm text-charcoal-soft font-body leading-relaxed">
                Every Sunday, receive 3 matches who fit your style—not just your type.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="border border-taupe/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <MapPin className="h-8 w-8 text-charcoal" strokeWidth={1.5} />
              </div>
              <div className="text-4xl font-editorial-headline text-charcoal">03</div>
              <h3 className="font-editorial-headline text-xl text-charcoal">Date With Intention</h3>
              <p className="text-sm text-charcoal-soft font-body leading-relaxed">
                We suggest premium first dates at vetted venues. No awkward coffee shop roulette.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <p className="text-sm md:text-base font-body tracking-[0.2em] text-charcoal-soft uppercase">
              No swipes. No chaos. Just connection that feels like alignment.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Story Section */}
      <section className="py-20 bg-gradient-to-b from-charcoal-gray/15 to-charcoal-gray/10 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-editorial-headline text-charcoal mb-4">Why I Built MonArk</h2>
            <p className="text-lg text-charcoal-soft font-body leading-relaxed uppercase">A Founder's Note on Intentional Dating</p>
            <div className="w-16 h-px bg-taupe mx-auto mt-6"></div>
          </div>
          
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
      <section className="py-20 bg-gradient-to-b from-charcoal-gray/10 to-charcoal-gray/15">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-editorial-headline text-charcoal mb-4">Meet the Team</h2>
            <p className="text-sm md:text-base font-body tracking-[0.1em] text-charcoal-soft uppercase">The people behind intentional dating</p>
            <div className="w-16 h-px bg-taupe mx-auto mt-6"></div>
          </div>
          
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
            <div className="text-center space-y-4 group">
              <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-2 border-taupe/20 group-hover:border-taupe/40 transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-dusty-rose/20 to-goldenrod/20 flex items-center justify-center">
                  <span className="text-3xl font-editorial-headline text-charcoal-soft">GO</span>
                </div>
              </div>
              <div>
                <h3 className="font-editorial-headline text-xl text-charcoal">Grace O'Malley</h3>
                <p className="text-sm text-taupe font-body tracking-wide uppercase">Relationship Therapist & Clinical Advisor</p>
              </div>
              <p className="text-sm text-charcoal-soft font-body leading-relaxed">
                Relationship therapist and licensed clinical social worker. Advises on emotional health and relationship dynamics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-b from-charcoal-gray/10 to-charcoal-gray/25">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-editorial-headline text-charcoal mb-4">Early-Bird Access</h2>
            <p className="text-sm md:text-base font-body tracking-[0.1em] text-charcoal-soft uppercase">Limited-time founding member pricing</p>
          </div>

          <div className="relative group max-w-2xl mx-auto">
            {/* Glow effect behind card - same as waitlist */}
            <div className="absolute -inset-1 bg-gradient-to-r from-goldenrod/20 via-taupe/10 to-dusty-rose/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            
            <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-taupe/20 shadow-2xl">
              {/* Subtle inner glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative text-center mb-8">
                <div className="inline-flex items-baseline space-x-2">
                  <span className="text-5xl sm:text-6xl font-editorial-headline text-charcoal">$35</span>
                  <span className="text-xl text-charcoal-soft font-body">/mo</span>
                </div>
                <p className="text-lg font-editorial-headline text-charcoal mt-2">Core Access</p>
              </div>

              <div className="relative space-y-6">
                <div className="space-y-4">
                  <h3 className="font-editorial-headline text-lg text-charcoal">Your 3 Every Week</h3>
                  <p className="text-charcoal-soft text-sm font-body leading-relaxed tracking-wide">
                    3 curated matches every Sunday, powered by Smart Matching. Each comes with an AI-suggested date idea.
                  </p>
                </div>

                <div className="border-t border-taupe/20 pt-6">
                  <h3 className="font-editorial-headline text-lg text-charcoal mb-3">Ark AI Concierge</h3>
                  <p className="text-charcoal-soft text-sm font-body leading-relaxed tracking-wide">
                    Chat-based AI that personalizes your date options and helps coordinate plans.
                  </p>
                </div>

                <div className="border-t border-taupe/20 pt-6">
                  <Button
                    onClick={() => setShowWaitlistModal(true)}
                    className="w-full editorial-button-primary py-3 text-sm tracking-wide font-body"
                  >
                    JOIN WAITLIST
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Modal */}
      <WaitlistModal isOpen={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} sourcePage="enhanced-landing" />

      {/* Footer */}
      <footer className="py-16 bg-charcoal-gray/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <MonArkLogo size="md" variant="compact" className="mx-auto mb-8" />
          
          {/* Social Link */}
          <div className="mb-8">
            <a 
              href="https://www.instagram.com/monark.eq/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-taupe/20 bg-white/40 backdrop-blur-sm text-charcoal hover:bg-white/60 hover:border-taupe/40 transition-all duration-300 group"
            >
              <Instagram className="h-4 w-4 text-taupe group-hover:text-charcoal transition-colors" />
              <span className="text-sm font-body tracking-wide">@monark.eq</span>
            </a>
          </div>
          
          <p className="text-charcoal-soft font-body text-sm mb-6">
            &copy; 2024 MonArk. Dating reimagined with Smart Matching.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <a href="/privacy" className="text-taupe hover:underline font-body">
              Privacy Policy
            </a>
            <a href="/terms" className="text-taupe hover:underline font-body">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

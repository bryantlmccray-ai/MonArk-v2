import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MonArkLogo } from '@/components/MonArkLogo';
import { Sparkles, Users, Calendar, ArrowRight } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';
import { DemoMainApp } from './DemoMainApp';
import { WaitlistModal } from './WaitlistModal';

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
                <p className="text-xl sm:text-2xl font-body text-charcoal-soft leading-relaxed max-w-lg mx-auto">
                  3 curated matches. Every week.
                </p>
              </div>
            </div>

            {/* Value Prop - warmer copy */}
            <div className="max-w-2xl mx-auto">
              <p className="text-lg sm:text-xl font-body text-charcoal-soft leading-relaxed">
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
                    <p className="text-sm text-charcoal-soft font-body">Join 2,400+ intentional daters on the waitlist</p>
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

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-charcoal-gray/5 to-charcoal-gray/15">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-editorial-headline text-charcoal mb-4">How Smart Matching Works</h2>
            <p className="text-lg text-charcoal-soft font-body">We use relational intelligence to curate your perfect 3</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-taupe/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <Sparkles className="h-10 w-10 text-taupe" />
              </div>
              <div className="text-4xl font-editorial-headline text-charcoal">01</div>
              <h3 className="font-editorial-headline text-xl text-charcoal">Take the RIF</h3>
              <p className="text-sm text-charcoal-soft leading-relaxed">
                10 questions about how you communicate, connect, and date. Takes 5 minutes.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="bg-taupe/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <Users className="h-10 w-10 text-taupe" />
              </div>
              <div className="text-4xl font-editorial-headline text-charcoal">02</div>
              <h3 className="font-editorial-headline text-xl text-charcoal">Get Your 3</h3>
              <p className="text-sm text-charcoal-soft leading-relaxed">
                Every Sunday, receive 3 matches who fit your style—not just your type.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="bg-taupe/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <Calendar className="h-10 w-10 text-taupe" />
              </div>
              <div className="text-4xl font-editorial-headline text-charcoal">03</div>
              <h3 className="font-editorial-headline text-xl text-charcoal">Date With Intention</h3>
              <p className="text-sm text-charcoal-soft leading-relaxed">
                We suggest premium first dates at vetted venues. No awkward coffee shop roulette.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <p className="text-xl font-editorial-headline text-charcoal italic">
              No swipes. No chaos. Just connection that feels like alignment.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Story Section */}
      <section className="py-20 bg-gradient-to-b from-charcoal-gray/15 to-charcoal-gray/10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-editorial-headline text-charcoal mb-6">Why I Built MonArk</h2>
            <div className="w-16 h-px bg-taupe mx-auto"></div>
          </div>
          
          <div className="prose prose-lg max-w-2xl mx-auto text-charcoal-soft font-body leading-relaxed">
            <p className="text-lg leading-relaxed mb-6">
              I spent years on dating apps that felt more like slot machines than places to find real connection.
            </p>
            
            <p className="mb-6">
              Sure, we could meet people. But finding someone who truly <em>got</em> you? That was rare.
            </p>
            
            <p className="mb-6">
              I wanted something intentional. A way to match on emotional compatibility, not just a hot profile pic. 
              A way to make first dates feel effortless, not awkward.
            </p>
            
            <p className="font-medium text-charcoal">
              That's why MonArk matches on communication style, not just demographics.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-b from-charcoal-gray/10 to-charcoal-gray/25">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-editorial-headline text-charcoal mb-4">Early-Bird Access</h2>
            <p className="text-xl text-charcoal-soft font-body">Limited-time founding member pricing</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-taupe/20 shadow-2xl max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-baseline space-x-2">
                <span className="text-5xl sm:text-6xl font-editorial-headline text-charcoal">$35</span>
                <span className="text-xl text-charcoal-soft font-body">/mo</span>
              </div>
              <p className="text-lg font-editorial-headline text-charcoal mt-2">Core Access</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-editorial-headline text-lg text-charcoal">Your 3 Every Week</h3>
                <p className="text-charcoal-soft text-sm leading-relaxed">
                  3 curated matches every Sunday, powered by Smart Matching. Each comes with an AI-suggested date idea.
                </p>
              </div>

              <div className="border-t border-taupe/20 pt-6">
                <h3 className="font-editorial-headline text-lg text-charcoal mb-3">Ark AI Concierge</h3>
                <p className="text-charcoal-soft text-sm leading-relaxed">
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
      </section>

      {/* Waitlist Modal */}
      <WaitlistModal isOpen={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} sourcePage="enhanced-landing" />

      {/* Footer */}
      <footer className="py-16 bg-charcoal-gray/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <MonArkLogo size="md" variant="compact" className="mx-auto mb-8" />
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

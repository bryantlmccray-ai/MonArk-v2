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
    <div className="min-h-screen bg-bone">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sand/30 via-transparent to-parchment/20" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-32">
          <div className="text-center space-y-16">
            {/* Brand & Tagline */}
            <div className="space-y-8">
              <MonArkLogo size="xl" animated={true} rotateOnLoad={true} className="mx-auto" />
              
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-6xl lg:text-8xl font-editorial-headline text-charcoal leading-[0.85] tracking-tight">
                  MonArk
                </h1>
                <div className="w-24 h-px bg-taupe mx-auto"></div>
                <p className="text-xl sm:text-2xl font-body text-charcoal-soft leading-relaxed max-w-lg mx-auto">
                  3 curated matches. Every week.
                </p>
              </div>
            </div>

            {/* Value Prop */}
            <div className="max-w-2xl mx-auto">
              <p className="text-lg sm:text-xl font-body text-charcoal-soft leading-relaxed">
                No endless swiping. No algorithm games. Just <span className="text-charcoal font-medium">Smart Matching</span> that 
                understands how you connect, communicate, and date.
              </p>
            </div>

            {/* Waitlist CTA */}
            <div className="max-w-md mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-taupe/20 shadow-xl">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-editorial-headline text-charcoal mb-2">Get Your 3</h2>
                  <p className="text-sm text-charcoal-soft">Join the waitlist for early access</p>
                </div>

                <Button
                  onClick={() => setShowWaitlistModal(true)}
                  className="w-full editorial-button-primary py-3 text-sm tracking-wide font-body"
                >
                  JOIN WAITLIST
                </Button>

                <div className="bg-sand/30 rounded-lg p-4 border border-taupe/20 mt-4">
                  <p className="text-xs text-charcoal-soft font-body leading-relaxed text-center">
                    Answer 10 questions. We handle the rest.
                  </p>
                </div>
              </div>
            </div>

            {/* Demo Button */}
            <div className="space-y-4">
              <Button
                onClick={startFullDemo}
                variant="outline"
                className="editorial-button-secondary px-8 py-3 text-sm tracking-wide font-body"
              >
                EXPERIENCE DEMO
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

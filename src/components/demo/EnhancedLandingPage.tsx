import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MonArkLogo } from '@/components/MonArkLogo';
import { Hero3DBackground } from '@/components/3d/Hero3DBackground';
import { Heart, MessageCircle, Calendar, Shield, Star, MapPin, Users, Zap, ArrowRight, Play, CheckCircle, Quote, TrendingUp, Sparkles } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';
import { DemoMainApp } from './DemoMainApp';
import { WaitlistModal } from './WaitlistModal';

interface EnhancedLandingPageProps {
  onExitToApp?: () => void;
  onStartDemo?: () => void;
}

export const EnhancedLandingPage: React.FC<EnhancedLandingPageProps> = ({ onExitToApp, onStartDemo }) => {
  const { demoData, setDemoMode } = useDemo();
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showFullDemo, setShowFullDemo] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const startFullDemo = () => {
    console.log('startFullDemo called'); // Debug log
    if (onStartDemo) {
      console.log('Calling onStartDemo callback');
      onStartDemo();
    } else {
      console.log('Setting demo mode true and showFullDemo true');
      setDemoMode(true);
      setShowFullDemo(true);
    }
  };

  if (showFullDemo) {
    console.log('Rendering DemoMainApp');
    return <DemoMainApp onClose={onExitToApp ? onExitToApp : () => setShowFullDemo(false)} />;
  }

  if (showAuthForm) {
    return (
      <div className="min-h-screen bg-jet-black flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <MonArkLogo size="xl" animated={true} rotateOnLoad={true} className="mb-12" />
          </div>
          
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-light text-white">Join MonArk</h1>
            <p className="text-gray-400">Create your account to start meaningful connections</p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={() => setShowAuthForm(false)}
              variant="outline"
              className="w-full text-white border-white/30 hover:bg-white/10"
            >
              ← Back to Homepage
            </Button>
            
            <div className="text-center text-sm text-gray-500">
              <p>Authentication coming soon in full version</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone">
      {/* Hero Section - Editorial Magazine Style */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-sand/50 via-transparent to-parchment/30" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 lg:py-32">
          <div className="text-center space-y-8 sm:space-y-12 lg:space-y-20">
            <div className="animate-fade-in">
              <MonArkLogo size="xl" animated={true} rotateOnLoad={true} className="mx-auto mb-8 sm:mb-12 lg:mb-16" />
            </div>
            
            <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 lg:space-y-12">
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-editorial-headline text-charcoal leading-[0.9] tracking-wide px-2">
                  EMOTIONAL INTELLIGENCE,<br />NATURALLY ENGINEERED.
                </h1>
                <div className="w-32 h-px bg-taupe mx-auto"></div>
                <p className="text-base sm:text-lg font-body text-charcoal-soft leading-loose px-4">
                  Love doesn't have a script. But it can have a setting.<br />
                  A space where intention meets connection.
                </p>
              </div>
            </div>

            {/* Editorial Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 lg:gap-16 py-8 sm:py-12 max-w-lg mx-auto px-4">
              <div className="text-center space-y-2">
                <div className="text-xl sm:text-2xl lg:text-3xl font-editorial-headline text-taupe">85</div>
                <div className="font-caption text-charcoal-muted text-xs sm:text-sm">PERCENT SATISFACTION</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-xl sm:text-2xl lg:text-3xl font-editorial-headline text-taupe">3X</div>
                <div className="font-caption text-charcoal-muted text-xs sm:text-sm">DEEPER DIALOGUE</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-xl sm:text-2xl lg:text-3xl font-editorial-headline text-taupe">24/7</div>
                <div className="font-caption text-charcoal-muted text-xs sm:text-sm">AI GUIDANCE</div>
              </div>
            </div>

            <div className="space-y-6 max-w-sm mx-auto">
              <Button
                onClick={startFullDemo}
                className="w-full editorial-button-primary py-4 text-sm tracking-widest font-body"
              >
                EXPERIENCE DEMO
              </Button>
              
              <Button
                onClick={() => setShowWaitlistModal(true)}
                variant="outline"
                className="w-full editorial-button-secondary py-4 text-sm tracking-widest font-body"
              >
                JOIN WAITLIST
              </Button>
              
              {onExitToApp && (
                <Button
                  onClick={onExitToApp}
                  variant="ghost"
                  className="w-full editorial-button-ghost py-4 text-sm tracking-widest font-body"
                >
                  RETURN HOME
                </Button>
              )}
            </div>

            {/* Editorial Notice */}
            <div className="text-center pt-12 max-w-lg mx-auto space-y-4">
              <p className="font-body text-charcoal-soft text-sm leading-relaxed">
                Demo access requires no commitment. Full membership includes agreement to our{' '}
                <a href="/terms" className="text-taupe hover:underline">
                  Terms
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-taupe hover:underline">
                  Privacy Policy
                </a>
                .
              </p>

              <div className="flex items-center justify-center space-x-8 pt-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-taupe"></div>
                  <span className="font-caption text-charcoal-muted">Interactive</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-olive"></div>
                  <span className="font-caption text-charcoal-muted">No Registration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-20 bg-gradient-to-b from-charcoal-gray/10 to-charcoal-gray/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">
              Ready to Experience the Future of Dating
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Get a glimpse of the MonArk experience before you dive in
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 bg-gradient-to-br from-charcoal-gray/80 to-charcoal-gray/40 rounded-2xl p-8 border border-goldenrod/20">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1 bg-gray-700 rounded-full h-8 flex items-center px-4">
                    <span className="text-gray-400 text-sm">monark.app/discover</span>
                  </div>
                </div>
                
                <div className="bg-jet-black rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">Discovery Map</h3>
                    <Badge className="bg-goldenrod/20 text-goldenrod">Live Preview</Badge>
                  </div>
                  
                  
                  <div className="text-center pt-4">
                    <Button 
                      onClick={startFullDemo}
                      size="sm" 
                      className="bg-goldenrod-gradient text-jet-black hover:shadow-golden-glow"
                    >
                      Try Interactive Demo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-charcoal-gray/60 rounded-xl p-6 border border-blue-500/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <h4 className="text-white font-medium">RIF Matching</h4>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Our AI analyzes emotional compatibility in real-time
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Intent Clarity</span>
                    <span className="text-blue-400">92%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full w-[92%]"></div>
                  </div>
                </div>
              </div>

              <div className="bg-charcoal-gray/60 rounded-xl p-6 border border-goldenrod/20">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="h-5 w-5 text-goldenrod" />
                  <h4 className="text-white font-medium">Growth Tracking</h4>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Monitor your dating journey with personalized insights
                </p>
                <div className="text-center">
                  <div className="text-2xl font-bold text-goldenrod mb-1">127</div>
                  <div className="text-xs text-gray-400">Growth Points This Month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 bg-charcoal-gray/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">
              Redefining Online Dating
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our unique Relational Intelligence Framework (RIF) helps you connect 
              with people who match your emotional readiness and relationship goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Shield}
              title="RIF Compatibility"
              description="Our proprietary system matches you based on emotional readiness, communication styles, and relationship intentions."
              highlight="85% higher match satisfaction"
            />
            
            <FeatureCard 
              icon={MessageCircle}
              title="AI-Enhanced Conversations"
              description="Smart conversation nudges and ice-breakers help you build deeper connections naturally."
              highlight="3x more meaningful conversations"
            />
            
            <FeatureCard 
              icon={Calendar}
              title="Growth-Focused Journal"
              description="Track your dating experiences and receive personalized insights to improve your relationships."
              highlight="Personal growth tracking"
            />
            
            <FeatureCard 
              icon={MapPin}
              title="Proximity Awareness"
              description="Connect with people in your area while maintaining privacy and safety."
              highlight="Local connections"
            />
            
            <FeatureCard 
              icon={Users}
              title="Community Events"
              description="Join MonArk Circle events and meetups designed for authentic connections."
              highlight="Real-world meetups"
            />
            
            <FeatureCard 
              icon={Heart}
              title="Authentic Matching"
              description="Move beyond superficial swipes to connections based on genuine compatibility."
              highlight="Quality over quantity"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-charcoal-gray/30 to-jet-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">
              What Our Beta Users Are Saying
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Real feedback from people who've experienced MonArk's unique approach to dating
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="MonArk helped me understand myself better before dating others. The RIF matching is incredibly accurate."
              author="Sarah M."
              role="Product Designer"
              rating={5}
            />
            
            <TestimonialCard 
              quote="Finally, a dating app that prioritizes emotional compatibility. I found my person within 2 months!"
              author="David K."
              role="Software Engineer"
              rating={5}
            />
            
            <TestimonialCard 
              quote="The AI date concierge feature is genius. It suggested perfect activities based on our conversation style."
              author="Maya R."
              role="Marketing Director"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-charcoal-gray/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-300">
              Everything you need to know about MonArk
            </p>
          </div>

          <div className="space-y-6">
            <FAQItem 
              question="What makes MonArk different from other dating apps?"
              answer="MonArk uses our proprietary Relational Intelligence Framework (RIF) to match users based on emotional compatibility, communication styles, and relationship readiness - not just photos and basic preferences."
            />
            
            <FAQItem 
              question="How does the RIF matching system work?"
              answer="Our AI analyzes your conversation patterns, response styles, emotional readiness, and relationship goals to create a comprehensive compatibility profile. This helps us match you with people who complement your emotional and communicative approach to relationships."
            />
            
            <FAQItem 
              question="Is my data safe and private?"
              answer="Absolutely. We use industry-leading encryption and privacy measures. Your personal data is never sold to third parties, and you have complete control over your privacy settings and data retention."
            />
            
            <FAQItem 
              question="Can I try MonArk before committing?"
              answer="Yes! Our interactive demo lets you explore all features without signing up. You can experience the discovery map, RIF matching, and conversation tools risk-free."
            />
            
            <FAQItem 
              question="When will MonArk be available to everyone?"
              answer="We're currently in private beta with select users. Join our waitlist to be notified when we launch publicly and get early access to new features."
            />
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-goldenrod/10 to-blue-900/10 rounded-2xl p-12 border border-goldenrod/20">
            <h3 className="text-3xl font-light text-white mb-4">
              Ready to Experience the Future of Dating?
            </h3>
            <p className="text-xl text-gray-300 mb-8">
              Try our comprehensive demo and see how MonArk can transform your dating experience.
            </p>
            
            <Button
              onClick={startFullDemo}
              className="bg-goldenrod-gradient text-jet-black font-semibold px-8 py-4 text-lg hover:shadow-golden-glow transition-all duration-300"
            >
              <Star className="h-5 w-5 mr-2" />
              Launch Full Demo Experience
            </Button>
            
            <div className="text-sm text-gray-400 mt-6">
              <p>Explore profiles • Chat with matches • Track growth • No commitment required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-gray-400">
            <div className="flex items-center justify-center mb-8">
              <MonArkLogo size="md" variant="compact" />
            </div>
            <p className="mb-4">&copy; 2024 MonArk. Dating reimagined with emotional intelligence.</p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <a href="/privacy" className="text-goldenrod hover:underline">
                Privacy Policy
              </a>
              <a href="/terms" className="text-goldenrod hover:underline">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Waitlist Modal */}
      <WaitlistModal 
        isOpen={showWaitlistModal} 
        onClose={() => setShowWaitlistModal(false)} 
      />
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  highlight: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, highlight }) => (
  <div className="bg-charcoal-gray/50 rounded-xl p-6 border border-goldenrod/20 hover:border-goldenrod/40 transition-colors">
    <div className="bg-goldenrod/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-goldenrod" />
    </div>
    
    <h3 className="text-xl font-medium text-white mb-3">{title}</h3>
    <p className="text-gray-300 mb-4 leading-relaxed">{description}</p>
    
    <div className="inline-flex items-center px-3 py-1 bg-goldenrod/10 text-goldenrod text-sm rounded-full">
      <Star className="h-3 w-3 mr-1" />
      {highlight}
    </div>
  </div>
);

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, role, rating }) => (
  <div className="bg-charcoal-gray/50 rounded-xl p-6 border border-goldenrod/20 hover:border-goldenrod/40 transition-colors">
    <div className="flex items-center mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="h-4 w-4 text-goldenrod fill-goldenrod" />
      ))}
    </div>
    
    <Quote className="h-6 w-6 text-goldenrod/60 mb-4" />
    <p className="text-gray-300 leading-relaxed mb-6 italic">"{quote}"</p>
    
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gradient-to-br from-goldenrod/30 to-blue-500/30 rounded-full flex items-center justify-center">
        <span className="text-white font-medium text-sm">{author.charAt(0)}</span>
      </div>
      <div>
        <p className="text-white font-medium text-sm">{author}</p>
        <p className="text-gray-400 text-xs">{role}</p>
      </div>
    </div>
  </div>
);

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-charcoal-gray/30 rounded-xl border border-gray-700/50 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-charcoal-gray/50 transition-colors"
      >
        <h3 className="text-white font-medium pr-4">{question}</h3>
        <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ArrowRight className="h-5 w-5 text-goldenrod rotate-90" />
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-300 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};
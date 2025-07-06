import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MonArkLogo } from '@/components/MonArkLogo';
import { Heart, MessageCircle, Calendar, Shield, Star, MapPin, Users, Zap } from 'lucide-react';
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

  if (showAuthForm) {
    return (
      <div className="min-h-screen bg-jet-black flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <MonArkLogo showTitle size="xl" className="mb-6" />
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
    <div className="min-h-screen bg-jet-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-goldenrod/10 via-transparent to-purple-900/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-8">
            <MonArkLogo showTitle size="xl" className="mx-auto" />
            
            <div className="max-w-3xl mx-auto space-y-6">
              <h1 className="text-5xl md:text-6xl font-light text-white leading-tight">
                Dating with <span className="text-goldenrod font-medium">Emotional Intelligence</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                MonArk combines cutting-edge AI with relational psychology to help you build 
                meaningful connections. Experience dating that prioritizes emotional compatibility 
                and authentic relationships.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button
                onClick={startFullDemo}
                disabled={!agreedToTerms}
                className={`font-semibold px-8 py-4 text-lg transition-all duration-300 ${
                  agreedToTerms 
                    ? 'bg-goldenrod-gradient text-jet-black hover:shadow-golden-glow' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Zap className="h-5 w-5 mr-2" />
                Experience MonArk Demo
              </Button>
              
              <Button
                onClick={() => setShowWaitlistModal(true)}
                disabled={!agreedToTerms}
                variant="outline"
                className={`px-8 py-4 text-lg ${
                  agreedToTerms
                    ? 'text-white border-white/30 hover:bg-white/10'
                    : 'text-gray-400 border-gray-600 cursor-not-allowed'
                }`}
              >
                Join the Waitlist
              </Button>
              
              {onExitToApp && (
                <Button
                  onClick={onExitToApp}
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-white/5 px-8 py-4 text-lg"
                >
                  Return to Home Page
                </Button>
              )}
            </div>

            {/* Terms Consent */}
            <div className="flex items-start justify-center gap-3 pt-6 max-w-md mx-auto">
              <Checkbox
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1 border-goldenrod/50 data-[state=checked]:bg-goldenrod data-[state=checked]:border-goldenrod"
              />
              <p className="text-sm text-gray-400 leading-relaxed">
                I agree to MonArk's{' '}
                <a href="/terms" className="text-goldenrod hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-goldenrod hover:underline">
                  Privacy Policy
                </a>
                . By using MonArk, I consent to the collection and use of my data as described in these policies.
              </p>
            </div>

            <div className="text-sm text-gray-400 pt-4">
              <p>✨ Full interactive demo • No signup required</p>
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

      {/* Demo CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-goldenrod/10 to-purple-900/10 rounded-2xl p-12 border border-goldenrod/20">
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
            <div className="flex items-center justify-center space-x-2 mb-4">
              <MonArkLogo size="sm" />
              <span className="text-white font-medium">MonArk</span>
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
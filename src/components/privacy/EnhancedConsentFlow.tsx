import React, { useState } from 'react';
import { Shield, FileText, CheckCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface EnhancedConsentFlowProps {
  onConsent: (consented: boolean) => void;
}

export const EnhancedConsentFlow: React.FC<EnhancedConsentFlowProps> = ({ onConsent }) => {
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showFullText, setShowFullText] = useState<'privacy' | 'terms' | null>(null);

  const canProceed = hasReadPrivacy && hasReadTerms && consentGiven;

  const handleDocumentRead = (type: 'privacy' | 'terms') => {
    if (type === 'privacy') {
      setHasReadPrivacy(true);
    } else {
      setHasReadTerms(true);
    }
    setShowFullText(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 text-primary mx-auto" />
          <h1 className="text-3xl font-light text-foreground">Privacy & Terms</h1>
          <p className="text-foreground/80 text-base font-medium">
            Before creating your account, please review our Privacy Policy and Terms of Service
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <span className="text-primary font-semibold">Privacy-First Commitment</span>
          </div>
          <p className="text-foreground/70 text-sm font-medium">
            MonArk is built with privacy-by-design. We collect only the data necessary to provide our service, 
            and you maintain complete control over your information at all times.
          </p>
        </div>

        <div className="space-y-4">
          {/* Privacy Policy Section */}
          <div className="bg-card rounded-xl p-4 space-y-3 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-foreground font-semibold">Privacy Policy</span>
                {hasReadPrivacy && <CheckCircle className="h-4 w-4 text-primary" />}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullText('privacy')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Read
              </Button>
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              Learn how we collect, use, and protect your personal information, including health data.
            </p>
          </div>

          {/* Terms of Service Section */}
          <div className="bg-card rounded-xl p-4 space-y-3 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-foreground font-semibold">Terms of Service</span>
                {hasReadTerms && <CheckCircle className="h-4 w-4 text-primary" />}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullText('terms')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Read
              </Button>
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              Understand the terms that govern your use of the MonArk platform.
            </p>
          </div>

          {/* Consent Checkbox */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <div 
              className="flex items-start space-x-3 cursor-pointer"
              onClick={() => canProceed && setConsentGiven(!consentGiven)}
            >
              <Checkbox
                checked={consentGiven}
                onChange={() => setConsentGiven(!consentGiven)}
                disabled={!hasReadPrivacy || !hasReadTerms}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="text-foreground text-sm font-medium">
                  I have read and agree to the{' '}
                  <span className="text-primary">Privacy Policy</span>{' '}
                  and{' '}
                  <span className="text-primary">Terms of Service</span>
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  By checking this box, you consent to the collection and processing of your data as described in our Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onConsent(true)}
          disabled={!canProceed}
          className="w-full py-4 text-lg font-semibold rounded-xl"
        >
          Create Account
        </Button>

        <p className="text-xs text-muted-foreground text-center font-medium">
          You can review and update your privacy settings anytime in your account settings.
        </p>

        {/* Document Modal */}
        {showFullText && (
          <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 z-60">
            <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border-2 border-border shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.2)]">
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-semibold text-foreground">
                  {showFullText === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h3>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 text-foreground/80 text-sm font-medium">
                {showFullText === 'privacy' ? (
                  <div className="space-y-4">
                    <h4 className="text-foreground font-semibold">Data Collection & Use</h4>
                    <p>MonArk collects only the information necessary to provide our dating services. This includes profile information, interaction data, and anonymized patterns for improving our matching algorithms.</p>
                    
                    <h4 className="text-foreground font-semibold">Health Data Protection</h4>
                    <p>Any emotional or wellness-related data is treated as sensitive health information under laws like Washington's My Health My Data Act. We implement additional protections for this data including encryption, access controls, and anonymization for analytics.</p>
                    
                    <h4 className="text-foreground font-semibold">Your Rights</h4>
                    <p>You have the right to access, correct, or delete your personal data at any time. We provide tools in your privacy settings to exercise these rights immediately.</p>
                    
                    <h4 className="text-foreground font-semibold">Data Sharing</h4>
                    <p>We never sell your personal data. Anonymous, aggregated insights may be used to improve our services, but individual users cannot be identified from this data.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-foreground font-semibold">Account Responsibilities</h4>
                    <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
                    
                    <h4 className="text-foreground font-semibold">Community Guidelines</h4>
                    <p>MonArk is committed to being an emotionally safe space. Harassment, abuse, or any behavior that compromises the safety of our community is strictly prohibited.</p>
                    
                    <h4 className="text-foreground font-semibold">Service Availability</h4>
                    <p>We strive to maintain service availability but cannot guarantee uninterrupted access. We may modify or discontinue features with appropriate notice.</p>
                    
                    <h4 className="text-foreground font-semibold">Dispute Resolution</h4>
                    <p>Any disputes will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.</p>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-border flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFullText(null)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleDocumentRead(showFullText)}
                  className="flex-1"
                >
                  Mark as Read
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

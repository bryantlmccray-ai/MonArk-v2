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
    <div className="min-h-screen bg-jet-black flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 text-goldenrod mx-auto" />
          <h1 className="text-3xl font-light text-white">Privacy & Terms</h1>
          <p className="text-gray-300 text-base">
            Before creating your account, please review our Privacy Policy and Terms of Service
          </p>
        </div>

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
            <span className="text-blue-400 font-medium">Privacy-First Commitment</span>
          </div>
          <p className="text-blue-200 text-sm">
            MonArk is built with privacy-by-design. We collect only the data necessary to provide our service, 
            and you maintain complete control over your information at all times.
          </p>
        </div>

        <div className="space-y-4">
          {/* Privacy Policy Section */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-goldenrod" />
                <span className="text-white font-medium">Privacy Policy</span>
                {hasReadPrivacy && <CheckCircle className="h-4 w-4 text-green-400" />}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullText('privacy')}
                className="border-gray-600 text-gray-300"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Read
              </Button>
            </div>
            <p className="text-gray-400 text-sm">
              Learn how we collect, use, and protect your personal information, including health data.
            </p>
          </div>

          {/* Terms of Service Section */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-goldenrod" />
                <span className="text-white font-medium">Terms of Service</span>
                {hasReadTerms && <CheckCircle className="h-4 w-4 text-green-400" />}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullText('terms')}
                className="border-gray-600 text-gray-300"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Read
              </Button>
            </div>
            <p className="text-gray-400 text-sm">
              Understand the terms that govern your use of the MonArk platform.
            </p>
          </div>

          {/* Consent Checkbox */}
          <div className="bg-gray-700/50 rounded-lg p-4">
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
                <p className="text-white text-sm">
                  I have read and agree to the{' '}
                  <span className="text-goldenrod">Privacy Policy</span>{' '}
                  and{' '}
                  <span className="text-goldenrod">Terms of Service</span>
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  By checking this box, you consent to the collection and processing of your data as described in our Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onConsent(true)}
          disabled={!canProceed}
          className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 ${
            canProceed 
              ? 'bg-goldenrod-gradient text-jet-black hover:shadow-golden-glow transform hover:scale-105' 
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          Create Account
        </Button>

        <p className="text-xs text-gray-500 text-center">
          You can review and update your privacy settings anytime in your account settings.
        </p>

        {/* Document Modal */}
        {showFullText && (
          <div className="fixed inset-0 bg-jet-black/90 flex items-center justify-center p-4 z-60">
            <div className="bg-charcoal-gray rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white">
                  {showFullText === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h3>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 text-gray-300 text-sm">
                {showFullText === 'privacy' ? (
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Data Collection & Use</h4>
                    <p>MonArk collects only the information necessary to provide our dating and emotional wellness services. This includes profile information, interaction data, and anonymized behavioral patterns for improving our Relational Intelligence Framework (RIF).</p>
                    
                    <h4 className="text-white font-medium">Health Data Protection</h4>
                    <p>Any emotional or wellness-related data is treated as sensitive health information under laws like Washington's My Health My Data Act. We implement additional protections for this data including encryption, access controls, and anonymization for analytics.</p>
                    
                    <h4 className="text-white font-medium">Your Rights</h4>
                    <p>You have the right to access, correct, or delete your personal data at any time. We provide tools in your privacy settings to exercise these rights immediately.</p>
                    
                    <h4 className="text-white font-medium">Data Sharing</h4>
                    <p>We never sell your personal data. Anonymous, aggregated insights may be used to improve our services, but individual users cannot be identified from this data.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Account Responsibilities</h4>
                    <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
                    
                    <h4 className="text-white font-medium">Community Guidelines</h4>
                    <p>MonArk is committed to being an emotionally safe space. Harassment, abuse, or any behavior that compromises the safety of our community is strictly prohibited.</p>
                    
                    <h4 className="text-white font-medium">Service Availability</h4>
                    <p>We strive to maintain service availability but cannot guarantee uninterrupted access. We may modify or discontinue features with appropriate notice.</p>
                    
                    <h4 className="text-white font-medium">Dispute Resolution</h4>
                    <p>Any disputes will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.</p>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-700 flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFullText(null)}
                  className="flex-1 border-gray-600 text-gray-300"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleDocumentRead(showFullText)}
                  className="flex-1 bg-goldenrod-gradient text-jet-black font-medium"
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
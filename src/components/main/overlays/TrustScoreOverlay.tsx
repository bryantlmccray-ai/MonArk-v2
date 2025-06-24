
import React from 'react';
import { X, ShieldCheck, CheckCircle } from 'lucide-react';

interface TrustScoreOverlayProps {
  onClose: () => void;
}

export const TrustScoreOverlay: React.FC<TrustScoreOverlayProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-jet-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-charcoal-gray rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-white">MonArk Trust Score</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <ShieldCheck className="h-16 w-16 text-goldenrod mx-auto mb-4" />
            <h3 className="text-white font-medium text-lg mb-2">Build Trust & Safety</h3>
            <p className="text-gray-400 text-sm">
              Verified profiles create a safer, more authentic dating experience for everyone.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <h4 className="text-white font-medium">Identity Verified</h4>
                <p className="text-gray-400 text-sm">Government ID confirmation</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
              <CheckCircle className="h-6 w-6 text-gray-500" />
              <div>
                <h4 className="text-white font-medium">Record Checked</h4>
                <p className="text-gray-400 text-sm">Background screening available</p>
              </div>
            </div>
          </div>

          <div className="bg-goldenrod/10 border border-goldenrod/30 rounded-lg p-4">
            <h4 className="text-goldenrod font-medium mb-2">Benefits of Verification</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Higher match quality</li>
              <li>• Increased profile visibility</li>
              <li>• Trust badge on profile</li>
              <li>• Access to verified-only events</li>
            </ul>
          </div>

          <button className="w-full py-3 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow">
            Start Verification - $9.99
          </button>
        </div>
      </div>
    </div>
  );
};

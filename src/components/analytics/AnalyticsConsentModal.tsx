import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Shield, 
  Eye, 
  Heart, 
  MessageCircle, 
  Calendar,
  Lock,
  Trash2,
  Download
} from 'lucide-react';
import { useMonthlyAnalytics } from '@/hooks/useMonthlyAnalytics';

interface AnalyticsConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsConsentModal: React.FC<AnalyticsConsentModalProps> = ({
  isOpen,
  onClose
}) => {
  const { analyticsEnabled, updateAnalyticsConsent } = useMonthlyAnalytics();
  const [tempConsent, setTempConsent] = useState(analyticsEnabled);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const success = await updateAnalyticsConsent(tempConsent);
    if (success) {
      onClose();
    }
    setLoading(false);
  };

  const dataPoints = [
    {
      icon: MessageCircle,
      title: 'Conversation Patterns',
      description: 'Chat frequency, response times, and engagement levels',
      color: 'text-blue-400'
    },
    {
      icon: Calendar,
      title: 'Dating Activity',
      description: 'Date proposals, attendance, and feedback ratings',
      color: 'text-green-400'
    },
    {
      icon: Heart,
      title: 'Emotional Growth',
      description: 'Journal entries, reflections, and personal milestones',
      color: 'text-red-400'
    },
    {
      icon: TrendingUp,
      title: 'Behavioral Insights',
      description: 'Usage patterns, preferences, and growth metrics',
      color: 'text-purple-400'
    }
  ];

  const privacyPoints = [
    'Data is processed locally and encrypted',
    'No personal conversations are stored',
    'All analytics are anonymous and aggregated',
    'You can delete your data anytime',
    'Insights are never shared with other users'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5 text-goldenrod" />
            MonArk Moments Analytics
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Get personalized insights about your dating journey with our monthly recap feature
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Toggle */}
          <div className="flex items-center justify-between p-4 bg-charcoal-gray/50 rounded-lg border border-gray-700">
            <div className="space-y-1">
              <Label className="text-white font-medium">Enable MonArk Moments</Label>
              <p className="text-sm text-gray-400">
                Generate monthly insights about your dating journey
              </p>
            </div>
            <Switch
              checked={tempConsent}
              onCheckedChange={setTempConsent}
              className="data-[state=checked]:bg-goldenrod"
            />
          </div>

          {/* What We Track */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Eye className="h-4 w-4" />
              What We Track
            </h3>
            
            <div className="grid gap-3">
              {dataPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-charcoal-gray/30 rounded-lg">
                  <point.icon className={`h-5 w-5 mt-0.5 ${point.color}`} />
                  <div>
                    <h4 className="text-white font-medium text-sm">{point.title}</h4>
                    <p className="text-gray-400 text-xs">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-600" />

          {/* Privacy & Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy & Security
            </h3>
            
            <div className="space-y-2">
              {privacyPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Lock className="h-3 w-3 text-goldenrod mt-1 flex-shrink-0" />
                  <span className="text-gray-300">{point}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-600" />

          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">What You'll Get</h3>
            
            <div className="grid gap-3">
              <div className="bg-gradient-to-r from-goldenrod/10 to-orange-500/10 rounded-lg p-4 border border-goldenrod/30">
                <h4 className="text-goldenrod font-medium mb-2">Monthly Recap Stories</h4>
                <p className="text-gray-300 text-sm">
                  Beautiful, shareable insights about your dating journey, similar to Spotify Wrapped
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/30">
                <h4 className="text-purple-400 font-medium mb-2">Personal Growth Insights</h4>
                <p className="text-gray-300 text-sm">
                  Understand your dating patterns, emotional growth, and relationship energy
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg p-4 border border-blue-500/30">
                <h4 className="text-blue-400 font-medium mb-2">Actionable Recommendations</h4>
                <p className="text-gray-300 text-sm">
                  AI-powered suggestions to improve your dating experience and connections
                </p>
              </div>
            </div>
          </div>

          {/* Current Status */}
          {analyticsEnabled && (
            <div className="bg-charcoal-gray/50 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-goldenrod" />
                Analytics Status
              </h4>
              <p className="text-gray-300 text-sm mb-3">
                MonArk Moments is currently enabled. Your insights are being generated.
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-gray-600 text-gray-300"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete All Data
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-goldenrod hover:bg-goldenrod/90 text-jet-black font-medium"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            By enabling MonArk Moments, you agree to our data processing practices outlined in our Privacy Policy
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
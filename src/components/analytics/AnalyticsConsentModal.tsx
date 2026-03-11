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
      color: 'text-blue-600'
    },
    {
      icon: Calendar,
      title: 'Dating Activity',
      description: 'Date proposals, attendance, and feedback ratings',
      color: 'text-green-600'
    },
    {
      icon: Heart,
      title: 'Emotional Growth',
      description: 'Journal entries, reflections, and personal milestones',
      color: 'text-red-500'
    },
    {
      icon: TrendingUp,
      title: 'Behavioral Insights',
      description: 'Usage patterns, preferences, and growth metrics',
      color: 'text-purple-600'
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-2 border-border shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.15)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            MonArk Moments Analytics
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Get personalized insights about your dating journey with our monthly recap feature
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
            <div className="space-y-1">
              <Label className="text-foreground font-semibold">Enable MonArk Moments</Label>
              <p className="text-sm text-muted-foreground font-medium">
                Generate monthly insights about your dating journey
              </p>
            </div>
            <Switch
              checked={tempConsent}
              onCheckedChange={setTempConsent}
            />
          </div>

          {/* What We Track */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              What We Track
            </h3>
            
            <div className="grid gap-3">
              {dataPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                  <point.icon className={`h-5 w-5 mt-0.5 ${point.color}`} />
                  <div>
                    <h4 className="text-foreground font-semibold text-sm">{point.title}</h4>
                    <p className="text-muted-foreground text-xs">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Privacy & Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy & Security
            </h3>
            
            <div className="space-y-2">
              {privacyPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Lock className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                  <span className="text-foreground/80 font-medium">{point}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">What You'll Get</h3>
            
            <div className="grid gap-3">
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <h4 className="text-primary font-semibold mb-2">Monthly Recap Stories</h4>
                <p className="text-foreground/70 text-sm font-medium">
                  Beautiful, shareable insights about your dating journey, similar to Spotify Wrapped
                </p>
              </div>
              
              <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                <h4 className="text-accent-foreground font-semibold mb-2">Personal Growth Insights</h4>
                <p className="text-foreground/70 text-sm font-medium">
                  Understand your dating patterns, emotional growth, and relationship energy
                </p>
              </div>
              
              <div className="bg-secondary rounded-xl p-4 border border-border">
                <h4 className="text-foreground font-semibold mb-2">Actionable Recommendations</h4>
                <p className="text-foreground/70 text-sm font-medium">
                  AI-powered suggestions to improve your dating experience and connections
                </p>
              </div>
            </div>
          </div>

          {/* Current Status */}
          {analyticsEnabled && (
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <h4 className="text-foreground font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Analytics Status
              </h4>
              <p className="text-foreground/70 text-sm font-medium mb-3">
                MonArk Moments is currently enabled. Your insights are being generated.
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
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
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center font-medium">
            By enabling MonArk Moments, you agree to our data processing practices outlined in our Privacy Policy
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, User, Loader2, MapPin, Heart, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { waitlistStep1Schema, waitlistStep2Schema, waitlistStep3Schema, getFieldErrors } from '@/lib/validation';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePage?: string;
  selectedPlan?: string;
  initialEmail?: string;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose, sourcePage = 'demo-landing', selectedPlan, initialEmail }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: initialEmail || '',
    ageRange: '',
    city: '',
    genderIdentity: '',
    lookingFor: '',
    relationshipGoal: '',
    whyMonark: '',
    heardAboutUs: '',
    willingToBeta: false,
    emailOptIn: true,
    agreeToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  React.useEffect(() => {
    if (initialEmail) {
      setFormData(prev => ({ ...prev, email: initialEmail }));
    }
  }, [initialEmail]);

  const stepNames: Record<number, string> = { 1: 'About You', 2: 'Your Preferences', 3: 'Final Details' };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    let result;
    switch (step) {
      case 1:
        result = waitlistStep1Schema.safeParse(formData);
        break;
      case 2:
        result = waitlistStep2Schema.safeParse(formData);
        break;
      case 3:
        result = waitlistStep3Schema.safeParse(formData);
        break;
      default:
        return true;
    }

    if (result.success) {
      setFieldErrors({});
      return true;
    }

    const errors = getFieldErrors(result);
    setFieldErrors(errors);

    // Show the first error as a toast
    const firstError = Object.values(errors)[0];
    if (firstError) {
      toast({
        title: step === 2 && errors.city?.includes('Chicago') ? "Chicago Only for MVP" : "Please fix the highlighted fields",
        description: firstError,
        variant: "destructive"
      });
    }
    return false;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('waitlist_submissions')
        .insert({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim() || null,
          email: formData.email.trim().toLowerCase(),
          city: formData.city.trim(),
          age_range: formData.ageRange,
          gender_identity: formData.genderIdentity.trim(),
          looking_for: formData.lookingFor.trim(),
          relationship_goal: formData.relationshipGoal,
          why_monark: formData.whyMonark.trim(),
          heard_about_us: formData.heardAboutUs.trim() || null,
          willing_to_beta: formData.willingToBeta,
          email_opt_in: formData.emailOptIn,
          user_agent: navigator.userAgent,
           source_page: sourcePage,
           other_notes: selectedPlan ? `Selected plan: ${selectedPlan}` : 'Early Access Waitlist',
         });

      if (error) {
        console.error('Waitlist submission error:', error);
        toast({
          title: "Submission Failed",
          description: "There was an error joining the waitlist. Please try again.",
          variant: "destructive"
        });
        return;
      }

      try {
        await supabase.functions.invoke('waitlist-confirmation-email', {
          body: {
            email: formData.email.trim().toLowerCase(),
            firstName: formData.firstName.trim()
          }
        });
      } catch (emailError) {
        console.error('Email error (non-blocking):', emailError);
      }

      setIsSubmitted(true);

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        firstName: '', lastName: '', email: '',
        ageRange: '', city: '', genderIdentity: '', lookingFor: '', relationshipGoal: '',
        whyMonark: '', heardAboutUs: '', willingToBeta: false, emailOptIn: true, agreeToTerms: false
      });
      setIsSubmitted(false);
      setCurrentStep(1);
      setFieldErrors({});
      onClose();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            {(() => {
              const planLabels: Record<string, string> = {
                'The Ark': 'The Ark — $39.99/mo',
                'The Inner Ark': 'The Inner Ark — $79.99/mo',
                'Founding Members': 'Founding Member — $35/mo (lifetime)',
              };
              const label = selectedPlan ? (planLabels[selectedPlan] || selectedPlan) : 'Early Access Waitlist';
              return (
                <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground">
                  Applying for: <span className="font-semibold text-primary">{label}</span>
                </div>
              );
            })()}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-foreground text-sm font-semibold">First Name *</Label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${fieldErrors.firstName ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`bg-background border-border text-foreground pl-10 ${fieldErrors.firstName ? 'border-destructive ring-2 ring-destructive/50' : ''}`}
                    placeholder="First name"
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                </div>
                {fieldErrors.firstName && (
                  <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-foreground text-sm font-semibold">Last Name <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="bg-background border-border text-foreground"
                  placeholder="Last name"
                  disabled={isSubmitting}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm font-semibold">Email Address *</Label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${fieldErrors.email ? 'text-destructive' : 'text-muted-foreground'}`} />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`bg-background border-border text-foreground pl-10 ${fieldErrors.email ? 'border-destructive ring-2 ring-destructive/50' : ''}`}
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                  maxLength={255}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ageRange" className="text-foreground text-sm font-semibold">Age Range *</Label>
              <Select value={formData.ageRange} onValueChange={(val) => handleInputChange('ageRange', val)} disabled={isSubmitting}>
                <SelectTrigger className={`bg-background border-border text-foreground ${fieldErrors.ageRange ? 'border-destructive ring-2 ring-destructive/50' : ''}`}>
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="18-24">18-24</SelectItem>
                  <SelectItem value="25-34">25-34</SelectItem>
                  <SelectItem value="35-44">35-44</SelectItem>
                  <SelectItem value="45-54">45-54</SelectItem>
                  <SelectItem value="55+">55+</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.ageRange && (
                <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.ageRange}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-foreground text-sm font-semibold">City *</Label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${fieldErrors.city ? 'text-destructive' : 'text-muted-foreground'}`} />
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`bg-background border-border text-foreground pl-10 ${fieldErrors.city ? 'border-destructive ring-2 ring-destructive/50' : ''}`}
                  placeholder="Chicago"
                  disabled={isSubmitting}
                  maxLength={100}
                />
              </div>
              {fieldErrors.city ? (
                <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.city}
                </p>
              ) : formData.city.trim() !== '' && formData.city.trim().toLowerCase() !== 'chicago' ? (
                <p className="text-xs text-[hsl(36_80%_40%)] flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  MonArk is currently only available in Chicago. We'll notify you when we launch in your city!
                </p>
              ) : (
                <p className="text-xs text-primary/80 flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  We're launching in Chicago first
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genderIdentity" className="text-foreground text-sm font-semibold">I am a... *</Label>
                <Input
                  id="genderIdentity"
                  value={formData.genderIdentity}
                  onChange={(e) => handleInputChange('genderIdentity', e.target.value)}
                  className={`bg-background border-border text-foreground ${fieldErrors.genderIdentity ? 'border-destructive ring-2 ring-destructive/50' : ''}`}
                  placeholder="e.g. Woman, Man, Non-binary"
                  disabled={isSubmitting}
                  maxLength={100}
                />
                {fieldErrors.genderIdentity && (
                  <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.genderIdentity}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lookingFor" className="text-foreground text-sm font-semibold">Looking for... *</Label>
                <Input
                  id="lookingFor"
                  value={formData.lookingFor}
                  onChange={(e) => handleInputChange('lookingFor', e.target.value)}
                  className={`bg-background border-border text-foreground ${fieldErrors.lookingFor ? 'border-destructive ring-2 ring-destructive/50' : ''}`}
                  placeholder="e.g. Women, Men, Everyone"
                  disabled={isSubmitting}
                  maxLength={100}
                />
                {fieldErrors.lookingFor && (
                  <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.lookingFor}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationshipGoal" className="text-foreground text-sm font-semibold">What are you looking for? *</Label>
              <Select value={formData.relationshipGoal} onValueChange={(val) => handleInputChange('relationshipGoal', val)} disabled={isSubmitting}>
                <SelectTrigger className={`bg-background border-border text-foreground ${fieldErrors.relationshipGoal ? 'border-destructive ring-2 ring-destructive/50' : ''}`}>
                  <SelectValue placeholder="Select your goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Something casual</SelectItem>
                  <SelectItem value="dating">Dating & exploring</SelectItem>
                  <SelectItem value="long-term">Long-term relationship</SelectItem>
                  <SelectItem value="not sure">Not sure yet</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.relationshipGoal && (
                <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.relationshipGoal}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whyMonark" className="text-foreground text-sm font-semibold">Why do you want to join MonArk? *</Label>
              <Textarea
                id="whyMonark"
                value={formData.whyMonark}
                onChange={(e) => handleInputChange('whyMonark', e.target.value)}
                className={`bg-background border-border text-foreground min-h-[120px] ${fieldErrors.whyMonark ? 'border-destructive ring-2 ring-destructive/50' : ''}`}
                placeholder="Tell us a bit about yourself and what you're hoping to find. What's not working with other dating apps? What excites you about MonArk's approach?"
                disabled={isSubmitting}
                maxLength={2000}
              />
              {fieldErrors.whyMonark ? (
                <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.whyMonark}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground font-medium">This helps us understand if MonArk is a good fit for you</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="heardAboutUs" className="text-foreground text-sm font-semibold">How did you hear about us?</Label>
              <Input
                id="heardAboutUs"
                value={formData.heardAboutUs}
                onChange={(e) => handleInputChange('heardAboutUs', e.target.value)}
                className="bg-background border-border text-foreground"
                placeholder="Social media, friend, article, etc."
                disabled={isSubmitting}
                maxLength={500}
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="willingToBeta"
                  checked={formData.willingToBeta}
                  onCheckedChange={(checked) => handleInputChange('willingToBeta', checked as boolean)}
                  disabled={isSubmitting}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="willingToBeta" className="text-foreground/80 text-sm cursor-pointer font-medium">
                  I'm interested in beta testing new features
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailOptIn"
                  checked={formData.emailOptIn}
                  onCheckedChange={(checked) => handleInputChange('emailOptIn', checked as boolean)}
                  disabled={isSubmitting}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="emailOptIn" className="text-foreground/80 text-sm cursor-pointer font-medium">
                  Keep me updated about MonArk's launch
                </Label>
              </div>

              <div className="flex items-start space-x-2 pt-2 border-t border-border">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                  disabled={isSubmitting}
                  className={`border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5 ${fieldErrors.agreeToTerms ? 'border-destructive ring-2 ring-destructive/50' : ''}`}
                />
                <Label htmlFor="agreeToTerms" className="text-foreground/80 text-sm cursor-pointer font-medium leading-snug">
                  I agree to MonArk's{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a> *
                </Label>
              </div>
              {fieldErrors.agreeToTerms && (
                <p className="text-xs text-destructive flex items-center gap-1 font-medium ml-6">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.agreeToTerms}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card border-2 border-border shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.25)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {isSubmitted ? 'You\'re on the List!' : 'Join the MonArk Waitlist'}
          </DialogTitle>
          <DialogDescription className="text-foreground/80 font-medium">
            {isSubmitted 
              ? 'We\'ll review your application and get back to you soon.'
              : (<><span>{`Step ${currentStep} of ${totalSteps}`}</span><br /><span className="font-semibold text-foreground/70">{stepNames[currentStep]}</span></>)
            }
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg text-foreground font-semibold">Welcome, {formData.firstName}!</h3>
              <p className="text-foreground/80 text-sm leading-relaxed font-medium">
                Thank you for your interest in MonArk. We're reviewing applications now and will let you know within <span className="text-primary font-semibold">1-2 days</span>.
              </p>
              <p className="text-muted-foreground text-xs font-medium">
                Check your email for a confirmation from us.
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="w-full"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Progress bar */}
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < currentStep ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ))}
            </div>

            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="text-muted-foreground hover:text-foreground font-medium"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="font-semibold"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.agreeToTerms}
                  className="font-semibold min-w-[140px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center pt-1 font-medium">🔒 Your data is encrypted and secure</p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

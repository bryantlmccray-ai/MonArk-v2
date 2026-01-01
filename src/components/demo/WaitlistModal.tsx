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

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePage?: string;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose, sourcePage = 'demo-landing' }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Contact
    firstName: '',
    lastName: '',
    email: '',
    // Step 2: About You
    ageRange: '',
    city: '',
    genderIdentity: '',
    lookingFor: '',
    relationshipGoal: '',
    // Step 3: Why MonArk
    whyMonark: '',
    heardAboutUs: '',
    willingToBeta: false,
    emailOptIn: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const totalSteps = 3;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, boolean> = {};
    let isValid = true;

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) {
          errors.firstName = true;
          isValid = false;
        }
        if (!formData.email.trim()) {
          errors.email = true;
          isValid = false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email.trim() && !emailRegex.test(formData.email)) {
          errors.email = true;
          isValid = false;
          toast({
            title: "Invalid Email",
            description: "Please enter a valid email address",
            variant: "destructive"
          });
        }
        if (!isValid && !errors.email) {
          toast({
            title: "Required Fields Missing",
            description: "Please fill in the highlighted fields",
            variant: "destructive"
          });
        }
        break;
      case 2:
        if (!formData.ageRange) {
          errors.ageRange = true;
          isValid = false;
        }
        if (!formData.city.trim()) {
          errors.city = true;
          isValid = false;
        }
        // Check if city is Chicago (case insensitive)
        const cityLower = formData.city.toLowerCase().trim();
        if (formData.city.trim() && !cityLower.includes('chicago')) {
          errors.city = true;
          toast({
            title: "Chicago Only for MVP",
            description: "We're launching in Chicago first! We'll notify you when we expand to your area.",
            variant: "destructive"
          });
          setFieldErrors(errors);
          return false;
        }
        if (!formData.genderIdentity.trim()) {
          errors.genderIdentity = true;
          isValid = false;
        }
        if (!formData.lookingFor.trim()) {
          errors.lookingFor = true;
          isValid = false;
        }
        if (!formData.relationshipGoal) {
          errors.relationshipGoal = true;
          isValid = false;
        }
        if (!isValid) {
          toast({
            title: "Required Fields Missing",
            description: "Please fill in the highlighted fields",
            variant: "destructive"
          });
        }
        break;
      case 3:
        if (!formData.whyMonark.trim() || formData.whyMonark.trim().length < 20) {
          errors.whyMonark = true;
          isValid = false;
          toast({
            title: "Tell Us More",
            description: "Please write at least a sentence about why you want to join MonArk",
            variant: "destructive"
          });
        }
        break;
      default:
        break;
    }

    setFieldErrors(errors);
    return isValid;
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
    
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert waitlist submission
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
          source_page: sourcePage
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

      // Send confirmation email
      try {
        await supabase.functions.invoke('waitlist-confirmation-email', {
          body: {
            email: formData.email.trim().toLowerCase(),
            firstName: formData.firstName.trim()
          }
        });
      } catch (emailError) {
        console.error('Email error (non-blocking):', emailError);
        // Don't block submission if email fails
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
        whyMonark: '', heardAboutUs: '', willingToBeta: false, emailOptIn: true
      });
      setIsSubmitted(false);
      setCurrentStep(1);
      onClose();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white text-sm">First Name *</Label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${fieldErrors.firstName ? 'text-red-400' : 'text-gray-400'}`} />
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`bg-white border-gray-700 text-black pl-10 ${fieldErrors.firstName ? 'border-red-500 ring-2 ring-red-500/50' : ''}`}
                    placeholder="First name"
                    disabled={isSubmitting}
                  />
                </div>
                {fieldErrors.firstName && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    First name is required
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white text-sm">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="bg-white border-gray-700 text-black"
                  placeholder="Last name"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm">Email Address *</Label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${fieldErrors.email ? 'text-red-400' : 'text-gray-400'}`} />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`bg-white border-gray-700 text-black pl-10 ${fieldErrors.email ? 'border-red-500 ring-2 ring-red-500/50' : ''}`}
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Valid email is required
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ageRange" className="text-white text-sm">Age Range *</Label>
              <Select value={formData.ageRange} onValueChange={(val) => handleInputChange('ageRange', val)} disabled={isSubmitting}>
                <SelectTrigger className={`bg-white border-gray-700 text-black ${fieldErrors.ageRange ? 'border-red-500 ring-2 ring-red-500/50' : ''}`}>
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
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Age range is required
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-white text-sm">City *</Label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${fieldErrors.city ? 'text-red-400' : 'text-gray-400'}`} />
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`bg-white border-gray-700 text-black pl-10 ${fieldErrors.city ? 'border-red-500 ring-2 ring-red-500/50' : ''}`}
                  placeholder="Chicago"
                  disabled={isSubmitting}
                />
              </div>
              {fieldErrors.city ? (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  City is required (Chicago only for MVP)
                </p>
              ) : (
                <p className="text-xs text-goldenrod/80 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  We're launching in Chicago first
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genderIdentity" className="text-white text-sm">I am a... *</Label>
                <Input
                  id="genderIdentity"
                  value={formData.genderIdentity}
                  onChange={(e) => handleInputChange('genderIdentity', e.target.value)}
                  className={`bg-white border-gray-700 text-black ${fieldErrors.genderIdentity ? 'border-red-500 ring-2 ring-red-500/50' : ''}`}
                  placeholder="e.g. Woman, Man, Non-binary"
                  disabled={isSubmitting}
                />
                {fieldErrors.genderIdentity && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Required
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lookingFor" className="text-white text-sm">Looking for... *</Label>
                <Input
                  id="lookingFor"
                  value={formData.lookingFor}
                  onChange={(e) => handleInputChange('lookingFor', e.target.value)}
                  className={`bg-white border-gray-700 text-black ${fieldErrors.lookingFor ? 'border-red-500 ring-2 ring-red-500/50' : ''}`}
                  placeholder="e.g. Women, Men, Everyone"
                  disabled={isSubmitting}
                />
                {fieldErrors.lookingFor && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Required
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationshipGoal" className="text-white text-sm">What are you looking for? *</Label>
              <Select value={formData.relationshipGoal} onValueChange={(val) => handleInputChange('relationshipGoal', val)} disabled={isSubmitting}>
                <SelectTrigger className={`bg-white border-gray-700 text-black ${fieldErrors.relationshipGoal ? 'border-red-500 ring-2 ring-red-500/50' : ''}`}>
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
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Relationship goal is required
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whyMonark" className="text-white text-sm">Why do you want to join MonArk? *</Label>
              <Textarea
                id="whyMonark"
                value={formData.whyMonark}
                onChange={(e) => handleInputChange('whyMonark', e.target.value)}
                className={`bg-white border-gray-700 text-black min-h-[120px] ${fieldErrors.whyMonark ? 'border-red-500 ring-2 ring-red-500/50' : ''}`}
                placeholder="Tell us a bit about yourself and what you're hoping to find. What's not working with other dating apps? What excites you about MonArk's approach?"
                disabled={isSubmitting}
              />
              {fieldErrors.whyMonark ? (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Please write at least a sentence (20+ characters)
                </p>
              ) : (
                <p className="text-xs text-gray-400">This helps us understand if MonArk is a good fit for you</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="heardAboutUs" className="text-white text-sm">How did you hear about us?</Label>
              <Input
                id="heardAboutUs"
                value={formData.heardAboutUs}
                onChange={(e) => handleInputChange('heardAboutUs', e.target.value)}
                className="bg-white border-gray-700 text-black"
                placeholder="Social media, friend, article, etc."
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="willingToBeta"
                  checked={formData.willingToBeta}
                  onCheckedChange={(checked) => handleInputChange('willingToBeta', checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="willingToBeta" className="text-white text-sm font-normal cursor-pointer">
                  I'm interested in beta testing and giving feedback
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailOptIn"
                  checked={formData.emailOptIn}
                  onCheckedChange={(checked) => handleInputChange('emailOptIn', checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="emailOptIn" className="text-white text-sm font-normal cursor-pointer">
                  Send me updates about MonArk
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-charcoal-gray border-goldenrod/20 max-w-md">
          <div className="text-center py-8">
            <div className="bg-goldenrod/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-goldenrod" />
            </div>
            <h3 className="text-2xl font-light text-white mb-2">You're on the waitlist!</h3>
            <p className="text-gray-300 mb-4">
              Thanks for applying, {formData.firstName}! We're reviewing applications now and will let you know within 1-2 days.
            </p>
            <p className="text-sm text-gray-400">
              Check your email for a confirmation. We're launching with a small group in Chicago to make sure everyone gets great matches.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Contact Info';
      case 2: return 'About You';
      case 3: return 'Why MonArk?';
      default: return 'Join Waitlist';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-charcoal-gray border-goldenrod/20 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-white text-center">
            {getStepTitle()}
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-center">
            Step {currentStep} of {totalSteps}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {renderStepContent()}

          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                className="flex-1 text-white border-gray-700 hover:bg-gray-800"
                disabled={isSubmitting}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                variant="outline"
                className="flex-1 border-goldenrod/60 text-goldenrod hover:text-goldenrod/90 hover:border-goldenrod"
                disabled={isSubmitting}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="outline"
                className="flex-1 border-goldenrod/60 text-goldenrod hover:text-goldenrod/90 hover:border-goldenrod"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            )}
          </div>
        </form>

        <div className="text-center text-xs text-gray-500 mt-4">
          We review every application. No spam, ever.
        </div>
      </DialogContent>
    </Dialog>
  );
};

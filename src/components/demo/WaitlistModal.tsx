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
import { Mail, User, Loader2, MapPin, Heart, Wine, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Contact
    firstName: '',
    lastName: '',
    email: '',
    // Location
    city: '',
    stateRegion: '',
    country: '',
    zip: '',
    // Identity
    ageRange: '',
    genderIdentity: '',
    orientation: '',
    relationshipGoal: '',
    // Lifestyle
    drinking: '',
    smoking: '',
    accessibilityNeeds: '',
    // Behavioral
    weeklyEnergy: '',
    conversationStyle: '',
    crowdTolerance: '',
    budgetBand: '',
    timeWindow: '',
    // Discovery
    heardAboutUs: '',
    willingToBeta: false,
    emailOptIn: true,
    // DEI
    lgbtqPlus: false,
    raceEthnicity: [] as string[],
    otherNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const totalSteps = 4;

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRaceEthnicityToggle = (value: string) => {
    setFormData(prev => ({
      ...prev,
      raceEthnicity: prev.raceEthnicity.includes(value)
        ? prev.raceEthnicity.filter(item => item !== value)
        : [...prev.raceEthnicity, value]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.email.trim()) {
          toast({
            title: "Email Required",
            description: "Please enter your email address",
            variant: "destructive"
          });
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast({
            title: "Invalid Email",
            description: "Please enter a valid email address",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 2:
        if (!formData.ageRange || !formData.relationshipGoal) {
          toast({
            title: "Required Fields",
            description: "Please fill in age range and relationship goal",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 3:
        // All optional in this step
        return true;
      case 4:
        // All optional in this step
        return true;
      default:
        return true;
    }
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
      const { error } = await supabase
        .from('waitlist_submissions')
        .insert({
          first_name: formData.firstName.trim() || null,
          last_name: formData.lastName.trim() || null,
          email: formData.email.trim().toLowerCase(),
          city: formData.city.trim() || null,
          state_region: formData.stateRegion.trim() || null,
          country: formData.country.trim() || null,
          zip: formData.zip.trim() || null,
          age_range: formData.ageRange || null,
          gender_identity: formData.genderIdentity || null,
          orientation: formData.orientation || null,
          relationship_goal: formData.relationshipGoal || null,
          drinking: formData.drinking || null,
          smoking: formData.smoking || null,
          accessibility_needs: formData.accessibilityNeeds || null,
          weekly_energy: formData.weeklyEnergy || null,
          conversation_style: formData.conversationStyle || null,
          crowd_tolerance: formData.crowdTolerance || null,
          budget_band: formData.budgetBand || null,
          time_window: formData.timeWindow || null,
          heard_about_us: formData.heardAboutUs || null,
          willing_to_beta: formData.willingToBeta,
          email_opt_in: formData.emailOptIn,
          lgbtq_plus: formData.lgbtqPlus || null,
          race_ethnicity: formData.raceEthnicity.length > 0 ? formData.raceEthnicity : null,
          other_notes: formData.otherNotes || null,
          ip_address: null,
          user_agent: navigator.userAgent,
          source_page: 'demo-landing'
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

      setIsSubmitted(true);
      toast({
        title: "Welcome to the Waitlist!",
        description: "We'll notify you when MonArk launches. Thank you for your interest!",
      });

      setTimeout(() => {
        setFormData({
          firstName: '', lastName: '', email: '', city: '', stateRegion: '', country: '', zip: '',
          ageRange: '', genderIdentity: '', orientation: '', relationshipGoal: '',
          drinking: '', smoking: '', accessibilityNeeds: '',
          weeklyEnergy: '', conversationStyle: '', crowdTolerance: '', budgetBand: '', timeWindow: '',
          heardAboutUs: '', willingToBeta: false, emailOptIn: true,
          lgbtqPlus: false, raceEthnicity: [], otherNotes: ''
        });
        setIsSubmitted(false);
        setCurrentStep(1);
        onClose();
      }, 2000);

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
        firstName: '', lastName: '', email: '', city: '', stateRegion: '', country: '', zip: '',
        ageRange: '', genderIdentity: '', orientation: '', relationshipGoal: '',
        drinking: '', smoking: '', accessibilityNeeds: '',
        weeklyEnergy: '', conversationStyle: '', crowdTolerance: '', budgetBand: '', timeWindow: '',
        heardAboutUs: '', willingToBeta: false, emailOptIn: true,
        lgbtqPlus: false, raceEthnicity: [], otherNotes: ''
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
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-white border-gray-700 text-black pl-10"
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white text-sm">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="bg-white border-gray-700 text-black"
                  placeholder="First name"
                  disabled={isSubmitting}
                />
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ageRange" className="text-white text-sm">Age Range *</Label>
              <Select value={formData.ageRange} onValueChange={(val) => handleInputChange('ageRange', val)} disabled={isSubmitting}>
                <SelectTrigger className="bg-white border-gray-700 text-black">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genderIdentity" className="text-white text-sm">Gender Identity</Label>
                <Input
                  id="genderIdentity"
                  value={formData.genderIdentity}
                  onChange={(e) => handleInputChange('genderIdentity', e.target.value)}
                  className="bg-white border-gray-700 text-black"
                  placeholder="Your gender"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orientation" className="text-white text-sm">Orientation</Label>
                <Input
                  id="orientation"
                  value={formData.orientation}
                  onChange={(e) => handleInputChange('orientation', e.target.value)}
                  className="bg-white border-gray-700 text-black"
                  placeholder="Your orientation"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationshipGoal" className="text-white text-sm">Relationship Goal *</Label>
              <Select value={formData.relationshipGoal} onValueChange={(val) => handleInputChange('relationshipGoal', val)} disabled={isSubmitting}>
                <SelectTrigger className="bg-white border-gray-700 text-black">
                  <SelectValue placeholder="What are you looking for?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="dating">Dating</SelectItem>
                  <SelectItem value="long-term">Long-term</SelectItem>
                  <SelectItem value="not sure">Not Sure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-white text-sm">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="bg-white border-gray-700 text-black"
                  placeholder="Your city"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stateRegion" className="text-white text-sm">State/Region</Label>
                <Input
                  id="stateRegion"
                  value={formData.stateRegion}
                  onChange={(e) => handleInputChange('stateRegion', e.target.value)}
                  className="bg-white border-gray-700 text-black"
                  placeholder="State/region"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-white text-sm">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="bg-white border-gray-700 text-black"
                  placeholder="Your country"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip" className="text-white text-sm">ZIP Code</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => handleInputChange('zip', e.target.value)}
                  className="bg-white border-gray-700 text-black"
                  placeholder="ZIP code"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="drinking" className="text-white text-sm">Drinking</Label>
                <Select value={formData.drinking} onValueChange={(val) => handleInputChange('drinking', val)} disabled={isSubmitting}>
                  <SelectTrigger className="bg-white border-gray-700 text-black">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="smoking" className="text-white text-sm">Smoking</Label>
                <Select value={formData.smoking} onValueChange={(val) => handleInputChange('smoking', val)} disabled={isSubmitting}>
                  <SelectTrigger className="bg-white border-gray-700 text-black">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="occasionally">Occasionally</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weeklyEnergy" className="text-white text-sm">Weekly Energy</Label>
                <Select value={formData.weeklyEnergy} onValueChange={(val) => handleInputChange('weeklyEnergy', val)} disabled={isSubmitting}>
                  <SelectTrigger className="bg-white border-gray-700 text-black">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conversationStyle" className="text-white text-sm">Conversation Style</Label>
                <Select value={formData.conversationStyle} onValueChange={(val) => handleInputChange('conversationStyle', val)} disabled={isSubmitting}>
                  <SelectTrigger className="bg-white border-gray-700 text-black">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crowdTolerance" className="text-white text-sm">Crowd Tolerance</Label>
                <Select value={formData.crowdTolerance} onValueChange={(val) => handleInputChange('crowdTolerance', val)} disabled={isSubmitting}>
                  <SelectTrigger className="bg-white border-gray-700 text-black">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetBand" className="text-white text-sm">Budget Band</Label>
                <Select value={formData.budgetBand} onValueChange={(val) => handleInputChange('budgetBand', val)} disabled={isSubmitting}>
                  <SelectTrigger className="bg-white border-gray-700 text-black">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low ($)</SelectItem>
                    <SelectItem value="medium">Medium ($$)</SelectItem>
                    <SelectItem value="high">High ($$$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeWindow" className="text-white text-sm">Preferred Time</Label>
              <Select value={formData.timeWindow} onValueChange={(val) => handleInputChange('timeWindow', val)} disabled={isSubmitting}>
                <SelectTrigger className="bg-white border-gray-700 text-black">
                  <SelectValue placeholder="Select preferred time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="weekend">Weekend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessibilityNeeds" className="text-white text-sm">Accessibility Needs</Label>
              <Input
                id="accessibilityNeeds"
                value={formData.accessibilityNeeds}
                onChange={(e) => handleInputChange('accessibilityNeeds', e.target.value)}
                className="bg-white border-gray-700 text-black"
                placeholder="Any accessibility needs we should know about?"
                disabled={isSubmitting}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
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

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="willingToBeta"
                  checked={formData.willingToBeta}
                  onCheckedChange={(checked) => handleInputChange('willingToBeta', checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="willingToBeta" className="text-white text-sm font-normal cursor-pointer">
                  I'm interested in beta testing
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lgbtqPlus"
                  checked={formData.lgbtqPlus}
                  onCheckedChange={(checked) => handleInputChange('lgbtqPlus', checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="lgbtqPlus" className="text-white text-sm font-normal cursor-pointer">
                  I identify as LGBTQ+
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm">Race/Ethnicity (optional, select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Asian', 'Black/African', 'Hispanic/Latino', 'White/Caucasian', 'Middle Eastern', 'Pacific Islander', 'Native American', 'Other'].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`race-${option}`}
                      checked={formData.raceEthnicity.includes(option)}
                      onCheckedChange={() => handleRaceEthnicityToggle(option)}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor={`race-${option}`} className="text-white text-xs font-normal cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherNotes" className="text-white text-sm">Additional Notes</Label>
              <Textarea
                id="otherNotes"
                value={formData.otherNotes}
                onChange={(e) => handleInputChange('otherNotes', e.target.value)}
                className="bg-white border-gray-700 text-black min-h-[80px]"
                placeholder="Anything else you'd like us to know?"
                disabled={isSubmitting}
              />
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
              <Mail className="h-8 w-8 text-goldenrod" />
            </div>
            <h3 className="text-2xl font-light text-white mb-2">You're on the list!</h3>
            <p className="text-gray-300">
              We'll send you an email when MonArk is ready to transform your dating experience.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-charcoal-gray border-goldenrod/20 max-w-md">
          <div className="text-center py-8">
            <div className="bg-goldenrod/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-goldenrod" />
            </div>
            <h3 className="text-2xl font-light text-white mb-2">You're on the list!</h3>
            <p className="text-gray-300">
              We'll send you an email when MonArk is ready to transform your dating experience.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Contact Information';
      case 2: return 'About You';
      case 3: return 'Your Style';
      case 4: return 'Final Details';
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
                    Joining...
                  </>
                ) : (
                  'Join Waitlist'
                )}
              </Button>
            )}
          </div>
        </form>

        <div className="text-center text-xs text-gray-500 mt-4">
          We respect your privacy. No spam, just updates about MonArk.
        </div>
      </DialogContent>
    </Dialog>
  );
};
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, GraduationCap, Dumbbell, Cigarette, Wine, Ruler, Save } from 'lucide-react';
import { EditBackButton } from './EditBackButton';

interface LifestyleStepProps {
  data: {
    occupation: string;
    education_level: string;
    relationship_goals: string[];
    exercise_habits: string;
    smoking_status: string;
    drinking_status: string;
    height_cm: number | null;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
  stepRequirement: 'critical' | 'important' | 'optional';
  onSaveAndReturn?: () => void;
  onCancelEdit?: () => void;
}

export const LifestyleStep: React.FC<LifestyleStepProps> = ({
  data, onUpdate, onNext, onSkip, onBack, stepRequirement, onSaveAndReturn, onCancelEdit,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const educationOptions = [
    'High School', 'Some College', 'Bachelor\'s Degree', 'Master\'s Degree',
    'PhD/Doctorate', 'Trade School', 'Professional Certification', 'Prefer not to say'
  ];
  const exerciseOptions = [
    'Very active (5+ times/week)', 'Active (3-4 times/week)', 'Moderate (1-2 times/week)',
    'Light activity (occasionally)', 'Prefer indoor activities', 'Not currently active'
  ];
  const smokingOptions = ['Never', 'Socially', 'Occasionally', 'Regularly', 'Trying to quit', 'Prefer not to say'];
  const drinkingOptions = ['Never', 'Rarely', 'Socially', 'Occasionally', 'Regularly', 'Prefer not to say'];

  const handleHeightChange = (value: string) => {
    const height = value ? parseInt(value) : null;
    onUpdate({ height_cm: height });
  };

  const formatHeight = (cm: number | null) => {
    if (!cm) return '';
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm / 2.54) % 12);
    return `${feet}'${inches}" (${cm}cm)`;
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (!data.occupation?.trim()) newErrors.occupation = 'Please enter your occupation';
    if (!data.education_level) newErrors.education_level = 'Please select your education level';
    if (!data.exercise_habits) newErrors.exercise_habits = 'Please select your exercise habits';
    if (!data.smoking_status) newErrors.smoking_status = 'Please select your smoking status';
    if (!data.drinking_status) newErrors.drinking_status = 'Please select your drinking status';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) onNext();
  };

  return (
    <div className="bg-background p-6 pb-32">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2 pt-8">
          <h2 className="text-3xl font-light text-foreground">Lifestyle & Compatibility</h2>
          <p className="text-muted-foreground">Help us find your perfect match</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <Label className="text-foreground font-medium">Occupation</Label>
            </div>
            <Input placeholder="e.g., Software Engineer, Teacher, Artist" value={data.occupation || ''} onChange={(e) => onUpdate({ occupation: e.target.value })} />
            {errors.occupation && <p className="text-destructive text-sm">{errors.occupation}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <Label className="text-foreground font-medium">Education Level</Label>
            </div>
            <Select value={data.education_level || ''} onValueChange={(value) => onUpdate({ education_level: value })}>
              <SelectTrigger><SelectValue placeholder="Select your education level" /></SelectTrigger>
              <SelectContent>{educationOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            {errors.education_level && <p className="text-destructive text-sm">{errors.education_level}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Ruler className="h-5 w-5 text-primary" />
              <Label className="text-foreground font-medium">Height (optional)</Label>
            </div>
            <div className="flex space-x-2">
              <Input type="number" placeholder="Height in cm (e.g., 175)" value={data.height_cm || ''} onChange={(e) => handleHeightChange(e.target.value)} />
              {data.height_cm && (
                <div className="flex items-center px-3 py-2 bg-secondary rounded-lg">
                  <span className="text-secondary-foreground text-sm">{formatHeight(data.height_cm)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <Label className="text-foreground font-medium">Exercise Habits</Label>
            </div>
            <Select value={data.exercise_habits || ''} onValueChange={(value) => onUpdate({ exercise_habits: value })}>
              <SelectTrigger><SelectValue placeholder="How often do you exercise?" /></SelectTrigger>
              <SelectContent>{exerciseOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            {errors.exercise_habits && <p className="text-destructive text-sm">{errors.exercise_habits}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Cigarette className="h-5 w-5 text-primary" />
              <Label className="text-foreground font-medium">Smoking</Label>
            </div>
            <Select value={data.smoking_status || ''} onValueChange={(value) => onUpdate({ smoking_status: value })}>
              <SelectTrigger><SelectValue placeholder="Select your smoking status" /></SelectTrigger>
              <SelectContent>{smokingOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            {errors.smoking_status && <p className="text-destructive text-sm">{errors.smoking_status}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Wine className="h-5 w-5 text-primary" />
              <Label className="text-foreground font-medium">Drinking</Label>
            </div>
            <Select value={data.drinking_status || ''} onValueChange={(value) => onUpdate({ drinking_status: value })}>
              <SelectTrigger><SelectValue placeholder="Select your drinking status" /></SelectTrigger>
              <SelectContent>{drinkingOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            {errors.drinking_status && <p className="text-destructive text-sm">{errors.drinking_status}</p>}
          </div>
        </div>
      </div>

      <div className="pt-6 max-w-2xl mx-auto w-full space-y-3">
        {onSaveAndReturn && (
          <button
            onClick={onSaveAndReturn}
            className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Save & Return to Profile
          </button>
        )}

        {!onSaveAndReturn && (
          <>
            <div className="flex space-x-4">
              <Button onClick={onBack} variant="outline" className="flex-1">Back</Button>
              <Button onClick={handleNext} className="flex-1">Continue</Button>
            </div>
            {stepRequirement !== 'critical' && (
              <Button onClick={onSkip} variant="outline" className="w-full">Skip for now</Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

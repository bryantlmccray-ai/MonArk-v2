import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, GraduationCap, Heart, Dumbbell, Cigarette, Wine, Ruler } from 'lucide-react';

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
}

export const LifestyleStep: React.FC<LifestyleStepProps> = ({
  data,
  onUpdate,
  onNext,
  onSkip,
  onBack,
  stepRequirement,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const educationOptions = [
    'High School',
    'Some College',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD/Doctorate',
    'Trade School',
    'Professional Certification',
    'Prefer not to say'
  ];

  const relationshipGoalOptions = [
    'Serious relationship',
    'Casual dating',
    'Marriage',
    'Life partner',
    'Fun and companionship',
    'New friends',
    'Not sure yet',
    'Open to anything'
  ];

  const exerciseOptions = [
    'Very active (5+ times/week)',
    'Active (3-4 times/week)',
    'Moderate (1-2 times/week)',
    'Light activity (occasionally)',
    'Prefer indoor activities',
    'Not currently active'
  ];

  const smokingOptions = [
    'Never',
    'Socially',
    'Occasionally',
    'Regularly',
    'Trying to quit',
    'Prefer not to say'
  ];

  const drinkingOptions = [
    'Never',
    'Rarely',
    'Socially',
    'Occasionally',
    'Regularly',
    'Prefer not to say'
  ];

  const handleRelationshipGoalToggle = (goal: string) => {
    const currentGoals = data.relationship_goals || [];
    const updatedGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    
    onUpdate({ relationship_goals: updatedGoals });
  };

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

    if (!data.occupation?.trim()) {
      newErrors.occupation = 'Please enter your occupation';
    }
    if (!data.education_level) {
      newErrors.education_level = 'Please select your education level';
    }
    if (!data.relationship_goals || data.relationship_goals.length === 0) {
      newErrors.relationship_goals = 'Please select at least one relationship goal';
    }
    if (!data.exercise_habits) {
      newErrors.exercise_habits = 'Please select your exercise habits';
    }
    if (!data.smoking_status) {
      newErrors.smoking_status = 'Please select your smoking status';
    }
    if (!data.drinking_status) {
      newErrors.drinking_status = 'Please select your drinking status';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-light text-white">Lifestyle & Compatibility</h2>
        <p className="text-gray-400">Help us find your perfect match</p>
      </div>

      <div className="space-y-6">
        {/* Occupation */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-goldenrod" />
            <Label className="text-white font-medium">Occupation</Label>
          </div>
          <Input
            placeholder="e.g., Software Engineer, Teacher, Artist"
            value={data.occupation || ''}
            onChange={(e) => onUpdate({ occupation: e.target.value })}
            className="bg-charcoal-gray border-gray-700 text-white placeholder-gray-500"
          />
          {errors.occupation && (
            <p className="text-red-400 text-sm">{errors.occupation}</p>
          )}
        </div>

        {/* Education Level */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-goldenrod" />
            <Label className="text-white font-medium">Education Level</Label>
          </div>
          <Select
            value={data.education_level || ''}
            onValueChange={(value) => onUpdate({ education_level: value })}
          >
            <SelectTrigger className="bg-charcoal-gray border-gray-700 text-white">
              <SelectValue placeholder="Select your education level" />
            </SelectTrigger>
            <SelectContent className="bg-charcoal-gray border-gray-700">
              {educationOptions.map((option) => (
                <SelectItem key={option} value={option} className="text-white">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.education_level && (
            <p className="text-red-400 text-sm">{errors.education_level}</p>
          )}
        </div>

        {/* Height */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Ruler className="h-5 w-5 text-goldenrod" />
            <Label className="text-white font-medium">Height (optional)</Label>
          </div>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Height in cm (e.g., 175)"
              value={data.height_cm || ''}
              onChange={(e) => handleHeightChange(e.target.value)}
              className="bg-charcoal-gray border-gray-700 text-white placeholder-gray-500"
            />
            {data.height_cm && (
              <div className="flex items-center px-3 py-2 bg-gray-800 rounded-lg">
                <span className="text-gray-300 text-sm">{formatHeight(data.height_cm)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Relationship Goals */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-goldenrod" />
            <Label className="text-white font-medium">Relationship Goals</Label>
          </div>
          <p className="text-gray-400 text-sm">Select all that apply</p>
          <div className="flex flex-wrap gap-2">
            {relationshipGoalOptions.map((goal) => (
              <Badge
                key={goal}
                variant={(data.relationship_goals || []).includes(goal) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  (data.relationship_goals || []).includes(goal)
                    ? 'bg-goldenrod text-jet-black hover:bg-goldenrod/90'
                    : 'border-gray-600 text-gray-300 hover:border-goldenrod hover:text-goldenrod'
                }`}
                onClick={() => handleRelationshipGoalToggle(goal)}
              >
                {goal}
              </Badge>
            ))}
          </div>
          {errors.relationship_goals && (
            <p className="text-red-400 text-sm">{errors.relationship_goals}</p>
          )}
        </div>

        {/* Exercise Habits */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-5 w-5 text-goldenrod" />
            <Label className="text-white font-medium">Exercise Habits</Label>
          </div>
          <Select
            value={data.exercise_habits || ''}
            onValueChange={(value) => onUpdate({ exercise_habits: value })}
          >
            <SelectTrigger className="bg-charcoal-gray border-gray-700 text-white">
              <SelectValue placeholder="How often do you exercise?" />
            </SelectTrigger>
            <SelectContent className="bg-charcoal-gray border-gray-700">
              {exerciseOptions.map((option) => (
                <SelectItem key={option} value={option} className="text-white">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.exercise_habits && (
            <p className="text-red-400 text-sm">{errors.exercise_habits}</p>
          )}
        </div>

        {/* Smoking Status */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Cigarette className="h-5 w-5 text-goldenrod" />
            <Label className="text-white font-medium">Smoking</Label>
          </div>
          <Select
            value={data.smoking_status || ''}
            onValueChange={(value) => onUpdate({ smoking_status: value })}
          >
            <SelectTrigger className="bg-charcoal-gray border-gray-700 text-white">
              <SelectValue placeholder="Select your smoking status" />
            </SelectTrigger>
            <SelectContent className="bg-charcoal-gray border-gray-700">
              {smokingOptions.map((option) => (
                <SelectItem key={option} value={option} className="text-white">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.smoking_status && (
            <p className="text-red-400 text-sm">{errors.smoking_status}</p>
          )}
        </div>

        {/* Drinking Status */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Wine className="h-5 w-5 text-goldenrod" />
            <Label className="text-white font-medium">Drinking</Label>
          </div>
          <Select
            value={data.drinking_status || ''}
            onValueChange={(value) => onUpdate({ drinking_status: value })}
          >
            <SelectTrigger className="bg-charcoal-gray border-gray-700 text-white">
              <SelectValue placeholder="Select your drinking status" />
            </SelectTrigger>
            <SelectContent className="bg-charcoal-gray border-gray-700">
              {drinkingOptions.map((option) => (
                <SelectItem key={option} value={option} className="text-white">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.drinking_status && (
            <p className="text-red-400 text-sm">{errors.drinking_status}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex space-x-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-goldenrod-gradient text-jet-black font-semibold hover:shadow-golden-glow"
          >
            Continue
          </Button>
        </div>
        
        {stepRequirement !== 'critical' && (
          <Button
            onClick={onSkip}
            variant="outline"
            className="w-full border-gray-600 text-gray-400 hover:text-white hover:border-gray-500"
          >
            Skip for now
          </Button>
        )}
      </div>
    </div>
  );
};
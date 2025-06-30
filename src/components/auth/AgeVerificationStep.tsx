
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

interface AgeVerificationStepProps {
  onNext: (data: { dateOfBirth: Date; ageConfirmed: boolean }) => void;
}

export const AgeVerificationStep: React.FC<AgeVerificationStepProps> = ({ onNext }) => {
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState('');

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = () => {
    setError('');

    if (!dateOfBirth) {
      setError('Please select your date of birth');
      return;
    }

    if (!ageConfirmed) {
      setError('Please confirm that you are 18 years of age or older');
      return;
    }

    const age = calculateAge(dateOfBirth);

    if (age < 18) {
      setError('Sorry, MonArk is only available to users 18 years or older. Please check back when you\'re of age.');
      return;
    }

    onNext({ dateOfBirth, ageConfirmed });
  };

  return (
    <div className="min-h-screen bg-jet-black p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-light text-white">Age Verification</h1>
          <p className="text-gray-400">
            To ensure a safe community, we need to verify you're 18 or older
          </p>
        </div>

        {/* Date Selection */}
        <Card className="bg-charcoal-gray border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Select Your Date of Birth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={dateOfBirth}
                onSelect={setDateOfBirth}
                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                initialFocus
                className="bg-jet-black text-white"
              />
            </div>

            {dateOfBirth && (
              <div className="text-center text-white">
                <p className="text-sm text-gray-400">Selected date:</p>
                <p className="text-lg font-medium">
                  {format(dateOfBirth, 'MMMM dd, yyyy')}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Age: {calculateAge(dateOfBirth)} years
                </p>
              </div>
            )}

            {/* Age Confirmation Checkbox */}
            <div className="flex items-start space-x-3 p-4 bg-jet-black rounded-lg">
              <Checkbox
                id="age-confirm"
                checked={ageConfirmed}
                onCheckedChange={(checked) => setAgeConfirmed(checked as boolean)}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="age-confirm"
                  className="text-white text-sm font-medium leading-relaxed cursor-pointer"
                >
                  I confirm that I am 18 years of age or older and agree to MonArk's Terms of Service
                </Label>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Continue Button */}
        <Button
          onClick={handleSubmit}
          disabled={!dateOfBirth || !ageConfirmed}
          className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow disabled:opacity-50"
        >
          Continue
        </Button>

        {/* Privacy Note */}
        <div className="text-center text-xs text-gray-500">
          <p>Your date of birth is kept private and secure.</p>
          <p>We only use it for age verification purposes.</p>
        </div>
      </div>
    </div>
  );
};

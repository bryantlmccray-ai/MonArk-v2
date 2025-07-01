
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface AgeVerificationStepProps {
  onNext: (data: { dateOfBirth: Date; ageConfirmed: boolean }) => void;
}

export const AgeVerificationStep: React.FC<AgeVerificationStepProps> = ({ onNext }) => {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
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

  const validateDate = (month: string, day: string, year: string): { isValid: boolean; date?: Date; error?: string } => {
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const yearNum = parseInt(year);

    // Basic validation
    if (!month || !day || !year) {
      return { isValid: false, error: 'All fields are required' };
    }

    if (monthNum < 1 || monthNum > 12) {
      return { isValid: false, error: 'Month must be between 1 and 12' };
    }

    if (dayNum < 1 || dayNum > 31) {
      return { isValid: false, error: 'Day must be between 1 and 31' };
    }

    if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
      return { isValid: false, error: 'Please enter a valid year' };
    }

    if (year.length !== 4) {
      return { isValid: false, error: 'Year must be 4 digits (YYYY)' };
    }

    // Create date and validate it's a real date
    const date = new Date(yearNum, monthNum - 1, dayNum);
    
    if (date.getFullYear() !== yearNum || 
        date.getMonth() !== monthNum - 1 || 
        date.getDate() !== dayNum) {
      return { isValid: false, error: 'Please enter a valid date' };
    }

    if (date > new Date()) {
      return { isValid: false, error: 'Date of birth cannot be in the future' };
    }

    return { isValid: true, date };
  };

  const handleSubmit = () => {
    setError('');

    const validation = validateDate(month, day, year);
    
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid date');
      return;
    }

    if (!ageConfirmed) {
      setError('Please confirm that you are 18 years of age or older');
      return;
    }

    const age = calculateAge(validation.date!);

    if (age < 18) {
      setError('Sorry, MonArk is only available to users 18 years or older. Please check back when you\'re of age.');
      return;
    }

    onNext({ dateOfBirth: validation.date!, ageConfirmed });
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setMonth(value);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setDay(value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setYear(value);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-light text-gray-100">Age Verification</h1>
          <p className="text-gray-400">
            To ensure a safe community, we need to verify you're 18 or older
          </p>
        </div>

        {/* Date Input */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100 text-lg">Enter Your Date of Birth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month" className="text-gray-100 text-sm">
                  Month (MM)
                </Label>
                <Input
                  id="month"
                  type="text"
                  value={month}
                  onChange={handleMonthChange}
                  placeholder="MM"
                  className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-400 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-center"
                  maxLength={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="day" className="text-gray-100 text-sm">
                  Day (DD)
                </Label>
                <Input
                  id="day"
                  type="text"
                  value={day}
                  onChange={handleDayChange}
                  placeholder="DD"
                  className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-400 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-center"
                  maxLength={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year" className="text-gray-100 text-sm">
                  Year (YYYY)
                </Label>
                <Input
                  id="year"
                  type="text"
                  value={year}
                  onChange={handleYearChange}
                  placeholder="YYYY"
                  className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-400 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-center"
                  maxLength={4}
                />
              </div>
            </div>

            {/* Date Preview */}
            {month && day && year && validateDate(month, day, year).isValid && (
              <div className="text-center text-gray-100 p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400">Selected date:</p>
                <p className="text-lg font-medium">
                  {month.padStart(2, '0')}/{day.padStart(2, '0')}/{year}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Age: {calculateAge(validateDate(month, day, year).date!)} years
                </p>
              </div>
            )}

            {/* Age Confirmation Checkbox */}
            <div className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg">
              <Checkbox
                id="age-confirm"
                checked={ageConfirmed}
                onCheckedChange={(checked) => setAgeConfirmed(checked as boolean)}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="age-confirm"
                  className="text-gray-100 text-sm font-medium leading-relaxed cursor-pointer"
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
          disabled={!month || !day || !year || !ageConfirmed}
          className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-semibold rounded-xl transition-all duration-300 hover:from-yellow-300 hover:to-amber-400 disabled:opacity-50"
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

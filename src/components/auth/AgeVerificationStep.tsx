
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { MonArkLogo } from '@/components/MonArkLogo';
import { motion } from 'framer-motion';

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

  const isFormValid = month && day && year && ageConfirmed;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-background">
      {/* Subtle warm radial glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)" }}
      />

      <motion.div
        className="w-full max-w-sm space-y-6 relative z-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="text-center">
          <MonArkLogo size="xl" rotateOnLoad={true} className="mb-8" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Age Verification
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            To ensure a safe community, we need to verify you're 18 or older
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-5 shadow-[var(--shadow-elevated)]">
          <p className="text-sm font-medium text-foreground">Enter Your Date of Birth</p>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="month" className="text-xs font-medium text-muted-foreground">
                Month
              </Label>
              <Input
                id="month"
                type="text"
                value={month}
                onChange={handleMonthChange}
                placeholder="MM"
                className="rounded-xl h-11 text-center"
                maxLength={2}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="day" className="text-xs font-medium text-muted-foreground">
                Day
              </Label>
              <Input
                id="day"
                type="text"
                value={day}
                onChange={handleDayChange}
                placeholder="DD"
                className="rounded-xl h-11 text-center"
                maxLength={2}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="year" className="text-xs font-medium text-muted-foreground">
                Year
              </Label>
              <Input
                id="year"
                type="text"
                value={year}
                onChange={handleYearChange}
                placeholder="YYYY"
                className="rounded-xl h-11 text-center"
                maxLength={4}
              />
            </div>
          </div>

          {/* Date Preview */}
          {month && day && year && validateDate(month, day, year).isValid && (
            <div className="text-center p-3 bg-secondary/60 rounded-xl">
              <p className="text-xs text-muted-foreground">Selected date</p>
              <p className="text-base font-medium text-foreground">
                {month.padStart(2, '0')}/{day.padStart(2, '0')}/{year}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Age: {calculateAge(validateDate(month, day, year).date!)} years
              </p>
            </div>
          )}

          {/* Age Confirmation Checkbox */}
          <div className="flex items-start space-x-3 p-3 bg-secondary/40 rounded-xl">
            <Checkbox
              id="age-confirm"
              checked={ageConfirmed}
              onCheckedChange={(checked) => setAgeConfirmed(checked as boolean)}
              className="mt-0.5"
            />
            <Label
              htmlFor="age-confirm"
              className="text-sm text-foreground leading-relaxed cursor-pointer"
            >
              I confirm that I am 18 years of age or older and agree to MonArk's Terms of Service
            </Label>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="w-full rounded-xl h-11"
          >
            Continue
          </Button>
        </div>

        {/* Privacy Note */}
        <p className="text-center text-[11px] uppercase tracking-[0.15em] text-muted-foreground/60">
          Your date of birth is kept private and secure
        </p>
      </motion.div>
    </div>
  );
};

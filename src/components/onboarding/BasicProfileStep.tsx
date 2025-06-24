
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BasicProfileStepProps {
  onNext: (data: { email: string; name: string }) => void;
}

export const BasicProfileStep: React.FC<BasicProfileStepProps> = ({ onNext }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setNameError('');
    
    // Validate name
    if (!name.trim()) {
      setNameError('Please enter your name');
      isValid = false;
    }
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Please enter your email');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    if (isValid) {
      onNext({ email, name });
    }
  };

  return (
    <div className="min-h-screen bg-jet-black p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-light text-white">Welcome to MonArk</h1>
          <p className="text-gray-400">Let's start with the basics to create your profile</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white text-sm font-medium">
              Your Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your first name"
              className="bg-charcoal-gray border-gray-700 text-white placeholder:text-gray-500 focus:border-goldenrod"
            />
            {nameError && (
              <p className="text-red-400 text-sm">{nameError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-charcoal-gray border-gray-700 text-white placeholder:text-gray-500 focus:border-goldenrod"
            />
            {emailError && (
              <p className="text-red-400 text-sm">{emailError}</p>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

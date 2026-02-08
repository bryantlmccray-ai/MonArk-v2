
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { basicProfileSchema, getFieldErrors } from '@/lib/validation';

interface BasicProfileStepProps {
  onNext: (data: { email: string; name: string }) => void;
}

export const BasicProfileStep: React.FC<BasicProfileStepProps> = ({ onNext }) => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      const userName = user.user_metadata?.name || user.user_metadata?.full_name || '';
      setName(userName);
    }
  }, [user]);

  const handleSubmit = () => {
    const result = basicProfileSchema.safeParse({ name: name.trim(), email: email.trim() });
    
    if (!result.success) {
      setFieldErrors(getFieldErrors(result));
      return;
    }

    setFieldErrors({});
    onNext({ email: result.data.email, name: result.data.name });
  };

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-jet-black p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-light text-white">Complete Your Profile</h1>
          <p className="text-gray-400">Let's finalize your basic information</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white text-sm font-medium">
              Your Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
              placeholder="Enter your first name"
              className="bg-charcoal-gray border-gray-700 text-white placeholder:text-gray-500 focus:border-goldenrod"
              maxLength={100}
            />
            {fieldErrors.name && (
              <p className="text-red-400 text-sm">{fieldErrors.name}</p>
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
              onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
              placeholder="Enter your email"
              className="bg-charcoal-gray border-gray-700 text-white placeholder:text-gray-500 focus:border-goldenrod"
              disabled={!!user?.email}
              maxLength={255}
            />
            {fieldErrors.email && (
              <p className="text-red-400 text-sm">{fieldErrors.email}</p>
            )}
          </div>
        </div>

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


import React, { useState } from 'react';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';
import { MainApp } from '../components/main/MainApp';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <OnboardingFlow onComplete={() => setIsAuthenticated(true)} />;
  }

  return <MainApp />;
};

export default Index;

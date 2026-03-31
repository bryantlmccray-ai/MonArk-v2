import React from 'react';
import { AuthGuard } from '@/components/common/AuthGuard';
import { MainApp } from '@/components/main/MainApp';

const Dashboard: React.FC = () => (
  <AuthGuard fallbackPath="/">
    <MainApp initialTab="weekly" />
  </AuthGuard>
);

export default Dashboard;

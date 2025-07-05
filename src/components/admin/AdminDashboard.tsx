import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SafetyAnalytics } from './SafetyAnalytics';
import { ReportsManagement } from './ReportsManagement';
import { UserActionsManagement } from './UserActionsManagement';
import { BarChart3, Shield, Users, AlertTriangle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card">
          <TabsTrigger 
            value="analytics" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <AlertTriangle className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger 
            value="actions" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Users className="h-4 w-4" />
            User Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <SafetyAnalytics />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportsManagement />
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <UserActionsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
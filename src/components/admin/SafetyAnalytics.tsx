import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin } from '@/hooks/useAdmin';
import { 
  AlertTriangle, 
  Shield, 
  UserX, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Users,
  Ban
} from 'lucide-react';

export const SafetyAnalytics: React.FC = () => {
  const { safetyMetrics, loading } = useAdmin();

  if (loading || !safetyMetrics) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Reports',
      value: safetyMetrics.totalReports,
      description: 'All time reports',
      icon: AlertTriangle,
      color: 'text-orange-500'
    },
    {
      title: 'Pending Reports',
      value: safetyMetrics.pendingReports,
      description: 'Awaiting review',
      icon: Clock,
      color: 'text-yellow-500'
    },
    {
      title: 'Resolved Reports',
      value: safetyMetrics.resolvedReports,
      description: 'Completed reviews',
      icon: Shield,
      color: 'text-green-500'
    },
    {
      title: 'Active Warnings',
      value: safetyMetrics.activeWarnings,
      description: 'Current warnings',
      icon: AlertTriangle,
      color: 'text-orange-400'
    },
    {
      title: 'Active Suspensions',
      value: safetyMetrics.activeSuspensions,
      description: 'Temporary bans',
      icon: UserX,
      color: 'text-red-400'
    },
    {
      title: 'Active Bans',
      value: safetyMetrics.activeBans,
      description: 'Permanent bans',
      icon: Ban,
      color: 'text-red-600'
    },
    {
      title: 'Reports This Week',
      value: safetyMetrics.reportsThisWeek,
      description: 'Last 7 days',
      icon: TrendingUp,
      color: 'text-blue-500'
    },
    {
      title: 'Reports This Month',
      value: safetyMetrics.reportsThisMonth,
      description: 'Last 30 days',
      icon: TrendingDown,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Safety Analytics</h2>
        <p className="text-muted-foreground">
          Overview of community safety metrics and trends
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {metric.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Safety Trends Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Safety Trends
          </CardTitle>
          <CardDescription>
            Recent activity patterns and safety indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {safetyMetrics.pendingReports > 0 
                  ? `${Math.round((safetyMetrics.pendingReports / safetyMetrics.totalReports) * 100)}%`
                  : '0%'
                }
              </div>
              <div className="text-sm text-muted-foreground">Pending Rate</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {safetyMetrics.reportsThisWeek > safetyMetrics.reportsThisMonth / 4 
                  ? '↗️' 
                  : '↘️'
                }
              </div>
              <div className="text-sm text-muted-foreground">Weekly Trend</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {safetyMetrics.activeWarnings + safetyMetrics.activeSuspensions + safetyMetrics.activeBans}
              </div>
              <div className="text-sm text-muted-foreground">Active Actions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
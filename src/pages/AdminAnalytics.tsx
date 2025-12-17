import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, ArrowLeft, Users, TrendingUp, Calendar, 
  Target, Activity, Heart, Loader2, RefreshCw 
} from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { useAnalytics, AnalyticsSummary } from '@/hooks/useAnalytics';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const TARGET_METRICS = {
  activeUsers: 200,
  weeklyOptionsViewRate: 70,
  matchToDateRate: 60,
  retentionWeek2: 60,
  retentionWeek4: 40,
  retentionWeek8: 30,
};

interface MetricCardProps {
  title: string;
  value: number;
  target: number;
  suffix?: string;
  icon: React.ReactNode;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, value, target, suffix = '', icon, description 
}) => {
  const progress = Math.min((value / target) * 100, 100);
  const isOnTarget = value >= target;
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          <span className="flex items-center gap-2">
            {icon}
            {title}
          </span>
          {isOnTarget && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              On Target
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-card-foreground">
              {value.toFixed(1)}{suffix}
            </span>
            <span className="text-sm text-muted-foreground">
              / {target}{suffix} target
            </span>
          </div>
          <Progress 
            value={progress} 
            className={cn(
              "h-2",
              isOnTarget ? "[&>div]:bg-green-500" : "[&>div]:bg-goldenrod"
            )}
          />
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const RetentionChart: React.FC<{ summary: AnalyticsSummary | null }> = ({ summary }) => {
  if (!summary) return null;
  
  const retentionData = [
    { week: 'Week 2', value: summary.retentionWeek2, target: TARGET_METRICS.retentionWeek2 },
    { week: 'Week 4', value: summary.retentionWeek4, target: TARGET_METRICS.retentionWeek4 },
    { week: 'Week 8', value: summary.retentionWeek8, target: TARGET_METRICS.retentionWeek8 },
  ];
  
  return (
    <Card className="bg-card border-border col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Calendar className="h-5 w-5 text-goldenrod" />
          Retention Cohorts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {retentionData.map((item) => (
            <div key={item.week} className="text-center">
              <div className="text-sm text-muted-foreground mb-2">{item.week}</div>
              <div className={cn(
                "text-2xl font-semibold mb-1",
                item.value >= item.target ? "text-green-400" : "text-card-foreground"
              )}>
                {item.value.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Target: {item.target}%+
              </div>
              <Progress 
                value={Math.min((item.value / item.target) * 100, 100)} 
                className={cn(
                  "h-1 mt-2",
                  item.value >= item.target ? "[&>div]:bg-green-500" : "[&>div]:bg-goldenrod"
                )}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const PMFScorecard: React.FC<{ summary: AnalyticsSummary | null }> = ({ summary }) => {
  if (!summary) return null;
  
  const checks = [
    { 
      label: '200+ active users', 
      met: summary.totalUsers >= TARGET_METRICS.activeUsers,
      current: summary.totalUsers 
    },
    { 
      label: '70%+ view their 3 weekly', 
      met: summary.weeklyOptionsViewRate >= TARGET_METRICS.weeklyOptionsViewRate,
      current: summary.weeklyOptionsViewRate 
    },
    { 
      label: '60%+ matches lead to IRL dates', 
      met: summary.matchToDateRate >= TARGET_METRICS.matchToDateRate,
      current: summary.matchToDateRate 
    },
    { 
      label: '50%+ retention after 4 weeks', 
      met: summary.retentionWeek4 >= 50,
      current: summary.retentionWeek4 
    },
  ];
  
  const metCount = checks.filter(c => c.met).length;
  const hasPMF = metCount === checks.length;
  
  return (
    <Card className={cn(
      "border-2 col-span-full",
      hasPMF ? "bg-green-500/10 border-green-500/50" : "bg-card border-border"
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Target className="h-5 w-5 text-goldenrod" />
          PMF Scorecard
          {hasPMF && (
            <span className="ml-auto text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
              ✓ Product-Market Fit Achieved
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {checks.map((check, index) => (
            <div 
              key={index}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                check.met 
                  ? "bg-green-500/10 border-green-500/30" 
                  : "bg-muted/30 border-border"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                check.met ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
              )}>
                {check.met ? '✓' : '○'}
              </div>
              <div className="flex-1">
                <div className={cn(
                  "text-sm font-medium",
                  check.met ? "text-green-400" : "text-card-foreground"
                )}>
                  {check.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  Current: {check.current.toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-4xl font-bold text-goldenrod mb-1">
              {metCount}/4
            </div>
            <div className="text-sm text-muted-foreground">
              Success Criteria Met
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AdminAnalytics: React.FC = () => {
  const { isModerator, loading: adminLoading } = useAdmin();
  const { summary, loading: analyticsLoading, calculateLiveMetrics, fetchKPISnapshots } = useAnalytics();
  const [liveMetrics, setLiveMetrics] = useState<Partial<AnalyticsSummary> | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadLiveMetrics = async () => {
      const metrics = await calculateLiveMetrics();
      if (metrics) {
        setLiveMetrics(metrics);
      }
    };
    loadLiveMetrics();
  }, [calculateLiveMetrics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchKPISnapshots();
    const metrics = await calculateLiveMetrics();
    if (metrics) {
      setLiveMetrics(metrics);
    }
    setRefreshing(false);
  };

  if (adminLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-goldenrod" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!isModerator) {
    return <Navigate to="/" replace />;
  }

  // Use live metrics if available, otherwise fall back to snapshot summary
  const displaySummary: AnalyticsSummary = {
    totalUsers: liveMetrics?.totalUsers ?? summary?.totalUsers ?? 0,
    activeUsersDaily: liveMetrics?.activeUsersDaily ?? summary?.activeUsersDaily ?? 0,
    activeUsersWeekly: summary?.activeUsersWeekly ?? 0,
    activeUsersMonthly: summary?.activeUsersMonthly ?? 0,
    weeklyOptionsViewRate: liveMetrics?.weeklyOptionsViewRate ?? summary?.weeklyOptionsViewRate ?? 0,
    matchToDateRate: liveMetrics?.matchToDateRate ?? summary?.matchToDateRate ?? 0,
    retentionWeek2: summary?.retentionWeek2 ?? 0,
    retentionWeek4: summary?.retentionWeek4 ?? 0,
    retentionWeek8: summary?.retentionWeek8 ?? 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin">
            <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-goldenrod" />
                <h1 className="text-3xl font-light text-foreground">MVP Analytics</h1>
              </div>
              <p className="text-muted-foreground">
                Track your key performance indicators and PMF progress
              </p>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* PMF Scorecard */}
        <div className="mb-8">
          <PMFScorecard summary={displaySummary} />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={displaySummary.totalUsers}
            target={TARGET_METRICS.activeUsers}
            icon={<Users className="h-4 w-4 text-goldenrod" />}
            description="Registered user profiles"
          />
          
          <MetricCard
            title="Weekly Options View Rate"
            value={displaySummary.weeklyOptionsViewRate}
            target={TARGET_METRICS.weeklyOptionsViewRate}
            suffix="%"
            icon={<Activity className="h-4 w-4 text-goldenrod" />}
            description="Users who view their 3 weekly options"
          />
          
          <MetricCard
            title="Match → Date Rate"
            value={displaySummary.matchToDateRate}
            target={TARGET_METRICS.matchToDateRate}
            suffix="%"
            icon={<Heart className="h-4 w-4 text-goldenrod" />}
            description="Matches that lead to IRL dates"
          />
          
          <MetricCard
            title="Daily Active Users"
            value={displaySummary.activeUsersDaily}
            target={50}
            icon={<TrendingUp className="h-4 w-4 text-goldenrod" />}
            description="Users active in last 24h"
          />
        </div>

        {/* Retention Chart */}
        <RetentionChart summary={displaySummary} />

        {/* Success Definition */}
        <Card className="mt-8 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Success Definition</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>If after 3 months (12 weeks) you have:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>✅ 200+ active users</li>
              <li>✅ 70%+ view their 3 weekly</li>
              <li>✅ 60%+ matches lead to IRL dates</li>
              <li>✅ 50%+ retention after 4 weeks</li>
            </ul>
            <p className="pt-2 font-medium text-foreground">Then you have PMF without RIF.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;

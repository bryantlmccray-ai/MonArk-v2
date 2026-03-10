import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, ArrowRight, BarChart3 } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';

export const Admin: React.FC = () => {

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-goldenrod" />
            <h1 className="text-3xl font-light text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your MonArk community
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Waitlist Management */}
          <Card className="bg-card border-border hover:border-goldenrod/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Users className="h-5 w-5 text-goldenrod" />
                Waitlist Applications
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Review and approve waitlist signups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Manually review applications, approve users, and send invite emails.
              </p>
              <Link to="/admin/waitlist">
                <Button className="w-full bg-goldenrod text-foreground hover:bg-goldenrod/90">
                  Manage Waitlist
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* MVP Analytics */}
          <Card className="bg-card border-border hover:border-goldenrod/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <BarChart3 className="h-5 w-5 text-goldenrod" />
                MVP Analytics
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Track KPIs and PMF progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Monitor retention rates, engagement, and match-to-date conversions.
              </p>
              <Link to="/admin/analytics">
                <Button className="w-full bg-goldenrod text-foreground hover:bg-goldenrod/90">
                  View Analytics
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

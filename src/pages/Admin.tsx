import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, ArrowRight } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';

export const Admin: React.FC = () => {
  const { isModerator, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-jet-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-4 text-goldenrod" />
          <p className="text-gray-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isModerator) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-jet-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-goldenrod" />
            <h1 className="text-3xl font-light text-white">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400">
            Manage your MonArk community
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Waitlist Management */}
          <Card className="bg-charcoal-gray border-gray-800 hover:border-goldenrod/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-goldenrod" />
                Waitlist Applications
              </CardTitle>
              <CardDescription className="text-gray-400">
                Review and approve waitlist signups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Manually review applications, approve users, and send invite emails.
              </p>
              <Link to="/admin/waitlist">
                <Button className="w-full bg-goldenrod text-jet-black hover:bg-goldenrod/90">
                  Manage Waitlist
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

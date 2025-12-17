import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Check, X, Clock, ArrowLeft, Mail, MapPin, User, Calendar, 
  MessageSquare, Loader2, RefreshCw, ChevronDown, ChevronUp 
} from 'lucide-react';

interface WaitlistSubmission {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  city: string | null;
  age_range: string | null;
  gender_identity: string | null;
  looking_for: string | null;
  relationship_goal: string | null;
  why_monark: string | null;
  heard_about_us: string | null;
  willing_to_beta: boolean | null;
  approval_status: string;
  approval_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

const AdminWaitlist: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<WaitlistSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchSubmissions();
    }
  }, [isAdmin, filter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('waitlist_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('approval_status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load waitlist submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: string, status: 'approved' | 'rejected', sendRejectionEmail: boolean = false) => {
    setProcessingId(id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('waitlist_submissions')
        .update({
          approval_status: status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          approval_notes: notes[id] || null
        })
        .eq('id', id);

      if (error) throw error;

      const submission = submissions.find(s => s.id === id);
      
      // If approved, send approval email
      if (status === 'approved' && submission) {
        await supabase.functions.invoke('waitlist-approval-email', {
          body: {
            email: submission.email,
            firstName: submission.first_name
          }
        });
      }
      
      // If rejected and sendRejectionEmail is true, send rejection email
      if (status === 'rejected' && sendRejectionEmail && submission) {
        await supabase.functions.invoke('waitlist-rejection-email', {
          body: {
            email: submission.email,
            firstName: submission.first_name,
            city: submission.city
          }
        });
      }

      toast({
        title: status === 'approved' ? "Approved!" : "Rejected",
        description: status === 'approved' 
          ? "Approval email sent to applicant" 
          : sendRejectionEmail 
            ? "Rejection email sent to applicant"
            : "Application has been rejected (no email sent)"
      });

      fetchSubmissions();
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
    }
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.approval_status === 'pending').length,
    approved: submissions.filter(s => s.approval_status === 'approved').length,
    rejected: submissions.filter(s => s.approval_status === 'rejected').length,
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-jet-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-goldenrod" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-jet-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-light text-white">Waitlist Applications</h1>
              <p className="text-gray-400 text-sm">Review and approve waitlist signups</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={fetchSubmissions}
            className="border-gray-700 text-gray-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
            { label: 'Approved', value: stats.approved, color: 'text-green-400' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
          ].map(stat => (
            <Card key={stat.label} className="bg-charcoal-gray border-gray-800">
              <CardContent className="p-4 text-center">
                <p className={`text-3xl font-light ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f 
                ? 'bg-goldenrod text-jet-black hover:bg-goldenrod/90' 
                : 'border-gray-700 text-gray-300'}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-goldenrod" />
          </div>
        ) : submissions.length === 0 ? (
          <Card className="bg-charcoal-gray border-gray-800">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400">No {filter === 'all' ? '' : filter} applications found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map(submission => (
              <Card key={submission.id} className="bg-charcoal-gray border-gray-800">
                <CardContent className="p-4">
                  {/* Summary Row */}
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-goldenrod/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-goldenrod" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {submission.first_name} {submission.last_name || ''}
                        </p>
                        <p className="text-gray-400 text-sm">{submission.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">{submission.city || 'No city'}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(submission.approval_status)}
                      {submission.willing_to_beta && (
                        <Badge variant="outline" className="border-goldenrod/50 text-goldenrod text-xs">
                          Beta Tester
                        </Badge>
                      )}
                      {expandedId === submission.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === submission.id && (
                    <div className="mt-6 pt-4 border-t border-gray-700">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Age: {submission.age_range || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Identity: {submission.gender_identity || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Looking for: {submission.looking_for || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Goal: {submission.relationship_goal || 'Not specified'}</span>
                          </div>
                          {submission.heard_about_us && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">Heard from: {submission.heard_about_us}</span>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Why they want to join:</p>
                          <div className="bg-jet-black rounded-lg p-3 text-sm text-gray-300">
                            {submission.why_monark || 'No response provided'}
                          </div>
                        </div>
                      </div>

                      {/* Admin Notes & Actions */}
                      {submission.approval_status === 'pending' && (
                        <div className="mt-6 pt-4 border-t border-gray-700">
                          <Textarea
                            placeholder="Add notes (optional)..."
                            value={notes[submission.id] || ''}
                            onChange={(e) => setNotes(prev => ({ ...prev, [submission.id]: e.target.value }))}
                            className="bg-jet-black border-gray-700 text-white mb-4"
                          />
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleApproval(submission.id, 'approved')}
                              disabled={processingId === submission.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {processingId === submission.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              Approve & Send Invite
                            </Button>
                            <Button
                              onClick={() => handleApproval(submission.id, 'rejected', true)}
                              disabled={processingId === submission.id}
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject & Notify
                            </Button>
                            <Button
                              onClick={() => handleApproval(submission.id, 'rejected', false)}
                              disabled={processingId === submission.id}
                              variant="ghost"
                              className="text-gray-400 hover:text-gray-300"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject (Silent)
                            </Button>
                          </div>
                        </div>
                      )}

                      {submission.approval_notes && (
                        <div className="mt-4 p-3 bg-jet-black rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Admin Notes:</p>
                          <p className="text-sm text-gray-300">{submission.approval_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWaitlist;

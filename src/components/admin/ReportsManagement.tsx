import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/hooks/useAdmin';
import { UserReport } from '@/hooks/useUserSafety';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Calendar,
  User
} from 'lucide-react';
import { format } from 'date-fns';

export const ReportsManagement: React.FC = () => {
  const { fetchAllReports, updateReportStatus, takeUserAction, loading } = useAdmin();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);

  const loadReports = async () => {
    const data = await fetchAllReports();
    if (data) {
      setReports(data);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleStatusUpdate = async (reportId: string, status: string) => {
    const success = await updateReportStatus(reportId, status);
    if (success) {
      await loadReports();
    }
  };

  const handleTakeAction = async (
    targetUserId: string, 
    actionType: 'warning' | 'suspension' | 'ban',
    reason: string,
    durationHours?: number
  ) => {
    const success = await takeUserAction(targetUserId, actionType, reason, durationHours);
    if (success) {
      await loadReports();
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'dismissed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'resolved':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'dismissed':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      default:
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Reports Management</h2>
          <p className="text-muted-foreground">
            Review and manage user reports
          </p>
        </div>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter reports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Reports Found</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' ? 'No reports have been submitted yet.' : `No ${filter} reports found.`}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{report.report_type.replace('_', ' ').toUpperCase()}</CardTitle>
                      <Badge className={getStatusColor(report.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(report.status)}
                          {report.status}
                        </div>
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(report.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Reporter: {report.reporter_user_id.slice(0, 8)}...
                      </span>
                    </CardDescription>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {selectedReport?.id === report.id ? 'Hide' : 'View'}
                  </Button>
                </div>
              </CardHeader>

              {selectedReport?.id === report.id && (
                <CardContent className="border-t pt-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Report Details</h4>
                      <div className="grid gap-2 text-sm">
                        <div><strong>Reported User:</strong> {report.reported_user_id.slice(0, 8)}...</div>
                        <div><strong>Reason:</strong> {report.reason}</div>
                        {report.description && (
                          <div><strong>Description:</strong> {report.description}</div>
                        )}
                        {report.conversation_id && (
                          <div><strong>Conversation ID:</strong> {report.conversation_id}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {report.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(report.id, 'resolved')}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Resolved
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(report.id, 'dismissed')}
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Dismiss
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleTakeAction(
                              report.reported_user_id, 
                              'warning', 
                              `Warning for: ${report.reason}`
                            )}
                            disabled={loading}
                          >
                            Issue Warning
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleTakeAction(
                              report.reported_user_id, 
                              'suspension', 
                              `Suspended for: ${report.reason}`,
                              24
                            )}
                            disabled={loading}
                          >
                            24h Suspension
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleTakeAction(
                              report.reported_user_id, 
                              'ban', 
                              `Banned for: ${report.reason}`
                            )}
                            disabled={loading}
                          >
                            Permanent Ban
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
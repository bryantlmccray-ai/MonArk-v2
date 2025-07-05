import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAdmin, UserAction } from '@/hooks/useAdmin';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertTriangle, 
  UserX, 
  Ban,
  Search,
  Calendar,
  User,
  Clock,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

export const UserActionsManagement: React.FC = () => {
  const { fetchUserActions, removeUserAction, loading } = useAdmin();
  const [actions, setActions] = useState<UserAction[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchUserId, setSearchUserId] = useState('');

  const loadActions = async () => {
    const data = await fetchUserActions();
    if (data) {
      setActions(data as UserAction[]);
    }
  };

  useEffect(() => {
    loadActions();
  }, []);

  const handleRemoveAction = async (actionId: string) => {
    const success = await removeUserAction(actionId);
    if (success) {
      await loadActions();
    }
  };

  const handleSearchUser = async () => {
    if (searchUserId.trim()) {
      const data = await fetchUserActions(searchUserId.trim());
      if (data) {
        setActions(data as UserAction[]);
      }
    } else {
      await loadActions();
    }
  };

  const filteredActions = actions.filter(action => {
    if (filter === 'all') return true;
    if (filter === 'active') return action.is_active;
    if (filter === 'expired') return !action.is_active;
    return action.action_type === filter;
  });

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'suspension':
        return <UserX className="h-4 w-4 text-orange-500" />;
      case 'ban':
        return <Ban className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActionColor = (actionType: string, isActive: boolean) => {
    if (!isActive) return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    
    switch (actionType) {
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'suspension':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
      case 'ban':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    }
  };

  const isActionExpired = (action: UserAction) => {
    if (!action.expires_at) return false;
    return new Date(action.expires_at) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">User Actions Management</h2>
          <p className="text-muted-foreground">
            Manage warnings, suspensions, and bans
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex gap-2">
            <Input
              placeholder="Search by user ID..."
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              className="w-48"
            />
            <Button variant="outline" onClick={handleSearchUser}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="warning">Warnings</SelectItem>
              <SelectItem value="suspension">Suspensions</SelectItem>
              <SelectItem value="ban">Bans</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredActions.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Actions Found</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' ? 'No user actions have been taken yet.' : `No ${filter} actions found.`}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredActions.map((action) => {
            const isExpired = isActionExpired(action);
            const isCurrentlyActive = action.is_active && !isExpired;
            
            return (
              <Card key={action.id} className={`hover:shadow-lg transition-shadow ${
                !isCurrentlyActive ? 'opacity-75' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getActionIcon(action.action_type)}
                          {action.action_type.toUpperCase()}
                        </CardTitle>
                        <Badge className={getActionColor(action.action_type, isCurrentlyActive)}>
                          {isCurrentlyActive ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(action.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Target: {action.target_user_id.slice(0, 8)}...
                        </span>
                        {action.expires_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expires: {format(new Date(action.expires_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    
                    {isCurrentlyActive && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveAction(action.id)}
                        disabled={loading}
                      >
                        Remove Action
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="grid gap-2 text-sm">
                      <div><strong>Reason:</strong> {action.reason}</div>
                      <div><strong>Applied by Admin:</strong> {action.admin_user_id.slice(0, 8)}...</div>
                      {action.duration_hours && (
                        <div><strong>Duration:</strong> {action.duration_hours} hours</div>
                      )}
                      {action.expires_at && (
                        <div className={`flex items-center gap-2 ${
                          isExpired ? 'text-red-500' : 'text-orange-500'
                        }`}>
                          <Clock className="h-3 w-3" />
                          <strong>
                            {isExpired ? 'Expired on:' : 'Expires on:'} 
                          </strong>
                          {format(new Date(action.expires_at), 'PPpp')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  Calendar, 
  Shield, 
  Settings,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { format } from 'date-fns';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'match':
        return <Heart className="h-4 w-4 text-pink-400" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-400" />;
      case 'date_proposal':
        return <Calendar className="h-4 w-4 text-goldenrod" />;
      case 'safety':
        return <Shield className="h-4 w-4 text-red-400" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-400" />;
      default:
        return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'match':
        return 'border-pink-500/30 bg-pink-500/5';
      case 'message':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'date_proposal':
        return 'border-goldenrod/30 bg-goldenrod/5';
      case 'safety':
        return 'border-red-500/30 bg-red-500/5';
      case 'system':
        return 'border-gray-500/30 bg-gray-500/5';
      default:
        return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      // Navigate to the action URL
      window.location.href = notification.action_url;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-goldenrod" />
              <DialogTitle className="text-white">Notifications</DialogTitle>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-goldenrod text-jet-black">
                  {unreadCount}
                </Badge>
              )}
            </div>
            
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="ghost"
                size="sm"
                className="text-goldenrod hover:bg-goldenrod/10"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          <DialogDescription className="text-gray-400">
            Stay updated with your latest activity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No notifications yet</p>
              <p className="text-sm text-gray-500">
                You'll see updates about matches, messages, and more here
              </p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    relative p-4 rounded-lg border cursor-pointer transition-all hover:bg-gray-800/30
                    ${getNotificationColor(notification.type)}
                    ${!notification.read_at ? 'ring-1 ring-goldenrod/30' : ''}
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-white font-medium text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-gray-300 text-sm mt-1">
                            {notification.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {!notification.read_at && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-goldenrod hover:bg-goldenrod/10 p-1"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 p-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">
                          {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                        </span>
                        
                        {notification.action_url && (
                          <div className="flex items-center text-xs text-goldenrod">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </div>
                        )}
                      </div>
                    </div>

                    {!notification.read_at && (
                      <div className="absolute top-3 right-3 w-2 h-2 bg-goldenrod rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-700">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
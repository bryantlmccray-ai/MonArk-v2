import React, { useState } from 'react';
import { Bell, X, MessageCircle, Heart, Calendar, Shield, Settings, Trash2, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import { format } from 'date-fns';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'match':
      return <Heart className="h-4 w-4 text-red-500" />;
    case 'message':
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case 'date_proposal':
      return <Calendar className="h-4 w-4 text-green-500" />;
    case 'safety':
      return <Shield className="h-4 w-4 text-orange-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationBg = (type: string, isRead: boolean) => {
  const opacity = isRead ? '20' : '40';
  switch (type) {
    case 'match':
      return `bg-red-500/${opacity}`;
    case 'message':
      return `bg-blue-500/${opacity}`;
    case 'date_proposal':
      return `bg-green-500/${opacity}`;
    case 'safety':
      return `bg-orange-500/${opacity}`;
    default:
      return `bg-gray-500/${opacity}`;
  }
};

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    loading
  } = useNotifications();

  const handleNotificationClick = async (notificationId: string, actionUrl?: string | null) => {
    await markAsRead(notificationId);
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  // Test function to create a sample notification
  const createTestNotification = async () => {
    await createNotification(
      'system',
      'Test Notification',
      'This is a test notification to verify the system is working.',
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-white hover:bg-white/10"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 bg-charcoal-gray border-goldenrod/20" align="end">
        <Card className="bg-transparent border-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-goldenrod" />
                Notifications
              </CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllRead}
                    className="text-xs text-goldenrod hover:bg-goldenrod/10"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-goldenrod hover:bg-goldenrod/10"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={createTestNotification}
                    className="text-xs text-goldenrod hover:bg-goldenrod/10"
                  >
                    Test
                  </Button>
              </div>
            </div>
          </CardHeader>
          
          <Separator className="bg-gray-600" />
          
          <CardContent className="p-0 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No notifications yet
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 cursor-pointer hover:bg-white/5 transition-colors ${
                      getNotificationBg(notification.type, !!notification.read_at)
                    } ${!notification.read_at ? 'border-l-2 border-goldenrod' : ''}`}
                    onClick={() => handleNotificationClick(notification.id, notification.action_url)}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-medium ${
                            notification.read_at ? 'text-gray-300' : 'text-white'
                          }`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-1">
                            {!notification.read_at && (
                              <div className="w-2 h-2 bg-goldenrod rounded-full"></div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDeleteNotification(notification.id, e)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className={`text-xs mt-1 ${
                          notification.read_at ? 'text-gray-400' : 'text-gray-200'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
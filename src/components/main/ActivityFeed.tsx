import React from 'react';
import { Bell, MapPin, Clock, Users, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActivityItem } from '@/hooks/useActivityFeed';

interface ActivityFeedProps {
  activities: ActivityItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  isOpen,
  onClose
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_profile':
        return <Users className="h-4 w-4 text-blue-400" />;
      case 'user_online':
        return <Clock className="h-4 w-4 text-green-400" />;
      case 'proximity_alert':
        return <MapPin className="h-4 w-4 text-goldenrod" />;
      default:
        return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-20 right-6 w-80 z-30">
      <Card className="bg-charcoal-gray/95 backdrop-blur-xl border-goldenrod/30 shadow-2xl">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-goldenrod" />
              <h3 className="text-white font-medium">Activity Feed</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                No recent activity
              </p>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    {activity.user_image ? (
                      <img
                        src={activity.user_image}
                        alt={activity.user_name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm leading-relaxed">
                      {activity.message}
                    </p>

                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-gray-400 text-xs">
                        {getTimeAgo(activity.timestamp)}
                      </span>

                      {activity.distance && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-gray-700 text-gray-300"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          {activity.distance.toFixed(1)}mi
                        </Badge>
                      )}

                      {activity.compatibility_score && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-goldenrod/20 text-goldenrod border-goldenrod/30"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          {activity.compatibility_score}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
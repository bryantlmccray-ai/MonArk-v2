
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Clock, Sparkles, Check, X, Edit, EyeOff } from 'lucide-react';
import { DateProposal, useDateConcierge } from '@/hooks/useDateConcierge';
import { useAuth } from '@/hooks/useAuth';

interface DateProposalCardProps {
  proposal: DateProposal;
  onEdit?: () => void;
  onDismiss?: (proposalId: string) => void;
}

export const DateProposalCard: React.FC<DateProposalCardProps> = ({ 
  proposal, 
  onEdit,
  onDismiss 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateProposalStatus } = useDateConcierge();
  const { user } = useAuth();

  const isCreator = user?.id === proposal.creator_user_id;
  const isRecipient = user?.id === proposal.recipient_user_id;

  const handleStatusUpdate = async (status: string) => {
    setIsUpdating(true);
    await updateProposalStatus(proposal.id, status);
    setIsUpdating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'declined':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-goldenrod/20 text-goldenrod border-goldenrod/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted ✓';
      case 'declined':
        return 'Declined';
      case 'completed':
        return 'Completed';
      default:
        return 'Proposed';
    }
  };

  return (
    <Card className="bg-charcoal-gray border-gray-800 hover:border-goldenrod/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg mb-2">
              {proposal.title}
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              {proposal.ai_generated && (
                <div className="flex items-center space-x-1">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Generated</span>
                </div>
              )}
              <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${getStatusColor(proposal.status)} border`}>
              {getStatusText(proposal.status)}
            </Badge>
            {onDismiss && (
              <Button
                onClick={() => onDismiss(proposal.id)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
                title="Dismiss proposal"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-sm">
            <Heart className="h-4 w-4 text-goldenrod" />
            <span className="text-gray-300">
              Vibe: <span className="text-white">{proposal.vibe}</span>
            </span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <MapPin className="h-4 w-4 text-goldenrod" />
            <span className="text-gray-300">
              Setting: <span className="text-white">{proposal.location_type}</span>
            </span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Clock className="h-4 w-4 text-goldenrod" />
            <span className="text-gray-300">
              When: <span className="text-white">{proposal.time_suggestion}</span>
            </span>
          </div>
        </div>

        <div className="bg-jet-black/50 rounded-lg p-3">
          <p className="text-white text-sm font-medium mb-2">Activity:</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            {proposal.activity}
          </p>
        </div>

        {proposal.rationale && (
          <div className="bg-goldenrod/10 rounded-lg p-3 border border-goldenrod/20">
            <p className="text-white text-sm font-medium mb-1">Why this works:</p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {proposal.rationale}
            </p>
          </div>
        )}

        {/* Action buttons based on user role and status */}
        {proposal.status === 'proposed' && (
          <div className="flex space-x-2 pt-2">
            {isRecipient && (
              <>
                <Button
                  onClick={() => handleStatusUpdate('accepted')}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button
                  onClick={() => handleStatusUpdate('declined')}
                  disabled={isUpdating}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-400 hover:bg-red-600/10"
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </>
            )}
            
            {isCreator && onEdit && (
              <Button
                onClick={onEdit}
                disabled={isUpdating}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Proposal
              </Button>
            )}
          </div>
        )}

        {proposal.status === 'accepted' && (
          <div className="pt-2">
            <Button
              onClick={() => handleStatusUpdate('completed')}
              disabled={isUpdating}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Mark as Completed 🎉
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

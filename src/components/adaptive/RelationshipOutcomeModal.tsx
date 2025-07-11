import React, { useState } from 'react';
import { Heart, AlertTriangle, Calendar, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useAdaptiveDiscovery, RelationshipOutcome } from '@/hooks/useAdaptiveDiscovery';
import { toast } from '@/hooks/use-toast';

interface RelationshipOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchName?: string;
  matchUserId?: string;
}

export const RelationshipOutcomeModal: React.FC<RelationshipOutcomeModalProps> = ({
  isOpen,
  onClose,
  matchName,
  matchUserId
}) => {
  const { recordRelationshipOutcome, processingUpdate } = useAdaptiveDiscovery();
  
  const [formData, setFormData] = useState<Partial<RelationshipOutcome>>({
    relationship_type: 'casual',
    outcome: 'ended_mutual',
    satisfaction_rating: 5,
    what_worked: [],
    what_didnt_work: [],
    would_date_similar: undefined
  });
  
  const [customWorked, setCustomWorked] = useState('');
  const [customDidntWork, setCustomDidntWork] = useState('');

  const relationshipTypes = [
    { value: 'casual', label: 'Casual Dating', icon: Heart },
    { value: 'serious', label: 'Serious Relationship', icon: Heart },
    { value: 'hookup', label: 'Hookup', icon: Heart },
    { value: 'friendship', label: 'Friendship', icon: Heart }
  ];

  const outcomeOptions = [
    { value: 'ongoing', label: 'Still Ongoing', color: 'text-green-600' },
    { value: 'ended_mutual', label: 'Ended Mutually', color: 'text-blue-600' },
    { value: 'ended_user', label: 'I Ended It', color: 'text-yellow-600' },
    { value: 'ended_partner', label: 'They Ended It', color: 'text-orange-600' },
    { value: 'ghosted', label: 'Ghosted', color: 'text-red-600' }
  ];

  const commonWorked = [
    'Great communication', 'Shared interests', 'Physical chemistry', 'Emotional connection',
    'Similar goals', 'Good humor', 'Respectful boundaries', 'Fun activities together'
  ];

  const commonDidntWork = [
    'Poor communication', 'Different goals', 'No chemistry', 'Timing issues',
    'Distance', 'Different values', 'Lack of effort', 'Incompatible lifestyles'
  ];

  const handleSubmit = async () => {
    try {
      if (!formData.relationship_type || !formData.outcome) {
        toast({
          title: "Missing Information",
          description: "Please fill in the relationship type and outcome.",
          variant: "destructive"
        });
        return;
      }

      const outcomeData: Omit<RelationshipOutcome, 'user_id'> = {
        match_user_id: matchUserId,
        relationship_type: formData.relationship_type,
        outcome: formData.outcome,
        satisfaction_rating: formData.satisfaction_rating,
        what_worked: formData.what_worked,
        what_didnt_work: formData.what_didnt_work,
        lessons_learned: formData.lessons_learned,
        would_date_similar: formData.would_date_similar
      };

      // Calculate duration if provided
      if (formData.duration_days) {
        outcomeData.duration_days = formData.duration_days;
      }

      await recordRelationshipOutcome(outcomeData);
      
      toast({
        title: "Thank you for sharing!",
        description: "Your feedback helps MonArk learn and improve your matches.",
      });
      
      onClose();
      
      // Reset form
      setFormData({
        relationship_type: 'casual',
        outcome: 'ended_mutual',
        satisfaction_rating: 5,
        what_worked: [],
        what_didnt_work: [],
        would_date_similar: undefined
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record relationship outcome. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addWorkedItem = (item: string) => {
    if (item && !formData.what_worked?.includes(item)) {
      setFormData(prev => ({
        ...prev,
        what_worked: [...(prev.what_worked || []), item]
      }));
    }
  };

  const addDidntWorkItem = (item: string) => {
    if (item && !formData.what_didnt_work?.includes(item)) {
      setFormData(prev => ({
        ...prev,
        what_didnt_work: [...(prev.what_didnt_work || []), item]
      }));
    }
  };

  const removeWorkedItem = (item: string) => {
    setFormData(prev => ({
      ...prev,
      what_worked: prev.what_worked?.filter(i => i !== item) || []
    }));
  };

  const removeDidntWorkItem = (item: string) => {
    setFormData(prev => ({
      ...prev,
      what_didnt_work: prev.what_didnt_work?.filter(i => i !== item) || []
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-primary" />
            <span>Relationship Reflection</span>
          </DialogTitle>
          {matchName && (
            <p className="text-sm text-muted-foreground">
              Tell us about your experience with {matchName}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Relationship Type */}
          <div>
            <Label htmlFor="relationship-type">What type of connection was this?</Label>
            <Select
              value={formData.relationship_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, relationship_type: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {relationshipTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Outcome */}
          <div>
            <Label htmlFor="outcome">How did things end up?</Label>
            <Select
              value={formData.outcome}
              onValueChange={(value) => setFormData(prev => ({ ...prev, outcome: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {outcomeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={option.color}>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="duration">How long did this last? (days)</Label>
            <Input
              type="number"
              value={formData.duration_days || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                duration_days: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              placeholder="e.g., 30"
            />
          </div>

          {/* Satisfaction Rating */}
          <div>
            <Label>Overall satisfaction (1-10)</Label>
            <div className="mt-2">
              <Slider
                value={[formData.satisfaction_rating || 5]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, satisfaction_rating: value }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Not satisfied</span>
                <span className="font-medium">{formData.satisfaction_rating}/10</span>
                <span>Very satisfied</span>
              </div>
            </div>
          </div>

          {/* What Worked */}
          <div>
            <Label>What worked well?</Label>
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-2">
                {commonWorked.map(item => (
                  <Badge
                    key={item}
                    variant={formData.what_worked?.includes(item) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => 
                      formData.what_worked?.includes(item) 
                        ? removeWorkedItem(item) 
                        : addWorkedItem(item)
                    }
                  >
                    {item}
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add custom item..."
                  value={customWorked}
                  onChange={(e) => setCustomWorked(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addWorkedItem(customWorked);
                      setCustomWorked('');
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addWorkedItem(customWorked);
                    setCustomWorked('');
                  }}
                  disabled={!customWorked}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* What Didn't Work */}
          <div>
            <Label>What didn&apos;t work?</Label>
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-2">
                {commonDidntWork.map(item => (
                  <Badge
                    key={item}
                    variant={formData.what_didnt_work?.includes(item) ? "destructive" : "outline"}
                    className="cursor-pointer"
                    onClick={() => 
                      formData.what_didnt_work?.includes(item) 
                        ? removeDidntWorkItem(item) 
                        : addDidntWorkItem(item)
                    }
                  >
                    {item}
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add custom item..."
                  value={customDidntWork}
                  onChange={(e) => setCustomDidntWork(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addDidntWorkItem(customDidntWork);
                      setCustomDidntWork('');
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addDidntWorkItem(customDidntWork);
                    setCustomDidntWork('');
                  }}
                  disabled={!customDidntWork}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Lessons Learned */}
          <div>
            <Label htmlFor="lessons">What did you learn about yourself?</Label>
            <Textarea
              value={formData.lessons_learned || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, lessons_learned: e.target.value }))}
              placeholder="Reflect on what this experience taught you..."
              rows={3}
            />
          </div>

          {/* Would Date Similar */}
          <div>
            <Label>Would you be open to dating someone similar in the future?</Label>
            <div className="flex space-x-4 mt-2">
              <Button
                type="button"
                variant={formData.would_date_similar === true ? "default" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, would_date_similar: true }))}
                className="flex items-center space-x-2"
              >
                <ThumbsUp className="h-4 w-4" />
                <span>Yes</span>
              </Button>
              <Button
                type="button"
                variant={formData.would_date_similar === false ? "destructive" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, would_date_similar: false }))}
                className="flex items-center space-x-2"
              >
                <ThumbsDown className="h-4 w-4" />
                <span>No</span>
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={processingUpdate}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={processingUpdate}>
              {processingUpdate ? 'Saving...' : 'Share Reflection'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
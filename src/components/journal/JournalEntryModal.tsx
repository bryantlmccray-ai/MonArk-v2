import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Star, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface JournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const JournalEntryModal: React.FC<JournalEntryModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    date_title: '',
    partner_name: '',
    date_activity: '',
    rating: 0,
    would_repeat: false,
    reflection_notes: '',
    learned_insights: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!formData.date_title.trim() || !formData.partner_name.trim() || !formData.date_activity.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in the date title, partner name, and activity.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.from('date_journal').insert({
        user_id: user.id,
        date_title: formData.date_title,
        partner_name: formData.partner_name,
        date_activity: formData.date_activity,
        rating: formData.rating > 0 ? formData.rating : null,
        would_repeat: formData.would_repeat,
        reflection_notes: formData.reflection_notes || null,
        learned_insights: formData.learned_insights || null,
        tags: tags.length > 0 ? tags : null,
        date_completed: date?.toISOString() || new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Journal Entry Saved",
        description: "Your date reflection has been saved successfully!"
      });

      // Reset form
      setFormData({
        date_title: '',
        partner_name: '',
        date_activity: '',
        rating: 0,
        would_repeat: false,
        reflection_notes: '',
        learned_insights: '',
      });
      setTags([]);
      setDate(new Date());
      
      onSaved();
      onClose();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-charcoal-gray border border-goldenrod/30 shadow-glow max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">New Journal Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label className="text-white">Date of Experience</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start bg-jet-black border-gray-700 text-white">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-charcoal-gray border-gray-700">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Date Title *</Label>
              <Input
                value={formData.date_title}
                onChange={(e) => handleInputChange('date_title', e.target.value)}
                placeholder="e.g., Coffee Date at Central Park"
                className="bg-white border-gray-700 text-black"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Partner Name *</Label>
              <Input
                value={formData.partner_name}
                onChange={(e) => handleInputChange('partner_name', e.target.value)}
                placeholder="First name or nickname"
                className="bg-white border-gray-700 text-black"
              />
            </div>
          </div>

          {/* Activity */}
          <div className="space-y-2">
            <Label className="text-white">Activity *</Label>
            <Input
              value={formData.date_activity}
              onChange={(e) => handleInputChange('date_activity', e.target.value)}
              placeholder="What did you do together?"
              className="bg-white border-gray-700 text-black"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-white">How would you rate this experience?</Label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleInputChange('rating', star)}
                  className={`h-8 w-8 transition-colors ${
                    star <= formData.rating 
                      ? 'text-goldenrod hover:text-goldenrod/80' 
                      : 'text-gray-600 hover:text-gray-500'
                  }`}
                >
                  <Star className="h-full w-full" fill={star <= formData.rating ? 'currentColor' : 'none'} />
                </button>
              ))}
              {formData.rating > 0 && (
                <span className="text-gray-400 text-sm ml-2">({formData.rating}/5)</span>
              )}
            </div>
          </div>

          {/* Would Repeat */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Would you go on another date?</Label>
              <p className="text-gray-400 text-sm">Would you be interested in seeing them again?</p>
            </div>
            <Switch
              checked={formData.would_repeat}
              onCheckedChange={(checked) => handleInputChange('would_repeat', checked)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-white">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} className="bg-goldenrod/20 text-goldenrod border-goldenrod/30">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-goldenrod/70 hover:text-goldenrod"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag (e.g., romantic, fun, outdoors)"
                className="bg-white border-gray-700 text-black"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button
                onClick={handleAddTag}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Reflection Notes */}
          <div className="space-y-2">
            <Label className="text-white">Reflection Notes</Label>
            <Textarea
              value={formData.reflection_notes}
              onChange={(e) => handleInputChange('reflection_notes', e.target.value)}
              placeholder="How did the date go? What was the conversation like?"
              className="bg-white border-gray-700 text-black min-h-20"
            />
          </div>

          {/* Learned Insights */}
          <div className="space-y-2">
            <Label className="text-white">What did you learn?</Label>
            <Textarea
              value={formData.learned_insights}
              onChange={(e) => handleInputChange('learned_insights', e.target.value)}
              placeholder="What did you discover about yourself, dating, or what you're looking for?"
              className="bg-white border-gray-700 text-black min-h-20"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              variant="outline"
              className="flex-1 border-goldenrod/60 text-goldenrod hover:text-goldenrod/90 hover:border-goldenrod"
            >
              {loading ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
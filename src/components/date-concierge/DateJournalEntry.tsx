
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, Calendar, Tag, X } from 'lucide-react';
import { useDateConcierge, DateJournalEntry } from '@/hooks/useDateConcierge';

interface DateJournalEntryProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId?: string;
  partnerName?: string;
  existingEntry?: DateJournalEntry;
}

export const DateJournalEntryComponent: React.FC<DateJournalEntryProps> = ({
  isOpen,
  onClose,
  proposalId,
  partnerName: initialPartnerName,
  existingEntry
}) => {
  const [formData, setFormData] = useState({
    partner_name: existingEntry?.partner_name || initialPartnerName || '',
    date_title: existingEntry?.date_title || '',
    date_activity: existingEntry?.date_activity || '',
    date_completed: existingEntry?.date_completed?.split('T')[0] || new Date().toISOString().split('T')[0],
    rating: existingEntry?.rating || null as number | null,
    reflection_notes: existingEntry?.reflection_notes || '',
    learned_insights: existingEntry?.learned_insights || '',
    would_repeat: existingEntry?.would_repeat || null as boolean | null,
    tags: existingEntry?.tags || [] as string[]
  });

  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const { createJournalEntry } = useDateConcierge();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.partner_name || !formData.date_title || !formData.date_activity) {
      return;
    }

    setIsSaving(true);
    
    const entryData = {
      ...formData,
      date_proposal_id: proposalId,
      date_completed: formData.date_completed ? new Date(formData.date_completed).toISOString() : null
    };

    await createJournalEntry(entryData);
    setIsSaving(false);
    onClose();
  };

  const renderStarRating = () => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleInputChange('rating', star)}
          className={`p-1 transition-colors ${
            formData.rating && star <= formData.rating
              ? 'text-goldenrod'
              : 'text-gray-600 hover:text-goldenrod/60'
          }`}
        >
          <Star className="h-5 w-5 fill-current" />
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-charcoal-gray border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <Heart className="h-5 w-5 text-goldenrod" />
            <span>Date Journal Entry</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partner_name" className="text-white text-sm font-medium">
                Partner's Name
              </Label>
              <Input
                id="partner_name"
                value={formData.partner_name}
                onChange={(e) => handleInputChange('partner_name', e.target.value)}
                className="bg-jet-black border-gray-700 text-white"
                placeholder="Enter their name"
                required
              />
            </div>
            <div>
              <Label htmlFor="date_completed" className="text-white text-sm font-medium">
                Date
              </Label>
              <Input
                id="date_completed"
                type="date"
                value={formData.date_completed}
                onChange={(e) => handleInputChange('date_completed', e.target.value)}
                className="bg-jet-black border-gray-700 text-white"
                required
              />
            </div>
          </div>

          {/* Date Details */}
          <div>
            <Label htmlFor="date_title" className="text-white text-sm font-medium">
              Date Title
            </Label>
            <Input
              id="date_title"
              value={formData.date_title}
              onChange={(e) => handleInputChange('date_title', e.target.value)}
              className="bg-jet-black border-gray-700 text-white"
              placeholder="e.g., Coffee and Art Gallery Walk"
              required
            />
          </div>

          <div>
            <Label htmlFor="date_activity" className="text-white text-sm font-medium">
              What did you do?
            </Label>
            <Textarea
              id="date_activity"
              value={formData.date_activity}
              onChange={(e) => handleInputChange('date_activity', e.target.value)}
              className="bg-jet-black border-gray-700 text-white"
              placeholder="Describe the activities and experience..."
              rows={3}
              required
            />
          </div>

          {/* Rating */}
          <div>
            <Label className="text-white text-sm font-medium mb-2 block">
              Overall Rating
            </Label>
            {renderStarRating()}
          </div>

          {/* Would Repeat */}
          <div>
            <Label className="text-white text-sm font-medium mb-2 block">
              Would you do this again?
            </Label>
            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={() => handleInputChange('would_repeat', true)}
                variant={formData.would_repeat === true ? "default" : "outline"}
                className={`${
                  formData.would_repeat === true
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'border-gray-600 text-gray-300 hover:text-white'
                }`}
              >
                Yes 👍
              </Button>
              <Button
                type="button"
                onClick={() => handleInputChange('would_repeat', false)}
                variant={formData.would_repeat === false ? "default" : "outline"}
                className={`${
                  formData.would_repeat === false
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'border-gray-600 text-gray-300 hover:text-white'
                }`}
              >
                No 👎
              </Button>
            </div>
          </div>

          {/* Reflection Notes */}
          <div>
            <Label htmlFor="reflection_notes" className="text-white text-sm font-medium">
              Reflection & Notes
            </Label>
            <Textarea
              id="reflection_notes"
              value={formData.reflection_notes}
              onChange={(e) => handleInputChange('reflection_notes', e.target.value)}
              className="bg-jet-black border-gray-700 text-white"
              placeholder="How did you feel? What stood out? Any memorable moments?"
              rows={4}
            />
          </div>

          {/* Learned Insights */}
          <div>
            <Label htmlFor="learned_insights" className="text-white text-sm font-medium">
              What did you learn?
            </Label>
            <Textarea
              id="learned_insights"
              value={formData.learned_insights}
              onChange={(e) => handleInputChange('learned_insights', e.target.value)}
              className="bg-jet-black border-gray-700 text-white"
              placeholder="About yourself, them, or what you're looking for in connections..."
              rows={3}
            />
          </div>

          {/* Tags */}
          <div>
            <Label className="text-white text-sm font-medium mb-2 block">
              Tags
            </Label>
            <div className="flex items-center space-x-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="bg-jet-black border-gray-700 text-white flex-1"
                placeholder="Add a tag (e.g., romantic, fun, creative)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                size="sm"
                className="bg-goldenrod/20 hover:bg-goldenrod/30 text-goldenrod border border-goldenrod/30"
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-goldenrod/20 text-goldenrod border border-goldenrod/30 flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !formData.partner_name || !formData.date_title || !formData.date_activity}
              className="flex-1 bg-goldenrod hover:bg-goldenrod/90 text-jet-black font-semibold"
            >
              {isSaving ? 'Saving...' : 'Save Entry'} ✨
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

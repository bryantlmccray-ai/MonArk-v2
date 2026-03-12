
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
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partner_name || !formData.date_title || !formData.date_activity) return;
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
              ? 'text-primary'
              : 'text-muted-foreground/40 hover:text-primary/60'
          }`}
        >
          <Star className="h-5 w-5 fill-current" />
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-2 border-border shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.15)] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center space-x-2">
            <Heart className="h-5 w-5 text-primary" />
            <span>Date Journal Entry</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partner_name" className="text-foreground text-sm font-semibold">Partner's Name</Label>
              <Input id="partner_name" value={formData.partner_name} onChange={(e) => handleInputChange('partner_name', e.target.value)} placeholder="Enter their name" required />
            </div>
            <div>
              <Label htmlFor="date_completed" className="text-foreground text-sm font-semibold">Date</Label>
              <Input id="date_completed" type="date" value={formData.date_completed} onChange={(e) => handleInputChange('date_completed', e.target.value)} required />
            </div>
          </div>

          <div>
            <Label htmlFor="date_title" className="text-foreground text-sm font-semibold">Date Title</Label>
            <Input id="date_title" value={formData.date_title} onChange={(e) => handleInputChange('date_title', e.target.value)} placeholder="e.g., Coffee and Art Gallery Walk" required />
          </div>

          <div>
            <Label htmlFor="date_activity" className="text-foreground text-sm font-semibold">What did you do?</Label>
            <Textarea id="date_activity" value={formData.date_activity} onChange={(e) => handleInputChange('date_activity', e.target.value)} placeholder="Describe the activities and experience..." rows={3} required />
          </div>

          <div>
            <Label className="text-foreground text-sm font-semibold mb-2 block">Overall Rating</Label>
            {renderStarRating()}
          </div>

          <div>
            <Label className="text-foreground text-sm font-semibold mb-2 block">Would you do this again?</Label>
            <div className="flex space-x-3">
              <Button type="button" onClick={() => handleInputChange('would_repeat', true)} variant={formData.would_repeat === true ? "default" : "outline"}>
                Yes 👍
              </Button>
              <Button type="button" onClick={() => handleInputChange('would_repeat', false)} variant={formData.would_repeat === false ? "destructive" : "outline"}>
                No 👎
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="reflection_notes" className="text-foreground text-sm font-semibold">Reflection & Notes</Label>
            <Textarea id="reflection_notes" value={formData.reflection_notes} onChange={(e) => handleInputChange('reflection_notes', e.target.value)} placeholder="How did you feel? What stood out?" rows={4} />
          </div>

          <div>
            <Label htmlFor="learned_insights" className="text-foreground text-sm font-semibold">What did you learn?</Label>
            <Textarea id="learned_insights" value={formData.learned_insights} onChange={(e) => handleInputChange('learned_insights', e.target.value)} placeholder="About yourself, them, or what you're looking for..." rows={3} />
          </div>

          <div>
            <Label className="text-foreground text-sm font-semibold mb-2 block">Tags</Label>
            <div className="flex items-center space-x-2 mb-2">
              <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} className="flex-1" placeholder="Add a tag (e.g., romantic, fun)" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} />
              <Button type="button" onClick={handleAddTag} size="sm" variant="outline">
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
            <Button type="submit" disabled={isSaving || !formData.partner_name || !formData.date_title || !formData.date_activity} className="flex-1">
              {isSaving ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

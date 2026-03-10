import { useState } from 'react';
import { useVendors, VendorItem } from '@/hooks/useVendors';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MapPin, Globe, Phone, Star, Heart, Plus, Store, Camera, UtensilsCrossed, Paintbrush, ArrowLeft } from 'lucide-react';

interface VendorBrowserProps {
  itineraryId?: string;
  onClose: () => void;
  onVendorSelected?: (item: VendorItem) => void;
}

const categoryOptions = [
  { value: 'all', label: 'All', icon: Store },
  { value: 'restaurant', label: 'Restaurants', icon: UtensilsCrossed },
  { value: 'activity', label: 'Activities', icon: Paintbrush },
  { value: 'service', label: 'Services', icon: Camera },
];

const priceLabel = (level: number | null) => {
  if (!level) return null;
  return '$'.repeat(Math.min(level, 4));
};

export const VendorBrowser = ({ itineraryId, onClose, onVendorSelected }: VendorBrowserProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { allItems, loading, addVendorToItinerary } = useVendors({ category: selectedCategory });
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleSelect = async (item: VendorItem) => {
    if (onVendorSelected) {
      onVendorSelected(item);
      return;
    }
    if (!itineraryId) return;
    
    setAddingId(item.data.id);
    await addVendorToItinerary(itineraryId, item);
    setAddingId(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-xl font-serif font-bold text-foreground">Browse Vendors</h2>
          <p className="text-xs text-muted-foreground">Select vendors for your date</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categoryOptions.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant={selectedCategory === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(value)}
            className="flex-shrink-0 h-9"
          >
            <Icon className="w-3.5 h-3.5 mr-1.5" />
            {label}
          </Button>
        ))}
      </div>

      {/* Vendor List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : allItems.length === 0 ? (
        <div className="text-center py-14 bg-card rounded-2xl border border-border/60">
          <Store className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm mb-1">No vendors available yet</p>
          <p className="text-xs text-muted-foreground">
            Vendors will be added by the MonArk team
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allItems.map((item) => (
            <VendorCard
              key={item.data.id}
              item={item}
              onSelect={() => handleSelect(item)}
              isAdding={addingId === item.data.id}
              showAddButton={!!itineraryId || !!onVendorSelected}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const VendorCard = ({
  item,
  onSelect,
  isAdding,
  showAddButton,
}: {
  item: VendorItem;
  onSelect: () => void;
  isAdding: boolean;
  showAddButton: boolean;
}) => {
  const { data } = item;
  const isVenue = item.type === 'venue';
  const price = priceLabel('price_level' in data ? data.price_level : null);

  return (
    <Card className="overflow-hidden hover:shadow-[0_4px_16px_rgba(100,80,60,0.08)] transition-all duration-200">
      <CardContent className="p-4 space-y-3">
        {/* Name & Category */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">{data.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-[10px] capitalize">
                {isVenue ? (data as any).category : 'Service Provider'}
              </Badge>
              {price && (
                <span className="text-xs text-muted-foreground font-medium">{price}</span>
              )}
            </div>
          </div>
          {isVenue && (data as any).rating && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
              <Star className="w-3 h-3 text-primary fill-primary" />
              {(data as any).rating}
            </div>
          )}
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {data.description}
          </p>
        )}

        {/* Location (venues only) */}
        {isVenue && (data as any).address && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{(data as any).address}</span>
          </div>
        )}

        {/* Vibe Tags */}
        {data.vibe_tags && data.vibe_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.vibe_tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-[10px] bg-primary/5 border-primary/15 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer: LGBTQ+ friendly + links + add button */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {data.is_lgbtq_friendly && (
              <Badge variant="outline" className="text-[10px] bg-accent/10 border-accent/20">
                <Heart className="w-2.5 h-2.5 mr-0.5" />
                LGBTQ+
              </Badge>
            )}
            {data.website_url && (
              <a
                href={data.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
            )}
            {data.phone && (
              <a href={`tel:${data.phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {showAddButton && (
            <Button size="sm" onClick={onSelect} disabled={isAdding} className="h-7 text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

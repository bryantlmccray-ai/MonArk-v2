import { Calendar, MapPin, Heart, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { WeeklyOption } from '@/hooks/useWeeklyOptions';

interface WeeklyOptionsCardProps {
  option: WeeklyOption;
  onTap: () => void;
  onView: () => void;
}

export const WeeklyOptionsCard = ({ option, onTap, onView }: WeeklyOptionsCardProps) => {
  const startTime = new Date(option.time_window.start);
  const endTime = new Date(option.time_window.end);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50 bg-card/80 backdrop-blur-sm"
      onClick={() => {
        onView();
        onTap();
      }}
    >
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground mb-1">
              {option.title}
            </h3>
            <p className="text-sm text-muted-foreground italic">
              {option.vibe_line}
            </p>
          </div>
          {option.is_template && (
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="w-3 h-3 mr-1" />
              Curated
            </Badge>
          )}
        </div>

        {/* EQ Fit Chips */}
        <div className="flex flex-wrap gap-2">
          {option.eq_fit_chips.map((chip, idx) => (
            <Badge 
              key={idx} 
              variant="outline"
              className="text-xs bg-primary/5 border-primary/20"
            >
              {chip}
            </Badge>
          ))}
        </div>

        {/* Time & Location */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {format(startTime, 'EEE, MMM d')} · {format(startTime, 'h:mm a')} ({duration}min)
            </span>
          </div>
          
          {option.distance_km && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{option.distance_km.toFixed(1)} km away</span>
            </div>
          )}
        </div>

        {/* Care Index */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <Heart className="w-4 h-4 text-primary" />
          <div className="flex-1">
            <div className="text-xs font-medium text-foreground">Care Index</div>
            <div className="text-xs text-muted-foreground">
              Quality & Safety Score: {(option.care_index_score * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Why This For You */}
        <div className="p-3 rounded-lg bg-accent/50 border border-accent">
          <p className="text-xs text-foreground">
            <span className="font-semibold">Why this for you:</span> {option.why_this_for_you}
          </p>
        </div>

        {/* Action Button */}
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onTap();
          }}
          className="w-full"
          size="lg"
        >
          Create Itinerary
        </Button>
      </CardContent>
    </Card>
  );
};
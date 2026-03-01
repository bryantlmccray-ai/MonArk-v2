import { Calendar, MapPin, Heart, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { WeeklyOption } from '@/hooks/useWeeklyOptions';

interface WeeklyOptionsCardProps {
  option: WeeklyOption;
  onAccept: () => void;
  onPass: () => void;
  isProcessing?: boolean;
}

export const WeeklyOptionsCard = ({ option, onAccept, onPass, isProcessing }: WeeklyOptionsCardProps) => {
  const startTime = new Date(option.time_window.start);
  const endTime = new Date(option.time_window.end);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

  return (
    <Card className="overflow-hidden hover:shadow-[0_4px_16px_rgba(100,80,60,0.08)] transition-all duration-200">
      <CardContent className="p-5 space-y-3.5">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-foreground leading-snug mb-0.5">
            {option.title}
          </h3>
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            {option.vibe_line}
          </p>
        </div>

        {/* Venue */}
        {option.venue_data && (
          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-foreground text-sm">{option.venue_data.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{option.venue_data.address}</div>
              </div>
            </div>
          </div>
        )}

        {/* Time */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-xs">
            {format(startTime, 'EEE, MMM d')} · {format(startTime, 'h:mm a')} ({duration}min)
          </span>
        </div>

        {/* EQ Fit Chips */}
        <div className="flex flex-wrap gap-1.5">
          {option.eq_fit_chips.slice(0, 3).map((chip, idx) => (
            <Badge 
              key={idx} 
              variant="outline"
              className="text-[11px] bg-primary/5 border-primary/15 py-0.5"
            >
              {chip}
            </Badge>
          ))}
        </div>

        {/* Care Index */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Heart className="w-3.5 h-3.5 text-primary" />
          <span>Quality Score: {(option.care_index_score * 100).toFixed(0)}%</span>
        </div>

        {/* Why This */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Why this:</span> {option.why_this_for_you}
        </p>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <Button 
            variant="outline"
            onClick={onPass}
            disabled={isProcessing}
            className="flex-1 h-10"
          >
            <X className="w-4 h-4 mr-1" />
            Pass
          </Button>
          <Button 
            onClick={onAccept}
            disabled={isProcessing}
            className="flex-1 h-10"
          >
            <Check className="w-4 h-4 mr-1" />
            Accept
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

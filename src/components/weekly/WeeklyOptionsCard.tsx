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
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-1">
            {option.title}
          </h3>
          <p className="text-sm text-muted-foreground italic">
            {option.vibe_line}
          </p>
        </div>

        {/* Venue - The Key Info */}
        {option.venue_data && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium text-foreground">{option.venue_data.name}</div>
                <div className="text-sm text-muted-foreground">{option.venue_data.address}</div>
              </div>
            </div>
          </div>
        )}

        {/* Time */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            {format(startTime, 'EEE, MMM d')} · {format(startTime, 'h:mm a')} ({duration}min)
          </span>
        </div>

        {/* EQ Fit Chips */}
        <div className="flex flex-wrap gap-2">
          {option.eq_fit_chips.slice(0, 3).map((chip, idx) => (
            <Badge 
              key={idx} 
              variant="outline"
              className="text-xs bg-primary/5 border-primary/20"
            >
              {chip}
            </Badge>
          ))}
        </div>

        {/* Care Index - Simple */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Heart className="w-4 h-4 text-primary" />
          <span>Quality Score: {(option.care_index_score * 100).toFixed(0)}%</span>
        </div>

        {/* Why This For You */}
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Why this:</span> {option.why_this_for_you}
        </p>

        {/* Accept / Pass Buttons */}
        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline"
            onClick={onPass}
            disabled={isProcessing}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Pass
          </Button>
          <Button 
            onClick={onAccept}
            disabled={isProcessing}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            Accept
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

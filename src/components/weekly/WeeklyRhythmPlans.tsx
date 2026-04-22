import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
      Moon, Compass, Clock, MapPin, Shield,
      Check, ArrowRight, Calendar,
      Zap, Bookmark, BookmarkCheck, Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWeeklyRhythm, type WeeklyRhythm } from '@/hooks/useWeeklyRhythm';
import { useVenues } from '@/hooks/useVenues';
import { useRIF } from '@/hooks/useRIF';
import { getVenueRecommendations, type Venue } from '@/lib/venueMatching';

// ---------------------------------------------------------------------------
// Rhythm meta-data
// ---------------------------------------------------------------------------
const rhythmConfig: Record<
      WeeklyRhythm,
{
        label: string;
        tagline: string;
        icon: React.ElementType;
        color: string;
        bg: string;
        energyLevel: number;
        timeHint: string;
        duration: string;
        careFeatures: string[];
        noisePreference: 'quiet' | 'moderate' | 'loud';
}
    > = {
      reset: {
              label: 'Reset',
              tagline: 'Slow down, reconnect',
              icon: Moon,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
              energyLevel: 30,
              timeHint: 'Weekday evening',
              duration: '1-2 hours',
              careFeatures: ['Private setting', 'Low stimulation', 'Easy exit'],
        noisePreference: 'quiet',
      },
      spark: {
              label: 'Spark',
              tagline: 'Ignite something new',
              icon: Zap,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
              energyLevel: 65,
              timeHint: 'Weekend evening',
              duration: '2-3 hours',
              careFeatures: ['Conversation-friendly', 'Moderate energy', 'Fun atmosphere'],
              noisePreference: 'moderate',
      },
      stretch: {
              label: 'Stretch',
              tagline: 'Push your edges',
              icon: Compass,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
              energyLevel: 80,
              timeHint: 'Sunday afternoon',
              duration: '3 hours',
              careFeatures: ['Safety briefing', 'Group activity', 'Visible SOS'],
              noisePreference: 'loud',
      },
};

const RHYTHMS: WeeklyRhythm[] = ['reset', 'spark', 'stretch'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const WeeklyRhythmPlans = () => {
      const { rhythm: savedRhythm, saveRhythm, saving, weekStart } = useWeeklyRhythm();
      const { venues, loading: venuesLoading } = useVenues();
      const { rifProfile } = useRIF();

      const [selectedRhythm, setSelectedRhythm] = React.useState<WeeklyRhythm | null>(savedRhythm);
            const [savedVenues, setSavedVenues] = React.useState<Set<string>>(new Set());
      const [choosingRhythm, setChoosingRhythm] = React.useState<WeeklyRhythm | null>(null);

      // Keep local selection in sync when DB value loads
      React.useEffect(() => {
              if (savedRhythm && !selectedRhythm) setSelectedRhythm(savedRhythm);
      }, [savedRhythm]);

      // Build RIFScores from rifProfile (use normalised *_pct values if present)
      const rifScores = React.useMemo(() => ({
              emotional_intelligence: rifProfile?.emotional_readiness_pct ?? rifProfile?.emotional_readiness ?? 50,
              communication_style: rifProfile?.pacing_preferences_pct ?? rifProfile?.pacing_preferences ?? 50,
              lifestyle_alignment: rifProfile?.intent_clarity_pct ?? rifProfile?.intent_clarity ?? 50,
              relationship_readiness: rifProfile?.post_date_alignment_pct ?? rifProfile?.post_date_alignment ?? 50,
              growth_orientation: rifProfile?.boundary_respect_pct ?? rifProfile?.boundary_respect ?? 50,
      }), [rifProfile]);

      // Rank real venues by RIF alignment for the chosen rhythm
      const suggestedVenues: Venue[] = React.useMemo(() => {
              if (!venues.length || !selectedRhythm) return [];
              return getVenueRecommendations(rifScores, venues, 3);
      }, [venues, selectedRhythm, rifScores]);

      const isLoading = venuesLoading;
      const noVenues = !isLoading && suggestedVenues.length === 0;

      if (isLoading) {
              return (
                        <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>div>
                      );
      }
    
      return (
              <div className="bg-background">
                  {/* Hero */}
                    <div className="relative px-6 pt-3 pb-4">
                            <div className="relative max-w-2xl mx-auto text-center space-y-2">
                                      <div className="inline-flex items-center gap-1.5 px-3">
                                                  <Calendar className="w-3 h-3" />
                                                  <p className="text-muted-foreground text-sm">
                                                                Week of {weekStart ?? '\u2014'}
                                                  </p>p>
                                      </div>div>
                                      <h1 className="text-2xl font-semibold tracking-tight">
                                          {"What\u2019s your rhythm this week?"}
                                      </h1>h1>
                                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                          {"Your pick shapes who we surface \u2014 and where you\u2019ll meet them."}
                                      </p>p>
                            </div>div>
                    </div>div>
              
                  {/* Rhythm picker */}
                    <div className="px-4 pb-4">
                            <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto">
                                {RHYTHMS.map((rhythm) => {
                              const cfg = rhythmConfig[rhythm];
                              const Icon = cfg.icon;
                              const isActive = selectedRhythm === rhythm;
                              const isSaved = savedRhythm === rhythm;
                              return (
                                                <motion.button
                                                                    key={rhythm}
                                                                    whileTap={{ scale: 0.97 }}
                                                                    onClick={() => setSelectedRhythm(rhythm)}
                                                                    className={[
                                                                                          'relative flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all',
                                                                                          isActive
                                                                                            ? `${cfg.bg} border-current ${cfg.color} shadow-sm`
                                                                                            : 'border-border/40 text-muted-foreground hover:border-border',
                                                                                        ].join(' ')}
                                                                  >
                                                    {isSaved && (
                                                                                        <span className="absolute top-1.5 right-1.5">
                                                                                                            <BookmarkCheck className="w-3 h-3 text-primary" />
                                                                                            </span>span>
                                                                )}
                                                                <Icon className={`w-5 h-5 ${isActive ? cfg.color : ''}`} />
                                                                <span className="text-xs font-medium leading-tight">{cfg.label}</span>span>
                                                                <span className="text-[10px] leading-tight opacity-70">{cfg.tagline}</span>span>
                                                </motion.button>motion.button>
                                              );
              })}
                            </div>div>
                    </div>div>
              
                  {/* Detail panel */}
                    <AnimatePresence mode="wait">
                        {selectedRhythm && (
                            <motion.div
                                            key={selectedRhythm}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.2 }}
                                            className="px-4 pb-4 max-w-2xl mx-auto space-y-4"
                                          >
                                {/* Energy + meta */}
                                        <Card className="border-border/40">
                                                      <CardContent className="p-4 space-y-3">
                                                                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                                                        <span>Energy level</span>span>
                                                                                        <span>{rhythmConfig[selectedRhythm].energyLevel}%</span>span>
                                                                      </div>div>
                                                                      <Progress value={rhythmConfig[selectedRhythm].energyLevel} className="h-1.5" />
                                                                      <div className="flex flex-wrap gap-2 pt-1">
                                                                          {[
                                              { icon: Clock, label: rhythmConfig[selectedRhythm].timeHint },
                                              { icon: MapPin, label: rhythmConfig[selectedRhythm].duration },
                                              { icon: Shield, label: rhythmConfig[selectedRhythm].noisePreference },
                                                                ].map(({ icon: Icon, label }) => (
                                                                                        <div key={label} className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                                                              <Icon className="w-3 h-3" />
                                                                                                              <span>{label}</span>span>
                                                                                            </div>div>
                                                                                      ))}
                                                                      </div>div>
                                                      </CardContent>CardContent>
                                        </Card>Card>
                            
                                {/* Venue suggestions from venueMatching */}
                                        <div className="space-y-2">
                                                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                                                                      Date spots for this rhythm
                                                      </p>p>
                                            {noVenues ? (
                                                              <p className="text-xs text-muted-foreground px-1">
                                                                                No partner venues found yet — check back soon.
                                                              </p>p>
                                                            ) : (
                                                              suggestedVenues.map((venue) => (
                                                                                    <Card key={venue.id} className="border-border/30">
                                                                                                        <CardContent className="p-3 flex items-center gap-3">
                                                                                                                              <div className="flex-1 min-w-0">
                                                                                                                                                      <p className="text-sm font-medium truncate">{venue.name}</p>p>
                                                                                                                                                      <p className="text-xs text-muted-foreground truncate">
                                                                                                                                                          {venue.city ?? ''}
                                                                                                                                                          </p>p>
                                                                                                                                  </div>div>
                                                                                                                              <div className="flex items-center gap-1.5 shrink-0">
                                                                                                                                                      <button
                                                                                                                                                                                    onClick={() =>
                                                                                                                                                                                                                    setSavedVenues((prev) => {
                                                                                                                                                                                                                                                      const next = new Set(prev);
                                                                                                                                                                                                                                                      next.has(venue.id) ? next.delete(venue.id) : next.add(venue.id);
                                                                                                                                                                                                                                                      return next;
                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                  }
                                                                                                                                                                                    className="text-muted-foreground hover:text-primary transition-colors"
                                                                                                                                                                                  >
                                                                                                                                                          {savedVenues.has(venue.id) ? (
                                                                                                                                                                                                                  <BookmarkCheck className="w-4 h-4 text-primary" />
                                                                                                                                                                                                                ) : (
                                                                                                                                                                                                                  <Bookmark className="w-4 h-4" />
                                                                                                                                                                                                                )}
                                                                                                                                                          </button>button>
                                                                                                                                                      <Badge variant="outline" className="text-[10px]">
                                                                                                                                                          {venue.venue_type ?? 'Venue'}
                                                                                                                                                          </Badge>Badge>
                                                                                                                                  </div>div>
                                                                                                            </CardContent>CardContent>
                                                                                        </Card>Card>
                                                                                  ))
                                                            )}
                                        </div>div>
                            
                                {/* Choose CTA — saves to Supabase via useWeeklyRhythm */}
                                        <Button
                                                          className="w-full"
                                                          disabled={saving || selectedRhythm === savedRhythm}
                                                          onClick={async () => {
                                                                              if (!selectedRhythm) return;
                                                                              setChoosingRhythm(selectedRhythm);
                                                                              await saveRhythm(selectedRhythm);
                                                                              setChoosingRhythm(null);
                                                          }}
                                                        >
                                            {saving && choosingRhythm === selectedRhythm ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                                          ) : selectedRhythm === savedRhythm ? (
                                                                            <Check className="w-4 h-4 mr-2" />
                                                                          ) : (
                                                                            <ArrowRight className="w-4 h-4 mr-2" />
                                                                          )}
                                            {selectedRhythm === savedRhythm
                                                                ? 'This is your rhythm'
                                                                : saving && choosingRhythm === selectedRhythm
                                                                ? 'Saving...'
                                                                : 'Choose this plan'}
                                        </Button>Button>
                            </motion.div>motion.div>
                          )}
                    </AnimatePresence>AnimatePresence>
              </div>div>
            );
};

export default WeeklyRhythmPlans;
</div>

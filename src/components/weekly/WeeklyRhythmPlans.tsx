import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Moon, Sparkles, Compass, Clock, MapPin, Shield, Heart,
    Users, Check, ArrowRight, Calendar, MessageCircle, Ghost,
    Zap, Coffee, X, Bookmark, BookmarkCheck, Star, Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useWeeklyRhythm, type WeeklyRhythm } from '@/hooks/useWeeklyRhythm';
import { useVenues } from '@/hooks/useVenues';
import { useRIF } from '@/hooks/useRIF';
import { useAuth } from '@/hooks/useAuth';
import { getVenueRecommendations } from '@/lib/venueMatching';
import type { Venue } from '@/lib/venueMatching';

// ─── Rhythm meta ────────────────────────────────────────────────────────────
const rhythmConfig: Record<WeeklyRhythm, {
    icon: React.ElementType;
    label: string;
    description: string;
    tagline: string;
    gradient: string;
    accent: string;
    border: string;
    bg: string;
    energyLevel: number;
    timeHint: string;
    duration: string;
    careFeatures: string[];
    noisePreference: 'quiet' | 'moderate' | 'loud';
}> = {
    reset: {
          icon: Moon,
          label: 'Reset',
          description: 'Calm & restorative',
          tagline: 'Coffee, quiet corners, and genuine conversation',
          gradient: 'from-indigo-500/20 via-purple-500/10 to-blue-500/20',
          accent: 'text-indigo-400',
          border: 'border-indigo-500/30',
          bg: 'bg-indigo-500/10',
          energyLevel: 25,
          timeHint: 'Saturday morning',
          duration: '90 min',
          careFeatures: ['Clear end time', 'Public venue', 'Quiet setting'],
          noisePreference: 'quiet',
    },
    spark: {
          icon: Sparkles,
          label: 'Spark',
          description: 'Light & social',
          tagline: 'Art, easy laughs, and a glass of something nice',
          gradient: 'from-amber-500/20 via-orange-500/10 to-rose-500/20',
          accent: 'text-amber-400',
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/10',
          energyLevel: 55,
          timeHint: 'Friday evening',
          duration: '2 hours',
          careFeatures: ['Walkable area', 'Multiple venues', 'Easy exit'],
          noisePreference: 'moderate',
    },
    stretch: {
          icon: Compass,
          label: 'Stretch',
          description: 'Adventurous',
          tagline: 'A little adventure, new perspectives, shared wonder',
          gradient: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/20',
          accent: 'text-emerald-400',
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-500/10',
          energyLevel: 80,
          timeHint: 'Sunday afternoon',
          duration: '3 hours',
          careFeatures: ['Safety briefing', 'Group activity', 'Visible SOS'],
          noisePreference: 'loud',
    },
};

const RHYTHMS: WeeklyRhythm[] = ['reset', 'spark', 'stretch'];

// ─── Venue → plan card shape ─────────────────────────────────────────────────
interface VenuePlan {
    venue: Venue;
    rhythm: WeeklyRhythm;
}

// ─── Saved venue state (client-side only, keyed by venue id) ────────────────
export const WeeklyRhythmPlans = () => {
    const { user } = useAuth();
    const { rhythm: savedRhythm, saving, saveRhythm } = useWeeklyRhythm();
    const { rifScores, loading: rifLoading } = useRIF();
    const { venues, loading: venuesLoading } = useVenues();

    const [selectedPlan, setSelectedPlan] = useState<VenuePlan | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [savedVenueIds, setSavedVenueIds] = useState<string[]>([]);

    // ── Derive per-rhythm venue recommendations from real RIF scores ───────────
    const venuesByRhythm: Record<WeeklyRhythm, Venue[]> = {
          reset:   getVenueRecommendations(rifScores, venues.filter(v => v.noise_level === 'quiet'),   3),
          spark:   getVenueRecommendations(rifScores, venues.filter(v => v.noise_level !== 'quiet'),   3),
          stretch: getVenueRecommendations(rifScores, venues.filter(v =>
                           v.venue_type === 'activity' || v.venue_type === 'experience'),                     3),
    };

    const isLoading = rifLoading || venuesLoading;

    // ── Rhythm selection ────────────────────────────────────────────────────────
    const handlePickRhythm = async (r: WeeklyRhythm) => {
          await saveRhythm(r);
    };

    // ── Save venue card ─────────────────────────────────────────────────────────
    const handleSaveVenue = (venueId: string) => {
          setSavedVenueIds(prev => {
                  if (prev.includes(venueId)) {
                            toast('Removed from saved');
                            return prev.filter(id => id !== venueId);
                  }
                  toast.success('Plan saved!');
                  return [...prev, venueId];
          });
    };

    // ── Select plan → show confirmation ────────────────────────────────────────
    const handleSelectPlan = (plan: VenuePlan) => {
          setSelectedPlan(plan);
          setShowConfirmation(true);
    };

    const handleConfirmPlan = async () => {
          if (!selectedPlan || !user) return;
          // Persist rhythm if not already saved
          if (!savedRhythm) await saveRhythm(selectedPlan.rhythm);
          setShowConfirmation(false);
          setSelectedPlan(null);
          toast.success('Plan locked in!');
    };

    // ── Flat list of suggested venues across all rhythms for "Suggested" section
    const suggestedVenues = Object.entries(venuesByRhythm)
      .flatMap(([r, vs]) => vs.map(v => ({ venue: v, rhythm: r as WeeklyRhythm })))
      .filter((x, i, arr) => arr.findIndex(y => y.venue.id === x.venue.id) === i) // dedupe
      .slice(0, 6);

    // ── Fallback demo venues when DB is empty ────────────────────────────────
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
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold tracking-wider uppercase">
                                              <Calendar className="w-3 h-3" />
                                              Your Weekly Rhythm
                                  </div>div>
                                  <h1 className="text-2xl font-bold text-foreground">How are you feeling?</h1>h1>
                                  <p className="text-muted-foreground text-sm">
                                              Pick your rhythm. We'll match you with people on the same wavelength.
                                  </p>p>
                        </div>div>
                </div>div>
          
            {/* Rhythm picker */}
                <div className="px-6 pb-6">
                        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-3">
                          {RHYTHMS.map((r) => {
                        const cfg = rhythmConfig[r];
                        const Icon = cfg.icon;
                        const isActive = savedRhythm === r;
                        return (
                                        <motion.button
                                                          key={r}
                                                          whileTap={{ scale: 0.97 }}
                                                          onClick={() => handlePickRhythm(r)}
                                                          disabled={saving}
                                                          className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all
                                                                            ${isActive
                                              ? `${cfg.border} bg-gradient-to-br ${cfg.gradient} shadow-md`
                                                                                                  : 'border-border/40 bg-card hover:border-border'
                                                                            }`}
                                                        >
                                          {isActive && (
                                                                            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                                                                                                <Check className="w-2.5 h-2.5 text-primary-foreground" />
                                                                            </span>span>
                                                        )}
                                                        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                                                                          <Icon className={`w-5 h-5 ${cfg.accent}`} />
                                                        </div>div>
                                                        <span className="text-sm font-semibold text-foreground">{cfg.label}</span>span>
                                                        <span className="text-[11px] text-muted-foreground text-center leading-tight">{cfg.description}</span>span>
                                        </motion.button>motion.button>
                                      );
          })}
                        </div>div>
                  {savedRhythm && (
                      <p className="text-center text-xs text-muted-foreground mt-3">
                                  Your <span className="text-primary font-medium capitalize">{savedRhythm}</span>span> rhythm is set for this week.
                      </p>p>
                        )}
                </div>div>
          
            {/* Venue plans for selected rhythm */}
            {savedRhythm && (
                    <AnimatePresence mode="wait">
                              <motion.div
                                            key={savedRhythm}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -16 }}
                                            className="px-6 pb-6"
                                          >
                                          <div className="max-w-4xl mx-auto space-y-3">
                                                        <div className="flex items-center gap-2">
                                                                        <Star className="w-4 h-4 text-primary" />
                                                                        <h2 className="text-lg font-semibold text-foreground">
                                                                          {rhythmConfig[savedRhythm].label} dates near you
                                                                        </h2>h2>
                                                        </div>div>
                                                        <p className="text-sm text-muted-foreground -mt-2">
                                                          {rhythmConfig[savedRhythm].tagline}
                                                        </p>p>
                                          
                                            {venuesByRhythm[savedRhythm].length === 0 ? (
                                                            <Card className="border border-dashed border-border/60">
                                                                              <CardContent className="p-6 text-center">
                                                                                                  <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                                                                                                  <p className="text-sm text-muted-foreground">
                                                                                                                        No venues loaded yet — check back soon as more partner venues are added.
                                                                                                    </p>p>
                                                                              </CardContent>CardContent>
                                                            </Card>Card>
                                                          ) : (
                                                            <div className="grid gap-4">
                                                              {venuesByRhythm[savedRhythm].map((venue) => {
                                                                                  const isSaved = savedVenueIds.includes(venue.id);
                                                                                  const cfg = rhythmConfig[savedRhythm];
                                                                                  return (
                                                                                                          <Card key={venue.id} className="overflow-hidden border border-border/60">
                                                                                                                                  <CardContent className="p-5 space-y-3">
                                                                                                                                                            <div className="flex items-start justify-between gap-3">
                                                                                                                                                                                        <div className="flex-1">
                                                                                                                                                                                                                      <h3 className="font-semibold text-foreground text-base">{venue.name}</h3>h3>
                                                                                                                                                                                                                      <div className="flex items-center gap-1.5 mt-0.5">
                                                                                                                                                                                                                                                      <MapPin className="w-3 h-3 text-muted-foreground" />
                                                                                                                                                                                                                                                      <span className="text-xs text-muted-foreground">{venue.city ?? venue.address}</span>span>
                                                                                                                                                                                                                                                      <span className="text-muted-foreground/40 mx-1">·</span>span>
                                                                                                                                                                                                                                                      <Clock className="w-3 h-3 text-muted-foreground" />
                                                                                                                                                                                                                                                      <span className="text-xs text-muted-foreground">{cfg.timeHint}</span>span>
                                                                                                                                                                                                                                                    </div>div>
                                                                                                                                                                                                                    </div>div>
                                                                                                                                                              </div>div>
                                                                                                                                  
                                                                                                                                    {/* Tags */}
                                                                                                                                                            <div className="flex flex-wrap gap-1.5">
                                                                                                                                                              {venue.atmosphere_tags.slice(0, 3).map((tag) => (
                                                                                                                                          <Badge key={tag} variant="outline" className="text-[11px] px-2 py-0.5 bg-secondary/50 border-border/40 capitalize">
                                                                                                                                            {tag}
                                                                                                                                            </Badge>Badge>
                                                                                                                                        ))}
                                                                                                                                                              {venue.is_partner && (
                                                                                                                                          <Badge className="text-[11px] px-2 py-0.5 bg-primary/10 text-primary border-none">
                                                                                                                                                                          Partner venue
                                                                                                                                            </Badge>Badge>
                                                                                                                                                                                        )}
                                                                                                                                                              </div>div>
                                                                                                                                  
                                                                                                                                    {/* Energy + care */}
                                                                                                                                                            <div className="flex items-center gap-3">
                                                                                                                                                                                        <span className="text-xs text-muted-foreground">Energy:</span>span>
                                                                                                                                                                                        <Progress value={cfg.energyLevel} className="h-1.5 flex-1 max-w-24" />
                                                                                                                                                                                        <span className="text-xs text-muted-foreground">{cfg.energyLevel}%</span>span>
                                                                                                                                                              </div>div>
                                                                                                                                  
                                                                                                                                                            <div className="flex flex-wrap gap-2">
                                                                                                                                                              {cfg.careFeatures.map((f) => (
                                                                                                                                          <Badge key={f} variant="outline" className="bg-background/50 text-xs">
                                                                                                                                                                          <Shield className="w-3 h-3 mr-1 text-primary" />{f}
                                                                                                                                            </Badge>Badge>
                                                                                                                                        ))}
                                                                                                                                                              </div>div>
                                                                                                                                  
                                                                                                                                                            <div className="flex items-center justify-between pt-1">
                                                                                                                                                                                        <Button
                                                                                                                                                                                                                        size="sm"
                                                                                                                                                                                                                        onClick={() => handleSelectPlan({ venue, rhythm: savedRhythm })}
                                                                                                                                                                                                                      >
                                                                                                                                                                                                                      Choose this plan <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                                                                                                                                                                                                    </Button>Button>
                                                                                                                                                                                        <Button
                                                                                                                                                                                                                        variant={isSaved ? 'default' : 'outline'}
                                                                                                                                                                                                                        size="sm"
                                                                                                                                                                                                                        onClick={() => handleSaveVenue(venue.id)}
                                                                                                                                                                                                                        className="gap-1.5"
                                                                                                                                                                                                                      >
                                                                                                                                                                                                                      {isSaved
                                                                                                                                                                                                                                                        ? <><BookmarkCheck className="w-3.5 h-3.5" /> Saved</>>
                                                                                                                                                                                                                                                        : <><Bookmark className="w-3.5 h-3.5" /> Save</>>
                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                    </Button>Button>
                                                                                                                                                              </div>div>
                                                                                                                                    </CardContent>CardContent>
                                                                                                            </Card>Card>
                                                                                                        );
                                                            })}
                                                            </div>div>
                                                        )}
                                          </div>div>
                              </motion.div>motion.div>
                    </AnimatePresence>AnimatePresence>
                )}
          
            {/* Suggested this week — top venues across all rhythms */}
            {suggestedVenues.length > 0 && (
                    <div className="px-6 pb-6">
                              <div className="max-w-4xl mx-auto space-y-4">
                                          <div className="flex items-center gap-2">
                                                        <Star className="w-4 h-4 text-primary" />
                                                        <h2 className="text-lg font-semibold text-foreground">Suggested This Week</h2>h2>
                                          </div>div>
                                          <p className="text-sm text-muted-foreground -mt-2">
                                                        Top venues matched to your RIF across all rhythms.
                                          </p>p>
                                          <div className="grid gap-4">
                                            {suggestedVenues.map(({ venue, rhythm }) => {
                                      const isSaved = savedVenueIds.includes(venue.id);
                                      const cfg = rhythmConfig[rhythm];
                                      const Icon = cfg.icon;
                                      return (
                                                          <Card key={venue.id} className="overflow-hidden border border-border/60">
                                                                              <CardContent className="p-5 space-y-3">
                                                                                                    <div className="flex items-start justify-between gap-3">
                                                                                                                            <div className="flex-1">
                                                                                                                                                      <div className="flex items-center gap-2 mb-1">
                                                                                                                                                                                  <div className={`w-6 h-6 rounded-md ${cfg.bg} flex items-center justify-center`}>
                                                                                                                                                                                                                <Icon className={`w-3.5 h-3.5 ${cfg.accent}`} />
                                                                                                                                                                                                              </div>div>
                                                                                                                                                                                  <span className={`text-[11px] font-semibold ${cfg.accent} uppercase tracking-wide`}>
                                                                                                                                                                                                                {cfg.label}
                                                                                                                                                                                                              </span>span>
                                                                                                                                                        </div>div>
                                                                                                                                                      <h3 className="font-semibold text-foreground text-base">{venue.name}</h3>h3>
                                                                                                                                                      <div className="flex items-center gap-1.5 mt-0.5">
                                                                                                                                                                                  <MapPin className="w-3 h-3 text-muted-foreground" />
                                                                                                                                                                                  <span className="text-xs text-muted-foreground">{venue.city ?? venue.address}</span>span>
                                                                                                                                                                                  <span className="text-muted-foreground/40 mx-1">·</span>span>
                                                                                                                                                                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                                                                                                                                                                  <span className="text-xs text-muted-foreground">{cfg.timeHint}</span>span>
                                                                                                                                                        </div>div>
                                                                                                                              </div>div>
                                                                                                      </div>div>
                                                                                                    <div className="flex flex-wrap gap-1.5">
                                                                                                      {venue.atmosphere_tags.slice(0, 3).map((tag) => (
                                                                                      <Badge key={tag} variant="outline" className="text-[11px] px-2 py-0.5 bg-secondary/50 border-border/40 capitalize">
                                                                                        {tag}
                                                                                        </Badge>Badge>
                                                                                    ))}
                                                                                                      </div>div>
                                                                                                    <div className="flex items-center justify-between pt-1">
                                                                                                                            <Button
                                                                                                                                                        size="sm"
                                                                                                                                                        variant="outline"
                                                                                                                                                        onClick={() => handleSelectPlan({ venue, rhythm })}
                                                                                                                                                      >
                                                                                                                                                      Choose <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                                                                                                              </Button>Button>
                                                                                                                            <Button
                                                                                                                                                        variant={isSaved ? 'default' : 'outline'}
                                                                                                                                                        size="sm"
                                                                                                                                                        onClick={() => handleSaveVenue(venue.id)}
                                                                                                                                                        className="gap-1.5"
                                                                                                                                                      >
                                                                                                                              {isSaved
                                                                                                                                                            ? <><BookmarkCheck className="w-3.5 h-3.5" /> Saved</>>
                                                                                                                                                            : <><Bookmark className="w-3.5 h-3.5" /> Save</>>
                                                                                                                                }
                                                                                                                              </Button>Button>
                                                                                                      </div>div>
                                                                              </CardContent>CardContent>
                                                          </Card>Card>
                                                        );
                    })}
                                          </div>div>
                              </div>div>
                    </div>div>
                )}
          
            {/* Saved plans */}
                <div className="px-6 pb-10">
                        <div className="max-w-4xl mx-auto space-y-4">
                                  <div className="flex items-center gap-2">
                                              <BookmarkCheck className="w-4 h-4 text-primary" />
                                              <h2 className="text-lg font-semibold text-foreground">Your Saved Plans</h2>h2>
                                  </div>div>
                          {savedVenueIds.length === 0 ? (
                        <Card className="border border-dashed border-border/60">
                                      <CardContent className="p-6 text-center">
                                  <Bookmark className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                                                      <p className="text-sm text-muted-foreground">
                                                                        No saved plans yet. Tap <span className="font-medium text-foreground">Save</span>span> on any venue above.
                                                      </p>p>
                                      </CardContent>CardContent>
                        </Card>Card>
                      ) : (
                        <div className="grid gap-3">
                          {suggestedVenues
                                            .filter(({ venue }) => savedVenueIds.includes(venue.id))
                                            .map(({ venue, rhythm }) => {
                                                                const cfg = rhythmConfig[rhythm];
                                                                return (
                                                                                      <Card key={venue.id} className="border border-primary/20 bg-primary/[0.03]">
                                                                                                            <CardContent className="p-4 flex items-center gap-4">
                                                                                                                                    <div className="flex-1 min-w-0">
                                                                                                                                                              <div className="font-medium text-foreground text-sm">{venue.name}</div>div>
                                                                                                                                                              <div className="flex items-center gap-1.5 mt-0.5">
                                                                                                                                                                                          <span className="text-xs text-muted-foreground">{venue.city ?? venue.address}</span>span>
                                                                                                                                                                                          <span className="text-muted-foreground/40">·</span>span>
                                                                                                                                                                                          <span className={`text-xs font-medium ${cfg.accent}`}>{cfg.label}</span>span>
                                                                                                                                                                </div>div>
                                                                                                                                      </div>div>
                                                                                                                                    <Button
                                                                                                                                                                variant="ghost"
                                                                                                                                                                size="icon"
                                                                                                                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                                                                                                                onClick={() => handleSaveVenue(venue.id)}
                                                                                                                                                              >
                                                                                                                                                              <X className="w-4 h-4" />
                                                                                                                                      </Button>Button>
                                                                                                              </CardContent>CardContent>
                                                                                        </Card>Card>
                                                                                    );
                                            })}
                        </div>div>
                                  )}
                        </div>div>
                </div>div>
          
            {/* Confirmation modal */}
                <AnimatePresence>
                  {showConfirmation && selectedPlan && (
                      <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                                    onClick={() => setShowConfirmation(false)}
                                  >
                                  <motion.div
                                                  initial={{ scale: 0.95, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                  exit={{ scale: 0.95, opacity: 0 }}
                                                  onClick={(e) => e.stopPropagation()}
                                                  className="w-full max-w-md"
                                                >
                                                <Card className="border-primary/20 bg-card">
                                                                <CardContent className="p-6 space-y-6">
                                                                                  <div className="text-center">
                                                                                                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${rhythmConfig[selectedPlan.rhythm].bg} flex items-center justify-center`}>
                                                                                                        {(() => { const Icon = rhythmConfig[selectedPlan.rhythm].icon; return <Icon className={`w-8 h-8 ${rhythmConfig[selectedPlan.rhythm].accent}`} />; })()}
                                                                                                        </div>div>
                                                                                                      <h3 className="text-xl font-semibold text-foreground">{selectedPlan.venue.name}</h3>h3>
                                                                                                      <p className="text-muted-foreground mt-1 text-sm">{selectedPlan.venue.address}</p>p>
                                                                                    </div>div>
                                                                
                                                                                  <div className="p-4 rounded-xl bg-secondary border-2 border-border">
                                                                                                      <div className="flex items-center gap-2 mb-3">
                                                                                                                            <Shield className="w-5 h-5 text-foreground" />
                                                                                                                            <span className="font-semibold text-foreground">Wrapped in care</span>span>
                                                                                                        </div>div>
                                                                                                      <ul className="space-y-2">
                                                                                                        {rhythmConfig[selectedPlan.rhythm].careFeatures.map((f) => (
                                                                          <li key={f} className="flex items-center gap-2 text-sm text-foreground/70 font-medium">
                                                                                                    <Check className="w-4 h-4 text-primary" />{f}
                                                                          </li>li>
                                                                        ))}
                                                                                                                            <li className="flex items-center gap-2 text-sm text-foreground/70 font-medium">
                                                                                                                                                    <Check className="w-4 h-4 text-primary" />Shared itinerary with your safety contact
                                                                                                                              </li>li>
                                                                                                                            <li className="flex items-center gap-2 text-sm text-foreground/70 font-medium">
                                                                                                                                                    <Check className="w-4 h-4 text-primary" />Visible SOS throughout the date
                                                                                                                              </li>li>
                                                                                                        </ul>ul>
                                                                                    </div>div>
                                                                
                                                                                  <div className="p-4 rounded-xl bg-secondary border-2 border-border">
                                                                                                      <div className="flex items-center gap-2 mb-2">
                                                                                                                            <MessageCircle className="w-5 h-5 text-foreground" />
                                                                                                                            <span className="font-semibold text-foreground">After the meet</span>span>
                                                                                                        </div>div>
                                                                                                      <p className="text-sm text-foreground/70 font-medium">
                                                                                                                            We'll close the loop — next step if it clicked, kind close if it didn't. No limbo. No ghosting.
                                                                                                        </p>p>
                                                                                    </div>div>
                                                                
                                                                                  <div className="flex gap-3">
                                                                                                      <Button variant="outline" className="flex-1" onClick={() => setShowConfirmation(false)}>
                                                                                                                            Back
                                                                                                        </Button>Button>
                                                                                                      <Button className="flex-1" onClick={handleConfirmPlan}>
                                                                                                                            Confirm Plan <ArrowRight className="w-4 h-4 ml-2" />
                                                                                                        </Button>Button>
                                                                                    </div>div>
                                                                </CardContent>CardContent>
                                                </Card>Card>
                                  </motion.div>motion.div>
                      </motion.div>motion.div>
                    )}
                </AnimatePresence>AnimatePresence>
          
            {/* Anti-Ghosting showcase */}
                <div className="px-6 pb-12">
                        <div className="max-w-4xl mx-auto">
                                  <Card className="overflow-hidden border-2 border-border bg-card shadow-elevated rounded-2xl">
                                              <CardContent className="p-6">
                                                            <div className="flex items-center gap-3 mb-6">
                                                                            <div className="w-12 h-12 rounded-xl bg-secondary border-2 border-border flex items-center justify-center">
                                                                                              <Ghost className="w-6 h-6 text-foreground" />
                                                                            </div>div>
                                                                            <div className="flex-1">
                                                                                              <div className="flex items-center gap-2">
                                                                                                                  <span className="text-xs font-semibold text-foreground bg-secondary border border-border rounded-full px-3 py-1 flex items-center gap-1">
                                                                                                                                        <X className="w-3 h-3" /> Anti-Ghosting
                                                                                                                    </span>span>
                                                                                                                  <span className="text-[10px] font-medium text-muted-foreground bg-card border border-border rounded-full px-2 py-0.5">Built-in</span>span>
                                                                                                </div>div>
                                                                                              <h3 className="text-xl font-semibold text-foreground mt-1">Close the Loop</h3>h3>
                                                                            </div>div>
                                                            </div>div>
                                                            <p className="text-foreground/70 font-medium mb-6">
                                                                            After every meet, we help both people move forward — no awkward drift, no wondering what happened.
                                                            </p>p>
                                                            <div className="space-y-4">
                                                                            <div className="p-4 rounded-xl bg-secondary border-2 border-border">
                                                                                              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
                                                                                                                  <span className="w-5 h-5 rounded-full bg-card border border-border text-foreground flex items-center justify-center text-xs font-bold">1</span>span>
                                                                                                                  After-Action Check-in
                                                                                                </div>div>
                                                                                              <p className="text-foreground font-semibold mb-3">How did it feel?</p>p>
                                                                                              <div className="flex flex-wrap gap-2">
                                                                                                                  <span className="bg-card border-2 border-border rounded-xl px-4 py-2 text-sm font-semibold text-foreground cursor-pointer hover:shadow-md transition-all flex items-center gap-2">
                                                                                                                                        <Zap className="w-4 h-4" /> Great energy
                                                                                                                    </span>span>
                                                                                                                  <span className="bg-card border-2 border-border rounded-xl px-4 py-2 text-sm font-semibold text-foreground cursor-pointer hover:shadow-md transition-all">Neutral</span>span>
                                                                                                                  <span className="bg-card border-2 border-border rounded-xl px-4 py-2 text-sm font-semibold text-foreground/70 cursor-pointer hover:shadow-md transition-all">Not a fit</span>span>
                                                                                                </div>div>
                                                                            </div>div>
                                                                            <div className="grid sm:grid-cols-2 gap-4">
                                                                                              <div className="p-4 rounded-xl bg-secondary border-2 border-border">
                                                                                                                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
                                                                                                                                        <span className="w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold">2A</span>span>
                                                                                                                                        If it clicked...
                                                                                                                    </div>div>
                                                                                                                  <div className="p-3 rounded-xl bg-card border-2 border-border">
                                                                                                                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                                                                                                                                                <Coffee className="w-4 h-4" />
                                                                                                                                                                <span className="font-semibold">Next step:</span>span>
                                                                                                                                          </div>div>
                                                                                                                                        <p className="text-foreground/60 text-sm mt-1 italic font-medium">"Coffee Sunday 11:00?"</p>p>
                                                                                                                    </div>div>
                                                                                                                  <Button size="sm" className="w-full mt-3 font-semibold">
                                                                                                                                        <ArrowRight className="w-4 h-4 mr-2" /> Keep it going
                                                                                                                    </Button>Button>
                                                                                                </div>div>
                                                                                              <div className="p-4 rounded-xl bg-secondary border-2 border-border">
                                                                                                                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground/70">
                                                                                                                                        <span className="w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold text-foreground">2B</span>span>
                                                                                                                                        If not a match...
                                                                                                                    </div>div>
                                                                                                                  <div className="p-3 rounded-xl bg-card border-2 border-border">
                                                                                                                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                                                                                                                                                <Heart className="w-4 h-4 text-foreground/60" />
                                                                                                                                                                <span className="font-semibold">Kind close:</span>span>
                                                                                                                                          </div>div>
                                                                                                                                        <p className="text-foreground/60 text-sm mt-1 italic font-medium">"Thanks for meeting, not a match but wishing you well!"</p>p>
                                                                                                                    </div>div>
                                                                                                                  <Button size="sm" variant="outline" className="w-full mt-3 border-2 border-border font-semibold text-foreground hover:bg-secondary">
                                                                                                                                        <Check className="w-4 h-4 mr-2" /> End gracefully
                                                                                                                    </Button>Button>
                                                                                                </div>div>
                                                                            </div>div>
                                                                            <div className="p-4 rounded-xl bg-secondary border-2 border-border text-center">
                                                                                              <p className="text-sm text-foreground font-semibold">Two taps. Everyone knows where they stand.</p>p>
                                                                                              <p className="text-xs text-foreground/60 font-medium mt-1">No limbo. No ghosting. Just clarity.</p>p>
                                                                            </div>div>
                                                            </div>div>
                                              </CardContent>CardContent>
                                  </Card>Card>
                        </div>div>
                </div>div>
          </div>div>
        );
};
</></></></></div>

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Compass,
  Heart,
  MapPin,
  Clock,
  Zap,
  Star,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useItineraries, Itinerary } from '@/hooks/useItineraries';
import { useVenues } from '@/hooks/useVenues';
import { useRIF, normalizeRIFScore } from '@/hooks/useRIF';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type RhythmMode = 'reset' | 'spark' | 'stretch';

interface RhythmConfig {
  id: RhythmMode;
  label: string;
  icon: React.FC<{ className?: string }>;
  description: string;
  pillarHint: string;
}

const RHYTHM_MODES: RhythmConfig[] = [
  {
    id: 'reset',
    icon: Heart,
    label: 'Reset',
    description: 'Low-key, restorative energy. Best when you need connection without pressure.',
    pillarHint: 'pacing_preferences',
  },
  {
    id: 'spark',
    icon: Zap,
    label: 'Spark',
    description: 'Energising and playful. Great for first dates or rekindling.',
    pillarHint: 'emotional_readiness',
  },
  {
    id: 'stretch',
    icon: Star,
    label: 'Stretch',
    description: 'Adventurous and growth-oriented. Push comfort zones together.',
    pillarHint: 'growth_orientation',
  },
];

function defaultRhythmFromRIF(rifScores: Record<string, number>): RhythmMode {
  const pacing = rifScores.pacing_preferences ?? 50;
  const growth = rifScores.growth_orientation ?? 50;
  const emotional = rifScores.emotional_readiness ?? 50;
  if (pacing >= 65) return 'reset';
  if (growth >= 65) return 'stretch';
  if (emotional >= 55) return 'spark';
  return 'reset';
}

const statusColors: Record<string, string> = {
  proposed: 'bg-primary/10 text-primary border-primary/20',
  confirmed: 'bg-green-500/10 text-green-700 border-green-500/20',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const ItineraryCard: React.FC<{
  itinerary: Itinerary;
  venues: any[];
  onStatusChange: (id: string, status: Itinerary['status']) => void;
}> = ({ itinerary, venues, onStatusChange }) => {
  const start = new Date(itinerary.time_window?.start ?? itinerary.created_at);
  const formattedDate = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formattedTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const locationName = itinerary.location_data?.venue_name ?? itinerary.location_data?.name ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm hover:border-primary/25 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColors[itinerary.status] ?? statusColors.proposed}`}>
          {itinerary.status}
        </span>
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
      </div>
      <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1">{itinerary.title}</h3>
      {itinerary.description && (
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{itinerary.description}</p>
      )}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formattedTime}</span>
        {locationName && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{locationName}</span>}
      </div>
      {itinerary.status === 'proposed' && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs border-primary/30 text-primary hover:bg-primary/5" onClick={() => onStatusChange(itinerary.id, 'confirmed')}>Confirm</Button>
          <Button size="sm" variant="ghost" className="flex-1 h-8 text-xs text-muted-foreground hover:text-destructive" onClick={() => onStatusChange(itinerary.id, 'cancelled')}>Cancel</Button>
        </div>
      )}
      {itinerary.status === 'confirmed' && (
        <Button size="sm" className="w-full h-8 text-xs" onClick={() => onStatusChange(itinerary.id, 'completed')}>Mark Completed</Button>
      )}
    </motion.div>
  );
};

const EmptyState: React.FC<{ onNavigateCompass: () => void }> = ({ onNavigateCompass }) => (
  <div className="text-center py-16 bg-card rounded-2xl border border-border/60">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
      <Calendar className="w-7 h-7 text-primary" />
    </div>
    <p className="font-serif italic text-foreground text-xl mb-2">No date plans yet.</p>
    <p className="text-sm text-muted-foreground font-body max-w-xs mx-auto mb-6 leading-relaxed">
      Use Compass to find venues matched to your RIF profile, then save a plan here to track it.
    </p>
    <button
      onClick={onNavigateCompass}
      className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-body font-medium text-xs tracking-[0.15em] uppercase rounded-[40px] hover:bg-primary/90 transition-all"
    >
      <Compass className="w-4 h-4" />
      Open Compass
    </button>
  </div>
);

const PILLAR_LABELS: Record<string, string> = {
  pacing_preferences: 'Pacing Preference',
  emotional_readiness: 'Emotional Readiness',
  growth_orientation: 'Growth Orientation',
};

const RhythmTooltip: React.FC<{ pillarScore: number; pillarLabel: string }> = ({ pillarScore, pillarLabel }) => {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button onClick={() => setOpen((v) => !v)} className="p-1 rounded-full text-muted-foreground/60 hover:text-primary transition-colors" aria-label="Why this rhythm?">
        <Info className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute bottom-full left-0 mb-2 w-60 bg-card border border-border rounded-xl p-3 z-50 shadow-lg">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your <span className="font-semibold text-foreground">{pillarLabel}</span> RIF score is{' '}
              <span className="font-semibold text-primary">{pillarScore}</span>. This rhythm was pre-selected because it aligns with where you are right now. Switch freely to explore other energy modes.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

interface DatePlansTabProps {
  onNavigateCompass?: () => void;
}

export const DatePlansTab: React.FC<DatePlansTabProps> = ({ onNavigateCompass }) => {
  const { user } = useAuth();
  const { rifProfile } = useRIF();
  const { venues } = useVenues();
  const { itineraries, loading, updateStatus, getUpcomingItineraries, getCompletedItineraries, refetch } = useItineraries();

  const rifScores = {
    pacing_preferences: rifProfile ? normalizeRIFScore(rifProfile.pacing_preferences) : 50,
    emotional_readiness: rifProfile ? normalizeRIFScore(rifProfile.emotional_readiness) : 50,
    growth_orientation: rifProfile ? normalizeRIFScore(rifProfile.boundary_respect) : 50,
  };
  const rifDerivedMode = defaultRhythmFromRIF(rifScores);

  const [rhythmMode, setRhythmMode] = useState<RhythmMode>(rifDerivedMode);
  const [activeSection, setActiveSection] = useState<'upcoming' | 'completed'>('upcoming');

  const activeRhythmConfig = RHYTHM_MODES.find((r) => r.id === rhythmMode)!;
  const pillarScore = rifScores[activeRhythmConfig.pillarHint as keyof typeof rifScores] ?? 50;

  const filterByRhythm = (items: Itinerary[]): Itinerary[] => {
    if (!rifProfile) return items;
    return items.filter((it) => {
      const tag = it.location_data?.rhythm as string | undefined;
      if (tag) return tag === rhythmMode;
      const title = it.title.toLowerCase();
      if (rhythmMode === 'reset') return title.includes('coffee') || title.includes('walk') || title.includes('gallery') || title.includes('quiet');
      if (rhythmMode === 'stretch') return title.includes('adventure') || title.includes('hike') || title.includes('class') || title.includes('new');
      return true;
    });
  };

  const upcoming = filterByRhythm(getUpcomingItineraries());
  const completed = filterByRhythm(getCompletedItineraries());
  const displayItems = activeSection === 'upcoming' ? upcoming : completed;

  React.useEffect(() => {
    const handler = async (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!user?.id || !detail?.title) return;
      const now = new Date();
      const locationData: Record<string, string> = { location_type: detail.location_type ?? '', rhythm: rhythmMode };
      if (detail.venue) {
        locationData.venue_name = detail.venue.name;
        locationData.venue_id = detail.venue.id;
        if (detail.venue.city) locationData.city = detail.venue.city;
      }
      const { error } = await supabase.from('itineraries').insert({
        user_id: user.id,
        mode: 'byo',
        title: detail.title,
        description: detail.description ?? (detail.vibe ? `${detail.vibe} · ${detail.time_suggestion ?? ''}` : null),
        time_window: { start: now.toISOString(), end: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString() },
        location_data: locationData,
        status: 'proposed',
        safety_sharing_enabled: false,
        sos_visible: false,
        consent_nudge_shown: false,
      });
      if (error) { toast.error('Could not save plan'); } else { toast.success('Plan saved to Date Plans!'); refetch(); }
    };
    window.addEventListener('monark-save-plan', handler);
    return () => window.removeEventListener('monark-save-plan', handler);
  }, [user?.id, rhythmMode, refetch]);

  return (
    <div className="min-h-full bg-background">
      <div className="px-5 pt-6 pb-4 border-b border-border/40">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-caption text-primary tracking-widest uppercase">Smart Date Planner</span>
        </div>
        <h1 className="font-serif text-2xl font-semibold text-foreground leading-tight">My Date Plans</h1>
        <p className="text-sm text-muted-foreground mt-1 leading-snug">Plans saved from Compass — confirmed or waiting, all in one place.</p>
        <div className="flex gap-1 mt-4 bg-muted rounded-xl p-1 w-fit">
          {(['upcoming', 'completed'] as const).map((s) => (
            <button key={s} onClick={() => setActiveSection(s)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeSection === s ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {s === 'upcoming' ? `Upcoming (${getUpcomingItineraries().length})` : `Completed (${getCompletedItineraries().length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5 pb-10 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-caption text-muted-foreground/60 uppercase tracking-widest">Rhythm Filter</p>
            {rifProfile && <RhythmTooltip pillarScore={pillarScore} pillarLabel={PILLAR_LABELS[activeRhythmConfig.pillarHint] ?? activeRhythmConfig.pillarHint} />}
          </div>
          <div className="flex gap-2 flex-wrap">
            {RHYTHM_MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = rhythmMode === mode.id;
              const isDefault = mode.id === rifDerivedMode;
              return (
                <button key={mode.id} onClick={() => setRhythmMode(mode.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${isActive ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/20 hover:text-foreground'}`}>
                  <Icon className="w-3 h-3" />
                  {mode.label}
                  {isDefault && !isActive && <span className="text-[8px] font-caption text-primary/60 bg-primary/10 rounded-full px-1">RIF</span>}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{activeRhythmConfig.description}</p>
        </div>

        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onNavigateCompass} className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Compass className="w-4 h-4 text-primary" /></div>
            <div>
              <p className="text-xs font-semibold text-foreground">Discover via Compass</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Venues matched to your RIF reading → save here instantly</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-primary shrink-0" />
        </motion.button>

        {loading ? (
          <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />)}</div>
        ) : displayItems.length > 0 ? (
          <div className="space-y-3">
            {displayItems.map((itinerary) => (
              <ItineraryCard key={itinerary.id} itinerary={itinerary} venues={venues} onStatusChange={async (id, status) => { await updateStatus(id, status); refetch(); }} />
            ))}
          </div>
        ) : (
          <EmptyState onNavigateCompass={onNavigateCompass ?? (() => {})} />
        )}
      </div>
    </div>
  );
};

export default DatePlansTab;

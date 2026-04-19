import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, MapPin, Heart, Flame, Star, ArrowRight, Info, Navigation } from 'lucide-react';
import { VenueRecommendationStrip } from '@/components/date-concierge/VenueRecommendationStrip';
import { AIConciergeModal } from '@/components/date-concierge/AIConciergeModal';
import { useVenues } from '@/hooks/useVenues';
import { useVenueRecommendations } from '@/hooks/useVenueRecommendations';
import { useRIF, normalizeRIFScore } from '@/hooks/useRIF';
import { useAuth } from '@/hooks/useAuth';
import type { RIFScores } from '@/lib/venueMatching';

// ─── Compass Vocabulary ────────────────────────────────────────────────────
// Reading  — the live 0-100 RIF-to-venue alignment score
// Bearing  — directional label derived from Reading (True North, North, etc.)
// True North — the single highest-scoring venue
// Drift   — signal-boosted upgrade from conversation context
// Lock    — a venue matching ALL active RIF pillars (score > 65)
// Pulse   — the 0-1 confidence score from conversation signals
// ──────────────────────────────────────────────────────────────────────────

const RIF_PILLAR_LABELS: Record<string, string> = {
  emotional_intelligence: 'Emotional Intelligence',
  communication_style: 'Communication Style',
  lifestyle_alignment: 'Lifestyle Alignment',
  relationship_readiness: 'Relationship Readiness',
  growth_orientation: 'Growth Orientation',
};

const PILLAR_SHORT: Record<string, string> = {
  emotional_intelligence: 'Emotional',
  communication_style: 'Communication',
  lifestyle_alignment: 'Lifestyle',
  relationship_readiness: 'Readiness',
  growth_orientation: 'Growth',
};

function bearingLabel(score: number): string {
  if (score >= 85) return 'True North';
  if (score >= 70) return 'North';
  if (score >= 55) return 'North-East';
  if (score >= 40) return 'East';
  return 'Calibrating';
}

// ─── Animated compass rose ─────────────────────────────────────────────────
const CompassRose: React.FC<{ reading: number; pulse: number }> = ({ reading, pulse }) => {
  const deg = Math.round((reading / 100) * 270 - 135);
  const cardinals = ['N', 'E', 'S', 'W'] as const;
  return (
    <div className="relative flex items-center justify-center" aria-hidden="true">
      <div
        className="absolute rounded-full border border-primary/20"
        style={{
          width: 180, height: 180,
          boxShadow: pulse > 0.3 ? `0 0 ${Math.round(pulse * 32)}px rgba(140,120,90,0.22)` : undefined,
          transition: 'box-shadow 0.8s ease',
        }}
      />
      <div
        className="w-40 h-40 rounded-full bg-card border-2 border-border flex items-center justify-center relative"
        style={{ boxShadow: 'var(--shadow-elevated)' }}
      >
        {cardinals.map((dir, i) => {
          const rad = (i * 90 - 90) * (Math.PI / 180);
          const r = 52;
          return (
            <span
              key={dir}
              className="absolute text-[9px] font-caption text-muted-foreground/60 select-none"
              style={{
                left: '50%', top: '50%',
                transform: `translate(calc(-50% + ${Math.cos(rad) * r}px), calc(-50% + ${Math.sin(rad) * r}px))`,
              }}
            >
              {dir}
            </span>
          );
        })}
        <motion.div
          className="absolute w-0.5 rounded-full origin-bottom"
          style={{ height: 44, bottom: '50%', left: '50%', marginLeft: -1 }}
          animate={{ rotate: deg }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
        >
          <div className="w-full h-1/2 bg-primary rounded-t-full" />
          <div className="w-full h-1/2 bg-muted-foreground/40 rounded-b-full" />
        </motion.div>
        <div className="absolute w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-card z-10" />
        <div className="absolute bottom-4 flex flex-col items-center pointer-events-none">
          <span className="text-xl font-serif font-semibold text-foreground leading-none">{reading}</span>
          <span className="text-[8px] font-caption text-muted-foreground/60 mt-0.5">READING</span>
        </div>
      </div>
    </div>
  );
};

// ─── Pillar pill ────────────────────────────────────────────────────────────
const PillarPill: React.FC<{ pillar: string; score: number; active: boolean }> = ({ pillar, score, active }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
      active ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-card border-border text-muted-foreground'
    }`}
  >
    {active && <Star className="w-2.5 h-2.5 fill-primary text-primary shrink-0" />}
    <span className="text-[11px] font-medium">{PILLAR_SHORT[pillar] ?? pillar}</span>
    <span className={`text-[10px] font-caption ${active ? 'text-primary/80' : 'text-muted-foreground/60'}`}>{score}</span>
  </motion.div>
);

// ─── Tappable vocabulary term ───────────────────────────────────────────────
const CompassTerm: React.FC<{ term: string; def: string }> = ({ term, def }) => {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center gap-0.5">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-0.5 text-primary/80 underline underline-offset-2 decoration-dotted text-xs font-medium focus:outline-none"
      >
        {term}
        <Info className="w-2.5 h-2.5 opacity-50" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-2 w-56 bg-card border border-border rounded-xl p-3 z-50"
            style={{ boxShadow: 'var(--shadow-elevated)' }}
          >
            <p className="text-xs text-muted-foreground leading-relaxed">{def}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

// ─── How It Works data ──────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    icon: Compass,
    heading: 'Your Reading',
    body: 'We calculate a 0-100 alignment score from your five RIF pillars and map it onto a compass bearing.',
    term: 'Reading',
    def: 'A live 0-100 score representing how strongly your RIF profile aligns with the available venues right now.',
  },
  {
    icon: Navigation,
    heading: 'True North',
    body: 'The single venue where all your top pillars converge — your highest-confidence pick. Updates as your scores evolve.',
    term: 'True North',
    def: 'The venue that scores highest across every one of your active RIF pillars. Think of it as the destination your compass naturally points toward.',
  },
  {
    icon: Flame,
    heading: 'Drift',
    body: 'When launched from an active chat, conversation signals silently boost relevant venues — shifting your bearing without replacing it.',
    term: 'Drift',
    def: 'A signal-weighted adjustment to your base reading, triggered by keywords and vibes detected in your conversation.',
  },
  {
    icon: Heart,
    heading: 'Lock',
    body: 'A venue earns a Lock when it matches every one of your top-scoring pillars simultaneously. Rare — and worth acting on.',
    term: 'Lock',
    def: 'The highest-confidence venue designation. A Lock means the venue aligns with 3 or more of your active RIF pillars above the 65-point threshold.',
  },
];

// ─── CompassPage ────────────────────────────────────────────────────────────
interface CompassPageProps {
  conversationId?: string;
  matchUserId?: string;
  matchName?: string;
}

export const CompassPage: React.FC<CompassPageProps> = ({
  conversationId = '',
  matchUserId = '',
  matchName = '',
}) => {
  const { user } = useAuth();
  const { rifProfile } = useRIF();
  const { venues } = useVenues();
  const [showConcierge, setShowConcierge] = useState(false);
  const [activeSection, setActiveSection] = useState<'compass' | 'how'>('compass');

  const rifScores: RIFScores = {
    emotional_intelligence: rifProfile ? normalizeRIFScore(rifProfile.emotional_readiness) : 50,
    communication_style: rifProfile ? normalizeRIFScore(rifProfile.intent_clarity) : 50,
    lifestyle_alignment: rifProfile ? normalizeRIFScore(rifProfile.pacing_preferences) : 50,
    relationship_readiness: rifProfile ? normalizeRIFScore(rifProfile.post_date_alignment) : 50,
    growth_orientation: rifProfile ? normalizeRIFScore(rifProfile.boundary_respect) : 50,
  };

  const { venues: recommended, loading, confidence } = useVenueRecommendations({
    conversationId,
    userId: user?.id ?? '',
    rifScores,
    venues,
    limit: 3,
  });

  const pillarEntries = Object.entries(rifScores) as [keyof RIFScores, number][];
  const activePillars = pillarEntries.filter(([, v]) => v > 65);
  const reading =
    activePillars.length > 0
      ? Math.round(activePillars.reduce((s, [, v]) => s + v, 0) / activePillars.length)
      : Math.round(pillarEntries.reduce((s, [, v]) => s + v, 0) / pillarEntries.length);

  const bearing = bearingLabel(reading);
  const hasDrift = Boolean(conversationId) && confidence > 0.3;
  const trueNorth = recommended[0] ?? null;
  const isLock =
    trueNorth &&
    trueNorth.rif_affinity.filter((p) => (rifScores[p as keyof RIFScores] ?? 0) > 65).length >= 3;

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-border/40">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-caption text-primary tracking-widest uppercase">
            Smart Date Planner
          </span>
        </div>
        <h1 className="font-serif text-2xl font-semibold text-foreground leading-tight">Compass</h1>
        <p className="text-sm text-muted-foreground mt-1 leading-snug">
          {matchName
            ? `Your shared bearing with ${matchName}`
            : 'Your relational bearing, mapped to where you should be tonight'}
        </p>
        <div className="flex gap-1 mt-4 bg-muted rounded-xl p-1 w-fit">
          {(['compass', 'how'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSection === s
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'compass' ? 'Your Reading' : 'How It Works'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'compass' && (
          <motion.div
            key="compass"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="px-5 pt-6 space-y-8 pb-10"
          >
            {/* Rose + bearing */}
            <div className="flex flex-col items-center gap-4">
              <CompassRose reading={reading} pulse={confidence} />
              <div className="text-center">
                <p className="text-[10px] font-caption text-muted-foreground/60 tracking-widest uppercase mb-1">
                  Current Bearing
                </p>
                <h2 className="font-serif text-3xl font-semibold text-foreground">{bearing}</h2>
                {hasDrift && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-1 mt-1 text-[10px] font-caption text-primary/70 tracking-wide"
                  >
                    <Flame className="w-2.5 h-2.5" />
                    DRIFT ACTIVE · {Math.round(confidence * 100)}% PULSE
                  </motion.p>
                )}
              </div>
            </div>

            {/* Active pillars */}
            <div>
              <p className="text-[10px] font-caption text-muted-foreground/60 uppercase tracking-widest mb-3">
                Your Active Pillars
              </p>
              <div className="flex flex-wrap gap-2">
                {pillarEntries.map(([pillar, score]) => (
                  <PillarPill key={pillar} pillar={pillar} score={score} active={score > 65} />
                ))}
              </div>
              {activePillars.length === 0 && (
                <p className="text-xs text-muted-foreground italic mt-2">
                  Complete your RIF assessment to activate your pillars.
                </p>
              )}
            </div>

            {/* True North card */}
            {trueNorth && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-[10px] font-caption text-muted-foreground/60 uppercase tracking-widest">
                    True North
                  </p>
                  {isLock && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                      <Star className="w-2.5 h-2.5 fill-primary text-primary" />
                      <span className="text-[9px] font-caption text-primary tracking-wider">LOCK</span>
                    </span>
                  )}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-primary/20 rounded-2xl p-4"
                  style={{ boxShadow: 'var(--shadow-editorial)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-base font-semibold text-foreground leading-tight line-clamp-1">
                        {trueNorth.name}
                      </h3>
                      {trueNorth.partner_group && (
                        <p className="text-[10px] font-caption text-muted-foreground/60 uppercase tracking-wide mt-0.5">
                          {trueNorth.partner_group}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <MapPin className="w-3 h-3 text-primary" />
                      <span className="text-xs text-muted-foreground">{trueNorth.city ?? 'Chicago'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {trueNorth.atmosphere_tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground capitalize"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {trueNorth.rif_affinity.length > 0 && (
                    <p className="text-[10px] text-primary/70 mt-2 leading-snug">
                      Aligns with{' '}
                      <span className="font-medium text-primary">
                        {trueNorth.rif_affinity
                          .filter((p) => (rifScores[p as keyof RIFScores] ?? 0) > 65)
                          .map((p) => PILLAR_SHORT[p] ?? p)
                          .join(' + ')}
                      </span>
                    </p>
                  )}
                </motion.div>
              </div>
            )}

            {/* Your 3 strip */}
            <VenueRecommendationStrip
              venues={recommended}
              loading={loading}
              confidence={confidence}
              rifScores={rifScores}
              heading="Your 3"
            />

            {/* Plan a Date CTA */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowConcierge(true)}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-left"
              style={{ background: 'var(--gradient-cta)', boxShadow: 'var(--shadow-elevated)' }}
            >
              <div>
                <p className="text-[10px] font-caption text-primary-foreground/70 tracking-widest uppercase mb-0.5">
                  Ready to move?
                </p>
                <p className="font-serif text-base font-semibold text-primary-foreground">
                  {matchName ? `Plan a date with ${matchName}` : 'Open Smart Date Planner'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center shrink-0">
                <ArrowRight className="w-4 h-4 text-primary-foreground" />
              </div>
            </motion.button>

            {/* Vocabulary footnote */}
            <div className="border-t border-border/40 pt-4">
              <p className="text-[10px] font-caption text-muted-foreground/50 uppercase tracking-widest mb-2">
                Compass Vocabulary
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your{' '}
                <CompassTerm term="Reading" def="A live 0-100 score from your RIF pillars mapped to available venues." />
                {' '}sets your{' '}
                <CompassTerm term="Bearing" def="The directional label (True North, North-East, etc.) derived from your reading." />
                . Conversation signals create{' '}
                <CompassTerm term="Drift" def="A real-time adjustment to your base RIF picks when chat signals are detected." />
                {' '}and can produce a{' '}
                <CompassTerm term="Lock" def="When a venue matches all of your top RIF pillars simultaneously." />
                .
              </p>
            </div>
          </motion.div>
        )}

        {activeSection === 'how' && (
          <motion.div
            key="how"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="px-5 pt-6 space-y-4 pb-10"
          >
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              Compass translates your Relational Intelligence Framework into a live directional
              reading — pointing you toward the right space, at the right moment, for the right person.
            </p>

            {HOW_IT_WORKS.map(({ icon: Icon, heading, body, term, def }, i) => (
              <motion.div
                key={heading}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border rounded-2xl p-5"
                style={{ boxShadow: 'var(--shadow-gentle)' }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-base font-semibold text-foreground mb-1">{heading}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {body}{' '}
                      <CompassTerm term={term} def={def} />
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Five pillar legend */}
            <div className="bg-muted/50 rounded-2xl p-4 border border-border/40">
              <p className="text-[10px] font-caption text-muted-foreground/60 uppercase tracking-widest mb-3">
                Your Five Pillars
              </p>
              <div className="space-y-2">
                {pillarEntries.map(([pillar, score]) => (
                  <div key={pillar} className="flex items-center justify-between gap-3">
                    <span className="text-xs text-foreground/80 font-medium">
                      {RIF_PILLAR_LABELS[pillar]}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                        />
                      </div>
                      <span className="text-[10px] font-caption text-muted-foreground w-6 text-right">
                        {score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection('compass')}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/5 transition-colors"
            >
              <Compass className="w-4 h-4" />
              See my reading
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {showConcierge && (
        <AIConciergeModal
          isOpen={showConcierge}
          onClose={() => setShowConcierge(false)}
          matchUserId={matchUserId || user?.id || ''}
          matchName={matchName || 'your match'}
          conversationId={conversationId || 'standalone'}
        />
      )}
    </div>
  );
};

export default CompassPage;

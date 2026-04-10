/**
 * MonArk — RIF Quiz (Relational Intelligence Framework)
 * 15 questions across 5 dimensions, adapted for project conventions.
 */

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";

// ── TYPES ────────────────────────────────────

type Dimension = "IC" | "ER" | "PP" | "BR" | "PA";

interface RIFQuestion {
  id: string;
  dimension: Dimension;
  text: string;
  subtext?: string;
  options: { label: string; value: number }[];
}

export interface RIFAnswers {
  [questionId: string]: number;
}

export interface RIFScores {
  intent_clarity: number;
  emotional_readiness: number;
  pacing_preferences: number;
  boundary_respect: number;
  post_date_alignment: number;
}

// ── QUESTION BANK — 15 QUESTIONS ─────────────

export const RIF_QUESTIONS: RIFQuestion[] = [
  // Intent Clarity
  {
    id: "IC_1", dimension: "IC",
    text: "When you think about what you're looking for right now, how clear does that picture feel?",
    subtext: "There's no right answer — just what's true for you today.",
    options: [
      { label: "Very clear. I know exactly what I'm looking for.", value: 100 },
      { label: "Mostly clear, with some open questions.", value: 75 },
      { label: "Somewhere in between — exploring as I go.", value: 50 },
      { label: "Still figuring it out, and that feels okay.", value: 25 },
    ],
  },
  {
    id: "IC_2", dimension: "IC",
    text: "How do you feel about communicating what you want early in getting to know someone?",
    options: [
      { label: "Natural and important — I lead with honesty.", value: 100 },
      { label: "Comfortable once there's a little trust built.", value: 75 },
      { label: "A bit cautious — I prefer to read the room first.", value: 50 },
      { label: "Tend to wait and let things reveal themselves.", value: 25 },
    ],
  },
  {
    id: "IC_3", dimension: "IC",
    text: "If a connection isn't going where you hoped, how do you typically handle it?",
    options: [
      { label: "I address it directly and kindly.", value: 100 },
      { label: "I hint at it and see if they pick up on it.", value: 67 },
      { label: "I tend to let things fade naturally.", value: 33 },
      { label: "I usually wait for the other person to say something.", value: 10 },
    ],
  },
  // Emotional Readiness
  {
    id: "ER_1", dimension: "ER",
    text: "How present do you feel in your life right now — emotionally and mentally?",
    subtext: "Think about how you'd honestly show up on a first date this week.",
    options: [
      { label: "Very present. I'm in a good place.", value: 100 },
      { label: "Mostly grounded, with some things on my mind.", value: 75 },
      { label: "Managing a few things, but open to connection.", value: 50 },
      { label: "Going through something — still open, but aware.", value: 25 },
    ],
  },
  {
    id: "ER_2", dimension: "ER",
    text: "When you're on a date and something emotionally meaningful comes up, how do you tend to respond?",
    options: [
      { label: "I lean in — depth is what I'm here for.", value: 100 },
      { label: "I engage thoughtfully, at my own pace.", value: 75 },
      { label: "I listen well but keep my own depth private for now.", value: 50 },
      { label: "I prefer to keep things lighter early on.", value: 25 },
    ],
  },
  {
    id: "ER_3", dimension: "ER",
    text: "How do you typically process things after a date — good or not?",
    options: [
      { label: "I reflect and usually know how I feel fairly quickly.", value: 100 },
      { label: "I need a day or two to let things settle.", value: 75 },
      { label: "I talk it through with someone I trust.", value: 60 },
      { label: "I try not to overthink — I let it be what it was.", value: 40 },
    ],
  },
  // Pacing Preference
  {
    id: "PP_1", dimension: "PP",
    text: "How quickly do you like things to develop when there's a real connection?",
    subtext: "Think about the pace that feels natural and comfortable to you.",
    options: [
      { label: "Slowly and intentionally — I value the build.", value: 25 },
      { label: "Steady — meaningful but not rushed.", value: 75 },
      { label: "I follow the natural energy of the connection.", value: 100 },
      { label: "When it's right, I'm open to things moving quickly.", value: 60 },
    ],
  },
  {
    id: "PP_2", dimension: "PP",
    text: "When it comes to meeting in person for the first time, what feels right to you?",
    options: [
      { label: "I like to get to a real meeting fairly quickly.", value: 80 },
      { label: "A few conversations first, then I'm ready.", value: 100 },
      { label: "I prefer a longer warm-up before meeting.", value: 50 },
      { label: "I need to feel genuinely comfortable before meeting.", value: 25 },
    ],
  },
  {
    id: "PP_3", dimension: "PP",
    text: "How important is it that the other person matches your pacing preference?",
    options: [
      { label: "Very — mismatched pace is a dealbreaker for me.", value: 100 },
      { label: "Important, but I can adapt if the connection is strong.", value: 75 },
      { label: "Somewhat — I'd address it but could work through it.", value: 50 },
      { label: "Not very — I find I adjust naturally.", value: 25 },
    ],
  },
  // Boundary Respect
  {
    id: "BR_1", dimension: "BR",
    text: "How comfortable are you stating a boundary when you need to?",
    subtext: "No judgment here — just honest reflection.",
    options: [
      { label: "Very comfortable. I do it calmly and directly.", value: 100 },
      { label: "Comfortable, though it takes a little courage.", value: 75 },
      { label: "I can do it, but I often hesitate.", value: 50 },
      { label: "I struggle with it and tend to avoid the moment.", value: 25 },
    ],
  },
  {
    id: "BR_2", dimension: "BR",
    text: "When someone expresses a boundary or hesitation, what's your instinct?",
    options: [
      { label: "Respect it fully — no questions asked.", value: 100 },
      { label: "Honor it, and check in later if appropriate.", value: 85 },
      { label: "Try to understand the reason behind it.", value: 60 },
      { label: "Work to reassure them and keep things moving.", value: 20 },
    ],
  },
  {
    id: "BR_3", dimension: "BR",
    text: "How do you feel about physical and emotional boundaries being clearly named early in connection?",
    options: [
      { label: "I appreciate it — it creates safety.", value: 100 },
      { label: "I'm comfortable with it, though it depends on timing.", value: 75 },
      { label: "I prefer to let things emerge naturally.", value: 40 },
      { label: "It feels clinical to me — I prefer intuition.", value: 20 },
    ],
  },
  // Post-Date Alignment
  {
    id: "PA_1", dimension: "PA",
    text: "After a date that went well, what does your follow-through typically look like?",
    options: [
      { label: "I reach out the same day — connection matters.", value: 100 },
      { label: "Within a day or two, thoughtfully.", value: 85 },
      { label: "I wait for them to reach out first.", value: 40 },
      { label: "I keep it loose — no pressure on either side.", value: 25 },
    ],
  },
  {
    id: "PA_2", dimension: "PA",
    text: "If you realize after a date that it wasn't the right fit, what do you do?",
    options: [
      { label: "I let them know kindly and directly.", value: 100 },
      { label: "I send a gracious message ending things.", value: 85 },
      { label: "I gradually become less responsive.", value: 30 },
      { label: "I usually say nothing and hope it fades.", value: 10 },
    ],
  },
  {
    id: "PA_3", dimension: "PA",
    text: "How do you feel about the 'Close the Loop' principle — always acknowledging an experience, good or not?",
    subtext: "This is a core value at MonArk. We believe every connection deserves a response.",
    options: [
      { label: "Deeply aligned — it's how I already operate.", value: 100 },
      { label: "I believe in it and try to live it.", value: 85 },
      { label: "I agree but sometimes fall short.", value: 60 },
      { label: "I'm working on it — this is new for me.", value: 40 },
    ],
  },
];

// ── SCORING ENGINE ───────────────────────────

export function scoreRifAnswers(answers: RIFAnswers): RIFScores {
  const dimensionMap: Record<Dimension, keyof RIFScores> = {
    IC: "intent_clarity",
    ER: "emotional_readiness",
    PP: "pacing_preferences",
    BR: "boundary_respect",
    PA: "post_date_alignment",
  };

  const buckets: Record<Dimension, number[]> = { IC: [], ER: [], PP: [], BR: [], PA: [] };

  RIF_QUESTIONS.forEach((q) => {
    if (answers[q.id] !== undefined) buckets[q.dimension].push(answers[q.id]);
  });

  const result = {} as Record<keyof RIFScores, number>;
  (Object.keys(dimensionMap) as Dimension[]).forEach((dim) => {
    const vals = buckets[dim];
    result[dimensionMap[dim]] = vals.length > 0
      ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      : 0;
  });

  return result as RIFScores;
}

// ── SAVE TO SUPABASE ─────────────────────────

export async function saveRifProfile(
  userId: string,
  answers: RIFAnswers
): Promise<{ success: boolean; scores?: RIFScores; error?: string }> {
  const scores = scoreRifAnswers(answers);

  try {
    const { error: rifError } = await supabase
      .from("rif_profiles")
      .upsert({
        user_id: userId,
        intent_clarity: scores.intent_clarity,
        emotional_readiness: scores.emotional_readiness,
        pacing_preferences: scores.pacing_preferences,
        boundary_respect: scores.boundary_respect,
        post_date_alignment: scores.post_date_alignment,
        profile_version: 1,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (rifError) throw rifError;

    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        rif_quiz_answers: answers,
        onboarding_step: 4,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (profileError) throw profileError;

    const { error: queueError } = await supabase
      .from("curation_queue")
      .upsert({
        user_id: userId,
        needs_curation: true,
        priority: 1,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (queueError) throw queueError;

    await supabase.from("rif_event_log").insert([{
      user_id: userId,
      event_type: "rif_quiz_completed",
      event_data: { scores, answer_count: Object.keys(answers).length } as unknown as import('@/integrations/supabase/types').Json,
    }]);

    return { success: true, scores };
  } catch (err: any) {
    console.error("[RIF] Save failed:", err);
    return { success: false, error: err.message };
  }
}

// ── DIMENSION METADATA ───────────────────────

const DIMENSION_META: Record<Dimension, { label: string; description: string; colorClass: string }> = {
  IC: { label: "Intent Clarity", description: "How clearly you know what you're looking for.", colorClass: "text-primary" },
  ER: { label: "Emotional Readiness", description: "Your capacity to show up present and open.", colorClass: "text-accent" },
  PP: { label: "Pacing Preference", description: "The rhythm that feels natural to you.", colorClass: "text-[hsl(350,30%,62%)]" },
  BR: { label: "Boundary Respect", description: "How you hold and honor limits — yours and others'.", colorClass: "text-[hsl(22,38%,36%)]" },
  PA: { label: "Post-Date Alignment", description: "Your follow-through and communication after connection.", colorClass: "text-muted-foreground" },
};

const DIMENSION_ORDER: Dimension[] = ["IC", "ER", "PP", "BR", "PA"];

const DIM_BAR_COLORS: Record<Dimension, string> = {
  IC: "bg-primary",
  ER: "bg-accent",
  PP: "bg-[hsl(350,30%,62%)]",
  BR: "bg-[hsl(22,38%,36%)]",
  PA: "bg-muted-foreground",
};

// ── COMPONENT ────────────────────────────────

interface RIFQuizProps {
  userId: string;
  onComplete: (scores: RIFScores) => void;
  onSkip?: () => void;
}

export default function RIFQuiz({ userId, onComplete, onSkip }: RIFQuizProps) {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<RIFAnswers>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<"intro" | "quiz" | "saving" | "results">("intro");
  const [scores, setScores] = useState<RIFScores | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalQuestions = RIF_QUESTIONS.length;
  const currentQuestion = RIF_QUESTIONS[currentIndex];
  const progress = ((currentIndex) / totalQuestions) * 100;
  const currentDimension = currentQuestion?.dimension;
  const dimMeta = currentDimension ? DIMENSION_META[currentDimension] : null;
  const isFirstOfDimension =
    currentIndex === 0 || RIF_QUESTIONS[currentIndex - 1]?.dimension !== currentDimension;

  function handleSelect(value: number) {
    setSelected(value);
  }

  function handleNext() {
    if (selected === null) return;
    const updated = { ...answers, [currentQuestion.id]: selected };
    setAnswers(updated);
    setSelected(null);

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleSubmit(updated);
    }
  }

  function handleBack() {
    if (currentIndex === 0) {
      setPhase("intro");
      return;
    }
    setCurrentIndex((i) => i - 1);
    const prevQ = RIF_QUESTIONS[currentIndex - 1];
    setSelected(answers[prevQ.id] ?? null);
  }

  async function handleSubmit(finalAnswers: RIFAnswers) {
    setPhase("saving");
    const result = await saveRifProfile(userId, finalAnswers);
    if (!result.success) {
      setError(result.error || "Something went wrong. Please try again.");
      setPhase("quiz");
      return;
    }
    // Invalidate profile cache so RelationalProfileSection picks up rif_quiz_answers
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    const computed = scoreRifAnswers(finalAnswers);
    setScores(computed);
    setPhase("results");
  }

  useEffect(() => {
    if (currentQuestion) {
      setSelected(answers[currentQuestion.id] ?? null);
    }
  }, [currentIndex]);

  // ── INTRO ──────────────────────────────────
  if (phase === "intro") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background flex items-center justify-center p-6"
      >
        <div className="bg-card rounded-2xl p-10 max-w-[560px] w-full shadow-sm">
          <p className="font-serif text-lg tracking-[0.15em] text-primary border-b border-border pb-3 mb-6 inline-block">
            MA
          </p>
          <p className="font-body text-[11px] tracking-[0.2em] text-primary mb-3 uppercase">
            Relational Intelligence Framework
          </p>
          <h1 className="font-serif text-4xl font-normal text-foreground leading-[1.2] mb-5">
            Know yourself.<br />Connect better.
          </h1>
          <p className="text-[15px] text-foreground/85 leading-[1.7] mb-6">
            The RIF assessment helps MonArk understand how you relate — not just what
            you're looking for. 15 questions across five dimensions. No right answers.
            Just honest reflection.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {DIMENSION_ORDER.map((d) => (
              <div key={d} className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5">
                <span className={`w-2 h-2 rounded-full ${DIM_BAR_COLORS[d]}`} />
                <span className="text-xs text-foreground/80">{DIMENSION_META[d].label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-foreground/50 tracking-[0.05em] mb-6">
            Takes about 4 minutes. Your responses are private.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPhase("quiz")}
              className="bg-primary text-primary-foreground border-none rounded-full px-8 py-3.5 text-xs font-medium tracking-[0.12em] cursor-pointer transition-opacity hover:opacity-90 active:scale-[0.97]"
            >
              BEGIN ASSESSMENT
            </button>
            {onSkip && (
              <button
                onClick={onSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ── SAVING ─────────────────────────────────
  if (phase === "saving") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card rounded-2xl p-10 max-w-[560px] w-full shadow-sm text-center">
          <p className="font-serif text-lg tracking-[0.15em] text-primary mb-6">MA</p>
          <p className="text-[15px] text-foreground/85 leading-[1.7] mb-6">
            Building your relational profile…
          </p>
          <div className="h-[3px] bg-secondary rounded overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded"
              initial={{ width: "20%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ────────────────────────────────
  if (phase === "results" && scores) {
    const scoreEntries: { dim: Dimension; value: number }[] = [
      { dim: "IC", value: scores.intent_clarity },
      { dim: "ER", value: scores.emotional_readiness },
      { dim: "PP", value: scores.pacing_preferences },
      { dim: "BR", value: scores.boundary_respect },
      { dim: "PA", value: scores.post_date_alignment },
    ];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background flex items-center justify-center p-6"
      >
        <div className="bg-card rounded-2xl p-10 max-w-[560px] w-full shadow-sm">
          <p className="font-serif text-lg tracking-[0.15em] text-primary border-b border-border pb-3 mb-6 inline-block">
            MA
          </p>
          <p className="font-body text-[11px] tracking-[0.2em] text-primary mb-3 uppercase">
            Your RIF Profile
          </p>
          <h2 className="font-serif text-[28px] font-normal text-foreground mb-4">
            Your relational landscape.
          </h2>
          <p className="text-[15px] text-foreground/85 leading-[1.7] mb-8">
            This is how you show up. These dimensions guide how MonArk curates
            connections that actually align with who you are right now.
          </p>

          <div className="space-y-7">
            {scoreEntries.map(({ dim, value }) => {
              const meta = DIMENSION_META[dim];
              return (
                <motion.div
                  key={dim}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: DIMENSION_ORDER.indexOf(dim) * 0.1 + 0.2 }}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[13px] font-medium text-foreground tracking-[0.05em]">
                      {meta.label}
                    </span>
                    <span className={`font-serif text-[22px] font-normal ${meta.colorClass}`}>
                      {value}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/55 mb-2">{meta.description}</p>
                  <div className="h-[3px] bg-secondary rounded overflow-hidden">
                    <motion.div
                      className={`h-full rounded ${DIM_BAR_COLORS[dim]}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, delay: DIMENSION_ORDER.indexOf(dim) * 0.1 + 0.3 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <p className="text-xs text-foreground/50 tracking-[0.05em] mt-8 mb-6">
            Your profile is live. MonArk will begin curating your first connections.
          </p>
          <button
            onClick={() => onComplete(scores)}
            className="bg-primary text-primary-foreground border-none rounded-full px-8 py-3.5 text-xs font-medium tracking-[0.12em] cursor-pointer transition-opacity hover:opacity-90 active:scale-[0.97]"
          >
            CONTINUE TO PROFILE
          </button>
        </div>
      </motion.div>
    );
  }

  // ── QUIZ ───────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card rounded-2xl p-10 max-w-[560px] w-full shadow-sm">
        {/* Progress meta */}
        <div className="flex justify-between mb-2">
          <span className="text-[11px] text-foreground/50 tracking-[0.1em] uppercase">
            {currentIndex + 1} of {totalQuestions}
          </span>
          {dimMeta && (
            <span className={`text-[11px] tracking-[0.1em] uppercase ${dimMeta.colorClass}`}>
              {dimMeta.label}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-[3px] bg-secondary rounded overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded transition-all duration-400"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dimension section badge */}
        <AnimatePresence mode="wait">
          {isFirstOfDimension && dimMeta && (
            <motion.div
              key={currentDimension}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mt-6 mb-2"
            >
              <span className={`w-2 h-2 rounded-full ${DIM_BAR_COLORS[currentDimension]}`} />
              <span className="text-[11px] tracking-[0.15em] uppercase text-foreground/60">
                {dimMeta.label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="font-serif text-[22px] font-normal text-foreground leading-[1.35] mt-5">
              {currentQuestion.text}
            </h2>
            {currentQuestion.subtext && (
              <p className="text-[13px] text-foreground/55 mt-2 leading-relaxed italic">
                {currentQuestion.subtext}
              </p>
            )}

            {/* Options */}
            <div className="mt-7 space-y-2.5">
              {currentQuestion.options.map((opt, i) => {
                const isSelected = selected === opt.value;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(opt.value)}
                    className={`flex items-start gap-3 w-full text-left rounded-xl border-[1.5px] p-3.5 transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "border-primary bg-secondary"
                        : "border-border bg-transparent hover:border-primary/50"
                    }`}
                  >
                    <span className="w-[18px] h-[18px] rounded-full border-[1.5px] border-border flex-shrink-0 mt-0.5 flex items-center justify-center">
                      {isSelected && <span className="w-2 h-2 rounded-full bg-primary block" />}
                    </span>
                    <span className="text-sm text-foreground leading-relaxed">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Error */}
        {error && (
          <p className="text-[13px] text-destructive mt-3">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-7">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 border border-primary text-primary rounded-full px-6 py-3 text-xs font-medium tracking-[0.12em] cursor-pointer hover:bg-primary/5 transition-colors active:scale-[0.97]"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            BACK
          </button>
          <button
            onClick={handleNext}
            disabled={selected === null}
            className="bg-primary text-primary-foreground border-none rounded-full px-8 py-3 text-xs font-medium tracking-[0.12em] cursor-pointer transition-opacity hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {currentIndex === totalQuestions - 1 ? "COMPLETE" : "NEXT"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * MonArk — Starter RIF Quiz (4 questions)
 * Collects one question per key dimension to unlock matching.
 * Remaining 11 questions surface as daily RIF cards on the Home tab.
 */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Heart, ArrowRigh } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";

// ── TYPES ──────────────────────────────────────────────────────────────────
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

// ── FULL QUESTION BANK (15q) — exported so DailyRIFCard can use the remaining ones
export const RIF_QUESTIONS: RIFQuestion[] = [
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

// ── STARTER QUESTIONS (4) — shown during onboarding ────────────────────────
// One anchor question per dimension (IC, ER, BR, PA). PP surfaces via daily cards.
export const STARTER_QUESTION_IDS = ["IC_1", "ER_1", "BR_1", "PA_1"];
export const STARTER_QUESTIONS = RIF_QUESTIONS.filter(q =>
    STARTER_QUESTION_IDS.includes(q.id)
                                                      );

// ── REMAINING QUESTIONS — surface as daily RIF cards post-onboarding ────────
export const DAILY_RIF_QUESTION_IDS = RIF_QUESTIONS
  .filter(q => !STARTER_QUESTION_IDS.includes(q.id))
  .map(q => q.id);

// ── SCORING ENGINE ──────────────────────────────────────────────────────────
export function scoreRifAnswers(answers: RIFAnswers): RIFScores {
    const dimensionMap: Record<Dimension, keyof RIFScores> = {
          IC: "intent_clarity",
          ER: "emotional_readiness",
          PP: "pacing_preferences",
          BR: "boundary_respect",
          PA: "post_date_alignment",
    };
    const buckets: Record<Dimension, number[]> = { IC: [], ER: [], PP: [], BR: [], PA: [] };
    RIF_QUESTIONS.forEach(q => {
          if (answers[q.id] !== undefined) buckets[q.dimension].push(answers[q.id]);
    });
    const result = {} as Record<keyof RIFScores, number>;
    (Object.keys(dimensionMap) as Dimension[]).forEach(dim => {
          const vals = buckets[dim];
          result[dimensionMap[dim]] = vals.length > 0
            ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
                  : 0;
    });
    return result as RIFScores;
}

// ── SAVE TO SUPABASE ────────────────────────────────────────────────────────
// DB column is DECIMAL(3,2) — max 9.99. Scores 0-100 are divided by 10 before storing.
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
                      intent_clarity: scores.intent_clarity / 10,
                      emotional_readiness: scores.emotional_readiness / 10,
                      pacing_preferences: scores.pacing_preferences / 10,
                      boundary_respect: scores.boundary_respect / 10,
                      post_date_alignment: scores.post_date_alignment / 10,
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
            .upsert(
              { user_id: userId, needs_curation: true, priority: 1, updated_at: new Date().toISOString() },
              { onConflict: "user_id" }
                    );
          if (queueError) throw queueError;

      await supabase.from("rif_event_log").insert([{
              user_id: userId,
              event_type: "rif_starter_completed",
              event_data: {
                        scores,
                        answer_count: Object.keys(answers).length,
                        is_starter: true,
              } as unknown as import("@/integrations/supabase/types").Json,
      }]);

      return { success: true, scores };
    } catch (err: any) {
          console.error("[RIF] Save failed:", err);
          return { success: false, error: err.message };
    }
}

// ── DIMENSION METADATA ──────────────────────────────────────────────────────
const DIMENSION_META: Record<Dimension, { label: string; colorClass: string }> = {
    IC: { label: "Intent Clarity", colorClass: "text-primary" },
    ER: { label: "Emotional Readiness", colorClass: "text-accent" },
    PP: { label: "Pacing Preference", colorClass: "text-[hsl(350,30%,62%)]" },
    BR: { label: "Boundary Respect", colorClass: "text-[hsl(22,38%,36%)]" },
    PA: { label: "Post-Date Alignment", colorClass: "text-muted-foreground" },
};

// ── COMPONENT ───────────────────────────────────────────────────────────────
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
    const [phase, setPhase] = useState<"intro" | "quiz" | "saving" | "done">("intro");
    const [error, setError] = useState<string | null>(null);

  const questions = STARTER_QUESTIONS;
    const totalQuestions = questions.length;
    const currentQuestion = questions[currentIndex];
    const progress = (currentIndex / totalQuestions) * 100;
    const dimMeta = DIMENSION_META[currentQuestion?.dimension];

  function handleSelect(value: number) { setSelected(value); }

  function handleNext() {
        if (selected === null) return;
        const updated = { ...answers, [currentQuestion.id]: selected };
        setAnswers(updated);
        setSelected(null);
        if (currentIndex < totalQuestions - 1) {
                setCurrentIndex(i => i + 1);
        } else {
                handleSubmit(updated);
        }
  }

  function handleBack() {
        if (currentIndex === 0) { setPhase("intro"); return; }
        setCurrentIndex(i => i - 1);
        const prev = questions[currentIndex - 1];
        setSelected(answers[prev.id] ?? null);
  }

  async function handleSubmit(finalAnswers: RIFAnswers) {
        setPhase("saving");
        const result = await saveRifProfile(userId, finalAnswers);
        if (!result.success) {
      setError(result.error || "Something went wrong.");
                setPhase("quiz");
                return;
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.byUser(userId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
        setPhase("done");
        // Brief celebration pause then complete
      setTimeout(() => onComplete(result.scores!), 1800);
  }

  // ── INTRO SCREEN ──────────────────────────────────────────────────────────
  if (phase === "intro") {
        return (
                <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="min-h-screen bg-background flex items-center justify-center p-6"
                        >
                        <div className="bg-card rounded-2xl p-10 max-w-[540px] w-full shadow-sm">
                                  <p className="font-serif text-lg tracking-[0.15em] text-primary border-b border-border pb-3 mb-6 inline-block">MA</p>
                                  <p className="font-body text-[11px] tracking-[0.2em] text-primary mb-3 uppercase">
                                              Relational Intelligence Framework
                                  </p>
                                  <h1 className="font-serif text-4xl font-normal text-foreground leading-[1.2] mb-4">
                                              Know yourself.<br />Connect better.
                                  </h1>
                                  <p className="text-[15px] text-foreground/85 leading-[1.7] mb-4">
                                              4 quick questions to unlock your first matches. Your RIF profile deepens
                                              over time — one question a day keeps your Sunday matches sharp.
                                  </p>
                                  <div className="flex items-center gap-2 mb-6 text-xs text-foreground/50">
                                              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                                              Takes about 90 seconds &nbsp;·&nbsp; Your responses are private.
                                  </div>
                                  <div className="flex items-center gap-3">
                                              <button
                                                              onClick={() => setPhase("quiz")}
                                                              className="bg-primary text-primary-foreground border-none rounded-full px-8 py-3.5 text-xs font-medium tracking-[0.12em] cursor-pointer transition-opacity hover:opacity-90 active:scale-[0.97]"
                                                            >
                                                            BEGIN
                                              </button>
                                    {onSkip && (
                                        <button onClick={onSkip} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                                        Skip for now
                                        </button>
                                              )}
                                  </div>
                        </div>
                </motion.div>motion.div>
              );
  }
  
    // ── SAVING ────────────────────────────────────────────────────────────────
    if (phase === "saving") {
          return (
                  <div className="min-h-screen bg-background flex items-center justify-center p-6">
                          <div className="bg-card rounded-2xl p-10 max-w-[540px] w-full shadow-sm text-center">
                                    <p className="font-serif text-lg tracking-[0.15em] text-primary mb-6">MA</p>
                                    <p className="text-[15px] text-foreground/85 leading-[1.7] mb-6">Building your relational profile…</p>
                                    <div className="h-[3px] bg-secondary rounded overflow-hidden">
                                                <motion.div
                                                                className="h-full bg-gradient-to-r from-primary to-accent rounded"
                                                                initial={{ width: "20%" }}
                                                                animate={{ width: "100%" }}
                                                                transition={{ duration: 1.6, ease: "easeOut" }}
                                                              />
                                    </div>
                          </div>
                  </div>
                );
    }
  
    // ── DONE / CELEBRATION ────────────────────────────────────────────────────
    if (phase === "done") {
          return (
                  <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="min-h-screen bg-background flex items-center justify-center p-6"
                          >
                          <div className="bg-card rounded-2xl p-10 max-w-[540px] w-full shadow-sm text-center">
                                    <motion.div
                                                  initial={{ scale: 0, rotate: -20 }}
                                                  animate={{ scale: 1, rotate: 0 }}
                                                  transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
                                                  className="mx-auto w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6"
                                                >
                                                <Heart className="w-7 h-7 text-primary" />
                                    </motion.div>motion.div>
                                    <h2 className="font-serif text-3xl font-normal text-foreground mb-2">You're in.</h2>
                                    <p className="text-[14px] text-foreground/70 leading-[1.75] mb-4">
                                                Your starter profile is live. MonArk will begin curating your first connections.
                                    </p>
                                    <p className="text-[12px] text-primary/80 tracking-wide">
                                                ✦ &nbsp;More questions await on your home tab — each one sharpens your Sunday matches.
                                    </p>
                          </div>
                  </motion.div>motion.div>
                );
    }
  
    // ── QUIZ ──────────────────────────────────────────────────────────────────
    return (
          <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="bg-card rounded-2xl p-10 max-w-[560px] w-full shadow-sm">
                  {/* Progress */}
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
                        <div className="h-[3px] bg-secondary rounded overflow-hidden mb-6">
                                  <div
                                                className="h-full bg-gradient-to-r from-primary to-accent rounded transition-all duration-400"
                                                style={{ width: `${progress}%` }}
                                              />
                        </div>
                
                  {/* Question */}
                        <AnimatePresence mode="wait">
                                  <motion.div
                                                key={currentIndex}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.22 }}
                                              >
                                              <h2 className="font-serif text-[22px] font-normal text-foreground leading-[1.35] mb-2">
                                                {currentQuestion.text}
                                              </h2>
                                    {currentQuestion.subtext && (
                                                              <p className="text-[13px] text-foreground/55 mt-1 mb-5 leading-relaxed italic">
                                                                {currentQuestion.subtext}
                                                              </p>
                                              )}
                                              <div className="mt-6 space-y-2.5">
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
                                  </motion.div>motion.div>
                        </AnimatePresence>AnimatePresence>
                
                  {error && <p className="text-[13px] text-destructive mt-3">{error}</p>}
                
                  {/* Navigation */}
                        <div className="flex justify-between items-center mt-7">
                                  <button
                                                onClick={handleBack}
                                                className="flex items-center gap-1 border border-primary text-primary rounded-full px-6 py-3 text-xs font-medium tracking-[0.12em] cursor-pointer hover:bg-primary/5 transition-colors active:scale-[0.97]"
                                              >
                                              <ChevronLeft className="w-3.5 h-3.5" /> BACK
                                  </button>
                                  <button
                                                onClick={handleNext}
                                                disabled={selected === null}
                                                className="bg-primary text-primary-foreground border-none rounded-full px-8 py-3 text-xs font-medium tracking-[0.12em] cursor-pointer transition-opacity hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                              >
                                    {currentIndex === totalQuestions - 1 ? (
                                                              <>COMPLETE <ArrowRight className="w-3.5 h-3.5" /></>>
                                                            ) : (
                                                              "NEXT"
                                                            )}
                                  </button>
                        </div>
                </div>
          </div>
        );
}</></motion.div>

/**
 * DailyRIFCard — surfaces one unanswered RIF question per day on the Home tab.
 * Shows RIF completeness score and ties deeper matches to a more complete profile.
 * Questions come from DAILY_RIF_QUESTION_IDS (the 11 not asked in onboarding).
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRIF } from "@/hooks/useRIF";
import {
    RIF_QUESTIONS,
    DAILY_RIF_QUESTION_IDS,
    scoreRifAnswers,
    type RIFAnswers,
} from "@/components/onboarding/RIFQuiz";

// Total questions in the full RIF bank
const TOTAL_RIF_QUESTIONS = RIF_QUESTIONS.length; // 15

// ── Deterministic daily question picker ────────────────────────────────────
// Rotates through unanswered daily questions deterministically by day-of-year.
function pickDailyRIFQuestion(answeredIds: string[]): typeof RIF_QUESTIONS[0] | null {
    const unanswered = RIF_QUESTIONS.filter(
          q => DAILY_RIF_QUESTION_IDS.includes(q.id) && !answeredIds.includes(q.id)
        );
    if (unanswered.length === 0) return null;
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    return unanswered[dayOfYear % unanswered.length];
}

// ── Dimension label map ─────────────────────────────────────────────────────
const DIM_LABELS: Record<string, { label: string; color: string }> = {
    IC: { label: "Intent Clarity", color: "text-primary" },
    ER: { label: "Emotional Readiness", color: "text-accent" },
    PP: { label: "Pacing Preference", color: "text-[hsl(350,30%,62%)]" },
    BR: { label: "Boundary Respect", color: "text-[hsl(22,38%,36%)]" },
    PA: { label: "Post-Date Alignment", color: "text-muted-foreground" },
};

// ── Component ───────────────────────────────────────────────────────────────
export function DailyRIFCard() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { rifProfile, loading: rifLoading } = useRIF();

  const todayKey = new Date().toISOString().split("T")[0];
    const dismissedKey = `monark_rif_daily_dismissed_${todayKey}`;

  const [dismissed, setDismissed] = useState(() => {
        try { return localStorage.getItem(dismissedKey) === "true"; } catch { return false; }
  });
    const [selectedValue, setSelectedValue] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);

  // Fetch which RIF questions the user has already answered
  const { data: answeredIds = [], isLoading: answersLoading } = useQuery({
        queryKey: ["rif-daily-answered", user?.id],
        queryFn: async () => {
                if (!user) return [];
                const { data } = await supabase
                  .from("user_profiles")
                  .select("rif_quiz_answers")
                  .eq("user_id", user.id)
                  .maybeSingle();
                if (!data?.rif_quiz_answers) return [];
                return Object.keys(data.rif_quiz_answers as object);
        },
        enabled: !!user,
        staleTime: 60_000,
  });

  const todayQuestion = !answersLoading ? pickDailyRIFQuestion(answeredIds) : null;

  // Completeness: answered questions / total
  const completeness = Math.round((answeredIds.length / TOTAL_RIF_QUESTIONS) * 100);
    const completenessLabel =
          completeness >= 100 ? "Complete" :
          completeness >= 70  ? "Strong" :
          completeness >= 40  ? "Growing" :
          "Starter";

  const saveMutation = useMutation({
        mutationFn: async ({ questionId, value }: { questionId: string; value: number }) => {
                if (!user) throw new Error("Not authenticated");

          // Fetch existing answers
          const { data: profileData } = await supabase
                  .from("user_profiles")
                  .select("rif_quiz_answers")
                  .eq("user_id", user.id)
                  .maybeSingle();

          const existing: RIFAnswers = (profileData?.rif_quiz_answers as RIFAnswers) || {};
                const updated: RIFAnswers = { ...existing, [questionId]: value };

          // Recompute scores
          const scores = scoreRifAnswers(updated);

          // Upsert rif_profiles with new scores
          const { error: rifError } = await supabase
                  .from("rif_profiles")
                  .upsert({
                              user_id: user.id,
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

          // Update user_profiles with full answers map
          const { error: profileError } = await supabase
                  .from("user_profiles")
                  .update({
                              rif_quiz_answers: updated,
                              updated_at: new Date().toISOString(),
                  })
                  .eq("user_id", user.id);
                if (profileError) throw profileError;

          // Log event
          await supabase.from("rif_event_log").insert([{
                    user_id: user.id,
                    event_type: "rif_daily_answer",
                    event_data: {
                                question_id: questionId,
                                value,
                                new_answer_count: Object.keys(updated).length,
                    } as unknown as import("@/integrations/supabase/types").Json,
          }]);

          return scores;
        },
        onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["rif-daily-answered", user?.id] });
                queryClient.invalidateQueries({ queryKey: ["rif-profile", user?.id] });
                queryClient.invalidateQueries({ queryKey: ["profile"] });
                setSubmitted(true);
        },
  });

  const handleSubmit = () => {
        if (selectedValue === null || !todayQuestion) return;
        saveMutation.mutate({ questionId: todayQuestion.id, value: selectedValue });
  };

  const handleDismiss = () => {
        setDismissed(true);
        try { localStorage.setItem(dismissedKey, "true"); } catch {}
  };

  // Don't show if loading, dismissed, all questions answered, or no question
  if (rifLoading || answersLoading) return null;
    if (dismissed && !submitted) return null;

  // ── Completion state: all 15 answered ────────────────────────────────────
  if (answeredIds.length >= TOTAL_RIF_QUESTIONS) {
        return (
                <div className="bg-card border border-primary/20 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                                  <Sparkles className="w-4 h-4 text-primary" />
                                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                              RIF Profile Complete
                                  </span>
                        </div>
                        <p className="text-sm text-foreground/75 leading-snug">
                                  Your Relational Intelligence profile is fully built. Your Sunday matches
                                  are as sharp as they can get.
                        </p>
                        <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full w-full" />
                        </div>
                </div>
              );
  }
  
    // ── Submitted confirmation ─────────────────────────────────────────────
    if (submitted) {
          const newCompleteness = Math.round(((answeredIds.length + 1) / TOTAL_RIF_QUESTIONS) * 100);
          return (
                  <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-card border border-primary/20 rounded-2xl p-4 shadow-sm"
                          >
                          <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                                RIF Updated
                                    </span>
                                    <span className="ml-auto text-xs text-muted-foreground">{newCompleteness}%</span>
                          </div>
                          <p className="text-sm text-foreground/75 leading-snug mb-3">
                                    Answer saved. Your Sunday matches just got a little sharper.
                          </p>
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                                  initial={{ width: `${completeness}%` }}
                                                  animate={{ width: `${newCompleteness}%` }}
                                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                                />
                          </div>
                  </motion.div>
                );
    }
  
    // ── No unanswered daily question today ────────────────────────────────────
    if (!todayQuestion) return null;
  
    const dimMeta = DIM_LABELS[todayQuestion.dimension];
  
    // ── Main card ─────────────────────────────────────────────────────────────
    return (
          <div className="bg-card border border-primary/20 rounded-2xl p-4 shadow-sm">
            {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                                  <div>
                                              <p className="text-xs font-semibold text-primary uppercase tracking-wider leading-none mb-0.5">
                                                            Today's RIF Question
                                              </p>
                                    {dimMeta && (
                          <p className={`text-[10px] uppercase tracking-wider ${dimMeta.color}`}>
                            {dimMeta.label}
                          </p>
                                              )}
                                  </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Completeness badge */}
                                  <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                    {completeness}% · {completenessLabel}
                                  </span>
                                  <button
                                                onClick={handleDismiss}
                                                className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                                                aria-label="Dismiss"
                                              >
                                              <X className="w-3.5 h-3.5" />
                                  </button>
                        </div>
                </div>
          
            {/* Completeness bar */}
                <div className="h-1 bg-secondary rounded-full overflow-hidden mb-4">
                        <div
                                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                                    style={{ width: `${completeness}%` }}
                                  />
                </div>
          
            {/* Question */}
                <p className="text-sm font-medium text-foreground leading-snug mb-1">
                  {todayQuestion.text}
                </p>
            {todayQuestion.subtext && (
                    <p className="text-[11px] text-muted-foreground italic mb-3">{todayQuestion.subtext}</p>
                )}
          
            {/* Options */}
                <AnimatePresence>
                        <div className="space-y-2 mt-3">
                          {todayQuestion.options.map((opt, i) => {
                        const isSelected = selectedValue === opt.value;
                        return (
                                        <button
                                                          key={i}
                                                          onClick={() => setSelectedValue(opt.value)}
                                                          className={`flex items-center gap-2.5 w-full text-left rounded-xl border px-3 py-2.5 text-sm transition-all duration-150 ${
                                                                              isSelected
                                                                                ? "border-primary bg-primary/5 text-foreground"
                                                                                : "border-border text-foreground/70 hover:border-primary/40 hover:text-foreground"
                                                          }`}
                                                        >
                                                        <span
                                                                            className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 flex items-center justify-center ${
                                                                                                  isSelected ? "border-primary" : "border-border"
                                                                            }`}
                                                                          >
                                                          {isSelected && (
                                                                                                <span className="w-1.5 h-1.5 rounded-full bg-primary block" />
                                                                                              )}
                                                        </span>
                                          {opt.label}
                                        </button>
                                      );
          })}
                        </div>
                </AnimatePresence>
          
            {/* Submit */}
                <div className="flex items-center gap-3 mt-4">
                        <button
                                    onClick={handleSubmit}
                                    disabled={selectedValue === null || saveMutation.isPending}
                                    className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-5 py-2 text-xs font-medium tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity active:scale-[0.97]"
                                  >
                          {saveMutation.isPending ? "Saving…" : "Save answer"}
                          {!saveMutation.isPending && <ChevronRight className="w-3 h-3" />}
                        </button>
                        <button
                                    onClick={handleDismiss}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                  Skip today
                        </button>
                </div>
          
            {saveMutation.isError && (
                    <p className="text-xs text-destructive mt-2">Couldn't save — try again.</p>
                )}
          </div>
        );
}

export default DailyRIFCard;</div>

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProfileDepthAnswerInsert } from '@/integrations/supabase/types.extended';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// ── 28 rotating questions — one surfaces per day between Sundays ──────────────
export const PROFILE_QUESTIONS = [
  { id: 'q01', prompt: "What's something about you that your profile photo doesn't show?", field: 'hidden_depth' },
  { id: 'q02', prompt: 'Describe your ideal Sunday morning in two sentences.', field: 'sunday_vibe' },
  { id: 'q03', prompt: "What do you find yourself talking about when you're genuinely excited?", field: 'passion_topic' },
  { id: 'q04', prompt: "What's one thing you're getting better at right now?", field: 'growth_edge' },
  { id: 'q05', prompt: 'What does a really good first conversation feel like to you?', field: 'convo_ideal' },
  { id: 'q06', prompt: 'How do you usually recharge after a long week?', field: 'recharge_style' },
  { id: 'q07', prompt: 'What kind of place makes you feel most like yourself?', field: 'home_environment' },
  { id: 'q08', prompt: "What's something you're looking for that most apps won't let you say?", field: 'unsaid_need' },
  { id: 'q09', prompt: 'What does commitment mean to you at this point in your life?', field: 'commitment_view' },
  { id: 'q10', prompt: "What's a non-negotiable in how someone treats the people around them?", field: 'value_non_negotiable' },
  { id: 'q11', prompt: "What's the last thing that genuinely surprised you in a good way?", field: 'last_good_surprise' },
  { id: 'q12', prompt: 'How do you handle conflict when it comes up early in a relationship?', field: 'conflict_style' },
  { id: 'q13', prompt: "What's a book, film, or album that shaped how you see love?", field: 'love_media' },
  { id: 'q14', prompt: 'When do you feel most present with another person?', field: 'presence_trigger' },
  { id: 'q15', prompt: "What's one thing you wish more people understood about you?", field: 'misunderstood' },
  { id: 'q16', prompt: 'Describe your relationship with ambition right now.', field: 'ambition_relationship' },
  { id: 'q17', prompt: "What's your version of taking things slow?", field: 'slow_definition' },
  { id: 'q18', prompt: 'What makes a place feel like home to you?', field: 'home_feeling' },
  { id: 'q19', prompt: "What kind of humor do you have when you're comfortable?", field: 'humor_style' },
  { id: 'q20', prompt: "What's the most important thing you've learned from a past relationship?", field: 'past_lesson' },
  { id: 'q21', prompt: "What are you hoping someone will notice about you after talking a while?", field: 'hidden_quality' },
  { id: 'q22', prompt: "How do you feel about silence with someone you're getting to know?", field: 'silence_comfort' },
  { id: 'q23', prompt: "What's something you'd want to do together before calling it a relationship?", field: 'pre_relationship_ritual' },
  { id: 'q24', prompt: 'What does emotional safety look like to you?', field: 'emotional_safety' },
  { id: 'q25', prompt: "What's something you used to think you wanted that's changed?", field: 'changed_want' },
  { id: 'q26', prompt: 'How do you show up for the people you care about?', field: 'care_expression' },
  { id: 'q27', prompt: "What's something about everyday life that makes you happy?", field: 'small_joy' },
  { id: 'q28', prompt: "What's one question you wish someone would ask you?", field: 'wished_question' },
];

// ── Deterministic daily question — rotates by day-of-year ────────────────────
export function getTodaysQuestion() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return PROFILE_QUESTIONS[dayOfYear % PROFILE_QUESTIONS.length];
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useProgressiveProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const todayKey = new Date().toISOString().split('T')[0];
  const dismissKey = 'monark_daily_q_dismissed_' + todayKey;

  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(dismissKey) === 'true'; } catch { return false; }
  });

  const question = getTodaysQuestion();

  // Check if today's question has already been answered
  // profile_depth_answers table exists in migrations but not yet in generated types.ts —
  // using (supabase.from as any) until `supabase gen types` is re-run post-migration.
  const { data: answered } = useQuery({
    queryKey: ['progressive-profile', user?.id, question.id],
    queryFn: async () => {
      if (!user) return false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from as any)('profile_depth_answers')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', question.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const answerMutation = useMutation({
    mutationFn: async (answer: string) => {
      if (!user) throw new Error('Not authenticated');
      const payload: ProfileDepthAnswerInsert = {
        user_id: user.id,
        question_id: question.id,
        question_text: question.prompt,
        answer_text: answer.trim(),
        field_key: question.field,
        answered_at: new Date().toISOString(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from as any)('profile_depth_answers')
        .upsert(payload, { onConflict: 'user_id,question_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progressive-profile', user?.id] });
      toast.success('Answer saved — this helps your Sunday matches get sharper', { duration: 3000 });
    },
    onError: () => toast.error('Could not save your answer'),
  });

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(dismissKey, 'true'); } catch {}
  };

  const showCard = !dismissed && !answered && !!user;

  return {
    question,
    showCard,
    answered: !!answered,
    submitAnswer: answerMutation.mutateAsync,
    isSubmitting: answerMutation.isPending,
    dismiss,
  };
}

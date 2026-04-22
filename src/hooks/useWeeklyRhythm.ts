import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type WeeklyRhythm = 'reset' | 'spark' | 'stretch';

export interface UserWeeklyRhythm {
    id: string;
    user_id: string;
    week_start: string;
    rhythm: WeeklyRhythm;
    selected_at: string;
}

/** Returns the current week's Sunday as YYYY-MM-DD */
function getCurrentWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    const sunday = new Date(now.setDate(diff));
    sunday.setHours(0, 0, 0, 0);
    return sunday.toISOString().split('T')[0];
}

/**
 * useWeeklyRhythm
 *
 * Reads and writes the current user's weekly rhythm selection
 * (reset | spark | stretch) to/from public.user_weekly_rhythm.
 *
 * Also stamps weekly_rhythm on curated_matches for this week
 * so the match-curator can use it as a scoring signal.
 */
export const useWeeklyRhythm = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const weekStart = getCurrentWeekStart();

    // ── Fetch current week's selection ──────────────────────────────────────
    const { data: rhythmRow, isLoading: loading } = useQuery({
          queryKey: ['weekly_rhythm', user?.id, weekStart],
          queryFn: async (): Promise<UserWeeklyRhythm | null> => {
                  if (!user) return null;
                  const { data, error } = await (supabase as any)
                    .from('user_weekly_rhythm')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('week_start', weekStart)
                    .maybeSingle();
                  if (error) throw error;
                  return data ?? null;
          },
          enabled: !!user,
          staleTime: 60_000,
    });

    // ── Save / update selection ──────────────────────────────────────────────
    const saveMutation = useMutation({
          mutationFn: async (rhythm: WeeklyRhythm) => {
                  if (!user) throw new Error('Not authenticated');

            // Upsert into user_weekly_rhythm
            const { error: upsertErr } = await (supabase as any)
                    .from('user_weekly_rhythm')
                    .upsert(
                      {
                                    user_id: user.id,
                                    week_start: weekStart,
                                    rhythm,
                                    selected_at: new Date().toISOString(),
                      },
                      { onConflict: 'user_id,week_start' }
                              );
                  if (upsertErr) throw upsertErr;

            // Stamp weekly_rhythm onto this week's curated_matches rows so
            // the match-curator can use it as a sorting/boosting signal.
            await (supabase as any)
                    .from('curated_matches')
                    .update({ weekly_rhythm: rhythm })
                    .eq('user_id', user.id)
                    .eq('week_start', weekStart);

            return rhythm;
          },
          onSuccess: (rhythm) => {
                  queryClient.invalidateQueries({ queryKey: ['weekly_rhythm', user?.id, weekStart] });
                  queryClient.invalidateQueries({ queryKey: ['curated_matches'] });
                  toast.success(`Rhythm set to ${rhythm.charAt(0).toUpperCase() + rhythm.slice(1)}`);
          },
          onError: () => {
                  toast.error('Failed to save your rhythm. Please try again.');
          },
    });

    const saveRhythm = useCallback(
          (rhythm: WeeklyRhythm) => saveMutation.mutateAsync(rhythm),
          [saveMutation]
        );

    return {
          /** The user's rhythm for this week, or null if not yet selected */
          rhythm: (rhythmRow?.rhythm ?? null) as WeeklyRhythm | null,
          loading,
          saving: saveMutation.isPending,
          saveRhythm,
          weekStart,
    };
};

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AsyncJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AsyncJob {
  id: string;
  job_type: string;
  status: AsyncJobStatus;
  result_data: any;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

/**
 * Subscribe to an async job via Supabase Realtime.
 * Returns the job status and result once completed.
 * 
 * Usage:
 *   const { job, isLoading, error } = useAsyncJob(jobId);
 *   // job.status will update in real-time: pending → processing → completed/failed
 *   // job.result_data contains the final result
 */
export const useAsyncJob = (jobId: string | null) => {
  const { user } = useAuth();
  const [job, setJob] = useState<AsyncJob | null>(null);
  const [isLoading, setIsLoading] = useState(!!jobId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !user) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    const fetchJob = async () => {
      const { data, error: fetchError } = await supabase
        .from('async_jobs')
        .select('id, job_type, status, result_data, error_message, created_at, completed_at')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        setError('Failed to load job status');
        setIsLoading(false);
        return;
      }

      setJob(data as AsyncJob);
      if (data.status === 'completed' || data.status === 'failed') {
        setIsLoading(false);
        if (data.status === 'failed') {
          setError(data.error_message || 'Job failed');
        }
      }
    };

    fetchJob();

    // Subscribe to Realtime updates
    const channel = supabase
      .channel(`async-job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'async_jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          const updated = payload.new as AsyncJob;
          setJob(updated);
          if (updated.status === 'completed' || updated.status === 'failed') {
            setIsLoading(false);
            if (updated.status === 'failed') {
              setError(updated.error_message || 'Job failed');
            }
          }
        }
      )
      .subscribe();

    // Timeout: if job hasn't completed in 30s, stop loading
    const timeout = setTimeout(() => {
      setIsLoading((current) => {
        if (current) {
          setError('Request timed out. Please try again.');
          return false;
        }
        return current;
      });
    }, 30000);

    return () => {
      clearTimeout(timeout);
      supabase.removeChannel(channel);
    };
  }, [jobId, user]);

  return { job, isLoading, error };
};

/**
 * Hook to submit an async job and track its progress.
 * Combines job creation (via edge function) with Realtime tracking.
 */
export const useAsyncJobSubmit = () => {
  const [jobId, setJobId] = useState<string | null>(null);
  const jobState = useAsyncJob(jobId);

  const submitJob = useCallback(async (
    functionName: string,
    payload: Record<string, any>
  ) => {
    setJobId(null);

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: { ...payload, async: true },
    });

    if (error) {
      return { error: error.message };
    }

    if (data?.job_id) {
      setJobId(data.job_id);
      return { job_id: data.job_id };
    }

    // Function returned sync result (no job_id)
    return { result: data };
  }, []);

  const reset = useCallback(() => {
    setJobId(null);
  }, []);

  return {
    submitJob,
    reset,
    jobId,
    ...jobState,
  };
};
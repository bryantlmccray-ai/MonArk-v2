// Utility functions for handling retries and network errors

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

export const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2
};

/**
 * Checks if an error is a retryable network/server error.
 * Returns false for 4xx client errors (auth failures, bad requests, etc.)
 * to prevent auth storms and amplified abuse.
 */
export const isRetryableError = (error: any): boolean => {
  if (!error) return false;

  // Never retry on client errors (4xx) — especially 401/403
  const status = error.status ?? error.statusCode ?? error?.response?.status;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    return false;
  }

  // Check for explicit HTTP error codes in Supabase/fetch responses
  const errorCode = error.code;
  if (errorCode === '42501' || errorCode === 'PGRST301' || errorCode === '401' || errorCode === '403') {
    return false;
  }

  const errorMessage = error.message?.toLowerCase() || '';
  const errorName = error.name?.toLowerCase() || '';

  // Only retry on genuine network / 5xx errors
  return (
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('network error') ||
    errorMessage.includes('connection refused') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('502') ||
    errorMessage.includes('503') ||
    errorMessage.includes('504') ||
    errorName.includes('networkerror') ||
    error.code === 'NETWORK_ERROR' ||
    (typeof status === 'number' && status >= 500)
  );
};

/** @deprecated Use isRetryableError instead */
export const isNetworkError = isRetryableError;

export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const opts = { ...defaultRetryOptions, ...options };
  let lastError: any;
  
  for (let attempt = 0; attempt <= opts.maxRetries!; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt === opts.maxRetries) {
        break;
      }
      
      // Only retry on retryable errors (network/5xx) — never on 4xx
      if (!isRetryableError(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff + jitter
      const baseDelay = opts.baseDelay! * Math.pow(opts.backoffFactor!, attempt);
      const jitter = Math.random() * 0.3 * baseDelay; // 0-30% jitter
      const delay = Math.min(baseDelay + jitter, opts.maxDelay!);
      
      await sleep(delay);
    }
  }
  
  throw lastError;
};

export const createRetryableSupabaseOperation = <T>(
  operation: () => Promise<T>,
  options?: RetryOptions
) => {
  return () => withRetry(operation, options);
};

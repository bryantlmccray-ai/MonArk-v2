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

export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorName = error.name?.toLowerCase() || '';
  
  return (
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('network error') ||
    errorMessage.includes('connection refused') ||
    errorMessage.includes('timeout') ||
    errorName.includes('networkerror') ||
    error.code === 'NETWORK_ERROR'
  );
};

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
      
      // Only retry network errors
      if (!isNetworkError(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay! * Math.pow(opts.backoffFactor!, attempt),
        opts.maxDelay!
      );
      
      console.log(`Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms`);
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
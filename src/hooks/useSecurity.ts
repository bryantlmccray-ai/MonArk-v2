import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { messageContentSchema, profileUpdateSchema, securityMiddlewareSchema, getFirstError } from '@/lib/validation';

interface SecurityCheckResult {
  allowed: boolean;
  error?: string;
  retryAfter?: number;
}

/**
 * Hook for security-related functionality including rate limiting and access control
 */
export const useSecurity = () => {
  const { user } = useAuth();

  /**
   * Check if an action is allowed (rate limit + permissions)
   */
  const checkAction = useCallback(async (
    action: string,
    targetUserId?: string,
    resourceType?: string,
    resourceId?: string
  ): Promise<SecurityCheckResult> => {
    if (!user) {
      return { allowed: false, error: 'Authentication required' };
    }

    // Validate inputs with Zod before sending to edge function
    const validation = securityMiddlewareSchema.safeParse({
      action, targetUserId, resourceType, resourceId
    });
    if (!validation.success) {
      return { allowed: false, error: getFirstError(validation) || 'Invalid request' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('security-middleware', {
        body: validation.data
      });

      if (error) {
        console.error('Security check error:', error);
        return { allowed: false, error: 'Security check failed' };
      }

      if (data.error) {
        if (data.retryAfter) {
          const minutes = Math.ceil(data.retryAfter / 60);
          toast({
            title: 'Please slow down',
            description: `You've reached the limit for this action. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
            variant: 'destructive',
          });
        }
        return { 
          allowed: false, 
          error: data.error,
          retryAfter: data.retryAfter 
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Security check exception:', error);
      return { allowed: false, error: 'Security check failed' };
    }
  }, [user]);

  /**
   * Handle permission denied errors with user-friendly messages
   */
  const handlePermissionError = useCallback((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('row-level security') || 
        errorMessage.includes('policy') ||
        errorMessage.includes('permission denied')) {
      toast({
        title: 'Access denied',
        description: 'You don\'t have permission to perform this action.',
        variant: 'destructive',
      });
      return true;
    }

    if (errorMessage.includes('JWT') || 
        errorMessage.includes('token') ||
        errorMessage.includes('auth')) {
      toast({
        title: 'Session expired',
        description: 'Please sign in again to continue.',
        variant: 'destructive',
      });
      return true;
    }

    return false;
  }, []);

  /**
   * Validate message content before sending (Zod-based)
   */
  const validateMessage = useCallback((content: string): string | null => {
    const result = messageContentSchema.safeParse(content);
    if (result.success) return null;
    return getFirstError(result);
  }, []);

  /**
   * Validate profile data before updating (Zod-based)
   */
  const validateProfileUpdate = useCallback((data: Record<string, unknown>): string[] => {
    const result = profileUpdateSchema.safeParse(data);
    if (result.success) return [];
    return result.error.issues.map(i => i.message);
  }, []);

  return {
    checkAction,
    handlePermissionError,
    validateMessage,
    validateProfileUpdate,
    isAuthenticated: !!user,
  };
};
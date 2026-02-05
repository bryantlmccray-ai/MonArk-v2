import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

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

    try {
      const { data, error } = await supabase.functions.invoke('security-middleware', {
        body: {
          action,
          targetUserId,
          resourceType,
          resourceId
        }
      });

      if (error) {
        console.error('Security check error:', error);
        return { allowed: false, error: 'Security check failed' };
      }

      if (data.error) {
        // Handle rate limit specifically
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
    
    // Check for common permission errors
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
   * Validate message content before sending
   */
  const validateMessage = useCallback((content: string): string | null => {
    if (!content || content.trim().length === 0) {
      return 'Message cannot be empty';
    }
    if (content.length > 5000) {
      return 'Message is too long (max 5000 characters)';
    }
    return null;
  }, []);

  /**
   * Validate profile data before updating
   */
  const validateProfileUpdate = useCallback((data: Record<string, unknown>): string[] => {
    const errors: string[] = [];

    if (data.bio && typeof data.bio === 'string' && data.bio.length > 1000) {
      errors.push('Bio must be less than 1000 characters');
    }

    if (data.occupation && typeof data.occupation === 'string' && data.occupation.length > 100) {
      errors.push('Occupation must be less than 100 characters');
    }

    if (data.interests && Array.isArray(data.interests) && data.interests.length > 20) {
      errors.push('You can select up to 20 interests');
    }

    if (data.photos && Array.isArray(data.photos) && data.photos.length > 6) {
      errors.push('You can upload up to 6 photos');
    }

    return errors;
  }, []);

  return {
    checkAction,
    handlePermissionError,
    validateMessage,
    validateProfileUpdate,
    isAuthenticated: !!user,
  };
};
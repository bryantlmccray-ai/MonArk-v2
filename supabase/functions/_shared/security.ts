// Shared security utilities for edge functions
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export interface AuthResult {
  user: { id: string; email?: string } | null
  error: string | null
  supabaseClient: SupabaseClient | null
}

/**
 * Verify authentication from request headers
 */
export async function verifyAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization')
  
  if (!authHeader) {
    console.error('Security: Missing authorization header')
    return { user: null, error: 'Authentication required', supabaseClient: null }
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
  
  if (authError || !user) {
    console.error('Security: Invalid or expired token', authError?.message)
    return { user: null, error: 'Invalid or expired authentication', supabaseClient: null }
  }

  return { user, error: null, supabaseClient }
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized'): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(message = 'Access denied'): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

/**
 * Create a generic error response (hides internal details)
 */
export function errorResponse(internalError: unknown, publicMessage = 'An error occurred'): Response {
  // Log detailed error server-side
  console.error('Internal error:', internalError)
  
  // Return generic message to client
  return new Response(
    JSON.stringify({ error: publicMessage }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

/**
 * Create a rate limit exceeded response
 */
export function rateLimitResponse(): Response {
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
    { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(errors: string[]): Response {
  return new Response(
    JSON.stringify({ error: 'Validation failed', details: errors }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

/**
 * Validate input length
 */
export function validateLength(value: string | undefined | null, field: string, min: number, max: number): string | null {
  if (!value) {
    if (min > 0) return `${field} is required`
    return null
  }
  if (value.length < min) return `${field} must be at least ${min} characters`
  if (value.length > max) return `${field} must be no more than ${max} characters`
  return null
}

/**
 * Validate email format
 */
export function validateEmail(email: string | undefined | null): string | null {
  if (!email) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Invalid email format'
  if (email.length > 255) return 'Email is too long'
  return null
}

/**
 * Validate UUID format
 */
export function validateUUID(value: string | undefined | null, field: string): string | null {
  if (!value) return `${field} is required`
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(value)) return `${field} must be a valid UUID`
  return null
}

/**
 * Check rate limit using database function
 */
export async function checkRateLimit(
  supabaseClient: SupabaseClient,
  userId: string,
  actionType: string,
  maxRequests: number,
  windowMinutes: number
): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient.rpc('check_rate_limit', {
      p_user_id: userId,
      p_action_type: actionType,
      p_max_requests: maxRequests,
      p_window_minutes: windowMinutes
    })
    
    if (error) {
      console.error('Rate limit check error:', error)
      // Fail open - allow request if rate limiting fails
      return true
    }
    
    return data === true
  } catch (error) {
    console.error('Rate limit exception:', error)
    return true // Fail open
  }
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  supabaseClient: SupabaseClient,
  eventType: string,
  action: string,
  success: boolean,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    await supabaseClient.rpc('log_security_event', {
      p_event_type: eventType,
      p_action: action,
      p_success: success,
      p_metadata: metadata
    })
  } catch (error) {
    // Don't fail the request if logging fails
    console.error('Failed to log security event:', error)
  }
}
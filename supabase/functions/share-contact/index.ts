import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, verifyAuth, errorResponse, validationErrorResponse, validateUUID, validateLength } from '../_shared/security.ts'

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Server-derived identity from JWT — never trust client-supplied user IDs
    const authResult = await verifyAuth(req)
    if (authResult.error || !authResult.user || !authResult.supabaseClient) {
      return new Response(
        JSON.stringify({ error: authResult.error || 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const userId = authResult.user.id

    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return validationErrorResponse(['Invalid request body'])
    }

    const { recipientUserId, conversationId } = body

    // Validate inputs
    const errors: string[] = []
    const recipientError = validateUUID(recipientUserId as string, 'recipientUserId')
    if (recipientError) errors.push(recipientError)
    const convError = validateLength(conversationId as string, 'conversationId', 1, 255)
    if (convError) errors.push(convError)
    
    if (errors.length > 0) {
      return validationErrorResponse(errors)
    }

    // 2. Use service role client to call the atomic DB function
    //    The function performs ALL checks in a single locked transaction:
    //    - Self-share prevention
    //    - Mutual match verification
    //    - Phone number existence
    //    - Duplicate share check with row locking
    //    - Insert + system message
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    const { data: result, error: rpcError } = await supabaseAdmin.rpc('atomic_share_contact', {
      p_sharer_id: userId,
      p_recipient_id: recipientUserId as string,
      p_conversation_id: conversationId as string,
    })

    if (rpcError) {
      console.error('Atomic share contact RPC error:', rpcError)
      return errorResponse(rpcError, 'Failed to share contact')
    }

    // The DB function returns a jsonb object with success, error, status fields
    if (!result.success) {
      const status = result.status || 400
      return new Response(
        JSON.stringify({ error: result.error }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        alreadyShared: result.already_shared || false,
        message: result.already_shared ? "Contact already shared" : "Contact shared successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return errorResponse(error, 'Failed to share contact')
  }
};

serve(handler);

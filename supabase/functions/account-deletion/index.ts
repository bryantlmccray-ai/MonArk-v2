import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, verifyAuth, errorResponse } from '../_shared/security.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authResult = await verifyAuth(req)
    if (authResult.error || !authResult.user) {
      return new Response(
        JSON.stringify({ error: authResult.error || 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const user = authResult.user

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // 1. Log the deletion request in security audit (direct insert since RPC uses auth.uid() which is null for admin client)
    await supabaseAdmin.from('security_audit_log').insert({
      event_type: 'account_deletion_request',
      action: 'gdpr_hard_delete',
      user_id: user.id,
      target_user_id: user.id,
      success: true,
      metadata: { requested_at: new Date().toISOString() }
    })

    // 2. Delete all user photos from storage
    try {
      const { data: files } = await supabaseAdmin.storage
        .from('profile-photos')
        .list(user.id)

      if (files && files.length > 0) {
        const filePaths = files.map(f => `${user.id}/${f.name}`)
        await supabaseAdmin.storage
          .from('profile-photos')
          .remove(filePaths)
      }
    } catch (storageErr) {
      console.error('Storage cleanup error (non-fatal):', storageErr)
    }

    // 3. Call the existing DB function to purge all user data from tables
    const { error: deleteError } = await supabaseAdmin.rpc('delete_user_completely', {
      user_id_input: user.id
    })

    if (deleteError) {
      console.error('DB deletion error:', deleteError)
      return errorResponse(deleteError, 'Account deletion failed. Please contact support.')
    }

    // 4. Delete the auth user via admin API (removes from auth.users)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (authDeleteError) {
      console.error('Auth user deletion error:', authDeleteError)
      // Data is already gone, log but don't fail
    }

    // 5. Final audit entry (using admin client since user is now deleted)
    try {
      await supabaseAdmin.from('security_audit_log').insert({
        event_type: 'account_deletion_completed',
        action: 'gdpr_hard_delete',
        user_id: user.id,
        success: true,
        metadata: { completed_at: new Date().toISOString() }
      })
    } catch (_) { /* best effort */ }

    return new Response(
      JSON.stringify({ success: true, message: 'Account and all data permanently deleted' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return errorResponse(error, 'Account deletion failed')
  }
})

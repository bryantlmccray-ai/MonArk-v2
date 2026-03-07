import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders, verifyAuth, errorResponse } from '../_shared/security.ts'

/**
 * Photo Moderation Edge Function
 * 
 * Scans uploaded profile photos for inappropriate content using OpenAI's
 * vision API (GPT-4o-mini). Called after upload; removes the photo from
 * storage and returns a rejection if content is flagged.
 *
 * Request body: { photoUrl: string, filePath: string }
 * Response:     { approved: boolean, reason?: string }
 */

const MODERATION_PROMPT = `You are a content moderation system for a dating app. Analyze this profile photo and determine if it is appropriate.

REJECT the photo if it contains ANY of the following:
- Nudity or sexually explicit content
- Violence, gore, or graphic injury
- Hate symbols, slurs, or extremist imagery
- Drug use or illegal activity
- Photos of minors (anyone appearing under 18)
- Non-photo content (screenshots, memes, text-heavy images, ads)
- Clearly fake/AI-generated faces intended to catfish

APPROVE the photo if it is a normal profile photo showing a person, group, pet, scenery, hobby, or similar appropriate content.

Respond with ONLY a JSON object: {"approved": true} or {"approved": false, "reason": "<brief reason>"}
Do not include any other text.`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authResult = await verifyAuth(req)
    if (authResult.error || !authResult.user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { photoUrl, filePath } = await req.json()

    if (!photoUrl || !filePath) {
      return new Response(
        JSON.stringify({ error: 'photoUrl and filePath are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the file belongs to the authenticated user
    if (!filePath.startsWith(authResult.user.id + '/')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: file does not belong to user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      // If no API key, approve by default but log warning
      console.warn('OPENAI_API_KEY not set — skipping photo moderation')
      return new Response(
        JSON.stringify({ approved: true, skipped: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call OpenAI Vision API for content moderation
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: MODERATION_PROMPT },
              { type: 'image_url', image_url: { url: photoUrl, detail: 'low' } },
            ],
          },
        ],
        max_tokens: 150,
        temperature: 0,
      }),
    })

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text()
      console.error('OpenAI API error:', openaiResponse.status, errText)
      // On API failure, approve but flag for manual review
      return new Response(
        JSON.stringify({ approved: true, needsManualReview: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices?.[0]?.message?.content?.trim() || ''

    // Parse the moderation result
    let moderationResult: { approved: boolean; reason?: string }
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      moderationResult = JSON.parse(cleaned)
    } catch {
      console.error('Failed to parse moderation response:', content)
      // If we can't parse, approve but flag for manual review
      return new Response(
        JSON.stringify({ approved: true, needsManualReview: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If rejected, delete the photo from storage
    if (!moderationResult.approved) {
      try {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        await supabaseAdmin.storage
          .from('profile-photos')
          .remove([filePath])

        // Log the moderation action
        await supabaseAdmin
          .from('security_audit_log')
          .insert({
            event_type: 'photo_moderation',
            user_id: authResult.user.id,
            action: 'photo_rejected',
            success: true,
            metadata: {
              file_path: filePath,
              reason: moderationResult.reason || 'Content policy violation',
            },
          })
      } catch (cleanupError) {
        console.error('Error cleaning up rejected photo:', cleanupError)
      }
    }

    return new Response(
      JSON.stringify({
        approved: moderationResult.approved,
        reason: moderationResult.approved ? undefined : (moderationResult.reason || 'Content policy violation'),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return errorResponse(error, 'Photo moderation failed')
  }
})

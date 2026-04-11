import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { requireAAL2 } from '../_shared/security.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Verify the request is from a trusted source (cron job or admin).
 * Accepts either:
 * 1. A valid admin JWT in the Authorization header
 * 2. A matching CRON_SECRET in the x-cron-secret header
 */
async function verifyCronOrAdmin(req: Request): Promise<{ authorized: boolean; method: string }> {
  // Check for cron secret first (for scheduled invocations)
  const cronSecret = req.headers.get('x-cron-secret');
  const expectedSecret = Deno.env.get('CRON_SECRET');
  if (expectedSecret && cronSecret && cronSecret === expectedSecret) {
    return { authorized: true, method: 'cron_secret' };
  }

  // Fall back to admin JWT auth
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { authorized: false, method: 'none' };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return { authorized: false, method: 'invalid_jwt' };
  }

  // Check admin role
  const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const { data: roleData } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleData?.role === 'admin') {
    // Require MFA (aal2) for admin operations
    const mfaResponse = requireAAL2(req);
    if (mfaResponse) {
      return { authorized: false, method: 'mfa_required' };
    }
    return { authorized: true, method: 'admin_jwt' };
  }

  return { authorized: false, method: 'insufficient_role' };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authorization
    const { authorized, method } = await verifyCronOrAdmin(req);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!authorized) {
      // Log the denied attempt
      await supabase.from('security_audit_log').insert({
        event_type: 'unauthorized_cron_access',
        action: 'check-date-feedback',
        success: false,
        metadata: { method }
      });
      console.error(`Unauthorized check-date-feedback attempt (method: ${method})`);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`check-date-feedback authorized via: ${method}`);

    // Find contact shares that are 48+ hours old and haven't had feedback notifications sent
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    console.log(`Checking for contact shares older than ${fortyEightHoursAgo}`);

    const { data: contactShares, error: sharesError } = await supabase
      .from('contact_shares')
      .select(`
        id,
        sharer_user_id,
        recipient_user_id,
        conversation_id,
        shared_at,
        feedback_notification_sent
      `)
      .lte('shared_at', fortyEightHoursAgo)
      .eq('feedback_notification_sent', false);

    if (sharesError) {
      console.error('Error fetching contact shares:', sharesError);
      throw sharesError;
    }

    console.log(`Found ${contactShares?.length || 0} contact shares needing feedback notifications`);

    if (!contactShares || contactShares.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending feedback notifications" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let notificationsSent = 0;

    for (const share of contactShares) {
      try {
        // Get sharer's name
        const { data: sharerProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', share.sharer_user_id)
          .single();

        // Get recipient's name
        const { data: recipientProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', share.recipient_user_id)
          .single();

        const sharerName = sharerProfile?.name || 'your match';
        const recipientName = recipientProfile?.name || 'your match';

        // Check if feedback already exists for sharer
        const { data: sharerFeedback } = await supabase
          .from('contact_share_feedback')
          .select('id')
          .eq('contact_share_id', share.id)
          .eq('user_id', share.sharer_user_id)
          .maybeSingle();

        // Send notification to sharer if no feedback yet
        if (!sharerFeedback) {
          await supabase.from('notifications').insert({
            user_id: share.sharer_user_id,
            type: 'date_feedback_request',
            title: `How'd your date with ${recipientName} go?`,
            message: "We'd love to hear about your experience!",
            data: {
              contact_share_id: share.id,
              match_user_id: share.recipient_user_id,
              conversation_id: share.conversation_id
            }
          });
          console.log(`Sent feedback notification to sharer ${share.sharer_user_id}`);
          notificationsSent++;
        }

        // Check if feedback already exists for recipient
        const { data: recipientFeedback } = await supabase
          .from('contact_share_feedback')
          .select('id')
          .eq('contact_share_id', share.id)
          .eq('user_id', share.recipient_user_id)
          .maybeSingle();

        // Send notification to recipient if no feedback yet
        if (!recipientFeedback) {
          await supabase.from('notifications').insert({
            user_id: share.recipient_user_id,
            type: 'date_feedback_request',
            title: `How'd your date with ${sharerName} go?`,
            message: "We'd love to hear about your experience!",
            data: {
              contact_share_id: share.id,
              match_user_id: share.sharer_user_id,
              conversation_id: share.conversation_id
            }
          });
          console.log(`Sent feedback notification to recipient ${share.recipient_user_id}`);
          notificationsSent++;
        }

        // Mark the contact share as notified
        await supabase
          .from('contact_shares')
          .update({
            feedback_notification_sent: true,
            feedback_notification_sent_at: new Date().toISOString()
          })
          .eq('id', share.id);

      } catch (shareError) {
        console.error(`Error processing share ${share.id}:`, shareError);
      }
    }

    console.log(`Sent ${notificationsSent} feedback notifications for contact shares`);

    // ── After-Date Journal Prompts ────────────────────────────────────────
    // Find accepted date proposals whose time_suggestion ended 24+ hours ago
    // and no journal entry exists yet — send a personalized "how did it go?" email
    // 48h delay: gives users space before prompting reflection
    const twentyFourHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    let journalPromptsCount = 0;

    try {
      const { data: pastProposals, error: proposalsError } = await supabase
        .from('date_proposals')
        .select(`
          id,
          creator_user_id,
          recipient_user_id,
          title,
          activity,
          time_suggestion,
          journal_prompt_sent
        `)
        .eq('status', 'accepted')
        .lte('time_suggestion', twentyFourHoursAgo)
        .eq('journal_prompt_sent', false);

      if (proposalsError) {
        console.error('Error fetching past proposals:', proposalsError);
      } else if (pastProposals && pastProposals.length > 0) {
        console.log(`Found ${pastProposals.length} past proposals needing journal prompts`);

        for (const proposal of pastProposals) {
          try {
            // Check if a journal entry already exists for this proposal
            const { data: existingEntry } = await supabase
              .from('date_journal')
              .select('id')
              .eq('date_proposal_id', proposal.id)
              .maybeSingle();

            if (!existingEntry) {
              // Fetch partner name for the creator
              const { data: recipientProfile } = await supabase
                .from('profiles')
                .select('name, email')
                .eq('id', proposal.recipient_user_id)
                .single();

              const { data: creatorProfile } = await supabase
                .from('profiles')
                .select('name, email')
                .eq('id', proposal.creator_user_id)
                .single();

              const partnerFirstNameForCreator = recipientProfile?.name?.split(' ')?.[0] || 'your date';
              const partnerFirstNameForRecipient = creatorProfile?.name?.split(' ')?.[0] || 'your date';
              const dateTitle = proposal.title || proposal.activity || 'your date';

              // Send journal prompt to proposal creator
// In-app journal prompt to proposal creator
                          await supabase.from('notifications').insert({
                                          user_id: proposal.creator_user_id,
                                          type: 'journal_prompt',
                                          title: `How did it go with ${partnerFirstNameForCreator}? ✦`,
                                          message: `Take a moment to reflect on your time together. Your journal is waiting — no rush.`,
                                          action_url: `/dates?log=${proposal.id}`,
                                          action_label: 'Open your journal',
                                          is_read: false,
                                          created_at: new Date().toISOString(),
                          });
                          journalPromptsCount++;

              // Send journal prompt to recipient
// In-app journal prompt to recipient
                          await supabase.from('notifications').insert({
                                          user_id: proposal.recipient_user_id,
                                          type: 'journal_prompt',
                                          title: `How did it go with ${partnerFirstNameForRecipient}? ✦`,
                                          message: `Take a moment to reflect on your time together. Your journal is waiting — no rush.`,
                                          action_url: `/dates?log=${proposal.id}`,
                                          action_label: 'Open your journal',
                                          is_read: false,
                                          created_at: new Date().toISOString(),
                          });
                          journalPromptsCount++;
            }

            // Mark proposal so we don't prompt again
            await supabase
              .from('date_proposals')
              .update({
                journal_prompt_sent: true,
                journal_prompt_sent_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', proposal.id);

          } catch (proposalErr) {
            console.error(`Error processing journal prompt for proposal ${proposal.id}:`, proposalErr);
          }
        }
      }
    } catch (journalCheckErr) {
      console.error('Error in after-date journal prompt check:', journalCheckErr);
      // Non-fatal — continue to return success
    }

    console.log(`Sent ${journalPromptsCount} after-date journal prompt emails`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent,
        sharesProcessed: contactShares.length,
        journalPromptsCount
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in check-date-feedback function:", error);
    return new Response(
      JSON.stringify({ error: "An internal error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);

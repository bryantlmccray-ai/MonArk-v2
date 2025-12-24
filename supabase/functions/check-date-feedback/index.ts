import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    console.log(`Sent ${notificationsSent} feedback notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent,
        sharesProcessed: contactShares.length 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in check-date-feedback function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);

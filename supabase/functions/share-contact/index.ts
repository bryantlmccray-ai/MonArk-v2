import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, verifyAuth, errorResponse, validationErrorResponse, validateUUID, validateLength } from '../_shared/security.ts'

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authResult = await verifyAuth(req)
    if (authResult.error || !authResult.user || !authResult.supabaseClient) {
      return new Response(
        JSON.stringify({ error: authResult.error || 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const user = authResult.user
    const supabase = authResult.supabaseClient

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

    console.log(`User ${user.id} sharing contact with ${recipientUserId} in conversation ${conversationId}`);

    // Get the sharer's phone number
    const { data: sharerProfile, error: sharerError } = await supabase
      .from("user_profiles")
      .select("phone_number")
      .eq("user_id", user.id)
      .single();

    if (sharerError || !sharerProfile?.phone_number) {
      return new Response(
        JSON.stringify({ error: "Please add your phone number to your profile first" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if contact was already shared
    const { data: existingShare } = await supabase
      .from("contact_shares")
      .select("id")
      .eq("sharer_user_id", user.id)
      .eq("recipient_user_id", recipientUserId)
      .single();

    if (existingShare) {
      return new Response(
        JSON.stringify({ success: true, alreadyShared: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert the contact share record
    const { error: shareError } = await supabase
      .from("contact_shares")
      .insert({
        sharer_user_id: user.id,
        recipient_user_id: recipientUserId as string,
        conversation_id: conversationId as string,
        sms_sent: false,
      });

    if (shareError) {
      console.error("Share insert error:", shareError);
      return new Response(
        JSON.stringify({ error: "Failed to share contact" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send a system message in the conversation
    const { data: sharerName } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    const systemMessage = `📱 ${sharerName?.name || "Your match"} shared their phone number with you!`;
    
    await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId as string,
        sender_user_id: user.id,
        recipient_user_id: recipientUserId as string,
        content: systemMessage,
        message_type: "system",
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Contact shared successfully",
        phoneNumber: sharerProfile.phone_number
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return errorResponse(error, 'Failed to share contact')
  }
};

serve(handler);

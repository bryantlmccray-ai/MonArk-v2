import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShareContactRequest {
  recipientUserId: string;
  conversationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { recipientUserId, conversationId }: ShareContactRequest = await req.json();
    console.log(`User ${user.id} sharing contact with ${recipientUserId} in conversation ${conversationId}`);

    // Get the sharer's phone number
    const { data: sharerProfile, error: sharerError } = await supabase
      .from("user_profiles")
      .select("phone_number")
      .eq("user_id", user.id)
      .single();

    if (sharerError || !sharerProfile?.phone_number) {
      console.error("Sharer profile error:", sharerError);
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
      console.log("Contact already shared");
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
        recipient_user_id: recipientUserId,
        conversation_id: conversationId,
        sms_sent: false, // SMS sending can be added later with Twilio
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
        conversation_id: conversationId,
        sender_user_id: user.id,
        recipient_user_id: recipientUserId,
        content: systemMessage,
        message_type: "system",
      });

    console.log("Contact shared successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Contact shared successfully",
        phoneNumber: sharerProfile.phone_number
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in share-contact function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);

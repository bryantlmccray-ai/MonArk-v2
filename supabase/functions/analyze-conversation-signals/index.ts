// REQUIRED: Set ANTHROPIC_API_KEY in Supabase Dashboard -> Edge Functions -> Secrets before deploying.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RIFScores {
  emotional_intelligence: number;
  communication_style: number;
  lifestyle_alignment: number;
  relationship_readiness: number;
  growth_orientation: number;
}

interface ConversationSignals {
  neighborhood_preference: string | null;
  cuisine_preferences: string[];
  atmosphere_preferences: string[];
  price_sensitivity: string | null;
  mentioned_venues: string[];
}

interface RequestBody {
  conversation_id: string;
  user_id: string;
  current_rif_scores: RIFScores;
}

function fallbackResponse(rifScores: RIFScores) {
  return new Response(
    JSON.stringify({
      signals: {
        neighborhood_preference: null,
        cuisine_preferences: [],
        atmosphere_preferences: [],
        price_sensitivity: null,
        mentioned_venues: [],
      } as ConversationSignals,
      confidence: 0,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return fallbackResponse({
      emotional_intelligence: 50,
      communication_style: 50,
      lifestyle_alignment: 50,
      relationship_readiness: 50,
      growth_orientation: 50,
    });
  }

  const { conversation_id, user_id, current_rif_scores } = body;

  if (!conversation_id || !user_id) {
    return fallbackResponse(current_rif_scores);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

  if (!supabaseUrl || !supabaseKey || !anthropicKey) {
    console.error("[analyze-conversation-signals] Missing required env vars");
    return fallbackResponse(current_rif_scores);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("sender_id, content, created_at")
    .eq("conversation_id", conversation_id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (messagesError || !messages || messages.length === 0) {
    console.warn("[analyze-conversation-signals] No messages:", messagesError?.message);
    return fallbackResponse(current_rif_scores);
  }

  const transcript = messages
    .reverse()
    .map((m: { sender_id: string; content: string }) => {
      const label = m.sender_id === user_id ? "User A" : "User B";
      return label + ": " + m.content;
    })
    .join("\n");

  const systemPrompt =
    "You are a venue preference signal extractor for MonArk, an intentional relationship platform. " +
    "Analyze the conversation and extract preference signals relevant to suggesting a meeting venue. " +
    "Return ONLY a valid JSON object - no preamble, no markdown, no explanation.";

  const userPrompt =
    "Extract venue preference signals from this conversation. Return a JSON object with exactly these fields:\n" +
    "{\n" +
    '  "neighborhood_preference": string or null,\n' +
    '  "cuisine_preferences": string[],\n' +
    '  "atmosphere_preferences": string[],\n' +
    '  "price_sensitivity": "budget" | "moderate" | "upscale" | "luxury" | null,\n' +
    '  "mentioned_venues": string[]\n' +
    "}\n\nConversation:\n" + transcript;

  let anthropicResponse: Response;
  try {
    anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
  } catch (fetchErr) {
    console.error("[analyze-conversation-signals] Anthropic fetch error:", fetchErr);
    return fallbackResponse(current_rif_scores);
  }

  if (!anthropicResponse.ok) {
    console.error("[analyze-conversation-signals] Anthropic API error:", anthropicResponse.status);
    return fallbackResponse(current_rif_scores);
  }

  let claudeData: { content: Array<{ type: string; text: string }> };
  try {
    claudeData = await anthropicResponse.json();
  } catch {
    return fallbackResponse(current_rif_scores);
  }

  const rawText = claudeData?.content?.[0]?.text ?? "";

  let signals: ConversationSignals;
  let confidence = 0;

  try {
    const cleaned = rawText
      .replace(/^```json?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    signals = {
      neighborhood_preference:
        typeof parsed.neighborhood_preference === "string"
          ? parsed.neighborhood_preference
          : null,
      cuisine_preferences: Array.isArray(parsed.cuisine_preferences)
        ? parsed.cuisine_preferences.filter((x: unknown) => typeof x === "string")
        : [],
      atmosphere_preferences: Array.isArray(parsed.atmosphere_preferences)
        ? parsed.atmosphere_preferences.filter((x: unknown) => typeof x === "string")
        : [],
      price_sensitivity: ["budget", "moderate", "upscale", "luxury"].includes(
        parsed.price_sensitivity
      )
        ? parsed.price_sensitivity
        : null,
      mentioned_venues: Array.isArray(parsed.mentioned_venues)
        ? parsed.mentioned_venues.filter((x: unknown) => typeof x === "string")
        : [],
    };

    const signalCount =
      (signals.neighborhood_preference ? 1 : 0) +
      Math.min(signals.cuisine_preferences.length, 3) +
      Math.min(signals.atmosphere_preferences.length, 2) +
      (signals.price_sensitivity ? 1 : 0) +
      Math.min(signals.mentioned_venues.length, 2);

    confidence = Math.min(1, parseFloat((signalCount / 9).toFixed(2)));
  } catch (parseErr) {
    console.error("[analyze-conversation-signals] JSON parse error:", parseErr);
    return fallbackResponse(current_rif_scores);
  }

  return new Response(JSON.stringify({ signals, confidence }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

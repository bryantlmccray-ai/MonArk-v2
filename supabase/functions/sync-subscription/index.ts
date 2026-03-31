import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map RevenueCat entitlement IDs to our tier names
const ENTITLEMENT_TO_TIER: Record<string, string> = {
  ark: "plus",
  inner_ark: "monarch",
  the_ark: "plus",
  the_inner_ark: "monarch",
  monark_ark: "plus",
  monark_inner_ark: "monarch",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
    const authHeader = req.headers.get("authorization");

    // Validate webhook authenticity
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      console.error("Invalid webhook authorization");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const event = body?.event;

    if (!event) {
      return new Response(JSON.stringify({ error: "Missing event payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const appUserId = event.app_user_id;
    const eventType = event.type; // INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, etc.
    const entitlements = event.entitlement_ids || [];
    const expirationDate = event.expiration_at_ms
      ? new Date(event.expiration_at_ms).toISOString()
      : null;
    const productId = event.product_id || null;
    const priceUsd = event.price_in_purchased_currency || null;
    const currency = event.currency || null;
    const environment = event.environment || "PRODUCTION";

    if (!appUserId) {
      return new Response(
        JSON.stringify({ error: "Missing app_user_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Optional: Verify subscription state with RevenueCat REST API (server-to-server key)
    const rcServerKey = Deno.env.get("REVENUECAT_API_KEY");
    let verifiedEntitlements = entitlements;

    if (rcServerKey) {
      try {
        const rcResponse = await fetch(
          `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${rcServerKey}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (rcResponse.ok) {
          const rcData = await rcResponse.json();
          const activeEntitlements = rcData?.subscriber?.entitlements || {};
          verifiedEntitlements = Object.keys(activeEntitlements).filter(
            (key) => activeEntitlements[key]?.expires_date === null ||
              new Date(activeEntitlements[key]?.expires_date) > new Date()
          );
          console.log("RevenueCat verified entitlements:", verifiedEntitlements);
        } else {
          console.warn(`RevenueCat API returned ${rcResponse.status}, falling back to webhook data`);
        }
      } catch (rcErr) {
        console.warn("RevenueCat verification failed, using webhook data:", rcErr);
      }
    }

    // Determine the tier from entitlements (use verified if available)
    let newTier = "free";
    const entitlementsToCheck = verifiedEntitlements.length > 0 ? verifiedEntitlements : entitlements;
    for (const entitlement of entitlementsToCheck) {
      const mapped = ENTITLEMENT_TO_TIER[entitlement.toLowerCase()];
      if (mapped) {
        // Pick the highest tier
        if (mapped === "monarch" || (mapped === "plus" && newTier !== "monarch")) {
          newTier = mapped;
        }
      }
    }

    // Determine subscription status based on event type
    const activeEvents = ["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION", "SUBSCRIPTION_EXTENDED"];
    const newStatus = activeEvents.includes(eventType) ? "active" : "inactive";
    if (newStatus === "inactive") {
      newTier = "free";
    }

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update user_profiles with new subscription state
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        subscription_tier: newTier,
        subscription_status: newStatus,
        subscription_expires_at: expirationDate,
      })
      .eq("user_id", appUserId);

    if (updateError) {
      console.error("Failed to update user profile:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update subscription" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log the subscription event
    const previousTierResult = await supabase
      .from("user_profiles")
      .select("subscription_tier")
      .eq("user_id", appUserId)
      .single();

    await supabase.from("subscription_events").insert({
      user_id: appUserId,
      event_type: eventType,
      tier: newTier,
      previous_tier: previousTierResult.data?.subscription_tier || "free",
      product_id: productId,
      price_usd: priceUsd,
      currency: currency,
      environment: environment,
      revenuecat_event_id: event.id || null,
      payload: event,
    });

    // Log to security audit
    await supabase.from("security_audit_log").insert({
      event_type: "subscription_change",
      user_id: appUserId,
      action: `revenuecat_${eventType.toLowerCase()}`,
      success: true,
      metadata: {
        new_tier: newTier,
        new_status: newStatus,
        product_id: productId,
        environment: environment,
      },
    });

    console.log(
      `Subscription synced: user=${appUserId} tier=${newTier} status=${newStatus} event=${eventType}`
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: corsHeaders }
    );
  }
});

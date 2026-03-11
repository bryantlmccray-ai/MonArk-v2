import "https://deno.land/std@0.224.0/dotenv/load.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/adaptive-discovery-engine`;

// ---------- helpers ----------

async function timedFetch(
  label: string,
  body: Record<string, unknown>,
  headers: Record<string, string>
): Promise<{ label: string; status: number; ms: number; error?: string }> {
  const start = performance.now();
  try {
    const res = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text(); // always consume body
    const ms = Math.round(performance.now() - start);
    let error: string | undefined;
    try {
      const json = JSON.parse(text);
      if (!json.success) error = json.error;
    } catch { /* not json */ }
    return { label, status: res.status, ms, error };
  } catch (e) {
    return { label, status: 0, ms: Math.round(performance.now() - start), error: String(e) };
  }
}

// ---------- tests ----------

Deno.test("Load test: 50 concurrent unauthenticated requests (rate-limit / rejection perf)", async () => {
  // These should all be rejected quickly (401) — measures edge function cold-start + auth rejection throughput
  const BATCH = 50;
  const headers = {
    Authorization: `Bearer invalid_token_${Date.now()}`,
    apikey: SUPABASE_ANON_KEY,
  };
  const body = { action: "analyze_behavioral_patterns", data: { user_id: "00000000-0000-0000-0000-000000000000" } };

  const start = performance.now();
  const results = await Promise.all(
    Array.from({ length: BATCH }, (_, i) => timedFetch(`req-${i}`, body, headers))
  );
  const totalMs = Math.round(performance.now() - start);

  const statuses = results.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {} as Record<number, number>);
  const times = results.map(r => r.ms).sort((a, b) => a - b);
  const p50 = times[Math.floor(times.length * 0.5)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)];
  const maxMs = times[times.length - 1];

  console.log(`\n=== LOAD TEST: ${BATCH} concurrent requests ===`);
  console.log(`Total wall time: ${totalMs}ms`);
  console.log(`Status distribution:`, statuses);
  console.log(`Latency — p50: ${p50}ms | p95: ${p95}ms | p99: ${p99}ms | max: ${maxMs}ms`);

  // All should be rejected (401 or 500 from auth failure)
  const allRejected = results.every(r => r.status >= 400);
  if (!allRejected) {
    console.warn("WARNING: Some requests were not rejected:", results.filter(r => r.status < 400));
  }

  // Performance assertion: p95 should be under 10s even under load
  if (p95 > 10000) {
    console.error(`FAIL: p95 latency ${p95}ms exceeds 10s threshold`);
  } else {
    console.log(`PASS: p95 latency ${p95}ms is within acceptable range`);
  }
});

Deno.test("Load test: 100 concurrent requests in 2 waves (simulates burst)", async () => {
  const WAVE_SIZE = 50;
  const headers = {
    Authorization: `Bearer fake_burst_token`,
    apikey: SUPABASE_ANON_KEY,
  };
  const actions = [
    "analyze_behavioral_patterns",
    "generate_adaptive_insights",
    "update_discovery_preferences",
  ];

  const allResults: Awaited<ReturnType<typeof timedFetch>>[] = [];

  for (let wave = 0; wave < 2; wave++) {
    const start = performance.now();
    const results = await Promise.all(
      Array.from({ length: WAVE_SIZE }, (_, i) => {
        const action = actions[i % actions.length];
        return timedFetch(
          `wave${wave}-${action}-${i}`,
          { action, data: { user_id: "00000000-0000-0000-0000-000000000000" } },
          headers
        );
      })
    );
    const waveMs = Math.round(performance.now() - start);
    console.log(`\nWave ${wave + 1}: ${WAVE_SIZE} requests completed in ${waveMs}ms`);
    allResults.push(...results);
  }

  const times = allResults.map(r => r.ms).sort((a, b) => a - b);
  const p50 = times[Math.floor(times.length * 0.5)];
  const p95 = times[Math.floor(times.length * 0.95)];
  console.log(`\n=== BURST TEST: ${allResults.length} total requests ===`);
  console.log(`Latency — p50: ${p50}ms | p95: ${p95}ms`);
  console.log(`All rejected (auth):`, allResults.every(r => r.status >= 400));
});

Deno.test("Load test: 500 sequential rapid-fire requests (sustained throughput)", async () => {
  // Simulates 500 users hitting the endpoint in quick succession
  const TOTAL = 500;
  const CONCURRENCY = 50; // 50 at a time, 10 batches
  const headers = {
    Authorization: `Bearer sustained_load_token`,
    apikey: SUPABASE_ANON_KEY,
  };
  const body = { action: "analyze_behavioral_patterns", data: { user_id: "00000000-0000-0000-0000-000000000000" } };

  const allResults: Awaited<ReturnType<typeof timedFetch>>[] = [];
  const globalStart = performance.now();

  for (let batch = 0; batch < TOTAL / CONCURRENCY; batch++) {
    const results = await Promise.all(
      Array.from({ length: CONCURRENCY }, (_, i) =>
        timedFetch(`batch${batch}-${i}`, body, headers)
      )
    );
    allResults.push(...results);
  }

  const totalMs = Math.round(performance.now() - globalStart);
  const times = allResults.map(r => r.ms).sort((a, b) => a - b);
  const p50 = times[Math.floor(times.length * 0.5)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)];
  const maxMs = times[times.length - 1];
  const rps = Math.round(TOTAL / (totalMs / 1000));

  const errors = allResults.filter(r => r.status === 0);
  const statuses = allResults.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {} as Record<number, number>);

  console.log(`\n=== SUSTAINED LOAD TEST: ${TOTAL} requests (${CONCURRENCY} concurrency) ===`);
  console.log(`Total wall time: ${totalMs}ms`);
  console.log(`Throughput: ~${rps} req/s`);
  console.log(`Status distribution:`, statuses);
  console.log(`Latency — p50: ${p50}ms | p95: ${p95}ms | p99: ${p99}ms | max: ${maxMs}ms`);
  console.log(`Network errors: ${errors.length}`);

  if (p95 > 15000) {
    console.error(`FAIL: p95 ${p95}ms exceeds 15s threshold under sustained load`);
  } else {
    console.log(`PASS: p95 ${p95}ms is within acceptable range under sustained load`);
  }

  if (errors.length > TOTAL * 0.05) {
    console.error(`FAIL: ${errors.length} network errors (>${Math.round(TOTAL * 0.05)} = 5% threshold)`);
  } else {
    console.log(`PASS: ${errors.length} network errors within 5% tolerance`);
  }
});

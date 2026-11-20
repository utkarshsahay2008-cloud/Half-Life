import { NextResponse } from "next/server";
import { checkBifrostHealth } from "@/lib/services/bifrost";

export async function GET() {
  const bifrostHealth = await checkBifrostHealth();
  const hasTavilyKey = Boolean(
    process.env.TAVILY_API_KEY && process.env.TAVILY_API_KEY.trim().length > 0
  );
  const isFallbackMode = process.env.DEMO_FALLBACK_MODE === "true";

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    bifrost: {
      connected: bifrostHealth.connected,
      baseURL: bifrostHealth.baseURL,
      latencyMs: bifrostHealth.latencyMs,
      error: bifrostHealth.error || null,
      defaultModelRouting: {
        extractor: "groq/openai/gpt-oss-20b (Claim Decomposition)",
        adjudicator: "groq/openai/gpt-oss-120b (Reasoning Adjudication)",
      },
    },
    tavily: {
      active: hasTavilyKey,
      searchDepth: "advanced",
      searchSkipEnabled: true,
    },
    resilience: {
      demoFallbackMode: isFallbackMode,
      seededSpecimensReady: true,
    },
  });
}

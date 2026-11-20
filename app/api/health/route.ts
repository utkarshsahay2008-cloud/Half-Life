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
        extractor: "openai/gpt-4o-mini (JSON mode)",
        adjudicator: "openai/gpt-4o (Reasoning)",
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

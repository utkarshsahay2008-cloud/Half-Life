import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateTextWithBifrost,
  extractClaimsWithBifrost,
  adjudicateClaimWithBifrost,
  BifrostTelemetryTrace,
} from "@/lib/services/bifrost";
import { searchTavilyForClaim, TavilySearchResult } from "@/lib/services/tavily";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, model = "openai/gpt-4o-mini" } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const routingTraces: BifrostTelemetryTrace[] = [];

    // 1. Generate fresh or stale candidate response using Bifrost Gateway
    const generationResult = await generateTextWithBifrost(prompt, model);
    routingTraces.push(generationResult.trace);
    const generatedText = generationResult.text;

    // 2. Multi-Model Claim Extraction via gpt-4o-mini
    const extractionResult = await extractClaimsWithBifrost(generatedText);
    routingTraces.push(extractionResult.trace);
    const extractedClaims = extractionResult.claims;

    // 3. Tavily Grounding & High-Reasoning Adjudication via gpt-4o
    let totalSearchSkipSavingsMs = 0;
    const processedClaims: Array<{
      claimIndex: number;
      originalSpan: string;
      category: string;
      halfLifeDays: number;
      expiredAtDate: string;
      freshnessScore: number;
      status: string;
      liveTruth: string;
      correctedReplacement: string;
      adjudicatorReasoning: string;
      sources: TavilySearchResult[];
    }> = [];

    for (const rawClaim of extractedClaims) {
      const searchResult = await searchTavilyForClaim(rawClaim.searchQuery, rawClaim.category);
      if (searchResult.skipped) {
        totalSearchSkipSavingsMs += searchResult.savedLatencyMs;
      }

      const adjudicationResult = await adjudicateClaimWithBifrost(rawClaim, searchResult.sources);
      routingTraces.push(adjudicationResult.trace);

      processedClaims.push({
        claimIndex: rawClaim.claimIndex,
        originalSpan: rawClaim.originalSpan,
        category: rawClaim.category,
        halfLifeDays: rawClaim.halfLifeDays,
        expiredAtDate: adjudicationResult.adjudication.expiredAtDate,
        freshnessScore: adjudicationResult.adjudication.freshnessScore,
        status: adjudicationResult.adjudication.status,
        liveTruth: adjudicationResult.adjudication.liveTruth,
        correctedReplacement: adjudicationResult.adjudication.correctedReplacement,
        adjudicatorReasoning: adjudicationResult.adjudication.adjudicatorReasoning,
        sources: searchResult.sources,
      });
    }

    // 4. Compute overall freshness score
    const overallFreshnessScore =
      processedClaims.length > 0
        ? Math.round(
            processedClaims.reduce((acc, c) => acc + c.freshnessScore, 0) / processedClaims.length
          )
        : 100;

    // 5. Construct patched text
    let patched = generatedText;
    for (const c of processedClaims) {
      if (c.status !== "FRESH" && c.correctedReplacement && c.originalSpan) {
        patched = patched.split(c.originalSpan).join(c.correctedReplacement);
      }
    }

    // 6. Persist AuditReport to SQLite database
    const savedAudit = await prisma.auditReport.create({
      data: {
        title: `Live Prompt Test: ${prompt.slice(0, 48)}...`,
        mode: "GENERATION",
        rawText: generatedText,
        patchedText: patched,
        overallFreshnessScore,
        bifrostRoutingTrace: JSON.stringify(routingTraces),
        searchSkipSavingsMs: totalSearchSkipSavingsMs,
        claims: {
          create: processedClaims.map((c) => ({
            claimIndex: c.claimIndex,
            originalSpan: c.originalSpan,
            category: c.category,
            halfLifeDays: c.halfLifeDays,
            expiredAtDate: c.expiredAtDate,
            freshnessScore: c.freshnessScore,
            status: c.status,
            liveTruth: c.liveTruth,
            correctedReplacement: c.correctedReplacement,
            adjudicatorReasoning: c.adjudicatorReasoning,
            sources: {
              create: c.sources.map((s) => ({
                title: s.title,
                url: s.url,
                domain: s.domain,
                publishedDate: s.publishedDate,
                snippet: s.snippet,
                relevanceScore: s.relevanceScore,
              })),
            },
          })),
        },
      },
      include: {
        claims: {
          include: {
            sources: true,
          },
        },
      },
    });

    return NextResponse.json({ audit: savedAudit }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/generate] Error:", err);
    return NextResponse.json(
      { error: "Generation & audit pipeline failed", details: err?.message },
      { status: 500 }
    );
  }
}

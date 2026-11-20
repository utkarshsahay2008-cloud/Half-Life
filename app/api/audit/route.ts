import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  extractClaimsWithBifrost,
  adjudicateClaimWithBifrost,
  BifrostTelemetryTrace,
} from "@/lib/services/bifrost";
import { searchTavilyForClaim, TavilySearchResult } from "@/lib/services/tavily";

export async function GET() {
  try {
    const audits = await prisma.auditReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        claims: {
          select: {
            id: true,
            claimIndex: true,
            category: true,
            freshnessScore: true,
            status: true,
            expiredAtDate: true,
          },
        },
      },
    });

    return NextResponse.json({ audits });
  } catch (err: any) {
    console.error("[GET /api/audit] Error:", err);
    return NextResponse.json({ error: "Failed to fetch audits" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, title = "Temporal Decay Audit", mode = "AUDIT", slug } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required for auditing." }, { status: 400 });
    }

    const routingTraces: BifrostTelemetryTrace[] = [];
    let totalSearchSkipSavingsMs = 0;

    // 1. Stage 1: Multi-Model Routing -> gpt-4o-mini claim decomposition
    const extractionResult = await extractClaimsWithBifrost(text);
    routingTraces.push(extractionResult.trace);
    const extractedClaims = extractionResult.claims;

    // 2. Stage 2: Tavily Grounding & Bifrost gpt-4o Freshness Adjudication
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
      // Tavily search or search-skip optimization
      const searchResult = await searchTavilyForClaim(rawClaim.searchQuery, rawClaim.category);
      if (searchResult.skipped) {
        totalSearchSkipSavingsMs += searchResult.savedLatencyMs;
      }

      // High-reasoning adjudication
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

    // 3. Compute overall aggregate freshness score
    const overallFreshnessScore =
      processedClaims.length > 0
        ? Math.round(
            processedClaims.reduce((acc, c) => acc + c.freshnessScore, 0) / processedClaims.length
          )
        : 100;

    // 4. Generate patched text by replacing stale spans with verified live replacements
    let patched = text;
    for (const c of processedClaims) {
      if (c.status !== "FRESH" && c.correctedReplacement && c.originalSpan) {
        patched = patched.split(c.originalSpan).join(c.correctedReplacement);
      }
    }

    // 5. Persist complete audit record with Prisma in SQLite
    const savedAudit = await prisma.auditReport.create({
      data: {
        slug: slug || undefined,
        title: title || "Temporal Decay Audit",
        mode,
        rawText: text,
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
    console.error("[POST /api/audit] Pipeline failure:", err);
    return NextResponse.json(
      { error: "Failed to execute audit pipeline", details: err?.message },
      { status: 500 }
    );
  }
}

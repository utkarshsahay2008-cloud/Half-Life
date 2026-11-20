import { prisma } from "@/lib/prisma";
import { InteractiveAuditWorkspace } from "@/components/InteractiveAuditWorkspace";
import { Sparkles, Activity, Globe, ShieldAlert, Cpu } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch default specimen (spec-api-drift or first available)
  let initialAudit = await prisma.auditReport.findFirst({
    where: { slug: "spec-api-drift" },
    include: {
      claims: {
        orderBy: { claimIndex: "asc" },
        include: {
          sources: true,
        },
      },
    },
  });

  if (!initialAudit) {
    initialAudit = await prisma.auditReport.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        claims: {
          orderBy: { claimIndex: "asc" },
          include: {
            sources: true,
          },
        },
      },
    });
  }

  // Fallback structure if database is completely empty
  const fallbackAudit = {
    id: "default-spec",
    slug: "spec-api-drift",
    title: "OpenAI Assistants API v1 vs v2 Deprecation Drift",
    mode: "AUDIT",
    rawText: `const run = await openai.beta.threads.runs.create(threadId, { assistant_id: id, tools: [{ type: 'retrieval' }] });`,
    patchedText: `const run = await openai.beta.threads.runs.createAndPoll(threadId, { assistant_id: id, tools: [{ type: 'file_search' }] });`,
    overallFreshnessScore: 41,
    searchSkipSavingsMs: 420,
    bifrostRoutingTrace: "[]",
    createdAt: new Date().toISOString(),
    claims: [],
  };

  const serializedAudit = initialAudit
    ? {
        ...initialAudit,
        createdAt: initialAudit.createdAt.toISOString(),
      }
    : fallbackAudit;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Luminous Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/75 p-6 sm:p-10 shadow-sm backdrop-blur-xl">
        <div className="relative z-10 flex flex-col gap-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700 w-fit">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Built for the &ldquo;Build a Stale-Answer Detector for AI Applications&rdquo; Challenge</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Temporal Decay & Fact Freshness Lab for LLMs
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            LLMs answer with high confidence about APIs, pricing rate cards, company leadership, and regulations that expired months ago. <strong>HALF-LIFE</strong> decomposes answers into atomic claims via <strong>Bifrost Gateway</strong>, grounds truth against the live web with <strong>Tavily</strong>, and dynamically simulates factual half-life decay.
          </p>

          {/* Core Feature Badges */}
          <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
              <Cpu className="h-3.5 w-3.5 text-blue-600" />
              <span>Multi-Model Routing: gpt-4o-mini → gpt-4o</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
              <Globe className="h-3.5 w-3.5 text-teal-600" />
              <span>Tavily Grounding + Search-Skip Optimization</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
              <span>Time-Travel Chronometer & Auto-Heal Diff</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Main Workspace */}
      <InteractiveAuditWorkspace initialAudit={serializedAudit as any} />
    </div>
  );
}

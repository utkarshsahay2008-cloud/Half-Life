import "@/lib/polyfills";
import { prisma } from "@/lib/prisma";
import { InteractiveAuditWorkspace } from "@/components/InteractiveAuditWorkspace";
import { Sparkles, Activity, Globe, ShieldAlert, Cpu, Zap, Clock, ShieldCheck } from "lucide-react";
import { CACHED_SPECIMENS } from "@/lib/specimens";

export default async function HomePage() {
  let initialAudit: any = null;
  try {
    initialAudit = await Promise.race([
      prisma.auditReport.findFirst({
        where: { slug: "spec-api-drift" },
        include: {
          claims: {
            orderBy: { claimIndex: "asc" },
            include: { sources: true },
          },
        },
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 300)),
    ]);
  } catch (err) {
    console.warn("[HomePage] Fallback to seeded audit structure:", err);
  }

  const serializedAudit = initialAudit
    ? {
        ...initialAudit,
        createdAt: initialAudit.createdAt.toISOString(),
      }
    : CACHED_SPECIMENS["spec-api-drift"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Luminous Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/95 via-white/85 to-slate-50/60 p-6 sm:p-10 shadow-sm shadow-slate-200/50 backdrop-blur-xl">
        {/* Subtle Decorative Gradient Accents */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-200/30 to-emerald-200/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-gradient-to-tr from-teal-200/20 to-amber-200/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 max-w-4xl">
          {/* Challenge Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-blue-50/70 to-indigo-50/90 px-3.5 py-1 text-xs font-semibold text-indigo-900 shadow-2xs w-fit">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
            <span>Built for the &ldquo;Build a Stale-Answer Detector for AI Applications&rdquo; Challenge</span>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.12]">
              Detect & Heal{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                Temporal Factual Decay
              </span>{" "}
              in LLM Answers
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              LLMs output answers with absolute confidence about APIs, pricing rate cards, executive leadership, and regulatory mandates that expired months ago. <strong>HALF-LIFE</strong> decomposes answers into atomic claims via <strong>Bifrost Gateway</strong>, grounds truth against the live web with <strong>Tavily</strong>, and simulates factual half-life decay across time.
            </p>
          </div>

          {/* Feature Badges with Tasteful Pastel Tints */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
            <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-white p-2.5 shadow-2xs">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-600">Multi-Model Routing</span>
                <span className="font-mono text-xs font-medium text-slate-800">gpt-oss-20b → 120b</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-teal-100 bg-gradient-to-r from-teal-50/60 to-white p-2.5 shadow-2xs">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-600">Tavily Grounding</span>
                <span className="font-mono text-xs font-medium text-slate-800">Search-Skip Optimized</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50/60 to-white p-2.5 shadow-2xs">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600">Time-Travel Engine</span>
                <span className="font-mono text-xs font-medium text-slate-800">2023 – 2026 Scrubber</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50/60 to-white p-2.5 shadow-2xs">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-600">Auto-Heal Engine</span>
                <span className="font-mono text-xs font-medium text-slate-800">One-Click Code Patch</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Main Workspace */}
      <InteractiveAuditWorkspace initialAudit={serializedAudit as any} />
    </div>
  );
}

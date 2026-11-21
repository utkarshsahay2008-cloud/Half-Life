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
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white/95 via-white/85 to-slate-50/60 dark:from-[#0B1120]/90 dark:via-[#0D1527]/80 dark:to-[#070A13]/90 p-6 sm:p-10 shadow-sm shadow-slate-200/50 dark:shadow-black/50 backdrop-blur-xl">
        {/* Subtle Decorative Gradient Accents */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-200/30 to-emerald-200/20 dark:from-rose-500/10 dark:to-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-gradient-to-tr from-teal-200/20 to-amber-200/20 dark:from-cyan-500/10 dark:to-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 max-w-4xl">
          {/* Challenge Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 dark:border-indigo-800/60 bg-gradient-to-r from-indigo-50/90 via-blue-50/70 to-indigo-50/90 dark:from-indigo-950/70 dark:via-blue-950/50 dark:to-indigo-950/70 px-3.5 py-1 text-xs font-semibold text-indigo-900 dark:text-indigo-300 shadow-2xs w-fit">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span>Built for the &ldquo;Build a Stale-Answer Detector for AI Applications&rdquo; Challenge</span>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Detect & Heal{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600 dark:from-indigo-400 dark:via-sky-400 dark:to-teal-300 bg-clip-text text-transparent">
                Temporal Factual Decay
              </span>{" "}
              in LLM Answers
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              LLMs output answers with absolute confidence about APIs, pricing rate cards, executive leadership, and regulatory mandates that expired months ago. <strong>HALF-LIFE</strong> decomposes answers into atomic claims via <strong>Bifrost Gateway</strong>, grounds truth against the live web with <strong>Tavily</strong>, and simulates factual half-life decay across time.
            </p>
          </div>

          {/* 4 Feature Badges (Styled like Reference Dashboard) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
            <div className="flex items-center justify-between rounded-2xl border border-indigo-100 dark:border-slate-800/80 bg-gradient-to-r from-indigo-50/60 to-white dark:from-slate-900/90 dark:to-[#0D1527] p-3 shadow-2xs transition-all hover:border-indigo-300 dark:hover:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-rose-950/60 text-indigo-700 dark:text-rose-400 border border-indigo-200/60 dark:border-rose-900/40">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-rose-400">Multi-Model</span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">20b → 120b</span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:inline">✓ Active</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-teal-100 dark:border-slate-800/80 bg-gradient-to-r from-teal-50/60 to-white dark:from-slate-900/90 dark:to-[#0D1527] p-3 shadow-2xs transition-all hover:border-teal-300 dark:hover:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 dark:bg-sky-950/60 text-teal-700 dark:text-sky-400 border border-teal-200/60 dark:border-sky-900/40">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-sky-400">Tavily Grounding</span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">Skip-Opt</span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:inline">✓ Verified</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-emerald-100 dark:border-slate-800/80 bg-gradient-to-r from-emerald-50/60 to-white dark:from-slate-900/90 dark:to-[#0D1527] p-3 shadow-2xs transition-all hover:border-emerald-300 dark:hover:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-amber-950/60 text-emerald-700 dark:text-amber-400 border border-emerald-200/60 dark:border-amber-900/40">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-amber-400">Time-Travel</span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">2023 – 2026</span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:inline">✓ Synced</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-amber-100 dark:border-slate-800/80 bg-gradient-to-r from-amber-50/60 to-white dark:from-slate-900/90 dark:to-[#0D1527] p-3 shadow-2xs transition-all hover:border-amber-300 dark:hover:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-emerald-950/60 text-amber-700 dark:text-emerald-400 border border-amber-200/60 dark:border-emerald-900/40">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-emerald-400">Auto-Heal</span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">Instant Patch</span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:inline">✓ Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Main Workspace */}
      <InteractiveAuditWorkspace initialAudit={serializedAudit as any} />
    </div>
  );
}

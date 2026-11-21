"use client";

import React, { useState } from "react";
import { Cpu, Globe, Zap, ArrowRight, ShieldCheck, Database, Layers, CheckCircle2 } from "lucide-react";

interface StageInfo {
  id: string;
  stageNumber: number;
  title: string;
  subtitle: string;
  model: string;
  latency: string;
  tokens: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  description: string;
  payloadSample: string;
}

const STAGES: StageInfo[] = [
  {
    id: "stage-1",
    stageNumber: 1,
    title: "Ingestion & Sanitization",
    subtitle: "Raw LLM Output Stream",
    model: "Client Gateway Parser",
    latency: "< 5ms",
    tokens: "Raw Buffer",
    color: "#64748B",
    borderColor: "border-slate-200",
    bgGradient: "from-slate-50 to-white",
    description: "Accepts generated answer text or code blocks, parses token stream, and prepares atomic sentence chunks for classification.",
    payloadSample: `// Input AI Answer Payload\nconst run = await openai.beta.threads.runs.create(threadId, {\n  assistant_id: assistantId,\n  tools: [{ type: "retrieval" }]\n});`,
  },
  {
    id: "stage-2",
    stageNumber: 2,
    title: "Bifrost Claim Decomposition",
    subtitle: "Atomic Fact Extraction",
    model: "groq/openai/gpt-oss-20b",
    latency: "~185ms",
    tokens: "260 tokens",
    color: "#3B82F6",
    borderColor: "border-blue-200",
    bgGradient: "from-blue-50/70 to-white",
    description: "Routes via @maximhq/bifrost to fast 20b model. Breaks paragraphs into falsifiable atomic claims and assigns decay category (API, PRICING, LEADERSHIP, REGULATION, STATIC).",
    payloadSample: `[\n  { "index": 0, "category": "API", "span": "tools: [{ type: 'retrieval' }]" },\n  { "index": 1, "category": "STATIC", "span": "Cosine similarity = (A·B)/(||A|| ||B||)" }\n]`,
  },
  {
    id: "stage-3",
    stageNumber: 3,
    title: "Grounding Decision Gate",
    subtitle: "Tavily Search vs Search-Skip",
    model: "Tavily Advanced Search / Skip Optimizer",
    latency: "0ms (Skip) or ~380ms",
    tokens: "+420ms Latency Saved on Static",
    color: "#10B981",
    borderColor: "border-emerald-200",
    bgGradient: "from-emerald-50/70 to-white",
    description: "Dynamically branches: STATIC invariant claims bypass web queries via Search-Skip Optimization (saving API costs & 420ms). Dynamic claims query Tavily live web index.",
    payloadSample: `// Decision Branch:\nif (category === "STATIC") {\n  return bypassSearch({ reason: "Timeless Invariant", savingsMs: 420 });\n} else {\n  return tavily.search({ query: claim.span, search_depth: "advanced" });\n}`,
  },
  {
    id: "stage-4",
    stageNumber: 4,
    title: "Bifrost High-Reasoning Adjudicator",
    subtitle: "Temporal Freshness Score & Replacements",
    model: "groq/openai/gpt-oss-120b",
    latency: "~420ms",
    tokens: "590 tokens",
    color: "#8B5CF6",
    borderColor: "border-purple-200",
    bgGradient: "from-purple-50/70 to-white",
    description: "High-reasoning 120b model weighs Tavily citations against claim spans, determines expiration timestamp, computes 0-100% Freshness Score, and writes auto-healed drop-in code.",
    payloadSample: `{\n  "freshnessScore": 10,\n  "status": "STALE",\n  "expiredAtDate": "2024-04-17",\n  "liveTruth": "Assistants API v1 deprecated on April 17, 2024. Use file_search.",\n  "replacement": "tools: [{ type: 'file_search' }]"\n}`,
  },
  {
    id: "stage-5",
    stageNumber: 5,
    title: "Auto-Heal & Parallel Routes",
    subtitle: "SQLite Persistence & Forensic Interception",
    model: "Prisma SQLite + Next.js @modal",
    latency: "~12ms",
    tokens: "Full Audit Report",
    color: "#F59E0B",
    borderColor: "border-amber-200",
    bgGradient: "from-amber-50/70 to-white",
    description: "Saves AuditReport, atomic Claims, and TavilySources to SQLite. Exposes deep-linkable URLs with App Router Parallel & Intercepting routes for frictionless sharing.",
    payloadSample: `// Shareable Deep Link\nGET /audit/spec-api-drift/claim/claim-0\n// Intercepting Modal with full live citations & one-click code patch!`,
  },
];

export function PipelineArchitectureFlow() {
  const [selectedStage, setSelectedStage] = useState<StageInfo>(STAGES[1]); // Default to Bifrost Extraction

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/95 via-white/85 to-slate-50/70 p-5 sm:p-6 shadow-sm shadow-slate-200/50 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/80 shadow-2xs">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Bifrost & Tavily Routing Architecture Flow
              </h3>
              <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50/80 border border-blue-200/70 rounded-full px-2.5 py-0.5 shadow-2xs">
                5-Stage Pipeline
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Interactive execution topology mapping multi-model routing, Search-Skip branching, and live adjudication.
            </p>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 font-medium">
          Click any stage node to inspect parameters & payload
        </span>
      </div>

      {/* Interactive Horizontal Pipeline Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-4">
        {STAGES.map((st) => {
          const isSelected = selectedStage.id === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setSelectedStage(st)}
              className={`group relative flex flex-col justify-between rounded-2xl border p-3 text-left transition-all active:scale-[0.99] ${
                isSelected
                  ? "border-indigo-500 bg-gradient-to-b from-indigo-50/80 to-white shadow-xs ring-2 ring-indigo-500/20"
                  : "border-slate-200/80 bg-white/80 hover:border-slate-300 hover:bg-slate-50/70"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-md font-mono text-[10px] font-bold text-white shadow-2xs"
                    style={{ backgroundColor: st.color }}
                  >
                    {st.stageNumber}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full transition-all ${
                      isSelected ? "bg-indigo-600 animate-pulse ring-2 ring-indigo-200" : "bg-slate-300"
                    }`}
                  />
                </div>
                <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-950 transition-colors line-clamp-1">
                  {st.title}
                </h4>
                <p className="text-[10px] text-slate-500 line-clamp-1">
                  {st.subtitle}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono text-slate-400">
                <span className="truncate max-w-[85px]">{st.model.split("/").pop()}</span>
                <span className="font-bold text-indigo-600">{st.latency}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Inspection Detail Drawer */}
      <div className="mt-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-white to-slate-50/60 p-4 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-md font-mono text-[10px] font-bold text-white"
                style={{ backgroundColor: selectedStage.color }}
              >
                {selectedStage.stageNumber}
              </span>
              <h4 className="font-bold text-sm text-slate-900">{selectedStage.title}</h4>
              <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                {selectedStage.model}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedStage.description}
            </p>
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 pt-1">
              <span>Latency: <strong className="text-slate-800">{selectedStage.latency}</strong></span>
              <span>•</span>
              <span>Resource Footprint: <strong className="text-slate-800">{selectedStage.tokens}</strong></span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl border border-slate-200/90 bg-slate-900 p-3 shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1 border-b border-slate-800 pb-1">
                <span>Stage Output Sample</span>
                <span className="text-emerald-400">Live Schema</span>
              </div>
              <pre className="font-mono text-[10px] text-slate-200 overflow-x-auto leading-relaxed max-h-28">
                <code>{selectedStage.payloadSample}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

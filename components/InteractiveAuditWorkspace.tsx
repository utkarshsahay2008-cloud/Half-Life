"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Search,
  Check,
  Copy,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Terminal,
  Activity,
  Zap,
  TrendingDown,
  ExternalLink,
  Code2,
} from "lucide-react";
import { TimeTravelScrubber } from "./TimeTravelScrubber";
import { DecayCurveChart } from "./DecayCurveChart";
import { FreshnessGauge } from "./FreshnessGauge";
import { TelemetryDrawer } from "./TelemetryDrawer";
import { formatCategoryLabel, formatScoreBadge } from "@/lib/utils";

export interface AuditReportData {
  id: string;
  slug?: string | null;
  title: string;
  mode: string;
  rawText: string;
  patchedText: string;
  overallFreshnessScore: number;
  searchSkipSavingsMs: number;
  bifrostRoutingTrace: string; // JSON array of traces
  createdAt: string;
  claims: Array<{
    id: string;
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
    sources: Array<{
      id: string;
      title: string;
      url: string;
      domain: string;
      publishedDate: string;
      snippet: string;
      relevanceScore: number;
    }>;
  }>;
}

interface InteractiveAuditWorkspaceProps {
  initialAudit: AuditReportData;
}

const SPECIMENS = [
  {
    slug: "spec-api-drift",
    label: "Assistants API v1 Deprecation",
    category: "API",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
    description: "openai.beta.threads.runs.create with retrieval tool vs createAndPoll with file_search",
  },
  {
    slug: "spec-pricing-rot",
    label: "GPT-4 Token Rate Cards",
    category: "PRICING",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
    description: "Legacy GPT-4 rate cards vs GPT-4o and Claude prompt caching discounts",
  },
  {
    slug: "spec-leadership-shift",
    label: "OpenAI Executive Governance",
    category: "LEADERSHIP",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    dotColor: "bg-purple-500",
    description: "CTO and Chief Scientist leadership transitions through late 2024",
  },
  {
    slug: "spec-timeless-physics",
    label: "Thermodynamics & Timeless Laws",
    category: "STATIC",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
    description: "Timeless physical constants optimized via Tavily Search-Skip (zero decay)",
  },
];

export function InteractiveAuditWorkspace({ initialAudit }: InteractiveAuditWorkspaceProps) {
  const router = useRouter();
  const [currentAudit, setCurrentAudit] = useState<AuditReportData>(initialAudit);
  const [activeTab, setActiveTab] = useState<"AUDIT" | "GENERATE">("AUDIT");

  // Input states
  const [auditInputText, setAuditInputText] = useState(
    initialAudit.rawText || ""
  );
  const [promptInput, setPromptInput] = useState(
    "How do I use the OpenAI Assistants API retrieval tool in Node.js?"
  );
  const [selectedModel, setSelectedModel] = useState("groq/openai/gpt-oss-20b");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAutoHealDiff, setShowAutoHealDiff] = useState(false);
  const [copiedFix, setCopiedFix] = useState(false);

  // Time-Travel Chronometer state (defaults to today)
  const [simulatedDate, setSimulatedDate] = useState("2026-11-20");

  // Calculate dynamic freshness based on simulated date
  const dynamicClaims = useMemo(() => {
    return (currentAudit.claims || []).map((claim) => {
      // If simulated date is before the claim expired, it was still 100% fresh!
      if (claim.expiredAtDate !== "NEVER" && simulatedDate < claim.expiredAtDate) {
        return {
          ...claim,
          dynamicScore: 100,
          dynamicStatus: "FRESH",
          isExpiredAtSimDate: false,
        };
      }
      // If simulated date is after or on expiration, it has decayed
      return {
        ...claim,
        dynamicScore: claim.freshnessScore,
        dynamicStatus: claim.status,
        isExpiredAtSimDate: claim.expiredAtDate !== "NEVER",
      };
    });
  }, [currentAudit.claims, simulatedDate]);

  // Overall dynamically recalculated freshness score
  const dynamicOverallScore = useMemo(() => {
    if (!dynamicClaims || dynamicClaims.length === 0) return 100;
    const sum = dynamicClaims.reduce((acc, c) => acc + c.dynamicScore, 0);
    return Math.round(sum / dynamicClaims.length);
  }, [dynamicClaims]);

  // Counts
  const freshCount = dynamicClaims.filter((c) => c.dynamicScore >= 80).length;
  const decayingCount = dynamicClaims.filter(
    (c) => c.dynamicScore >= 45 && c.dynamicScore < 80
  ).length;
  const staleCount = dynamicClaims.filter((c) => c.dynamicScore < 45).length;

  // Safe parse traces
  const telemetryTraces = useMemo(() => {
    try {
      if (!currentAudit.bifrostRoutingTrace) return [];
      return JSON.parse(currentAudit.bifrostRoutingTrace);
    } catch {
      return [];
    }
  }, [currentAudit.bifrostRoutingTrace]);

  // Handle switching specimens
  const loadSpecimen = async (slug: string) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/audit/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentAudit(data.audit);
        setAuditInputText(data.audit.rawText);
        setShowAutoHealDiff(false);
      }
    } catch (err) {
      console.error("Failed to load specimen:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle submitting audit
  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditInputText.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: auditInputText,
          title: `Custom Audit: ${auditInputText.slice(0, 36)}...`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentAudit(data.audit);
        setShowAutoHealDiff(false);
      }
    } catch (err) {
      console.error("Audit submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle live prompt generation
  const handleRunGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptInput,
          model: selectedModel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentAudit(data.audit);
        setAuditInputText(data.audit.rawText);
        setShowAutoHealDiff(false);
      }
    } catch (err) {
      console.error("Generation submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPatchedText = () => {
    navigator.clipboard.writeText(currentAudit.patchedText);
    setCopiedFix(true);
    setTimeout(() => setCopiedFix(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Specimen Pills Selector */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/95 to-slate-50/70 p-5 sm:p-6 shadow-sm shadow-slate-200/50 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Pre-Seeded Forensic Specimens
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
              Instant 1-Click SQLite Audits
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Select a specimen to test temporal decay dynamics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {SPECIMENS.map((spec) => {
            const isSelected = currentAudit.slug === spec.slug;
            return (
              <button
                key={spec.slug}
                onClick={() => loadSpecimen(spec.slug)}
                disabled={isSubmitting}
                className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all active:scale-[0.99] ${
                  isSelected
                    ? "border-emerald-500 bg-gradient-to-b from-emerald-50/70 to-white shadow-xs ring-2 ring-emerald-500/20"
                    : "border-slate-200/80 bg-white/90 hover:border-slate-300 hover:bg-slate-50/70 hover:shadow-2xs"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${spec.badgeColor}`}
                    >
                      {spec.category}
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full transition-all ${
                        isSelected ? "bg-emerald-500 animate-pulse ring-2 ring-emerald-200" : "bg-slate-300 group-hover:bg-slate-400"
                      }`}
                    />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-950 transition-colors">
                    {spec.label}
                  </h4>
                </div>
                <p className="mt-2 text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                  {spec.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time-Travel Decay Chronometer */}
      <TimeTravelScrubber
        currentSimulatedDate={simulatedDate}
        onDateChange={setSimulatedDate}
      />

      {/* Visual Mathematical Half-Life Decay Curves */}
      <DecayCurveChart
        claims={dynamicClaims as any}
        simulatedDate={simulatedDate}
      />

      {/* Input Mode Selector & Forms */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/95 to-slate-50/60 shadow-sm shadow-slate-200/50 backdrop-blur-xl">
        {/* Mode Tabs */}
        <div className="flex border-b border-slate-200/80 bg-slate-50/80 p-2 gap-2">
          <button
            onClick={() => setActiveTab("AUDIT")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-bold transition-all shadow-2xs ${
              activeTab === "AUDIT"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 ring-1 ring-slate-900/5"
                : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <FileText className={`h-4 w-4 ${activeTab === "AUDIT" ? "text-blue-600" : "text-slate-400"}`} />
            <span>Audit Existing AI Text</span>
          </button>
          <button
            onClick={() => setActiveTab("GENERATE")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-bold transition-all shadow-2xs ${
              activeTab === "GENERATE"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 ring-1 ring-slate-900/5"
                : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Terminal className={`h-4 w-4 ${activeTab === "GENERATE" ? "text-emerald-600" : "text-slate-400"}`} />
            <span>Live Bifrost Prompt Test</span>
          </button>
        </div>

        {/* Tab 1: Paste & Audit */}
        {activeTab === "AUDIT" && (
          <form onSubmit={handleRunAudit} className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                AI Answer Text to Audit:
              </label>
              <span className="font-mono text-[11px] text-slate-400">
                Decomposes into atomic claims via Bifrost Gateway
              </span>
            </div>

            <textarea
              rows={4}
              value={auditInputText}
              onChange={(e) => setAuditInputText(e.target.value)}
              placeholder="Paste any LLM answer containing code, endpoints, pricing, leadership, or regulatory claims..."
              className="w-full rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 font-mono text-xs text-slate-800 placeholder-slate-400 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-medium">
                Pipeline: Bifrost (groq/gpt-oss-20b) → Tavily Live Search → Bifrost (groq/gpt-oss-120b)
              </span>

              <button
                type="submit"
                disabled={isSubmitting || !auditInputText.trim()}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-mono text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition active:scale-95"
              >
                <Activity className={`h-3.5 w-3.5 text-emerald-400 ${isSubmitting ? "animate-spin" : ""}`} />
                <span>{isSubmitting ? "Decomposing & Grounding..." : "Execute Temporal Audit"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Live Prompt Test */}
        {activeTab === "GENERATE" && (
          <form onSubmit={handleRunGenerate} className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Prompt for LLM Generation:
                </label>
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="e.g., Provide code for OpenAI Assistants API document retrieval"
                  className="w-full rounded-2xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 font-mono text-xs text-slate-800 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Bifrost Model:
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/90 bg-white/95 px-3 py-2.5 font-mono text-xs text-slate-800 shadow-inner focus:border-emerald-500 focus:outline-none transition"
                >
                  <option value="groq/openai/gpt-oss-20b">groq/openai/gpt-oss-20b (Fast Decomposer)</option>
                  <option value="groq/openai/gpt-oss-120b">groq/openai/gpt-oss-120b (High-Reasoning)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-500 font-medium">
                Routes request via @maximhq/bifrost, streams response, and initiates instant temporal adjudication.
              </span>

              <button
                type="submit"
                disabled={isSubmitting || !promptInput.trim()}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-mono text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition active:scale-95"
              >
                <Zap className={`h-3.5 w-3.5 text-emerald-200 ${isSubmitting ? "animate-spin" : ""}`} />
                <span>{isSubmitting ? "Generating & Auditing..." : "Route & Verify"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Main Workspace Layout: Visual Text Viewer & Freshness Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Highlighted Text & Auto-Heal Viewer */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/95 to-slate-50/70 p-5 sm:p-6 shadow-sm shadow-slate-200/50 backdrop-blur-xl">
            {/* Viewer Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Code2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {currentAudit.title || "Audit Report"}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                    <span>{dynamicClaims.length} Claims Evaluated</span>
                    <span>•</span>
                    <span>Tavily Grounded</span>
                  </div>
                </div>
              </div>

              {/* Auto-Heal Diff Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAutoHealDiff(!showAutoHealDiff)}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition shadow-2xs active:scale-95 ${
                    showAutoHealDiff
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Zap className={`h-3.5 w-3.5 ${showAutoHealDiff ? "text-emerald-600" : "text-amber-500"}`} />
                  <span>{showAutoHealDiff ? "Viewing Auto-Healed" : "Toggle Auto-Heal Diff"}</span>
                </button>

                {showAutoHealDiff && (
                  <button
                    onClick={handleCopyPatchedText}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-600 px-3 py-1.5 font-mono text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95"
                  >
                    {copiedFix ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedFix ? "Copied!" : "Copy Patched"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Display Body: Raw vs Patched Diff */}
            <div className="mt-4">
              {showAutoHealDiff ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Auto-Healed Verified Code (Drop-in Replacement):
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Zero-touch temporal rejuvenation
                    </span>
                  </div>
                  <pre className="overflow-x-auto rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 to-white p-4 font-mono text-xs text-slate-900 leading-relaxed shadow-inner">
                    <code>{currentAudit.patchedText}</code>
                  </pre>
                </div>
              ) : (
                <HighlightedClaimsText
                  rawText={currentAudit.rawText}
                  claims={dynamicClaims}
                  auditId={currentAudit.id}
                />
              )}
            </div>
          </div>

          {/* Bifrost Gateway Telemetry Drawer */}
          <TelemetryDrawer
            traces={telemetryTraces}
            searchSkipSavingsMs={currentAudit.searchSkipSavingsMs}
          />
        </div>

        {/* Right: Freshness Gauge & Quick Summary */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <FreshnessGauge
            score={dynamicOverallScore}
            freshCount={freshCount}
            decayingCount={decayingCount}
            staleCount={staleCount}
            searchSkipSavingsMs={currentAudit.searchSkipSavingsMs}
            simulatedDate={simulatedDate}
          />

          {/* Temporal Decay Explainer Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/95 to-slate-50/70 p-5 shadow-sm shadow-slate-200/50 backdrop-blur-xl text-xs space-y-3">
            <div className="flex items-center gap-2.5 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <span>Temporal Entropy Physics</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              AI facts decay exponentially. The <strong>HALF-LIFE</strong> engine calculates rate card changes, API sunset events, executive shifts, and regulatory updates using live Tavily search indices, while saving latency and costs on static laws via <em>Search-Skip Optimization</em>.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Bifrost Gateway:</span>
              <span className="font-bold text-indigo-600">Active Multi-Route</span>
            </div>
          </div>
        </div>
      </div>

      {/* Claims Breakdown Grid */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Atomic Claims & Forensic Evidence
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
              {dynamicClaims.length} Exhibits
            </span>
          </div>
          <span className="font-mono text-xs text-slate-400 hidden sm:inline">
            Click any exhibit card to inspect ground-truth sources in modal
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dynamicClaims.map((claim) => {
            const badge = formatScoreBadge(claim.dynamicScore);
            const cat = formatCategoryLabel(claim.category);

            // Left colored border accent based on category
            const accentBorder =
              claim.category === "API"
                ? "border-l-blue-500"
                : claim.category === "PRICING"
                ? "border-l-amber-500"
                : claim.category === "LEADERSHIP"
                ? "border-l-purple-500"
                : claim.category === "REGULATION"
                ? "border-l-pink-500"
                : "border-l-emerald-500";

            return (
              <Link
                key={claim.id}
                href={`/audit/${currentAudit.id}/claim/${claim.id}`}
                className={`group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 border-l-[4px] ${accentBorder} bg-gradient-to-b from-white/95 to-slate-50/60 p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all backdrop-blur-xl active:scale-[0.99]`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${cat.colorClass}`}
                    >
                      {cat.label}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold shadow-2xs ${badge.badgeClass}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${claim.dynamicScore >= 80 ? "bg-emerald-500" : claim.dynamicScore >= 45 ? "bg-amber-500" : "bg-rose-500"} animate-pulse`} />
                      {badge.label} ({claim.dynamicScore}%)
                    </span>
                  </div>

                  {/* Assertion Snippet */}
                  <div className="font-mono text-xs text-slate-800 line-clamp-3 leading-relaxed font-medium">
                    &ldquo;{claim.originalSpan}&rdquo;
                  </div>

                  {/* Ground Truth Summary */}
                  <div className="rounded-xl border border-slate-200/70 bg-white/80 p-3 text-[11px] text-slate-600 line-clamp-2 shadow-2xs">
                    <span className="font-bold text-slate-800">Consensus: </span>
                    {claim.liveTruth}
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
                  <div className="flex items-center gap-1 font-mono text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>t½: {claim.halfLifeDays >= 99999 ? "Static / ∞" : `${claim.halfLifeDays}d`}</span>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect Evidence</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Helper component to render raw text with clickable highlighted claim spans
 */
function HighlightedClaimsText({
  rawText,
  claims,
  auditId,
}: {
  rawText: string;
  claims: any[];
  auditId: string;
}) {
  return (
    <div className="space-y-3">
      {claims.map((claim, idx) => {
        const badge = formatScoreBadge(claim.dynamicScore);

        return (
          <div
            key={claim.id || idx}
            className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 shadow-2xs hover:border-slate-300 transition"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono font-bold text-slate-600">
                Claim #{claim.claimIndex + 1} • <span className="text-indigo-600 font-semibold">{claim.category}</span>
              </span>
              <Link
                href={`/audit/${auditId}/claim/${claim.id}`}
                className="flex items-center gap-1 font-mono font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                <span>Evidence Modal</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <Link
              href={`/audit/${auditId}/claim/${claim.id}`}
              className={`block rounded-xl p-3 font-mono text-xs border transition ${
                claim.dynamicScore >= 80
                  ? "bg-emerald-50/60 border-emerald-200 text-emerald-950 hover:bg-emerald-100/70"
                  : claim.dynamicScore >= 45
                  ? "bg-amber-50/60 border-amber-200 text-amber-950 hover:bg-amber-100/70"
                  : "bg-rose-50/60 border-rose-200 text-rose-950 hover:bg-rose-100/70"
              }`}
            >
              {claim.originalSpan}
            </Link>

            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>
                {claim.expiredAtDate === "NEVER"
                  ? "Timeless Invariant (No Expiry)"
                  : `Expired: ${claim.expiredAtDate}`}
              </span>
              <span className="font-mono font-bold text-slate-700">
                Score: {claim.dynamicScore}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
  bifrostRoutingTrace: string;
  searchSkipSavingsMs: number;
  createdAt: string;
  claims: Array<{
    id: string;
    auditId: string;
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
      claimId: string;
      title: string;
      url: string;
      domain: string;
      publishedDate: string;
      snippet: string;
      relevanceScore: number;
    }>;
  }>;
}

interface SpecimenOption {
  slug: string;
  label: string;
  category: string;
  description: string;
}

const SPECIMENS: SpecimenOption[] = [
  {
    slug: "spec-api-drift",
    label: "Assistants v1 Deprecation",
    category: "API_VERSION",
    description: "OpenAI v1 retrieval tool deprecation and v2 vector store migration",
  },
  {
    slug: "spec-pricing-rot",
    label: "LLM Token Pricing Rot",
    category: "PRICING",
    description: "Legacy GPT-4 rate cards vs GPT-4o and Claude prompt caching discounts",
  },
  {
    slug: "spec-leadership",
    label: "Executive Leadership Drift",
    category: "LEADERSHIP",
    description: "Stability AI CEO resignation and OpenAI executive transitions",
  },
  {
    slug: "spec-regulation",
    label: "AI Regulation & SB 1047",
    category: "REGULATION",
    description: "EU AI Act timeline and California SB 1047 gubernatorial veto",
  },
];

interface InteractiveAuditWorkspaceProps {
  initialAudit: AuditReportData;
}

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

  // Aggregate dynamic overall freshness score
  const dynamicOverallScore = useMemo(() => {
    if (dynamicClaims.length === 0) return 100;
    const sum = dynamicClaims.reduce((acc, c) => acc + c.dynamicScore, 0);
    return Math.round(sum / dynamicClaims.length);
  }, [dynamicClaims]);

  // Count breakdown
  const freshCount = dynamicClaims.filter((c) => c.dynamicScore >= 80).length;
  const decayingCount = dynamicClaims.filter((c) => c.dynamicScore >= 45 && c.dynamicScore < 80).length;
  const staleCount = dynamicClaims.filter((c) => c.dynamicScore < 45).length;

  // Parsed telemetry traces
  const telemetryTraces = useMemo(() => {
    try {
      return JSON.parse(currentAudit.bifrostRoutingTrace || "[]");
    } catch {
      return [];
    }
  }, [currentAudit.bifrostRoutingTrace]);

  // Handle loading a seeded specimen
  const loadSpecimen = async (slug: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/audit/${slug}`);
      if (res.ok) {
        const data = await res.json();
        if (data.audit) {
          setCurrentAudit(data.audit);
          setAuditInputText(data.audit.rawText);
          setShowAutoHealDiff(false);
        }
      }
    } catch (err) {
      console.error("Failed to load specimen:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Run Custom Text Audit
  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditInputText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: auditInputText,
          title: "Custom Temporal Decay Audit",
          mode: "AUDIT",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audit) {
          setCurrentAudit(data.audit);
          setShowAutoHealDiff(false);
        }
      }
    } catch (err) {
      console.error("Audit submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Run Live Prompt Test
  const handleRunGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setIsSubmitting(true);
    try {
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
        if (data.audit) {
          setCurrentAudit(data.audit);
          setAuditInputText(data.audit.rawText);
          setShowAutoHealDiff(false);
        }
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
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white/70 p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Pre-Seeded Temporal Decay Specimens
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            Instant 1-Click SQLite Verification
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {SPECIMENS.map((spec) => {
            const isSelected = currentAudit.slug === spec.slug;
            return (
              <button
                key={spec.slug}
                onClick={() => loadSpecimen(spec.slug)}
                disabled={isSubmitting}
                className={`group flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isSelected ? "bg-emerald-600 animate-pulse" : "bg-slate-300 group-hover:bg-slate-400"
                  }`}
                />
                <span className="font-semibold">{spec.label}</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                  {spec.category}
                </span>
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
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/80 shadow-sm backdrop-blur-md">
        {/* Mode Tabs */}
        <div className="flex border-b border-slate-200/80 bg-slate-50/70 p-1.5">
          <button
            onClick={() => setActiveTab("AUDIT")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${
              activeTab === "AUDIT"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-blue-600" />
            <span>Paste & Audit Existing AI Answer</span>
          </button>
          <button
            onClick={() => setActiveTab("GENERATE")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${
              activeTab === "GENERATE"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Terminal className="h-3.5 w-3.5 text-emerald-600" />
            <span>Live Bifrost Prompt Test</span>
          </button>
        </div>

        {/* Tab 1: Paste & Audit */}
        {activeTab === "AUDIT" && (
          <form onSubmit={handleRunAudit} className="p-4 sm:p-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              AI-Generated Text to Audit for Temporal Decay:
            </label>
            <textarea
              rows={4}
              value={auditInputText}
              onChange={(e) => setAuditInputText(e.target.value)}
              placeholder="Paste any LLM answer containing code, endpoints, pricing, leadership, or regulatory claims..."
              className="w-full rounded-xl border border-slate-200 bg-white/90 p-3 font-mono text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                Pipeline: Bifrost (groq/gpt-oss-20b) → Tavily Live Search → Bifrost (groq/gpt-oss-120b)
              </span>

              <button
                type="submit"
                disabled={isSubmitting || !auditInputText.trim()}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-mono text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <Activity className={`h-3.5 w-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
                <span>{isSubmitting ? "Decomposing & Grounding..." : "Execute Temporal Audit"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Live Bifrost Prompt Test */}
        {activeTab === "GENERATE" && (
          <form onSubmit={handleRunGenerate} className="p-4 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Prompt to Route via Bifrost Gateway:
                </label>
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="e.g., Provide code for OpenAI Assistants API document retrieval"
                  className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 font-mono text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Bifrost Model:
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 font-mono text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="groq/openai/gpt-oss-20b">groq/openai/gpt-oss-20b (Fast Decomposer)</option>
                  <option value="groq/openai/gpt-oss-120b">groq/openai/gpt-oss-120b (High-Reasoning)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                Routes request via @maximhq/bifrost, streams response, and initiates instant temporal adjudication.
              </span>

              <button
                type="submit"
                disabled={isSubmitting || !promptInput.trim()}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-mono text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                <Zap className={`h-3.5 w-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
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
          <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-sm backdrop-blur-md">
            {/* Viewer Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {currentAudit.title || "Audit Report"}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600">
                  {dynamicClaims.length} Claims Indexed
                </span>
              </div>

              {/* Auto-Heal Diff Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAutoHealDiff(!showAutoHealDiff)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                    showAutoHealDiff
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{showAutoHealDiff ? "Show Original View" : "Toggle Auto-Heal Diff"}</span>
                </button>

                {showAutoHealDiff && (
                  <button
                    onClick={handleCopyPatchedText}
                    className="flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-600 px-2.5 py-1.5 font-mono text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                  >
                    {copiedFix ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedFix ? "Copied!" : "Copy Patched"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Text View Content */}
            <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 font-mono text-xs leading-relaxed text-slate-800">
              {!showAutoHealDiff ? (
                /* Interactive Highlighted Span Viewer */
                <div className="space-y-3">
                  <div className="whitespace-pre-wrap">
                    {/* Render text with inline claim badges */}
                    <HighlightedClaimsText
                      rawText={currentAudit.rawText}
                      claims={dynamicClaims}
                      auditId={currentAudit.id}
                    />
                  </div>
                </div>
              ) : (
                /* Auto-Heal Diff View */
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50/70 p-2.5 text-[11px] text-emerald-800 border border-emerald-200">
                    <span>
                      Stale spans have been automatically replaced with Tavily-grounded replacements.
                    </span>
                    <span className="font-mono font-bold">100% Freshness Restored</span>
                  </div>

                  <div className="space-y-3">
                    {dynamicClaims.map((claim) => (
                      <div
                        key={claim.id}
                        className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="font-bold text-slate-500">
                            Claim #{claim.claimIndex + 1} ({claim.category})
                          </span>
                          <span
                            className={
                              claim.dynamicScore >= 80 ? "text-emerald-600" : "text-rose-600"
                            }
                          >
                            Score: {claim.dynamicScore}%
                          </span>
                        </div>

                        {claim.dynamicScore < 80 ? (
                          <div className="space-y-1">
                            <div className="line-through text-rose-600/80 bg-rose-50/50 p-1.5 rounded">
                              {claim.originalSpan}
                            </div>
                            <div className="text-emerald-800 font-bold bg-emerald-50 p-1.5 rounded">
                              {claim.correctedReplacement}
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-700 bg-slate-50 p-1.5 rounded">
                            {claim.originalSpan} (Fresh)
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Telemetry Drawer */}
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
          <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-sm backdrop-blur-md text-xs space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              <Clock className="h-3.5 w-3.5 text-blue-600" />
              <span>Decay Physics & Grounding</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              AI knowledge naturally decays over time. The <strong>HALF-LIFE</strong> engine evaluates API updates, rate card shifts, executive changes, and regulatory mandates using live Tavily search indices, bypassing static timeless laws via <em>Search-Skip Optimization</em>.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Bifrost Gateway:</span>
              <span className="font-semibold text-blue-600">Active Multi-Route</span>
            </div>
          </div>
        </div>
      </div>

      {/* Claims Breakdown Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Atomic Claims & Forensic Evidence
          </h3>
          <span className="font-mono text-xs text-slate-500">
            Click any claim to inspect ground-truth sources
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dynamicClaims.map((claim) => {
            const badge = formatScoreBadge(claim.dynamicScore);
            const cat = formatCategoryLabel(claim.category);

            return (
              <Link
                key={claim.id}
                href={`/audit/${currentAudit.id}/claim/${claim.id}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/80 p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all backdrop-blur-md"
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
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold ${badge.badgeClass}`}
                    >
                      {badge.label} ({claim.dynamicScore}%)
                    </span>
                  </div>

                  {/* Assertion Snippet */}
                  <div className="font-mono text-xs text-slate-800 line-clamp-3 leading-relaxed">
                    &ldquo;{claim.originalSpan}&rdquo;
                  </div>

                  {/* Ground Truth Summary */}
                  <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600 line-clamp-2">
                    <span className="font-semibold text-slate-800">Consensus: </span>
                    {claim.liveTruth}
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
                  <div className="flex items-center gap-1 font-mono text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>t½: {claim.halfLifeDays >= 99999 ? "Static" : `${claim.halfLifeDays}d`}</span>
                  </div>

                  <div className="flex items-center gap-1 font-semibold text-blue-600 group-hover:translate-x-0.5 transition">
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
    <div className="space-y-4">
      {claims.map((claim, idx) => {
        const badge = formatScoreBadge(claim.dynamicScore);

        return (
          <div
            key={claim.id || idx}
            className="flex flex-col gap-1.5 rounded-xl border border-slate-200/90 bg-white p-3 shadow-xs hover:border-slate-300 transition"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono font-bold text-slate-500">
                Claim #{claim.claimIndex + 1} • {claim.category}
              </span>
              <Link
                href={`/audit/${auditId}/claim/${claim.id}`}
                className="flex items-center gap-1 font-mono font-bold text-blue-600 hover:underline"
              >
                <span>Evidence Modal</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <Link
              href={`/audit/${auditId}/claim/${claim.id}`}
              className={`block rounded-lg p-2 font-mono text-xs border transition ${
                claim.dynamicScore >= 80
                  ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 hover:bg-emerald-100/70"
                  : claim.dynamicScore >= 45
                  ? "bg-amber-50/70 border-amber-300 text-amber-950 hover:bg-amber-100/70"
                  : "bg-rose-50/70 border-rose-300 text-rose-950 hover:bg-rose-100/70"
              }`}
            >
              {claim.originalSpan}
            </Link>

            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>
                {claim.expiredAtDate === "NEVER"
                  ? "Timeless Invariant"
                  : `Expired: ${claim.expiredAtDate}`}
              </span>
              <span className="font-mono font-bold">Score: {claim.dynamicScore}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

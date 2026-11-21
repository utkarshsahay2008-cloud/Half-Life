"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  Compass,
  Calculator,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { TimeTravelScrubber } from "./TimeTravelScrubber";
import { DecayCurveChart } from "./DecayCurveChart";
import { KnowledgeEntropyRadar } from "./KnowledgeEntropyRadar";
import { DecaySimulatorSandbox } from "./DecaySimulatorSandbox";
import { PipelineArchitectureFlow } from "./PipelineArchitectureFlow";
import { FreshnessGauge } from "./FreshnessGauge";
import { TelemetryDrawer } from "./TelemetryDrawer";
import { formatCategoryLabel, formatScoreBadge } from "@/lib/utils";
import { SPECIMEN_METADATA, CACHED_SPECIMENS } from "@/lib/specimens";
import { calculateMathematicalFreshness } from "@/lib/chronometer";

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

type DiagramTab = "CURVES" | "RADAR" | "SANDBOX" | "FLOW";

export function InteractiveAuditWorkspace({ initialAudit }: InteractiveAuditWorkspaceProps) {
  const router = useRouter();
  const [currentAudit, setCurrentAudit] = useState<AuditReportData>(initialAudit);
  const [activeTab, setActiveTab] = useState<"AUDIT" | "GENERATE">("AUDIT");
  const [activeDiagramTab, setActiveDiagramTab] = useState<DiagramTab>("CURVES");

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
  const [copiedExport, setCopiedExport] = useState(false);

  // Time-Travel Chronometer state (defaults to today)
  const [simulatedDate, setSimulatedDate] = useState("2026-11-20");

  // Claims Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  // Keep state synchronized with server-rendered initialAudit
  useEffect(() => {
    if (initialAudit) {
      setCurrentAudit(initialAudit);
      if (initialAudit.rawText) {
        setAuditInputText(initialAudit.rawText);
      }
    }
  }, [initialAudit]);

  // Calculate 100% mathematically truthful dynamic freshness based on simulated date
  const dynamicClaims = useMemo(() => {
    return (currentAudit.claims || []).map((claim) => {
      const { score, status, isExpired } = calculateMathematicalFreshness(
        claim.halfLifeDays,
        claim.expiredAtDate,
        simulatedDate
      );

      return {
        ...claim,
        dynamicScore: score,
        dynamicStatus: status,
        isExpiredAtSimDate: isExpired,
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

  // Filtered Claims based on Search, Category, and Status filters
  const filteredClaims = useMemo(() => {
    return dynamicClaims.filter((claim) => {
      // Category filter
      if (selectedCategoryFilter !== "ALL") {
        const cat = claim.category.toUpperCase();
        if (selectedCategoryFilter === "API" && cat !== "API" && cat !== "API_VERSION") return false;
        if (selectedCategoryFilter !== "API" && cat !== selectedCategoryFilter) return false;
      }

      // Status filter
      if (selectedStatusFilter !== "ALL") {
        if (selectedStatusFilter === "FRESH" && claim.dynamicScore < 80) return false;
        if (selectedStatusFilter === "DECAYING" && (claim.dynamicScore < 45 || claim.dynamicScore >= 80)) return false;
        if (selectedStatusFilter === "STALE" && claim.dynamicScore >= 45) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSpan = claim.originalSpan.toLowerCase().includes(query);
        const matchesTruth = (claim.liveTruth || "").toLowerCase().includes(query);
        const matchesReasoning = (claim.adjudicatorReasoning || "").toLowerCase().includes(query);
        const matchesCat = claim.category.toLowerCase().includes(query);
        return matchesSpan || matchesTruth || matchesReasoning || matchesCat;
      }

      return true;
    });
  }, [dynamicClaims, selectedCategoryFilter, selectedStatusFilter, searchQuery]);

  // Safe parse traces
  const telemetryTraces = useMemo(() => {
    try {
      if (!currentAudit.bifrostRoutingTrace) return [];
      return JSON.parse(currentAudit.bifrostRoutingTrace);
    } catch {
      return [];
    }
  }, [currentAudit.bifrostRoutingTrace]);

  // Handle switching specimens (0ms optimistic switch from pre-cache + background sync)
  const loadSpecimen = useCallback(async (slug: string) => {
    // 1. Instant zero-latency optimistic state switch
    if (CACHED_SPECIMENS[slug]) {
      const cached = CACHED_SPECIMENS[slug];
      setCurrentAudit(cached);
      setAuditInputText(cached.rawText);
      setShowAutoHealDiff(false);
    }

    // 2. Background revalidation
    try {
      const res = await fetch(`/api/audit/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentAudit(data.audit);
        setAuditInputText(data.audit.rawText);
      }
    } catch (err) {
      console.warn("Background revalidate skipped, cached specimen active:", err);
    }
  }, []);

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

  const handleExportReport = () => {
    const reportJson = JSON.stringify(
      {
        lab: "HALF-LIFE AI Temporal Decay & Fact Freshness Lab",
        timestamp: new Date().toISOString(),
        chronometerSimulatedDate: simulatedDate,
        audit: {
          id: currentAudit.id,
          title: currentAudit.title,
          overallFreshnessScore: dynamicOverallScore,
          searchSkipSavingsMs: currentAudit.searchSkipSavingsMs,
          claimsCount: dynamicClaims.length,
          claims: dynamicClaims,
        },
      },
      null,
      2
    );

    navigator.clipboard.writeText(reportJson);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Specimen Pills Selector - Instant 0ms Selection */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white/95 to-slate-50/70 dark:from-[#0B1120]/90 dark:to-[#070A13]/90 p-5 sm:p-6 shadow-sm shadow-slate-200/50 dark:shadow-black/50 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Pre-Seeded Forensic Specimens
            </span>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              Instant 0ms Switching
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Select a specimen to test real-world temporal decay dynamics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {SPECIMEN_METADATA.map((spec) => {
            const isSelected = currentAudit.slug === spec.slug;
            return (
              <button
                key={spec.slug}
                onClick={() => loadSpecimen(spec.slug)}
                disabled={isSubmitting}
                className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all active:scale-[0.99] ${
                  isSelected
                    ? "border-emerald-500 bg-gradient-to-b from-emerald-50/80 to-white dark:from-emerald-950/50 dark:to-slate-900 shadow-xs ring-2 ring-emerald-500/25"
                    : "border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-850/80 hover:shadow-2xs"
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
                        isSelected
                          ? "bg-emerald-500 animate-pulse ring-2 ring-emerald-200 dark:ring-emerald-900"
                          : "bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400 dark:group-hover:bg-slate-600"
                      }`}
                    />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-indigo-950 dark:group-hover:text-indigo-300 transition-colors">
                    {spec.label}
                  </h4>
                </div>
                <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {spec.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time-Travel Decay Chronometer (60fps rAF Throttled) */}
      <TimeTravelScrubber
        currentSimulatedDate={simulatedDate}
        onDateChange={setSimulatedDate}
      />

      {/* Interactive Visual Diagram Studio (4 Unique Perspectives) */}
      <div className="space-y-3">
        {/* Diagram Mode Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-1.5 shadow-2xs backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveDiagramTab("CURVES")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition shadow-2xs ${
                activeDiagramTab === "CURVES"
                  ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <TrendingDown className={`h-3.5 w-3.5 ${activeDiagramTab === "CURVES" ? "text-indigo-400 dark:text-white" : "text-slate-400"}`} />
              <span>Decay Trajectories</span>
            </button>

            <button
              onClick={() => setActiveDiagramTab("RADAR")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition shadow-2xs ${
                activeDiagramTab === "RADAR"
                  ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Compass className={`h-3.5 w-3.5 ${activeDiagramTab === "RADAR" ? "text-purple-400 dark:text-white" : "text-slate-400"}`} />
              <span>Entropy Radar</span>
            </button>

            <button
              onClick={() => setActiveDiagramTab("SANDBOX")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition shadow-2xs ${
                activeDiagramTab === "SANDBOX"
                  ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Calculator className={`h-3.5 w-3.5 ${activeDiagramTab === "SANDBOX" ? "text-amber-400 dark:text-white" : "text-slate-400"}`} />
              <span>Formula Sandbox</span>
            </button>

            <button
              onClick={() => setActiveDiagramTab("FLOW")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition shadow-2xs ${
                activeDiagramTab === "FLOW"
                  ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Layers className={`h-3.5 w-3.5 ${activeDiagramTab === "FLOW" ? "text-blue-400 dark:text-white" : "text-slate-400"}`} />
              <span>Routing Architecture</span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-2 text-[11px] font-mono text-slate-400 dark:text-slate-500 hidden md:flex">
            <span>Chronometer Synchronized</span>
            <span>•</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{simulatedDate}</span>
          </div>
        </div>

        {/* Dynamic Diagram Render */}
        {activeDiagramTab === "CURVES" && (
          <DecayCurveChart
            claims={dynamicClaims as any}
            simulatedDate={simulatedDate}
          />
        )}

        {activeDiagramTab === "RADAR" && (
          <KnowledgeEntropyRadar
            claims={dynamicClaims as any}
            simulatedDate={simulatedDate}
          />
        )}

        {activeDiagramTab === "SANDBOX" && (
          <DecaySimulatorSandbox />
        )}

        {activeDiagramTab === "FLOW" && (
          <PipelineArchitectureFlow />
        )}
      </div>

      {/* Input Mode Selector & Forms */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white/95 to-slate-50/60 dark:from-[#0B1120]/90 dark:to-[#070A13]/90 shadow-sm shadow-slate-200/50 dark:shadow-black/50 backdrop-blur-xl">
        {/* Mode Tabs */}
        <div className="flex border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 p-2 gap-2">
          <button
            onClick={() => setActiveTab("AUDIT")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-bold transition-all shadow-2xs ${
              activeTab === "AUDIT"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700 ring-1 ring-slate-900/5"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-850/50"
            }`}
          >
            <FileText className={`h-4 w-4 ${activeTab === "AUDIT" ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
            <span>Audit Existing AI Text</span>
          </button>
          <button
            onClick={() => setActiveTab("GENERATE")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-bold transition-all shadow-2xs ${
              activeTab === "GENERATE"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700 ring-1 ring-slate-900/5"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-850/50"
            }`}
          >
            <Terminal className={`h-4 w-4 ${activeTab === "GENERATE" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
            <span>Live Bifrost Prompt Test</span>
          </button>
        </div>

        {/* Tab 1: Paste & Audit */}
        {activeTab === "AUDIT" && (
          <form onSubmit={handleRunAudit} className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                AI Answer Text to Audit:
              </label>
              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                Decomposes into atomic claims via Bifrost Gateway
              </span>
            </div>

            <textarea
              rows={4}
              value={auditInputText}
              onChange={(e) => setAuditInputText(e.target.value)}
              placeholder="Paste any LLM answer containing code, endpoints, pricing, leadership, or regulatory claims..."
              className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-950/80 p-3.5 font-mono text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Pipeline: Bifrost (groq/gpt-oss-20b) → Tavily Live Search → Bifrost (groq/gpt-oss-120b)
              </span>

              <button
                type="submit"
                disabled={isSubmitting || !auditInputText.trim()}
                className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-indigo-600 px-4 py-2.5 font-mono text-xs font-bold text-white shadow-xs hover:bg-slate-800 dark:hover:bg-indigo-500 disabled:opacity-50 transition active:scale-95"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Prompt for LLM Generation:
                </label>
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="e.g., Provide code for OpenAI Assistants API document retrieval"
                  className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-950/80 px-3.5 py-2.5 font-mono text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Bifrost Model:
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-950/80 px-3 py-2.5 font-mono text-xs text-slate-800 dark:text-slate-100 shadow-inner focus:border-emerald-500 focus:outline-none transition"
                >
                  <option value="groq/openai/gpt-oss-20b">groq/openai/gpt-oss-20b (Fast Decomposer)</option>
                  <option value="groq/openai/gpt-oss-120b">groq/openai/gpt-oss-120b (High-Reasoning)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
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
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white/95 to-slate-50/70 dark:from-[#0B1120]/90 dark:to-[#070A13]/90 p-5 sm:p-6 shadow-sm shadow-slate-200/50 dark:shadow-black/50 backdrop-blur-xl">
            {/* Viewer Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                  <Code2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {currentAudit.title || "Audit Report"}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 dark:text-slate-500">
                    <span>{dynamicClaims.length} Claims Evaluated</span>
                    <span>•</span>
                    <span>Tavily Grounded</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Auto-Heal Diff & Report Export */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportReport}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95"
                  title="Export Forensic Compliance Report JSON"
                >
                  {copiedExport ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />}
                  <span>{copiedExport ? "JSON Copied!" : "Export JSON"}</span>
                </button>

                <button
                  onClick={() => setShowAutoHealDiff(!showAutoHealDiff)}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition shadow-2xs active:scale-95 ${
                    showAutoHealDiff
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Zap className={`h-3.5 w-3.5 ${showAutoHealDiff ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400"}`} />
                  <span>{showAutoHealDiff ? "Viewing Auto-Healed" : "Toggle Auto-Heal Diff"}</span>
                </button>

                {showAutoHealDiff && (
                  <button
                    onClick={handleCopyPatchedText}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-600 px-3 py-1.5 font-mono text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95"
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
                  <div className="flex items-center justify-between text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Auto-Healed Verified Code (Drop-in Replacement):
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Zero-touch temporal rejuvenation
                    </span>
                  </div>
                  <pre className="overflow-x-auto rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-b from-emerald-50/40 to-white dark:from-slate-950 dark:to-[#071710] p-4 font-mono text-xs text-slate-900 dark:text-emerald-300 leading-relaxed shadow-inner">
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
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white/95 to-slate-50/70 dark:from-[#0B1120]/90 dark:to-[#070A13]/90 p-5 shadow-sm shadow-slate-200/50 dark:shadow-black/50 backdrop-blur-xl text-xs space-y-3">
            <div className="flex items-center gap-2.5 font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <span>Temporal Entropy Physics</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              AI facts decay exponentially. The <strong>HALF-LIFE</strong> engine calculates rate card changes, API sunset events, executive shifts, and regulatory updates using live Tavily search indices, while saving latency and costs on static laws via <em>Search-Skip Optimization</em>.
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span>Bifrost Gateway:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">Active Multi-Route</span>
            </div>
          </div>
        </div>
      </div>

      {/* Claims Breakdown Grid with Filter & Search Controls */}
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Atomic Claims & Forensic Evidence
            </h3>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              {filteredClaims.length} of {dynamicClaims.length} Exhibits
            </span>
          </div>

          <span className="font-mono text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
            Click any exhibit card to inspect ground-truth sources in modal
          </span>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-2.5 shadow-2xs backdrop-blur-md">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims, reasoning, or consensus..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/70 dark:bg-slate-950/70 pl-8 pr-3 py-1.5 font-mono text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono font-bold">
            {["ALL", "API", "PRICING", "LEADERSHIP", "REGULATION", "STATIC"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`rounded-lg px-2 py-1 transition ${
                  selectedCategoryFilter === cat
                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold border-l border-slate-200 dark:border-slate-800 pl-2">
            {[
              { id: "ALL", label: "All Status" },
              { id: "FRESH", label: "Fresh" },
              { id: "DECAYING", label: "Decaying" },
              { id: "STALE", label: "Stale" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatusFilter(st.id)}
                className={`rounded-lg px-2 py-1 transition ${
                  selectedStatusFilter === st.id
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Claims Cards */}
        {filteredClaims.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-slate-500 dark:text-slate-400 font-mono text-xs">
            No claims match your search or filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClaims.map((claim) => {
              const badge = formatScoreBadge(claim.dynamicScore);
              const cat = formatCategoryLabel(claim.category);

              // Left colored border accent and luminous background based on category
              const isApi = claim.category === "API" || claim.category === "API_VERSION";
              const isPricing = claim.category === "PRICING";
              const isLeadership = claim.category === "LEADERSHIP";
              const isRegulation = claim.category === "REGULATION";

              const accentBorder = isApi
                ? "border-l-blue-500 hover:border-blue-300 dark:hover:border-blue-400"
                : isPricing
                ? "border-l-amber-500 hover:border-amber-300 dark:hover:border-amber-400"
                : isLeadership
                ? "border-l-purple-500 hover:border-purple-300 dark:hover:border-purple-400"
                : isRegulation
                ? "border-l-pink-500 hover:border-pink-300 dark:hover:border-pink-400"
                : "border-l-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-400";

              const cardBg = isApi
                ? "bg-gradient-to-b from-blue-50/40 via-white to-slate-50/60 dark:from-blue-950/20 dark:via-[#0D1527] dark:to-[#080D1A]"
                : isPricing
                ? "bg-gradient-to-b from-amber-50/40 via-white to-slate-50/60 dark:from-amber-950/20 dark:via-[#0D1527] dark:to-[#080D1A]"
                : isLeadership
                ? "bg-gradient-to-b from-purple-50/40 via-white to-slate-50/60 dark:from-purple-950/20 dark:via-[#0D1527] dark:to-[#080D1A]"
                : isRegulation
                ? "bg-gradient-to-b from-pink-50/40 via-white to-slate-50/60 dark:from-rose-950/20 dark:via-[#0D1527] dark:to-[#080D1A]"
                : "bg-gradient-to-b from-emerald-50/40 via-white to-slate-50/60 dark:from-emerald-950/20 dark:via-[#0D1527] dark:to-[#080D1A]";

              return (
                <Link
                  key={claim.id}
                  href={`/audit/${currentAudit.id}/claim/${claim.id}`}
                  className={`group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800/80 border-l-[5px] ${accentBorder} ${cardBg} p-5 shadow-2xs hover:shadow-md dark:hover:shadow-black/60 transition-all backdrop-blur-xl active:scale-[0.99]`}
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
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            claim.dynamicScore >= 80
                              ? "bg-emerald-500"
                              : claim.dynamicScore >= 45
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          } animate-pulse`}
                        />
                        {badge.label} ({claim.dynamicScore}%)
                      </span>
                    </div>

                    {/* Assertion Snippet */}
                    <div className="font-mono text-xs text-slate-800 dark:text-slate-200 line-clamp-3 leading-relaxed font-medium">
                      &ldquo;{claim.originalSpan}&rdquo;
                    </div>

                    {/* Ground Truth Summary */}
                    <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 p-3 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 shadow-2xs">
                      <span className="font-bold text-slate-800 dark:text-slate-100">Consensus: </span>
                      {claim.liveTruth}
                    </div>
                  </div>

                  {/* Footer Metadata */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 text-[11px]">
                    <div className="flex items-center gap-1 font-mono text-slate-400 dark:text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>t½: {claim.halfLifeDays >= 99999 ? "Static / ∞" : `${claim.halfLifeDays}d`}</span>
                    </div>

                    <div className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Inspect Evidence</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
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
            className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                Claim #{claim.claimIndex + 1} • <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{claim.category}</span>
              </span>
              <Link
                href={`/audit/${auditId}/claim/${claim.id}`}
                className="flex items-center gap-1 font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline"
              >
                <span>Evidence Modal</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <Link
              href={`/audit/${auditId}/claim/${claim.id}`}
              className={`block rounded-xl p-3 font-mono text-xs border transition ${
                claim.dynamicScore >= 80
                  ? "bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-300 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50"
                  : claim.dynamicScore >= 45
                  ? "bg-amber-50/60 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-300 hover:bg-amber-100/70 dark:hover:bg-amber-900/50"
                  : "bg-rose-50/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-950 dark:text-rose-300 hover:bg-rose-100/70 dark:hover:bg-rose-900/50"
              }`}
            >
              {claim.originalSpan}
            </Link>

            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>
                {claim.expiredAtDate === "NEVER"
                  ? "Timeless Invariant (No Expiry)"
                  : `Expired: ${claim.expiredAtDate}`}
              </span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                Score: {claim.dynamicScore}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

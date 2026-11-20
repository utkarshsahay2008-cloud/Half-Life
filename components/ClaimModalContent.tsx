"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  Cpu,
} from "lucide-react";
import { formatScoreBadge, formatCategoryLabel } from "@/lib/utils";
import { SonarRingsPattern } from "./CardGraphics";

export interface ClaimEvidenceData {
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
    id?: string;
    title: string;
    url: string;
    domain: string;
    publishedDate: string;
    snippet: string;
    relevanceScore: number;
  }>;
}

interface ClaimModalContentProps {
  claim: ClaimEvidenceData;
  onClose?: () => void;
  isStandalonePage?: boolean;
}

export function ClaimModalContent({
  claim,
  onClose,
  isStandalonePage = false,
}: ClaimModalContentProps) {
  const [copied, setCopied] = useState(false);
  const badge = formatScoreBadge(claim.freshnessScore);
  const cat = formatCategoryLabel(claim.category);

  const handleCopyReplacement = () => {
    navigator.clipboard.writeText(claim.correctedReplacement);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex flex-col gap-6 text-slate-800">
      {/* Header Profile */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-md border px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wide uppercase ${cat.colorClass}`}
            >
              {cat.label}
            </span>
            <span className="font-mono text-xs text-slate-400">
              Exhibit #{claim.claimIndex + 1}
            </span>
            <span className="font-mono text-xs text-slate-300">•</span>
            <span className="flex items-center gap-1 font-mono text-xs text-slate-500">
              <Clock className="h-3 w-3 text-slate-400" />
              Half-Life: {claim.halfLifeDays >= 99999 ? "∞ (Static Invariant)" : `${claim.halfLifeDays} days`}
            </span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Forensic Ground-Truth Evidence
          </h2>
        </div>

        {/* Freshness Badge */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-2 rounded-2xl border px-3.5 py-1.5 shadow-2xs ${badge.badgeClass}`}
          >
            {claim.freshnessScore >= 80 && <ShieldCheck className="h-4 w-4 text-emerald-600" />}
            {claim.freshnessScore >= 45 && claim.freshnessScore < 80 && (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
            {claim.freshnessScore < 45 && <AlertCircle className="h-4 w-4 text-rose-600" />}
            <span className="font-mono text-sm font-black">{claim.freshnessScore}%</span>
            <span className="font-mono text-xs font-semibold">{badge.label}</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Claim vs Live Ground Truth Diff Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Claim */}
        <div className="flex flex-col rounded-2xl border border-rose-200/90 bg-gradient-to-b from-rose-50/50 to-white p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Original AI Assertion
            </span>
            <span className="font-mono text-[10px] text-rose-600 font-semibold rounded bg-rose-100/60 px-1.5 py-0.2">
              {claim.expiredAtDate === "NEVER"
                ? "Timeless Fact"
                : `Expired: ${claim.expiredAtDate}`}
            </span>
          </div>
          <p className="font-mono text-xs leading-relaxed text-slate-800 break-words whitespace-pre-wrap">
            {claim.originalSpan}
          </p>
        </div>

        {/* Live Ground Truth Replacement */}
        <div className="flex flex-col rounded-2xl border border-emerald-200/90 bg-gradient-to-b from-emerald-50/50 to-white p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Live Ground Truth (Tavily Grounded)
            </span>
            <button
              onClick={handleCopyReplacement}
              className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-emerald-800 shadow-2xs border border-emerald-200 hover:bg-emerald-50 transition active:scale-95"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-emerald-600" />}
              <span>{copied ? "Copied" : "Copy Fix"}</span>
            </button>
          </div>
          <p className="font-mono text-xs leading-relaxed text-slate-900 break-words font-medium whitespace-pre-wrap">
            {claim.correctedReplacement}
          </p>
        </div>
      </div>

      {/* Bifrost Adjudicator Reasoning Box */}
      <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-b from-indigo-50/60 to-white p-4.5 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white font-mono text-[10px] font-bold shadow-2xs">
            BF
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-950">
            Bifrost Reasoning Engine (Routed to groq/openai/gpt-oss-120b)
          </span>
        </div>
        <p className="text-xs leading-relaxed text-slate-700">
          {claim.adjudicatorReasoning}
        </p>
        <div className="mt-2.5 text-xs font-medium text-indigo-900 bg-white/80 rounded-xl p-2.5 border border-indigo-100">
          <span className="font-bold">Temporal Consensus: </span>
          {claim.liveTruth}
        </div>
      </div>

      {/* Tavily Grounding Citations */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-200/90 bg-gradient-to-b from-teal-50/30 to-white p-5 shadow-2xs">
        <SonarRingsPattern />

        <div className="relative z-10 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-teal-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-teal-950">
                Tavily Live Web Evidence ({claim.sources?.length || 0} Citations)
              </span>
            </div>
            <span className="rounded-md bg-teal-50 px-2 py-0.5 font-mono text-[10px] text-teal-700 font-bold border border-teal-200/70">
              search_depth: &quot;advanced&quot;
            </span>
          </div>

          <div className="space-y-3">
            {claim.sources?.map((source, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 text-xs shadow-2xs hover:border-teal-300 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-1.5 font-bold text-teal-800 hover:text-teal-950 hover:underline"
                  >
                    <span>{source.title}</span>
                    <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                  </a>

                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 border border-slate-200">
                      {source.domain}
                    </span>
                    <span>Date: {source.publishedDate}</span>
                    <span className="rounded-md bg-teal-50 px-1.5 py-0.5 font-bold text-teal-800 border border-teal-200">
                      Score: {source.relevanceScore}
                    </span>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed italic border-l-2 border-teal-400 pl-2.5">
                  &ldquo;{source.snippet}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

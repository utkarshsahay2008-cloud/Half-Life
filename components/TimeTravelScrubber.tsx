"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Clock, Sparkles } from "lucide-react";
import {
  CHRONOMETER_MIN_EPOCH,
  CHRONOMETER_MAX_EPOCH,
  CHRONOMETER_MILESTONES,
} from "@/lib/chronometer";

interface TimeTravelScrubberProps {
  currentSimulatedDate: string; // YYYY-MM-DD
  onDateChange: (newDate: string) => void;
}

export function TimeTravelScrubber({
  currentSimulatedDate,
  onDateChange,
}: TimeTravelScrubberProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Convert current date string to exact timeline percentage (0 to 100)
  const currentEpoch = new Date(currentSimulatedDate).getTime() || CHRONOMETER_MAX_EPOCH;
  const currentEpochRef = useRef(currentEpoch);
  currentEpochRef.current = currentEpoch;

  const sliderPercent = Math.min(
    100,
    Math.max(0, ((currentEpoch - CHRONOMETER_MIN_EPOCH) / (CHRONOMETER_MAX_EPOCH - CHRONOMETER_MIN_EPOCH)) * 100)
  );

  const handleSliderInput = (val: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const epoch = CHRONOMETER_MIN_EPOCH + (val / 100) * (CHRONOMETER_MAX_EPOCH - CHRONOMETER_MIN_EPOCH);
      const dateStr = new Date(epoch).toISOString().split("T")[0];
      onDateChange(dateStr);
    });
  };

  const handleMilestoneClick = (dateStr: string) => {
    setIsPlaying(false);
    onDateChange(dateStr);
  };

  // Continuous buttery smooth playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const cur = currentEpochRef.current;
      const nextEpoch = cur + (CHRONOMETER_MAX_EPOCH - CHRONOMETER_MIN_EPOCH) * 0.015;
      if (nextEpoch >= CHRONOMETER_MAX_EPOCH) {
        onDateChange("2026-11-20");
        setIsPlaying(false);
      } else {
        const nextDateStr = new Date(nextEpoch).toISOString().split("T")[0];
        onDateChange(nextDateStr);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, onDateChange]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isCurrentToday = currentSimulatedDate === "2026-11-20";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/95 via-white/85 to-slate-50/70 p-5 sm:p-6 shadow-sm shadow-slate-200/50 backdrop-blur-xl">
      <div className="relative z-10 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-indigo-600 text-white shadow-md shadow-emerald-500/20">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase text-slate-800">
                  Time-Travel Decay Chronometer
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  Active Real-Time Needle
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Drag needle to travel across history and observe continuous mathematical factual decay.
              </p>
            </div>
          </div>

          {/* Current Date Display & Playback Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-white px-3.5 py-1.5 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-400">Date:</span>
              <span className="font-mono text-sm font-black text-indigo-950 tracking-tight">
                {currentSimulatedDate}
              </span>
              {isCurrentToday ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  PRESENT DAY
                </span>
              ) : (
                <span className="rounded-md bg-amber-50 px-2 py-0.5 font-mono text-[9px] font-bold text-amber-700 border border-amber-200">
                  PAST ERA
                </span>
              )}
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex h-8 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold transition shadow-xs active:scale-95 ${
                isPlaying
                  ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/25"
                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20"
              }`}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isPlaying ? "Pause" : "Play Decay"}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                onDateChange("2023-06-01");
              }}
              title="Reset to 2023 Baseline"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Chronometer Timeline Slider Track */}
        <div className="relative pt-4 pb-1">
          {/* Track Container */}
          <div className="relative h-6 flex items-center">
            {/* Background Base Rail */}
            <div className="absolute inset-x-0 h-3 rounded-full bg-slate-100 border border-slate-200/90 shadow-inner" />

            {/* Active Vibrant Multi-Stop Gradient Fill - Perfectly Synced */}
            <div
              className="absolute left-0 h-3 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 via-blue-500 via-indigo-500 to-purple-600 shadow-xs"
              style={{ width: `${sliderPercent}%` }}
            />

            {/* Milestone Anchor Ticks along the rail */}
            {CHRONOMETER_MILESTONES.map((m) => (
              <div
                key={m.date}
                className="absolute -top-1 bottom-0 flex flex-col items-center pointer-events-none"
                style={{ left: `${m.percent}%`, transform: "translateX(-50%)" }}
              >
                <div
                  className={`w-1.5 h-5 rounded-full border border-white shadow-2xs ${
                    sliderPercent >= m.percent ? "bg-white" : "bg-slate-300"
                  }`}
                />
              </div>
            ))}

            {/* Native Slider input overlay */}
            <input
              type="range"
              min="0"
              max="100"
              step="0.25"
              value={sliderPercent}
              onChange={(e) => handleSliderInput(parseFloat(e.target.value))}
              className="relative z-20 h-6 w-full cursor-pointer appearance-none bg-transparent accent-indigo-600 focus:outline-none"
            />
          </div>

          {/* Mathematically Positioned Milestone Markers */}
          <div className="relative mt-3 h-14 w-full">
            {CHRONOMETER_MILESTONES.map((m) => {
              const isPast = sliderPercent >= m.percent;
              const isCurrent = Math.abs(sliderPercent - m.percent) < 3.5;

              // Prevent edge overflow for first and last labels
              let alignClass = "items-center -translate-x-1/2";
              if (m.percent === 0) alignClass = "items-start translate-x-0";
              if (m.percent === 100) alignClass = "items-end -translate-x-full";

              return (
                <button
                  key={m.date}
                  onClick={() => handleMilestoneClick(m.date)}
                  className={`absolute top-0 flex flex-col ${alignClass} group transition-all text-left`}
                  style={{ left: `${m.percent}%` }}
                >
                  {/* Pin Dot */}
                  <span
                    className={`h-2.5 w-2.5 rounded-full border-2 border-white shadow-xs transition-all ${
                      isCurrent
                        ? "bg-indigo-600 ring-4 ring-indigo-200 scale-125"
                        : isPast
                        ? "bg-emerald-500"
                        : "bg-slate-300 group-hover:bg-slate-400"
                    }`}
                  />

                  {/* Label & Sublabel */}
                  <div className="mt-1 flex flex-col items-center">
                    <span
                      className={`font-mono text-[10px] whitespace-nowrap transition-colors ${
                        isCurrent
                          ? "font-black text-indigo-950"
                          : isPast
                          ? "font-bold text-slate-800"
                          : "font-medium text-slate-400 group-hover:text-slate-600"
                      }`}
                    >
                      {m.label}
                    </span>
                    <span className="font-mono text-[8px] text-slate-400 whitespace-nowrap hidden sm:inline">
                      {m.sublabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

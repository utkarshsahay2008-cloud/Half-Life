import React from "react";

/**
 * Concentric Sonar Rings SVG Pattern for Tavily Search Cards
 */
export function SonarRingsPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute right-0 top-0 h-full w-48 opacity-[0.055] select-none ${className}`}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="150" cy="50" r="30" stroke="#0D9488" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="150" cy="50" r="60" stroke="#0D9488" strokeWidth="1.5" />
      <circle cx="150" cy="50" r="95" stroke="#0D9488" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="150" cy="50" r="130" stroke="#0D9488" strokeWidth="1.5" />
      <circle cx="150" cy="50" r="165" stroke="#0D9488" strokeWidth="1.5" strokeDasharray="6 6" />
      <line x1="0" y1="50" x2="200" y2="50" stroke="#0D9488" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="150" y1="0" x2="150" y2="200" stroke="#0D9488" strokeWidth="1" strokeOpacity="0.7" />
    </svg>
  );
}

/**
 * Circuit & Multi-Model Routing Splines SVG Pattern for Bifrost Gateway Cards
 */
export function CircuitSplinesPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute right-0 top-0 h-full w-56 opacity-[0.05] select-none ${className}`}
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 90 H80 L110 40 H180 L200 60 H240"
        stroke="#2563EB"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M20 90 H60 L90 140 H160 L190 110 H240"
        stroke="#2563EB"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeDasharray="4 3"
      />
      <circle cx="80" cy="90" r="3.5" fill="#2563EB" />
      <circle cx="110" cy="40" r="3.5" fill="#2563EB" />
      <circle cx="180" cy="40" r="3.5" fill="#2563EB" />
      <circle cx="90" cy="140" r="3.5" fill="#2563EB" />
      <circle cx="160" cy="140" r="3.5" fill="#2563EB" />
      <circle cx="200" cy="60" r="4.5" stroke="#2563EB" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Precision Chronometer Ruler Ticks SVG Pattern for Temporal Scrubber
 */
export function RulerTicksPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-4 w-full text-slate-900 dark:text-slate-100 opacity-[0.08] dark:opacity-[0.20] select-none ${className}`}
      preserveAspectRatio="none"
      viewBox="0 0 600 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: 30 }).map((_, i) => {
        const x = (i / 29) * 600;
        const isMajor = i % 5 === 0;
        return (
          <line
            key={i}
            x1={x}
            y1={isMajor ? 0 : 8}
            x2={x}
            y2={20}
            stroke="currentColor"
            strokeWidth={isMajor ? 1.5 : 1}
          />
        );
      })}
    </svg>
  );
}

import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60 mb-4 shadow-sm">
        <Compass className="h-8 w-8 animate-pulse" />
      </div>
      <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
        404 — Temporal Coordinate Not Found
      </span>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        This audit or claim has decayed into oblivion
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
        The requested temporal snapshot or claim identifier does not exist in the forensic ledger.
      </p>
      <Link
        href="/"
        className="mt-6 flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-rose-600 px-4 py-2 font-mono text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:hover:bg-rose-500 transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to Freshness Lab</span>
      </Link>
    </div>
  );
}

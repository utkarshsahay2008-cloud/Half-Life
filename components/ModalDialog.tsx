"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface ModalDialogProps {
  children: React.ReactNode;
}

export function ModalDialog({ children }: ModalDialogProps) {
  const router = useRouter();

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-slate-950/40 dark:bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Surface */}
      <div className="relative z-10 w-full max-w-3xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white to-slate-50/90 dark:from-[#0D1322] dark:to-[#090D18] p-6 sm:p-8 shadow-2xl shadow-slate-900/10 dark:shadow-black/50 backdrop-blur-2xl ring-1 ring-slate-900/5 dark:ring-white/5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition active:scale-95 border border-transparent dark:border-slate-700/60"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {children}
      </div>
    </div>
  );
}

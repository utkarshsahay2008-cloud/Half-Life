"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface ModalDialogProps {
  children: React.ReactNode;
}

export function ModalDialog({ children }: ModalDialogProps) {
  const router = useRouter();

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.back();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => router.back()}
        className="fixed inset-0 bg-slate-900/35 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Surface */}
      <div className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/90 bg-white/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
        <button
          onClick={() => router.back()}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {children}
      </div>
    </div>
  );
}

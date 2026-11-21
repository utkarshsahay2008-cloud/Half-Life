import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScoreBadge(score: number): {
  label: string;
  badgeClass: string;
  textClass: string;
  borderClass: string;
  glowClass: string;
} {
  if (score >= 80) {
    return {
      label: "FRESH",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60",
      textClass: "text-emerald-600 dark:text-emerald-400",
      borderClass: "border-emerald-500",
      glowClass: "shadow-glow-emerald",
    };
  }
  if (score >= 45) {
    return {
      label: "DECAYING",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60",
      textClass: "text-amber-600 dark:text-amber-400",
      borderClass: "border-amber-500",
      glowClass: "shadow-glow-amber",
    };
  }
  return {
    label: "STALE",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60",
    textClass: "text-rose-600 dark:text-rose-400",
    borderClass: "border-rose-500",
    glowClass: "shadow-glow-rose",
  };
}

export function formatCategoryLabel(category: string): {
  label: string;
  colorClass: string;
} {
  switch (category) {
    case "API_VERSION":
      return {
        label: "API / SDK Spec",
        colorClass: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-800/60",
      };
    case "PRICING":
      return {
        label: "Pricing & Economics",
        colorClass: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800/60",
      };
    case "LEADERSHIP":
      return {
        label: "Leadership & Exec",
        colorClass: "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950/60 dark:border-purple-800/60",
      };
    case "REGULATION":
      return {
        label: "Legal & Regulatory",
        colorClass: "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/60 dark:border-rose-800/60",
      };
    case "STATIC":
    default:
      return {
        label: "Static Invariant",
        colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800/60",
      };
  }
}

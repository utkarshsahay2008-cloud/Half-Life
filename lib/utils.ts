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
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      textClass: "text-emerald-600",
      borderClass: "border-emerald-500",
      glowClass: "shadow-glow-emerald",
    };
  }
  if (score >= 45) {
    return {
      label: "DECAYING",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80",
      textClass: "text-amber-600",
      borderClass: "border-amber-500",
      glowClass: "shadow-glow-amber",
    };
  }
  return {
    label: "STALE",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80",
    textClass: "text-rose-600",
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
      return { label: "API / SDK Spec", colorClass: "text-indigo-600 bg-indigo-50 border-indigo-200" };
    case "PRICING":
      return { label: "Pricing & Economics", colorClass: "text-amber-600 bg-amber-50 border-amber-200" };
    case "LEADERSHIP":
      return { label: "Leadership & Exec", colorClass: "text-purple-600 bg-purple-50 border-purple-200" };
    case "REGULATION":
      return { label: "Legal & Regulatory", colorClass: "text-rose-600 bg-rose-50 border-rose-200" };
    case "STATIC":
    default:
      return { label: "Static Invariant", colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  }
}

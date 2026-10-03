import React from "react";
import { Sparkles, Edit3, ShieldAlert } from "lucide-react";

export function AIBadge({ label = "AI-Generated Guidance", size = "sm" }: { label?: string; size?: "xs" | "sm" | "md" }) {
  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5",
    sm: "text-xs px-2.5 py-1",
    md: "text-sm px-3 py-1.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 shadow-sm ${sizeClasses}`}
      title="Generated dynamically by Google Gemini AI Service Layer"
    >
      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
      <span>{label}</span>
    </span>
  );
}

export function SourceBadge({ source }: { source?: string }) {
  if (source === "user_edited") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
        <Edit3 className="w-3 h-3 text-emerald-400" />
        User-Edited
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border border-purple-800/60">
      <Sparkles className="w-3 h-3 text-purple-400" />
      AI-Extracted
    </span>
  );
}

export function DisclaimerBanner({ text }: { text?: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs leading-relaxed">
      <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
      <div>
        <span className="font-semibold">AI Guidance Notice: </span>
        {text || "Recommendations and evaluations are AI-generated advisory models tailored to your profile. Real-world industry outcomes depend on direct interview performance and company criteria."}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell
} from "recharts";
import { ArrowUpDown, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface GapItem {
  skill_name: string;
  category: string;
  current_proficiency: number;
  target_proficiency: number;
  importance: string;
  gap_severity: string;
  estimated_hours_to_bridge: number;
  learning_resources: { title: string; url: string }[];
}

export function SkillGapChart({ gaps, careerName }: { gaps: GapItem[]; careerName: string }) {
  const [viewType, setViewType] = useState<"radar" | "bar">("radar");
  const [sortBy, setSortBy] = useState<"severity" | "hours" | "proficiency">("severity");

  if (!gaps || gaps.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
        No skill gap data available yet. Please select a career target to analyze.
      </div>
    );
  }

  // Format data for radar
  const radarData = gaps.map((g) => ({
    subject: g.skill_name.length > 18 ? g.skill_name.slice(0, 16) + "..." : g.skill_name,
    fullName: g.skill_name,
    Current: g.current_proficiency,
    Target: g.target_proficiency,
    gap: Math.max(0, g.target_proficiency - g.current_proficiency),
  }));

  // Sorting
  const severityRank: Record<string, number> = {
    Critical: 4,
    Major: 3,
    Moderate: 2,
    Minimal: 1,
  };

  const sortedGaps = [...gaps].sort((a, b) => {
    if (sortBy === "severity") {
      return (severityRank[b.gap_severity] || 0) - (severityRank[a.gap_severity] || 0);
    }
    if (sortBy === "hours") {
      return b.estimated_hours_to_bridge - a.estimated_hours_to_bridge;
    }
    return a.current_proficiency - b.current_proficiency;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/60 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-rose-400" /> Critical</span>;
      case "major":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">Major</span>;
      case "moderate":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60">Moderate</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" /> Minimal</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewType("radar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewType === "radar"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Radar Spectrum
          </button>
          <button
            onClick={() => setViewType("bar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewType === "bar"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Proficiency Comparison
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort Gaps:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="severity">Gap Severity (High to Low)</option>
            <option value="hours">Estimated Hours Needed</option>
            <option value="proficiency">Current Proficiency</option>
          </select>
        </div>
      </div>

      {/* Chart visualization */}
      <div className="p-6 rounded-2xl bg-[#0d1322]/80 border border-slate-800/80 shadow-xl backdrop-blur-md">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center justify-between">
          <span>Competency Distribution: {careerName}</span>
          <span className="text-xs font-normal text-slate-400">Current vs Required Industry Benchmarks</span>
        </h3>

        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewType === "radar" ? (
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="Current Proficiency" dataKey="Current" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.45} />
                <Radar name="Target Proficiency" dataKey="Target" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", color: "#f8fafc" }}
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
              </RadarChart>
            ) : (
              <BarChart data={radarData} layout="vertical" margin={{ left: 30, right: 30, top: 10, bottom: 10 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" />
                <YAxis dataKey="subject" type="category" stroke="#94a3b8" width={110} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="Current" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Current Level" />
                <Bar dataKey="Target" fill="#38bdf8" radius={[0, 4, 4, 0]} name="Target Level" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sortable Detailed Skill Gap Table (FR-GAP-4) */}
      <div className="rounded-2xl bg-[#0d1322]/80 border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">Actionable Skill Gap Breakdown</h4>
          <span className="text-xs text-slate-400">{sortedGaps.length} Competencies Evaluated</span>
        </div>
        <div className="divide-y divide-slate-800/80">
          {sortedGaps.map((item, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-sm text-slate-100">{item.skill_name}</span>
                  <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {item.category}
                  </span>
                  {getSeverityBadge(item.gap_severity)}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Current: <strong className="text-purple-300">{item.current_proficiency}%</strong></span>
                  <span>Target: <strong className="text-sky-300">{item.target_proficiency}%</strong></span>
                  <span>Delta: <strong className="text-rose-300">-{Math.max(0, item.target_proficiency - item.current_proficiency)}%</strong></span>
                  <span className="flex items-center gap-1 text-amber-300/90">
                    <Clock className="w-3.5 h-3.5" /> ~{item.estimated_hours_to_bridge} hours to bridge
                  </span>
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="w-full md:w-64 space-y-1.5 shrink-0">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Progress</span>
                  <span>{item.current_proficiency} / {item.target_proficiency}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, item.current_proficiency)}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 border-r-2 border-sky-400"
                    style={{ left: `${item.target_proficiency}%` }}
                    title={`Target: ${item.target_proficiency}%`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

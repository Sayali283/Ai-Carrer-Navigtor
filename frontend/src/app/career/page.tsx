"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { AIBadge, DisclaimerBanner } from "@/components/AIBadge";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import {
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Award,
  Layers,
  BarChart2
} from "lucide-react";

export default function CareerPage() {
  const { user, loginDemoUser } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [targetSuccess, setTargetSuccess] = useState<string | null>(null);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await api.getCareerRecommendations();
      setRecommendations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      loginDemoUser().then(() => loadRecommendations());
    } else {
      loadRecommendations();
    }
  }, [user]);

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const data = await api.regenerateRecommendations();
      setRecommendations(data);
    } catch (err: any) {
      alert(`Error regenerating: ${err.message}`);
    } finally {
      setRegenerating(false);
    }
  };

  const handleSetTarget = async (careerName: string) => {
    try {
      await api.setTargetCareer(careerName);
      setRecommendations((prev) =>
        prev.map((r) => ({ ...r, is_target: r.career_name === careerName }))
      );
      setTargetSuccess(`Set '${careerName}' as your primary learning goal!`);
      setTimeout(() => setTargetSuccess(null), 3000);
    } catch (err: any) {
      alert(`Failed to set target: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14]">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-x-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Dynamic Career Discovery</h1>
                <AIBadge label="Gemini Evaluated" size="xs" />
              </div>
              <p className="text-xs text-slate-400">
                Generated dynamically from your complete background without fixed lists. Multi-factor weighted match scoring.
              </p>
            </div>

            <button
              onClick={handleRegenerate}
              disabled={regenerating || loading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} />
              <span>Regenerate AI Evaluation</span>
            </button>
          </div>

          {targetSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{targetSuccess}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto text-indigo-400 animate-spin" />
              <p className="text-xs text-slate-400">Evaluating your student profile with Gemini AI...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {recommendations.map((rec, idx) => (
                <div
                  key={rec.id || idx}
                  className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 shadow-xl space-y-6 ${
                    rec.is_target
                      ? "bg-[#0f172a] border-indigo-500/70 shadow-indigo-500/10 ring-1 ring-indigo-500/30"
                      : "bg-[#0d1322]/80 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {rec.career_name}
                        </h2>
                        {rec.is_target && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 flex items-center gap-1">
                            <Target className="w-3.5 h-3.5 text-indigo-400" />
                            Target Goal
                          </span>
                        )}
                        <AIBadge label="AI-Generated Guidance" size="xs" />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                        {rec.reasoning}
                      </p>
                    </div>

                    {/* Overall Match Score Gauge */}
                    <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 shrink-0">
                      <div className="text-center">
                        <div className="text-3xl font-black gradient-text">
                          {rec.match_score}%
                        </div>
                        <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                          Explainable Match
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Factor Score Breakdown (FR-CAR-4) */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                    <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Multi-Factor Compatibility Breakdown (FR-CAR-4)</span>
                      <span className="text-[11px] text-slate-500 font-mono">Weighted Algorithm</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Tech Skills (35%)</span>
                          <span className="text-indigo-300 font-semibold">{rec.technical_skills_score}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${rec.technical_skills_score}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Projects (25%)</span>
                          <span className="text-purple-300 font-semibold">{rec.project_relevance_score}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${rec.project_relevance_score}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Education (15%)</span>
                          <span className="text-sky-300 font-semibold">{rec.education_score}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-sky-500 rounded-full" style={{ width: `${rec.education_score}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Experience (15%)</span>
                          <span className="text-emerald-300 font-semibold">{rec.experience_score}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rec.experience_score}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills: Matching vs Missing (FR-CAR-2) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Relevant Skills */}
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 space-y-2">
                      <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Profile Strengths Aligned</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.relevant_skills?.map((s: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-200 border border-emerald-800/50"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 space-y-2">
                      <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>High Priority Competencies to Learn</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.missing_skills?.map((m: string, mIdx: number) => (
                          <span
                            key={mIdx}
                            className="text-[11px] px-2.5 py-0.5 rounded-md bg-amber-950/60 text-amber-200 border border-amber-800/50"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommended Action Items */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-300">Actionable Next Steps:</span>
                    <ul className="text-xs text-slate-400 space-y-1 pl-5 list-disc">
                      {rec.recommended_actions?.map((act: string, aIdx: number) => (
                        <li key={aIdx}>{act}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Compensation & Outlook Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                    <div className="flex items-center gap-6 text-xs text-slate-400">
                      {rec.salary_range && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Industry Range: <strong className="text-slate-200">{rec.salary_range}</strong></span>
                        </span>
                      )}
                      {rec.growth_outlook && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                          <span>Growth: <strong className="text-slate-200">{rec.growth_outlook}</strong></span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!rec.is_target && (
                        <button
                          onClick={() => handleSetTarget(rec.career_name)}
                          className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/40 transition cursor-pointer"
                        >
                          Select as Target Goal
                        </button>
                      )}
                      <Link
                        href={`/skill-gap?career=${encodeURIComponent(rec.career_name)}`}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>View Skill Gap</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <DisclaimerBanner text="Career recommendations are dynamically derived advisory estimates. Scoring combines technical skills, projects, coursework, and market hiring signals." />
        </main>
      </div>
    </div>
  );
}

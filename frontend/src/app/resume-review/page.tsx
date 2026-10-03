"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { AIBadge, DisclaimerBanner } from "@/components/AIBadge";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import {
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Award,
  FileText,
  TrendingUp,
  Tag
} from "lucide-react";

export default function ResumeReviewPage() {
  const { user, loginDemoUser } = useAuth();
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);

  const loadReview = async () => {
    try {
      setLoading(true);
      const data = await api.getLatestReview();
      if (data) {
        setReview(data);
      } else {
        await handleRunAudit();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      loginDemoUser().then(() => loadReview());
    } else {
      loadReview();
    }
  }, [user]);

  const handleRunAudit = async () => {
    setAuditing(true);
    try {
      const res = await api.reviewResume();
      setReview(res);
    } catch (err: any) {
      alert(`Audit failed: ${err.message}`);
    } finally {
      setAuditing(false);
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
                <h1 className="text-2xl font-bold text-white">ATS Resume Reviewer & Metric Enhancer</h1>
                <AIBadge label="Gemini ATS Auditor" size="xs" />
              </div>
              <p className="text-xs text-slate-400">
                FR-REV: Strict metric-based review. Refactors passive project bullets into Google XYZ achievement formats without fabricating false qualifications (FR-REV-3).
              </p>
            </div>

            <button
              onClick={handleRunAudit}
              disabled={auditing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              {auditing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Re-run ATS Audit</span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto text-emerald-400 animate-spin" />
              <p className="text-xs text-slate-400">Auditing resume content and keyword alignment...</p>
            </div>
          ) : review ? (
            <div className="space-y-8 animate-fadeIn">
              {/* ATS Score Overview Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-700/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-300">
                    ATS Recruiter Benchmark Score
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Overall Resume Impact: <span className="text-emerald-400">{review.overall_score} / 100</span>
                  </h2>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    {review.summary}
                  </p>
                </div>

                <div className="w-24 h-24 rounded-full border-4 border-emerald-500/40 flex flex-col items-center justify-center bg-emerald-950/80 shadow-lg shadow-emerald-600/20 shrink-0">
                  <span className="text-2xl font-black text-white">{review.overall_score}%</span>
                  <span className="text-[9px] uppercase font-bold text-emerald-300">Grade</span>
                </div>
              </div>

              {/* Weak Sections Identification (FR-REV-1) */}
              <div className="p-6 rounded-3xl bg-[#0d1322]/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Identified Weak Sections & Fixes (FR-REV-1)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {review.weak_sections?.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="text-xs font-semibold text-amber-300">{item.section}</div>
                      <p className="text-xs text-slate-400"><strong className="text-slate-300">Issue:</strong> {item.issue}</p>
                      <p className="text-xs text-emerald-300"><strong className="text-emerald-200">Recommended Correction:</strong> {item.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google XYZ Bullet Point Rewrites (FR-REV-2, FR-REV-3) */}
              <div className="p-6 rounded-3xl bg-[#0d1322]/80 border border-slate-800 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Google XYZ Formula Rewrites (Accomplished [X] measured by [Y] by doing [Z])</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Transforming vague task descriptions into quantified technical contributions without fabricating data.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {review.bullet_rewrites?.map((rewrite: any, rIdx: number) => (
                    <div
                      key={rIdx}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3"
                    >
                      {/* Before */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                          Before (Passive Phrasing):
                        </span>
                        <div className="text-xs text-slate-400 bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/40 italic">
                          "{rewrite.before}"
                        </div>
                      </div>

                      {/* After */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                            Optimized (XYZ Format):
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                            {rewrite.metric_boost}
                          </span>
                        </div>
                        <div className="text-xs text-slate-100 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/40 font-medium">
                          "{rewrite.after}"
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ATS Keywords: Recommended vs Missing (FR-REV-2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recommended ATS Keywords */}
                <div className="p-5 rounded-2xl bg-[#0d1322]/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                    <Tag className="w-4 h-4 text-indigo-400" />
                    <span>Recommended ATS Keywords for Target Role</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {review.ats_keywords_recommended?.map((kw: string, kIdx: number) => (
                      <span key={kIdx} className="text-xs px-2.5 py-1 rounded-md bg-indigo-950/70 text-indigo-200 border border-indigo-800/50">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing ATS Keywords */}
                <div className="p-5 rounded-2xl bg-[#0d1322]/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Keywords Missing from Current Resume</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {review.ats_keywords_missing?.map((kw: string, kIdx: number) => (
                      <span key={kIdx} className="text-xs px-2.5 py-1 rounded-md bg-rose-950/70 text-rose-200 border border-rose-800/50">
                        + Add "{kw}"
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#0d1322]/80 rounded-3xl border border-slate-800 space-y-3">
              <FileText className="w-12 h-12 mx-auto text-emerald-400 opacity-60" />
              <h3 className="text-sm font-bold text-white">No Resume Audit Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload your resume or initialize your profile to conduct an automated ATS inspection.
              </p>
              <button
                onClick={handleRunAudit}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                Run First Audit
              </button>
            </div>
          )}

          <DisclaimerBanner text="FR-REV-3 Compliance: Antigravity AI never invents false employment history, credentials, or fraudulent project claims. All rewrites highlight existing work with standard industry impact metrics." />
        </main>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { AIBadge, DisclaimerBanner } from "@/components/AIBadge";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Zap,
  Clock,
  Layers,
  FileText
} from "lucide-react";

export default function JobMatchPage() {
  const { user, loginDemoUser } = useAuth();
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = async () => {
    try {
      const data = await api.getJobMatchHistory();
      setHistory(data);
      if (data.length > 0 && !matchResult) {
        setMatchResult(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!user) {
      loginDemoUser().then(() => loadHistory());
    } else {
      loadHistory();
    }
  }, [user]);

  const handleLoadSampleJD = async () => {
    try {
      const res = await api.getSampleJD();
      setJobDescription(res.sample_jd);
      setJobTitle("Full Stack Engineer (Python / Next.js)");
      setCompany("CloudScale AI Labs");
    } catch (err: any) {
      alert(`Error loading sample JD: ${err.message}`);
    }
  };

  const handleMatchJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;
    setMatching(true);
    try {
      const res = await api.matchJob({
        job_description: jobDescription,
        job_title: jobTitle || undefined,
        company: company || undefined,
      });
      setMatchResult(res);
      await loadHistory();
    } catch (err: any) {
      alert(`Job matching failed: ${err.message}`);
    } finally {
      setMatching(false);
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
                <h1 className="text-2xl font-bold text-white">Job Description Matcher & Prep Plan</h1>
                <AIBadge label="Gemini JD Parser" size="xs" />
              </div>
              <p className="text-xs text-slate-400">
                FR-JOB: Paste any real job posting. Gemini extracts requirements, computes an explainable match score, and formats an actionable job-preparation plan.
              </p>
            </div>

            <button
              onClick={handleLoadSampleJD}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition cursor-pointer self-start sm:self-auto shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Load Sample Production JD</span>
            </button>
          </div>

          {/* Form to paste JD */}
          <form
            onSubmit={handleMatchJob}
            className="p-6 sm:p-8 rounded-3xl bg-[#0d1322]/90 border border-slate-800 shadow-2xl space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Target Role Title (Optional)</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Company Name (Optional)</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe, OpenAI, Google"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Paste Job Description Text (FR-JOB-1)
              </label>
              <textarea
                required
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description from LinkedIn, Indeed, or career page..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={matching || !jobDescription.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                {matching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Requirements & Matching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Match & Generate Prep Plan</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results: Match Score & Plan (FR-JOB-3, 4, 5) */}
          {matchResult && (
            <div className="space-y-8 animate-fadeIn">
              {/* Top Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-700/50 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    JD Match Intelligence
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {matchResult.job_title} • <span className="text-emerald-300">{matchResult.company}</span>
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    {matchResult.responsibilities_summary}
                  </p>
                </div>

                <div className="text-center p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shrink-0">
                  <div className="text-4xl font-black text-emerald-400">
                    {matchResult.match_score}%
                  </div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    JD Compatibility
                  </div>
                </div>
              </div>

              {/* Skills breakdown: Required, Preferred, Matching, Missing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matching Skills */}
                <div className="p-5 rounded-2xl bg-[#0d1322]/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Matching Competencies in Your Profile</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matching_skills?.map((s: string, idx: number) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-emerald-950/70 text-emerald-200 border border-emerald-800/50">
                        {s}
                      </span>
                    ))}
                  </div>

                  {matchResult.match_strengths && matchResult.match_strengths.length > 0 && (
                    <div className="pt-2 text-xs text-slate-400 space-y-1">
                      <span className="font-semibold text-slate-300">Profile Strengths Highlight:</span>
                      <ul className="list-disc pl-5 space-y-0.5">
                        {matchResult.match_strengths.map((str: string, sIdx: number) => (
                          <li key={sIdx}>{str}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Missing Skills */}
                <div className="p-5 rounded-2xl bg-[#0d1322]/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Missing Skills Required by JD</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missing_skills?.map((m: string, idx: number) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-amber-950/70 text-amber-200 border border-amber-800/50">
                        {m}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 text-xs text-slate-400">
                    Targeted cram plan below specifically addresses these missing requirements prior to interview rounds.
                  </div>
                </div>
              </div>

              {/* Personalised Job-Preparation Plan (FR-JOB-4, FR-JOB-5) */}
              <div className="rounded-3xl bg-[#0d1322]/80 border border-slate-800 overflow-hidden shadow-2xl space-y-4 p-6 sm:p-8">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>Actionable Job-Preparation Sprint (FR-JOB-4 & 5)</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Step-by-step milestones to close your JD gaps before submitting your application.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {matchResult.preparation_plan?.map((phase: any, pIdx: number) => (
                    <div
                      key={pIdx}
                      className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-400">{phase.phase}</span>
                          <span className="text-slate-500 font-mono">{phase.duration_days} Days</span>
                        </div>
                        <h4 className="font-semibold text-sm text-white">{phase.focus}</h4>
                        <ul className="text-xs text-slate-300 space-y-1.5 pl-5 list-disc">
                          {phase.actions?.map((act: string, aIdx: number) => (
                            <li key={aIdx}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DisclaimerBanner text="JD parsing identifies explicit and implicit keywords from contemporary technical postings. Use the job-preparation plan to align project metrics with candidate criteria." />
        </main>
      </div>
    </div>
  );
}

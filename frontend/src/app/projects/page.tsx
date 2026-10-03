"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { AIBadge, DisclaimerBanner } from "@/components/AIBadge";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import {
  Layers,
  Sparkles,
  ArrowRight,
  Code,
  Terminal,
  Database,
  CheckCircle2,
  RefreshCw,
  FileText,
  Sliders
} from "lucide-react";

export default function ProjectsPage() {
  const { user, loginDemoUser } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [targetCareer, setTargetCareer] = useState("Full Stack AI Engineer");

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getSavedProjects();
      if (data.length > 0) {
        setProjects(data);
      } else {
        // Auto-generate initial set
        await handleGenerate();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      loginDemoUser().then(() => loadProjects());
    } else {
      loadProjects();
    }
  }, [user]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const generated = await api.generateProjects({
        target_career: targetCareer,
        difficulty: difficulty,
      });
      setProjects(generated);
    } catch (err: any) {
      alert(`Project generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
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
                <h1 className="text-2xl font-bold text-white">Portfolio Project Generator</h1>
                <AIBadge label="Gemini Architect" size="xs" />
              </div>
              <p className="text-xs text-slate-400">
                FR-PRJ: Tailored engineering projects designed to bridge your exact skill gaps and stand out on technical recruiter evaluations.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Beginner">Beginner Level</option>
                <option value="Intermediate">Intermediate (Industry standard)</option>
                <option value="Advanced">Advanced (Distributed / Scale)</option>
              </select>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-pink-600/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                {generating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Generate New Project</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto text-pink-400 animate-spin" />
              <p className="text-xs text-slate-400">Architecting portfolio projects for {targetCareer}...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {projects.map((proj, pIdx) => (
                <div
                  key={proj.id || pIdx}
                  className="p-6 sm:p-8 rounded-3xl bg-[#0d1322]/90 border border-slate-800 shadow-2xl space-y-6"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {proj.title}
                        </h2>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-pink-950/80 text-pink-300 border border-pink-700/60">
                          {proj.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Target Role: {proj.target_career}</p>
                    </div>
                  </div>

                  {/* Problem Statement */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Problem Statement & Engineering Value
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      {proj.problem_statement}
                    </p>
                  </div>

                  {/* Technologies & Demonstrable Skills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                      <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" /> Stack Technologies
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {proj.technologies?.map((tech: string, tIdx: number) => (
                          <span key={tIdx} className="text-xs px-2.5 py-0.5 rounded-md bg-indigo-950/70 text-indigo-200 border border-indigo-800/50">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                      <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Skills Demonstrated
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {proj.skills_demonstrated?.map((sk: string, sIdx: number) => (
                          <span key={sIdx} className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-950/70 text-emerald-200 border border-emerald-800/50">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Development Stages (FR-PRJ-2) */}
                  {proj.development_stages && proj.development_stages.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Phased Implementation Roadmap
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {proj.development_stages.map((stage: any, sIdx: number) => (
                          <div key={sIdx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                            <span className="text-[11px] font-mono text-purple-400 font-bold">
                              {stage.stage || `Stage ${sIdx + 1}`}
                            </span>
                            <p className="text-xs text-slate-300 leading-snug">{stage.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resume Bullet Point Suggestions (FR-PRJ-2) */}
                  {proj.resume_bullet_suggestions && proj.resume_bullet_suggestions.length > 0 && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-900 border border-purple-800/40 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span>Recommended Resume Bullet Points (Ready to Copy)</span>
                      </div>
                      <div className="space-y-2">
                        {proj.resume_bullet_suggestions.map((bullet: string, bIdx: number) => (
                          <div key={bIdx} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                            <span className="text-indigo-400 font-bold">•</span>
                            <span className="leading-relaxed">{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <DisclaimerBanner text="Project architectures simulate real-world production constraints. Implementing and deploying them will satisfy the primary portfolio requirements of tech hiring teams." />
        </main>
      </div>
    </div>
  );
}

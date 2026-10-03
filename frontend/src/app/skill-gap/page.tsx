"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { AIBadge, DisclaimerBanner } from "@/components/AIBadge";
import { SkillGapChart } from "@/components/SkillGapChart";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import {
  BarChart3,
  Sparkles,
  ArrowRight,
  Target,
  RefreshCw,
  Compass,
  Map,
  Layers
} from "lucide-react";

function SkillGapContent() {
  const { user, loginDemoUser } = useAuth();
  const searchParams = useSearchParams();
  const careerParam = searchParams.get("career");

  const [careerName, setCareerName] = useState<string>(careerParam || "Full Stack AI Engineer");
  const [gapData, setGapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadGapAnalysis = async (target: string) => {
    try {
      setLoading(true);
      const res = await api.analyzeSkillGap(target);
      setGapData(res);
      setCareerName(res.career_name);
    } catch (e) {
      console.error("Gap analysis error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      loginDemoUser().then(() => loadGapAnalysis(careerParam || "Full Stack AI Engineer"));
    } else {
      loadGapAnalysis(careerParam || "Full Stack AI Engineer");
    }
  }, [user, careerParam]);

  const availableRoles = [
    "Full Stack AI Engineer",
    "Cloud & DevOps Solutions Engineer",
    "Applied Machine Learning Engineer",
    "Frontend Systems Architect",
    "Backend Microservices Specialist",
  ];

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Skill Gap Analysis & Radar</h1>
            <AIBadge label="Gemini Evaluated" size="xs" />
          </div>
          <p className="text-xs text-slate-400">
            Compare your profile directly against real-world competencies required for this target role.
          </p>
        </div>

        {/* Target Role Selector */}
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          <select
            value={careerName}
            onChange={(e) => {
              setCareerName(e.target.value);
              loadGapAnalysis(e.target.value);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {availableRoles.map((role, idx) => (
              <option key={idx} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400">Comparing competencies with industry standards...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Readiness Score Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-700/50 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-indigo-300">Target Role Readiness</span>
              <h2 className="text-xl font-bold text-white">{gapData?.career_name}</h2>
              <p className="text-xs text-slate-300 max-w-xl">
                You currently possess approximately <strong className="text-indigo-200">{gapData?.overall_readiness}%</strong> of the core competencies required for entry to mid-level placement.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="w-24 h-24 rounded-full border-4 border-indigo-500/40 flex flex-col items-center justify-center bg-indigo-950/80 shadow-lg shadow-indigo-600/20">
                <span className="text-2xl font-black text-white">{gapData?.overall_readiness}%</span>
                <span className="text-[9px] uppercase font-bold text-indigo-300">Ready</span>
              </div>

              <Link
                href={`/roadmap?career=${encodeURIComponent(gapData?.career_name || careerName)}`}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <Map className="w-4 h-4" />
                <span>Generate Roadmap to Bridge Gaps</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Interactive Recharts Radar and Bar Charts (FR-GAP-4) */}
          <SkillGapChart gaps={gapData?.gaps || []} careerName={gapData?.career_name || careerName} />

          <DisclaimerBanner text="Competency expectations are dynamically synthesized from contemporary hiring benchmarks. Severity ratings represent priority relative to production software engineering roles." />
        </div>
      )}
    </main>
  );
}

export default function SkillGapPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070b14]">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading Skill Gap Analysis...</div>}>
          <SkillGapContent />
        </Suspense>
      </div>
    </div>
  );
}

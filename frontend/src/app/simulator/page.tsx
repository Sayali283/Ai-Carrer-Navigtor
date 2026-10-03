"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { AIBadge, DisclaimerBanner } from "@/components/AIBadge";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import {
  Zap,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Plus,
  X,
  CheckCircle,
  Clock,
  Layers,
  RefreshCw,
  BookmarkPlus
} from "lucide-react";

export default function SimulatorPage() {
  const { user, loginDemoUser } = useAuth();
  const [hypotheticalSkills, setHypotheticalSkills] = useState<string[]>(["Docker", "AWS (Amazon Web Services)"]);
  const [inputSkill, setInputSkill] = useState("");
  const [targetCareer, setTargetCareer] = useState("Full Stack AI Engineer");
  const [simulating, setSimulating] = useState(false);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [appliedMsg, setAppliedMsg] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      const data = await api.getSimulationHistory();
      setHistory(data);
      if (data.length > 0 && !currentResult) {
        setCurrentResult(data[0]);
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

  const handleAddSkill = (skill: string) => {
    if (!skill.trim() || hypotheticalSkills.includes(skill.trim())) return;
    setHypotheticalSkills([...hypotheticalSkills, skill.trim()]);
    setInputSkill("");
  };

  const handleRemoveSkill = (skill: string) => {
    setHypotheticalSkills(hypotheticalSkills.filter((s) => s !== skill));
  };

  const handleRunSimulation = async () => {
    if (hypotheticalSkills.length === 0) return;
    setSimulating(true);
    setAppliedMsg(null);
    try {
      const res = await api.runSimulation({
        hypothetical_skills: hypotheticalSkills,
        target_career: targetCareer,
      });
      setCurrentResult(res);
      await loadHistory();
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const handleApplyToProfile = async (simId: number) => {
    try {
      const res = await api.applySimulation(simId);
      setAppliedMsg(res.message);
      await loadHistory();
    } catch (err: any) {
      alert(`Failed to apply skills: ${err.message}`);
    }
  };

  const suggestedSkills = [
    "Docker",
    "AWS",
    "Kubernetes",
    "PyTorch",
    "Redis",
    "GraphQL",
    "PostgreSQL Indexing",
    "Terraform",
    "LangChain",
    "Next.js"
  ];

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
                <h1 className="text-2xl font-bold text-white">Career What-If Simulator</h1>
                <AIBadge label="Hypothetical Sandbox" size="xs" />
              </div>
              <p className="text-xs text-slate-400">
                FR-SIM: Add hypothetical skills temporarily to preview career score boosts without modifying your actual profile.
              </p>
            </div>
          </div>

          {appliedMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{appliedMsg}</span>
            </div>
          )}

          {/* Interactive Simulation Sandbox */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1322]/90 border border-slate-800 shadow-2xl space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Select Hypothetical Skills to Test
              </label>

              {/* Tag inputs */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-700">
                {hypotheticalSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 text-amber-200 border border-amber-700/60 text-xs font-semibold"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  value={inputSkill}
                  onChange={(e) => setInputSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(inputSkill);
                    }
                  }}
                  placeholder="Type skill & press Enter..."
                  className="flex-1 min-w-[160px] bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-2 py-1"
                />
              </div>

              {/* Quick suggestion pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500">Quick add:</span>
                {suggestedSkills.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddSkill(s)}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition cursor-pointer"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="space-y-1 w-full sm:w-auto">
                <label className="text-xs text-slate-400 font-medium">Target Career to Test Against:</label>
                <input
                  type="text"
                  value={targetCareer}
                  onChange={(e) => setTargetCareer(e.target.value)}
                  className="w-full sm:w-72 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={simulating || hypotheticalSkills.length === 0}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {simulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Recalculating Career Compatibility...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Run What-If Simulation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Simulation Outcome Display (FR-SIM-3, FR-SIM-4) */}
          {currentResult && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0e1628] to-[#0a101f] border border-amber-800/50 shadow-2xl space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Simulation Outcome</span>
                  <h3 className="text-xl font-bold text-white">{currentResult.target_career}</h3>
                  <p className="text-xs text-slate-400">
                    Testing hypothetical skills: <strong className="text-amber-200">{currentResult.hypothetical_skills?.join(", ")}</strong>
                  </p>
                </div>

                {/* Before vs After Side-by-Side Comparison (FR-SIM-3) */}
                <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <div className="text-center px-3">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Current Score</span>
                    <div className="text-2xl font-bold text-slate-400">{currentResult.before_score}%</div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-amber-400" />

                  <div className="text-center px-3">
                    <span className="text-[10px] text-amber-400 font-semibold uppercase">Simulated Score</span>
                    <div className="text-3xl font-black text-amber-300">{currentResult.after_score}%</div>
                  </div>

                  <div className="pl-3 border-l border-slate-800 text-center">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Delta Boost</span>
                    <div className="text-xl font-bold text-emerald-400">+{currentResult.score_delta}%</div>
                  </div>
                </div>
              </div>

              {/* Explainable Reasoning (FR-SIM-4) */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Why Compatibility Changed (FR-SIM-4)
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  {currentResult.explanation}
                </p>
              </div>

              {/* Unlocked Capabilities */}
              {currentResult.unlocked_capabilities && currentResult.unlocked_capabilities.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Unlocked Industry Capabilities
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {currentResult.unlocked_capabilities.map((cap: string, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Option to Keep / Apply to Profile (FR-SIM-2) */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  Like these results? You can permanently incorporate these skills into your stored student profile.
                </span>

                <button
                  onClick={() => handleApplyToProfile(currentResult.id)}
                  disabled={currentResult.is_saved_to_profile}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>{currentResult.is_saved_to_profile ? "Saved to Profile" : "Save Skills to My Profile"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Past Simulations History (FR-SIM-5) */}
          {history.length > 1 && (
            <div className="p-6 rounded-3xl bg-[#0d1322]/80 border border-slate-800 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Simulation History (FR-SIM-5)</span>
              </h3>
              <div className="divide-y divide-slate-800">
                {history.map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => setCurrentResult(sim)}
                    className="py-3 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-800/30 px-2 rounded-lg transition"
                  >
                    <div className="space-y-0.5">
                      <span className="font-semibold text-white">{sim.target_career}</span>
                      <p className="text-slate-400">{sim.hypothetical_skills?.join(", ")}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold">+{sim.score_delta}% Boost</span>
                      <div className="text-[10px] text-slate-500">
                        {sim.before_score}% → {sim.after_score}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DisclaimerBanner text="Simulations are temporary computational projections and do not modify your profile database records unless you explicitly click 'Save Skills to My Profile'." />
        </main>
      </div>
    </div>
  );
}

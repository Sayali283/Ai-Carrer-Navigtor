"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { AIBadge, DisclaimerBanner } from "@/components/AIBadge";
import { RoadmapTimeline } from "@/components/RoadmapTimeline";
import { AssessmentModal } from "@/components/AssessmentModal";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import {
  Map,
  Sparkles,
  Calendar,
  Clock,
  Layers,
  Award,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp
} from "lucide-react";

function RoadmapContent() {
  const { user, loginDemoUser } = useAuth();
  const searchParams = useSearchParams();
  const careerParam = searchParams.get("career");

  const [roadmap, setRoadmap] = useState<any>(null);
  const [adaptiveHistory, setAdaptiveHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Configuration settings (FR-RDM-1, FR-RDM-2: 7, 14, 30, 60, 90 days)
  const [durationDays, setDurationDays] = useState<number>(30);
  const [hoursPerDay, setHoursPerDay] = useState<number>(2.0);
  const [startingLevel, setStartingLevel] = useState<string>("Beginner");
  const [learningStyle, setLearningStyle] = useState<string>("Hands-on Project-based");
  const [goal, setGoal] = useState<string>("Job-ready entry level developer");

  // Assessment modal state (FR-ASM, FR-ADP)
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [assessmentTopic, setAssessmentTopic] = useState("Asynchronous Architecture & FastAPI");

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      const data = await api.getActiveRoadmap();
      setRoadmap(data);
      if (data) {
        setDurationDays(data.duration_days);
        setHoursPerDay(data.hours_per_day);
        const hist = await api.getAdaptiveHistory(data.id);
        setAdaptiveHistory(hist);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      loginDemoUser().then(() => loadRoadmap());
    } else {
      loadRoadmap();
    }
  }, [user]);

  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    try {
      const newRm = await api.generateRoadmap({
        career_name: careerParam || roadmap?.career_name || "Full Stack AI Engineer",
        duration_days: durationDays,
        hours_per_day: hoursPerDay,
        starting_level: startingLevel,
        preferred_learning_style: learningStyle,
        goal: goal,
      });
      setRoadmap(newRm);
      setShowConfig(false);
      const hist = await api.getAdaptiveHistory(newRm.id);
      setAdaptiveHistory(hist);
    } catch (err: any) {
      alert(`Roadmap generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId: number, currentStatus: boolean) => {
    try {
      const updated = await api.toggleRoadmapTask(taskId, !currentStatus);
      setRoadmap(updated);
    } catch (err: any) {
      alert(`Error toggling task: ${err.message}`);
    }
  };

  const handleLaunchAssessment = (topic: string) => {
    setAssessmentTopic(topic);
    setAssessmentModalOpen(true);
  };

  const handleAssessmentCompleted = (updatedRoadmap: any) => {
    setRoadmap(updatedRoadmap);
    if (updatedRoadmap?.id) {
      api.getAdaptiveHistory(updatedRoadmap.id).then((h) => setAdaptiveHistory(h));
    }
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Personalised Learning Roadmap</h1>
            <AIBadge label="Gemini Adaptive Engine" size="xs" />
          </div>
          <p className="text-xs text-slate-400">
            Ordered, time-bound tasks tailored to your starting point. Adaptive assessments dynamically modify weak topics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLaunchAssessment("Full Stack Web Systems & Concurrency")}
            className="px-4 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-700/60 text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Launch Knowledge Check</span>
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Plan Settings</span>
          </button>
        </div>
      </div>

      {/* Plan Settings Collapsible (FR-RDM-1, FR-RDM-2) */}
      {(showConfig || !roadmap) && (
        <div className="p-6 rounded-3xl bg-[#0d1322] border border-slate-700 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Configure Your Roadmap Parameters (FR-RDM-1 & 2)</span>
            </h3>
            {roadmap && (
              <button
                onClick={() => setShowConfig(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close Settings
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Duration Options: 7, 14, 30, 60, 90 days */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Curriculum Duration</label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={7}>7 Days (Rapid Crash Sprint)</option>
                <option value={14}>14 Days (Two-Week Intensive)</option>
                <option value={30}>30 Days (Standard 1-Month Plan)</option>
                <option value={60}>60 Days (Comprehensive Mastery)</option>
                <option value={90}>90 Days (Complete Career Shift)</option>
              </select>
            </div>

            {/* Time per day */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Time Available / Day</label>
              <select
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={1.0}>1 Hour / Day</option>
                <option value={2.0}>2 Hours / Day</option>
                <option value={3.0}>3 Hours / Day</option>
                <option value={4.0}>4 Hours / Day</option>
                <option value={6.0}>6 Hours / Day (Full-Time Study)</option>
              </select>
            </div>

            {/* Starting Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Starting Level</label>
              <select
                value={startingLevel}
                onChange={(e) => setStartingLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Beginner">Beginner (Foundations)</option>
                <option value="Intermediate">Intermediate (Has built projects)</option>
                <option value="Advanced">Advanced (Refining for Senior roles)</option>
              </select>
            </div>

            {/* Learning Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Learning Style</label>
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Hands-on Project-based">Hands-on Project-based</option>
                <option value="Theoretical & System Deep Dive">Theoretical & System Deep Dive</option>
                <option value="Interactive Coding Drills">Interactive Coding Drills</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerateRoadmap}
              disabled={generating}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Tailored Curriculum...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Personalised Roadmap</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading your learning roadmap...</p>
        </div>
      ) : roadmap ? (
        <div className="space-y-8">
          {/* Progress Overview Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-700/50 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Active Learning Goal</span>
                <h2 className="text-xl font-bold text-white">{roadmap.career_name}</h2>
                <p className="text-xs text-slate-300">
                  {roadmap.duration_days} Days Plan • {roadmap.hours_per_day} hrs/day • {roadmap.starting_level} Starting Level
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-2xl font-black gradient-text">
                    {roadmap.progress_percent}%
                  </div>
                  <div className="text-xs text-slate-400">
                    {roadmap.completed_tasks} / {roadmap.total_tasks} Tasks Done
                  </div>
                </div>

                {roadmap.status === "adapted" && (
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Adapted to Test</span>
                  </span>
                )}
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden relative shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700"
                style={{ width: `${roadmap.progress_percent}%` }}
              />
            </div>
          </div>

          {/* Adaptive History Log (FR-ADP-4: Show student what changed and why) */}
          {adaptiveHistory && adaptiveHistory.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#0e1628] border border-purple-800/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Adaptive Modification Log (FR-ADP-4: What changed and why)</span>
              </div>
              <div className="space-y-2">
                {adaptiveHistory.map((h, hIdx) => (
                  <div key={hIdx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-300 font-semibold">
                      <span>{h.changes_summary}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {h.reason && <p className="text-slate-400 text-[11px]">Reason: {h.reason}</p>}
                    {h.added_topics?.length > 0 && (
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <span>+ Remedial Focus Added:</span>
                        <strong>{h.added_topics.join(", ")}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ordered Roadmap Timeline (FR-RDM-4, FR-RDM-5, FR-RDM-6) */}
          <RoadmapTimeline
            tasks={roadmap.tasks || []}
            onToggleTask={handleToggleTask}
            onLaunchAssessment={handleLaunchAssessment}
          />
        </div>
      ) : (
        <div className="p-12 text-center bg-[#0d1322]/80 rounded-3xl border border-slate-800 space-y-4">
          <Map className="w-12 h-12 mx-auto text-indigo-400 opacity-60" />
          <h3 className="text-base font-bold text-white">No Roadmap Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Choose your learning duration (7 to 90 days) and available daily study hours to construct your personalized curriculum.
          </p>
          <button
            onClick={() => setShowConfig(true)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            Create Your Roadmap
          </button>
        </div>
      )}

      {/* Assessment Modal (FR-ASM, FR-ADP) */}
      <AssessmentModal
        roadmapId={roadmap?.id}
        topic={assessmentTopic}
        isOpen={assessmentModalOpen}
        onClose={() => setAssessmentModalOpen(false)}
        onAssessmentCompleted={handleAssessmentCompleted}
      />

      <DisclaimerBanner text="The adaptive learning loop monitors task completions and assessment performance to dynamically shorten or reinforce learning milestones." />
    </main>
  );
}

export default function RoadmapPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070b14]">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading Roadmap...</div>}>
          <RoadmapContent />
        </Suspense>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { CheckCircle2, Circle, Clock, ExternalLink, Sparkles, BookOpen, Layers } from "lucide-react";

interface Task {
  id: number;
  order_index: number;
  phase_title: string;
  day_number: number;
  week_number: number;
  title: string;
  description?: string;
  topic?: string;
  estimated_hours: number;
  resources: { title: string; url: string }[];
  practical_exercise?: string;
  is_completed: boolean;
  is_adaptive_addition: boolean;
}

export function RoadmapTimeline({
  tasks,
  onToggleTask,
  onLaunchAssessment,
}: {
  tasks: Task[];
  onToggleTask: (taskId: number, currentStatus: boolean) => void;
  onLaunchAssessment?: (topic: string) => void;
}) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400">
        No roadmap generated yet. Choose your target career and preferred duration to begin!
      </div>
    );
  }

  // Group tasks by phase
  const phasesMap = new Map<string, Task[]>();
  tasks.forEach((t) => {
    const phase = t.phase_title || "Curriculum Phase";
    if (!phasesMap.has(phase)) {
      phasesMap.set(phase, []);
    }
    phasesMap.get(phase)!.push(t);
  });

  return (
    <div className="space-y-8">
      {Array.from(phasesMap.entries()).map(([phaseTitle, phaseTasks], phaseIdx) => {
        const completedCount = phaseTasks.filter((t) => t.is_completed).length;
        const phasePercent = Math.round((completedCount / phaseTasks.length) * 100);

        return (
          <div
            key={phaseIdx}
            className="rounded-2xl bg-[#0d1322]/80 border border-slate-800/80 overflow-hidden shadow-xl"
          >
            {/* Phase Header */}
            <div className="p-5 border-b border-slate-800/80 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center text-xs font-bold">
                    {phaseIdx + 1}
                  </span>
                  <h3 className="font-bold text-base text-white">{phaseTitle}</h3>
                </div>
                <p className="text-xs text-slate-400">
                  {phaseTasks.length} milestones • {completedCount} completed ({phasePercent}%)
                </p>
              </div>

              {/* Action: Take Quiz / Assess this phase */}
              {onLaunchAssessment && (
                <button
                  onClick={() => onLaunchAssessment(phaseTasks[0]?.topic || phaseTitle)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-700/60 text-xs font-semibold shadow-sm transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Test Competency & Adapt</span>
                </button>
              )}
            </div>

            {/* Task list */}
            <div className="p-4 sm:p-6 divide-y divide-slate-800/60 space-y-4">
              {phaseTasks.map((task) => (
                <div
                  key={task.id}
                  className={`pt-4 first:pt-0 flex items-start gap-4 transition group ${
                    task.is_completed ? "opacity-75" : "opacity-100"
                  }`}
                >
                  {/* Complete checkbox button */}
                  <button
                    onClick={() => onToggleTask(task.id, task.is_completed)}
                    className="mt-1 shrink-0 p-1 rounded-full text-slate-500 hover:text-indigo-400 transition"
                    title={task.is_completed ? "Mark incomplete" : "Mark as finished"}
                  >
                    {task.is_completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-950" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-600 hover:text-indigo-400" />
                    )}
                  </button>

                  {/* Task details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        Day {task.day_number}
                      </span>
                      {task.is_adaptive_addition && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-700/60 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-400" /> Adaptive Addition
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3 text-slate-500" /> {task.estimated_hours} hrs
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-semibold transition ${
                        task.is_completed ? "text-slate-400 line-through" : "text-slate-100"
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>
                    )}

                    {/* Practical exercise */}
                    {task.practical_exercise && (
                      <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                        <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Hands-on Exercise:
                        </span>
                        <p className="text-slate-400">{task.practical_exercise}</p>
                      </div>
                    )}

                    {/* Reference links */}
                    {task.resources && task.resources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {task.resources.map((res, rIdx) => (
                          <a
                            key={rIdx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline"
                          >
                            <span>{res.title}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

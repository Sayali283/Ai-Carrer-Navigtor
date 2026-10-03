"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { AIBadge } from "./AIBadge";
import {
  X,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Award
} from "lucide-react";

interface AssessmentModalProps {
  roadmapId?: number;
  topic?: string;
  isOpen: boolean;
  onClose: () => void;
  onAssessmentCompleted?: (updatedRoadmap: any) => void;
}

export function AssessmentModal({
  roadmapId,
  topic = "System Architecture & Async Web APIs",
  isOpen,
  onClose,
  onAssessmentCompleted,
}: AssessmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const startAssessment = async () => {
    setLoading(true);
    setResult(null);
    setSelectedAnswers({});
    try {
      const data = await api.generateAssessment({ roadmap_id: roadmapId, topic });
      setAssessment(data);
    } catch (err: any) {
      alert(`Error generating assessment: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qId: number, optionLetter: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionLetter }));
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    setEvaluating(true);
    try {
      const payload = Object.entries(selectedAnswers).map(([qid, ans]) => ({
        question_id: Number(qid),
        answer: ans,
      }));
      const res = await api.submitAssessment(assessment.id, payload);
      setResult(res);

      // If roadmap was adapted, notify parent
      if (roadmapId && onAssessmentCompleted) {
        const updatedRm = await api.getActiveRoadmap();
        onAssessmentCompleted(updatedRm);
      }
    } catch (err: any) {
      alert(`Evaluation failed: ${err.message}`);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0b101d] border border-slate-700/80 shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white">AI Technical Assessment Engine</span>
              <AIBadge label="Gemini Evaluator" size="xs" />
            </div>
            <p className="text-xs text-slate-400">
              Interactive test to assess comprehension and trigger adaptive roadmap tuning
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State 1: Start Screen */}
        {!assessment && !loading && (
          <div className="py-12 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-semibold text-white">Ready for your Knowledge Check?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Topic: <strong className="text-indigo-300">{topic}</strong>. The AI will generate 4 targeted MCQs, scenarios, and code comprehension questions. Your results directly personalize your upcoming roadmap tasks!
              </p>
            </div>
            <button
              onClick={startAssessment}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <span>Generate Custom Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* State 2: Loading Generation */}
        {loading && (
          <div className="py-16 text-center space-y-4">
            <RefreshCw className="w-8 h-8 mx-auto text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-300 font-medium">
              Generating tailored questions using Google Gemini AI...
            </p>
            <p className="text-xs text-slate-500">Synthesizing real-world scenarios from your study topic</p>
          </div>
        )}

        {/* State 3: Taking Assessment */}
        {assessment && !result && (
          <div className="py-6 space-y-8">
            <div className="space-y-6">
              {assessment.questions.map((q: any, idx: number) => (
                <div
                  key={q.id}
                  className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-400">Question {idx + 1} of {assessment.questions.length}</span>
                    <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                      {q.question_type}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-200 leading-relaxed whitespace-pre-line">
                    {q.question_text}
                  </p>

                  {/* Options */}
                  <div className="space-y-2 pt-2">
                    {q.options.map((opt: string, optIdx: number) => {
                      const letter = opt.slice(0, 1);
                      const isSelected = selectedAnswers[q.id] === letter || selectedAnswers[q.id] === opt;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(q.id, letter)}
                          className={`w-full text-left p-3 rounded-lg text-xs transition border flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600/20 border-indigo-500 text-indigo-200"
                              : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="leading-snug pt-0.5">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Answered {Object.keys(selectedAnswers).length} of {assessment.questions.length} questions
              </span>
              <button
                disabled={evaluating || Object.keys(selectedAnswers).length < assessment.questions.length}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {evaluating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Grading with AI...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Submit & Adapt Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* State 4: Results & Adaptation Feedback */}
        {result && (
          <div className="py-6 space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-800/40 text-center space-y-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">Assessment Score</span>
              <div className="text-5xl font-black gradient-text">
                {result.score_percent}%
              </div>
              <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                {result.ai_feedback}
              </p>
            </div>

            {/* Strengths & Weaknesses (FR-ASM-3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Demonstrated Strengths</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 pl-5 list-disc">
                  {result.strengths?.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Growth & Remedial Focus</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 pl-5 list-disc">
                  {result.weaknesses?.map((w: string, idx: number) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Adaptive Roadmap Trigger Banner (FR-ADP-1 to 4) */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-purple-200">
                  Adaptive Learning Loop Engaged (FR-ADP-1):
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Your learning roadmap has been automatically re-calibrated. Extra practice tasks were inserted for your weak concepts, while redundant beginner tasks were condensed. Check the Roadmap page to view the change summary!
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
              >
                Close & Return to Roadmap
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

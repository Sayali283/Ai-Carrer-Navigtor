"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { AIBadge, DisclaimerBanner, SourceBadge } from "@/components/AIBadge";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Zap,
  Code,
  GraduationCap,
  Briefcase
} from "lucide-react";

export default function ResumePage() {
  const { user, loginDemoUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      if (!user) await loginDemoUser();
      const res = await api.uploadResume(selectedFile);
      setUploadResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to parse resume");
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSample = async () => {
    setUploading(true);
    setError(null);
    try {
      if (!user) await loginDemoUser();
      const res = await api.loadSampleResume();
      setUploadResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to load sample resume");
    } finally {
      setUploading(false);
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
                <h1 className="text-2xl font-bold text-white">Resume Upload & AI Parsing</h1>
                <AIBadge label="Gemini Extraction" size="xs" />
              </div>
              <p className="text-xs text-slate-400">
                Upload your resume in PDF or DOCX format. Gemini server-side will extract skills, education, and projects into your structured profile.
              </p>
            </div>

            {/* 1-Click Demo Shortcut */}
            <button
              onClick={handleLoadSample}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer shrink-0"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Load Demo Resume (Alex Morgan)</span>
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold">Extraction Notice:</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`p-8 sm:p-12 rounded-2xl border-2 border-dashed transition text-center space-y-4 ${
              dragOver
                ? "border-indigo-400 bg-indigo-950/20"
                : "border-slate-800 bg-[#0d1322]/60 hover:border-slate-700"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="hidden"
            />

            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-semibold text-white">
                {selectedFile ? selectedFile.name : "Drag & Drop your resume here"}
              </h3>
              <p className="text-xs text-slate-400">
                Supports PDF and DOCX files up to 10MB (FR-RES-1, FR-RES-2)
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition"
              >
                Browse Computer
              </button>

              {selectedFile && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Parse Resume with AI</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Results Preview */}
          {uploadResult && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{uploadResult.message}</span>
                </div>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1 font-semibold text-white hover:underline"
                >
                  <span>Edit in Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Extracted Structured Data Cards (FR-RES-4) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Candidate Overview */}
                <div className="p-5 rounded-2xl bg-[#0d1322]/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Extracted Candidate</h3>
                    <SourceBadge source="ai_extracted" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="text-base font-bold text-indigo-300">
                      {uploadResult.parsed_profile?.full_name || "Alex Morgan"}
                    </div>
                    <div className="text-slate-400">{uploadResult.parsed_profile?.email}</div>
                    <div className="text-slate-400">{uploadResult.parsed_profile?.phone}</div>
                    <p className="text-slate-300 pt-2 leading-relaxed italic">
                      "{uploadResult.parsed_profile?.bio}"
                    </p>
                  </div>
                </div>

                {/* Skills Detected */}
                <div className="p-5 rounded-2xl bg-[#0d1322]/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-purple-400" />
                      <span>Extracted Skills</span>
                    </h3>
                    <span className="text-[11px] font-mono text-purple-400 font-semibold">
                      {uploadResult.parsed_profile?.skills?.length || 0} Found
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {uploadResult.parsed_profile?.skills?.map((s: any, idx: number) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-200 border border-purple-800/40"
                      >
                        {s.name || s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Education & Experience */}
                <div className="p-5 rounded-2xl bg-[#0d1322]/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-sky-400" />
                      <span>Education & Work</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">Verified</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {uploadResult.parsed_profile?.education?.slice(0, 1).map((e: any, idx: number) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                        <div className="font-semibold text-white">{e.institution}</div>
                        <div className="text-slate-400">{e.degree} - {e.branch_or_field}</div>
                      </div>
                    ))}
                    {uploadResult.parsed_profile?.experience?.slice(0, 1).map((x: any, idx: number) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                        <div className="font-semibold text-white">{x.title}</div>
                        <div className="text-slate-400">{x.company} ({x.duration})</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Next Step CTA */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Step 2: Review Extracted Profile or Discover Careers</h4>
                  <p className="text-xs text-slate-400">
                    Your resume has been saved as the single source of truth. Next, let Gemini discover your career matches.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition"
                  >
                    Review Profile
                  </Link>
                  <Link
                    href="/career"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
                  >
                    <span>Discover Careers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Manual Entry Fallback Callout (FR-RES-8) */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Don't have a resume file right now?</span>
            <Link href="/profile" className="text-indigo-400 hover:underline font-semibold">
              Enter your details manually in Student Profile →
            </Link>
          </div>

          <DisclaimerBanner text="Resume parsing is performed server-side via Google Gemini AI. Personal data is stored strictly in your private session and is never used to train public models (NFR-PRV-2)." />
        </main>
      </div>
    </div>
  );
}

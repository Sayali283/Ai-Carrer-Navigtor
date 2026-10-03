"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/authContext";
import {
  Compass,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  Map,
  Briefcase,
  Layers,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  FileText,
  HelpCircle,
  Code,
  GraduationCap,
  Users,
  ChevronRight
} from "lucide-react";

export default function LandingPage() {
  const { user, loginDemoUser } = useAuth();
  const router = useRouter();

  const handleLaunchDemo = async () => {
    await loginDemoUser();
    router.push("/dashboard");
  };

  const steps = [
    {
      num: "01",
      title: "Share Your Background",
      desc: "Upload your resume (PDF/DOCX) or simply type your current skills and coursework. AI automatically organizes everything.",
      icon: FileText,
      color: "from-blue-500/20 to-indigo-500/20",
      border: "border-blue-500/30",
      iconColor: "text-blue-400",
    },
    {
      num: "02",
      title: "See Match Scores & Missing Skills",
      desc: "Discover real tech careers that fit you. See explainable match percentages and the exact skills you need to learn.",
      icon: Target,
      color: "from-purple-500/20 to-pink-500/20",
      border: "border-purple-500/30",
      iconColor: "text-purple-400",
    },
    {
      num: "03",
      title: "Follow Your Daily Roadmap",
      desc: "Get a clear 7 to 90-day learning plan with practical tasks, projects, and AI assessments that adapt to your pace.",
      icon: Map,
      color: "from-emerald-500/20 to-teal-500/20",
      border: "border-emerald-500/30",
      iconColor: "text-emerald-400",
    },
  ];

  const features = [
    {
      icon: Target,
      title: "Smart Career Matching",
      desc: "No fixed, rigid career lists. Gemini AI dynamically recommends modern tech roles that match your unique skillset.",
      route: "/career",
    },
    {
      icon: BarChart3,
      title: "Visual Skill Gap Radar",
      desc: "Clear visual charts show your current proficiency versus industry benchmarks, sorted by urgency.",
      route: "/skill-gap",
    },
    {
      icon: Map,
      title: "Adaptive Learning Roadmap",
      desc: "Choose 7, 14, 30, 60, or 90 days. Roadmap automatically inserts review tasks if you struggle with a topic.",
      route: "/roadmap",
    },
    {
      icon: Zap,
      title: "Career 'What-If' Sandbox",
      desc: "Wondering if Docker or AWS is worth learning? Test skills virtually to see how much your match score jumps.",
      route: "/simulator",
    },
    {
      icon: Briefcase,
      title: "Job Description Matcher",
      desc: "Paste any real internship or job posting to find missing keywords and get a targeted 2-week prep sprint.",
      route: "/job-match",
    },
    {
      icon: ShieldCheck,
      title: "ATS Resume Polish",
      desc: "Identifies weak bullet points and rewrites them into high-impact Google XYZ achievement formats.",
      route: "/resume-review",
    },
  ];

  const faqs = [
    {
      q: "Do I need a finished resume to get started?",
      a: "Not at all! You can upload a resume in PDF or Word, or enter your skills and projects manually. You can also test everything with our 1-click sample student demo.",
    },
    {
      q: "How does the AI calculate my career match score?",
      a: "It uses an explainable formula weighing your technical skills (35%), project portfolio (25%), education (15%), experience (15%), and interests (10%). No mysterious black-box percentages.",
    },
    {
      q: "What is an 'Adaptive' roadmap?",
      a: "When you take short AI knowledge check quizzes on roadmap topics, the system identifies weak areas and automatically schedules practice tasks to ensure you truly master the concept.",
    },
    {
      q: "Is my personal data kept safe?",
      a: "Yes. All data is processed server-side in your private session. Your personal information is never shared or used to train public models.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Soft background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-pink-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-700/50 shadow-sm text-xs font-medium text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Career Guide for Students & Graduates</span>
          </div>

          {/* Heading */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Turn your current skills into a{" "}
              <span className="gradient-text">clear path to getting hired</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Upload your resume or select what you know. We discover matching tech careers, highlight your exact skill gaps, and build a personalized daily roadmap to reach your goal.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 max-w-md mx-auto">
            <button
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Try One-Click Demo</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <Link
              href="/register"
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-medium text-sm transition"
            >
              <GraduationCap className="w-4 h-4 text-slate-300" />
              <span>Sign Up Free</span>
            </Link>
          </div>

          <p className="text-xs text-slate-400">
            No credit card required • Instant demo takes 5 seconds to explore
          </p>

          {/* Simple Visual Preview Box */}
          <div className="pt-8 max-w-3xl mx-auto">
            <div className="p-6 rounded-2xl bg-[#0d1322]/90 border border-slate-800/80 shadow-2xl text-left space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 font-mono ml-2">Sample Student Career Assessment</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/50">
                  92% Match Found
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Top Match Role</span>
                  <div className="font-bold text-sm text-indigo-300">Full Stack AI Engineer</div>
                  <p className="text-[11px] text-slate-400">Matches Python, React & APIs</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Skills to Learn</span>
                  <div className="font-bold text-sm text-amber-300">Docker, Redis, Cloud</div>
                  <p className="text-[11px] text-slate-400">Takes ~25 study hours to bridge</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Generated Roadmap</span>
                  <div className="font-bold text-sm text-emerald-300">30-Day Step-by-Step</div>
                  <p className="text-[11px] text-slate-400">2 hrs/day • Includes mini projects</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section (3 Simple Steps) */}
      <section className="py-20 bg-[#090d16]/90 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How It Works in 3 Simple Steps</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Clear, structured guidance without confusing jargon. Here is how your path is created:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl bg-gradient-to-br ${step.color} ${step.border} border backdrop-blur-md space-y-4 flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-400">{step.num}</span>
                      <div className="w-10 h-10 rounded-xl bg-slate-900/90 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${step.iconColor}`} />
                      </div>
                    </div>
                    <h3 className="font-semibold text-base text-white">{step.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-[#070b14] border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Everything You Need to Succeed</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Six dedicated AI tools designed to help students transition from classroom theory to engineering roles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={idx}
                  href={user ? feat.route : "/login"}
                  className="p-5 rounded-2xl bg-[#0d1322]/80 hover:bg-[#111a2f] border border-slate-800 hover:border-indigo-500/50 transition group space-y-3 flex flex-col justify-between cursor-pointer"
                >
                  <div className="space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/20 transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-sm text-white group-hover:text-indigo-200 transition">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>

                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 group-hover:text-indigo-300 pt-2">
                    <span>Explore</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Simple FAQ */}
      <section className="py-20 bg-[#090d16]/90 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400">Simple answers to common student questions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800/80 space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">Q.</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-slate-400 pl-4 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to find your direct path to a tech career?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Take 2 minutes to test our platform. See your career matches, skill gaps, and a personalized plan immediately.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleLaunchDemo}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Launch Instant Demo</span>
            </button>
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 bg-[#070b14] text-center text-xs text-slate-500">
        <p>© 2026 AI Student Career Navigator. Built with Google Gemini & FastAPI for student empowerment.</p>
      </footer>
    </div>
  );
}

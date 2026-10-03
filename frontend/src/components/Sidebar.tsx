"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  FileText,
  Target,
  BarChart3,
  Map,
  Zap,
  Briefcase,
  Layers,
  ShieldCheck,
  UserCheck,
  Sparkles,
  ArrowRight
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const sections = [
    {
      group: "Core Setup",
      items: [
        { href: "/dashboard", label: "Overview", icon: Compass, badge: null },
        { href: "/resume", label: "Resume Upload", icon: FileText, badge: "Step 1" },
        { href: "/profile", label: "Student Profile", icon: UserCheck, badge: null },
      ],
    },
    {
      group: "Career Intelligence",
      items: [
        { href: "/career", label: "Career Matches", icon: Target, badge: "AI" },
        { href: "/skill-gap", label: "Skill Gap Analysis", icon: BarChart3, badge: "Charts" },
        { href: "/roadmap", label: "Adaptive Roadmap", icon: Map, badge: "Plan" },
      ],
    },
    {
      group: "Advanced AI Tools",
      items: [
        { href: "/simulator", label: "Career What-If", icon: Zap, badge: "Sim" },
        { href: "/job-match", label: "JD Match & Prep", icon: Briefcase, badge: "Prep" },
        { href: "/projects", label: "Portfolio Generator", icon: Layers, badge: "Code" },
        { href: "/resume-review", label: "ATS Resume Audit", icon: ShieldCheck, badge: "ATS" },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-slate-800/80 bg-[#090d16]/60 backdrop-blur-md p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {sections.map((sec, idx) => (
          <div key={idx}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-3">
              {sec.group}
            </div>
            <div className="space-y-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                      active
                        ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/40 shadow-sm shadow-indigo-500/10 font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition ${
                          active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          active
                            ? "bg-indigo-500/30 text-indigo-300 border border-indigo-400/40"
                            : "bg-slate-800 text-slate-400 border border-slate-700/60"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Demo banner in sidebar */}
        <div className="mt-8 p-3 rounded-xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-indigo-800/40">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hackathon Showcase</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            All 12 modules from Team Ctrl Freaks SRS are connected end-to-end.
          </p>
        </div>
      </div>
    </aside>
  );
}

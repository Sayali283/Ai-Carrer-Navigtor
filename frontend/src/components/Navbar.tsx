"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import {
  Compass,
  FileText,
  User,
  LogOut,
  Sparkles,
  Zap,
  Menu,
  X,
  Target,
  BarChart3,
  Map,
  Layers,
  Briefcase,
  ShieldCheck
} from "lucide-react";

export function Navbar() {
  const { user, logout, loginDemoUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Compass },
    { href: "/resume", label: "Resume", icon: FileText },
    { href: "/career", label: "Careers", icon: Target },
    { href: "/skill-gap", label: "Skill Gap", icon: BarChart3 },
    { href: "/roadmap", label: "Roadmap", icon: Map },
    { href: "/simulator", label: "What-If", icon: Zap },
    { href: "/job-match", label: "JD Matcher", icon: Briefcase },
    { href: "/projects", label: "Projects", icon: Layers },
    { href: "/resume-review", label: "ATS Audit", icon: ShieldCheck },
  ];

  const handleDemoStart = async () => {
    try {
      await loginDemoUser();
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">
                CareerNavigator
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Team Ctrl Freaks</p>
          </div>
        </Link>

        {/* Desktop Links (Logged In) */}
        {user ? (
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    active
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-indigo-400" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        ) : (
          /* Desktop Links (Guest / Logged Out) */
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <a href="/#how-it-works" className="hover:text-white transition">
              How It Works
            </a>
            <Link href="/career" className="hover:text-white transition">
              Careers
            </Link>
            <Link href="/roadmap" className="hover:text-white transition">
              Roadmaps
            </Link>
          </nav>
        )}

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 text-[10px] font-bold">
                  {user.full_name ? user.full_name[0].toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline font-medium max-w-[120px] truncate">
                  {user.full_name || user.email.split("@")[0]}
                </span>
              </Link>
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDemoStart}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>One-Click Demo</span>
              </button>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-xl border border-slate-700 hover:border-slate-500 text-xs font-medium text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-white transition"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-[#090d16] px-4 py-3 space-y-2">
          {user ? (
            <div className="grid grid-cols-2 gap-1.5 py-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
                      active ? "bg-indigo-600/20 text-indigo-300" : "text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2 pt-1 pb-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleDemoStart();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Launch Instant Demo</span>
              </button>
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl bg-slate-800 text-xs font-medium text-white border border-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl bg-indigo-600 text-xs font-medium text-white"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

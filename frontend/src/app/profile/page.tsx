"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { AIBadge, SourceBadge } from "@/components/AIBadge";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import {
  User,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  Code,
  GraduationCap,
  Briefcase,
  Layers,
  Award,
  Sparkles,
  RefreshCw,
  Clock,
  Target
} from "lucide-react";

export default function ProfilePage() {
  const { user, loginDemoUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCat, setNewSkillCat] = useState("Programming Language");
  const [newSkillProf, setNewSkillProf] = useState("Intermediate");
  const [activeTab, setActiveTab] = useState<"general" | "skills" | "education" | "experience" | "projects">("skills");

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getProfile();
      setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      loginDemoUser().then(() => loadProfile());
    } else {
      loadProfile();
    }
  }, [user]);

  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateProfile({
        full_name: profile.full_name,
        target_career: profile.target_career,
        current_skill_level: profile.current_skill_level,
        available_hours_per_day: Number(profile.available_hours_per_day),
        preferred_learning_style: profile.preferred_learning_style,
        bio: profile.bio,
      });
      setProfile(updated);
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(`Error updating profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      const added = await api.addSkill({
        name: newSkillName.trim(),
        category: newSkillCat,
        proficiency: newSkillProf,
      });
      setProfile((prev: any) => ({
        ...prev,
        skills: [...prev.skills, added],
      }));
      setNewSkillName("");
    } catch (err: any) {
      alert(`Error adding skill: ${err.message}`);
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    try {
      await api.deleteSkill(skillId);
      setProfile((prev: any) => ({
        ...prev,
        skills: prev.skills.filter((s: any) => s.id !== skillId),
      }));
    } catch (err: any) {
      alert(`Error deleting skill: ${err.message}`);
    }
  };

  const handleClearProfile = async () => {
    if (!confirm("Are you sure you want to reset your profile? All extracted details will be removed.")) return;
    try {
      await api.clearProfile();
      await loadProfile();
    } catch (err: any) {
      alert(`Failed to reset profile: ${err.message}`);
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
                <h1 className="text-2xl font-bold text-white">Student Profile</h1>
                <span className="text-xs text-indigo-400 font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800">
                  Single Source of Truth
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Review and customize all parameters. AI tags identify fields extracted from your resume vs student-edited items.
              </p>
            </div>

            <button
              onClick={handleClearProfile}
              className="px-3 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-800/40 text-xs font-medium transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Profile Data</span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto text-indigo-400 animate-spin" />
              <p className="text-xs text-slate-400">Loading student profile...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
                {[
                  { id: "skills", label: `Skills (${profile?.skills?.length || 0})`, icon: Code },
                  { id: "general", label: "Preferences & Career Goal", icon: Target },
                  { id: "education", label: `Education (${profile?.educations?.length || 0})`, icon: GraduationCap },
                  { id: "experience", label: `Experience (${profile?.experiences?.length || 0})`, icon: Briefcase },
                  { id: "projects", label: `Projects (${profile?.projects?.length || 0})`, icon: Layers },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        active
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Skills Management (FR-PRO-3, FR-PRO-4) */}
              {activeTab === "skills" && (
                <div className="space-y-6">
                  {/* Add New Skill Form */}
                  <form
                    onSubmit={handleAddSkill}
                    className="p-5 rounded-2xl bg-[#0d1322]/80 border border-slate-800 space-y-4"
                  >
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-indigo-400" />
                      <span>Add Skill to Profile</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          required
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          placeholder="e.g. Docker, TypeScript, PyTorch"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <select
                          value={newSkillCat}
                          onChange={(e) => setNewSkillCat(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="Programming Language">Programming Language</option>
                          <option value="Frontend Framework">Frontend Framework</option>
                          <option value="Backend Framework">Backend Framework</option>
                          <option value="Database">Database</option>
                          <option value="DevOps & Cloud">DevOps & Cloud</option>
                          <option value="Tool">Tool</option>
                        </select>
                      </div>
                      <div>
                        <button
                          type="submit"
                          className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Skill</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {profile?.skills?.map((s: any) => (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-white">{s.name}</span>
                            <SourceBadge source={s.source} />
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {s.category} • <span className="text-slate-300">{s.proficiency}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteSkill(s.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition"
                          title="Delete skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: General Goals & Preferences (FR-PRO-1) */}
              {activeTab === "general" && (
                <form
                  onSubmit={handleUpdateGeneral}
                  className="p-6 rounded-2xl bg-[#0d1322]/80 border border-slate-800 space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Target Career Goal</label>
                      <input
                        type="text"
                        value={profile?.target_career || ""}
                        onChange={(e) => setProfile({ ...profile, target_career: e.target.value })}
                        placeholder="e.g. Full Stack AI Engineer"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Current Skill Baseline</label>
                      <select
                        value={profile?.current_skill_level || "Beginner"}
                        onChange={(e) => setProfile({ ...profile, current_skill_level: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="Beginner">Beginner (Foundations)</option>
                        <option value="Intermediate">Intermediate (Projects built)</option>
                        <option value="Advanced">Advanced (Production experience)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Available Study Time per Day (Hours)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="12"
                        value={profile?.available_hours_per_day || 2}
                        onChange={(e) => setProfile({ ...profile, available_hours_per_day: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Preferred Learning Style</label>
                      <select
                        value={profile?.preferred_learning_style || "Hands-on Project-based"}
                        onChange={(e) => setProfile({ ...profile, preferred_learning_style: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="Hands-on Project-based">Hands-on Project-based</option>
                        <option value="Theory & System Deep Dive">Theory & System Deep Dive</option>
                        <option value="Interactive Coding Drills">Interactive Coding Drills</option>
                        <option value="Intensive Bootcamp Sprint">Intensive Bootcamp Sprint</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Professional Bio / Summary</label>
                    <textarea
                      rows={3}
                      value={profile?.bio || ""}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Concise overview of your technical journey and career aspirations..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 3: Education */}
              {activeTab === "education" && (
                <div className="space-y-4">
                  {profile?.educations?.map((edu: any) => (
                    <div
                      key={edu.id}
                      className="p-5 rounded-2xl bg-[#0d1322]/80 border border-slate-800 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-white">{edu.institution}</h4>
                          <SourceBadge source={edu.source} />
                        </div>
                        <p className="text-xs text-indigo-300">
                          {edu.degree} in {edu.branch_or_field}
                        </p>
                        <p className="text-xs text-slate-400">
                          {edu.start_year} - {edu.end_year} • Grade: {edu.grade || "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Experience */}
              {activeTab === "experience" && (
                <div className="space-y-4">
                  {profile?.experiences?.map((exp: any) => (
                    <div
                      key={exp.id}
                      className="p-5 rounded-2xl bg-[#0d1322]/80 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-white">{exp.title}</h4>
                          <SourceBadge source={exp.source} />
                        </div>
                        <span className="text-xs text-slate-400">{exp.duration}</span>
                      </div>
                      <div className="text-xs text-indigo-300 font-medium">{exp.company} ({exp.role_type})</div>
                      <p className="text-xs text-slate-300 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 5: Projects */}
              {activeTab === "projects" && (
                <div className="space-y-4">
                  {profile?.projects?.map((proj: any) => (
                    <div
                      key={proj.id}
                      className="p-5 rounded-2xl bg-[#0d1322]/80 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-white">{proj.title}</h4>
                          <SourceBadge source={proj.source} />
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {proj.technologies.map((t: string, tIdx: number) => (
                            <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

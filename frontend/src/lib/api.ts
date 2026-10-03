const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  // Only set Content-Type to application/json if not sending FormData
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMessage = `Request failed (${res.status})`;
    try {
      const errorData = await res.json();
      errMessage = errorData.detail || errorData.message || errMessage;
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }

  return res.json();
}

export const api = {
  // --- Auth ---
  register: (data: { email: string; password: string; full_name?: string }) =>
    request<{ access_token: string; token_type: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMe: () => request<any>("/auth/me"),
  deleteAccount: () => request<any>("/auth/account", { method: "DELETE" }),

  // --- Profile ---
  getProfile: () => request<any>("/profile"),
  updateProfile: (data: any) =>
    request<any>("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  clearProfile: () => request<any>("/profile", { method: "DELETE" }),
  addSkill: (data: any) =>
    request<any>("/profile/skills", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSkill: (id: number, data: any) =>
    request<any>(`/profile/skills/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteSkill: (id: number) =>
    request<any>(`/profile/skills/${id}`, { method: "DELETE" }),

  addEducation: (data: any) =>
    request<any>("/profile/education", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteEducation: (id: number) =>
    request<any>(`/profile/education/${id}`, { method: "DELETE" }),

  addExperience: (data: any) =>
    request<any>("/profile/experience", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteExperience: (id: number) =>
    request<any>(`/profile/experience/${id}`, { method: "DELETE" }),

  addProject: (data: any) =>
    request<any>("/profile/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteProject: (id: number) =>
    request<any>(`/profile/projects/${id}`, { method: "DELETE" }),

  addCertification: (data: any) =>
    request<any>("/profile/certifications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteCertification: (id: number) =>
    request<any>(`/profile/certifications/${id}`, { method: "DELETE" }),

  // --- Resume ---
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<any>("/resume/upload", {
      method: "POST",
      body: formData,
    });
  },
  loadSampleResume: () =>
    request<any>("/resume/sample-demo", {
      method: "POST",
    }),
  getSampleText: () => request<{ text: string }>("/resume/sample-text"),

  // --- Career ---
  getCareerRecommendations: () => request<any[]>("/career/recommendations"),
  regenerateRecommendations: () => request<any[]>("/career/regenerate", { method: "POST" }),
  setTargetCareer: (career_name: string) =>
    request<any>("/career/target", {
      method: "POST",
      body: JSON.stringify({ career_name }),
    }),

  // --- Skill Gap ---
  analyzeSkillGap: (career?: string) =>
    request<any>(`/skill-gap/analyze${career ? `?career=${encodeURIComponent(career)}` : ""}`),

  // --- Roadmap ---
  getActiveRoadmap: () => request<any>("/roadmap"),
  generateRoadmap: (data: {
    career_name?: string;
    duration_days?: number;
    hours_per_day?: number;
    starting_level?: string;
    preferred_learning_style?: string;
    goal?: string;
  }) =>
    request<any>("/roadmap/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  toggleRoadmapTask: (taskId: number, is_completed: boolean) =>
    request<any>(`/roadmap/tasks/${taskId}/toggle`, {
      method: "PATCH",
      body: JSON.stringify({ is_completed }),
    }),

  // --- Assessment & Adaptive ---
  generateAssessment: (data: { roadmap_id?: number; topic?: string }) =>
    request<any>("/assessment/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAssessment: (id: number) => request<any>(`/assessment/${id}`),
  submitAssessment: (id: number, answers: { question_id: number; answer: string }[]) =>
    request<any>(`/assessment/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
  getAdaptiveHistory: (roadmapId: number) =>
    request<any[]>(`/assessment/adaptive/history/${roadmapId}`),

  // --- Simulator ---
  runSimulation: (data: { hypothetical_skills: string[]; target_career?: string }) =>
    request<any>("/simulator/simulate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getSimulationHistory: () => request<any[]>("/simulator/history"),
  applySimulation: (simId: number) =>
    request<any>(`/simulator/${simId}/apply`, { method: "POST" }),

  // --- Job Matcher ---
  matchJob: (data: { job_description: string; job_title?: string; company?: string }) =>
    request<any>("/jobs/match", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getJobMatchHistory: () => request<any[]>("/jobs/history"),
  getSampleJD: () => request<{ sample_jd: string }>("/jobs/sample"),

  // --- Portfolio Projects ---
  generateProjects: (data: { target_career?: string; difficulty?: string; interest_domain?: string }) =>
    request<any[]>("/projects/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getSavedProjects: () => request<any[]>("/projects/list"),

  // --- Resume Reviewer ---
  reviewResume: (targetCareer?: string) =>
    request<any>(`/resume-review/analyze${targetCareer ? `?target_career=${encodeURIComponent(targetCareer)}` : ""}`, {
      method: "POST",
    }),
  getLatestReview: () => request<any>("/resume-review/latest"),
};

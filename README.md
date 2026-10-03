# AI Student Career Navigator 🚀

**Team Ctrl Freaks · Version 1.0**  
*An AI-powered web platform giving students a personalized path from their current skills to their desired career.*

---

## 🌟 Architecture Overview

```
Student ──► Next.js Frontend (Port 3000) ──► FastAPI Backend (Port 8000) ──► AI Service Layer ──► Google Gemini API
                                                                                │
                                                                                ▼
                                                                     PostgreSQL / SQLite Database
```

---

## 🧩 Features Implemented (P1 & P2 Full Scope)

| Module | SRS Code | Description |
|---|---|---|
| **Authentication & Account** | `FR-AUTH` | Secure email registration, bcrypt password hashing, JWT session expiration, account deletion. |
| **Resume Upload & Parsing** | `FR-RES` | Accepts PDF and DOCX, validates file type and size, extracts text, structured AI data extraction, 1-click sample demo. |
| **Student Profile** | `FR-PRO` | Central source of truth, editable fields, distinguishes `AI-Extracted` vs `User-Edited` items. |
| **Career Recommendations** | `FR-CAR` | Dynamic recommendations without hardcoded lists, multi-factor explainable score (Tech Skills, Projects, Education, Experience). |
| **Skill Gap Visualizer** | `FR-GAP` | Interactive Recharts Radar spectrum and Bar charts, sortable by gap severity (Critical, Major, Moderate, Minimal). |
| **Personalised Roadmap** | `FR-RDM` | Configurable duration (7, 14, 30, 60, 90 days), daily study hours, ordered tasks with exercises, task completion tracking. |
| **AI Assessment Engine** | `FR-ASM` | Topic-specific interactive questions (MCQs, conceptual, scenario, coding), automated AI grading and feedback. |
| **Adaptive Roadmap Engine** | `FR-ADP` | Dynamic modification loop: automatically inserts remedial practice for weak topics and accelerates mastered concepts. |
| **Career What-If Simulator** | `FR-SIM` | Test hypothetical skills (e.g. AWS, Docker) to see before & after compatibility score boosts (+18% delta). Option to apply to profile. |
| **Job Description Matcher** | `FR-JOB` | Paste real job postings, extract required/preferred skills, compute match score, and generate a 2-week cram sprint. |
| **Portfolio Project Generator** | `FR-PRJ` | Standout capstones tailored to target role and skill gaps, with architecture stages, dataset needs, and resume bullets. |
| **ATS Resume Reviewer** | `FR-REV` | Identifies weak sections, rewrites passive bullets into Google XYZ achievement format without fabricating false claims. |
| **AI Service Layer** | `FR-AI` | Centralized prompts in `prompts.py`, schema-based JSON validation, retries, and high-fidelity fallback intelligence. |

---

## 🚀 Running the Application Locally

### 1. Backend (FastAPI)
The backend is already running on `http://127.0.0.1:8000`.
To run manually:
```powershell
cd backend
Copy-Item .env.example .env
# Set JWT_SECRET in .env to a unique random value of at least 32 characters.
.\venv\Scripts\activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend (Next.js)
The frontend is already running on `http://localhost:3000`.
To run manually:
```powershell
cd frontend
npm run dev
```

---

## 🎯 Verification Acceptance Flow (SRS Section 10.2)
1. Open [http://localhost:3000](http://localhost:3000) in your web browser.
2. Click **"Launch 1-Click Interactive Demo"** or **"One-Click Demo"** in the top navigation.
3. On the **Dashboard**, view the guided 9-stage checklist and metric cards.
4. Go to **Resume** (`/resume`) and click **"Load Demo Resume (Alex Morgan)"** to watch AI parsing extract skills, education, and projects.
5. Go to **Careers** (`/career`) to explore dynamic recommendations with multi-factor score breakdowns.
6. Go to **Skill Gap** (`/skill-gap`) to interact with the Recharts Radar spectrum chart.
7. Go to **Roadmap** (`/roadmap`) to toggle tasks and take the interactive knowledge check.
8. Go to **What-If** (`/simulator`) to run hypothetical simulations with AWS & Docker.
9. Go to **JD Matcher** (`/job-match`) to paste a real JD and generate a job-prep plan.

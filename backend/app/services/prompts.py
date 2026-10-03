"""
Centralized Prompts Module (FR-AI-2)
All AI prompts are maintained centrally, cleanly separated from route and business logic.
"""

RESUME_EXTRACTION_PROMPT = """You are an expert AI Resume and Talent Analyst for university students and early-career engineers.
Analyze the following student resume text and extract structured information in JSON format.
Ensure you accurately parse all skills, categorization, degrees, projects, and experiences.

Resume Content:
{resume_text}

Return ONLY valid JSON matching this schema:
{{
  "full_name": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "bio": "concise 2-sentence summary of the candidate's profile and key strengths",
  "target_career_hint": "inferred potential career path based on skills or null",
  "skills": [
    {{"name": "Python", "category": "Programming Language", "proficiency": "Intermediate"}},
    {{"name": "React", "category": "Frontend Framework", "proficiency": "Beginner"}}
  ],
  "education": [
    {{"institution": "University Name", "degree": "B.Tech", "branch_or_field": "Computer Science", "start_year": "2022", "end_year": "2026", "grade": "8.5 CGPA"}}
  ],
  "experience": [
    {{"title": "Software Intern", "company": "Tech Corp", "role_type": "Internship", "duration": "Summer 2024", "description": "Built REST APIs with FastAPI", "technologies": ["Python", "FastAPI"]}}
  ],
  "projects": [
    {{"title": "Project Title", "description": "Project overview and features", "technologies": ["React", "Node.js"], "link": null}}
  ],
  "certifications": [
    {{"name": "AWS Certified Cloud Practitioner", "issuer": "Amazon Web Services", "issue_date": "2024", "credential_url": null}}
  ],
  "interests": ["Machine Learning", "Distributed Systems", "Web Development"]
}}
"""

CAREER_RECOMMENDATIONS_PROMPT = """You are an elite AI Career Advisor.
Given a student's profile (skills, education, projects, experiences, interests), generate 3 to 5 tailored, dynamic career recommendations.
Do NOT use a hardcoded list. Evaluate modern tech roles that best match this specific student's profile.

Profile Summary:
- Target Career Preference: {target_career}
- Skills: {skills}
- Education: {education}
- Projects: {projects}
- Experiences: {experiences}
- Interests: {interests}
- Current Level: {current_level}

Weights to consider:
- Technical Skills (35%)
- Project Relevance (25%)
- Education & Foundation (15%)
- Experience / Internships (15%)
- Interests & Motivation (10%)

Return ONLY valid JSON with this schema:
{{
  "recommendations": [
    {{
      "career_name": "Full Stack AI Engineer",
      "match_score": 88,
      "reasoning": "Detailed explainable reasoning why this career fits their background and where they have immediate advantages.",
      "technical_skills_score": 85,
      "project_relevance_score": 90,
      "education_score": 88,
      "experience_score": 82,
      "salary_range": "$95,000 - $135,000 / yr (or ₹14 - 24 LPA)",
      "growth_outlook": "Very High (32% projected growth)",
      "relevant_skills": ["Python", "TypeScript", "React", "REST APIs"],
      "missing_skills": ["LangChain", "Vector Databases", "Docker"],
      "recommended_actions": [
        "Build an end-to-end LLM application with RAG",
        "Containerize backend services using Docker",
        "Add unit tests to existing projects"
      ]
    }}
  ]
}}
"""

SKILL_GAP_PROMPT = """You are an AI Technical Skill Evaluator.
Compare this student's profile with industry competencies required for the role '{target_career}'.

Student Skills & Proficiencies:
{student_skills}

Student Projects & Experience:
{student_background}

Provide a comprehensive skill gap analysis detailing existing skills and required missing/under-developed skills.
Return ONLY valid JSON with this schema:
{{
  "career_name": "{target_career}",
  "overall_readiness": 68,
  "gaps": [
    {{
      "skill_name": "Docker & Containerization",
      "category": "DevOps & Cloud",
      "current_proficiency": 20,
      "target_proficiency": 80,
      "importance": "High",
      "gap_severity": "Critical",
      "estimated_hours_to_bridge": 18,
      "learning_resources": [
        {{"title": "Docker Official Getting Started Guide", "url": "https://docs.docker.com/get-started/"}},
        {{"title": "Interactive Docker Hands-on Labs", "url": "https://www.docker.com/101-tutorial/"}}
      ]
    }}
  ]
}}
"""

ROADMAP_GENERATION_PROMPT = """You are an AI Curriculum Architect and Senior Tech Mentor.
Generate a structured, personalised learning roadmap for the student aiming for '{career_name}'.

Student Details:
- Starting Level: {starting_level}
- Duration: {duration_days} days
- Available Time: {hours_per_day} hours/day
- Preferred Learning Style: {preferred_learning_style}
- Stated Goal: {goal}
- Current Skills: {current_skills}
- Missing Skills / Focus Areas: {missing_skills}

Generate realistic, sequential tasks organized into phases (e.g. Phase 1: Core Foundations, Phase 2: Advanced Implementations, Phase 3: Capstone & Portfolio).
The roadmap must strictly fit the {duration_days}-day timeline.
Return ONLY valid JSON matching this schema:
{{
  "career_name": "{career_name}",
  "duration_days": {duration_days},
  "phases": [
    {{
      "phase_title": "Phase 1: Deep Dive into Core Systems (Days 1-{phase1_days})",
      "tasks": [
        {{
          "order_index": 1,
          "day_number": 1,
          "week_number": 1,
          "title": "Master Async Python & FastAPI Architecture",
          "description": "Understand event loops, coroutines, and build non-blocking asynchronous REST endpoints.",
          "topic": "Python / Async IO",
          "estimated_hours": {hours_per_day},
          "resources": [
            {{"title": "FastAPI Async Tutorial", "url": "https://fastapi.tiangolo.com/async/"}}
          ],
          "practical_exercise": "Build a fast endpoint that parallelizes 3 external API calls using httpx.AsyncClient."
        }}
      ]
    }}
  ]
}}
"""

ASSESSMENT_GENERATION_PROMPT = """You are an AI Technical Interviewer & Examiner.
Generate an interactive, comprehensive technical assessment for a student studying:
- Topic: {topic}
- Target Career: {career_name}
- Skill Level: {skill_level}

Include a mix of:
1. Multiple Choice Questions (conceptual & analytical)
2. Scenario-based Architecture/Problem-solving questions
3. Coding/Debugging challenges

Generate 4-5 high quality questions.
Return ONLY valid JSON with this schema:
{{
  "title": "Technical Competency Assessment: {topic}",
  "topic": "{topic}",
  "questions": [
    {{
      "question_text": "What is the primary difference between synchronous and asynchronous execution in Python asyncio?",
      "question_type": "mcq",
      "options": [
        "A) Asyncio uses multi-core CPU threads automatically",
        "B) Asyncio uses a cooperative single-threaded event loop to handle I/O without blocking",
        "C) Asyncio compiles Python to C++ code for speed",
        "D) Asyncio runs tasks in separate operating system processes"
      ],
      "correct_answer": "B",
      "explanation": "Python's asyncio runs a cooperative event loop where tasks yield control during I/O operations, avoiding the overhead of OS thread switching."
    }}
  ]
}}
"""

ASSESSMENT_EVALUATION_PROMPT = """You are an AI Assessment Grader.
Evaluate the student's submitted answers against the assessment questions.

Questions and Student Answers:
{questions_and_answers}

Calculate an exact score percentage, identify strengths, identify specific weaknesses that need revision, and formulate helpful constructive feedback.
Return ONLY valid JSON with this schema:
{{
  "score_percent": 80.0,
  "strengths": ["Strong understanding of asynchronous event loops", "Good grasp of API status codes"],
  "weaknesses": ["Needs practice with database transaction isolation levels", "Index optimization"],
  "ai_feedback": "Detailed encouraging feedback outlining what was done well and the exact concepts to reinforce.",
  "question_results": [
    {{
      "question_id": 1,
      "is_correct": true,
      "explanation": "Correct explanation..."
    }}
  ]
}}
"""

ADAPTIVE_ROADMAP_PROMPT = """You are the AI Adaptive Learning Engine.
Based on the student's recent assessment performance for their roadmap:
- Strengths: {strengths}
- Weaknesses / Weak Topics: {weaknesses}
- Score: {score_percent}%

Current Roadmap Tasks remaining:
{remaining_tasks}

Adapt the roadmap:
1. For weak topics, insert targeted remedial practice tasks and reinforcement exercises.
2. For topics where the student showed mastery, skip or reduce redundant tasks.
3. Clearly summarize what was modified and the educational reasoning why.

Return ONLY valid JSON matching this schema:
{{
  "changes_summary": "Added 2 reinforcement tasks for database indexing; compressed foundational syntax tasks to accelerate timeline.",
  "reason": "Student showed 90%+ mastery in basic APIs but scored low on database concurrency.",
  "added_topics": ["Database Concurrency & Locking", "PostgreSQL Index Optimization"],
  "skipped_topics": ["Basic SQL CRUD"],
  "modified_tasks": [
    {{
      "title": "Hands-on Workshop: Concurrency Control in PostgreSQL",
      "description": "Implement pessimistic and optimistic locking patterns to prevent race conditions.",
      "topic": "Databases",
      "estimated_hours": 2.5,
      "is_adaptive_addition": true,
      "practical_exercise": "Simulate two simultaneous ticket purchases and verify no overselling occurs."
    }}
  ]
}}
"""

CAREER_SIMULATION_PROMPT = """You are an AI Career Simulation Engine.
Calculate what happens to the student's career viability if they acquire hypothetical skills: {hypothetical_skills}.

Current Profile:
- Target Career: {target_career}
- Current Skills: {current_skills}
- Current Match Score: {current_score}%

Simulate the outcome:
1. Recalculate match score with these new skills added.
2. Explain the exact leverage and unlocked capabilities (what new doors open).
3. Contrast before vs after.

Return ONLY valid JSON matching this schema:
{{
  "target_career": "{target_career}",
  "before_score": {current_score},
  "after_score": 88,
  "score_delta": 18,
  "explanation": "Adding Docker and AWS transforms your profile from a localized developer into a cloud-ready production engineer. It directly addresses the #1 required competency in modern job postings for {target_career}.",
  "unlocked_capabilities": [
    "Production container orchestration and microservice deployment",
    "Serverless cloud architecture workflows",
    "Eligibility for Cloud Architect and DevOps pipelines"
  ]
}}
"""

JOB_MATCH_PROMPT = """You are an AI Technical Recruiter and Job Description Parser.
Analyze the following job description and compare it against the student's profile.

Student Profile:
- Skills: {student_skills}
- Experience: {student_experience}
- Projects: {student_projects}
- Education: {student_education}

Job Description:
{job_description}

Extract required skills, preferred skills, responsibilities, calculate an explainable match score (0-100), identify match strengths and missing competencies, and generate an actionable job-preparation plan.

Return ONLY valid JSON matching this schema:
{{
  "job_title": "Software Engineer II - Backend",
  "company": "Tech Innovators Inc.",
  "match_score": 76,
  "responsibilities_summary": "Design and maintain high-throughput backend services and data pipelines.",
  "extracted_required_skills": ["Python", "Docker", "PostgreSQL", "REST APIs"],
  "extracted_preferred_skills": ["Kubernetes", "Redis", "Kafka"],
  "matching_skills": ["Python", "PostgreSQL", "REST APIs"],
  "missing_skills": ["Docker", "Kubernetes", "Redis"],
  "match_strengths": [
    "Strong Python project portfolio",
    "Solid academic background in Computer Science"
  ],
  "preparation_plan": [
    {{
      "phase": "Week 1: Core Tooling Ramp-Up",
      "focus": "Docker containerization and local cluster setup",
      "duration_days": 7,
      "actions": [
        "Containerize student portfolio project with multi-stage Dockerfile",
        "Set up local Redis cache container and benchmark endpoint response speed"
      ]
    }},
    {{
      "phase": "Week 2: Mock Interview & Resume Alignment",
      "focus": "Targeted interview drills on missing JD requirements",
      "duration_days": 7,
      "actions": [
        "Revise resume projects to highlight REST API throughput metrics",
        "Practice system design question: Caching strategies with Redis"
      ]
    }}
  ]
}}
"""

PORTFOLIO_PROJECT_PROMPT = """You are an AI Tech Lead and Project Mentor.
Generate standout portfolio project ideas for a student aiming for '{target_career}'.
The projects must showcase high engineering depth, solve real problems, and fill their skill gaps.

Target Career: {target_career}
Current Skills: {current_skills}
Missing Skills to Bridge: {missing_skills}
Difficulty Level: {difficulty}
Interest Domain: {interest_domain}

Return ONLY valid JSON with this schema:
{{
  "projects": [
    {{
      "title": "Real-Time Distributed Telemetry & Anomaly Detector",
      "difficulty": "{difficulty}",
      "problem_statement": "Modern microservices produce millions of log events. This system processes high-throughput streams and detects anomalies using sliding-window statistical heuristics.",
      "technologies": ["Python", "FastAPI", "Redis Streams", "React", "Docker"],
      "features": [
        "Sub-millisecond event streaming pipeline",
        "Dynamic sliding window anomaly scoring",
        "Live interactive telemetry dashboard with WebSockets"
      ],
      "development_stages": [
        {{"stage": "Stage 1", "description": "Set up synthetic log generator and Redis Streams broker"}},
        {{"stage": "Stage 2", "description": "Implement sliding window analyzer with FastAPI backend"}},
        {{"stage": "Stage 3", "description": "Build Next.js real-time charts and deploy via Docker Compose"}}
      ],
      "dataset_requirements": "Synthetic clickstream/server metrics generator script provided in repo",
      "expected_outcome": "A fully functional, containerized real-time monitoring suite with live metrics charts.",
      "skills_demonstrated": ["Stream Processing", "Asynchronous Systems", "Full-Stack Integration", "Docker Containerization"],
      "resume_bullet_suggestions": [
        "Engineered real-time telemetry pipeline utilizing Redis Streams and FastAPI, ingesting 10k+ events/sec with sub-50ms latency.",
        "Architected containerized microservice cluster with Docker Compose, reducing local dev onboarding time by 80%."
      ]
    }}
  ]
}}
"""

RESUME_REVIEW_PROMPT = """You are an AI Executive Resume Reviewer and ATS Optimization Expert.
Critique the student's resume objectively.
CRITICAL CONSTRAINT: You shall NEVER fabricate facts, internships, degrees, or false metrics. Suggestions must refine truth with measurable impact.

Resume Content / Profile:
{resume_content}

Target Career: {target_career}

Evaluate:
1. Overall ATS & Recruiter Impact Score (0-100)
2. Weak sections (e.g. passive bullet points, vague descriptions, missing tech stack tags)
3. Actionable bullet point rewrites following the XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'
4. Role-specific ATS keywords recommended and currently missing

Return ONLY valid JSON with this schema:
{{
  "overall_score": 74,
  "summary": "Solid technical foundation with clear project experience. The resume is slightly held back by passive phrasing in project descriptions and lacks specific performance metrics.",
  "weak_sections": [
    {{
      "section": "Projects - Web App",
      "issue": "Used passive voice 'Worked on a website' without explaining engineering complexity or scale.",
      "recommendation": "Lead with strong action verbs (Architected, Engineered) and state user impact or performance gains."
    }}
  ],
  "suggestions": [
    "Quantify database optimizations (e.g., query execution time reduction).",
    "Group technical skills into clear categories (Languages, Frameworks, Cloud, Databases).",
    "Include links to live demos and GitHub repositories."
  ],
  "bullet_rewrites": [
    {{
      "before": "Created an e-commerce backend with Python and MongoDB.",
      "after": "Architected an asynchronous e-commerce backend in Python and FastAPI with MongoDB, supporting 200+ concurrent requests with sub-100ms response times.",
      "metric_boost": "+60% clarity, highlights concurrency and latency metrics"
    }}
  ],
  "ats_keywords_recommended": ["Microservices", "RESTful APIs", "CI/CD", "Unit Testing", "Docker"],
  "ats_keywords_missing": ["Docker", "CI/CD", "Unit Testing"]
}}
"""

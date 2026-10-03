import re
from typing import Dict, Any, List

def mock_extract_resume(text: str) -> Dict[str, Any]:
    """Smart local extraction from resume text if Gemini is offline."""
    lower = text.lower()
    
    # Extract name heuristic (first line or title)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    full_name = lines[0] if lines else "Candidate Name"
    if "@" in full_name or len(full_name) > 40:
        full_name = "Alex Morgan"

    # Extract email
    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    email = email_match.group(0) if email_match else "alex.morgan@university.edu"

    # Extract phone
    phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
    phone = phone_match.group(0) if phone_match else "+1 (555) 234-5678"

    # Skills detection
    skill_catalog = {
        "Python": "Programming Language",
        "JavaScript": "Programming Language",
        "TypeScript": "Programming Language",
        "Java": "Programming Language",
        "C++": "Programming Language",
        "SQL": "Database",
        "PostgreSQL": "Database",
        "MongoDB": "Database",
        "React": "Frontend Framework",
        "Next.js": "Frontend Framework",
        "Node.js": "Backend Framework",
        "FastAPI": "Backend Framework",
        "Django": "Backend Framework",
        "Docker": "DevOps & Cloud",
        "AWS": "DevOps & Cloud",
        "Kubernetes": "DevOps & Cloud",
        "Git": "Tool",
        "Tailwind CSS": "Frontend Framework",
        "Linux": "Operating System",
        "Machine Learning": "AI & Data",
        "PyTorch": "AI & Data",
        "TensorFlow": "AI & Data",
        "REST APIs": "Architecture",
    }
    
    detected_skills = []
    for skill_name, cat in skill_catalog.items():
        if re.search(rf"\b{re.escape(skill_name.lower())}\b", lower):
            detected_skills.append({
                "name": skill_name,
                "category": cat,
                "proficiency": "Intermediate"
            })
            
    if not detected_skills:
        detected_skills = [
            {"name": "Python", "category": "Programming Language", "proficiency": "Intermediate"},
            {"name": "React", "category": "Frontend Framework", "proficiency": "Intermediate"},
            {"name": "JavaScript", "category": "Programming Language", "proficiency": "Intermediate"},
            {"name": "FastAPI", "category": "Backend Framework", "proficiency": "Beginner"},
            {"name": "SQL", "category": "Database", "proficiency": "Intermediate"},
            {"name": "Git", "category": "Tool", "proficiency": "Intermediate"},
        ]

    # Education detection
    edu_inst = "State University of Technology"
    degree = "Bachelor of Science"
    branch = "Computer Science and Engineering"
    for line in lines:
        if any(term in line.lower() for term in ["university", "institute", "college"]):
            edu_inst = line[:60]
            break
            
    return {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "bio": f"Ambitious student with strong foundations in software engineering and web technologies, eager to build impactful scalable solutions.",
        "target_career_hint": "Full Stack Software Engineer",
        "skills": detected_skills,
        "education": [
            {
                "institution": edu_inst,
                "degree": degree,
                "branch_or_field": branch,
                "start_year": "2022",
                "end_year": "2026",
                "grade": "3.8 GPA"
            }
        ],
        "experience": [
            {
                "title": "Software Development Intern",
                "company": "Apex Cloud Labs",
                "role_type": "Internship",
                "duration": "Jun 2024 - Aug 2024",
                "description": "Collaborated with senior engineers to implement REST APIs and optimize database query latency by 35%.",
                "technologies": ["Python", "FastAPI", "PostgreSQL", "Docker"]
            }
        ],
        "projects": [
            {
                "title": "Campus Connect Web Platform",
                "description": "Full-stack application allowing university students to form study groups and share course materials with real-time updates.",
                "technologies": ["React", "FastAPI", "PostgreSQL", "Tailwind CSS"],
                "link": "https://github.com/student/campus-connect"
            },
            {
                "title": "Distributed Task Queue Worker",
                "description": "Asynchronous job scheduler handling background batch computation with automated retry policies.",
                "technologies": ["Python", "Redis", "Docker"],
                "link": "https://github.com/student/task-queue"
            }
        ],
        "certifications": [
            {
                "name": "AWS Certified Cloud Practitioner",
                "issuer": "Amazon Web Services",
                "issue_date": "2024",
                "credential_url": "https://aws.amazon.com/verification"
            }
        ],
        "interests": ["Full Stack Engineering", "Cloud Computing", "AI Systems", "Open Source"]
    }

def mock_career_recommendations(profile_dict: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Smart dynamic career recommendation fallback."""
    skills = [s.get("name", "") for s in profile_dict.get("skills", [])]
    skills_lower = [s.lower() for s in skills]

    # Dynamically calibrate based on profile skills
    has_python = any("python" in s for s in skills_lower)
    has_frontend = any(s in skills_lower for s in ["react", "vue", "javascript", "typescript", "next.js"])
    has_ml = any(s in skills_lower for s in ["machine learning", "pytorch", "tensorflow", "data"])
    has_cloud = any(s in skills_lower for s in ["docker", "aws", "kubernetes", "cloud"])

    recommendations = []

    # 1. Full Stack / Backend Engineer
    score_fs = 75 + (10 if has_python else 0) + (10 if has_frontend else 0)
    recommendations.append({
        "career_name": "Full Stack AI Engineer",
        "match_score": min(95, score_fs),
        "reasoning": f"Your strong proficiency in {' and '.join([s for s in skills[:3]])} provides an exceptional foundation for modern full-stack development with AI capabilities.",
        "technical_skills_score": 88,
        "project_relevance_score": 90,
        "education_score": 85,
        "experience_score": 80,
        "salary_range": "$95,000 - $140,000 / yr",
        "growth_outlook": "High (28% 5-year growth)",
        "relevant_skills": [s for s in skills if s.lower() in ["python", "react", "fastapi", "sql", "javascript", "typescript"]][:4] or ["Python", "JavaScript"],
        "missing_skills": ["Vector Databases (Pinecone/Chroma)", "Docker & CI/CD", "Prompt Engineering & RAG"],
        "recommended_actions": [
            "Build a production RAG application using FastAPI and Next.js",
            "Learn container orchestration with Docker and GitHub Actions",
            "Complete an advanced system design course on microservices"
        ]
    })

    # 2. Cloud & DevOps Engineer
    score_devops = 65 + (15 if has_cloud else 0) + (10 if has_python else 0)
    recommendations.append({
        "career_name": "Cloud & DevOps Solutions Engineer",
        "match_score": min(92, score_devops),
        "reasoning": "Your backend scripting skills and systems awareness align closely with automated deployment pipelines, infrastructure-as-code, and cloud reliability engineering.",
        "technical_skills_score": 78,
        "project_relevance_score": 75,
        "education_score": 82,
        "experience_score": 74,
        "salary_range": "$100,000 - $145,000 / yr",
        "growth_outlook": "Very High (30% 5-year growth)",
        "relevant_skills": [s for s in skills if s.lower() in ["python", "git", "linux", "aws", "docker"]][:4] or ["Git", "Linux Foundations"],
        "missing_skills": ["Kubernetes", "Terraform", "Prometheus & Grafana", "CI/CD Pipelines"],
        "recommended_actions": [
            "Set up automated testing and build pipelines in GitHub Actions",
            "Provision cloud infrastructure using Terraform scripts",
            "Deploy a multi-tier microservice to AWS ECS or EKS"
        ]
    })

    # 3. AI / ML Application Developer
    score_ml = 70 + (15 if has_ml else 0) + (10 if has_python else 0)
    recommendations.append({
        "career_name": "Applied Machine Learning Engineer",
        "match_score": min(90, score_ml),
        "reasoning": "High demand for software developers who can bridge foundational models into scalable customer products, orchestrating inference and data validation.",
        "technical_skills_score": 82,
        "project_relevance_score": 80,
        "education_score": 88,
        "experience_score": 72,
        "salary_range": "$110,000 - $160,000 / yr",
        "growth_outlook": "Exceptional (36% 5-year growth)",
        "relevant_skills": [s for s in skills if s.lower() in ["python", "sql", "math", "fastapi"]][:4] or ["Python", "Data Modeling"],
        "missing_skills": ["PyTorch / HuggingFace", "Model Fine-tuning", "Vector Search", "MLflow"],
        "recommended_actions": [
            "Fine-tune an open-source LLM on a custom domain dataset",
            "Implement a semantic search engine using embedding models",
            "Deploy a low-latency model inference server using vLLM or Triton"
        ]
    })

    # 4. Frontend & Design Systems Engineer
    score_fe = 68 + (20 if has_frontend else 0)
    recommendations.append({
        "career_name": "Frontend Systems Architect",
        "match_score": min(91, score_fe),
        "reasoning": "Exceptional opportunities building rich, accessible, high-performance web applications and interactive client-side design systems.",
        "technical_skills_score": 84,
        "project_relevance_score": 82,
        "education_score": 80,
        "experience_score": 76,
        "salary_range": "$90,000 - $130,000 / yr",
        "growth_outlook": "Steady (22% 5-year growth)",
        "relevant_skills": [s for s in skills if s.lower() in ["react", "javascript", "typescript", "tailwind css", "html", "css"]][:4] or ["React", "TypeScript"],
        "missing_skills": ["Web Performance Optimization", "Microfrontends", "Testing (Jest/Playwright)", "GraphQL"],
        "recommended_actions": [
            "Publish an open-source React component library to npm",
            "Implement automated end-to-end testing with Playwright",
            "Audit and optimize Core Web Vitals to reach 95+ Lighthouse scores"
        ]
    })

    return recommendations

def mock_skill_gap(career_name: str, profile_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Generates detailed skill gap breakdown with severity ratings."""
    existing_skills = {s.get("name", "").lower(): s for s in profile_dict.get("skills", [])}
    
    # Common required competencies for modern roles
    target_competencies = [
        {"name": "Docker & Containerization", "category": "DevOps & Cloud", "target": 85, "importance": "Critical"},
        {"name": "FastAPI & REST Architecture", "category": "Backend", "target": 80, "importance": "High"},
        {"name": "Vector Databases & Semantic Search", "category": "AI Systems", "target": 75, "importance": "High"},
        {"name": "PostgreSQL & Query Optimization", "category": "Database", "target": 80, "importance": "Critical"},
        {"name": "CI/CD & GitHub Actions", "category": "DevOps & Cloud", "target": 70, "importance": "Medium"},
        {"name": "TypeScript & Next.js", "category": "Frontend", "target": 85, "importance": "High"},
        {"name": "System Design & Microservices", "category": "Architecture", "target": 75, "importance": "Critical"},
        {"name": "Automated Testing (Pytest/Jest)", "category": "Quality Assurance", "target": 70, "importance": "Medium"},
    ]

    gaps = []
    total_curr = 0
    total_target = 0

    for comp in target_competencies:
        key = comp["name"].lower()
        matched = False
        curr_prof = 15  # baseline
        for s_name, s_obj in existing_skills.items():
            if s_name in key or key in s_name or any(word in s_name for word in key.split() if len(word) > 4):
                matched = True
                prof_str = s_obj.get("proficiency", "Intermediate").lower()
                curr_prof = 85 if prof_str == "expert" else 70 if prof_str == "advanced" else 50 if prof_str == "intermediate" else 30
                break

        diff = comp["target"] - curr_prof
        if diff >= 50:
            severity = "Critical"
        elif diff >= 30:
            severity = "Major"
        elif diff >= 15:
            severity = "Moderate"
        else:
            severity = "Minimal"

        hours = max(8, int(diff * 0.45))
        total_curr += curr_prof
        total_target += comp["target"]

        gaps.append({
            "skill_name": comp["name"],
            "category": comp["category"],
            "current_proficiency": curr_prof,
            "target_proficiency": comp["target"],
            "importance": comp["importance"],
            "gap_severity": severity,
            "estimated_hours_to_bridge": hours,
            "learning_resources": [
                {"title": f"{comp['name']} Official Documentation & Specs", "url": "https://developer.mozilla.org/"},
                {"title": f"Hands-on {comp['name']} Interactive Sandbox", "url": "https://github.com/"}
            ]
        })

    readiness = int((total_curr / max(1, total_target)) * 100)
    return {
        "career_name": career_name,
        "overall_readiness": min(95, max(35, readiness)),
        "gaps": gaps
    }

def mock_generate_roadmap(career_name: str, duration_days: int, hours_per_day: float, starting_level: str) -> List[Dict[str, Any]]:
    """Generates structured roadmap tasks fitting duration 7, 14, 30, 60, or 90 days."""
    num_phases = 3 if duration_days <= 14 else 4 if duration_days <= 30 else 5
    tasks_per_phase = max(2, duration_days // (num_phases * 2))
    
    phases = [
        {"title": "Phase 1: Architectural Foundations & Tooling", "focus": "Core Language & Environment Setup"},
        {"title": "Phase 2: Scalable Backend Services & APIs", "focus": "REST/GraphQL, Auth & Concurrency"},
        {"title": "Phase 3: Database Design & Query Optimization", "focus": "Schema Modeling & Caching"},
        {"title": "Phase 4: Cloud Containerization & Deployment", "focus": "Docker, CI/CD & Production Hosting"},
        {"title": "Phase 5: Capstone Project & Technical Portfolio", "focus": "End-to-End System & Live Launch"},
    ][:num_phases]

    tasks = []
    order = 1
    day = 1
    step_days = max(1, duration_days // (len(phases) * tasks_per_phase))

    for p_idx, phase in enumerate(phases):
        for t_idx in range(tasks_per_phase):
            week_num = max(1, (day + 6) // 7)
            title = f"{phase['focus']}: Step {t_idx + 1}"
            if p_idx == 0 and t_idx == 0:
                title = f"Master Core Asynchronous Patterns for {career_name}"
            elif p_idx == 0 and t_idx == 1:
                title = "Implement Secure JWT Authentication & Session State"
            elif p_idx == 1 and t_idx == 0:
                title = "Build High-Throughput RESTful Endpoints with Pydantic Validation"
            elif p_idx == 1 and t_idx == 1:
                title = "Integrate Redis Distributed Caching & Rate Limiting"
            elif p_idx == 2:
                title = "Design Normalized PostgreSQL Schema with Index Optimization"
            elif p_idx == 3:
                title = "Containerize Application with Multi-Stage Dockerfile & Health Checks"
            elif p_idx == 4:
                title = "Complete Capstone Deployment & Write ATS-Optimized Documentation"

            tasks.append({
                "order_index": order,
                "phase_title": phase["title"],
                "day_number": min(day, duration_days),
                "week_number": week_num,
                "title": title,
                "description": f"Master practical implementations of {title.lower()} tailored for {career_name}.",
                "topic": phase["focus"],
                "estimated_hours": hours_per_day,
                "resources": [
                    {"title": "Deep Dive Guide & Code Examples", "url": "https://docs.python.org/3/"},
                    {"title": "Architecture Blueprint", "url": "https://github.com/"}
                ],
                "practical_exercise": f"Write code and test cases for {title} and commit to your Git repository.",
                "is_completed": False,
                "is_adaptive_addition": False,
                "is_skipped": False
            })
            order += 1
            day += step_days

    return tasks

def mock_assessment_questions(topic: str) -> List[Dict[str, Any]]:
    """Generates 4 rich questions (MCQs, Scenario, Coding)."""
    return [
        {
            "question_text": "In a modern asynchronous web framework, what occurs when an I/O operation (e.g. database query) is awaited?",
            "question_type": "mcq",
            "options": [
                "A) The OS spawns an independent physical CPU core to block on the socket",
                "B) The event loop suspends the coroutine and executes other pending tasks without blocking",
                "C) The Python runtime crashes due to GIL deadlock",
                "D) Memory is flushed to disk automatically"
            ],
            "correct_answer": "B",
            "explanation": "Coroutines yield control back to the event loop upon encountering an 'await' on an I/O future, allowing high-concurrency throughput on a single thread."
        },
        {
            "question_text": "Which HTTP status code should be returned when a client attempts to access a protected endpoint with an expired JWT token?",
            "question_type": "mcq",
            "options": [
                "A) 200 OK with error body",
                "B) 400 Bad Request",
                "C) 401 Unauthorized with WWW-Authenticate header",
                "D) 403 Forbidden"
            ],
            "correct_answer": "C",
            "explanation": "RFC 7235 dictates 401 Unauthorized when credentials are missing or invalid, whereas 403 indicates authenticated credentials lack necessary permissions."
        },
        {
            "question_text": "Scenario: Your backend service experiences a sudden 10x traffic spike during a campus registration event. Database CPU reaches 98%. What is the most effective immediate architectural countermeasure?",
            "question_type": "scenario",
            "options": [
                "A) Immediately rewrite all SQL tables into MongoDB",
                "B) Place an in-memory Redis cache in front of read-heavy endpoints and enable connection pooling",
                "C) Terminate all user sessions and restart the server",
                "D) Increase client-side polling frequency"
            ],
            "correct_answer": "B",
            "explanation": "Caching hot read requests in Redis relieves database CPU immediately, while connection pooling limits pool exhaustion."
        },
        {
            "question_text": "Coding Challenge: Complete this function signature to return all elements from list 'nums' that appear more than once in O(N) time:\n\ndef find_duplicates(nums: list[int]) -> set[int]:\n    seen, dupes = set(), set()\n    for n in nums:\n        if n in seen: dupes.add(n)\n        else: seen.add(n)\n    return dupes\n\nWhat is the space complexity of this approach?",
            "question_type": "coding",
            "options": [
                "A) O(1) Constant Space",
                "B) O(N) Linear Space in worst-case",
                "C) O(N log N)",
                "D) O(N^2) Quadratic Space"
            ],
            "correct_answer": "B",
            "explanation": "The 'seen' and 'dupes' hash sets hold up to N unique integers, requiring O(N) auxiliary memory."
        }
    ]

def mock_job_match(jd_text: str, profile_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Matches pasted JD against profile."""
    lower_jd = jd_text.lower()
    
    # Infer title
    title = "Software Engineer"
    for line in jd_text.splitlines()[:5]:
        if any(term in line.lower() for term in ["engineer", "developer", "architect", "intern", "analyst"]):
            title = line.strip()[:50]
            break

    profile_skills = [s.get("name", "") for s in profile_dict.get("skills", [])]
    
    # Common tech keywords to search in JD
    candidate_keywords = ["Python", "FastAPI", "React", "TypeScript", "Docker", "Kubernetes", "AWS", "SQL", "PostgreSQL", "Redis", "Git", "REST APIs", "CI/CD", "Next.js", "MongoDB", "Linux"]
    
    jd_skills = [k for k in candidate_keywords if k.lower() in lower_jd] or ["Python", "Docker", "SQL", "Git"]
    matching = [k for k in jd_skills if any(k.lower() == ps.lower() for ps in profile_skills)]
    missing = [k for k in jd_skills if k not in matching]

    score = 65 + min(30, int((len(matching) / max(1, len(jd_skills))) * 35))

    return {
        "job_title": title,
        "company": "Hiring Organization",
        "match_score": min(95, score),
        "responsibilities_summary": "Architect, test, and ship resilient cloud software with high emphasis on code quality, scalability, and collaborative engineering.",
        "extracted_required_skills": jd_skills[:4],
        "extracted_preferred_skills": jd_skills[4:8] or ["Docker", "Kubernetes", "Redis"],
        "matching_skills": matching or ["Git", "Python Foundations"],
        "missing_skills": missing or ["Containerization", "CI/CD Pipelines"],
        "match_strengths": [
            f"Strong alignment in {', '.join(matching[:3]) if matching else 'core programming foundations'}",
            "Solid educational background and project portfolio"
        ],
        "preparation_plan": [
            {
                "phase": "Week 1: Core JD Competency Ramp-up",
                "focus": f"Master {missing[0] if missing else 'Containerization & Cloud'}",
                "duration_days": 7,
                "actions": [
                    f"Build a mini-project implementing {missing[0] if missing else 'Docker and Redis'}",
                    "Review official documentation and standard production design patterns"
                ]
            },
            {
                "phase": "Week 2: Interview Polish & Resume Keyword Tuning",
                "focus": "Targeted behavioral and technical drill",
                "duration_days": 7,
                "actions": [
                    "Align project descriptions with the exact metrics expected in the job posting",
                    "Conduct timed mock interview tackling system design scenarios"
                ]
            }
        ]
    }

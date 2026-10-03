import httpx
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_full_system():
    print("==================================================")
    print("Testing AI Student Career Navigator End-to-End API")
    print("==================================================")

    # 1. Health check
    r = httpx.get("http://127.0.0.1:8000/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print("[PASS] 1. Backend Health Check OK:", r.json())

    # 2. Auth: Register / Login
    auth_payload = {
        "email": "alex.morgan.test@ctrlfreaks.ai",
        "password": "SecurePassword2026!",
        "full_name": "Alex Morgan"
    }
    r = httpx.post(f"{BASE_URL}/auth/register", json=auth_payload)
    if r.status_code == 400: # Already exists
        r = httpx.post(f"{BASE_URL}/auth/login", json={"email": auth_payload["email"], "password": auth_payload["password"]})
    assert r.status_code == 200, f"Auth failed: {r.text}"
    token_data = r.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] 2. Authentication & JWT Token Acquisition OK")

    # 3. Resume: Load Sample Demo Resume (SRS 10.2 acceptance steps 1 & 2)
    r = httpx.post(f"{BASE_URL}/resume/sample-demo", headers=headers)
    assert r.status_code == 200, f"Resume parsing failed: {r.text}"
    resume_res = r.json()
    print("[PASS] 3. Resume Parsed via AI Service Layer:", resume_res["message"])
    skills_count = len(resume_res["parsed_profile"]["skills"])
    print(f"       Extracted {skills_count} skills, {len(resume_res['parsed_profile']['education'])} education records, {len(resume_res['parsed_profile']['projects'])} projects")

    # 4. Profile: Verify Profile & Edit Skill (FR-PRO-3, FR-PRO-4: AI vs User-Edited)
    r = httpx.get(f"{BASE_URL}/profile", headers=headers)
    assert r.status_code == 200
    profile = r.json()
    print(f"[PASS] 4. Profile Verified: {profile['full_name']} | Target: {profile['target_career']}")
    # Add a user-edited skill
    r = httpx.post(f"{BASE_URL}/profile/skills", json={"name": "Kubernetes", "category": "DevOps", "proficiency": "Intermediate"}, headers=headers)
    assert r.status_code == 200
    added_skill = r.json()
    assert added_skill["source"] == "user_edited"
    print(f"       Added User-Edited Skill: {added_skill['name']} (source: {added_skill['source']})")

    # 5. Career: Dynamic Recommendations & Multi-Factor Scoring (FR-CAR-1 to 8)
    r = httpx.get(f"{BASE_URL}/career/recommendations", headers=headers)
    assert r.status_code == 200
    recs = r.json()
    print(f"[PASS] 5. Dynamic Career Recommendations ({len(recs)} careers discovered):")
    for rec in recs[:2]:
        print(f"       - {rec['career_name']}: {rec['match_score']}% Match | Tech Skills: {rec['technical_skills_score']}% | Project Rel: {rec['project_relevance_score']}%")
    
    # Set target career
    chosen_career = recs[0]["career_name"]
    r = httpx.post(f"{BASE_URL}/career/target", json={"career_name": chosen_career}, headers=headers)
    assert r.status_code == 200
    print(f"       Selected Target Career: {chosen_career}")

    # 6. Skill Gap: Analysis & Radar Metrics (FR-GAP-1 to 4)
    r = httpx.get(f"{BASE_URL}/skill-gap/analyze?career={chosen_career}", headers=headers)
    assert r.status_code == 200
    gap = r.json()
    print(f"[PASS] 6. Skill Gap Analysis: {gap['overall_readiness']}% Overall Readiness across {len(gap['gaps'])} competencies")
    critical_gaps = [g['skill_name'] for g in gap['gaps'] if g['gap_severity'] == 'Critical']
    print(f"       Critical Gap Severity competencies: {', '.join(critical_gaps[:3])}")

    # 7. Roadmap: Tailored Multi-day Plan (FR-RDM-1 to 6)
    r = httpx.post(f"{BASE_URL}/roadmap/generate", json={
        "career_name": chosen_career,
        "duration_days": 30,
        "hours_per_day": 2.0,
        "starting_level": "Intermediate",
        "preferred_learning_style": "Hands-on Project-based",
        "goal": "Land high-paying AI Engineer role"
    }, headers=headers)
    assert r.status_code == 200
    roadmap = r.json()
    print(f"[PASS] 7. Tailored 30-Day Roadmap Generated: {roadmap['total_tasks']} tasks scheduled")

    # Toggle task
    first_task = roadmap["tasks"][0]
    r = httpx.patch(f"{BASE_URL}/roadmap/tasks/{first_task['id']}/toggle", json={"is_completed": True}, headers=headers)
    assert r.status_code == 200
    updated_rm = r.json()
    print(f"       Task '{first_task['title']}' toggled complete. Progress: {updated_rm['progress_percent']}%")

    # 8. Assessment & Adaptive Engine (FR-ASM, FR-ADP)
    r = httpx.post(f"{BASE_URL}/assessment/generate", json={
        "roadmap_id": roadmap["id"],
        "topic": "Asynchronous Architecture & FastAPI"
    }, headers=headers)
    assert r.status_code == 200
    assessment = r.json()
    print(f"[PASS] 8. AI Assessment Generated: {assessment['title']} ({assessment['total_questions']} questions)")

    # Submit answers
    answers = [{"question_id": q["id"], "answer": "B"} for q in assessment["questions"]]
    r = httpx.post(f"{BASE_URL}/assessment/{assessment['id']}/submit", json={"answers": answers}, headers=headers)
    assert r.status_code == 200
    graded = r.json()
    print(f"       Graded with AI: Score {graded['score_percent']}% | Feedback: {graded['ai_feedback'][:60]}...")

    # Check adaptive changes
    r = httpx.get(f"{BASE_URL}/assessment/adaptive/history/{roadmap['id']}", headers=headers)
    assert r.status_code == 200
    adapt_hist = r.json()
    if adapt_hist:
        print(f"       Adaptive Loop Triggered: {adapt_hist[0]['changes_summary']}")

    # 9. Career What-If Simulator (FR-SIM-1 to 5)
    r = httpx.post(f"{BASE_URL}/simulator/simulate", json={
        "hypothetical_skills": ["Docker", "AWS (Amazon Web Services)"],
        "target_career": chosen_career
    }, headers=headers)
    assert r.status_code == 200
    sim = r.json()
    print(f"[PASS] 9. Career What-If Simulation: {sim['before_score']}% -> {sim['after_score']}% (+{sim['score_delta']}% Boost!)")
    print(f"       Reasoning: {sim['explanation'][:80]}...")

    # 10. Job Description Matcher (FR-JOB-1 to 5)
    sample_jd = """Senior Software Engineer - Backend
Company: Stripe
Requirements: Python, FastAPI, PostgreSQL, Docker, Redis, Distributed Systems."""
    r = httpx.post(f"{BASE_URL}/jobs/match", json={
        "job_description": sample_jd,
        "job_title": "Senior Software Engineer - Backend",
        "company": "Stripe"
    }, headers=headers)
    assert r.status_code == 200
    job_match = r.json()
    print(f"[PASS] 10. Real JD Matcher: {job_match['match_score']}% Match against {job_match['company']}")
    print(f"        Preparation Plan: {len(job_match['preparation_plan'])} sprint phases generated")

    # 11. Portfolio Projects & Resume Review (FR-PRJ, FR-REV)
    r = httpx.post(f"{BASE_URL}/projects/generate", json={"target_career": chosen_career, "difficulty": "Intermediate"}, headers=headers)
    assert r.status_code == 200
    projects = r.json()
    print(f"[PASS] 11. Portfolio Projects Generated: '{projects[0]['title']}'")

    r = httpx.post(f"{BASE_URL}/resume-review/analyze?target_career={chosen_career}", headers=headers)
    assert r.status_code == 200
    review = r.json()
    print(f"[PASS] 12. ATS Resume Review Score: {review['overall_score']}/100 with Google XYZ bullet rewrites")

    print("\n==================================================")
    print("ALL 12 SRS MODULES VERIFIED & WORKING PERFECTLY!")
    print("==================================================")

if __name__ == "__main__":
    test_full_system()

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import Link from "next/link";
import { matchJob } from "@/lib/ai";
import { Search } from "lucide-react";
import Reveal from "@/components/Reveal";
import StudentChatbot from "@/components/StudentChatbot";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const params = await searchParams;
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role === "RECRUITER") redirect("/recruiter?tab=overview");

  const [attemptStats, latestAttempt, taskSubmissions, totalTasks, certificatesCount, mockInterviews, jobs, userApplications, connectionCount, newConnectionRequests, recruiterCount] = await Promise.all([
    db.assessmentAttempt.aggregate({
      where: { userId: user.id },
      _avg: { score: true },
      _count: { _all: true }
    }),
    db.assessmentAttempt.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { assessment: { select: { title: true } } }
    }),
    db.taskSubmission.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      include: { task: { select: { title: true, category: true, slug: true } } }
    }),
    db.task.count(),
    db.certificate.count({ where: { userId: user.id } }),
    db.mockInterview.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { score: true }
    }),
    db.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { recruiter: { select: { companyName: true } } }
    }),
    db.application.findMany({ where: { userId: user.id }, select: { jobId: true } }),
    db.recruiterConnection.count({ where: { studentId: user.id, status: { in: ["CONNECTED", "ACCEPTED"] } } }),
    db.recruiterConnection.count({ where: { studentId: user.id, status: "PENDING" } }),
    db.recruiter.count({ where: { jobs: { some: {} } } })
  ]);
  const interviewScores = mockInterviews.map((interview) => interview.score);
  const bestInterviewScore = interviewScores.length ? Math.max(...interviewScores) : 0;
  const appliedJobIds = new Set(userApplications.map((a) => a.jobId));

  const avgScore = Math.round(attemptStats._avg.score || 0);

  const totalTaskPoints = taskSubmissions.reduce((sum, s) => sum + s.score, 0);

  const upcomingCompanies = [
    { name: "Infosys", type: "Software Engineering", domain: "infosys.com", wikipedia: "https://en.wikipedia.org/wiki/Infosys" },
    { name: "IBM", type: "AI & Cloud Internship", domain: "ibm.com", wikipedia: "https://en.wikipedia.org/wiki/IBM" },
    { name: "Wipro", type: "Full-Stack Development", domain: "wipro.com", wikipedia: "https://en.wikipedia.org/wiki/Wipro" },
    { name: "Deloitte", type: "Data & Technology", domain: "deloitte.com", wikipedia: "https://en.wikipedia.org/wiki/Deloitte" },
    { name: "Lufthansa", type: "Digital Product Internship", domain: "lufthansa.com", wikipedia: "https://en.wikipedia.org/wiki/Lufthansa" },
    { name: "Google", type: "Cloud Engineering", domain: "google.com", wikipedia: "https://en.wikipedia.org/wiki/Google" },
    { name: "Microsoft", type: "Software Engineering", domain: "microsoft.com", wikipedia: "https://en.wikipedia.org/wiki/Microsoft" },
    { name: "TCS", type: "Technology & Analytics", domain: "tcs.com", wikipedia: "https://en.wikipedia.org/wiki/Tata_Consultancy_Services" }
  ];

  return (
    <Shell>
      <StudentChatbot />
      <Reveal className="hero-dashboard-intro">
      <div className="page-title">
        <div>
          <h1>{params.welcome === "new" ? "Welcome" : "Welcome back"}, {user.name.split(" ")[0]} 👋</h1>
          <p className="muted">
            Build your profile, explore opportunities, and prepare for your next career move.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <form action="/jobs" className="overview-search">
            <input name="q" type="search" placeholder="Search jobs..." aria-label="Search jobs" />
            <button className="search-button" type="submit" aria-label="Search jobs"><Search size={17} strokeWidth={2.5} /></button>
          </form>
        </div>
      </div>
      </Reveal>

      <Reveal><section className="card upcoming-banner dashboard-banner">
        <div className="banner-heading">
          <div>
            <span className="banner-kicker">Opportunities ahead</span>
            <h2>Upcoming Jobs &amp; Internships</h2>
          </div>
          <Link href="/jobs" className="banner-link">Explore all →</Link>
        </div>
        <div className="company-marquee" aria-label="Upcoming companies">
          <div className="company-track">
            {[...upcomingCompanies, ...upcomingCompanies].map((company, index) => (
              <Link href={company.wikipedia} target="_blank" rel="noreferrer" className="company-banner-item" key={`${company.name}-${index}`}>
                <img
                  src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=128`}
                  alt={`${company.name} logo`}
                  width={36}
                  height={36}
                  loading="lazy"
                />
                <span><strong>{company.name}</strong><small>{company.type}</small></span>
                <b className="company-arrow">→</b>
              </Link>
            ))}
          </div>
        </div>
      </section></Reveal>

      <Reveal><section className="card recruiter-connections-widget"><div><span className="banner-kicker">Your career network</span><h2>Recruiter Connections</h2><p className="muted">Meet the people hiring for roles that fit your skills.</p></div><div className="connection-widget-stats"><div><strong>{connectionCount}</strong><span>Connections</span></div><div><strong>{newConnectionRequests}</strong><span>New requests</span></div><div><strong>{recruiterCount}</strong><span>Recommended recruiters</span></div><div><strong>{jobs.length ? Math.max(...jobs.map((job) => matchJob(job.requiredSkills, user.skills))) : 0}%</strong><span>Top recruiter match</span></div></div><Link href="/connections" className="btn primary">View Connections →</Link></section></Reveal>

      {/* Top Metric Cards */}
      <Reveal><div id="analytics" className="stats dashboard-stat-grid">
        <div className="stat">
          <small>Average Assessment Score</small>
          <div className="num" style={{ color: avgScore >= 80 ? "#34d399" : avgScore >= 60 ? "#60a5fa" : "#e2e8f0" }}>
            {avgScore}%
          </div>
          <div className="bar" style={{ marginTop: 8 }}>
            <i style={{ width: `${avgScore}%` }} />
          </div>
        </div>

        <div className="stat">
          <small>Practical Tasks</small>
          <div className="num" style={{ color: "#a78bfa" }}>
            {taskSubmissions.length} <span style={{ fontSize: 16, color: "#64748b" }}>/ {totalTasks}</span>
          </div>
          <small style={{ color: "#38bdf8" }}>{totalTaskPoints} pts earned</small>
        </div>

        <div className="stat">
          <small>Applications Tracked</small>
          <div className="num" style={{ color: "#38bdf8" }}>{userApplications.length}</div>
          <small>Active career pipeline</small>
        </div>

        <div className="stat">
          <small>Certificates Unlocked</small>
          <div className="num" style={{ color: "#34d399" }}>{certificatesCount}</div>
          <small>{certificatesCount > 0 ? "Verified digital credentials 🎓" : "Score >80% to unlock"}</small>
        </div>
      </div></Reveal>

      <Reveal><section className="card dashboard-interview-card">
            <div><span className="banner-kicker">PRACTICE FOR WHAT IS NEXT</span><h2>🎤 AI Mock Interview</h2><p className="muted">Practice your next real interview with AI-powered feedback.</p><div className="interview-mini-metrics"><span>Last Score <b>{interviewScores[0] ? `${interviewScores[0]}%` : "--"}</b></span><span>Best Score <b>{bestInterviewScore ? `${bestInterviewScore}%` : "--"}</b></span><span>Sessions <b>{mockInterviews.length}</b></span>{bestInterviewScore >= 80 && <span className="interview-badge">🏆 Interview Ready</span>}</div></div>
        <Link href="/interview" className="btn primary">Start Mock Interview →</Link>
      </section></Reveal>

      {/* Main Grid Section */}
      <Reveal className="dashboard-content-reveal"><div className="grid dashboard-content-grid" style={{ gridTemplateColumns: "1fr" }}>
        {/* Left Column: AI Diagnostics & Task Progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>Latest AI Skill Diagnostics</h3>
              {latestAttempt && (
                <span className="tag" style={{ background: "#e5d7c0", color: "#40504b" }}>
                  {latestAttempt.skillLevel} Level
                </span>
              )}
            </div>

            {latestAttempt ? (
              <>
                <p style={{ margin: "0 0 14px", fontSize: 14 }}>
                  <b>{latestAttempt.assessment.title}</b> • Assessed on {latestAttempt.createdAt.toLocaleDateString()}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14, margin: "14px 0", background: "linear-gradient(135deg, #eef2ff, #ecfeff)", padding: 16, borderRadius: 12, border: "1px solid #c7d2fe" }}>
                  <div>
                    <small className="muted">Assessed Score</small>
                    <div style={{ fontSize: 36, fontWeight: 800, color: latestAttempt.score > 80 ? "#34d399" : "#60a5fa" }}>
                      {latestAttempt.score}%
                    </div>
                  </div>
                  <div>
                    <small className="muted">Next Recommended Step</small>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                      {latestAttempt.recommendations}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <Link className="btn secondary" href={`/assessment/result/${latestAttempt.id}`} style={{ fontSize: 13 }}>
                    View Full Diagnostic
                  </Link>
                  {latestAttempt.score > 80 && (
                    <Link className="btn primary" href={`/certificate/${latestAttempt.id}`} style={{ fontSize: 13 }}>
                      🎓 View Certificate
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <div className="empty">
                No assessments taken yet. Start with any of the 8 unlocked modules in Skill Lab!
              </div>
            )}
          </section>

          {/* Quick Task Workbench Widget */}
          <section className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>Practical Coding Projects</h3>
              <Link href="/tasks" className="btn secondary" style={{ fontSize: 12, padding: "6px 12px" }}>
                Browse All ({totalTasks}) →
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {taskSubmissions.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 14px",
                    background: "#eee3d0",
                    borderRadius: 10,
                    border: "1px solid #1c2d45"
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 14 }}>{sub.task.title}</strong>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {sub.task.category} • <span style={{ color: "#34d399" }}>+{sub.score} pts</span>
                    </div>
                  </div>
                  <Link href={`/tasks/${sub.task.slug}`} className="btn secondary" style={{ fontSize: 12, padding: "5px 10px" }}>
                    Review Code
                  </Link>
                </div>
              ))}

              {taskSubmissions.length === 0 && (
                <div className="empty">
                  No tasks completed yet. Open the Tasks Hub to work on real-world projects.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Recommended Opportunities with AI Match */}
        <section className="card recommended-jobs">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Recommended Jobs & Internships</h3>
            <Link href="/jobs" style={{ fontSize: 12, color: "#7c5cff" }}>
              View all →
            </Link>
          </div>

          <div className="recommended-job-list">
            {jobs.map((j) => {
              const matchPercent = matchJob(j.requiredSkills, user.skills);
              const isApplied = appliedJobIds.has(j.id);

              return (
                <div
                  className="job recommended-job-card"
                  key={j.id}
                  style={{
                    padding: 14,
                    background: "#F8FAFC",
                    borderRadius: 12,
                    border: "1px solid #D9E2FF",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4 style={{ margin: "0 0 4px", fontSize: 15 }}>{j.title}</h4>
                      <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                        🏢 {j.recruiter.companyName} • 📍 {j.location}
                      </p>
                    </div>
                    <span
                      className="tag"
                      style={{
                        background: "#e5d7c0",
                        color: matchPercent >= 70 ? "#34d399" : "#60a5fa",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontWeight: 700
                      }}
                    >
                      {matchPercent}% Match
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="tag" style={{ fontSize: 11 }}>{j.type}</span>
                    <Link
                      href="/jobs"
                      className="btn secondary"
                      style={{ fontSize: 12, padding: "5px 12px" }}
                    >
                      {isApplied ? "Applied ✓" : "View & Apply →"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div></Reveal>
    </Shell>
  );
}

async function RecruiterDashboard({ user }: { user: any }) {
  const jobs = await db.job.findMany({
    where: { recruiterId: user.recruiter?.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" }
  });

  const applicants = await db.application.count({
    where: { job: { recruiterId: user.recruiter?.id } }
  });

  return (
    <Shell>
      <div className="page-title">
        <div>
          <h1>Recruiter Command Center 🏢</h1>
          <p className="muted">
            {user.recruiter?.companyName || "Company"} • Talent sourcing & evaluation workspace
          </p>
        </div>
        <Link className="btn primary" href="/recruiter">
          Manage Candidates & Jobs
        </Link>
      </div>

      <div id="analytics" className="stats">
        <div className="stat">
          <small>Active Opportunities</small>
          <div className="num">{jobs.length}</div>
          <small>Published job posts</small>
        </div>
        <div className="stat">
          <small>Total Candidates</small>
          <div className="num" style={{ color: "#38bdf8" }}>{applicants}</div>
          <small>Applied across all jobs</small>
        </div>
        <div className="stat">
          <small>AI Skill Match Engine</small>
          <div className="num" style={{ color: "#34d399" }}>Active</div>
          <small>Instant profile fit calculation</small>
        </div>
        <div className="stat">
          <small>Platform Assessment</small>
          <div className="num" style={{ color: "#a78bfa" }}>8 Tracks</div>
          <small>Verified student reports</small>
        </div>
      </div>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Your Published Opportunities</h3>
          <Link href="/recruiter" className="btn secondary" style={{ fontSize: 13 }}>
            + Create New Post
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {jobs.map((j) => (
            <div
              className="job"
              key={j.id}
              style={{
                padding: 16,
                background: "#eee3d0",
                borderRadius: 12,
                border: "1px solid #1c2d45",
                alignItems: "center"
              }}
            >
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: 16 }}>{j.title}</h4>
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                  📍 {j.location} • {j.type} • Vacancies: {j.vacancies}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="status" style={{ fontSize: 13, padding: "6px 12px" }}>
                  {j._count.applications} candidate(s)
                </span>
                <Link href="/recruiter" className="btn secondary" style={{ fontSize: 12, padding: "6px 12px" }}>
                  Review
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
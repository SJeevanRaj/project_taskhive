import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import Link from "next/link";
import FeedbackForm from "../FeedbackForm";

export default async function Result({ params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!u) redirect("/login");

  const { id } = await params;
  const a = await db.assessmentAttempt.findFirst({
    where: { id, userId: u.id },
    include: { assessment: true }
  });

  if (!a) redirect("/assessment");

  const passedThreshold = a.score > 80;
  const recommendedJobs = passedThreshold
    ? await db.job.findMany({ include: { recruiter: true }, orderBy: { createdAt: "desc" }, take: 4 })
    : [];

  return (
    <Shell>
      <div className="page-title">
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <span className="tag">{a.assessment.subject}</span>
            <span className="tag">{a.assessment.semester}</span>
          </div>
          <h1>AI Skill Diagnostics & Report ✦</h1>
          <p className="muted">{a.assessment.title} • Completed on {a.createdAt.toLocaleDateString()}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href={`/assessment/${a.assessmentId}`} className="btn secondary">Retake Test</Link>
          <Link href="/assessment" className="btn primary">Skill Lab Modules</Link>
        </div>
      </div>

      <div className="grid">
        <section className="card" style={{ textAlign: "center", padding: "35px 25px" }}>
          <small className="muted" style={{ textTransform: "uppercase", letterSpacing: 1.5 }}>Assessed Proficiency</small>
          <div className="num" style={{ fontSize: 72, margin: "14px 0", color: passedThreshold ? "#34d399" : a.score >= 60 ? "#60a5fa" : "#fbbf24" }}>
            {a.score}%
          </div>
          <span className="tag" style={{
            fontSize: 14,
            padding: "8px 18px",
            borderRadius: 99,
            background: "#e5d7c0",
            color: a.skillLevel === "Advanced" ? "#34d399" : a.skillLevel === "Intermediate" ? "#60a5fa" : "#fbbf24",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            {a.skillLevel} Level
          </span>

          <div style={{ margin: "24px 0 10px", textAlign: "left", background: "linear-gradient(135deg, var(--soft-indigo), var(--soft-cyan))", padding: 18, borderRadius: 12, border: "1px solid #C7D2FE" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
              <span className="muted">Total Questions Assessed</span>
              <strong>{a.total}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
              <span className="muted">Correct Answers</span>
              <strong style={{ color: "#34d399" }}>{Math.round((a.score / 100) * a.total)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span className="muted">Certificate Eligibility</span>
              <strong style={{ color: passedThreshold ? "#34d399" : "#f87171" }}>
                {passedThreshold ? "Unlocked (Score > 80%)" : "Requires >80%"}
              </strong>
            </div>
          </div>
        </section>

        <section className="card">
          <h3>AI Skill Breakdown & Insights</h3>
          
          <div style={{ marginBottom: 18 }}>
            <strong style={{ color: "#34d399", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              ✓ Identified Strengths
            </strong>
            <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>{a.strengths}</p>
          </div>

          <div style={{ marginBottom: 18 }}>
            <strong style={{ color: "#f87171", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              ⚠ Areas for Improvement
            </strong>
            <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>{a.weaknesses}</p>
          </div>

          <div style={{ marginBottom: 24, padding: "14px", background: "linear-gradient(135deg, var(--soft-indigo), var(--soft-cyan))", borderRadius: 12, border: "1px solid #C7D2FE" }}>
            <strong style={{ color: "#a78bfa", display: "block", marginBottom: 4 }}>
              ✦ AI Recommendation
            </strong>
            <p style={{ margin: 0, fontSize: 14, color: "#e2e8f0", lineHeight: 1.6 }}>{a.recommendations}</p>
          </div>

          {passedThreshold ? (
            <div className="success" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <strong>🎓 Achievement Certificate Unlocked!</strong>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#a6f2df" }}>
                  Your score qualified you for the verified HireLytix digital credential.
                </p>
              </div>
              <Link href={`/certificate/${a.id}`} className="btn primary" style={{ padding: "10px 18px", fontSize: 13 }}>
                View & Print Certificate 📜
              </Link>
            </div>
          ) : (
            <div className="card" style={{ background: "linear-gradient(135deg, var(--soft-indigo), var(--soft-cyan))", borderColor: "#C7D2FE", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <strong style={{ color: "#94a3b8" }}>🔒 Certificate Locked</strong>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                  Earn a score above 80% to generate your achievement certificate.
                </p>
              </div>
              <Link href={`/assessment/${a.assessmentId}`} className="btn secondary" style={{ fontSize: 13 }}>
                Retake to Unlock
              </Link>
            </div>
          )}
        </section>
      </div>

      {passedThreshold && (
        <section className="card result-jobs">
          <div className="page-title" style={{ marginBottom: 12 }}>
            <div><h2 style={{ margin: 0 }}>Recommended Jobs &amp; Internships</h2><p className="muted">Matched to your passing {a.assessment.subject} assessment.</p></div>
            <Link href="/jobs" className="btn secondary">Explore all jobs</Link>
          </div>
          <div className="result-job-grid">
            {recommendedJobs.map((job) => <Link href="/jobs" className="result-job" key={job.id}><strong>{job.title}</strong><span>{job.recruiter.companyName} • {job.location}</span><b>{job.type} →</b></Link>)}
          </div>
        </section>
      )}
      <FeedbackForm attemptId={a.id} />
    </Shell>
  );
}

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import InterviewClient from "./client";
import Link from "next/link";

export default async function InterviewHome({ searchParams }: { searchParams: Promise<{ role?: string; job?: string }> }) {
  const params = await searchParams;
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") redirect("/login/student");
  const interviews = await db.mockInterview.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, role: true, interviewType: true, difficulty: true, score: true, createdAt: true }
  });
  const scores = interviews.map((item) => item.score);
  const lastScore = scores[0] || 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;
  const improvement = scores.length > 1 ? Math.max(0, lastScore - scores[scores.length - 1]) : 0;

  return <Shell>
    <div className="page-title interview-page-title">
      <div><span className="banner-kicker">AI CAREER COACH</span><h1>AI Mock Interview</h1><p className="muted">Practice real interview scenarios, improve your answers, and get AI-powered feedback.</p></div>
      <div className="interview-actions"><Link href="#history" className="btn secondary">View Interview History</Link><Link href="/dashboard" className="btn secondary">Back to Dashboard</Link></div>
    </div>
    <div className="interview-stats">
      <div className="stat"><small>Last Interview Score</small><div className="num interview-indigo">{lastScore ? `${lastScore}%` : "--"}</div><small>{lastScore ? "Latest completed session" : "Start your first session"}</small></div>
      <div className="stat"><small>Best Score</small><div className="num interview-cyan">{bestScore ? `${bestScore}%` : "--"}</div><small>{bestScore ? "Personal best" : "Build your benchmark"}</small></div>
      <div className="stat"><small>Total Interviews</small><div className="num">{interviews.length}</div><small>Completed sessions</small></div>
      <div className="stat"><small>Improvement</small><div className="num interview-success">{improvement ? `+${improvement}%` : "--"}</div><small>Compared with your first session</small></div>
    </div>
    <section className="interview-hero card">
      <div><span className="interview-icon">✦</span><h2>Ready for your next conversation?</h2><p className="muted">Choose a role, set the difficulty, and practice with a supportive AI interviewer that gives actionable feedback after every answer.</p><Link href={`/interview?role=${encodeURIComponent(params.role || "")}${params.job ? `&job=${encodeURIComponent(params.job)}` : ""}#setup`} className="btn primary">Start Mock Interview →</Link></div>
      <div className="interview-hero-art"><div className="art-ring"><span>AI</span></div><small>Learn → Practice → Improve</small></div>
    </section>
    <InterviewClient initialRole={params.role || ""} />
    <section id="history" className="card interview-history"><div className="section-heading"><div><h2>Interview History</h2><p className="muted">Review your progress and revisit every completed session.</p></div><span className="tag">{interviews.length} sessions</span></div>
      {interviews.length ? <div className="history-list">{interviews.map((item) => <Link href={`/interview/${item.id}`} className="history-row" key={item.id}><span><strong>{item.role}</strong><small>{item.interviewType} • {item.difficulty}</small></span><b>{item.score}%</b><small>{item.createdAt.toLocaleDateString()}</small><span className="status">Completed</span></Link>)}</div> : <div className="empty">No interviews yet. Start your first mock interview above.</div>}
    </section>
  </Shell>;
}

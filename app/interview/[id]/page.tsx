import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Shell from "@/components/Shell";

export default async function InterviewReport({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") redirect("/login/student");
  const { id } = await params;
  const interview = await db.mockInterview.findFirst({ where: { id, userId: user.id } });
  if (!interview) notFound();
  const feedback = JSON.parse(interview.feedback);
  const questions = JSON.parse(interview.questions);
  const answers = JSON.parse(interview.answers);
  const questionById = new Map(questions.map((question: any) => [question.id, question]));
  const passed = interview.score >= 80;
  const metrics = ["technicalAccuracy", "relevance", "communication", "confidence", "answerQuality"] as const;
  const labels = { technicalAccuracy: "Technical Knowledge", relevance: "Relevance", communication: "Communication", confidence: "Confidence", answerQuality: "Problem Solving" };

  return <Shell><div className="page-title"><div><span className="banner-kicker">SESSION REPORT</span><h1>🎉 Interview Complete</h1><p className="muted">{interview.role} • {interview.interviewType} • {interview.createdAt.toLocaleDateString()}</p></div><div className="interview-actions"><Link href="/interview" className="btn secondary">Try Again</Link><Link href="/dashboard" className="btn primary">Back to Dashboard</Link></div></div>
    <div className="report-layout"><section className="card overall-report"><span className="muted">Overall Score</span><div className="score-visual"><div className="score-circle" style={{ background: `conic-gradient(var(--cyan) ${interview.score * 3.6}deg, #E0E7FF 0)` }}><span>{interview.score}<small>/100</small></span></div></div>{passed && <span className="interview-badge">🏆 Interview Ready</span>}<p className="muted">{passed ? "You are showing strong interview readiness." : "Keep practicing and review the guidance below."}</p></section>
      <section className="card"><h2>Performance Breakdown</h2><div className="metric-list">{metrics.map((metric) => { const value = answers.reduce((sum: number, item: any) => sum + item.evaluation[metric], 0) / (answers.length || 1); return <div className="metric-row" key={metric}><span>{labels[metric]}</span><b>{Math.round(value)}%</b><i><u style={{ width: `${value}%` }} /></i></div>; })}</div><div className="report-columns"><div><h3>Your Strengths</h3>{feedback.strengths.map((item: string) => <p className="success-line" key={item}>✓ {item}</p>)}</div><div><h3>Areas to Improve</h3>{feedback.improvements.map((item: string) => <p className="warning-line" key={item}>• {item}</p>)}</div></div><div className="tip-box"><strong>Recommended Practice</strong><p>{feedback.practice}</p></div></section></div>
    <section className="card review-section"><div className="section-heading"><div><h2>Review Answers</h2><p className="muted">Question-by-question AI feedback from this session.</p></div><Link href="/interview" className="btn secondary">New Interview</Link></div>{answers.map((item: any, index: number) => <article className="answer-review" key={item.questionId}><div><span className="tag">Question {index + 1}</span><h3>{(questionById.get(item.questionId) as any)?.prompt || item.questionId}</h3><p><strong>Your answer:</strong> {item.answer || "No answer provided"}</p></div><div><b className="review-score">{item.evaluation.answerQuality}%</b><p className="muted">{item.evaluation.feedback}</p><small className="muted">Tip: {item.evaluation.tip}</small></div></article>)}</section>
  </Shell>;
}

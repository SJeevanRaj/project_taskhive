import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import AssessmentLabClient from "./client";
import Link from "next/link";
import { requireStudentSubscription, isPro, getRemainingTests } from "@/lib/subscription";

export default async function AssessmentPage({ searchParams }: { searchParams: Promise<{ lockedUntil?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const params = await searchParams;
  const lockedUntil = params.lockedUntil && new Date(params.lockedUntil) > new Date() ? new Date(params.lockedUntil) : null;
  const { subscription } = await requireStudentSubscription();
  const remainingTests = await getRemainingTests(user.id, subscription);

  const assessments = await db.assessment.findMany({
    include: {
      _count: { select: { questions: true } }
    },
    orderBy: { course: "asc" }
  });

  const attempts = await db.assessmentAttempt.findMany({
    where: { userId: user.id },
    include: { assessment: true, certificate: true },
    orderBy: { createdAt: "desc" }
  });

  // Calculate best score per assessment
  const bestScoreMap = new Map<string, { score: number; skillLevel: string; cert: boolean }>();
  for (const att of attempts) {
    const existing = bestScoreMap.get(att.assessmentId);
    if (!existing || att.score > existing.score) {
      bestScoreMap.set(att.assessmentId, {
        score: att.score,
        skillLevel: att.skillLevel,
        cert: !!att.certificate || att.score > 80
      });
    }
  }

  const formattedAssessments = assessments.map((a) => {
    const best = bestScoreMap.get(a.id);
    return {
      id: a.id,
      title: a.title,
      education: a.education,
      course: a.course,
      semester: a.semester,
      subject: a.subject,
      questionCount: a._count.questions,
      bestScore: best?.score,
      skillLevel: best?.skillLevel,
      hasCertificate: best?.cert
    };
  });

  return (
    <Shell>
      <div className="page-title">
        <div>
          <h1>Skill Lab & Assessments 🧠</h1>
          <p className="muted">
            {isPro(subscription) ? "Unlimited skill tests, complete history, and advanced analytics." : `Basic includes ${remainingTests} remaining skill test${remainingTests === 1 ? "" : "s"}.`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/tasks" className="btn secondary">
            ⚡ Practical Tasks
          </Link>
          <Link href="/leaderboard" className="btn primary">
            🏆 Campus Leaderboard
          </Link>
        </div>
      </div>
      {lockedUntil && <div className="assessment-lock-banner"><strong>⚠ This assessment is temporarily locked.</strong><span>Available again on {lockedUntil.toLocaleString()}.</span></div>}

      <AssessmentLabClient
        assessments={formattedAssessments}
        recentAttempts={attempts.slice(0, 6)}
      />
    </Shell>
  );
}
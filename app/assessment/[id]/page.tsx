import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import AssessmentClient from "./client";
import { randomInt } from "crypto";
import { requireStudentSubscription, isPro, BASIC_TEST_LIMIT } from "@/lib/subscription";

const TEST_QUESTION_COUNT = 15;

export default async function Test({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const lock = await db.assessmentLock.findUnique({ where: { userId_assessmentId: { userId: user.id, assessmentId: id } } });
  if (lock && lock.lockedUntil > new Date()) redirect(`/assessment?lockedUntil=${encodeURIComponent(lock.lockedUntil.toISOString())}`);
  const { subscription } = await requireStudentSubscription();
  if (!isPro(subscription)) {
    const reservation = await db.subscription.updateMany({
      where: { userId: user.id, plan: "BASIC", status: "ACTIVE", testsUsed: { lt: BASIC_TEST_LIMIT } },
      data: { testsUsed: { increment: 1 } }
    });
    if (reservation.count !== 1) redirect("/subscription?error=Basic%20includes%20two%20skill%20tests.%20Upgrade%20to%20Pro%20for%20unlimited%20tests.");
  }
  
  const a = await db.assessment.findUnique({
    where: { id },
    include: { questions: true }
  });

  if (!a) redirect("/assessment");

  const randomizedQuestions = [...a.questions];
  for (let i = randomizedQuestions.length - 1; i > 0; i--) {
    const swapIndex = randomInt(i + 1);
    [randomizedQuestions[i], randomizedQuestions[swapIndex]] = [randomizedQuestions[swapIndex], randomizedQuestions[i]];
  }
  const testQuestions = randomizedQuestions.slice(0, TEST_QUESTION_COUNT);

  const session = await db.assessmentSession.create({
    data: {
      userId: user.id,
      assessmentId: a.id,
      questionIds: JSON.stringify(testQuestions.map((question) => question.id)),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
    }
  });

  return (
    <Shell>
      <AssessmentClient
        sessionId={session.id}
        assessment={{
          id: a.id,
          title: a.title,
          subject: a.subject,
          course: a.course,
          semester: a.semester,
          questions: testQuestions.map((q) => ({
            id: q.id,
            text: q.text,
            options: JSON.parse(q.options),
            topic: q.topic,
            difficulty: q.difficulty,
            marks: q.marks
          }))
        }}
      />
    </Shell>
  );
}
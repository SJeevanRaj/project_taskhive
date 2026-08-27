import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyzeSkill } from "@/lib/ai";
import { getStudentSubscription, isPro, BASIC_TEST_LIMIT } from "@/lib/subscription";

const allowedFlags = new Set([
  "SCREENSHOT_ATTEMPT",
  "COPY_ATTEMPT",
  "TAB_SWITCH",
  "WINDOW_BLUR",
  "FULLSCREEN_EXIT",
  "NO_FACE",
  "LOOKING_AWAY",
  "MULTIPLE_FACES",
  "CAMERA_STOPPED"
]);

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") return NextResponse.json({ error: "Students only" }, { status: 403 });
  const subscription = await getStudentSubscription(user.id);
  if (!subscription) return NextResponse.json({ error: "Choose a subscription before taking assessments" }, { status: 403 });

  const body = await req.json();
  if (typeof body.sessionId !== "string") return NextResponse.json({ error: "Invalid assessment session" }, { status: 400 });

  const session = await db.assessmentSession.findFirst({
    where: { id: body.sessionId, userId: user.id },
    include: { assessment: true, attempt: true }
  });
  if (!session || session.expiresAt <= new Date()) return NextResponse.json({ error: "Assessment session expired" }, { status: 400 });
  if (session.attempt) return NextResponse.json(session.attempt);
  if (session.terminatedAt) return NextResponse.json({ error: "This assessment was terminated" }, { status: 409 });
  if (!isPro(subscription) && await db.assessmentAttempt.count({ where: { userId: user.id } }) >= BASIC_TEST_LIMIT) {
    return NextResponse.json({ error: "Basic plan allows two skill tests. Upgrade to Pro for unlimited tests." }, { status: 403 });
  }

  let questionIds: string[];
  try {
    questionIds = JSON.parse(session.questionIds);
  } catch {
    return NextResponse.json({ error: "Invalid assessment session" }, { status: 400 });
  }
  if (!Array.isArray(questionIds) || questionIds.length === 0 || questionIds.some((id) => typeof id !== "string") || new Set(questionIds).size !== questionIds.length) {
    return NextResponse.json({ error: "Invalid assessment question set" }, { status: 400 });
  }

  const claimed = await db.assessmentSession.updateMany({
    where: { id: session.id, userId: user.id, submittedAt: null },
    data: { submittedAt: new Date() }
  });
  if (claimed.count !== 1) return NextResponse.json({ error: "Assessment has already been submitted" }, { status: 409 });

  const questions = await db.question.findMany({ where: { id: { in: questionIds }, assessmentId: session.assessmentId } });
  if (questions.length !== questionIds.length) return NextResponse.json({ error: "Assessment questions are no longer available" }, { status: 400 });

  const answers = body.answers && typeof body.answers === "object" ? body.answers : {};
  const safeAnswers: Record<string, number> = {};
  const results = questionIds.map((questionId) => {
    const question = questions.find((item) => item.id === questionId)!;
    const options = JSON.parse(question.options);
    const answer = Number(answers[questionId]);
    if (Number.isInteger(answer) && answer >= 0 && answer < options.length) safeAnswers[questionId] = answer;
    return { topic: question.topic, correct: answer === question.correctIndex };
  });
  const analysis = analyzeSkill(results);
  const cheatingFlags = session.firstFlag && allowedFlags.has(session.firstFlag) ? [session.firstFlag] : [];

  const attempt = await db.assessmentAttempt.create({
    data: {
      userId: user.id,
      assessmentId: session.assessmentId,
      answers: JSON.stringify(safeAnswers),
      score: analysis.score,
      total: questions.length,
      skillLevel: analysis.skillLevel,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      recommendations: analysis.recommendations,
      cheatingFlags: JSON.stringify(cheatingFlags)
      ,sessionId: session.id
    }
  });

  if (analysis.score > 80) {
    await db.certificate.create({
      data: {
        userId: user.id,
        attemptId: attempt.id,
        certificateNo: `TH-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
        score: attempt.score,
        skillLevel: attempt.skillLevel
      }
    });
  }
  return NextResponse.json(attempt);
}

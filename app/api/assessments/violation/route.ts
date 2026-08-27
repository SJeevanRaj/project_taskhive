import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const allowedFlags = new Set(["SCREENSHOT_ATTEMPT", "COPY_ATTEMPT", "TAB_SWITCH", "WINDOW_BLUR", "FULLSCREEN_EXIT", "NO_FACE", "LOOKING_AWAY", "MULTIPLE_FACES", "CAMERA_STOPPED"]);

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") return NextResponse.json({ error: "Students only" }, { status: 403 });
  const body = await req.json();
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const flag = typeof body.flag === "string" && allowedFlags.has(body.flag) ? body.flag : "";
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 240) : "Suspicious exam activity detected.";
  if (!sessionId || !flag) return NextResponse.json({ error: "Invalid violation" }, { status: 400 });
  const session = await db.assessmentSession.findFirst({ where: { id: sessionId, userId: user.id } });
  if (!session) return NextResponse.json({ error: "Assessment session not found" }, { status: 404 });
  if (session.terminatedAt || session.submittedAt) return NextResponse.json({ status: "TERMINATED", flagCount: session.flagCount, reason: session.terminationReason });

  const first = await db.assessmentSession.updateMany({ where: { id: session.id, userId: user.id, submittedAt: null, terminatedAt: null, flagCount: 0 }, data: { flagCount: 1, firstFlag: flag } });
  if (first.count === 1) return NextResponse.json({ status: "WARNING", flagCount: 1, flag, reason });

  const now = new Date();
  const lockedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const second = await db.assessmentSession.updateMany({ where: { id: session.id, userId: user.id, submittedAt: null, terminatedAt: null, flagCount: 1 }, data: { flagCount: 2, submittedAt: now, terminatedAt: now, terminationReason: reason } });
  if (second.count !== 1) return NextResponse.json({ status: "TERMINATED", flagCount: 2, reason: "Multiple violations detected." });

  await db.assessmentLock.upsert({ where: { userId_assessmentId: { userId: user.id, assessmentId: session.assessmentId } }, update: { lockedUntil, reason: "Multiple proctoring violations" }, create: { userId: user.id, assessmentId: session.assessmentId, lockedUntil, reason: "Multiple proctoring violations" } });
  const questions = await db.question.findMany({ where: { assessmentId: session.assessmentId } });
  const attempt = await db.assessmentAttempt.create({ data: { userId: user.id, assessmentId: session.assessmentId, sessionId: session.id, answers: "{}", score: 0, total: questions.length, skillLevel: "Terminated", strengths: "", weaknesses: "", recommendations: "This attempt was terminated after multiple proctoring violations.", cheatingFlags: JSON.stringify([session.firstFlag, flag]), status: "TERMINATED", terminationReason: reason, terminatedAt: now } });
  return NextResponse.json({ status: "TERMINATED", flagCount: 2, reason, lockedUntil: lockedUntil.toISOString(), attemptId: attempt.id });
}
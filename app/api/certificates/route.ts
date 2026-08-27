import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Students only" }, { status: 403 });
  }

  const { attemptId } = await req.json();
  const attempt = await db.assessmentAttempt.findFirst({
    where: { id: attemptId, userId: user.id },
    include: { assessment: true }
  });

  if (!attempt) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  if (attempt.score <= 80) {
    return NextResponse.json(
      { error: "Certificate unlocks only when the score is above 80%." },
      { status: 400 }
    );
  }

  const existing = await db.certificate.findUnique({ where: { attemptId } });
  if (existing) return NextResponse.json(existing);

  const certificate = await db.certificate.create({
    data: {
      userId: user.id,
      attemptId,
      certificateNo: `TH-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
      score: attempt.score,
      skillLevel: attempt.skillLevel
    }
  });

  return NextResponse.json(certificate);
}

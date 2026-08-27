import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") return NextResponse.json({ error: "Students only" }, { status: 403 });
  const body = await req.json();
  const attemptId = typeof body.attemptId === "string" ? body.attemptId : "";
  const rating = Number(body.rating);
  const feedback = typeof body.feedback === "string" ? body.feedback.trim().slice(0, 1000) : "";
  const attempt = await db.assessmentAttempt.findFirst({ where: { id: attemptId, userId: user.id } });
  if (!attempt || !Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "Invalid assessment feedback" }, { status: 400 });
  const result = await db.assessmentFeedback.upsert({ where: { attemptId }, update: { rating, feedback }, create: { userId: user.id, attemptId, rating, feedback } });
  return NextResponse.json({ ok: true, feedback: result });
}
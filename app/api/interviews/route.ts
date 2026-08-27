import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { evaluateAnswer, overallInterviewScore, questionsForRole } from "@/lib/interview";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") return NextResponse.json({ error: "Students only" }, { status: 403 });

  const body = await request.json();
  const role = String(body.role || "Full Stack Developer");
  const difficulty = String(body.difficulty || "Intermediate");
  const interviewType = String(body.interviewType || "Mixed");
  const duration = Number(body.duration) || 20;
  const questions = questionsForRole(role);
  const rawAnswers = body.answers && typeof body.answers === "object" ? body.answers : {};
  const answerRecords = questions.map((question) => ({
    questionId: question.id,
    answer: String(rawAnswers[question.id] || "").trim(),
    evaluation: evaluateAnswer(question, String(rawAnswers[question.id] || ""))
  }));
  const score = overallInterviewScore(answerRecords.map((record) => record.evaluation));
  const feedback = {
    score,
    strengths: score >= 80 ? ["Good technical understanding", "Relevant and structured answers", "Clear communication"] : ["You attempted every interview area", "Your answers show a useful foundation"],
    improvements: score >= 80 ? ["Add measurable outcomes", "Use more practical examples", "Make key points more concise"] : ["Use the STAR structure", "Explain concepts with examples", "Practice speaking with confidence"],
    practice: "Review each answer, then rehearse the improvement tip aloud before your next interview."
  };
  const interview = await db.mockInterview.create({
    data: { userId: user.id, role, difficulty, interviewType, duration, score, questions: JSON.stringify(questions), answers: JSON.stringify(answerRecords), feedback: JSON.stringify(feedback) }
  });
  return NextResponse.json({ id: interview.id, score });
}

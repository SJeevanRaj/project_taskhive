import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

function localAnswer(question: string, context: { name: string; skills: string; attempts: string[]; courses: string[] }) {
  const text = question.toLowerCase();
  const focus = context.skills || "your current skills";
  const recent = context.attempts[0] || "a skill assessment";

  if (/hello|hi|hey|good morning|good evening/.test(text)) return `Hi ${context.name.split(" ")[0]}! I’m ready to help with programming, courses, assessments, projects, jobs, resumes, or interview preparation. What are you working on?`;
  if (/(java|javascript|python|c\+\+|c#).*(hello world|hello word)|(hello world|hello word).*(java|javascript|python|c\+\+|c#)/.test(text)) {
    if (text.includes("java") && !text.includes("javascript")) {
      return "Here is a Java Hello World program:\n\n```java\npublic class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}\n```\n\nSave it as `HelloWorld.java`, compile with `javac HelloWorld.java`, and run it with `java HelloWorld`.";
    }
    if (text.includes("python")) return "Here is a Python Hello World program:\n\n```python\nprint(\"Hello, World!\")\n```\n\nRun it with `python hello.py`.";
    if (text.includes("javascript")) return "Here is a JavaScript Hello World program:\n\n```javascript\nconsole.log(\"Hello, World!\");\n```";
    return "Here is a simple Hello World program:\n\n```cpp\n#include <iostream>\n\nint main() {\n    std::cout << \"Hello, World!\";\n    return 0;\n}\n```";
  }
  if (/write|create|make|build/.test(text) && /program|code|function|class/.test(text)) return "I can write that for you. Tell me the programming language, the exact input and output, and any rules your assignment requires. I’ll provide complete runnable code and explain how to run it.";
  if (/error|bug|debug|exception|not working|fix/.test(text)) return "Paste the error message and the smallest related code snippet. I’ll explain what caused it, suggest a fix, and give you a quick way to verify the result.";
  if (/python|javascript|typescript|java|react|next\.js|html|css|program/.test(text)) return `For a focused programming answer, share the language, your goal, and what you have tried. For ${focus}, use a small example, test one behavior at a time, and check the error output before changing several things at once.`;
  if (/interview|interviews/.test(text)) return "Use the STAR structure for experience questions: Situation, Task, Action, Result. For technical questions, clarify assumptions, describe your approach, test an example, then discuss complexity and trade-offs.";
  if (/resume|cv|profile|portfolio/.test(text)) return `Make your profile evidence-led: lead with ${focus}, quantify project outcomes, link working demos, and place your strongest assessment or project result near the top. Your latest recorded result is ${recent}.`;
  if (/job|intern|career|recruiter|company|application/.test(text)) return "Compare the job requirements with your profile, close the most important skill gap using a practical project, then apply with a short role-specific introduction. You can use Recruiter Connections to contact hiring teams directly.";
  if (/assessment|test|score|exam|course|learn|study|skill/.test(text)) return `Build a weekly loop: learn one concept, practise it, complete a small project, and review mistakes. Your current profile includes ${focus}; use ${recent} to choose the next topic and revisit weak areas.`;
  if (/database|sql|api|backend|frontend|cloud|data structure|algorithm|math|subject/.test(text)) return "Break the topic into definition, worked example, common mistake, and one practice problem. Tell me the exact topic or paste the question, and I’ll walk through it step by step.";
  return `I can work through that with you. Tell me the goal, the exact question or error, and any code or answer you have so far. I’ll give you a direct explanation, an example, and a next step. I know your current focus is ${focus}.`;
}

async function answerWithAI(question: string, history: Array<{ role: "user" | "assistant"; content: string }>, context: { name: string; skills: string; attempts: string[]; courses: string[] }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const endpoint = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const system = `You are HireLytix AI, a patient expert tutor and career coach for a student. Answer the student's exact question directly; do not give generic advice when they ask for code or a concrete result. For programming requests, provide complete runnable code, use markdown fenced code blocks with the correct language, explain how to run it, and mention assumptions. For ambiguous requests, ask one concise clarifying question. Keep answers practical and easy to scan. Never claim to have performed an action you did not perform.
Student context: name=${context.name}; skills=${context.skills || "not provided"}; recent assessments=${context.attempts.join("; ") || "none"}; available courses=${context.courses.join(", ") || "not loaded"}.`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, temperature: 0.25, max_tokens: 900, messages: [{ role: "system", content: system }, ...history.slice(-10), { role: "user", content: question }] }),
    signal: AbortSignal.timeout(25_000)
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content;
  if (typeof answer !== "string" || !answer.trim()) throw new Error("AI provider returned an empty answer");
  return answer.trim();
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") return NextResponse.json({ error: "Students only" }, { status: 403 });
  try {
    const body = await req.json();
    const question = typeof body.question === "string" ? body.question.trim().slice(0, 2000) : "";
    if (!question) return NextResponse.json({ error: "Ask a question first." }, { status: 400 });
    const history = Array.isArray(body.history) ? body.history.filter((item: unknown): item is { role: "user" | "assistant"; content: string } => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as { role?: unknown; content?: unknown };
      return (candidate.role === "user" || candidate.role === "assistant") && typeof candidate.content === "string" && candidate.content.length <= 2000;
    }).slice(-10) : [];
    const [attempts, assessments] = await Promise.all([
      db.assessmentAttempt.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3, include: { assessment: true } }),
      db.assessment.findMany({ select: { course: true }, distinct: ["course"], take: 10 })
    ]);
    const context = { name: user.name, skills: user.skills, attempts: attempts.map((attempt) => `${attempt.assessment.title}: ${attempt.score}%`), courses: assessments.map((assessment) => assessment.course) };
    try {
      const answer = await answerWithAI(question, history, context);
      if (answer) return NextResponse.json({ answer, provider: "openai" });
    } catch (error) {
      console.error("AI provider request failed:", error);
      return NextResponse.json({ error: "The AI tutor is temporarily unavailable. Please try again shortly." }, { status: 502 });
    }
    return NextResponse.json({ answer: localAnswer(question, context), provider: "local-fallback" });
  } catch {
    return NextResponse.json({ error: "The assistant could not answer right now." }, { status: 500 });
  }
}

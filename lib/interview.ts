export type InterviewQuestion = {
  id: string;
  prompt: string;
  category: string;
  keywords: string[];
};

export const interviewRoles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Python Developer",
  "Java Developer",
  "Data Analyst",
  "AI/ML Engineer"
];

const commonQuestions: InterviewQuestion[] = [
  { id: "intro", prompt: "Tell me about yourself and your experience.", category: "Introduction", keywords: ["experience", "project", "skill"] },
  { id: "project", prompt: "Tell me about a project you are proud of. What was your contribution?", category: "Project Discussion", keywords: ["built", "contribution", "result"] },
  { id: "problem", prompt: "Describe a difficult problem you solved and how you approached it.", category: "Problem Solving", keywords: ["problem", "approach", "solution"] },
  { id: "team", prompt: "How do you handle feedback or disagreement in a team?", category: "HR", keywords: ["listen", "communicate", "team"] },
  { id: "growth", prompt: "What technical skill are you currently improving and why?", category: "HR", keywords: ["learn", "improve", "practice"] },
  { id: "close", prompt: "Why are you interested in this role, and what would you bring to it?", category: "Final Question", keywords: ["role", "value", "impact"] }
];

const roleQuestions: Record<string, InterviewQuestion[]> = {
  "Frontend Developer": [{ id: "frontend", prompt: "How would you make a React interface fast, accessible, and responsive?", category: "Technical Question", keywords: ["react", "performance", "accessibility"] }, ...commonQuestions],
  "Backend Developer": [{ id: "backend", prompt: "How would you design a reliable REST API for a high-traffic service?", category: "Technical Question", keywords: ["api", "database", "cache"] }, ...commonQuestions],
  "Full Stack Developer": [{ id: "fullstack", prompt: "How do you design the boundary between a web client, API, and database?", category: "Technical Question", keywords: ["client", "api", "database"] }, ...commonQuestions],
  "Python Developer": [{ id: "python", prompt: "How would you structure a maintainable Python service and test it?", category: "Technical Question", keywords: ["python", "test", "structure"] }, ...commonQuestions],
  "Java Developer": [{ id: "java", prompt: "Explain how you would build a scalable Java service and manage concurrency.", category: "Technical Question", keywords: ["java", "thread", "service"] }, ...commonQuestions],
  "Data Analyst": [{ id: "data", prompt: "How do you validate a dataset and communicate an insight to stakeholders?", category: "Technical Question", keywords: ["data", "clean", "insight"] }, ...commonQuestions],
  "AI/ML Engineer": [{ id: "ml", prompt: "How would you evaluate an ML model and monitor it after deployment?", category: "Technical Question", keywords: ["model", "metric", "monitor"] }, ...commonQuestions]
};

export function questionsForRole(role: string): InterviewQuestion[] {
  return roleQuestions[role] || roleQuestions["Full Stack Developer"];
}

export function evaluateAnswer(question: InterviewQuestion, answer: string) {
  const normalized = answer.toLowerCase();
  const keywordHits = question.keywords.filter((keyword) => normalized.includes(keyword)).length;
  const detailBonus = Math.min(28, Math.floor(answer.trim().split(/\s+/).filter(Boolean).length / 5));
  const base = answer.trim().length < 20 ? 38 : 58;
  const answerQuality = Math.min(98, base + keywordHits * 8 + detailBonus);
  const technicalAccuracy = Math.min(98, answerQuality + (question.category === "Technical Question" ? 4 : -2));
  const relevance = Math.min(98, answerQuality + 3);
  const communication = Math.min(96, answerQuality - 2 + (answer.includes(".") ? 4 : 0));
  const confidence = Math.min(95, answerQuality - 1);
  const feedback = answerQuality >= 80
    ? "Strong response with relevant detail. Add one measurable outcome to make it even more convincing."
    : "Your direction is useful. Structure the answer with context, actions, and a clear result."
  return { technicalAccuracy, relevance, communication, confidence, answerQuality, feedback, tip: "Use a concise STAR structure: Situation, Task, Action, Result." };
}

export function overallInterviewScore(items: ReturnType<typeof evaluateAnswer>[]) {
  if (!items.length) return 0;
  return Math.round(items.reduce((sum, item) => sum + item.answerQuality, 0) / items.length);
}

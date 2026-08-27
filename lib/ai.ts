type QuestionResult = { topic: string; correct: boolean };

export function analyzeSkill(results: QuestionResult[]) {
  const total = results.length || 1;
  const correct = results.filter(r => r.correct).length;
  const score = Math.round((correct / total) * 100);

  const topicMap = new Map<string, { correct: number; total: number }>();
  for (const r of results) {
    const x = topicMap.get(r.topic) || { correct: 0, total: 0 };
    x.total++;
    if (r.correct) x.correct++;
    topicMap.set(r.topic, x);
  }

  const topics = [...topicMap.entries()].map(([topic, v]) => ({
    topic,
    percentage: Math.round((v.correct / v.total) * 100)
  }));

  const strengths = topics.filter(x => x.percentage >= 75).map(x => x.topic);
  const weaknesses = topics.filter(x => x.percentage < 60).map(x => x.topic);

  let skillLevel = "Beginner";
  if (score >= 80) skillLevel = "Advanced";
  else if (score >= 60) skillLevel = "Intermediate";

  const recommendations = weaknesses.length
    ? `Focus on ${weaknesses.join(", ")}. Review the explanations after each practice session and retake a related assessment.`
    : "Keep your momentum by attempting harder assessments and completing practical projects.";

  return {
    score,
    skillLevel,
    strengths: strengths.length ? strengths.join(", ") : "Keep practicing to build stronger areas.",
    weaknesses: weaknesses.length ? weaknesses.join(", ") : "No major weak topic detected.",
    recommendations,
    topics
  };
}

export function matchJob(requiredSkills: string, studentSkills: string) {
  const req = requiredSkills.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const have = new Set(studentSkills.split(",").map(s => s.trim().toLowerCase()).filter(Boolean));
  if (!req.length) return 0;
  return Math.round((req.filter(s => have.has(s)).length / req.length) * 100);
}

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import TasksClient from "./client";
import Link from "next/link";

export default async function TasksPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const tasks = await db.task.findMany({
    orderBy: { points: "asc" }
  });

  const submissions = await db.taskSubmission.findMany({
    where: { userId: user.id }
  });

  const subMap = new Map(submissions.map((s) => [s.taskId, s]));

  const formattedTasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    category: t.category,
    difficulty: t.difficulty,
    points: t.points,
    estimatedMinutes: t.estimatedMinutes,
    description: t.description,
    tags: t.tags,
    completed: subMap.has(t.id) && subMap.get(t.id)?.status === "COMPLETED",
    score: subMap.get(t.id)?.score
  }));

  return (
    <Shell>
      <div className="page-title">
        <div>
          <h1>Practical Tasks & Projects ⚡</h1>
          <p className="muted">
            Hands-on engineering challenges and real-world project modules with instant automated verification.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/assessment" className="btn secondary">
            🧠 MCQ Skill Lab
          </Link>
          <Link href="/jobs" className="btn primary">
            💼 View Matching Jobs
          </Link>
        </div>
      </div>

      <TasksClient tasks={formattedTasks} />
    </Shell>
  );
}

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import TaskWorkbenchClient from "./client";

export default async function TaskDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const { slug } = await params;

  const task = await db.task.findUnique({
    where: { slug }
  });

  if (!task) redirect("/tasks");

  const submission = await db.taskSubmission.findUnique({
    where: {
      userId_taskId: {
        userId: user.id,
        taskId: task.id
      }
    }
  });

  return (
    <Shell>
      <TaskWorkbenchClient
        task={{
          id: task.id,
          title: task.title,
          slug: task.slug,
          category: task.category,
          difficulty: task.difficulty,
          points: task.points,
          estimatedMinutes: task.estimatedMinutes,
          description: task.description,
          instructions: task.instructions,
          starterCode: task.starterCode || "",
          solutionGuide: task.solutionGuide || "",
          tags: task.tags
        }}
        initialSubmission={
          submission
            ? {
                id: submission.id,
                status: submission.status,
                code: submission.code || "",
                score: submission.score,
                notes: submission.notes || "",
                feedback: submission.feedback || ""
              }
            : null
        }
      />
    </Shell>
  );
}

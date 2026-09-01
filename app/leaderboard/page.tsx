import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import LeaderboardClient from "./client";

export default async function Leaderboard() {
  const u = await currentUser();
  if (!u) redirect("/login");

  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    include: {
      attempts: true,
      taskSubmissions: { where: { status: "COMPLETED" } },
      certificates: true
    },
    orderBy: { createdAt: "asc" }
  });

  const board = students
    .map((s) => {
      const avgScore = s.attempts.length
        ? Math.round(s.attempts.reduce((a, b) => a + b.score, 0) / s.attempts.length)
        : 0;
      const taskPts = s.taskSubmissions.reduce((sum, t) => sum + t.score, 0);
      const overallRating = Math.round(avgScore * 0.6 + (taskPts / 10) * 0.4);

      return {
        id: s.id,
        name: s.name,
        college: s.college || "Campus Scholar",
        branch: s.branch || "Engineering",
        avgScore,
        testCount: s.attempts.length,
        taskCount: s.taskSubmissions.length,
        taskPts,
        certCount: s.certificates.length,
        overallRating
      };
    })
    .sort((a, b) => b.overallRating - a.overallRating || b.avgScore - a.avgScore);

  return (
    <Shell>
      <LeaderboardClient board={board} userId={u.id} />
    </Shell>
  );
}

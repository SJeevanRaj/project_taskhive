import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import JobsClient from "./client";

export default async function Jobs({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const u = await currentUser();
  if (!u) redirect("/login");

  const jobs = await db.job.findMany({
    include: { recruiter: true },
    orderBy: { createdAt: "desc" }
  });

  const apps = await db.application.findMany({
    where: { userId: u.id },
    select: { jobId: true }
  });

  const appliedIds = new Set(apps.map((a) => a.jobId));

  return (
    <Shell>
      <div className="page-title">
        <div>
          <h1>Jobs & Internships 💼</h1>
          <p className="muted">
            Discover verified opportunities with real-time AI skill compatibility matching based on your profile.
          </p>
        </div>
      </div>
      <JobsClient
        initialQuery={params.q || ""}
        userSkills={u.skills || ""}
        jobs={jobs.map((j) => ({
          id: j.id,
          title: j.title,
          description: j.description,
          type: j.type,
          location: j.location,
          deadline: j.deadline.toISOString(),
          requiredSkills: j.requiredSkills,
          company: j.recruiter.companyName,
          applied: appliedIds.has(j.id)
        }))}
      />
    </Shell>
  );
}

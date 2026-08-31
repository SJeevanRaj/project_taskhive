import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import SearchClient from "./client";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; type?: string }>
}) {
  const params = await searchParams;
  const user = await currentUser();
  if (!user) redirect("/login");

  let initialCompanies: any[] = [];
  let initialStudents: any[] = [];
  let recruiterJobs: any[] = [];

  if (user.role === "STUDENT") {
    const recruiters = await db.recruiter.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        jobs: {
          orderBy: { createdAt: "desc" },
          include: {
            applications: {
              where: { userId: user.id },
              select: { id: true, status: true }
            }
          }
        }
      },
      take: 20,
      orderBy: { user: { createdAt: "desc" } }
    });

    initialCompanies = recruiters.map((rec) => {
      let meta: any = {};
      try {
        if (rec.description && rec.description.startsWith("{")) {
          meta = JSON.parse(rec.description);
        } else if (rec.description) {
          meta.about = rec.description;
        }
      } catch {
        // fallback
      }

      return {
        id: rec.id,
        companyId: rec.companyId || `CMP-${rec.id.substring(0, 6).toUpperCase()}`,
        companyName: rec.companyName,
        website: rec.website || "",
        tagline: meta.tagline || "",
        industry: meta.industry || "Technology & Software",
        companySize: meta.companySize || "51-200 employees",
        location: meta.location || "Bengaluru, India",
        about: meta.about || rec.description || "",
        perks: meta.perks || "",
        recruiterLead: {
          name: rec.user.name,
          email: rec.user.email,
          phone: rec.user.phone,
          title: meta.recruiterTitle || "Talent Acquisition Lead"
        },
        jobs: rec.jobs.map((j) => ({
          id: j.id,
          title: j.title,
          description: j.description,
          type: j.type,
          location: j.location,
          deadline: j.deadline.toISOString(),
          requiredSkills: j.requiredSkills,
          vacancies: j.vacancies,
          isApplied: j.applications.length > 0,
          applicationStatus: j.applications[0]?.status || null
        }))
      };
    });
  } else if (user.role === "RECRUITER" && user.recruiter) {
    const students = await db.user.findMany({
      where: { role: "STUDENT" },
      include: {
        certificates: {
          include: { attempt: { include: { assessment: true } } }
        },
        resume: { select: { id: true, updatedAt: true } },
        taskSubmissions: {
          where: { status: "COMPLETED" },
          include: { task: true }
        },
        invitations: {
          where: { recruiterId: user.recruiter.id },
          select: { id: true, status: true, jobId: true, roleTitle: true }
        }
      },
      take: 20,
      orderBy: { createdAt: "desc" }
    });

    initialStudents = students.map((s) => ({
      id: s.id,
      studentId: s.studentId || `STU-${s.id.substring(0, 6).toUpperCase()}`,
      name: s.name,
      email: s.email,
      phone: s.phone || "",
      college: s.college || "",
      degree: s.degree || "",
      branch: s.branch || "",
      semester: s.semester || "",
      graduationYear: s.graduationYear || null,
      skills: s.skills || "",
      bio: s.bio || "",
      github: s.github || "",
      linkedin: s.linkedin || "",
      portfolio: s.portfolio || "",
      hasResume: Boolean(s.resume),
      certificates: s.certificates.map((c) => ({
        certificateNo: c.certificateNo,
        score: c.score,
        skillLevel: c.skillLevel,
        assessmentTitle: c.attempt?.assessment?.title || "Skill Lab Test",
        issuedAt: c.issuedAt.toISOString()
      })),
      completedTasks: s.taskSubmissions.map((t) => ({
        title: t.task.title,
        score: t.score,
        category: t.task.category
      })),
      existingInvitation: s.invitations.length > 0 ? s.invitations[0] : null
    }));

    const jobs = await db.job.findMany({
      where: { recruiterId: user.recruiter.id },
      select: { id: true, title: true, type: true, location: true },
      orderBy: { createdAt: "desc" }
    });
    recruiterJobs = jobs;
  }

  return (
    <Shell>
      <SearchClient
        userRole={user.role}
        currentUserId={user.id}
        initialQuery={params.q || ""}
        initialCompanies={initialCompanies}
        initialStudents={initialStudents}
        recruiterJobs={recruiterJobs}
        userStudentId={user.studentId || undefined}
        userCompanyId={user.recruiter?.companyId || undefined}
      />
    </Shell>
  );
}

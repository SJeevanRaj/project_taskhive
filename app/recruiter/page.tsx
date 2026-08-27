import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import RecruiterClient from "./client";

export default async function Recruiter({
  searchParams
}: {
  searchParams: Promise<{ tab?: string; job?: string; q?: string }>
}) {
  const params = await searchParams;
  const u = await currentUser();
  if (!u || u.role !== "RECRUITER") redirect("/login/recruiter");

  let recruiter = await db.recruiter.findUnique({
    where: { userId: u.id },
    include: { user: true }
  });

  if (!recruiter) {
    recruiter = await db.recruiter.create({
      data: {
        userId: u.id,
        companyName: "HireLytix Enterprise Partner",
        website: "https://hirelytix.com",
        description: JSON.stringify({
          tagline: "Empowering next-generation engineering talent",
          industry: "Technology & Software",
          companySize: "51-200 employees",
          location: "Bengaluru, India",
          foundedYear: "2022",
          about: "We are an innovation-driven enterprise building next-generation technology solutions. We hire top-tier developers and problem solvers.",
          perks: "Remote Stipend, Health Insurance, Annual Learning Budget, Performance Bonuses",
          recruiterTitle: "Head of Talent Acquisition",
          aiThreshold: 70,
          emailNotifications: true,
          dailyDigest: true,
          interviewReminders: true
        })
      },
      include: { user: true }
    });
  }

  let companyMeta = {
    tagline: "Empowering next-generation engineering talent",
    industry: "Technology & Software",
    companySize: "51-200 employees",
    location: "Bengaluru, India",
    foundedYear: "2022",
    about: "We are an innovation-driven enterprise building next-generation technology solutions.",
    perks: "Remote Stipend, Health Insurance, Annual Learning Budget, Performance Bonuses",
    recruiterTitle: "Head of Talent Acquisition",
    aiThreshold: 70,
    emailNotifications: true,
    dailyDigest: true,
    interviewReminders: true
  };

  try {
    if (recruiter.description && recruiter.description.startsWith("{")) {
      const parsed = JSON.parse(recruiter.description);
      companyMeta = { ...companyMeta, ...parsed };
    } else if (recruiter.description) {
      companyMeta.about = recruiter.description;
    }
  } catch {
    // Keep defaults
  }

  const jobs = await db.job.findMany({
    where: { recruiterId: recruiter.id },
    include: {
      applications: {
        include: {
          user: {
            include: {
              certificates: {
                include: { attempt: { include: { assessment: true } } }
              },
              taskSubmissions: {
                where: { status: "COMPLETED" },
                include: { task: true }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const talentStudents = await db.user.findMany({
    where: { role: "STUDENT" },
    include: {
      certificates: {
        include: { attempt: { include: { assessment: true } } }
      },
      taskSubmissions: {
        where: { status: "COMPLETED" },
        include: { task: true }
      }
    },
    take: 50,
    orderBy: { createdAt: "desc" }
  });

  const serializedJobs = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    description: j.description,
    type: j.type,
    location: j.location,
    deadline: j.deadline.toISOString(),
    qualifications: j.qualifications,
    requiredSkills: j.requiredSkills,
    preferredSkills: j.preferredSkills || "",
    vacancies: j.vacancies,
    createdAt: j.createdAt.toISOString(),
    applications: j.applications.map((a) => ({
      id: a.id,
      jobId: a.jobId,
      status: a.status,
      note: a.note || "",
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      user: {
        id: a.user.id,
        name: a.user.name,
        email: a.user.email,
        phone: a.user.phone || "",
        skills: a.user.skills || "",
        college: a.user.college || "",
        degree: a.user.degree || "",
        branch: a.user.branch || "",
        semester: a.user.semester || "",
        graduationYear: a.user.graduationYear || null,
        bio: a.user.bio || "",
        github: a.user.github || "",
        linkedin: a.user.linkedin || "",
        portfolio: a.user.portfolio || "",
        certificates: a.user.certificates.map((c) => ({
          id: c.id,
          attemptId: c.attemptId,
          certificateNo: c.certificateNo,
          score: c.score,
          skillLevel: c.skillLevel,
          assessmentTitle: c.attempt?.assessment?.title || "Skill Lab",
          issuedAt: c.issuedAt.toISOString()
        })),
        tasksCompleted: a.user.taskSubmissions.map((t) => ({
          id: t.id,
          title: t.task.title,
          score: t.score,
          category: t.task.category
        }))
      }
    }))
  }));

  const serializedTalent = talentStudents.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone || "",
    skills: s.skills || "",
    college: s.college || "",
    degree: s.degree || "",
    branch: s.branch || "",
    semester: s.semester || "",
    graduationYear: s.graduationYear || null,
    bio: s.bio || "",
    github: s.github || "",
    linkedin: s.linkedin || "",
    portfolio: s.portfolio || "",
    certificates: s.certificates.map((c) => ({
      certificateNo: c.certificateNo,
      score: c.score,
      skillLevel: c.skillLevel,
      assessmentTitle: c.attempt?.assessment?.title || "Skill Lab"
    })),
    taskCount: s.taskSubmissions.length,
    taskPoints: s.taskSubmissions.reduce((sum, t) => sum + t.score, 0)
  }));

  return (
    <Shell>
      <RecruiterClient
        initialTab={params.tab || "overview"}
        initialFilterJob={params.job || ""}
        initialSearchQuery={params.q || ""}
        recruiter={{
          id: recruiter.id,
          companyId: recruiter.companyId || u.recruiter?.companyId || `CMP-${recruiter.id.substring(0, 6).toUpperCase()}`,
          companyName: recruiter.companyName,
          website: recruiter.website || "",
          ...companyMeta
        }}
        user={{
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || "",
          bio: u.bio || "",
          linkedin: u.linkedin || ""
        }}
        jobs={serializedJobs}
        talentPool={serializedTalent}
      />
    </Shell>
  );
}

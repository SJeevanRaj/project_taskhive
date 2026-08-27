import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const u = await currentUser();
  if (!u) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const searchType = searchParams.get("type") || (u.role === "RECRUITER" ? "student" : "company");

  if (!q) {
    return NextResponse.json({ results: [], query: q });
  }

  try {
    if (searchType === "company" || u.role === "STUDENT") {
      // Search for companies by companyId, companyName, or industry
      const isIdSearch = q.toUpperCase().startsWith("CMP-") || /^\d+$/.test(q);
      const normalizedId = q.toUpperCase().startsWith("CMP-") ? q.toUpperCase() : `CMP-${q}`;

      const recruiters = await db.recruiter.findMany({
        where: isIdSearch
          ? {
              OR: [
                { companyId: q.toUpperCase() },
                { companyId: normalizedId },
                { companyName: { contains: q } }
              ]
            }
          : {
              OR: [
                { companyName: { contains: q } },
                { companyId: q.toUpperCase() },
                { description: { contains: q } }
              ]
            },
        include: {
          user: {
            select: { name: true, email: true, phone: true, linkedin: true }
          },
          jobs: {
            orderBy: { createdAt: "desc" },
            include: {
              applications: {
                where: { userId: u.id },
                select: { id: true, status: true }
              }
            }
          }
        },
        take: 20
      });

      const results = recruiters.map((rec) => {
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
            title: meta.recruiterTitle || "Talent Lead"
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

      return NextResponse.json({ results, query: q, type: "company" });
    } else {
      // Recruiter searching for students by studentId, name, skills, college
      const isIdSearch = q.toUpperCase().startsWith("STU-") || /^\d+$/.test(q);
      const normalizedId = q.toUpperCase().startsWith("STU-") ? q.toUpperCase() : `STU-${q}`;

      const students = await db.user.findMany({
        where: {
          role: "STUDENT",
          ...(isIdSearch
            ? {
                OR: [
                  { studentId: q.toUpperCase() },
                  { studentId: normalizedId },
                  { name: { contains: q } }
                ]
              }
            : {
                OR: [
                  { name: { contains: q } },
                  { studentId: q.toUpperCase() },
                  { skills: { contains: q } },
                  { college: { contains: q } }
                ]
              })
        },
        include: {
          certificates: {
            include: { attempt: { include: { assessment: true } } }
          },
          resume: { select: { id: true, updatedAt: true } },
          taskSubmissions: {
            where: { status: "COMPLETED" },
            include: { task: true }
          },
          invitations: u.recruiter
            ? {
                where: { recruiterId: u.recruiter.id },
                select: { id: true, status: true, jobId: true, roleTitle: true }
              }
            : false
        },
        take: 20
      });

      const results = students.map((s) => ({
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
        existingInvitation: s.invitations && s.invitations.length > 0 ? s.invitations[0] : null
      }));

      return NextResponse.json({ results, query: q, type: "student" });
    }
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}

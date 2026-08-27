import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "RECRUITER" || !u.recruiter) {
    return NextResponse.json({ error: "Only recruiters can send company invitations." }, { status: 403 });
  }

  try {
    const { studentId, jobId, roleTitle, message } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required." }, { status: 400 });
    }

    const student = await db.user.findUnique({
      where: { id: studentId }
    });

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Valid student record not found." }, { status: 404 });
    }

    let job = null;
    let finalRoleTitle = roleTitle || "Engineering Opportunity";
    if (jobId) {
      job = await db.job.findUnique({ where: { id: jobId } });
      if (job) finalRoleTitle = job.title;
    }

    // Create Invitation record
    const invitation = await db.invitation.create({
      data: {
        recruiterId: u.recruiter.id,
        studentId: student.id,
        jobId: job?.id || null,
        roleTitle: finalRoleTitle,
        message: message || "We were impressed by your verified technical credentials and would love to connect!",
        status: "PENDING"
      }
    });

    // Create Notification for the student
    await db.notification.create({
      data: {
        userId: student.id,
        title: `🏢 Invitation from ${u.recruiter.companyName}`,
        message: `${u.recruiter.companyName} has invited you for "${finalRoleTitle}". ${message ? `Message: "${message}"` : ""}`,
        type: "INVITATION",
        link: "/search",
        metadata: JSON.stringify({
          invitationId: invitation.id,
          companyName: u.recruiter.companyName,
          companyId: u.recruiter.companyId || "CMP-PARTNER",
          recruiterId: u.recruiter.id,
          jobId: job?.id || null,
          roleTitle: finalRoleTitle,
          recruiterName: u.name,
          message: invitation.message
        })
      }
    });

    return NextResponse.json({ ok: true, invitation, message: "Invitation sent successfully!" });
  } catch (error) {
    console.error("Failed to send invitation:", error);
    return NextResponse.json({ error: "Failed to send invitation." }, { status: 500 });
  }
}

export async function GET() {
  const u = await currentUser();
  if (!u) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (u.role === "STUDENT") {
      const invitations = await db.invitation.findMany({
        where: { studentId: u.id },
        include: {
          recruiter: {
            include: { user: { select: { name: true, email: true, phone: true } } }
          },
          job: true
        },
        orderBy: { createdAt: "desc" }
      });

      return NextResponse.json({ invitations });
    } else if (u.recruiter) {
      const invitations = await db.invitation.findMany({
        where: { recruiterId: u.recruiter.id },
        include: {
          student: {
            select: { id: true, name: true, email: true, phone: true, studentId: true, college: true, skills: true }
          },
          job: true
        },
        orderBy: { createdAt: "desc" }
      });

      return NextResponse.json({ invitations });
    }

    return NextResponse.json({ invitations: [] });
  } catch (error) {
    console.error("Failed to fetch invitations:", error);
    return NextResponse.json({ error: "Failed to fetch invitations." }, { status: 500 });
  }
}

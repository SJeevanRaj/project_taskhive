import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!u || u.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can accept or reject invitations." }, { status: 403 });
  }

  const { id } = await params;
  const { action } = await req.json(); // "ACCEPT" | "REJECT"

  if (!["ACCEPT", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "Invalid action. Must be ACCEPT or REJECT." }, { status: 400 });
  }

  try {
    const invitation = await db.invitation.findUnique({
      where: { id },
      include: {
        recruiter: {
          include: { user: true }
        },
        job: true
      }
    });

    if (!invitation || invitation.studentId !== u.id) {
      return NextResponse.json({ error: "Invitation not found or unauthorized." }, { status: 404 });
    }

    const newStatus = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";

    const updatedInvitation = await db.invitation.update({
      where: { id },
      data: { status: newStatus }
    });

    // If accepted and there is a jobId, link student application
    if (action === "ACCEPT" && invitation.jobId) {
      const existingApp = await db.application.findUnique({
        where: {
          userId_jobId: {
            userId: u.id,
            jobId: invitation.jobId
          }
        }
      });

      if (!existingApp) {
        await db.application.create({
          data: {
            userId: u.id,
            jobId: invitation.jobId,
            status: "SHORTLISTED",
            note: `Direct Invitation Accepted from Recruiter (${invitation.recruiter.companyName})`
          }
        });
      }
    }

    // Notify the Recruiter
    const studentIdentifier = u.studentId ? `${u.name} (ID: ${u.studentId})` : u.name;
    const roleName = invitation.roleTitle || invitation.job?.title || "Company Invitation";

    await db.notification.create({
      data: {
        userId: invitation.recruiter.user.id,
        title: action === "ACCEPT" ? "🎉 Invitation Accepted!" : "Invitation Declined",
        message:
          action === "ACCEPT"
            ? `${studentIdentifier} has accepted your company invitation for "${roleName}".`
            : `${studentIdentifier} has declined your invitation for "${roleName}".`,
        type: action === "ACCEPT" ? "INVITATION_ACCEPTED" : "INVITATION_REJECTED",
        link: "/recruiter?tab=candidates",
        metadata: JSON.stringify({
          invitationId: invitation.id,
          studentId: u.id,
          studentName: u.name,
          studentUniqueId: u.studentId,
          roleTitle: roleName,
          status: newStatus
        })
      }
    });

    return NextResponse.json({
      ok: true,
      status: newStatus,
      message: action === "ACCEPT" ? "🎉 Invitation accepted! You are now connected." : "Invitation declined."
    });
  } catch (error) {
    console.error("Failed to update invitation:", error);
    return NextResponse.json({ error: "Failed to update invitation status." }, { status: 500 });
  }
}

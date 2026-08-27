import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const u = await currentUser();
  if (!u) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

  try {
    const notifications = await db.notification.findMany({
      where: { userId: u.id },
      orderBy: { createdAt: "desc" },
      take: 30
    });

    const unreadCount = await db.notification.count({
      where: { userId: u.id, read: false }
    });

    // Also fetch active pending invitations for student
    let pendingInvitations: any[] = [];
    if (u.role === "STUDENT") {
      pendingInvitations = await db.invitation.findMany({
        where: { studentId: u.id, status: "PENDING" },
        include: {
          recruiter: {
            include: { user: { select: { name: true, email: true, phone: true } } }
          },
          job: true
        },
        orderBy: { createdAt: "desc" }
      });
    }

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        link: n.link,
        read: n.read,
        metadata: n.metadata ? JSON.parse(n.metadata) : null,
        createdAt: n.createdAt.toISOString()
      })),
      unreadCount,
      pendingInvitations: pendingInvitations.map((inv) => ({
        id: inv.id,
        roleTitle: inv.roleTitle || inv.job?.title || "Company Opportunity",
        message: inv.message,
        companyName: inv.recruiter.companyName,
        companyId: inv.recruiter.companyId || "CMP-PARTNER",
        recruiterName: inv.recruiter.user.name,
        recruiterEmail: inv.recruiter.user.email,
        jobId: inv.jobId,
        createdAt: inv.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH() {
  const u = await currentUser();
  if (!u) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.notification.updateMany({
      where: { userId: u.id, read: false },
      data: { read: true }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    return NextResponse.json({ error: "Failed to mark notifications read" }, { status: 500 });
  }
}

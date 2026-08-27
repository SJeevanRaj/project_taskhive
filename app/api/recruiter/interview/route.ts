import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "RECRUITER" || !u.recruiter) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { applicationId, roundType, interviewDate, interviewTime, meetingLink, notes } = await req.json();

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: { job: true, user: true }
    });

    if (!application || application.job.recruiterId !== u.recruiter.id) {
      return NextResponse.json({ error: "Application not found or unauthorized" }, { status: 403 });
    }

    const interviewNote = JSON.stringify({
      type: "INTERVIEW_SCHEDULE",
      round: roundType || "Technical Round",
      date: interviewDate || new Date().toISOString().split("T")[0],
      time: interviewTime || "11:00 AM",
      meetingLink: meetingLink || "https://meet.google.com/new",
      notes: notes || "Initial interview scheduled",
      scheduledAt: new Date().toISOString()
    });

    const updated = await db.application.update({
      where: { id: applicationId },
      data: {
        status: "INTERVIEW_SCHEDULED",
        note: interviewNote
      }
    });

    return NextResponse.json({ ok: true, application: updated });
  } catch (error) {
    console.error("Failed to schedule interview:", error);
    return NextResponse.json({ error: "Failed to schedule interview." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!u || u.role !== "RECRUITER" || !u.recruiter) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const job = await db.job.findUnique({ where: { id } });

  if (!job || job.recruiterId !== u.recruiter.id) {
    return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const updated = await db.job.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : job.title,
        description: body.description !== undefined ? body.description : job.description,
        type: body.type !== undefined ? body.type : job.type,
        location: body.location !== undefined ? body.location : job.location,
        deadline: body.deadline ? new Date(body.deadline) : job.deadline,
        qualifications: body.qualifications !== undefined ? body.qualifications : job.qualifications,
        requiredSkills: body.requiredSkills !== undefined ? body.requiredSkills : job.requiredSkills,
        preferredSkills: body.preferredSkills !== undefined ? body.preferredSkills : job.preferredSkills,
        vacancies: body.vacancies !== undefined ? Number(body.vacancies) || 1 : job.vacancies
      }
    });

    return NextResponse.json({ ok: true, job: updated });
  } catch (error) {
    console.error("Failed to update job:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!u || u.role !== "RECRUITER" || !u.recruiter) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const job = await db.job.findUnique({ where: { id } });

  if (!job || job.recruiterId !== u.recruiter.id) {
    return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
  }

  try {
    await db.job.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "Job deleted successfully." });
  } catch (error) {
    console.error("Failed to delete job:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}

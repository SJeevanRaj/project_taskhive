import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!u || u.role !== "RECRUITER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const updateData: { status?: any; note?: string } = {};
  if (body.status) updateData.status = body.status;
  if (body.note !== undefined) updateData.note = body.note;

  const app = await db.application.findUnique({
    where: { id },
    include: { job: true }
  });

  if (!app || app.job.recruiterId !== u.recruiter?.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await db.application.update({
    where: { id },
    data: updateData
  });

  return NextResponse.json(updated);
}

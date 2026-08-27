import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const connection = await db.recruiterConnection.findUnique({ where: { id }, include: { recruiter: true, student: true } });
  if (!connection) return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  const isRecruiter = user.role === "RECRUITER" && connection.recruiter.userId === user.id;
  const isStudent = user.role === "STUDENT" && connection.studentId === user.id;
  if (!isRecruiter && !isStudent) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  if (isRecruiter && ["ACCEPTED", "REJECTED"].includes(body.status)) {
    const updated = await db.recruiterConnection.update({ where: { id }, data: { status: body.status } });
    if (body.status === "ACCEPTED") await db.notification.create({ data: { userId: connection.studentId, title: "🎉 Connection Accepted", message: `${connection.recruiter.companyName} accepted your connection request.`, type: "CONNECTION_ACCEPTED", link: "/connections", metadata: JSON.stringify({ connectionId: id }) } });
    return NextResponse.json({ connection: updated });
  }
  return NextResponse.json({ error: "Unsupported connection update" }, { status: 400 });
}
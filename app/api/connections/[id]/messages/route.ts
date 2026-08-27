import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

async function ownedConnection(id: string, user: any) {
  return db.recruiterConnection.findFirst({ where: { id, OR: [{ studentId: user.id }, { recruiter: { userId: user.id } }] } });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params; if (!await ownedConnection(id, user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const messages = await db.connectionMessage.findMany({ where: { connectionId: id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ messages });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params; const connection = await ownedConnection(id, user); if (!connection) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = String((await req.json()).body || "").trim(); if (!body || body.length > 1000) return NextResponse.json({ error: "Message is required" }, { status: 400 });
  const message = await db.connectionMessage.create({ data: { connectionId: id, senderId: user.id, body } });
  if (user.id === connection.studentId) await db.notification.create({ data: { userId: (await db.recruiter.findUniqueOrThrow({ where: { id: connection.recruiterId } })).userId, title: "Recruiter message", message: `${user.name} sent you a message.`, type: "CONNECTION_MESSAGE", link: "/recruiter?tab=candidates" } });
  return NextResponse.json({ message });
}
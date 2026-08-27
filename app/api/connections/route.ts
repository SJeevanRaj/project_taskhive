import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { matchJob } from "@/lib/ai";

function companyMeta(description: string | null) {
  try { return description?.startsWith("{") ? JSON.parse(description) : {}; } catch { return {}; }
}

function serializeRecruiter(recruiter: any, user: any, connection: any) {
  const meta = companyMeta(recruiter.description);
  const roles = recruiter.jobs.map((job: any) => job.title).slice(0, 4);
  const requiredSkills = recruiter.jobs.flatMap((job: any) => job.requiredSkills.split(/[,|]/).map((skill: string) => skill.trim())).filter(Boolean);
  const uniqueSkills = [...new Set(requiredSkills)].slice(0, 8) as string[];
  const score = recruiter.jobs.length ? Math.max(...recruiter.jobs.map((job: any) => matchJob(job.requiredSkills, user.skills))) : 45;
  return {
    id: recruiter.id, name: recruiter.user.name, title: meta.recruiterTitle || "Talent Acquisition Specialist",
    recruiterUserId: recruiter.user.id,
    company: recruiter.companyName, companyId: recruiter.companyId || `CMP-${recruiter.id.slice(0, 6).toUpperCase()}`,
    location: meta.location || recruiter.jobs[0]?.location || "Bengaluru, India", industry: meta.industry || "Technology & Software",
    photo: recruiter.user.profileImage || "", activelyHiring: recruiter.jobs.length > 0, roles, skills: uniqueSkills,
    experience: "Entry-level to 5 years", openings: recruiter.jobs.length, match: score,
    about: meta.about || recruiter.description || "Building teams for the next generation of technology.",
    status: connection?.status || "CONNECT", connectionId: connection?.id || null,
    lastInteraction: connection?.updatedAt?.toISOString() || null
  };
}

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") return NextResponse.json({ error: "Students only" }, { status: 403 });
  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
  const recruiters = await db.recruiter.findMany({
    where: q ? { OR: [{ companyName: { contains: q } }, { description: { contains: q } }, { user: { name: { contains: q } } }] } : undefined,
    include: { user: true, jobs: { orderBy: { createdAt: "desc" }, take: 8 } }, take: 50
  });
  const connections = await db.recruiterConnection.findMany({ where: { studentId: user.id } });
  const connectionMap = new Map(connections.map((connection) => [connection.recruiterId, connection]));
  const profiles = recruiters.map((recruiter) => serializeRecruiter(recruiter, user, connectionMap.get(recruiter.id))).sort((a, b) => b.match - a.match);
  return NextResponse.json({ recruiters: profiles, connections: profiles.filter((profile) => ["CONNECTED", "ACCEPTED"].includes(profile.status)) });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") return NextResponse.json({ error: "Students only" }, { status: 403 });
  const { recruiterId, message } = await req.json();
  if (typeof recruiterId !== "string") return NextResponse.json({ error: "Recruiter is required" }, { status: 400 });
  const recruiter = await db.recruiter.findUnique({ where: { id: recruiterId }, include: { user: true } });
  if (!recruiter) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });
  const connection = await db.recruiterConnection.upsert({
    where: { studentId_recruiterId: { studentId: user.id, recruiterId } },
    update: { message: String(message || "I would like to connect and learn more about suitable roles.") },
    create: { studentId: user.id, recruiterId, message: String(message || "I would like to connect and learn more about suitable roles.") }
  });
  await db.notification.create({ data: { userId: recruiter.userId, title: "New recruiter connection request", message: `${user.name} would like to connect with you.`, type: "CONNECTION_REQUEST", link: "/recruiter?tab=candidates", metadata: JSON.stringify({ connectionId: connection.id, studentId: user.id }) } });
  return NextResponse.json({ ok: true, connection });
}
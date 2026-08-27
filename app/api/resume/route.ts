import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword"
]);
const contentFields = [
  "fullName",
  "email",
  "phone",
  "location",
  "studentId",
  "summary",
  "education",
  "skills",
  "languages",
  "projects",
  "internships",
  "certifications",
  "achievements",
  "experience",
  "other"
] as const;

type ResumeContent = Record<(typeof contentFields)[number], string>;

function cleanContent(value: unknown): ResumeContent | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  return Object.fromEntries(contentFields.map((field) => [field, typeof source[field] === "string" ? source[field].trim() : ""])) as ResumeContent;
}

async function canViewResume(requester: any, studentId: string) {
  if (requester.role === "ADMIN" || requester.id === studentId) return true;
  if (requester.role !== "RECRUITER" || !requester.recruiter) return false;
  const [application, invitation] = await Promise.all([
    db.application.findFirst({ where: { userId: studentId, job: { recruiterId: requester.recruiter.id } }, select: { id: true } }),
    db.invitation.findFirst({ where: { studentId, recruiterId: requester.recruiter.id }, select: { id: true } })
  ]);
  return Boolean(application || invitation);
}

export async function GET(req: Request) {
  const requester = await currentUser();
  if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const studentId = new URL(req.url).searchParams.get("studentId") || requester.id;
  if (!(await canViewResume(requester, studentId))) return NextResponse.json({ error: "You are not authorized to view this resume" }, { status: 403 });

  const resume = await db.resume.findUnique({ where: { userId: studentId }, include: { user: { select: { name: true, studentId: true } } } });
  if (!resume) return NextResponse.json({ resume: null });
  return NextResponse.json({
    resume: {
      id: resume.id,
      kind: resume.kind,
      fileName: resume.fileName,
      mimeType: resume.mimeType,
      fileData: resume.fileData,
      content: resume.content ? JSON.parse(resume.content) : null,
      updatedAt: resume.updatedAt.toISOString(),
      studentName: resume.user.name,
      studentId: resume.user.studentId || studentId
    }
  });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") return NextResponse.json({ error: "Students only" }, { status: 403 });

  if (req.headers.get("content-type")?.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Choose a PDF or DOCX resume" }, { status: 400 });
    const extensionAllowed = /\.(pdf|docx|doc)$/i.test(file.name);
    if ((!allowedMimeTypes.has(file.type) && !extensionAllowed) || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Resume must be a PDF or DOCX file smaller than 5 MB" }, { status: 413 });
    }
    const fileData = Buffer.from(await file.arrayBuffer()).toString("base64");
    const resume = await db.resume.upsert({
      where: { userId: user.id },
      create: { userId: user.id, kind: "UPLOAD", fileName: file.name.replace(/[^a-zA-Z0-9._-]/g, "_"), mimeType: file.type || "application/octet-stream", fileData },
      update: { kind: "UPLOAD", fileName: file.name.replace(/[^a-zA-Z0-9._-]/g, "_"), mimeType: file.type || "application/octet-stream", fileData, content: null }
    });
    return NextResponse.json({ ok: true, resume: { kind: resume.kind, fileName: resume.fileName, updatedAt: resume.updatedAt.toISOString() } });
  }

  const body = await req.json();
  const content = cleanContent(body.content);
  if (!content || JSON.stringify(content).length > 100_000) return NextResponse.json({ error: "Resume content is invalid or too large" }, { status: 400 });
  const resume = await db.resume.upsert({
    where: { userId: user.id },
    create: { userId: user.id, kind: "BUILDER", content: JSON.stringify(content), fileData: null, fileName: null, mimeType: null },
    update: { kind: "BUILDER", content: JSON.stringify(content), fileData: null, fileName: null, mimeType: null }
  });
  return NextResponse.json({ ok: true, resume: { kind: resume.kind, updatedAt: resume.updatedAt.toISOString() } });
}

export async function DELETE() {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") return NextResponse.json({ error: "Students only" }, { status: 403 });
  await db.resume.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}

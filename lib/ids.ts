import { db } from "./db";

export function generateStudentId(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `STU-${num}`;
}

export function generateCompanyId(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `CMP-${num}`;
}

export async function ensureUserIds(user: any) {
  if (!user) return user;

  let modified = false;

  if (user.role === "STUDENT" && !user.studentId) {
    let uniqueId = generateStudentId();
    let collision = await db.user.findUnique({ where: { studentId: uniqueId } });
    while (collision) {
      uniqueId = generateStudentId();
      collision = await db.user.findUnique({ where: { studentId: uniqueId } });
    }

    await db.user.update({
      where: { id: user.id },
      data: { studentId: uniqueId }
    });
    user.studentId = uniqueId;
    modified = true;
  }

  if (user.recruiter && !user.recruiter.companyId) {
    let uniqueId = generateCompanyId();
    let collision = await db.recruiter.findUnique({ where: { companyId: uniqueId } });
    while (collision) {
      uniqueId = generateCompanyId();
      collision = await db.recruiter.findUnique({ where: { companyId: uniqueId } });
    }

    await db.recruiter.update({
      where: { id: user.recruiter.id },
      data: { companyId: uniqueId }
    });
    user.recruiter.companyId = uniqueId;
    modified = true;
  }

  return user;
}

"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { redirect } from "next/navigation";

function rolePath(role: string) {
  return role === "RECRUITER" ? "RECRUITER" : "STUDENT";
}

function logSmsCode(phone: string, code: string) {
  console.info(`[password-reset] Verification code for ${phone}: ${code}`);
}

export async function requestResetCode(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const role = rolePath(String(formData.get("role") || "STUDENT"));
  const users = await db.user.findMany({ where: { role } });
  const normalizedName = name.toLowerCase().replace(/\s+/g, " ");
  const normalizedPhone = phone.replace(/\D/g, "");
  const user = users.find((candidate) => candidate.name.toLowerCase().replace(/\s+/g, " ") === normalizedName && candidate.phone?.replace(/\D/g, "") === normalizedPhone);

  if (!user || !user.phone?.trim()) {
    redirect(`/forgot-password?role=${role}&error=No account with a saved phone number was found.`);
  }

  const code = String(randomInt(100000, 1000000));
  const codeHash = await bcrypt.hash(code, 10);
  await db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
  await db.passwordResetToken.create({
    data: { userId: user.id, codeHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }
  });
  logSmsCode(user.phone, code);
  redirect(`/forgot-password?role=${role}&step=verify&email=${encodeURIComponent(user.email)}&sent=Verification code sent to your saved phone number.`);
}

export async function resetPassword(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = rolePath(String(formData.get("role") || "STUDENT"));
  const code = String(formData.get("code") || "").trim();
  const password = String(formData.get("password") || "");
  const user = await db.user.findUnique({ where: { email } });
  const token = user ? await db.passwordResetToken.findFirst({ where: { userId: user.id, usedAt: null }, orderBy: { createdAt: "desc" } }) : null;

  if (!user || user.role !== role || !token || token.expiresAt < new Date() || !(await bcrypt.compare(code, token.codeHash)) || password.length < 8) {
    redirect(`/forgot-password?role=${role}&step=verify&email=${encodeURIComponent(email)}&error=Invalid or expired code, or the password is too short.`);
  }

  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(password, 12) } }),
    db.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } })
  ]);
  redirect(`/login/${role === "RECRUITER" ? "recruiter" : "student"}?reset=success`);
}

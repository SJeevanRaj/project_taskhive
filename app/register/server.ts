'use server';

import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { generateStudentId, generateCompanyId } from "@/lib/ids";

export async function registerAction(formData: FormData) {
  const role = String(formData.get("role") || "STUDENT");
  const registerPath = role === "RECRUITER" ? "recruiter" : "student";
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const phone = String(formData.get("phone") || "").trim();
  const companyName = String(formData.get("companyName") || "");

  if (!["STUDENT", "RECRUITER"].includes(role) || !name || !email || password.length < 8 || !phone || (role === "RECRUITER" && !companyName)) {
    redirect(`/register/${registerPath}?error=Please complete all required fields, including a phone number.`);
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) redirect(`/register/${registerPath}?error=Email already registered.`);

  const passwordHash = await bcrypt.hash(password, 12);
  const studentId = role === "STUDENT" ? generateStudentId() : undefined;
  const companyId = role === "RECRUITER" ? generateCompanyId() : undefined;

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      phone,
      studentId,
      role: role as any,
      recruiter: role === "RECRUITER" ? { create: { companyName, companyId } } : undefined
    }
  });
  await createSession(user.id, user.role);
  redirect(user.role === "STUDENT" ? "/subscription" : "/recruiter?tab=overview");
}
'use server';

import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getStudentSubscription } from "@/lib/subscription";

export async function loginAction(formData: FormData) {
  const identifier = String(formData.get("identifier") || formData.get("email") || "").trim();
  const email = identifier.toLowerCase();
  const password = String(formData.get("password") || "");
  const requestedRole = String(formData.get("role") || "STUDENT");
  const loginPath = requestedRole === "RECRUITER" ? "recruiter" : "student";

  const user = await db.user.findFirst({ where: { OR: [{ email }, { phone: identifier }] } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)) || user.role !== requestedRole) {
    redirect(`/login/${loginPath}?error=Invalid credentials or wrong login portal.`);
  }
  await createSession(user.id, user.role);
  if (user.role === "STUDENT" && !(await getStudentSubscription(user.id))) redirect("/subscription");
  redirect(user.role === "RECRUITER" ? "/recruiter?tab=overview" : "/dashboard");
}
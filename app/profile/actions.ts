'use server';

import { currentUser, logout } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function deleteAccountAction(formData: FormData) {
  const password = String(formData.get("password") || "");
  const user = await currentUser();

  if (!user) redirect("/login/student");

  if (!password || !(await bcrypt.compare(password, user.passwordHash))) {
    redirect("/profile?deleteError=Incorrect password. Your account was not deleted.");
  }

  const loginPath = user.role === "RECRUITER" ? "recruiter" : "student";
  await db.user.delete({ where: { id: user.id } });
  await logout();
  redirect(`/login/${loginPath}?deleted=success`);
}

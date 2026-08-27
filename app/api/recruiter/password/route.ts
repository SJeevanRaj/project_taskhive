import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  const u = await currentUser();
  if (!u) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new passwords are required." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
    }

    const isValid = await bcrypt.compare(currentPassword, u.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect current password." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: u.id },
      data: { passwordHash }
    });

    return NextResponse.json({ ok: true, message: "Password updated successfully!" });
  } catch (error) {
    console.error("Failed to change password:", error);
    return NextResponse.json({ error: "Failed to change password." }, { status: 500 });
  }
}

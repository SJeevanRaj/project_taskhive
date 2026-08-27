import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!u) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const notification = await db.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== u.id) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    const updated = await db.notification.update({
      where: { id },
      data: { read: true }
    });

    return NextResponse.json({ ok: true, notification: updated });
  } catch (error) {
    console.error("Failed to mark notification read:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

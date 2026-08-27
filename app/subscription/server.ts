"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

function renewalDate(cycle: "MONTHLY" | "YEARLY") {
  const date = new Date();
  date.setMonth(date.getMonth() + (cycle === "MONTHLY" ? 1 : 12));
  return date;
}

export async function chooseBasic() {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") redirect("/login/student");
  await db.subscription.upsert({
    where: { userId: user.id },
    update: { plan: "BASIC", status: "ACTIVE", billingCycle: "FREE", testsUsed: 0, provider: null, transactionId: null, renewalDate: null },
    create: { userId: user.id, plan: "BASIC", status: "ACTIVE", billingCycle: "FREE", testsUsed: 0 }
  });
  redirect("/dashboard");
}

export async function completeDemoPayment(formData: FormData) {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") redirect("/login/student");
  const cycle = String(formData.get("cycle")) === "YEARLY" ? "YEARLY" : "MONTHLY";
  const provider = String(formData.get("provider") || "UPI").slice(0, 40);
  await db.subscription.upsert({
    where: { userId: user.id },
    update: { plan: "PRO", status: "ACTIVE", billingCycle: cycle, provider, transactionId: `DEMO-${Date.now()}`, startedAt: new Date(), renewalDate: renewalDate(cycle) },
    create: { userId: user.id, plan: "PRO", status: "ACTIVE", billingCycle: cycle, provider, transactionId: `DEMO-${Date.now()}`, renewalDate: renewalDate(cycle) }
  });
  redirect("/dashboard?upgraded=success");
}
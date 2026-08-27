import { redirect } from "next/navigation";
import { db } from "./db";
import { currentUser } from "./auth";

export const BASIC_TEST_LIMIT = 2;

export async function getStudentSubscription(userId: string) {
  return db.subscription.findUnique({ where: { userId } });
}

export function isPro(subscription: { plan: string; status: string } | null | undefined) {
  return subscription?.plan === "PRO" && subscription.status === "ACTIVE";
}

export async function requireStudentSubscription() {
  const user = await currentUser();
  if (!user) redirect("/login/student");
  if (user.role === "RECRUITER") return { user, subscription: null };
  const subscription = await getStudentSubscription(user.id);
  if (!subscription) redirect("/subscription");
  return { user, subscription };
}

export async function getRemainingTests(userId: string, subscription: { plan: string; status: string; testsUsed?: number } | null | undefined) {
  if (isPro(subscription)) return null;
  const used = subscription && "testsUsed" in subscription
    ? subscription.testsUsed
    : await db.assessmentAttempt.count({ where: { userId } });
  return Math.max(0, BASIC_TEST_LIMIT - (used ?? 0));
}
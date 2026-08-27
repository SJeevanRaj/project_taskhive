import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import ConnectionsClient from "./client";

export default async function ConnectionsPage() {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") redirect("/login/student");
  return <Shell><ConnectionsClient studentName={user.name} /></Shell>;
}

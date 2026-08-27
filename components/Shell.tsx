import Sidebar from "./Sidebar";
import NotificationCenter from "./NotificationCenter";
import { currentUser } from "@/lib/auth";
import { getStudentSubscription } from "@/lib/subscription";
import { redirect } from "next/navigation";
import AccountMenu from "./AccountMenu";
import { isPro } from "@/lib/subscription";

export default async function Shell({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const subscription = user?.role === "STUDENT" ? await getStudentSubscription(user.id) : null;
  if (user?.role === "STUDENT" && !subscription) redirect("/subscription");

  return (
    <>
      <div className="layout">
        <Sidebar />
        <main className="main" style={{ position: "relative" }}>
          <div
            className="shell-top-bar"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 12,
              marginBottom: 16
            }}
          >
            {user && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {user.role === "STUDENT" && user.studentId && (
                  <span
                    className="tag"
                    style={{
                      background: "var(--soft-indigo)",
                      color: "var(--indigo)",
                      fontWeight: 700,
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 12
                    }}
                  >
                    Student ID: {user.studentId}
                  </span>
                )}

                {user.role === "RECRUITER" && user.recruiter?.companyId && (
                  <span
                    className="tag"
                    style={{
                      background: "var(--soft-indigo)",
                      color: "var(--indigo)",
                      fontWeight: 700,
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 12
                    }}
                  >
                    Company ID: {user.recruiter.companyId}
                  </span>
                )}

                <NotificationCenter userRole={user.role} />
                <AccountMenu user={user} isPro={isPro(subscription)} plan={subscription?.plan} />
              </div>
            )}
          </div>
          {children}
        </main>
      </div>
      <footer>Built with purpose • <b>by HireLytix</b></footer>
    </>
  );
}

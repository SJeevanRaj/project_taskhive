import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import ProfileForm from "./form";
import Link from "next/link";
import { deleteAccountAction } from "./actions";
import ResumeManager from "./ResumeManager";
import { requireStudentSubscription, isPro, getRemainingTests } from "@/lib/subscription";
import DeleteAccountControl from "./DeleteAccountControl";

export default async function Profile({ searchParams }: { searchParams: Promise<{ deleteError?: string }> }) {
  const params = await searchParams;
  const u = await currentUser();
  if (!u) redirect("/login");
  if (u.role === "RECRUITER") redirect("/recruiter?tab=company");
  const { subscription } = await requireStudentSubscription();
  if (!subscription) redirect("/subscription");
  const remainingTests = await getRemainingTests(u.id, subscription);

  const [certificates, completedTasks, interviewBest, resume] = await Promise.all([
    db.certificate.findMany({
      where: { userId: u.id },
      include: { attempt: { include: { assessment: true } } }
    }),
    db.taskSubmission.findMany({
      where: { userId: u.id, status: "COMPLETED" },
      include: { task: true }
    }),
    db.mockInterview.aggregate({ where: { userId: u.id }, _max: { score: true } }),
    db.resume.findUnique({
      where: { userId: u.id },
      select: { kind: true, fileName: true, mimeType: true, updatedAt: true }
    })
  ]);

  return (
    <Shell>
      <div className="page-title">
        <div>
          <h1>My Profile & Identity 👤</h1>
          <p className="muted">Build a recruiter-ready technical profile with verified assessment credentials and completed projects.</p>
        </div>
      </div>

      <div id="settings" className="grid">
        <section className="card subscription-status-card" style={{ gridColumn: "1 / -1" }}>
          <div><span className="banner-kicker">Subscription</span><h2>{isPro(subscription) ? <>Pro <span className="pro-badge">✓ PRO verified</span></> : "Basic"}</h2></div>
          <div className="subscription-status-grid"><div><small>Current Plan</small><strong>{isPro(subscription) ? "Pro" : "Basic (Free)"}</strong></div><div><small>Status</small><strong>{subscription.status}</strong></div><div><small>Remaining Tests</small><strong>{remainingTests === null ? "Unlimited" : remainingTests}</strong></div><div><small>Billing Cycle</small><strong>{subscription.billingCycle}</strong></div><div><small>Renewal Date</small><strong>{subscription.renewalDate ? subscription.renewalDate.toLocaleDateString() : "No renewal"}</strong></div></div>
          {!isPro(subscription) && <Link href="/subscription" className="btn primary">Upgrade to Pro</Link>}
        </section>
        <ProfileForm
          className="profile-settings-form"
          user={{
            id: u.id,
            studentId: u.studentId || `STU-${u.id.substring(0, 6).toUpperCase()}`,
            name: u.name,
            email: u.email,
            phone: u.phone || "",
            college: u.college || "",
            degree: u.degree || "",
            branch: u.branch || "",
            semester: u.semester || "",
            graduationYear: u.graduationYear || "",
            skills: u.skills,
            bio: u.bio || "",
            github: u.github || "",
            linkedin: u.linkedin || "",
            portfolio: u.portfolio || "",
            profileImage: u.profileImage || ""
          }}
        />

        <div style={{ gridColumn: "1 / -1" }}>
          <ResumeManager
            initialResume={resume ? { kind: resume.kind, fileName: resume.fileName, mimeType: resume.mimeType, updatedAt: resume.updatedAt.toISOString() } : null}
            user={{ name: u.name, email: u.email, phone: u.phone || "", studentId: u.studentId || `STU-${u.id.substring(0, 6).toUpperCase()}` }}
          />
        </div>

        {/* Right Column: Achievements & Credentials */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <section className="card">
            <h3>Verified Credentials ({certificates.length})</h3>
            {interviewBest._max.score && interviewBest._max.score >= 80 && <div className="interview-badge profile-interview-badge">🏆 Interview Ready</div>}
            {certificates.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {certificates.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: "12px 14px",
                      background: "#eee3d0",
                      borderRadius: 10,
                      border: "1px solid #1c2d45"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: 13, color: "#34d399" }}>🎓 {c.attempt.assessment.title}</strong>
                      <span className="tag" style={{ fontSize: 11 }}>{c.score}%</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", margin: "4px 0 8px" }}>
                      ID: {c.certificateNo}
                    </div>
                    <Link href={`/certificate/${c.attemptId}`} className="btn secondary" style={{ fontSize: 11, padding: "4px 8px", width: "100%", textAlign: "center" }}>
                      View / Print Certificate
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty" style={{ padding: 20 }}>
                Score &gt;80% on any assessment module to unlock your verified credential.
              </div>
            )}
          </section>

          <section className="card">
            <h3>Completed Projects ({completedTasks.length})</h3>
            {completedTasks.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {completedTasks.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: "10px 12px",
                      background: "#eee3d0",
                      borderRadius: 8,
                      border: "1px solid #1c2d45",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t.task.title}</div>
                      <small style={{ color: "#38bdf8" }}>+{t.score} pts</small>
                    </div>
                    <Link href={`/tasks/${t.task.slug}`} style={{ fontSize: 12, color: "#7c5cff" }}>
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty" style={{ padding: 20 }}>
                No practical projects completed yet. Visit the Tasks Hub.
              </div>
            )}
          </section>
        </div>
      </div>

      <section className="card danger-zone compact-danger-zone">
        <div><h3>Delete Account</h3><p className="muted">Permanently remove your account and all associated data.</p></div>
        <DeleteAccountControl error={params.deleteError} />
      </section>
    </Shell>
  );
}

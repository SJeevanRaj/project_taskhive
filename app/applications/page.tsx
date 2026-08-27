import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import Link from "next/link";

export default async function Applications() {
  const u = await currentUser();
  if (!u) redirect("/login");

  const apps = await db.application.findMany({
    where: { userId: u.id },
    include: {
      job: {
        include: { recruiter: true }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SELECTED":
        return { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" };
      case "INTERVIEW_SCHEDULED":
        return { bg: "#EEF2FF", text: "#4F46E5", border: "#C7D2FE" };
      case "SHORTLISTED":
        return { bg: "#ECFEFF", text: "#0891B2", border: "#A5F3FC" };
      case "UNDER_REVIEW":
        return { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" };
      case "REJECTED":
        return { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" };
      default:
        return { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1" };
    }
  };

  return (
    <Shell>
      <div className="page-title">
        <div>
          <h1>Application Tracker 📋</h1>
          <p className="muted">
            Track your candidacies from application submission to interview scheduling and final offer.
          </p>
        </div>
        <Link href="/jobs" className="btn primary">
          Explore More Jobs 💼
        </Link>
      </div>

      <section className="card" style={{ padding: "24px" }}>
        {apps.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {apps.map((a) => {
              const badge = getStatusBadge(a.status);
              return (
                <div
                  key={a.id}
                  className="job application-card"
                  style={{
                    padding: 18,
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: 16
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <span className="tag application-type">
                        {a.job.type}
                      </span>
                      <span className="tag">📍 {a.job.location}</span>
                    </div>

                    <h3 style={{ fontSize: 18, margin: "0 0 6px" }}>{a.job.title}</h3>
                    <p className="application-company">
                      🏢 <b>{a.job.recruiter.companyName}</b>
                    </p>

                    {a.note && (
                      <div className="application-note">
                        <strong>💬 Recruiter Note</strong><span>{a.note}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <span
                      style={{
                        padding: "6px 14px",
                        borderRadius: 99,
                        fontSize: 12,
                        fontWeight: 700,
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`
                      }}
                    >
                      {a.status.replaceAll("_", " ")}
                    </span>

                    <div className="application-dates">
                      <div>Applied: {new Date(a.createdAt).toLocaleDateString()}</div>
                      <div>Updated: {new Date(a.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty">
            You have not applied to any positions yet. Browse available internships and jobs to start applying.
          </div>
        )}
      </section>
    </Shell>
  );
}

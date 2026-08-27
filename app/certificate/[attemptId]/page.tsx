import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import Link from "next/link";
import PrintCertificateBtn from "./PrintBtn";
import Reveal from "@/components/Reveal";

export default async function CertificatePage({ params }: { params: Promise<{ attemptId: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const { attemptId } = await params;

  const attempt = await db.assessmentAttempt.findFirst({
    where: { id: attemptId, userId: user.id },
    include: { assessment: true }
  });

  if (!attempt) redirect("/assessment");
  if (attempt.score <= 80) redirect(`/assessment/result/${attempt.id}`);

  let certificate = await db.certificate.findUnique({
    where: { attemptId: attempt.id }
  });

  if (!certificate) {
    certificate = await db.certificate.create({
      data: {
        userId: user.id,
        attemptId: attempt.id,
        certificateNo: `TH-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
        score: attempt.score,
        skillLevel: attempt.skillLevel
      }
    });
  }

  return (
    <Shell>
      <div className="page-title no-print">
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <span className="tag" style={{ background: "#e5d7c0", color: "#287a63" }}>Verified Credential</span>
            <span className="tag">{attempt.assessment.subject}</span>
          </div>
          <h1>Certificate of Achievement 🎓</h1>
          <p className="muted">Congratulations! Your assessment score crossed the 80% honor threshold.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn secondary" href={`/assessment/result/${attempt.id}`}>Back to Report</Link>
          <PrintCertificateBtn />
        </div>
      </div>

      <Reveal className="certificate-reveal">
      <div className="certificate-wrap">
        <section className="certificate">
          <div className="certificate-top">
            <div className="certificate-logo">
              <img src="/hirelytix-logo.svg" alt="HireLytix" width={46} height={46} />
              <span>Hire<span>Lytix</span></span>
            </div>
            <span className="certificate-badge">✦ VERIFIED DIGITAL CREDENTIAL</span>
          </div>

          <div className="certificate-content">
            <p className="certificate-kicker">CERTIFICATE OF EXCELLENCE</p>
            <h1>This is proudly awarded to</h1>
            <h2>{user.name}</h2>
            <div className="certificate-line" />
            <p>
              for demonstrating exceptional mastery in <b>{attempt.assessment.title}</b> ({attempt.assessment.course})
              and achieving a <b>{attempt.skillLevel} Level</b> competency score.
            </p>

            <p className="certificate-note">
              Authenticated & cryptographically registered by the HireLytix Student Management & Career Intelligence Platform.
            </p>
          </div>

          <div className="certificate-bottom">
            <div>
              <b>{new Date(certificate.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</b>
              <small>Date Issued</small>
            </div>
            <div>
              <b>{certificate.certificateNo}</b>
              <small>Certificate Identification ID</small>
            </div>
            <div>
              <img className="certificate-signature" src="/recruiter-signature.svg" alt="Recruiter signature" width={150} height={46} />
              <b>HireLytix AI Lab</b>
              <small>Issuing Authority</small>
            </div>
          </div>
        </section>
      </div>
      </Reveal>

      <div className="no-print certificate-actions">
        <Link className="btn secondary" href="/assessment">Explore More Modules</Link>
        <Link className="btn secondary" href="/dashboard">Return to Dashboard</Link>
        <PrintCertificateBtn label="Print / Download PDF" />
      </div>
    </Shell>
  );
}

import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="landing">
      <div className="hero-glow" />
      <div className="hero">
        <div className="hero-actions">
          <Link href="/register/student" className="btn primary" style={{ padding: "14px 28px", fontSize: 16 }}>
            Create Student / Recruiter Account →
          </Link>
          <Link href="/login/student" className="btn secondary" style={{ padding: "14px 28px", fontSize: 16 }}>
            Student Login
          </Link>
          <Link href="/login/recruiter" className="btn secondary" style={{ padding: "14px 24px", fontSize: 15, borderColor: "#C7D2FE" }}>
            Recruiter Login
          </Link>
        </div>
        <div className="pill">✦ Complete Learning Tracks • Career Opportunities Ahead</div>
        <h1>
          Turn your engineering skills into <span>career opportunities.</span>
        </h1>
        <p>
          Master Python, Machine Learning, Full-Stack React, Backend APIs, Cloud DevOps &amp; System Security.
          Build a recruiter-ready profile, discover opportunities, and get hired.
        </p>

        <div className="hero-logo-panel" aria-label="HireLytix logo">
          <img src="/hirelytix-logo.svg" alt="HireLytix" />
          <b>HIRELYTIX</b>
          <strong>Learn. Prove. Get Hired.</strong>
        </div>

        <div className="feature-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <div>
            <b>📜 Verified Certificates</b>
            <small>Cryptographically signed credentials unlocked with &gt;80% score</small>
          </div>
          <div>
            <b>💼 AI Job Matching</b>
            <small>Instant profile fit calculation against top recruiter job posts</small>
          </div>
        </div>

      </div>
      <footer>© 2026 <b>HireLytix</b> • Student Skill Development &amp; Recruitment Intelligence Platform</footer>
    </main>
  );
}

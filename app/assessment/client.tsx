'use client';

import { useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

interface AssessmentItem {
  id: string;
  title: string;
  education: string;
  course: string;
  semester: string;
  subject: string;
  questionCount: number;
  bestScore?: number;
  skillLevel?: string;
  hasCertificate?: boolean;
}

export default function AssessmentLabClient({
  assessments,
  recentAttempts
}: {
  assessments: AssessmentItem[];
  recentAttempts: any[];
}) {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filters = [
    "ALL",
    "Aptitude",
    "Job Skills",
    "Coding Languages",
    "Non-IT Skills",
    "Civil Engineering",
    "Technical Skills",
    "AI & Data Science",
    "Web & Frontend",
    "Backend & Systems",
    "DevOps & Cloud",
    "Mobile & UI/UX",
    "Security & Core CS"
  ];

  const filtered = assessments.filter((a) => {
    const text = (a.title + " " + a.course + " " + a.subject).toLowerCase();
    const matchesFilter =
      activeFilter === "ALL" ||
      (activeFilter === "Aptitude" && (text.includes("aptitude") || text.includes("quantitative") || text.includes("logical reasoning"))) ||
      (activeFilter === "Job Skills" && (text.includes("job skills") || text.includes("employability") || text.includes("workplace readiness"))) ||
      (activeFilter === "Coding Languages" && (text.includes("coding languages") || text.includes("programming languages"))) ||
      (activeFilter === "Non-IT Skills" && (text.includes("non-it") || text.includes("non it") || text.includes("business skills"))) ||
      (activeFilter === "Civil Engineering" && (text.includes("civil") || text.includes("construction") || text.includes("structural"))) ||
      (activeFilter === "Technical Skills" && !text.includes("aptitude") && !text.includes("job skills") && !text.includes("employability") && !text.includes("workplace readiness")) ||
      (activeFilter === "AI & Data Science" &&
        (text.includes("ai") || text.includes("machine learning") || text.includes("python") || text.includes("nlp") || text.includes("natural language") || text.includes("data"))) ||
      (activeFilter === "Web & Frontend" &&
        (text.includes("react") || text.includes("frontend") || text.includes("web") || text.includes("next.js") || text.includes("css"))) ||
      (activeFilter === "Backend & Systems" &&
        (text.includes("backend") || text.includes("node") || text.includes("api") || text.includes("golang") || text.includes("system design") || text.includes("distributed") || text.includes("sql"))) ||
      (activeFilter === "DevOps & Cloud" &&
        (text.includes("cloud") || text.includes("docker") || text.includes("devops") || text.includes("kubernetes") || text.includes("spark") || text.includes("big data"))) ||
      (activeFilter === "Mobile & UI/UX" &&
        (text.includes("mobile") || text.includes("flutter") || text.includes("react native") || text.includes("ui/ux") || text.includes("design") || text.includes("accessibility"))) ||
      (activeFilter === "Security & Core CS" &&
        (text.includes("security") || text.includes("algorithm") || text.includes("structures") || text.includes("dsa") || text.includes("owasp")));

    const matchesSearch =
      search === "" ||
      (a.title + " " + a.course + " " + a.subject + " " + a.semester)
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: 24, padding: "18px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {/* Category Filter Pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`assessment-filter ${activeFilter === f ? "assessment-filter-active" : ""}`}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: undefined,
                  background: undefined,
                  color: undefined,
                  transition: "all 0.2s ease"
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ minWidth: 240, flex: "1 1 200px", maxWidth: 360 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic, track or tech..."
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                background: undefined,
                border: undefined,
                color: undefined,
                fontSize: 13
              }}
              className="assessment-search"
            />
          </div>
        </div>
      </div>

      {/* Assessment Modules Grid */}
      <div className="grid3" style={{ gap: 20 }}>
        {filtered.map((a, index) => (
          <Reveal key={a.id} delay={(index % 6) * 90}>
          <div
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              borderColor: typeof a.bestScore === "number" && a.bestScore > 80 ? "#10b981" : "#1d3048"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span className="tag" style={{ background: "#e5d7c0", color: "#40504b" }}>
                  {a.course}
                </span>
                <span className="tag">{a.semester}</span>
              </div>

              <h3 style={{ fontSize: 18, margin: "0 0 10px", lineHeight: 1.35 }}>
                {a.title}
              </h3>

              <p className="muted" style={{ fontSize: 13, margin: "0 0 12px" }}>
                📚 Subject: <b>{a.subject}</b>
              </p>

              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                <span className="tag" style={{ background: "#e5d7c0" }}>
                  ⏱ 15 Mins · 📝 15 Questions
                </span>
                <span className="tag" style={{ background: "#e5d7c0", color: "#287a63" }}>
                  🎓 Cert &gt;80%
                </span>
              </div>

              {typeof a.bestScore === "number" && (
                <div style={{ margin: "10px 0 16px", padding: "10px 14px", background: "#eee3d0", borderRadius: 10, border: "1px solid #d8cbb6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span className="muted">Your Best Score</span>
                    <strong style={{ color: a.bestScore > 80 ? "#34d399" : "#60a5fa" }}>
                      {a.bestScore}% ({a.skillLevel})
                    </strong>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14, borderTop: "1px solid #1c2d45", paddingTop: 14 }}>
              <Link
                href={`/assessment/${a.id}`}
                className="btn primary"
                style={{ flex: 1, textAlign: "center", fontSize: 13 }}
              >
                {typeof a.bestScore === "number" ? "Retake Test ↻" : "Start 15-Q Test 🚀"}
              </Link>
            </div>
          </div>
          </Reveal>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card empty" style={{ marginTop: 20 }}>
          No assessment modules match your search filter.
        </div>
      )}

      {/* Improvement History Section */}
      <section className="card" style={{ marginTop: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Recent Skill Assessment Attempts</h3>
          <span className="muted" style={{ fontSize: 13 }}>Latest AI Diagnostics</span>
        </div>

        {recentAttempts.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentAttempts.map((att) => (
              <div
                key={att.id}
                className="job"
                style={{
                  padding: "14px 16px",
                  background: "#f8f1e5",
                  borderRadius: 12,
                  border: "1px solid #1c2d45",
                  alignItems: "center"
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: 15 }}>{att.assessment.title}</h4>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                    {new Date(att.createdAt).toLocaleDateString()} • Skill Level: <b>{att.skillLevel}</b> • Total Questions: {att.total}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <strong style={{ fontSize: 20, color: att.score > 80 ? "#34d399" : "#60a5fa" }}>
                    {att.score}%
                  </strong>

                  <Link href={`/assessment/result/${att.id}`} className="btn secondary" style={{ fontSize: 12, padding: "6px 12px" }}>
                    View AI Report
                  </Link>

                  {att.score > 80 && (
                    <Link href={`/certificate/${att.id}`} className="btn primary" style={{ fontSize: 12, padding: "6px 12px" }}>
                      🎓 Certificate
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            You have not attempted any tests yet. Click &quot;Start 50-Q Test&quot; on any module above to begin.
          </div>
        )}
      </section>
    </div>
  );
}

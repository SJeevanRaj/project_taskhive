'use client';

import { useState } from "react";
import Reveal from "@/components/Reveal";
import Link from "next/link";

export default function JobsClient({
  jobs,
  userSkills = "",
  initialQuery = ""
}: {
  jobs: any[];
  userSkills?: string;
  initialQuery?: string;
}) {
  const opportunityImages = [
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80"
  ];
  const [q, setQ] = useState(initialQuery);
  const [type, setType] = useState("ALL");
  const [statusMsg, setStatusMsg] = useState("");

  const calculateMatch = (required: string) => {
    const req = required.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    const have = new Set(userSkills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean));
    if (!req.length) return 0;
    return Math.round((req.filter((s) => have.has(s)).length / req.length) * 100);
  };

  const filtered = jobs.filter(
    (j) =>
      (j.title + " " + j.company + " " + j.requiredSkills + " " + j.location)
        .toLowerCase()
        .includes(q.toLowerCase()) && (type === "ALL" || j.type === type)
  );

  function interviewRole(title: string) {
    const text = title.toLowerCase();
    if (text.includes("frontend")) return "Frontend Developer";
    if (text.includes("backend")) return "Backend Developer";
    if (text.includes("data")) return "Data Analyst";
    if (text.includes("ai") || text.includes("ml")) return "AI/ML Engineer";
    if (text.includes("python")) return "Python Developer";
    return "Full Stack Developer";
  }

  async function apply(id: string) {
    setStatusMsg("Submitting application...");
    try {
      const r = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id })
      });
      const d = await r.json();
      if (r.ok) {
        setStatusMsg("Application submitted successfully! Tracking in your Applications tab.");
        setTimeout(() => location.reload(), 800);
      } else {
        setStatusMsg(d.error || "Unable to apply. You might have already applied.");
      }
    } catch {
      setStatusMsg("Network error occurred.");
    }
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 20, padding: "18px 24px" }}>
        <div className="row" style={{ gap: 16 }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Search Opportunities</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. Python, React, AI, Cloud, Bengaluru..."
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Opportunity Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="ALL">All Types (Internships & Full-Time)</option>
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
            </select>
          </div>
        </div>
        {statusMsg && (
          <div className="success" style={{ marginTop: 14 }}>
            {statusMsg}
          </div>
        )}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
        {filtered.map((j, index) => {
          const matchPercent = calculateMatch(j.requiredSkills);
          return (
            <Reveal key={j.id} delay={(index % 6) * 90}>
            <div
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderColor: j.applied ? "#10b981" : "#1d3048"
              }}
            >
              <img
                src={opportunityImages[index % opportunityImages.length]}
                alt={`${j.type} opportunity at ${j.company}`}
                loading="lazy"
                style={{
                  width: "calc(100% + 44px)",
                  height: 150,
                  objectFit: "cover",
                  margin: "-22px -22px 20px",
                  borderRadius: "16px 16px 0 0"
                }}
              />
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span className="tag" style={{ background: "#e5d7c0", color: "#40504b" }}>
                    {j.type}
                  </span>
                  <span
                    className="tag"
                    style={{
                      background: "#e5d7c0",
                      color: matchPercent >= 70 ? "#34d399" : "#60a5fa",
                      fontWeight: 700
                    }}
                  >
                    ✦ {matchPercent}% AI Match
                  </span>
                </div>

                <h3 style={{ fontSize: 18, margin: "0 0 8px", lineHeight: 1.35 }}>
                  {j.title}
                </h3>

                <p className="muted" style={{ fontSize: 13, margin: "0 0 12px" }}>
                  🏢 <b>{j.company}</b> • 📍 {j.location}
                </p>

                <p style={{ fontSize: 13, lineHeight: 1.6, color: "#cbd5e1", marginBottom: 14 }}>
                  {j.description}
                </p>

                <div style={{ marginBottom: 14 }}>
                  <strong style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    Required Skills
                  </strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {j.requiredSkills.split(",").map((s: string) => (
                      <span className="tag" key={s} style={{ fontSize: 11 }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="muted" style={{ fontSize: 12, margin: "0 0 14px" }}>
                  📅 Deadline: <b>{new Date(j.deadline).toLocaleDateString()}</b>
                </p>
              </div>

              <div style={{ borderTop: "1px solid #1c2d45", paddingTop: 14 }}>
                <Link href={`/interview?role=${encodeURIComponent(interviewRole(j.title))}&job=${encodeURIComponent(j.title)}`} className="btn secondary practice-job-button">
                  Practice for this Job
                </Link>
                <button
                  type="button"
                  className="btn primary"
                  disabled={j.applied}
                  onClick={() => apply(j.id)}
                  style={{
                    width: "100%",
                      background: "#c9a66b"
                  }}
                >
                  {j.applied ? "Application Submitted ✓" : "Apply to Opportunity 🚀"}
                </button>
              </div>
            </div>
            </Reveal>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card empty" style={{ marginTop: 20 }}>
          No jobs found matching your search. Try different keywords.
        </div>
      )}
    </>
  );
}

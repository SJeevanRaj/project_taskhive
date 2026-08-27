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
    "https://images.unsplash.com/photo-1677442d019e21780ecad9e7b13eae9d43853a8ef3f359bb75fc0b1a846a1b2e?auto=format&fit=crop&w=900&q=80", // AI/ML
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80", // Data Science
    "https://images.unsplash.com/photo-1516321318423-f06f70d504d0?auto=format&fit=crop&w=900&q=80", // Laptop/Code
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80", // Frontend Dev
    "https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?auto=format&fit=crop&w=900&q=80", // Web Dev
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80", // UI Design
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80", // Backend
    "https://images.unsplash.com/photo-1548092372-56151907ceea?auto=format&fit=crop&w=900&q=80", // Server
    "https://images.unsplash.com/photo-1518048996046-a9f99346f36d?auto=format&fit=crop&w=900&q=80", // Technology
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80", // Cloud
    "https://images.unsplash.com/photo-1639762681033-6461a0b80e0d?auto=format&fit=crop&w=900&q=80", // DevOps
    "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=900&q=80", // Infrastructure
    "https://images.unsplash.com/photo-1526374965328-7f5ae4e8b04b?auto=format&fit=crop&w=900&q=80", // Mobile
    "https://images.unsplash.com/photo-1609042231299-d9745701ca89?auto=format&fit=crop&w=900&q=80", // Flutter
    "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=900&q=80", // Security
    "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=900&q=80", // Cybersecurity
    "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=900&q=80", // Mechanical
    "https://images.unsplash.com/photo-1581092162562-40038f56386d?auto=format&fit=crop&w=900&q=80", // Engineering
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=80", // Electrical
    "https://images.unsplash.com/photo-1572365992253-3cb3e56dd362?auto=format&fit=crop&w=900&q=80", // Electronics
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80", // Construction
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80", // Building
    "https://images.unsplash.com/photo-1460925895917-adf4ee868993?auto=format&fit=crop&w=900&q=80", // Analytics
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80", // Database
    "https://images.unsplash.com/photo-1516534775068-bb55e3360633?auto=format&fit=crop&w=900&q=80", // Testing
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80", // Business
    "https://images.unsplash.com/photo-1517694712206-547b4b9b0537?auto=format&fit=crop&w=900&q=80"  // Java Dev
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

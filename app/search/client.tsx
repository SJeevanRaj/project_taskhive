'use client';

import { useState, useTransition } from "react";
import {
  Search,
  Building,
  User,
  Copy,
  Check,
  Briefcase,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  Send,
  X,
  FileCheck,
  Clock,
  Layers,
  AlertCircle
} from "lucide-react";
import ResumeViewer from "@/components/ResumeViewer";

interface SearchClientProps {
  userRole: "STUDENT" | "RECRUITER" | "ADMIN";
  currentUserId: string;
  initialQuery: string;
  initialCompanies: any[];
  initialStudents: any[];
  recruiterJobs: any[];
  userStudentId?: string;
  userCompanyId?: string;
}

export default function SearchClient({
  userRole,
  currentUserId,
  initialQuery,
  initialCompanies,
  initialStudents,
  recruiterJobs,
  userStudentId,
  userCompanyId
}: SearchClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));
  const [companies, setCompanies] = useState<any[]>(initialCompanies);
  const [students, setStudents] = useState<any[]>(initialStudents);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Application State for Students
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyMsg, setApplyMsg] = useState<{ id: string; text: string } | null>(null);

  // Invitation Modal State for Recruiters
  const [inviteModalStudent, setInviteModalStudent] = useState<any | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>(recruiterJobs[0]?.id || "");
  const [inviteMessage, setInviteMessage] = useState(
    "We reviewed your verified technical credentials and would love to invite you to connect!"
  );
  const [sendingInvite, setSendingInvite] = useState(false);
  const [invitedStudentIds, setInvitedStudentIds] = useState<Set<string>>(new Set());

  // Copy to clipboard helper
  function copyToClipboard(text: string, idKey: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Perform search
  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setCompanies(initialCompanies);
      setStudents(initialStudents);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const type = userRole === "RECRUITER" ? "student" : "company";
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&type=${type}`);
      if (res.ok) {
        const data = await res.json();
        if (type === "company") {
          setCompanies(data.results || []);
        } else {
          setStudents(data.results || []);
        }
      }
    } catch {
      alert("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Student applies for a job
  async function handleApplyJob(jobId: string, companyId: string) {
    setApplyingJobId(jobId);
    setApplyMsg(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });

      const data = await res.json();
      if (res.ok) {
        setApplyMsg({ id: jobId, text: "🎉 Application submitted successfully!" });
        setCompanies((prev) =>
          prev.map((c) => ({
            ...c,
            jobs: c.jobs.map((j: any) =>
              j.id === jobId ? { ...j, isApplied: true, applicationStatus: "APPLIED" } : j
            )
          }))
        );
      } else {
        setApplyMsg({ id: jobId, text: data.error || "Unable to submit application." });
      }
    } catch {
      setApplyMsg({ id: jobId, text: "Network error occurred." });
    } finally {
      setApplyingJobId(null);
    }
  }

  // Recruiter sends invitation
  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteModalStudent) return;

    setSendingInvite(true);
    try {
      const targetJob = recruiterJobs.find((j) => j.id === selectedJobId);
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: inviteModalStudent.id,
          jobId: selectedJobId || null,
          roleTitle: targetJob?.title || "Engineering Opportunity",
          message: inviteMessage
        })
      });

      if (res.ok) {
        setInvitedStudentIds((prev) => new Set([...prev, inviteModalStudent.id]));
        setInviteModalStudent(null);
        alert(`🎉 Official invitation sent to ${inviteModalStudent.name}!`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to send invitation.");
      }
    } catch {
      alert("Network error sending invitation.");
    } finally {
      setSendingInvite(false);
    }
  }

  return (
    <div className="search-hub-container" style={{ paddingBottom: 40 }}>
      {/* Search Header */}
      <div className="page-title" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span
              className="tag"
              style={{ background: "var(--soft-indigo)", color: "var(--indigo)", fontWeight: 700 }}
            >
              🔍 Universal Directory &amp; ID Search
            </span>
          </div>
          <h1>
            {userRole === "RECRUITER" ? "Search Student Talent & Verified Profiles 🎓" : "Search Partner Companies & Opportunities 🏢"}
          </h1>
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            {userRole === "RECRUITER"
              ? "Look up candidates instantly by unique Student ID (e.g. STU-102938) or filter by skills, university, and verified test credentials."
              : "Search verified hiring partners by Company ID (e.g. CMP-518294) or company name to discover openings and apply directly."}
          </p>
        </div>
      </div>

      {/* Global Search Bar Card */}
      <div className="card" style={{ padding: 22, marginBottom: 24, boxShadow: "0 12px 35px rgba(15,23,42,.06)" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                userRole === "RECRUITER"
                  ? "Enter Student ID (e.g. STU-102938) or Candidate Name / Skill..."
                  : "Enter Company ID (e.g. CMP-518294) or Company Name / Industry..."
              }
              style={{
                height: 48,
                paddingLeft: 42,
                fontSize: 15,
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "#fff"
              }}
            />
            <Search
              size={18}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)"
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCompanies(initialCompanies);
                  setStudents(initialStudents);
                  setHasSearched(false);
                }}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: 0,
                  color: "var(--muted)",
                  cursor: "pointer"
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn primary"
            disabled={loading}
            style={{ height: 48, padding: "0 24px", fontSize: 14, borderRadius: 12 }}
          >
            {loading ? "Searching..." : "Search Profile 🔍"}
          </button>
        </form>

        {/* Quick Sample ID Chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Try searching:</span>
          {userRole === "STUDENT" &&
            companies.slice(0, 3).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setQuery(c.companyId);
                  setCompanies([c]);
                  setHasSearched(true);
                }}
                style={{
                  background: "var(--soft-indigo)",
                  border: "1px solid #C7D2FE",
                  color: "var(--indigo)",
                  borderRadius: 99,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                🏢 {c.companyName} ({c.companyId})
              </button>
            ))}

          {userRole === "RECRUITER" &&
            students.slice(0, 3).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setQuery(s.studentId);
                  setStudents([s]);
                  setHasSearched(true);
                }}
                style={{
                  background: "var(--soft-indigo)",
                  border: "1px solid #C7D2FE",
                  color: "var(--indigo)",
                  borderRadius: 99,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                🎓 {s.name} ({s.studentId})
              </button>
            ))}
        </div>
      </div>

      {/* RESULTS AREA: FOR STUDENTS SEARCHING COMPANIES */}
      {userRole === "STUDENT" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>
              {hasSearched ? `Search Results (${companies.length})` : `Featured Partner Companies (${companies.length})`}
            </h3>
            {hasSearched && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCompanies(initialCompanies);
                  setHasSearched(false);
                }}
                style={{ background: "transparent", border: 0, color: "var(--indigo)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
              >
                Clear Search
              </button>
            )}
          </div>

          {companies.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="card"
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    border: "1px solid var(--border)",
                    boxShadow: "0 8px 24px rgba(15,23,42,.05)"
                  }}
                >
                  {/* Company Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 14,
                          background: "var(--gradient)",
                          color: "#fff",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 22,
                          fontWeight: 900,
                          boxShadow: "0 8px 20px rgba(79,70,229,.18)"
                        }}
                      >
                        {company.companyName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <h3 style={{ margin: 0, fontSize: 20 }}>{company.companyName}</h3>

                          {/* Company ID Badge with Copy */}
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "3px 8px",
                              borderRadius: 8,
                              background: "var(--soft-indigo)",
                              color: "var(--indigo)",
                              fontSize: 11,
                              fontWeight: 800,
                              border: "1px solid #C7D2FE"
                            }}
                          >
                            ID: {company.companyId}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(company.companyId, `comp-${company.id}`)}
                              title="Copy Company ID"
                              style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", color: "var(--indigo)" }}
                            >
                              {copiedId === `comp-${company.id}` ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                            </button>
                          </span>
                        </div>

                        <p style={{ margin: "3px 0 0", color: "var(--indigo)", fontWeight: 600, fontSize: 13 }}>
                          {company.industry} • 📍 {company.location}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      {company.website && (
                        <a
                          href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn secondary"
                          style={{ fontSize: 12, padding: "8px 14px" }}
                        >
                          <ExternalLink size={13} style={{ marginRight: 5 }} /> Website
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Tagline & Story */}
                  {company.tagline && (
                    <p style={{ fontSize: 14, color: "var(--text)", margin: "14px 0 6px", fontStyle: "italic" }}>
                      &quot;{company.tagline}&quot;
                    </p>
                  )}

                  {company.about && (
                    <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 14px", lineHeight: 1.6 }}>
                      {company.about}
                    </p>
                  )}

                  {/* Perks */}
                  {company.perks && (
                    <div style={{ padding: "10px 14px", background: "var(--canvas)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 18, fontSize: 12 }}>
                      🎁 <b>Employee Benefits &amp; Culture:</b> {company.perks}
                    </div>
                  )}

                  {/* Active Jobs & Internships Section */}
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <strong style={{ fontSize: 14, color: "var(--ink)" }}>
                        Open Opportunities at {company.companyName} ({company.jobs.length})
                      </strong>
                    </div>

                    {company.jobs.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {company.jobs.map((job: any) => (
                          <div
                            key={job.id}
                            style={{
                              padding: 14,
                              background: "linear-gradient(135deg, #fff, var(--soft-indigo))",
                              border: "1px solid #D9E2FF",
                              borderRadius: 12,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 14,
                              flexWrap: "wrap"
                            }}
                          >
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <h4 style={{ margin: 0, fontSize: 15 }}>{job.title}</h4>
                                <span className="tag" style={{ fontSize: 10 }}>{job.type}</span>
                                <span className="tag" style={{ background: "var(--soft-cyan)", color: "#0891B2", fontSize: 10 }}>
                                  📍 {job.location}
                                </span>
                              </div>

                              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                                Required Skills: <b style={{ color: "var(--text)" }}>{job.requiredSkills}</b> • Vacancies: <b>{job.vacancies}</b>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {applyMsg?.id === job.id && (
                                <span style={{ fontSize: 12, color: applyMsg.text.includes("🎉") ? "#047857" : "#BE123C", fontWeight: 600 }}>
                                  {applyMsg.text}
                                </span>
                              )}

                              <button
                                type="button"
                                className="btn primary"
                                disabled={job.isApplied || applyingJobId === job.id}
                                onClick={() => handleApplyJob(job.id, company.id)}
                                style={{ fontSize: 12, padding: "8px 18px" }}
                              >
                                {job.isApplied
                                  ? "Applied ✓"
                                  : applyingJobId === job.id
                                  ? "Submitting..."
                                  : "Apply to Opportunity 🚀"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
                        No active job openings currently listed for this company.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card empty" style={{ padding: 40, textAlign: "center" }}>
              <AlertCircle size={36} color="var(--muted)" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ margin: "0 0 6px" }}>No Company Found</h3>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                We couldn&apos;t find any hiring partner matching &quot;<b>{query}</b>&quot;. Please verify the Company ID (e.g. CMP-518294) or search by company name.
              </p>
            </div>
          )}
        </div>
      )}

      {/* RESULTS AREA: FOR RECRUITERS SEARCHING STUDENTS */}
      {userRole === "RECRUITER" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>
              {hasSearched ? `Search Results (${students.length})` : `Verified Student Talent Pool (${students.length})`}
            </h3>
            {hasSearched && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setStudents(initialStudents);
                  setHasSearched(false);
                }}
                style={{ background: "transparent", border: 0, color: "var(--indigo)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
              >
                Clear Search
              </button>
            )}
          </div>

          {students.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 18 }}>
              {students.map((student) => {
                const isInvited = invitedStudentIds.has(student.id) || Boolean(student.existingInvitation);

                return (
                  <div
                    key={student.id}
                    className="card"
                    style={{
                      padding: 20,
                      borderRadius: 16,
                      border: "1px solid var(--border)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 14
                    }}
                  >
                    <div>
                      {/* Student Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: "var(--gradient)",
                              color: "#fff",
                              display: "grid",
                              placeItems: "center",
                              fontSize: 18,
                              fontWeight: 800
                            }}
                          >
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: 17 }}>{student.name}</h4>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "2px 6px",
                                borderRadius: 6,
                                background: "var(--soft-indigo)",
                                color: "var(--indigo)",
                                fontSize: 11,
                                fontWeight: 800,
                                border: "1px solid #C7D2FE",
                                marginTop: 2
                              }}
                            >
                              ID: {student.studentId}
                              <button
                                type="button"
                                onClick={() => copyToClipboard(student.studentId, `stu-${student.id}`)}
                                title="Copy Student ID"
                                style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", color: "var(--indigo)" }}
                              >
                                {copiedId === `stu-${student.id}` ? <Check size={11} color="#10B981" /> : <Copy size={11} />}
                              </button>
                            </span>
                          </div>
                        </div>

                        {student.certificates?.length > 0 && (
                          <span
                            className="tag"
                            style={{ background: "#ECFDF5", color: "#047857", fontWeight: 700, border: "1px solid #A7F3D0", fontSize: 10 }}
                          >
                            🎓 Verified Top Scorer
                          </span>
                        )}
                      </div>

                      <p style={{ margin: "4px 0 8px", fontSize: 12, color: "var(--muted)" }}>
                        {student.college || "University Scholar"} • {student.degree || "B.Tech"} {student.branch ? `(${student.branch})` : ""}
                      </p>

                      {/* Skills */}
                      <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 10 }}>
                        Skills: <b style={{ color: "var(--indigo)" }}>{student.skills || "Python, React, TypeScript"}</b>
                      </div>

                      {/* Verified Credential Badges */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                        {student.certificates?.map((c: any) => (
                          <span key={c.certificateNo} className="tag" style={{ fontSize: 10, background: "#ECFDF5", color: "#047857" }}>
                            🏆 {c.assessmentTitle} • {c.score}%
                          </span>
                        ))}
                        {student.completedTasks?.length > 0 && (
                          <span className="tag" style={{ fontSize: 10, background: "var(--soft-indigo)", color: "var(--indigo)" }}>
                            ⚡ {student.completedTasks.length} Practical Tasks
                          </span>
                        )}
                      </div>

                      {/* Bio */}
                      {student.bio && (
                        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 10px", lineHeight: 1.5, fontStyle: "italic" }}>
                          &quot;{student.bio}&quot;
                        </p>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 10, fontSize: 11 }}>
                        {student.portfolio && (
                          <a href={student.portfolio} target="_blank" rel="noreferrer" style={{ color: "var(--indigo)", fontWeight: 700 }}>
                            Portfolio ↗
                          </a>
                        )}
                        {student.github && (
                          <a href={`https://${student.github.replace("https://", "")}`} target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>
                            GitHub ↗
                          </a>
                        )}
                        {student.linkedin && (
                          <a href={`https://${student.linkedin.replace("https://", "")}`} target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>
                            LinkedIn ↗
                          </a>
                        )}
                      </div>

                      {student.hasResume ? <ResumeViewer studentId={student.id} studentName={student.name} /> : <span className="muted" style={{ fontSize: 11 }}>Resume Not Added</span>}

                      <button
                        type="button"
                        className="btn primary"
                        disabled={isInvited}
                        onClick={() => setInviteModalStudent(student)}
                        style={{ fontSize: 12, padding: "6px 14px" }}
                      >
                        <Send size={13} style={{ marginRight: 4 }} />
                        {isInvited ? "Invitation Sent ✓" : "Invite to Company"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card empty" style={{ padding: 40, textAlign: "center" }}>
              <AlertCircle size={36} color="var(--muted)" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ margin: "0 0 6px" }}>No Student Found</h3>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                We couldn&apos;t find any student matching &quot;<b>{query}</b>&quot;. Please verify the Student ID (e.g. STU-849201) or search by name/skills.
              </p>
            </div>
          )}
        </div>
      )}

      {/* RECRUITER INVITATION MODAL */}
      {inviteModalStudent && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: 20
          }}
        >
          <div
            className="card"
            style={{
              width: "min(580px, 94vw)",
              padding: 24,
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 25px 70px rgba(15,23,42,.25)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>Invite {inviteModalStudent.name}</h3>
                <span className="muted" style={{ fontSize: 12 }}>
                  Student ID: <b>{inviteModalStudent.studentId}</b> • {inviteModalStudent.college}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalStudent(null)}
                style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--muted)" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="form" style={{ maxWidth: "100%" }}>
              <div className="field">
                <label>Select Opportunity Opening</label>
                <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
                  {recruiterJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.type} - {j.location})
                    </option>
                  ))}
                  <option value="">General Company Connection / Future Openings</option>
                </select>
              </div>

              <div className="field">
                <label>Personalized Invitation Note</label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Tell the candidate why you're interested in their technical profile..."
                  rows={3}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
                <button type="button" className="btn secondary" onClick={() => setInviteModalStudent(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary" disabled={sendingInvite}>
                  {sendingInvite ? "Sending..." : "Send Official Invitation 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

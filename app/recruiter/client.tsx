'use client';

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ResumeViewer from "@/components/ResumeViewer";
import {
  Briefcase,
  Building,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Send,
  Settings as SettingsIcon,
  Sparkles,
  Trash2,
  Trophy,
  User,
  UserCheck,
  Users,
  Video,
  X,
  AlertCircle,
  Shield,
  Award,
  Check,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Copy
} from "lucide-react";

interface RecruiterClientProps {
  initialTab: string;
  initialFilterJob: string;
  initialSearchQuery: string;
  recruiter: {
    id: string;
    companyId?: string;
    companyName: string;
    website: string;
    tagline?: string;
    industry?: string;
    companySize?: string;
    location?: string;
    foundedYear?: string | number;
    about?: string;
    perks?: string;
    recruiterTitle?: string;
    aiThreshold?: number;
    emailNotifications?: boolean;
    dailyDigest?: boolean;
    interviewReminders?: boolean;
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    bio: string;
    linkedin: string;
  };
  jobs: any[];
  talentPool: any[];
}

export default function RecruiterClient({
  initialTab,
  initialFilterJob,
  initialSearchQuery,
  recruiter,
  user,
  jobs: initialJobs,
  talentPool
}: RecruiterClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab State
  const [tab, setTab] = useState(initialTab || "overview");

  // Sync tab with URL search parameter
  useEffect(() => {
    const currentParamTab = searchParams ? searchParams.get("tab") : null;
    if (currentParamTab) {
      setTab(currentParamTab);
    }
  }, [searchParams]);

  function switchTab(newTab: string) {
    setTab(newTab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", newTab);
    window.history.pushState(null, "", `?${params.toString()}`);
  }

  // Jobs state
  const [jobs, setJobs] = useState(initialJobs);
  const [jobFilter, setJobFilter] = useState(initialFilterJob || "ALL");
  const [candidateSearch, setCandidateSearch] = useState(initialSearchQuery || "");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [minMatchScore, setMinMatchScore] = useState(0);

  // New Job Form State
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postType, setPostType] = useState("Full-time");
  const [postLocation, setPostLocation] = useState("Bengaluru, India (Hybrid)");
  const [postSkills, setPostSkills] = useState("Python, React, TypeScript, SQL");
  const [postPreferred, setPostPreferred] = useState("Docker, Next.js, AWS, FastAPI");
  const [postQualifications, setPostQualifications] = useState("B.Tech / B.E. in Computer Science or equivalent");
  const [postDeadline, setPostDeadline] = useState("");
  const [postVacancies, setPostVacancies] = useState(2);
  const [isPosting, setIsPosting] = useState(false);
  const [postMsg, setPostMsg] = useState("");

  // Edit Job Modal State
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Candidate Inspection Modal
  const [inspectingApplicant, setInspectingApplicant] = useState<any | null>(null);
  const [evalNote, setEvalNote] = useState("");
  const [evalSaving, setEvalSaving] = useState(false);

  // Interview Schedule Modal State
  const [interviewModalData, setInterviewModalData] = useState<{
    applicationId: string;
    candidateName: string;
    jobTitle: string;
    roundType: string;
    date: string;
    time: string;
    meetingLink: string;
    notes: string;
  } | null>(null);
  const [schedulingInterview, setSchedulingInterview] = useState(false);

  // Company Profile Form State
  const [companyForm, setCompanyForm] = useState({
    companyName: recruiter.companyName || "",
    website: recruiter.website || "",
    tagline: recruiter.tagline || "",
    industry: recruiter.industry || "Technology & Software",
    companySize: recruiter.companySize || "51-200 employees",
    location: recruiter.location || "Bengaluru, India",
    foundedYear: recruiter.foundedYear || "2022",
    about: recruiter.about || "",
    perks: recruiter.perks || "",
    recruiterName: user.name || "",
    recruiterTitle: recruiter.recruiterTitle || "Talent Acquisition Lead",
    recruiterPhone: user.phone || "",
    recruiterBio: user.bio || "",
    recruiterLinkedin: user.linkedin || ""
  });
  const [companySaving, setCompanySaving] = useState(false);
  const [companyMsg, setCompanyMsg] = useState("");

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    aiThreshold: recruiter.aiThreshold ?? 70,
    emailNotifications: recruiter.emailNotifications ?? true,
    dailyDigest: recruiter.dailyDigest ?? true,
    interviewReminders: recruiter.interviewReminders ?? true
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  // Password Change State
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwdSaving, setPwdSaving] = useState(false);

  // Talent Pool State
  const [talentSearch, setTalentSearch] = useState("");
  const [talentOnlyCertified, setTalentOnlyCertified] = useState(false);
  const [invitedCandidateId, setInvitedCandidateId] = useState<string | null>(null);
  const [inviteJobSelect, setInviteJobSelect] = useState(jobs[0]?.id || "");

  // Calculate Match Score between Candidate skills and Job skills
  function calculateFit(requiredStr: string, candidateStr: string): number {
    if (!requiredStr) return 100;
    const req = requiredStr
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const cand = new Set(
      candidateStr
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    );

    if (req.length === 0) return 100;
    let matchCount = 0;
    req.forEach((r) => {
      if (cand.has(r)) matchCount++;
      else {
        for (const c of Array.from(cand)) {
          if (c.includes(r) || r.includes(c)) {
            matchCount += 0.75;
            break;
          }
        }
      }
    });

    return Math.min(100, Math.round((matchCount / req.length) * 100));
  }

  // Parse Interview Note metadata
  function parseInterviewDetails(noteStr?: string) {
    if (!noteStr) return null;
    try {
      if (noteStr.startsWith("{")) {
        const parsed = JSON.parse(noteStr);
        if (parsed.type === "INTERVIEW_SCHEDULE") return parsed;
      }
    } catch {
      // not json
    }
    return null;
  }

  // All applicants across all jobs
  const allApplicants = useMemo(() => {
    return jobs.flatMap((j) =>
      j.applications.map((a: any) => ({
        ...a,
        jobTitle: j.title,
        jobType: j.type,
        jobLocation: j.location,
        requiredSkills: j.requiredSkills,
        matchScore: calculateFit(j.requiredSkills, a.user.skills || ""),
        interviewData: parseInterviewDetails(a.note)
      }))
    );
  }, [jobs]);

  // Filtered applicants for Candidate / Application tabs
  const filteredApplicants = useMemo(() => {
    return allApplicants.filter((a) => {
      if (jobFilter !== "ALL" && a.jobId !== jobFilter) return false;
      if (stageFilter !== "ALL" && a.status !== stageFilter) return false;
      if (minMatchScore > 0 && a.matchScore < minMatchScore) return false;
      if (candidateSearch.trim()) {
        const q = candidateSearch.toLowerCase();
        const matchesName = a.user.name.toLowerCase().includes(q);
        const matchesEmail = a.user.email.toLowerCase().includes(q);
        const matchesSkills = (a.user.skills || "").toLowerCase().includes(q);
        const matchesCollege = (a.user.college || "").toLowerCase().includes(q);
        const matchesJob = a.jobTitle.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesSkills && !matchesCollege && !matchesJob) {
          return false;
        }
      }
      return true;
    });
  }, [allApplicants, jobFilter, stageFilter, minMatchScore, candidateSearch]);

  // Scheduled Interviews
  const scheduledInterviews = useMemo(() => {
    return allApplicants.filter(
      (a) => a.status === "INTERVIEW_SCHEDULED" || a.interviewData !== null
    );
  }, [allApplicants]);

  // Talent Pool Filtered
  const filteredTalent = useMemo(() => {
    return talentPool.filter((candidate) => {
      if (talentOnlyCertified && (!candidate.certificates || candidate.certificates.length === 0)) {
        return false;
      }
      if (talentSearch.trim()) {
        const q = talentSearch.toLowerCase();
        const matchesName = candidate.name.toLowerCase().includes(q);
        const matchesSkills = (candidate.skills || "").toLowerCase().includes(q);
        const matchesCollege = (candidate.college || "").toLowerCase().includes(q);
        const matchesDegree = (candidate.degree || "").toLowerCase().includes(q);
        if (!matchesName && !matchesSkills && !matchesCollege && !matchesDegree) {
          return false;
        }
      }
      return true;
    });
  }, [talentPool, talentSearch, talentOnlyCertified]);

  // Overview metrics
  const metrics = useMemo(() => {
    const totalJobs = jobs.length;
    const totalApps = allApplicants.length;
    const underReview = allApplicants.filter((a) => a.status === "UNDER_REVIEW").length;
    const shortlisted = allApplicants.filter((a) => a.status === "SHORTLISTED").length;
    const interviewCount = allApplicants.filter((a) => a.status === "INTERVIEW_SCHEDULED").length;
    const selected = allApplicants.filter((a) => a.status === "SELECTED").length;
    const rejected = allApplicants.filter((a) => a.status === "REJECTED").length;
    const avgFit = totalApps
      ? Math.round(allApplicants.reduce((sum, a) => sum + a.matchScore, 0) / totalApps)
      : 0;

    return {
      totalJobs,
      totalApps,
      underReview,
      shortlisted,
      interviewCount,
      selected,
      rejected,
      avgFit
    };
  }, [jobs, allApplicants]);

  // Post Job Handler
  async function handlePostJob(e: React.FormEvent) {
    e.preventDefault();
    setIsPosting(true);
    setPostMsg("");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle,
          description: postDescription,
          type: postType,
          location: postLocation,
          requiredSkills: postSkills,
          preferredSkills: postPreferred,
          qualifications: postQualifications,
          deadline: postDeadline,
          vacancies: Number(postVacancies) || 1
        })
      });

      if (res.ok) {
        const newJob = await res.json();
        setJobs([
          {
            ...newJob,
            deadline: new Date(newJob.deadline).toISOString(),
            createdAt: new Date().toISOString(),
            applications: []
          },
          ...jobs
        ]);
        setPostMsg("🎉 Job opportunity published successfully!");
        setPostTitle("");
        setPostDescription("");
        setPostDeadline("");
        setTimeout(() => setPostMsg(""), 4000);
      } else {
        const err = await res.json();
        setPostMsg(err.error || "Failed to publish job.");
      }
    } catch {
      setPostMsg("Network error occurred.");
    } finally {
      setIsPosting(false);
    }
  }

  // Update Job Handler
  async function handleUpdateJob(e: React.FormEvent) {
    e.preventDefault();
    if (!editingJob) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/jobs/${editingJob.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingJob)
      });
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === editingJob.id ? { ...j, ...editingJob } : j))
        );
        setEditingJob(null);
      } else {
        alert("Failed to update job posting.");
      }
    } catch {
      alert("Network error updating job.");
    } finally {
      setEditSaving(false);
    }
  }

  // Delete Job Handler
  async function handleDeleteJob(id: string, title: string) {
    if (!confirm(`Are you sure you want to permanently delete "${title}"? All applicant links for this job will be removed.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== id));
      } else {
        alert("Could not delete job.");
      }
    } catch {
      alert("Network error.");
    }
  }

  // Update Application Status
  async function handleUpdateStatus(applicationId: string, newStatus: string, note?: string) {
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note })
      });

      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => ({
            ...j,
            applications: j.applications.map((a: any) =>
              a.id === applicationId
                ? { ...a, status: newStatus, ...(note !== undefined ? { note } : {}) }
                : a
            )
          }))
        );

        if (inspectingApplicant && inspectingApplicant.id === applicationId) {
          setInspectingApplicant((prev: any) => ({
            ...prev,
            status: newStatus,
            ...(note !== undefined ? { note } : {})
          }));
        }
      } else {
        alert("Failed to update status.");
      }
    } catch {
      alert("Network error.");
    }
  }

  // Save Recruiter Evaluation Note
  async function handleSaveEvalNote(e: React.FormEvent) {
    e.preventDefault();
    if (!inspectingApplicant) return;
    setEvalSaving(true);
    try {
      await handleUpdateStatus(inspectingApplicant.id, inspectingApplicant.status, evalNote);
      setInspectingApplicant((prev: any) => ({ ...prev, note: evalNote }));
      alert("Evaluation note saved successfully!");
    } finally {
      setEvalSaving(false);
    }
  }

  // Schedule Interview Submit
  async function handleScheduleInterviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!interviewModalData) return;
    setSchedulingInterview(true);

    try {
      const res = await fetch("/api/recruiter/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: interviewModalData.applicationId,
          roundType: interviewModalData.roundType,
          interviewDate: interviewModalData.date,
          interviewTime: interviewModalData.time,
          meetingLink: interviewModalData.meetingLink,
          notes: interviewModalData.notes
        })
      });

      if (res.ok) {
        const interviewNote = JSON.stringify({
          type: "INTERVIEW_SCHEDULE",
          round: interviewModalData.roundType,
          date: interviewModalData.date,
          time: interviewModalData.time,
          meetingLink: interviewModalData.meetingLink,
          notes: interviewModalData.notes,
          scheduledAt: new Date().toISOString()
        });

        setJobs((prev) =>
          prev.map((j) => ({
            ...j,
            applications: j.applications.map((a: any) =>
              a.id === interviewModalData.applicationId
                ? { ...a, status: "INTERVIEW_SCHEDULED", note: interviewNote }
                : a
            )
          }))
        );

        setInterviewModalData(null);
        alert("🎉 Interview scheduled successfully! Candidate notified.");
      } else {
        alert("Failed to schedule interview.");
      }
    } catch {
      alert("Network error scheduling interview.");
    } finally {
      setSchedulingInterview(false);
    }
  }

  // Save Company Profile & Branding
  async function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault();
    setCompanySaving(true);
    setCompanyMsg("");
    try {
      const res = await fetch("/api/recruiter/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...companyForm,
          ...settingsForm
        })
      });

      if (res.ok) {
        setCompanyMsg("🎉 Company profile and branding updated successfully!");
        setTimeout(() => setCompanyMsg(""), 4000);
      } else {
        const err = await res.json();
        setCompanyMsg(err.error || "Failed to update company profile.");
      }
    } catch {
      setCompanyMsg("Network error.");
    } finally {
      setCompanySaving(false);
    }
  }

  // Save Settings Dashboard
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMsg("");
    try {
      const res = await fetch("/api/recruiter/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...companyForm,
          ...settingsForm
        })
      });

      if (res.ok) {
        setSettingsMsg("🎉 Hiring workspace preferences and screening rules saved!");
        setTimeout(() => setSettingsMsg(""), 4000);
      } else {
        const err = await res.json();
        setSettingsMsg(err.error || "Failed to update settings.");
      }
    } catch {
      setSettingsMsg("Network error saving settings.");
    } finally {
      setSettingsSaving(false);
    }
  }

  // Password Change
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    setPwdSaving(true);
    try {
      const res = await fetch("/api/recruiter/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currPassword,
          newPassword
        })
      });

      if (res.ok) {
        setPwdMsg({ type: "success", text: "✅ Password updated successfully!" });
        setCurrPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const err = await res.json();
        setPwdMsg({ type: "error", text: err.error || "Failed to change password." });
      }
    } catch {
      setPwdMsg({ type: "error", text: "Network error occurred." });
    } finally {
      setPwdSaving(false);
    }
  }

  // Status Badge Colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SELECTED":
        return { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0", label: "Selected / Offered" };
      case "INTERVIEW_SCHEDULED":
        return { bg: "#EEF2FF", text: "#4F46E5", border: "#C7D2FE", label: "Interview Scheduled" };
      case "SHORTLISTED":
        return { bg: "#ECFEFF", text: "#0891B2", border: "#A5F3FC", label: "Shortlisted" };
      case "UNDER_REVIEW":
        return { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A", label: "Under Review" };
      case "REJECTED":
        return { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3", label: "Rejected" };
      default:
        return { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", label: "Applied" };
    }
  };

  const [copiedCompanyId, setCopiedCompanyId] = useState(false);

  function handleCopyCompanyId() {
    const cid = recruiter.companyId || `CMP-${recruiter.id.substring(0, 6).toUpperCase()}`;
    navigator.clipboard.writeText(cid);
    setCopiedCompanyId(true);
    setTimeout(() => setCopiedCompanyId(false), 2000);
  }

  return (
    <div className="recruiter-hub" style={{ paddingBottom: 40 }}>
      {/* Top Header Bar */}
      <div className="page-title" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 99,
                background: "var(--soft-indigo)",
                color: "var(--indigo)",
                fontSize: 12,
                fontWeight: 700
              }}
            >
              <Building size={14} /> {recruiter.companyName}
            </span>

            {/* Prominent Company ID with Copy Button */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 99,
                background: "linear-gradient(135deg, var(--soft-indigo), var(--soft-cyan))",
                color: "var(--indigo)",
                fontSize: 12,
                fontWeight: 800,
                border: "1px solid #C7D2FE"
              }}
            >
              Company ID: {recruiter.companyId || `CMP-${recruiter.id.substring(0, 6).toUpperCase()}`}
              <button
                type="button"
                onClick={handleCopyCompanyId}
                title="Copy Company ID"
                style={{
                  background: "transparent",
                  border: 0,
                  padding: 0,
                  cursor: "pointer",
                  color: "var(--indigo)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3
                }}
              >
                {copiedCompanyId ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                <span style={{ fontSize: 10, color: copiedCompanyId ? "#10B981" : "var(--indigo)" }}>
                  {copiedCompanyId ? "Copied!" : "Copy"}
                </span>
              </button>
            </span>

            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              {recruiter.tagline || "Talent Operations & Sourcing Hub"}
            </span>
          </div>
          <h1>
            {tab === "overview" && "Recruiter Command Center 🏢"}
            {tab === "jobs" && "Manage Job Opportunities 💼"}
            {tab === "candidates" && "Candidate Pipeline & Screening 👥"}
            {tab === "applications" && "All Applications Tracker 📋"}
            {tab === "interviews" && "Interview Management Hub 📅"}
            {tab === "analytics" && "Hiring Analytics & Insights 📊"}
            {tab === "talent" && "Platform Talent Pool Discovery 🔍"}
            {tab === "company" && "Company Profile & Employer Brand 🏢"}
            {tab === "settings" && "Recruiter Settings Dashboard ⚙️"}
          </h1>
        </div>
      </div>

      {/* TAB 1: OVERVIEW / RECRUITER DASHBOARD */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Key Metric Stats Grid */}
          <div className="stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            <div className="stat">
              <small>Active Openings</small>
              <div className="num" style={{ color: "var(--indigo)" }}>
                {metrics.totalJobs}
              </div>
              <small>{jobs.reduce((sum, j) => sum + j.vacancies, 0)} total vacancies</small>
            </div>

            <div className="stat">
              <small>Received Applications</small>
              <div className="num" style={{ color: "#0891B2" }}>
                {metrics.totalApps}
              </div>
              <small>{metrics.underReview} pending review</small>
            </div>

            <div className="stat">
              <small>Shortlisted &amp; Interviews</small>
              <div className="num" style={{ color: "#10B981" }}>
                {metrics.shortlisted + metrics.interviewCount}
              </div>
              <small>{metrics.interviewCount} scheduled sessions</small>
            </div>

            <div className="stat">
              <small>Average AI Profile Fit</small>
              <div className="num" style={{ color: metrics.avgFit >= 70 ? "#10B981" : "var(--indigo)" }}>
                {metrics.avgFit}%
              </div>
              <small>Skill match algorithm</small>
            </div>
          </div>

          {/* Hiring Funnel & Quick Action Row */}
          <div className="grid" style={{ gridTemplateColumns: "2fr 1fr" }}>
            {/* Pipeline Stage Funnel */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Hiring Pipeline Conversion</h3>
                  <span className="muted" style={{ fontSize: 12 }}>Overall candidate progress across active opportunities</span>
                </div>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => switchTab("candidates")}
                  style={{ fontSize: 12, padding: "6px 12px" }}
                >
                  View Full Pipeline →
                </button>
              </div>

              {/* Progress Bars */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "1. Total Applications", count: metrics.totalApps, total: metrics.totalApps, color: "var(--indigo)" },
                  { label: "2. Under Review", count: metrics.underReview, total: metrics.totalApps, color: "#B45309" },
                  { label: "3. Shortlisted", count: metrics.shortlisted, total: metrics.totalApps, color: "#0891B2" },
                  { label: "4. Interview Scheduled", count: metrics.interviewCount, total: metrics.totalApps, color: "#6366F1" },
                  { label: "5. Selected / Offers", count: metrics.selected, total: metrics.totalApps, color: "#10B981" }
                ].map((stage) => {
                  const percent = stage.total > 0 ? Math.round((stage.count / stage.total) * 100) : 0;
                  return (
                    <div key={stage.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{stage.label}</span>
                        <span className="muted">
                          <b>{stage.count}</b> ({percent}%)
                        </span>
                      </div>
                      <div style={{ height: 8, background: "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${percent}%`,
                            height: "100%",
                            background: stage.color,
                            borderRadius: 99,
                            transition: "width .4s ease"
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions & Strategy Card */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card" style={{ background: "linear-gradient(135deg, var(--soft-indigo), var(--soft-cyan))" }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "var(--indigo)" }}>⚡ Quick Actions</h3>
                <p className="muted" style={{ fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>
                  Accelerate your technical hiring with instant screening and platform talent outreach.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => switchTab("jobs")}
                    style={{ fontSize: 12, width: "100%", justifyContent: "flex-start" }}
                  >
                    <Plus size={14} style={{ marginRight: 6 }} /> Post New Opportunity
                  </button>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => switchTab("talent")}
                    style={{ fontSize: 12, width: "100%", justifyContent: "flex-start" }}
                  >
                    <Search size={14} style={{ marginRight: 6 }} /> Discover Verified Talent ({talentPool.length})
                  </button>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => switchTab("company")}
                    style={{ fontSize: 12, width: "100%", justifyContent: "flex-start" }}
                  >
                    <Building size={14} style={{ marginRight: 6 }} /> Edit Company Brand
                  </button>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => switchTab("settings")}
                    style={{ fontSize: 12, width: "100%", justifyContent: "flex-start" }}
                  >
                    <SettingsIcon size={14} style={{ marginRight: 6 }} /> Recruiter Settings
                  </button>
                </div>
              </div>

              <div className="card">
                <h4 style={{ margin: "0 0 6px", fontSize: 14 }}>🎯 AI Match Threshold</h4>
                <p className="muted" style={{ fontSize: 12, margin: "0 0 10px" }}>
                  Current profile filter is set to <b>{settingsForm.aiThreshold}% fit</b>.
                </p>
                <Link href="/recruiter?tab=settings" className="btn secondary" style={{ fontSize: 12, padding: "6px 12px" }}>
                  Configure Rules →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Candidates Activity Feed */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16 }}>Recent Candidate Activity</h3>
                <span className="muted" style={{ fontSize: 12 }}>Latest applicants across all your active postings</span>
              </div>
              <button
                type="button"
                className="btn secondary"
                onClick={() => switchTab("candidates")}
                style={{ fontSize: 12, padding: "6px 12px" }}
              >
                Inspect All ({allApplicants.length}) →
              </button>
            </div>

            {allApplicants.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {allApplicants.slice(0, 5).map((a) => {
                  const badge = getStatusBadge(a.status);
                  return (
                    <div
                      key={a.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 14,
                        background: "var(--canvas)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        gap: 16
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: "var(--gradient)",
                            color: "#fff",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 800,
                            fontSize: 16
                          }}
                        >
                          {a.user.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <strong style={{ fontSize: 14 }}>{a.user.name}</strong>
                            <span
                              className="tag"
                              style={{
                                background: a.matchScore >= 70 ? "#ECFDF5" : "var(--soft-indigo)",
                                color: a.matchScore >= 70 ? "#047857" : "var(--indigo)",
                                fontWeight: 700
                              }}
                            >
                              {a.matchScore}% Match
                            </span>
                          </div>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                            Applied for: <b>{a.jobTitle}</b> • {a.user.college || "Student Scholar"}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                            background: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`
                          }}
                        >
                          {badge.label}
                        </span>

                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => {
                            setInspectingApplicant(a);
                            setEvalNote(a.note || "");
                          }}
                          style={{ fontSize: 12, padding: "5px 10px" }}
                        >
                          Review →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty">No applicants registered yet. Publish opportunities to attract candidate applications.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE JOBS */}
      {tab === "jobs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Post New Job Card Form */}
          <form className="card form" onSubmit={handlePostJob} style={{ maxWidth: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>Post New Job / Internship Opportunity</h3>
                <span className="muted" style={{ fontSize: 12 }}>
                  Your listing will be instantly published to verified candidates with real-time AI compatibility scoring.
                </span>
              </div>
            </div>

            {postMsg && (
              <div className={postMsg.includes("🎉") ? "success" : "error"} style={{ marginBottom: 14 }}>
                {postMsg}
              </div>
            )}

            <div className="row">
              <div className="field">
                <label>Position Title</label>
                <input
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. AI Research Intern, Full-Stack Engineer"
                  required
                />
              </div>
              <div className="field">
                <label>Employment Type</label>
                <select value={postType} onChange={(e) => setPostType(e.target.value)}>
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract / Project</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Work Location &amp; Mode</label>
                <input
                  value={postLocation}
                  onChange={(e) => setPostLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, India (Hybrid) or Remote"
                  required
                />
              </div>
              <div className="field">
                <label>Vacancies Available</label>
                <input
                  type="number"
                  min={1}
                  value={postVacancies}
                  onChange={(e) => setPostVacancies(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Required Skills (Used for AI Match %)</label>
                <input
                  value={postSkills}
                  onChange={(e) => setPostSkills(e.target.value)}
                  placeholder="Python, React, TypeScript, SQL, Docker"
                  required
                />
              </div>
              <div className="field">
                <label>Preferred Skills / Good to Have</label>
                <input
                  value={postPreferred}
                  onChange={(e) => setPostPreferred(e.target.value)}
                  placeholder="FastAPI, PyTorch, Kubernetes, AWS"
                />
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Eligibility &amp; Qualifications</label>
                <input
                  value={postQualifications}
                  onChange={(e) => setPostQualifications(e.target.value)}
                  placeholder="e.g. B.Tech / B.E. Final Year or Recent Graduate"
                  required
                />
              </div>
              <div className="field">
                <label>Application Deadline</label>
                <input
                  type="date"
                  value={postDeadline}
                  onChange={(e) => setPostDeadline(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Detailed Role Description &amp; Responsibilities</label>
              <textarea
                value={postDescription}
                onChange={(e) => setPostDescription(e.target.value)}
                placeholder="Outline core responsibilities, day-to-day impact, engineering stack, and growth opportunities..."
                rows={4}
                required
              />
            </div>

            <button className="btn primary" disabled={isPosting} style={{ marginTop: 8 }}>
              {isPosting ? "Publishing Opportunity..." : "Publish Opportunity 🚀"}
            </button>
          </form>

          {/* Active Job Postings List */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17 }}>Your Published Opportunities ({jobs.length})</h3>
                <span className="muted" style={{ fontSize: 12 }}>Manage existing job posts, edit details, or view applicants</span>
              </div>
            </div>

            {jobs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {jobs.map((j) => (
                  <div
                    key={j.id}
                    className="job"
                    style={{
                      padding: 18,
                      background: "var(--canvas)",
                      border: "1px solid var(--border)",
                      borderRadius: 14,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                        <h4 style={{ margin: 0, fontSize: 17 }}>{j.title}</h4>
                        <span className="tag">{j.type}</span>
                        <span className="tag" style={{ background: "var(--soft-cyan)", color: "#0891B2" }}>
                          📍 {j.location}
                        </span>
                      </div>

                      <p style={{ margin: "4px 0 8px", fontSize: 13, color: "var(--muted)", maxWidth: 700 }}>
                        {j.description.length > 120 ? `${j.description.substring(0, 120)}...` : j.description}
                      </p>

                      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--muted)" }}>
                        <span>Required: <b>{j.requiredSkills}</b></span>
                        <span>Vacancies: <b>{j.vacancies}</b></span>
                        <span>Deadline: <b>{new Date(j.deadline).toLocaleDateString()}</b></span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => {
                          setJobFilter(j.id);
                          switchTab("candidates");
                        }}
                        style={{ fontSize: 12, padding: "8px 14px" }}
                      >
                        <Users size={14} style={{ marginRight: 6 }} />
                        Applicants ({j.applications?.length || 0})
                      </button>

                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => setEditingJob(j)}
                        style={{ fontSize: 12, padding: "8px 12px" }}
                        title="Edit Job"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        type="button"
                        className="btn danger-button"
                        onClick={() => handleDeleteJob(j.id, j.title)}
                        style={{ fontSize: 12, padding: "8px 12px" }}
                        title="Delete Job"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">No opportunities posted yet. Use the form above to publish your first role.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3 & 4: CANDIDATES & APPLICATIONS PIPELINE */}
      {(tab === "candidates" || tab === "applications") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Filtering Controls Card */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 12, alignItems: "center" }}>
              {/* Search Box */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  SEARCH CANDIDATES
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                    placeholder="Search by name, skills, college..."
                    style={{ paddingLeft: 32 }}
                  />
                  <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                </div>
              </div>

              {/* Filter by Job */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  OPPORTUNITY
                </label>
                <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
                  <option value="ALL">All Jobs ({allApplicants.length})</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.applications?.length || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Pipeline Stage */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  PIPELINE STAGE
                </label>
                <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
                  <option value="ALL">All Stages</option>
                  <option value="APPLIED">Applied</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                  <option value="SELECTED">Selected / Offer</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Min AI Match Filter */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  MIN AI MATCH %
                </label>
                <select value={minMatchScore} onChange={(e) => setMinMatchScore(Number(e.target.value))}>
                  <option value={0}>All Scores (0%+)</option>
                  <option value={50}>50%+ Fit</option>
                  <option value={70}>70%+ High Fit</option>
                  <option value={85}>85%+ Top Match</option>
                </select>
              </div>
            </div>
          </div>

          {/* Candidates List View */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17 }}>
                  Candidates Pipeline ({filteredApplicants.length})
                </h3>
                <span className="muted" style={{ fontSize: 12 }}>
                  Click review to evaluate skills, inspect verified certificates, or schedule interview rounds
                </span>
              </div>
            </div>

            {filteredApplicants.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {filteredApplicants.map((a) => {
                  const badge = getStatusBadge(a.status);
                  return (
                    <div
                      key={a.id}
                      style={{
                        padding: 18,
                        background: "var(--canvas)",
                        border: "1px solid var(--border)",
                        borderRadius: 14,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 16
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <h4 style={{ margin: 0, fontSize: 17 }}>{a.user.name}</h4>
                          <span
                            className="tag"
                            style={{
                              background: a.matchScore >= 70 ? "#ECFDF5" : "var(--soft-indigo)",
                              color: a.matchScore >= 70 ? "#047857" : "var(--indigo)",
                              fontWeight: 700
                            }}
                          >
                            {a.matchScore}% Fit
                          </span>

                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 700,
                              background: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`
                            }}
                          >
                            {badge.label}
                          </span>
                        </div>

                        <p style={{ margin: "2px 0 6px", fontSize: 13, color: "var(--muted)" }}>
                          Position: <b>{a.jobTitle}</b> • {a.user.college || "University Scholar"} ({a.user.degree || "B.Tech"} {a.user.branch ? `• ${a.user.branch}` : ""})
                        </p>

                        <div style={{ fontSize: 12, color: "var(--text)", margin: "4px 0 8px" }}>
                          Skills: <span style={{ color: "var(--indigo)", fontWeight: 600 }}>{a.user.skills || "Not provided"}</span>
                        </div>

                        {/* Verified Credentials Badge */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                          {a.user.certificates?.map((cert: any) => (
                            <span
                              key={cert.certificateNo}
                              className="tag"
                              style={{ background: "#ECFDF5", color: "#047857", border: "1px solid #A7F3D0" }}
                            >
                              🎓 Verified • {cert.assessmentTitle} ({cert.score}%)
                            </span>
                          ))}
                          {a.user.tasksCompleted?.length > 0 && (
                            <span className="tag" style={{ background: "var(--soft-indigo)", color: "var(--indigo)" }}>
                              ⚡ {a.user.tasksCompleted.length} Practical Tasks Done
                            </span>
                          )}
                        </div>

                        {/* Recruiter Evaluation Note Preview */}
                        {a.note && (
                          <div
                            style={{
                              marginTop: 8,
                              padding: "6px 12px",
                              background: "var(--soft-indigo)",
                              borderRadius: 8,
                              fontSize: 12,
                              color: "var(--text)"
                            }}
                          >
                            💬 <b>Recruiter Note:</b> {a.note}
                          </div>
                        )}
                      </div>

                      {/* Actions & Status Changer */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                        <select
                          value={a.status}
                          onChange={(e) => handleUpdateStatus(a.id, e.target.value)}
                          style={{
                            padding: "7px 12px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600
                          }}
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="SHORTLISTED">Shortlisted</option>
                          <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                          <option value="SELECTED">Selected / Offer</option>
                          <option value="REJECTED">Rejected</option>
                        </select>

                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            className="btn primary"
                            onClick={() => {
                              setInterviewModalData({
                                applicationId: a.id,
                                candidateName: a.user.name,
                                jobTitle: a.jobTitle,
                                roundType: "Round 1: Technical Interview",
                                date: new Date().toISOString().split("T")[0],
                                time: "11:00 AM",
                                meetingLink: "https://meet.google.com/new",
                                notes: "Initial technical screening round"
                              });
                            }}
                            style={{ fontSize: 12, padding: "6px 10px" }}
                          >
                            <Calendar size={13} style={{ marginRight: 4 }} /> Schedule
                          </button>

                          <button
                            type="button"
                            className="btn secondary"
                            onClick={() => {
                              setInspectingApplicant(a);
                              setEvalNote(a.note || "");
                            }}
                            style={{ fontSize: 12, padding: "6px 10px" }}
                          >
                            <Eye size={13} style={{ marginRight: 4 }} /> Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty">No candidates found matching the selected filters.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: INTERVIEWS MANAGEMENT */}
      {tab === "interviews" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17 }}>Scheduled Interviews Hub ({scheduledInterviews.length})</h3>
                <span className="muted" style={{ fontSize: 12 }}>
                  Track upcoming technical rounds, behavioral interviews, and send meeting links to candidates
                </span>
              </div>

              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  if (allApplicants.length === 0) {
                    alert("No applicants available to schedule an interview.");
                    return;
                  }
                  const first = allApplicants[0];
                  setInterviewModalData({
                    applicationId: first.id,
                    candidateName: first.user.name,
                    jobTitle: first.jobTitle,
                    roundType: "Round 1: Technical Interview",
                    date: new Date().toISOString().split("T")[0],
                    time: "11:00 AM",
                    meetingLink: "https://meet.google.com/new",
                    notes: "Technical coding and problem-solving round"
                  });
                }}
                style={{ fontSize: 13, padding: "8px 14px" }}
              >
                <Plus size={15} style={{ marginRight: 4 }} /> Schedule New Interview
              </button>
            </div>

            {scheduledInterviews.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {scheduledInterviews.map((a) => {
                  const interview = a.interviewData || {
                    round: "Technical Interview",
                    date: "Scheduled",
                    time: "11:00 AM",
                    meetingLink: "https://meet.google.com/new",
                    notes: a.note || "Interview in progress"
                  };

                  return (
                    <div
                      key={a.id}
                      style={{
                        padding: 18,
                        background: "var(--canvas)",
                        border: "1px solid var(--border)",
                        borderRadius: 14,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <h4 style={{ margin: 0, fontSize: 16 }}>{a.user.name}</h4>
                          <span className="tag" style={{ background: "var(--soft-indigo)", color: "var(--indigo)", fontWeight: 700 }}>
                            {interview.round}
                          </span>
                          <span className="tag" style={{ background: "#ECFDF5", color: "#047857" }}>
                            {a.matchScore}% Match
                          </span>
                        </div>

                        <p style={{ margin: "2px 0 6px", fontSize: 13, color: "var(--muted)" }}>
                          Role: <b>{a.jobTitle}</b> • {a.user.email} {a.user.phone ? `• ${a.user.phone}` : ""}
                        </p>

                        <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text)", marginTop: 6 }}>
                          <span>📅 <b>Date:</b> {interview.date}</span>
                          <span>⏰ <b>Time:</b> {interview.time}</span>
                          <span>💬 <b>Agenda:</b> {interview.notes}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {interview.meetingLink && (
                          <a
                            href={interview.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn primary"
                            style={{ fontSize: 12, padding: "8px 12px" }}
                          >
                            <Video size={14} style={{ marginRight: 6 }} /> Join Call
                          </a>
                        )}

                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => {
                            setInterviewModalData({
                              applicationId: a.id,
                              candidateName: a.user.name,
                              jobTitle: a.jobTitle,
                              roundType: interview.round,
                              date: interview.date || new Date().toISOString().split("T")[0],
                              time: interview.time || "11:00 AM",
                              meetingLink: interview.meetingLink || "https://meet.google.com/new",
                              notes: interview.notes || ""
                            });
                          }}
                          style={{ fontSize: 12, padding: "8px 12px" }}
                        >
                          Reschedule
                        </button>

                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => handleUpdateStatus(a.id, "SELECTED")}
                          style={{ fontSize: 12, padding: "8px 12px", color: "#047857" }}
                        >
                          ✓ Extend Offer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty">
                No interviews currently scheduled. Pick a candidate from the Pipeline to schedule an interview round.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: HIRING ANALYTICS & INSIGHTS */}
      {tab === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Top Analytics Cards */}
          <div className="stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            <div className="stat">
              <small>Total Candidates Reached</small>
              <div className="num" style={{ color: "var(--indigo)" }}>{metrics.totalApps}</div>
              <small>Across {jobs.length} published jobs</small>
            </div>
            <div className="stat">
              <small>Shortlist Conversion</small>
              <div className="num" style={{ color: "#0891B2" }}>
                {metrics.totalApps ? Math.round((metrics.shortlisted / metrics.totalApps) * 100) : 0}%
              </div>
              <small>{metrics.shortlisted} candidates passed screening</small>
            </div>
            <div className="stat">
              <small>Interview to Offer Rate</small>
              <div className="num" style={{ color: "#10B981" }}>
                {metrics.interviewCount ? Math.round((metrics.selected / metrics.interviewCount) * 100) : 0}%
              </div>
              <small>{metrics.selected} offers extended</small>
            </div>
            <div className="stat">
              <small>Verified Talent Pool</small>
              <div className="num" style={{ color: "#8B5CF6" }}>{talentPool.length}</div>
              <small>Platform students ready for hire</small>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {/* AI Fit Match Distribution */}
            <div className="card">
              <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>AI Compatibility Distribution</h3>
              <p className="muted" style={{ fontSize: 12, margin: "0 0 16px" }}>
                Breakdown of applicant compatibility based on verified skills
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  {
                    label: "Top Match (80% - 100%)",
                    count: allApplicants.filter((a) => a.matchScore >= 80).length,
                    color: "#10B981"
                  },
                  {
                    label: "Moderate Fit (60% - 79%)",
                    count: allApplicants.filter((a) => a.matchScore >= 60 && a.matchScore < 80).length,
                    color: "var(--indigo)"
                  },
                  {
                    label: "Developing Match (< 60%)",
                    count: allApplicants.filter((a) => a.matchScore < 60).length,
                    color: "#F59E0B"
                  }
                ].map((item) => {
                  const percent = metrics.totalApps > 0 ? Math.round((item.count / metrics.totalApps) * 100) : 0;
                  return (
                    <div key={item.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span>{item.label}</span>
                        <span><b>{item.count}</b> ({percent}%)</span>
                      </div>
                      <div style={{ height: 8, background: "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: `${percent}%`, height: "100%", background: item.color, borderRadius: 99 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* University & Sourcing Channels */}
            <div className="card">
              <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>University &amp; Talent Sourcing</h3>
              <p className="muted" style={{ fontSize: 12, margin: "0 0 16px" }}>
                Candidate distribution across academic institutions
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Array.from(
                  new Set(allApplicants.map((a) => a.user.college || "HireLytix Scholar Community"))
                )
                  .slice(0, 5)
                  .map((college) => {
                    const count = allApplicants.filter(
                      (a) => (a.user.college || "HireLytix Scholar Community") === college
                    ).length;
                    return (
                      <div
                        key={college}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "10px 12px",
                          background: "var(--canvas)",
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                          fontSize: 13
                        }}
                      >
                        <span>{college}</span>
                        <strong style={{ color: "var(--indigo)" }}>{count} candidates</strong>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: PLATFORM TALENT POOL DISCOVERY */}
      {tab === "talent" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Sourcing Header & Search */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14, alignItems: "center" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  SEARCH PLATFORM TALENT
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    value={talentSearch}
                    onChange={(e) => setTalentSearch(e.target.value)}
                    placeholder="Search candidate by skills (e.g. Python, React), college, or name..."
                    style={{ paddingLeft: 32 }}
                  />
                  <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  VERIFIED CREDENTIALS
                </label>
                <select
                  value={talentOnlyCertified ? "YES" : "ALL"}
                  onChange={(e) => setTalentOnlyCertified(e.target.value === "YES")}
                >
                  <option value="ALL">All Candidates ({talentPool.length})</option>
                  <option value="YES">Verified Skill Lab Credential Holders Only</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  TARGET JOB INVITATION
                </label>
                <select value={inviteJobSelect} onChange={(e) => setInviteJobSelect(e.target.value)}>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Candidate Grid */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17 }}>Discover Verified Candidates ({filteredTalent.length})</h3>
                <span className="muted" style={{ fontSize: 12 }}>
                  Directly scout and invite high-scoring candidates across HireLytix to apply to your opportunities
                </span>
              </div>
            </div>

            {filteredTalent.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
                {filteredTalent.map((cand) => (
                  <div
                    key={cand.id}
                    style={{
                      padding: 16,
                      background: "var(--canvas)",
                      border: "1px solid var(--border)",
                      borderRadius: 14,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 12
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h4 style={{ margin: "0 0 2px", fontSize: 16 }}>{cand.name}</h4>
                          <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
                            {cand.college || "Student Scholar"} • {cand.degree || "B.Tech"}
                          </p>
                        </div>

                        {cand.certificates?.length > 0 && (
                          <span
                            className="tag"
                            style={{ background: "#ECFDF5", color: "#047857", fontWeight: 700, border: "1px solid #A7F3D0" }}
                          >
                            🎓 Verified Top Scorer
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: 12, color: "var(--text)", margin: "8px 0 6px" }}>
                        Skills: <span style={{ color: "var(--indigo)", fontWeight: 600 }}>{cand.skills || "Python, React, TypeScript"}</span>
                      </div>

                      {/* Verified credentials */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {cand.certificates?.map((c: any) => (
                          <span key={c.certificateNo} className="tag" style={{ fontSize: 10 }}>
                            🏆 {c.assessmentTitle} • {c.score}%
                          </span>
                        ))}
                        {cand.taskCount > 0 && (
                          <span className="tag" style={{ fontSize: 10, background: "var(--soft-indigo)", color: "var(--indigo)" }}>
                            ⚡ {cand.taskCount} Projects ({cand.taskPoints} pts)
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", gap: 10, fontSize: 12 }}>
                        {cand.portfolio && (
                          <a href={cand.portfolio} target="_blank" rel="noreferrer" style={{ color: "var(--indigo)", fontWeight: 600 }}>
                            Portfolio ↗
                          </a>
                        )}
                        {cand.github && (
                          <a href={`https://${cand.github.replace("https://", "")}`} target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>
                            GitHub ↗
                          </a>
                        )}
                        {cand.linkedin && (
                          <a href={`https://${cand.linkedin.replace("https://", "")}`} target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>
                            LinkedIn ↗
                          </a>
                        )}
                      </div>

                      <button
                        type="button"
                        className="btn primary"
                        onClick={() => {
                          const targetJob = jobs.find((j) => j.id === inviteJobSelect) || jobs[0];
                          const subject = encodeURIComponent(`Invitation to apply: ${targetJob?.title || "Engineering Role"} at ${recruiter.companyName}`);
                          const body = encodeURIComponent(
                            `Hi ${cand.name},\n\nWe came across your verified credentials and technical profile on HireLytix and would love to invite you to apply for our ${targetJob?.title || "Open Role"} at ${recruiter.companyName}!\n\nBest regards,\n${companyForm.recruiterName || user.name}\n${companyForm.recruiterTitle || "Recruiter"} • ${recruiter.companyName}`
                          );
                          window.location.href = `mailto:${cand.email}?subject=${subject}&body=${body}`;
                          setInvitedCandidateId(cand.id);
                        }}
                        style={{ fontSize: 12, padding: "6px 12px" }}
                      >
                        <Send size={13} style={{ marginRight: 4 }} />
                        {invitedCandidateId === cand.id ? "Invited ✓" : "Invite to Apply"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">No candidates matching your search criteria in the talent pool.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: COMPANY PROFILE & EMPLOYER BRANDING */}
      {tab === "company" && (
        <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
          {/* Company Branding Form */}
          <form className="card form" onSubmit={handleSaveCompany} style={{ maxWidth: "100%" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>Company Branding &amp; Identity</h3>
            <p className="muted" style={{ fontSize: 12, margin: "0 0 16px" }}>
              This company identity is displayed to candidates across job listings, banners, and offers.
            </p>

            {companyMsg && (
              <div className={companyMsg.includes("🎉") ? "success" : "error"} style={{ marginBottom: 14 }}>
                {companyMsg}
              </div>
            )}

            <div className="row">
              <div className="field">
                <label>Company Legal / Display Name</label>
                <input
                  value={companyForm.companyName}
                  onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                  placeholder="e.g. HireLytix Technologies Inc."
                  required
                />
              </div>
              <div className="field">
                <label>Tagline / Mission Slogan</label>
                <input
                  value={companyForm.tagline}
                  onChange={(e) => setCompanyForm({ ...companyForm, tagline: e.target.value })}
                  placeholder="e.g. Powering the next generation of cloud AI"
                />
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Industry &amp; Domain</label>
                <select
                  value={companyForm.industry}
                  onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                >
                  <option value="Technology & Software">Technology &amp; Software</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence &amp; Data Science</option>
                  <option value="Fintech & Banking">Fintech &amp; Banking</option>
                  <option value="E-Commerce & Digital Products">E-Commerce &amp; Digital Products</option>
                  <option value="Healthcare & Life Sciences">Healthcare &amp; Life Sciences</option>
                  <option value="Consulting & Enterprise Solutions">Consulting &amp; Enterprise Solutions</option>
                </select>
              </div>
              <div className="field">
                <label>Company Size</label>
                <select
                  value={companyForm.companySize}
                  onChange={(e) => setCompanyForm({ ...companyForm, companySize: e.target.value })}
                >
                  <option value="1-10 employees (Startup)">1-10 employees (Startup)</option>
                  <option value="11-50 employees (Early Stage)">11-50 employees (Early Stage)</option>
                  <option value="51-200 employees (Scale-up)">51-200 employees (Scale-up)</option>
                  <option value="201-500 employees (Mid-market)">201-500 employees (Mid-market)</option>
                  <option value="500+ employees (Enterprise)">500+ employees (Enterprise)</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Headquarters Location</label>
                <input
                  value={companyForm.location}
                  onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                  placeholder="e.g. Bengaluru, India or San Francisco, CA"
                />
              </div>
              <div className="field">
                <label>Official Website URL</label>
                <input
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>

            <div className="field">
              <label>About the Company &amp; Culture</label>
              <textarea
                value={companyForm.about}
                onChange={(e) => setCompanyForm({ ...companyForm, about: e.target.value })}
                placeholder="Describe your company culture, technical challenges, mission, and growth vision..."
                rows={3}
              />
            </div>

            <div className="field">
              <label>Employee Benefits, Perks &amp; Work Environment</label>
              <input
                value={companyForm.perks}
                onChange={(e) => setCompanyForm({ ...companyForm, perks: e.target.value })}
                placeholder="Health Insurance, Remote Stipend, Learning Budget, Stock Options, Flexible Hours"
              />
            </div>

            <h4 style={{ borderTop: "1px solid var(--border)", paddingTop: 16, margin: "20px 0 12px", fontSize: 15 }}>
              Primary Hiring Contact Details
            </h4>

            <div className="row">
              <div className="field">
                <label>Recruiter / Hiring Lead Name</label>
                <input
                  value={companyForm.recruiterName}
                  onChange={(e) => setCompanyForm({ ...companyForm, recruiterName: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Designation / Title</label>
                <input
                  value={companyForm.recruiterTitle}
                  onChange={(e) => setCompanyForm({ ...companyForm, recruiterTitle: e.target.value })}
                  placeholder="Head of Talent Acquisition"
                />
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Contact Phone</label>
                <input
                  value={companyForm.recruiterPhone}
                  onChange={(e) => setCompanyForm({ ...companyForm, recruiterPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="field">
                <label>Recruiter LinkedIn Profile</label>
                <input
                  value={companyForm.recruiterLinkedin}
                  onChange={(e) => setCompanyForm({ ...companyForm, recruiterLinkedin: e.target.value })}
                  placeholder="linkedin.com/in/yourhandle"
                />
              </div>
            </div>

            <button className="btn primary" disabled={companySaving} style={{ marginTop: 12 }}>
              {companySaving ? "Saving Changes..." : "Save Company Profile & Employer Brand 💾"}
            </button>
          </form>

          {/* Live Preview Card (How Candidates See Your Company) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ position: "sticky", top: 90 }}>
              <span className="tag" style={{ background: "var(--soft-indigo)", color: "var(--indigo)", fontWeight: 700, marginBottom: 10 }}>
                👁️ Live Candidate View Preview
              </span>

              <div
                style={{
                  padding: 20,
                  background: "linear-gradient(135deg, var(--soft-indigo), var(--soft-cyan))",
                  borderRadius: 14,
                  border: "1px solid #D9E2FF",
                  marginTop: 10
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: "var(--gradient)",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 20,
                      fontWeight: 800
                    }}
                  >
                    {companyForm.companyName ? companyForm.companyName.charAt(0) : "C"}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 17 }}>{companyForm.companyName || "Your Company Name"}</h3>
                    <small style={{ color: "var(--indigo)", fontWeight: 600 }}>{companyForm.industry}</small>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: "var(--text)", margin: "8px 0 12px", lineHeight: 1.5 }}>
                  {companyForm.tagline || "Your mission tagline will display here to inspire applicants."}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  <span className="tag">📍 {companyForm.location || "Bengaluru, India"}</span>
                  <span className="tag">👥 {companyForm.companySize}</span>
                  {companyForm.website && <span className="tag">🌐 {companyForm.website.replace("https://", "")}</span>}
                </div>

                {companyForm.perks && (
                  <div style={{ fontSize: 12, color: "var(--muted)", borderTop: "1px solid #C7D2FE", paddingTop: 8 }}>
                    🎁 <b>Perks:</b> {companyForm.perks}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 16, fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                💡 <b>Employer Brand Tip:</b> Candidates are 3.5x more likely to accept interview invitations from companies with detailed culture profiles and clear growth perks.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: RECRUITER SETTINGS DASHBOARD */}
      {tab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Settings Cards Grid */}
          <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
            {/* Automation & Screening Rules */}
            <form className="card form" onSubmit={handleSaveSettings} style={{ maxWidth: "100%" }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>Hiring Workflow &amp; AI Screening Automation</h3>
              <p className="muted" style={{ fontSize: 12, margin: "0 0 16px" }}>
                Set automatic candidate screening rules, notification triggers, and default interview stages.
              </p>

              {settingsMsg && (
                <div className={settingsMsg.includes("🎉") ? "success" : "error"} style={{ marginBottom: 14 }}>
                  {settingsMsg}
                </div>
              )}

              <div className="field">
                <label>
                  Minimum AI Skill Match Threshold ({settingsForm.aiThreshold}%)
                </label>
                <input
                  type="range"
                  min={30}
                  max={95}
                  step={5}
                  value={settingsForm.aiThreshold}
                  onChange={(e) => setSettingsForm({ ...settingsForm, aiThreshold: Number(e.target.value) })}
                  style={{ width: "100%", accentColor: "var(--indigo)" }}
                />
                <span className="muted" style={{ fontSize: 12 }}>
                  Candidates with match score &gt;={settingsForm.aiThreshold}% will be automatically highlighted with Top Fit badges.
                </span>
              </div>

              <h4 style={{ margin: "20px 0 10px", fontSize: 15, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                Notification &amp; Digest Preferences
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={settingsForm.emailNotifications}
                    onChange={(e) => setSettingsForm({ ...settingsForm, emailNotifications: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: "var(--indigo)" }}
                  />
                  <span>Send instant email alerts when a new candidate applies</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={settingsForm.dailyDigest}
                    onChange={(e) => setSettingsForm({ ...settingsForm, dailyDigest: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: "var(--indigo)" }}
                  />
                  <span>Send daily candidate summary digest to primary recruiter email</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={settingsForm.interviewReminders}
                    onChange={(e) => setSettingsForm({ ...settingsForm, interviewReminders: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: "var(--indigo)" }}
                  />
                  <span>Send interview schedule reminders 1 hour before meeting</span>
                </label>
              </div>

              <button className="btn primary" disabled={settingsSaving} style={{ marginTop: 20 }}>
                {settingsSaving ? "Saving Preferences..." : "Save Workflow Rules ⚙️"}
              </button>
            </form>

            {/* Account & Password Security Card */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <form className="card form" onSubmit={handleChangePassword} style={{ maxWidth: "100%" }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 17 }}>Security &amp; Password</h3>
                <p className="muted" style={{ fontSize: 12, margin: "0 0 14px" }}>
                  Update your recruiter account login password
                </p>

                {pwdMsg && (
                  <div className={pwdMsg.type === "success" ? "success" : "error"} style={{ marginBottom: 12 }}>
                    {pwdMsg.text}
                  </div>
                )}

                <div className="field">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={currPassword}
                    onChange={(e) => setCurrPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="field">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>

                <div className="field">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                  />
                </div>

                <button className="btn secondary" disabled={pwdSaving} style={{ width: "100%", marginTop: 8 }}>
                  {pwdSaving ? "Updating Password..." : "Update Password 🔒"}
                </button>
              </form>
            </div>
          </div>

          {/* Danger Zone: Recruiter Account Deletion */}
          <section className="card danger-zone" style={{ maxWidth: "100%" }}>
            <h3>Danger Zone: Delete Recruiter Account</h3>
            <p className="muted">
              Permanently delete this recruiter account, all published job opportunities, and associated candidate application records.
            </p>
            <form action="/profile/actions" method="POST" className="delete-form">
              <div className="field" style={{ maxWidth: 460 }}>
                <label htmlFor="recruiter-delete-pwd">Confirm with your account password</label>
                <input
                  id="recruiter-delete-pwd"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter password to confirm"
                />
              </div>
              <button className="btn danger-button" type="submit">
                Delete Recruiter Account Permanently
              </button>
            </form>
          </section>
        </div>
      )}

      {/* EDIT JOB MODAL */}
      {editingJob && (
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
              width: "min(700px, 94vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 25px 70px rgba(15,23,42,.25)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>Edit Opportunity: {editingJob.title}</h3>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--muted)" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateJob} className="form" style={{ maxWidth: "100%" }}>
              <div className="row">
                <div className="field">
                  <label>Title</label>
                  <input
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Type</label>
                  <select
                    value={editingJob.type}
                    onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value })}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="field">
                  <label>Location</label>
                  <input
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Vacancies</label>
                  <input
                    type="number"
                    min={1}
                    value={editingJob.vacancies}
                    onChange={(e) => setEditingJob({ ...editingJob, vacancies: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Required Skills</label>
                <input
                  value={editingJob.requiredSkills}
                  onChange={(e) => setEditingJob({ ...editingJob, requiredSkills: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Description</label>
                <textarea
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
                <button type="button" className="btn secondary" onClick={() => setEditingJob(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary" disabled={editSaving}>
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANDIDATE INSPECTION / REVIEW MODAL */}
      {inspectingApplicant && (
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
              width: "min(780px, 94vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 26,
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 25px 70px rgba(15,23,42,.25)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h2 style={{ margin: 0, fontSize: 22 }}>{inspectingApplicant.user.name}</h2>
                  <span
                    className="tag"
                    style={{
                      background: inspectingApplicant.matchScore >= 70 ? "#ECFDF5" : "var(--soft-indigo)",
                      color: inspectingApplicant.matchScore >= 70 ? "#047857" : "var(--indigo)",
                      fontWeight: 800
                    }}
                  >
                    {inspectingApplicant.matchScore}% Skill Fit
                  </span>
                </div>
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                  Candidate for: <b>{inspectingApplicant.jobTitle}</b> • Applied on{" "}
                  {new Date(inspectingApplicant.createdAt).toLocaleDateString()}
                </p>
                <div style={{ marginTop: 10 }}>
                  <ResumeViewer studentId={inspectingApplicant.user.id} studentName={inspectingApplicant.user.name} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingApplicant(null)}
                style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--muted)" }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Candidate Details Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "16px 0" }}>
              <div style={{ padding: 14, background: "var(--canvas)", borderRadius: 12, border: "1px solid var(--border)" }}>
                <small className="muted" style={{ fontWeight: 700 }}>ACADEMIC CREDENTIALS</small>
                <p style={{ margin: "4px 0 2px", fontSize: 14, fontWeight: 600 }}>
                  {inspectingApplicant.user.college || "University Scholar"}
                </p>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  {inspectingApplicant.user.degree || "B.Tech"} {inspectingApplicant.user.branch ? `• ${inspectingApplicant.user.branch}` : ""}
                  {inspectingApplicant.user.graduationYear ? ` (${inspectingApplicant.user.graduationYear})` : ""}
                </div>
              </div>

              <div style={{ padding: 14, background: "var(--canvas)", borderRadius: 12, border: "1px solid var(--border)" }}>
                <small className="muted" style={{ fontWeight: 700 }}>CONTACT &amp; PROFILES</small>
                <div style={{ fontSize: 13, margin: "4px 0 2px" }}>
                  ✉️ {inspectingApplicant.user.email}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  📞 {inspectingApplicant.user.phone || "Phone not provided"}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 12 }}>
                  {inspectingApplicant.user.portfolio && (
                    <a href={inspectingApplicant.user.portfolio} target="_blank" rel="noreferrer" style={{ color: "var(--indigo)" }}>
                      Portfolio ↗
                    </a>
                  )}
                  {inspectingApplicant.user.github && (
                    <a href={`https://${inspectingApplicant.user.github.replace("https://", "")}`} target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>
                      GitHub ↗
                    </a>
                  )}
                  {inspectingApplicant.user.linkedin && (
                    <a href={`https://${inspectingApplicant.user.linkedin.replace("https://", "")}`} target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>
                      LinkedIn ↗
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Candidate Bio */}
            {inspectingApplicant.user.bio && (
              <div style={{ margin: "14px 0" }}>
                <small className="muted" style={{ fontWeight: 700 }}>CANDIDATE OBJECTIVE / BIO</small>
                <p style={{ fontSize: 13, color: "var(--text)", margin: "4px 0", lineHeight: 1.6 }}>
                  {inspectingApplicant.user.bio}
                </p>
              </div>
            )}

            {/* Verified Credentials */}
            <div style={{ margin: "16px 0" }}>
              <small className="muted" style={{ fontWeight: 700 }}>VERIFIED SKILL LAB CERTIFICATES</small>
              {inspectingApplicant.user.certificates?.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                  {inspectingApplicant.user.certificates.map((cert: any) => (
                    <div
                      key={cert.certificateNo}
                      style={{
                        padding: "8px 12px",
                        background: "#ECFDF5",
                        border: "1px solid #A7F3D0",
                        borderRadius: 10,
                        fontSize: 12
                      }}
                    >
                      <strong style={{ color: "#047857" }}>🎓 {cert.assessmentTitle}</strong>
                      <span style={{ color: "var(--muted)", marginLeft: 6 }}>• Score: {cert.score}%</span>
                      <small style={{ display: "block", color: "#64748B", fontSize: 10 }}>ID: {cert.certificateNo}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0" }}>No verified certificates unlocked yet.</p>
              )}
            </div>

            {/* Recruiter Evaluation Notes & Status Actions */}
            <form onSubmit={handleSaveEvalNote} style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 16 }}>
              <div className="field">
                <label>Recruiter Evaluation Notes &amp; Feedback</label>
                <textarea
                  value={evalNote}
                  onChange={(e) => setEvalNote(e.target.value)}
                  placeholder="Record interview notes, technical strengths, or screening rationale..."
                  rows={3}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Pipeline Stage:</label>
                  <select
                    value={inspectingApplicant.status}
                    onChange={(e) => handleUpdateStatus(inspectingApplicant.id, e.target.value, evalNote)}
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                    <option value="SELECTED">Selected / Offer</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => {
                      const app = inspectingApplicant;
                      setInspectingApplicant(null);
                      setInterviewModalData({
                        applicationId: app.id,
                        candidateName: app.user.name,
                        jobTitle: app.jobTitle,
                        roundType: "Round 1: Technical Interview",
                        date: new Date().toISOString().split("T")[0],
                        time: "11:00 AM",
                        meetingLink: "https://meet.google.com/new",
                        notes: evalNote || "Scheduled technical interview"
                      });
                    }}
                  >
                    <Calendar size={14} style={{ marginRight: 4 }} /> Schedule Interview
                  </button>

                  <button type="submit" className="btn primary" disabled={evalSaving}>
                    {evalSaving ? "Saving Note..." : "Save Evaluation Note 💾"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {interviewModalData && (
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
              width: "min(640px, 94vw)",
              padding: 24,
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 25px 70px rgba(15,23,42,.25)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>
                  Schedule Interview: {interviewModalData.candidateName}
                </h3>
                <span className="muted" style={{ fontSize: 12 }}>
                  Role: <b>{interviewModalData.jobTitle}</b>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInterviewModalData(null)}
                style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--muted)" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} className="form" style={{ maxWidth: "100%" }}>
              <div className="field">
                <label>Interview Round Type</label>
                <select
                  value={interviewModalData.roundType}
                  onChange={(e) =>
                    setInterviewModalData({ ...interviewModalData, roundType: e.target.value })
                  }
                >
                  <option value="Round 1: Technical Coding & Algorithms">Round 1: Technical Coding &amp; Algorithms</option>
                  <option value="Round 2: System Architecture & Design">Round 2: System Architecture &amp; Design</option>
                  <option value="Round 3: Practical Code Review">Round 3: Practical Code Review</option>
                  <option value="HR & Culture Fit Round">HR &amp; Culture Fit Round</option>
                  <option value="Executive Hiring Manager Round">Executive Hiring Manager Round</option>
                  <option value="Final Offer Discussion">Final Offer Discussion</option>
                </select>
              </div>

              <div className="row">
                <div className="field">
                  <label>Interview Date</label>
                  <input
                    type="date"
                    value={interviewModalData.date}
                    onChange={(e) =>
                      setInterviewModalData({ ...interviewModalData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Interview Time (with Timezone)</label>
                  <input
                    value={interviewModalData.time}
                    onChange={(e) =>
                      setInterviewModalData({ ...interviewModalData, time: e.target.value })
                    }
                    placeholder="e.g. 11:30 AM IST"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Meeting URL / Platform Link</label>
                <input
                  value={interviewModalData.meetingLink}
                  onChange={(e) =>
                    setInterviewModalData({ ...interviewModalData, meetingLink: e.target.value })
                  }
                  placeholder="https://meet.google.com/xyz or Zoom Link"
                  required
                />
              </div>

              <div className="field">
                <label>Interview Agenda / Preparation Notes</label>
                <textarea
                  value={interviewModalData.notes}
                  onChange={(e) =>
                    setInterviewModalData({ ...interviewModalData, notes: e.target.value })
                  }
                  placeholder="Notes for the candidate and interviewer regarding interview expectations..."
                  rows={2}
                />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
                <button type="button" className="btn secondary" onClick={() => setInterviewModalData(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary" disabled={schedulingInterview}>
                  {schedulingInterview ? "Scheduling..." : "Confirm & Send Schedule 📅"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

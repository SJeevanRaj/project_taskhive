'use client';

import { ChangeEvent, useState } from "react";
import { Download, Eye, FileText, Pencil, Save, Upload, X } from "lucide-react";

const fields = [
  ["fullName", "Full name"], ["email", "Email"], ["phone", "Phone"], ["location", "Location"],
  ["studentId", "Student ID"], ["summary", "Career objective / summary"], ["education", "Education"],
  ["skills", "Technical skills"], ["languages", "Programming languages"], ["projects", "Projects"],
  ["internships", "Internships"], ["certifications", "Certifications"], ["achievements", "Achievements"],
  ["experience", "Experience"], ["other", "Other relevant information"]
] as const;

type ResumeContent = Record<(typeof fields)[number][0], string>;

type ResumeMeta = { kind: string; fileName?: string | null; updatedAt?: string; content?: ResumeContent | null; fileData?: string | null; mimeType?: string | null };

const emptyContent = (): ResumeContent => Object.fromEntries(fields.map(([key]) => [key, ""])) as ResumeContent;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}

export default function ResumeManager({ initialResume, user }: { initialResume: ResumeMeta | null; user: any }) {
  const [resume, setResume] = useState<ResumeMeta | null>(initialResume);
  const [content, setContent] = useState<ResumeContent>(() => ({ ...emptyContent(), fullName: user.name, email: user.email, phone: user.phone, studentId: user.studentId }));
  const [mode, setMode] = useState<"idle" | "builder" | "preview">("idle");
  const [preview, setPreview] = useState<ResumeMeta | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function updateContent(key: string, value: string) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setMessage("");
    const data = new FormData();
    data.append("file", file);
    try {
      const response = await fetch("/api/resume", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");
      setResume(result.resume);
      setMode("idle");
      setMessage("Resume uploaded successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload resume.");
    } finally {
      setBusy(false);
    }
  }

  async function saveBuilder() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save resume");
      const saved = { ...result.resume, kind: "BUILDER", content };
      setResume(saved);
      setPreview(saved);
      setMode("preview");
      setMessage("Resume saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save resume.");
    } finally {
      setBusy(false);
    }
  }

  async function viewResume() {
    if (!resume) return;
    setBusy(true);
    try {
      const response = await fetch("/api/resume");
      const result = await response.json();
      if (!response.ok || !result.resume) throw new Error(result.error || "Resume not found");
      setPreview(result.resume);
      if (result.resume.content) setContent({ ...emptyContent(), ...result.resume.content });
      setMode("preview");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to open resume.");
    } finally {
      setBusy(false);
    }
  }

  function downloadResume() {
    if (!preview) return;
    if (preview.fileData) {
      const bytes = Uint8Array.from(atob(preview.fileData), (character) => character.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: preview.mimeType || "application/octet-stream" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = preview.fileName || "resume";
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(content.fullName)} - Resume</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#172033}h1{margin-bottom:4px}h2{border-bottom:2px solid #4f46e5;padding-bottom:5px;color:#4f46e5;font-size:16px}p{white-space:pre-wrap;line-height:1.5}.contact{color:#64748b}</style></head><body><h1>${escapeHtml(content.fullName)}</h1><p class="contact">${escapeHtml([content.email, content.phone, content.location].filter(Boolean).join(" | "))}</p>${fields.slice(5).filter(([key]) => content[key]).map(([key, label]) => `<h2>${escapeHtml(label)}</h2><p>${escapeHtml(content[key])}</p>`).join("")}</body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${content.fullName || "resume"}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const activeContent = preview?.content || content;

  return (
    <section className="card resume-manager" aria-labelledby="resume-title">
      <div className="resume-heading">
        <div>
          <span className="banner-kicker">CAREER DOCUMENTS</span>
          <h2 id="resume-title">Resume</h2>
          <p className="muted">Upload an existing resume or build a recruiter-ready version in your profile.</p>
        </div>
        <span className={`resume-status ${resume ? "resume-status-ready" : ""}`}>{resume ? "Resume Uploaded" : "Resume Not Added"}</span>
      </div>
      {message && <div className="success resume-message">{message}</div>}
      {mode === "idle" && (
        <div className="resume-actions">
          <label className="btn primary"><Upload size={16} /> Upload Resume<input type="file" accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/msword,.doc" onChange={upload} hidden /></label>
          <button type="button" className="btn secondary" onClick={() => setMode("builder")}><FileText size={16} /> Create Resume</button>
          {resume && <button type="button" className="btn secondary" onClick={viewResume} disabled={busy}><Eye size={16} /> View Resume</button>}
          {resume && <label className="btn secondary"><Upload size={16} /> Replace Resume<input type="file" accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/msword,.doc" onChange={upload} hidden /></label>}
        </div>
      )}
      {mode === "builder" && (
        <div className="resume-builder">
          <div className="resume-builder-grid">
            {fields.map(([key, label]) => (
              <label className={`field resume-field resume-field-${key}`} key={key}>
                <span>{label}</span>
                {key === "summary" || key === "education" || key === "projects" || key === "internships" || key === "certifications" || key === "achievements" || key === "experience" || key === "other" ? <textarea rows={key === "summary" ? 4 : 5} value={content[key]} onChange={(event) => updateContent(key, event.target.value)} placeholder={`Add ${label.toLowerCase()}...`} /> : <input value={content[key]} onChange={(event) => updateContent(key, event.target.value)} placeholder={`Add ${label.toLowerCase()}...`} />}
              </label>
            ))}
          </div>
          <div className="resume-actions"><button type="button" className="btn primary" onClick={() => { setPreview({ kind: "BUILDER", content }); setMode("preview"); }}><Eye size={16} /> Preview Resume</button><button type="button" className="btn secondary" onClick={() => setMode("idle")}><X size={16} /> Cancel</button></div>
        </div>
      )}
      {mode === "preview" && (
        <div className="resume-preview-wrap">
          <div className="resume-preview-toolbar"><strong>{preview?.kind === "UPLOAD" ? preview.fileName : `${activeContent.fullName || "Untitled"} Resume`}</strong><div className="resume-actions"><button type="button" className="btn secondary" onClick={downloadResume}><Download size={16} /> Download Resume</button>{preview?.kind === "BUILDER" && <button type="button" className="btn secondary" onClick={() => setMode("builder")}><Pencil size={16} /> Edit Resume</button>}<button type="button" className="btn secondary" onClick={() => setMode("idle")}><X size={16} /> Close</button></div></div>
          {preview?.kind === "UPLOAD" && preview.mimeType === "application/pdf" && preview.fileData ? <iframe className="resume-pdf-preview" title="Resume preview" src={`data:application/pdf;base64,${preview.fileData}`} /> : preview?.kind === "UPLOAD" ? <div className="resume-file-preview"><FileText size={38} color="var(--indigo)" /><h3>{preview.fileName}</h3><p className="muted">DOCX files can be downloaded for viewing in Word or another compatible editor.</p><button type="button" className="btn primary" onClick={downloadResume}><Download size={16} /> Download Resume</button></div> : <article className="resume-document"><h1>{activeContent.fullName || "Your Name"}</h1><p className="resume-contact">{[activeContent.email, activeContent.phone, activeContent.location].filter(Boolean).join(" | ")}</p>{fields.slice(5).map(([key, label]) => activeContent[key] && <section key={key}><h2>{label}</h2><p>{activeContent[key]}</p></section>)}</article>}
          {preview?.kind === "BUILDER" && <button type="button" className="btn primary" onClick={saveBuilder} disabled={busy} style={{ marginTop: 14 }}><Save size={16} /> Save Resume</button>}
        </div>
      )}
    </section>
  );
}

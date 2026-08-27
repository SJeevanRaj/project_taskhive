'use client';

import { useState } from "react";
import { Download, Eye, FileText, X } from "lucide-react";

type ResumeData = {
  kind: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileData?: string | null;
  content?: Record<string, string> | null;
  studentName?: string;
};

export default function ResumeViewer({ studentId, studentName }: { studentId: string; studentName: string }) {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function view() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/resume?studentId=${encodeURIComponent(studentId)}`);
      const data = await response.json();
      if (!response.ok || !data.resume) throw new Error(data.error || "Resume not available");
      setResume(data.resume);
      setOpen(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to open resume");
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!resume?.fileData) return;
    const bytes = Uint8Array.from(atob(resume.fileData), (character) => character.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: resume.mimeType || "application/octet-stream" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = resume.fileName || `${studentName}-resume`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <button type="button" className="btn secondary" onClick={view} disabled={loading} style={{ fontSize: 12, padding: "6px 12px" }}>
        <Eye size={14} /> {loading ? "Opening..." : "View Resume"}
      </button>
      {error && <span className="resume-viewer-error">{error}</span>}
      {open && resume && (
        <div className="resume-viewer-overlay" role="dialog" aria-modal="true" aria-label={`${studentName} resume`}>
          <div className="resume-viewer-dialog">
            <div className="resume-preview-toolbar">
              <div><strong>{studentName}</strong><div className="muted" style={{ fontSize: 12 }}>{resume.fileName || "Generated resume"}</div></div>
              <div className="resume-actions"><button type="button" className="btn secondary" onClick={download} disabled={!resume.fileData}><Download size={15} /> Download</button><button type="button" className="btn secondary" onClick={() => setOpen(false)} aria-label="Close resume"><X size={16} /></button></div>
            </div>
            {resume.kind === "UPLOAD" && resume.mimeType === "application/pdf" && resume.fileData ? <iframe className="resume-pdf-preview" title={`${studentName} resume`} src={`data:application/pdf;base64,${resume.fileData}`} /> : resume.kind === "UPLOAD" ? <div className="resume-file-preview"><FileText size={42} color="var(--indigo)" /><h3>{resume.fileName}</h3><p className="muted">Download this DOCX file to view the full resume.</p><button type="button" className="btn primary" onClick={download}><Download size={16} /> Download Resume</button></div> : <article className="resume-document"><h1>{resume.content?.fullName || studentName}</h1><p className="resume-contact">{[resume.content?.email, resume.content?.phone, resume.content?.location].filter(Boolean).join(" | ")}</p>{Object.entries(resume.content || {}).slice(5).map(([key, value]) => value && <section key={key}><h2>{key.replace(/^[a-z]/, (letter) => letter.toUpperCase())}</h2><p>{value}</p></section>)}</article>}
          </div>
        </div>
      )}
    </>
  );
}

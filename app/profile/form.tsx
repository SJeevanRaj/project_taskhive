'use client';

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Camera, Check, Copy, ImagePlus, Trash2 } from "lucide-react";

export default function ProfileForm({ user, className = "" }: { user: any; className?: string }) {
  const [form, setForm] = useState(user);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  async function openCamera() {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Live camera access is not available in this browser.");
      setCameraOpen(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => undefined);
        }
      });
    } catch {
      setCameraError("Camera permission was denied or the camera is already in use.");
      setCameraOpen(true);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  function closeCamera() {
    stopCamera();
    setCameraOpen(false);
    setCameraError("");
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) {
      setCameraError("Wait for the live camera preview to load, then try again.");
      return;
    }
    const maxDimension = 640;
    const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const profileImage = canvas.toDataURL("image/jpeg", 0.82);
    updateField("profileImage", profileImage);
    void persistProfileImage(profileImage);
    closeCamera();
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMsg("Please choose an image file.");
      return;
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
      const maxDimension = 640;
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
      const profileImage = canvas.toDataURL("image/jpeg", 0.82);
      updateField("profileImage", profileImage);
      void persistProfileImage(profileImage);
      URL.revokeObjectURL(image.src);
      event.target.value = "";
    };
  }

  function removeImage() {
    updateField("profileImage", "");
    void persistProfileImage("");
  }

  function handleCopyId() {
    if (!user.studentId) return;
    navigator.clipboard.writeText(user.studentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function updateField(key: string, value: string) {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  }

  async function persistProfileImage(profileImage: string) {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage })
      });
      if (!response.ok) setMsg("Photo preview updated, but it could not be saved yet.");
    } catch {
      setMsg("Photo preview updated, but it could not be saved yet.");
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const r = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (r.ok) {
        setMsg("🎉 Profile updated successfully! Recruiter match ratings updated.");
      } else {
        const d = await r.json();
        setMsg(d.error || "Unable to save profile.");
      }
    } catch {
      setMsg("Network error saving profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={`card form ${className}`.trim()} onSubmit={save}>
      {/* Prominent Student ID Badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 18px",
          background: "linear-gradient(135deg, var(--soft-indigo), var(--soft-cyan))",
          borderRadius: 14,
          border: "1px solid #C7D2FE",
          marginBottom: 20
        }}
      >
        <div>
          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--indigo)", textTransform: "uppercase", letterSpacing: 0.8 }}>
            ✦ Verified Student Identifier
          </span>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--ink)", marginTop: 2 }}>
            Student ID: <span style={{ color: "var(--indigo)" }}>{user.studentId || "Generating ID..."}</span>
          </div>
          <small style={{ color: "var(--muted)", fontSize: 11 }}>
            Share this ID with hiring companies to let recruiters find and invite you directly.
          </small>
        </div>

        <button
          type="button"
          onClick={handleCopyId}
          className="btn secondary"
          style={{
            fontSize: 12,
            padding: "8px 14px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 2px 8px rgba(79,70,229,.08)"
          }}
        >
          {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
          <span>{copied ? "Copied!" : "Copy Student ID"}</span>
        </button>
      </div>

      {msg && <div className="success" style={{ marginBottom: 18 }}>{msg}</div>}

      <section className="profile-photo" aria-labelledby="profile-photo-title">
        <div className="profile-photo-preview">
          {form.profileImage ? (
            <img src={form.profileImage} alt="Profile preview" />
          ) : (
            <span>{(form.name || "?").charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="profile-photo-content">
          <h3 id="profile-photo-title">Profile Picture</h3>
          <p className="muted">Add a professional photo so recruiters can recognize you.</p>
          <div className="profile-photo-actions">
            <button type="button" className="btn secondary" onClick={openCamera}>
              <Camera size={16} />
              <span>Use Camera</span>
            </button>
            <label className="btn secondary" tabIndex={0}>
              <ImagePlus size={16} />
              <span>Upload from Desktop</span>
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>
            {form.profileImage && (
              <button type="button" className="btn secondary" onClick={removeImage} aria-label="Remove profile picture" title="Remove profile picture">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {cameraOpen && (
        <div className="camera-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="camera-modal-title">
          <div className="camera-modal">
            <div className="camera-modal-header">
              <div>
                <span className="banner-kicker">Live capture</span>
                <h2 id="camera-modal-title">Take your profile photo</h2>
              </div>
              <button type="button" className="camera-close" onClick={closeCamera} aria-label="Close camera">×</button>
            </div>
            {cameraError ? <div className="error">{cameraError}</div> : <video ref={videoRef} className="camera-preview" autoPlay muted playsInline />}
            <div className="camera-modal-actions">
              <button type="button" className="btn secondary" onClick={closeCamera}>Cancel</button>
              {!cameraError && <button type="button" className="btn primary" onClick={capturePhoto}><Camera size={16} /> Capture Photo</button>}
            </div>
          </div>
        </div>
      )}

      <h3 style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10, margin: "0 0 16px" }}>
        Personal & Contact Details
      </h3>

      <div className="row">
        <div className="field">
          <label>Full Name</label>
          <input
            value={form.name || ""}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Email Address (Read-only)</label>
          <input value={form.email || ""} disabled style={{ opacity: 0.7 }} />
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label>Mobile Number</label>
          <input
            value={form.phone || ""}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="+91 98765 00000"
          />
        </div>
        <div className="field">
          <label>Portfolio Website URL</label>
          <input
            value={form.portfolio || ""}
            onChange={(e) => updateField("portfolio", e.target.value)}
            placeholder="https://yourportfolio.dev"
          />
        </div>
      </div>

      <h3 style={{ borderBottom: "1px solid #1c2d45", paddingBottom: 10, margin: "24px 0 16px" }}>
        Academic & College Credentials
      </h3>

      <div className="row">
        <div className="field">
          <label>College / University Name</label>
          <input
            value={form.college || ""}
            onChange={(e) => updateField("college", e.target.value)}
            placeholder="e.g. HireLytix Institute of Technology"
          />
        </div>
        <div className="field">
          <label>Degree</label>
          <input
            value={form.degree || ""}
            onChange={(e) => updateField("degree", e.target.value)}
            placeholder="e.g. B.Tech / B.E."
          />
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label>Branch / Specialization</label>
          <input
            value={form.branch || ""}
            onChange={(e) => updateField("branch", e.target.value)}
            placeholder="e.g. Artificial Intelligence & Data Science"
          />
        </div>
        <div className="field">
          <label>Current Semester & Grad Year</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input
              value={form.semester || ""}
              onChange={(e) => updateField("semester", e.target.value)}
              placeholder="Semester (e.g. 8)"
            />
            <input
              type="number"
              value={form.graduationYear || ""}
              onChange={(e) => updateField("graduationYear", e.target.value)}
              placeholder="Year (e.g. 2026)"
            />
          </div>
        </div>
      </div>

      <h3 style={{ borderBottom: "1px solid #1c2d45", paddingBottom: 10, margin: "24px 0 16px" }}>
        Skills & Social Handles
      </h3>

      <div className="field">
        <label>Skills (Comma-separated list used for AI Match Algorithm)</label>
        <input
          value={form.skills || ""}
          onChange={(e) => updateField("skills", e.target.value)}
          placeholder="Python, React, TypeScript, SQL, Next.js, PyTorch, Docker"
        />
      </div>

      <div className="row">
        <div className="field">
          <label>GitHub Profile</label>
          <input
            value={form.github || ""}
            onChange={(e) => updateField("github", e.target.value)}
            placeholder="github.com/yourhandle"
          />
        </div>
        <div className="field">
          <label>LinkedIn Profile</label>
          <input
            value={form.linkedin || ""}
            onChange={(e) => updateField("linkedin", e.target.value)}
            placeholder="linkedin.com/in/yourhandle"
          />
        </div>
      </div>

      <div className="field">
        <label>Professional Bio / Objective</label>
        <textarea
          value={form.bio || ""}
          onChange={(e) => updateField("bio", e.target.value)}
          placeholder="Brief overview of your technical interests, achievements, and career goals..."
          rows={4}
        />
      </div>

      <button className="btn primary" disabled={saving} style={{ marginTop: 12, padding: "12px 24px" }}>
        {saving ? "Saving Changes..." : "Save Profile & Update Skill Index 💾"}
      </button>
    </form>
  );
}

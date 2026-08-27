'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AssessmentClient({ assessment, sessionId }: { assessment: any; sessionId: string }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [proctoring, setProctoring] = useState(false);
  const [proctoringError, setProctoringError] = useState("");
  const [focusWarning, setFocusWarning] = useState("");
  const [cheatingFlags, setCheatingFlags] = useState<string[]>([]);
  const [violation, setViolation] = useState<{ reason: string; flagCount: number; lockedUntil?: string; attemptId?: string } | null>(null);
  const [lockSeconds, setLockSeconds] = useState(0);
  const violationInFlight = useRef(false);
  const lastViolationAt = useRef(0);
  const noFaceSamples = useRef(0);
  const questions = assessment.questions || [];
  const [seconds, setSeconds] = useState((questions.length || 10) * 60);
  const mediaStream = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const router = useRouter();
  const q = questions[idx];

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!violation?.lockedUntil) return;
    const updateCountdown = () => setLockSeconds(Math.max(0, Math.ceil((new Date(violation.lockedUntil!).getTime() - Date.now()) / 1000)));
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [violation?.lockedUntil]);

  useEffect(() => {
    if (proctoring && seconds === 0 && !busy) submit(true);
  }, [seconds, proctoring, busy]);

  async function startProctoredTest() {
    setProctoringError("");
    try {
      await document.documentElement.requestFullscreen();
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("media-unavailable");
      mediaStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setProctoring(true);
    } catch {
      setProctoringError("Camera, microphone, and fullscreen access are required to start this test.");
    }
  }

  async function reportViolation(flag: string, reason: string) {
    if (violationInFlight.current || violation?.attemptId) return;
    const now = Date.now();
    if (now - lastViolationAt.current < 1200) return;
    lastViolationAt.current = now;
    violationInFlight.current = true;
    setFocusWarning(reason);
    try {
      const response = await fetch("/api/assessments/violation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, flag, reason })
      });
      const data = await response.json();
      if (response.ok && data.status === "WARNING") {
        setCheatingFlags([flag]);
        setViolation({ reason: data.reason, flagCount: 1 });
      } else if (response.ok && data.status === "TERMINATED") {
        setCheatingFlags((current) => current.length ? [...current, flag] : [flag]);
        setViolation({ reason: data.reason, flagCount: 2, lockedUntil: data.lockedUntil, attemptId: data.attemptId });
        setProctoring(false);
        mediaStream.current?.getTracks().forEach((track) => track.stop());
        if (data.attemptId) window.setTimeout(() => router.push(`/assessment/result/${data.attemptId}`), 3000);
      }
    } finally {
      violationInFlight.current = false;
    }
  }

  useEffect(() => {
    if (!proctoring) return;
    const addFlag = (flag: string, warning: string) => { void reportViolation(flag, warning); };
    const handleVisibility = () => {
      if (document.hidden) addFlag("TAB_SWITCH", "Tab switching detected. Return to this test to continue.");
    };
    const handleBlur = () => addFlag("WINDOW_BLUR", "Focus lost. Keep this test window active.");
    const handleFocus = () => setFocusWarning("");
    const handleFullscreen = () => {
      if (!document.fullscreenElement) addFlag("FULLSCREEN_EXIT", "Fullscreen was exited. Re-enter fullscreen to continue the test.");
    };
    const blockShortcuts = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && ["c", "p", "s", "u"].includes(key)) {
        event.preventDefault();
        if (key === "c") addFlag("COPY_ATTEMPT", "Copying exam content is not allowed.");
        if (key === "p" || key === "s") addFlag("SCREENSHOT_ATTEMPT", "Screenshot or print capture is not allowed.");
      }
      if (event.key === "PrintScreen") { event.preventDefault(); addFlag("SCREENSHOT_ATTEMPT", "Screenshot capture is not allowed during this exam."); }
    };
    const blockClipboard = (event: ClipboardEvent) => {
      event.preventDefault();
      addFlag("COPY_ATTEMPT", "Copying or pasting exam content is not allowed.");
    };
    const blockContextMenu = (event: MouseEvent) => event.preventDefault();
    const video = videoRef.current;
    if (video) {
      video.srcObject = mediaStream.current;
      video.play().catch(() => undefined);
    }
    const FaceDetector = (window as any).FaceDetector;
    const detector = FaceDetector ? new FaceDetector({ fastMode: true, maxDetectedFaces: 3 }) : null;
    let faceTimer: number | undefined;
    if (detector && video) {
      faceTimer = window.setInterval(async () => {
        try {
          const faces = await detector.detect(video);
          if (faces.length === 0) {
            noFaceSamples.current += 1;
            if (noFaceSamples.current >= 3) {
              addFlag("LOOKING_AWAY", "No face detected for several seconds. Look at the exam screen.");
              noFaceSamples.current = 0;
            }
          } else {
            noFaceSamples.current = 0;
          }
          if (faces.length > 1) addFlag("MULTIPLE_FACES", "Multiple faces detected. Only the test taker may be visible.");
        } catch {
          // Camera monitoring remains active even when face detection is unavailable.
        }
      }, 1500);
    }
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("keydown", blockShortcuts);
    document.addEventListener("copy", blockClipboard);
    document.addEventListener("cut", blockClipboard);
    document.addEventListener("paste", blockClipboard);
    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("fullscreenchange", handleFullscreen);
    const cameraTrack = mediaStream.current?.getVideoTracks()[0];
    if (cameraTrack) cameraTrack.onended = () => addFlag("CAMERA_STOPPED", "The proctoring camera was stopped.");
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("keydown", blockShortcuts);
      document.removeEventListener("copy", blockClipboard);
      document.removeEventListener("cut", blockClipboard);
      document.removeEventListener("paste", blockClipboard);
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("fullscreenchange", handleFullscreen);
      if (cameraTrack) cameraTrack.onended = null;
      if (faceTimer) window.clearInterval(faceTimer);
      mediaStream.current?.getTracks().forEach((track) => track.stop());
    };
  }, [proctoring]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  async function submit(force = false) {
    if (!force && answeredCount < questions.length) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${questions.length} questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    setBusy(true);
    try {
      const r = await fetch("/api/assessments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers, cheatingFlags })
      });
      const d = await r.json();
      if (!r.ok) {
        alert(d.error || "Submission failed");
        setBusy(false);
        return;
      }
      router.push(`/assessment/result/${d.id}`);
    } catch {
      alert("An unexpected error occurred while submitting.");
      setBusy(false);
    }
  }

  if (!q) {
    return <div className="card">No questions found in this assessment.</div>;
  }

  if (violation?.attemptId) {
    return <div className="proctor-terminated"><div className="proctor-terminated-card"><div className="violation-symbol">!</div><span className="banner-kicker">Exam terminated</span><h1>Multiple violations detected</h1><p>{violation.reason}</p><strong>This assessment is locked for you for 24 hours.</strong><div className="lock-countdown">{Math.floor(lockSeconds / 3600).toString().padStart(2, "0")}:{Math.floor((lockSeconds % 3600) / 60).toString().padStart(2, "0")}:{(lockSeconds % 60).toString().padStart(2, "0")}</div><small>You will be redirected to your terminated exam report.</small></div></div>;
  }

  if (!proctoring) {
    return <div className="proctor-gate card">
      <span className="tag">SECURE ASSESSMENT</span>
      <h1>Start {assessment.title}</h1>
      <p className="muted">This 15-question test uses your camera, microphone, fullscreen mode, and focus state for best-effort exam monitoring.</p>
      <ul className="proctor-checks"><li>Camera and microphone access</li><li>Fullscreen test window</li><li>Tab and focus change alerts</li><li>Screen-capture shortcuts restricted where the browser allows</li></ul>
      {proctoringError && <div className="error">{proctoringError}</div>}
      <button className="btn primary" onClick={startProctoredTest}>Allow Access &amp; Start Test</button>
    </div>;
  }

  return (
    <div className="mcq">
      <video ref={videoRef} className="proctor-camera" autoPlay muted playsInline aria-label="Proctoring camera preview" />
      {focusWarning && <div className="error proctor-warning">{focusWarning}</div>}
      {violation && <div className="violation-popup"><div className="violation-icon">{violation.flagCount === 1 ? "!" : "×"}</div><div><strong>Proctoring warning</strong><p>{violation.reason}</p><small>Flag status: {violation.flagCount} of 2</small></div></div>}
      <div className="page-title">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="tag" style={{ background: "#e5d7c0", color: "#40504b" }}>{assessment.course}</span>
            <span className="tag">{assessment.semester}</span>
          </div>
          <h1>{assessment.title}</h1>
          <p className="muted">
            Question {idx + 1} of {questions.length} • {answeredCount} answered ({progressPct}%)
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="timer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
            ⏱ {formatTime(seconds)}
          </span>
          <Link href="/assessment" className="btn secondary" style={{ padding: "8px 14px", fontSize: 13 }}>
            Exit Test
          </Link>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bar" style={{ marginBottom: 20, height: 6 }}>
        <i style={{ width: `${progressPct}%` }} />
      </div>

      {/* Question Card */}
      <div className="card" style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span className="tag" style={{ background: "#e5d7c0", color: "#40504b" }}>
            Topic: {q.topic}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <span className="tag" style={{
              background: "#e5d7c0",
              color: q.difficulty === "Easy" ? "#34d399" : q.difficulty === "Medium" ? "#fbbf24" : "#f87171"
            }}>
              {q.difficulty}
            </span>
            <span className="tag">{q.marks || 1} mark</span>
          </div>
        </div>

        <h2 style={{ fontSize: 20, lineHeight: 1.45, margin: "16px 0 24px" }}>{q.text}</h2>

        <div className="options-list">
          {q.options.map((opt: string, i: number) => {
            const isSelected = answers[q.id] === i;
            return (
              <label
                className={`option ${isSelected ? 'option-selected' : ''}`}
                key={opt}
                style={{
                  borderColor: isSelected ? "#7c5cff" : undefined,
                  background: isSelected ? "#e9dcc4" : undefined
                }}
              >
                <input
                  type="radio"
                  name={q.id}
                  checked={isSelected}
                  onChange={() => setAnswers({ ...answers, [q.id]: i })}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>

        {/* Navigation & Question Palette */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 30, paddingTop: 20, borderTop: "1px solid #1c2d45" }}>
          <button
            className="btn secondary"
            disabled={idx === 0}
            onClick={() => setIdx(idx - 1)}
          >
            ← Previous
          </button>

          {/* Question Dots */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
            {questions.map((item: any, i: number) => {
              const isAnswered = answers[item.id] !== undefined;
              const isCurrent = i === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setIdx(i)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: isCurrent ? "2px solid #7c5cff" : "1px solid #29405e",
                    background: "#e5d7c0",
                    color: "#40504b"
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {idx < questions.length - 1 ? (
            <button className="btn primary" onClick={() => setIdx(idx + 1)}>
              Next →
            </button>
          ) : (
            <button className="btn primary" onClick={() => submit()} disabled={busy} style={{ background: "#c9a66b" }}>
              {busy ? "Analyzing with AI..." : "Submit & View Report 🚀"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
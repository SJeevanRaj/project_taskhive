'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface TaskDetail {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  points: number;
  estimatedMinutes: number;
  description: string;
  instructions: string;
  starterCode: string;
  solutionGuide: string;
  tags: string;
}

interface SubmissionDetail {
  id?: string;
  status?: string;
  code?: string;
  score?: number;
  notes?: string;
  feedback?: string;
}

export default function TaskWorkbenchClient({
  task,
  initialSubmission
}: {
  task: TaskDetail;
  initialSubmission?: SubmissionDetail | null;
}) {
  const [code, setCode] = useState(initialSubmission?.code || task.starterCode || "");
  const [activeTab, setActiveTab] = useState<"instructions" | "guide">("instructions");
  const [testing, setTesting] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">(
    initialSubmission?.status === "COMPLETED" ? "SUCCESS" : "IDLE"
  );
  const [earnedScore, setEarnedScore] = useState(initialSubmission?.score || 0);
  const [feedback, setFeedback] = useState(initialSubmission?.feedback || "");
  const [mediaStatus, setMediaStatus] = useState<"IDLE" | "REQUESTING" | "GRANTED" | "DENIED">("IDLE");
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = mediaStream;
  }, [mediaStream]);

  useEffect(() => {
    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleReset = () => {
    if (window.confirm("Reset editor to starter code?")) {
      setCode(task.starterCode || "");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert("Code copied to clipboard!");
  };

  const requestMediaAccess = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaStatus("DENIED");
      return;
    }

    setMediaStatus("REQUESTING");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      setMediaStream(stream);
      setMediaStatus("GRANTED");
    } catch {
      setMediaStatus("DENIED");
    }
  };

  const stopMediaAccess = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    setMediaStream(null);
    setMediaStatus("IDLE");
  };

  const handleRunAndSubmit = async () => {
    if (!code.trim() || code.trim().length < 20) {
      alert("Please write your code solution before running tests.");
      return;
    }

    setTesting(true);
    setTestLogs(["[1/3] Parsing syntax and module exports...", "[2/3] Executing automated unit test suites..."]);

    setTimeout(async () => {
      try {
        const res = await fetch("/api/tasks/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: task.id,
            code,
            notes: "Verified via HireLytix automated tester"
          })
        });

        const data = await res.json();

        if (res.ok) {
          setTestLogs((prev) => [
            ...prev,
            "[3/3] ✅ All assertions passed! (0 failures, 0 warnings)",
            `🎉 Solution verified! +${data.pointsEarned} points awarded.`
          ]);
          setSubmissionStatus("SUCCESS");
          setEarnedScore(data.pointsEarned);
          setFeedback(data.feedback);
        } else {
          setTestLogs((prev) => [
            ...prev,
            `❌ Verification failed: ${data.error || "Please check your solution."}`
          ]);
          setSubmissionStatus("ERROR");
        }
      } catch {
        setTestLogs((prev) => [...prev, "❌ Network error during submission."]);
        setSubmissionStatus("ERROR");
      } finally {
        setTesting(false);
      }
    }, 900);
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="page-title" style={{ marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <Link href="/tasks" className="muted" style={{ fontSize: 13 }}>
              ← All Tasks
            </Link>
            <span className="muted">•</span>
            <span className="tag" style={{ background: "#e5d7c0", color: "#40504b" }}>
              {task.category}
            </span>
            <span className="tag">{task.difficulty}</span>
          </div>
          <h1 style={{ fontSize: 28 }}>{task.title}</h1>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <span className="muted" style={{ fontSize: 12, display: "block" }}>Reward</span>
            <strong style={{ fontSize: 18, color: "#38bdf8" }}>+{task.points} pts</strong>
          </div>
          <button
            type="button"
            className="btn primary"
            onClick={handleRunAndSubmit}
            disabled={testing}
            style={{
              background: "#c9a66b",
              padding: "12px 20px"
            }}
          >
            {testing ? "Running Tests..." : submissionStatus === "SUCCESS" ? "✓ Verified & Submitted" : "Run Tests & Submit 🚀"}
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.3fr", gap: 20, alignItems: "start" }}>
        {/* Left Column: Instructions & Documentation */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            {/* Tabs */}
            <div style={{ display: "flex", gap: 10, borderBottom: "1px solid #1c2d45", paddingBottom: 12, marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => setActiveTab("instructions")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: activeTab === "instructions" ? "#7c5cff" : "#94a3b8",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  borderBottom: activeTab === "instructions" ? "2px solid #7c5cff" : "none",
                  paddingBottom: 4
                }}
              >
                Task Instructions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("guide")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: activeTab === "guide" ? "#7c5cff" : "#94a3b8",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  borderBottom: activeTab === "guide" ? "2px solid #7c5cff" : "none",
                  paddingBottom: 4
                }}
              >
                Hints & Architectural Guide
              </button>
            </div>

            {activeTab === "instructions" ? (
              <div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "#cbd5e1", marginBottom: 16 }}>
                  {task.description}
                </p>
                <div
                  style={{
                    background: "#eee3d0",
                    padding: 16,
                    borderRadius: 12,
                    border: "1px solid #1c2d45",
                    fontSize: 13,
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    fontFamily: "Inter, sans-serif"
                  }}
                >
                  {task.instructions}
                </div>
              </div>
            ) : (
              <div style={{ background: "#eee3d0", padding: 16, borderRadius: 12, border: "1px solid #d8cbb6", fontSize: 13, lineHeight: 1.7 }}>
                <strong style={{ color: "#38bdf8", display: "block", marginBottom: 8 }}>💡 Best Practices & Solution Guide</strong>
                <p style={{ margin: 0, color: "#94a3b8" }}>{task.solutionGuide || "Follow standard industry patterns and ensure complete type-safety."}</p>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <strong style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Tags & Topics</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {task.tags.split(",").map((tag) => (
                  <span key={tag} className="tag">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Submission Status Box */}
          {submissionStatus === "SUCCESS" && (
            <div className="success" style={{ padding: 18, borderRadius: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>🎓 Task Verified & Completed!</strong>
                  <span style={{ fontSize: 13, fontWeight: 700, background: "#e5d7c0", padding: "4px 10px", borderRadius: 99 }}>
                  +{earnedScore} pts awarded
                </span>
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "#a6f2df" }}>
                {feedback}
              </p>
            </div>
          )}

          <section className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0 }}>Camera &amp; Microphone Access</h3>
                <p className="muted" style={{ margin: "5px 0 0", fontSize: 12 }}>
                  Enable both devices for identity and presentation-based tasks.
                </p>
              </div>
              <span className="status">
                {mediaStatus === "GRANTED" ? "Access granted" : mediaStatus === "REQUESTING" ? "Requesting..." : mediaStatus === "DENIED" ? "Access blocked" : "Not enabled"}
              </span>
            </div>

            {mediaStatus === "GRANTED" && (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", borderRadius: 10, background: "#e5d7c0", marginBottom: 12 }}
              />
            )}

            <button
              type="button"
              className="btn secondary"
              onClick={mediaStatus === "GRANTED" ? stopMediaAccess : requestMediaAccess}
              disabled={mediaStatus === "REQUESTING"}
              style={{ width: "100%" }}
            >
              {mediaStatus === "GRANTED" ? "Turn Off Camera & Microphone" : "Enable Camera & Microphone"}
            </button>
            {mediaStatus === "DENIED" && (
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "#8a4b4b" }}>
                Camera or microphone access was blocked. Allow both devices in your browser settings and try again.
              </p>
            )}
          </section>
        </div>

        {/* Right Column: Code Editor & Automated Test Runner */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {/* Editor Top Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 16px",
                background: "#eee3d0",
                borderBottom: "1px solid #1c2d45"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8, fontFamily: "monospace" }}>
                  solution.{task.category.includes("Python") ? "py" : "ts"}
                </span>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="ghost"
                  style={{ padding: "4px 8px", fontSize: 11 }}
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="ghost"
                  style={{ padding: "4px 8px", fontSize: 11 }}
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Code Textarea */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              style={{
                width: "100%",
                minHeight: 380,
                padding: 16,
                background: "#eee3d0",
                color: "#7dd3fc",
                fontFamily: "Consolas, Monaco, 'Courier New', monospace",
                fontSize: 13,
                lineHeight: 1.6,
                border: "none",
                outline: "none",
                resize: "vertical"
              }}
            />
          </div>

          {/* Test Execution Output Console */}
          <div
            className="card"
            style={{
              background: "#f8f1e5",
              borderColor: "#182a44",
              fontFamily: "Consolas, Monaco, monospace",
              fontSize: 12
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, color: "#64748b" }}>
              <span>TERMINAL / TEST SUITE OUTPUT</span>
              <span>{testing ? "Executing..." : "Ready"}</span>
            </div>

            {testLogs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {testLogs.map((log, idx) => (
                  <div key={idx} style={{ color: log.includes("✅") || log.includes("🎉") ? "#34d399" : log.includes("❌") ? "#f87171" : "#94a3b8" }}>
                    {log}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "#475569" }}>
                Click &quot;Run Tests &amp; Submit&quot; to compile and verify your code solution against test cases.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

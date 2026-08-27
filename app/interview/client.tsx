'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { interviewRoles, questionsForRole, type InterviewQuestion } from "@/lib/interview";

const difficulties = ["Beginner", "Intermediate", "Advanced"];
const interviewTypes = ["Technical", "HR", "Mixed"];
const durations = [10, 20, 30];

export default function InterviewClient({ initialRole = "" }: { initialRole?: string }) {
  const [role, setRole] = useState(initialRole || "Full Stack Developer");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [interviewType, setInterviewType] = useState("Mixed");
  const [duration, setDuration] = useState(20);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [recording, setRecording] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [seconds, setSeconds] = useState(20 * 60);
  const router = useRouter();
  const questions = questionsForRole(role);
  const question: InterviewQuestion = questions[index];
  const recognition = useRef<any>(null);
  const questionId = useRef(question.id);

  useEffect(() => {
    questionId.current = question.id;
  }, [question.id]);

  useEffect(() => {
    if (!started) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [started]);

  function startInterview() {
    setSeconds(duration * 60);
    setStarted(true);
    setIndex(0);
    setAnswers({});
  }

  function toggleVoice() {
    setVoiceError("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceError("Voice input is not supported in this browser. You can type your answer instead."); return; }
    if (recording) { recognition.current?.stop(); setRecording(false); return; }
    const nextRecognition = new SpeechRecognition();
    nextRecognition.continuous = true;
    nextRecognition.interimResults = true;
    nextRecognition.lang = "en-US";
    nextRecognition.onstart = () => setRecording(true);
    nextRecognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      setAnswers((current) => ({ ...current, [questionId.current]: `${current[questionId.current] || ""} ${transcript}`.trim() }));
    };
    nextRecognition.onerror = (event: any) => {
      const message = event.error === "not-allowed" || event.error === "service-not-allowed"
        ? "Microphone access was blocked. Allow microphone access in your browser and try again."
        : "Microphone input could not be read. Check your microphone and browser permission.";
      setVoiceError(message);
      setRecording(false);
    };
    nextRecognition.onend = () => setRecording(false);
    recognition.current = nextRecognition;
    try {
      nextRecognition.start();
    } catch {
      setVoiceError("Could not start voice input. Allow microphone access and try again.");
      setRecording(false);
      recognition.current = null;
    }
  }

  async function finish() {
    recognition.current?.stop();
    setRecording(false);
    const response = await fetch("/api/interviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role, difficulty, interviewType, duration, answers }) });
    const result = await response.json();
    if (response.ok) router.push(`/interview/${result.id}`);
  }

  const time = `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  if (started) return <section className="mock-interview-screen card">
    <div className="interview-screen-main">
      <div className="interview-screen-top"><span className="tag">AI INTERVIEWER</span><span className="interview-timer">◷ {time}</span></div>
      <div className="interview-question-meta"><span>Question {index + 1} of {questions.length}</span><span>{question.category}</span></div>
      <div className="interviewer-bubble"><div className="ai-avatar">AI</div><div><small>AI interviewer</small><h2>{question.prompt}</h2></div></div>
      <div className="answer-area"><textarea value={answers[question.id] || ""} onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value })} placeholder="Type your answer here or use voice input..." rows={7} />
        <div className="answer-controls"><button className={`btn ${recording ? "recording-button" : "secondary"}`} onClick={toggleVoice}>{recording ? "🎙 Listening..." : "🎙 Start Answer"}</button><span className="muted">Your answer is evaluated after submission.</span></div>{voiceError && <div className="error">{voiceError}</div>}
      </div>
      <div className="interview-bottom"><div className="interview-progress"><i style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div><button className="btn primary" disabled={!answers[question.id]?.trim()} onClick={() => index === questions.length - 1 ? finish() : setIndex(index + 1)}>{index === questions.length - 1 ? "Finish & Get Feedback" : "Next Question →"}</button></div>
    </div>
    <aside className="interview-progress-card"><h3>Interview Progress</h3>{questions.map((item, itemIndex) => <div className={`progress-step ${itemIndex < index ? "done" : itemIndex === index ? "current" : ""}`} key={item.id}><span>{itemIndex < index ? "✓" : itemIndex === index ? "●" : "○"}</span>{item.category}</div>)}</aside>
  </section>;

  return <section id="setup" className="interview-setup card"><div><span className="banner-kicker">YOUR SESSION</span><h2>Set up your mock interview</h2><p className="muted">Customize the conversation to match the role you want next.</p></div><div className="setup-grid"><label>Job Role<select value={role} onChange={(event) => setRole(event.target.value)}>{interviewRoles.map((item) => <option key={item}>{item}</option>)}</select></label><label>Difficulty<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>{difficulties.map((item) => <option key={item}>{item}</option>)}</select></label><label>Interview Type<select value={interviewType} onChange={(event) => setInterviewType(event.target.value)}>{interviewTypes.map((item) => <option key={item}>{item}</option>)}</select></label><label>Duration<select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>{durations.map((item) => <option key={item} value={item}>{item} minutes</option>)}</select></label></div><button className="btn primary" onClick={startInterview}>Start Interview →</button></section>;
}

declare global { interface Window { SpeechRecognition?: any; webkitSpeechRecognition?: any; } }

'use client';

import { useState } from "react";
import { Check, Star } from "lucide-react";

export default function FeedbackForm({ attemptId }: { attemptId: string }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!rating) return;
    setBusy(true);
    const response = await fetch("/api/assessment-feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attemptId, rating, feedback }) });
    setBusy(false);
    if (response.ok) setSent(true);
  }

  if (sent) return <div className="feedback-success"><Check size={18} /> Thanks for rating this assessment.</div>;
  return <form className="assessment-feedback" onSubmit={submit}><div><h3>How was this assessment?</h3><p className="muted">Rate the course experience and help us improve future assessments.</p></div><div className="rating-stars" aria-label="Assessment rating">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} className={value <= rating ? "rating-star active" : "rating-star"} onClick={() => setRating(value)} aria-label={`${value} star${value === 1 ? "" : "s"}`}><Star size={22} fill="currentColor" /></button>)}</div><textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Share feedback about the questions, difficulty, or experience..." maxLength={1000} /><button className="btn primary" type="submit" disabled={!rating || busy}>{busy ? "Saving..." : "Submit feedback"}</button></form>;
}

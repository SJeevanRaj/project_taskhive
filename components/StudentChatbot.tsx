'use client';

import { FormEvent, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";

type Message = { from: "user" | "ai"; text: string };

function MessageContent({ text }: { text: string }) {
  const parts = text.split(/```(?:[a-zA-Z0-9+#.-]+)?\n?([\s\S]*?)```/g);
  return <>{parts.map((part, index) => index % 2 === 1 ? <pre className="chatbot-code" key={index}><code>{part.trim()}</code></pre> : <span className="chatbot-text" key={index}>{part}</span>)}</>;
}

const suggestions = ["Explain a concept", "Help me debug code", "How can I improve my skills?", "What should I learn next?"];

export default function StudentChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  function openChat() {
    setOpen(true);
    if (!messages.length) setMessages([{ from: "ai", text: "Hi! I’m HireLytix AI. What would you like to learn today?" }]);
  }

  function closeChat() {
    setOpen(false);
    setMessages([]);
    setInput("");
    setTyping(false);
  }

  async function send(text = input) {
    const question = text.trim();
    if (!question || typing) return;
    setInput("");
    setMessages((current) => [...current, { from: "user", text: question }]);
    setTyping(true);
    try {
      const history = [...messages, { from: "user" as const, text: question }].map((message) => ({
        role: message.from === "user" ? "user" : "assistant",
        content: message.text
      }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history })
      });
      const data = await response.json();
      setMessages((current) => [...current, { from: "ai", text: response.ok ? data.answer : data.error || "I could not answer that right now. Please try again." }]);
    } catch {
      setMessages((current) => [...current, { from: "ai", text: "I could not reach the learning assistant. Check your connection and try again." }]);
    } finally {
      setTyping(false);
    }
  }

  function submit(event: FormEvent) { event.preventDefault(); send(); }

  return <div className={`student-chatbot ${open ? "is-open" : ""}`}>
    {open && <section className="chatbot-window" aria-label="HireLytix AI assistant">
      <header className="chatbot-header"><span className="chatbot-avatar"><Bot size={18} /></span><span><strong>HireLytix AI</strong><small>Ask me anything about your learning</small></span><button type="button" className="chatbot-close" onClick={closeChat} aria-label="Close chat"><X size={18} /></button></header>
      <div className="chatbot-messages" aria-live="polite">
        {messages.map((message, index) => <div className={`chat-message ${message.from}`} key={`${message.from}-${index}`}><MessageContent text={message.text} /></div>)}
        {typing && <div className="chat-typing"><i /><i /><i /></div>}
        {messages.length === 1 && !typing && <div className="chat-suggestions">{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => send(suggestion)}>{suggestion}</button>)}</div>}
      </div>
      <form className="chatbot-form" onSubmit={submit}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask your doubt..." aria-label="Ask your doubt" /><button type="submit" aria-label="Send message"><Send size={17} /></button></form>
    </section>}
    <button type="button" className="chatbot-launcher" onClick={open ? closeChat : openChat} aria-label={open ? "Close HireLytix AI" : "Open HireLytix AI"}>{open ? <X size={23} /> : <MessageCircle size={24} />}</button>
  </div>;
}

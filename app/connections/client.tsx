'use client';

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Building2, Check, MapPin, MessageCircle, Search, Send, UserRound, X } from "lucide-react";

type Recruiter = { id: string; recruiterUserId: string; name: string; title: string; company: string; companyId: string; location: string; industry: string; photo: string; activelyHiring: boolean; roles: string[]; skills: string[]; experience: string; openings: number; match: number; about: string; status: string; connectionId: string | null; lastInteraction: string | null };
type Message = { id: string; senderId: string; body: string; createdAt: string };

const defaultMessage = (name: string) => `Hi ${name}, I am interested in the opportunities available at your company. I would like to connect and learn more about suitable roles.`;

export default function ConnectionsClient({ studentName }: { studentName: string }) {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("All industries");
  const [location, setLocation] = useState("All locations");
  const [skill, setSkill] = useState("All skills");
  const [experience, setExperience] = useState("All experience levels");
  const [selected, setSelected] = useState<Recruiter | null>(null);
  const [connectTarget, setConnectTarget] = useState<Recruiter | null>(null);
  const [messageTarget, setMessageTarget] = useState<Recruiter | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  async function load(search = "") {
    const response = await fetch(`/api/connections?q=${encodeURIComponent(search)}`);
    if (response.ok) setRecruiters((await response.json()).recruiters || []);
  }
  useEffect(() => { load(); }, []);

  const industries = useMemo(() => ["All industries", ...new Set(recruiters.map((r) => r.industry))], [recruiters]);
  const locations = useMemo(() => ["All locations", ...new Set(recruiters.map((r) => r.location))], [recruiters]);
  const skills = useMemo(() => ["All skills", ...new Set(recruiters.flatMap((r) => r.skills))], [recruiters]);
  const filtered = recruiters.filter((r) => (industry === "All industries" || r.industry === industry) && (location === "All locations" || r.location === location) && (skill === "All skills" || r.skills.includes(skill)) && (experience === "All experience levels" || r.experience.toLowerCase().includes(experience.toLowerCase().replace(" years", ""))) && (!query || `${r.name} ${r.company} ${r.roles.join(" ")} ${r.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase())));
  const connected = recruiters.filter((r) => ["CONNECTED", "ACCEPTED"].includes(r.status));
  const recommended = filtered.slice(0, 3);

  async function sendConnection() {
    if (!connectTarget) return;
    setBusy(true);
    const response = await fetch("/api/connections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recruiterId: connectTarget.id, message: message || defaultMessage(connectTarget.name) }) });
    setBusy(false);
    if (response.ok) { setConnectTarget(null); setMessage(""); await load(query); }
  }

  async function openChat(target: Recruiter) {
    setMessageTarget(target); setMessages([]);
    if (!target.connectionId) return;
    const response = await fetch(`/api/connections/${target.connectionId}/messages`);
    if (response.ok) setMessages((await response.json()).messages || []);
  }
  async function sendMessage() {
    if (!messageTarget?.connectionId || !draft.trim()) return;
    setBusy(true);
    const response = await fetch(`/api/connections/${messageTarget.connectionId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: draft }) });
    setBusy(false);
    if (response.ok) { const data = await response.json(); setMessages((current) => [...current, data.message]); setDraft(""); }
  }

  return <div className="connections-page">
    <div className="page-title connections-heading"><div><span className="banner-kicker">Career network</span><h1>Connect with Recruiters</h1><p className="muted">Build professional connections and discover career opportunities</p></div><div className="connections-summary"><strong>{connected.length}</strong><span>My connections</span></div></div>
    <section className="card recommended-recruiters"><div className="section-heading"><div><span className="banner-kicker">AI skill analysis</span><h2>Recommended for You</h2></div><span className="tag">Based on {studentName.split(" ")[0]}'s profile</span></div><div className="recommendation-grid">{recommended.map((r) => <button className="recommendation-item" key={r.id} onClick={() => setSelected(r)}><div className="avatar avatar-small">{r.photo ? <img src={r.photo} alt="" /> : r.name.charAt(0)}</div><div><strong>{r.name}</strong><span>{r.title} at {r.company}</span><small>{r.match}% Match · Skills align with current openings</small></div><b>{r.match}%</b></button>)}</div></section>
    <div className="connections-toolbar"><label className="connection-search"><Search size={18} /><input value={query} onChange={(e) => { setQuery(e.target.value); load(e.target.value); }} placeholder="Search recruiters or companies..." /></label><select value={industry} onChange={(e) => setIndustry(e.target.value)}><option>All industries</option>{industries.slice(1).map((item) => <option key={item}>{item}</option>)}</select><select value={location} onChange={(e) => setLocation(e.target.value)}><option>All locations</option>{locations.slice(1).map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Skills" value={skill} onChange={(e) => setSkill(e.target.value)}><option>All skills</option>{skills.slice(1).map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Experience Level" value={experience} onChange={(e) => setExperience(e.target.value)}><option>All experience levels</option><option>Entry-level</option><option>1-3 years</option><option>3-5 years</option></select></div>
    {connected.length > 0 && <section className="connections-section"><div className="section-heading"><div><span className="banner-kicker">Your network</span><h2>My Connections</h2></div></div><div className="connection-list">{connected.map((r) => <div className="connection-row" key={r.id}><div className="avatar">{r.name.charAt(0)}</div><div><strong>{r.name}</strong><span>{r.title} · {r.company}</span><small>Connected · Last interaction {r.lastInteraction ? new Date(r.lastInteraction).toLocaleDateString() : "recently"}</small></div><button className="btn secondary" onClick={() => openChat(r)}><MessageCircle size={15} /> Message</button></div>)}</div></section>}
    <div className="section-heading recruiter-directory-heading"><div><span className="banner-kicker">Explore your next opportunity</span><h2>Recruiters hiring now</h2></div><span className="muted">{filtered.length} profiles</span></div><div className="recruiter-grid">{filtered.map((r) => <article className="card recruiter-card" key={r.id}><div className="recruiter-card-top"><div className="avatar">{r.photo ? <img src={r.photo} alt="" /> : r.name.charAt(0)}</div><span className={`connection-status status-${r.status.toLowerCase()}`}>{r.status === "PENDING" ? "Request Sent" : r.status === "CONNECT" ? "Connect" : r.status === "ACCEPTED" ? "Connected" : r.status}</span></div><h3>{r.name}</h3><p className="recruiter-title">{r.title}</p><div className="company-line"><Building2 size={15} /> <strong>{r.company}</strong><span>{r.companyId}</span></div><p className="recruiter-meta"><MapPin size={14} /> {r.location}</p>{r.activelyHiring && <span className="hiring-status"><span /> Actively Hiring · {r.openings} opening{r.openings === 1 ? "" : "s"}</span>}<p className="recruiter-roles"><strong>Hiring roles:</strong> {r.roles.length ? r.roles.join(" · ") : "Building future teams"}</p><div className="skill-tags">{r.skills.slice(0, 5).map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div><div className="match-line"><strong>Skill Match: {r.match}%</strong><div className="match-bar"><i style={{ width: `${r.match}%` }} /></div></div><div className="recruiter-actions"><button className="btn secondary" onClick={() => setSelected(r)}>View Profile</button>{r.status === "CONNECTED" || r.status === "ACCEPTED" ? <button className="btn primary" onClick={() => openChat(r)}><MessageCircle size={15} /> Message</button> : <button className="btn primary" onClick={() => setConnectTarget(r)}>{r.status === "PENDING" ? "Request Sent ✓" : "Connect"}</button>}</div></article>)}</div>
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="modal-card recruiter-profile-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}><X size={18} /></button><div className="profile-modal-heading"><div className="avatar avatar-large">{selected.name.charAt(0)}</div><div><h2>{selected.name}</h2><p>{selected.title} at {selected.company}</p></div></div><p className="muted">{selected.about}</p><div className="profile-facts"><span><MapPin size={15} />{selected.location}</span><span><BriefcaseBusiness size={15} />{selected.experience}</span><span><Building2 size={15} />{selected.industry}</span></div><h4>Current openings</h4><p>{selected.roles.join(" · ") || "New opportunities coming soon"}</p><h4>Required skills</h4><div className="skill-tags">{selected.skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div>{!["CONNECTED", "ACCEPTED", "PENDING"].includes(selected.status) && <button className="btn primary" onClick={() => { setSelected(null); setConnectTarget(selected); }}>Connect with {selected.name.split(" ")[0]}</button>}</div></div>}
    {connectTarget && <div className="modal-backdrop"><div className="modal-card"><button className="modal-close" onClick={() => setConnectTarget(null)}><X size={18} /></button><h2>Connect with {connectTarget.name}</h2><p className="muted">Send a professional introduction to start the conversation.</p><textarea className="connection-message" value={message || defaultMessage(connectTarget.name)} onChange={(e) => setMessage(e.target.value)} /><div className="modal-actions"><button className="btn secondary" onClick={() => setConnectTarget(null)}>Cancel</button><button className="btn primary" onClick={sendConnection} disabled={busy}><Send size={15} /> Send Connection Request</button></div></div></div>}
    {messageTarget && <div className="modal-backdrop"><div className="modal-card chat-modal"><button className="modal-close" onClick={() => setMessageTarget(null)}><X size={18} /></button><div className="chat-heading"><div className="avatar avatar-small">{messageTarget.name.charAt(0)}</div><div><h2>{messageTarget.name}</h2><span>{messageTarget.company}</span></div></div><div className="chat-history">{messages.length ? messages.map((item) => <div className={`chat-bubble ${item.senderId === messageTarget.recruiterUserId ? "" : "chat-bubble-mine"}`} key={item.id}>{item.body}<small>{new Date(item.createdAt).toLocaleString()}</small></div>) : <p className="empty">Your professional conversation starts here.</p>}</div><div className="chat-compose"><input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} placeholder="Write a message about internships or jobs..." /><button className="btn primary" onClick={sendMessage} disabled={busy}><Send size={15} /></button></div></div></div>}
  </div>;
}

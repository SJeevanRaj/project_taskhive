'use client';

import Link from "next/link";
import { Bell, BriefcaseBusiness, ChevronDown, CircleHelp, LogOut, Settings, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "./actions";
import ThemeToggle from "./ThemeToggle";

type AccountMenuProps = {
  user: { name: string; email: string; phone?: string | null; role: string; profileImage?: string | null; college?: string | null; degree?: string | null; branch?: string | null; skills?: string | null; recruiter?: { companyName?: string | null } | null };
  isPro: boolean;
  plan?: string;
};

export default function AccountMenu({ user, isPro, plan }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const displayName = user.name?.trim() || "Student";
  const firstInitial = displayName.charAt(0).toLowerCase();
  const isRecruiter = user.role === "RECRUITER";
  const profileHref = isRecruiter ? "/recruiter?tab=company" : "/profile";

  useEffect(() => {
    function close(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return <div className="account-menu-wrap" ref={menuRef}>
    <button type="button" className="account-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="menu">
      <span className="account-avatar">{user.profileImage ? <img src={user.profileImage} alt="" /> : firstInitial}</span>
      <span className="account-trigger-copy"><strong>{displayName}</strong>{isPro && <span className="pro-badge-mini">PRO</span>}</span>
      <ChevronDown size={16} className={open ? "account-chevron-open" : ""} />
    </button>
    {open && <div className="account-menu" role="menu">
      <div className="account-menu-header"><span className="account-avatar account-avatar-large">{user.profileImage ? <img src={user.profileImage} alt="" /> : firstInitial}</span><div><strong>{user.name}</strong><small>{isRecruiter ? user.recruiter?.companyName || "Recruiter" : plan === "PRO" ? "Pro student" : "Student"}</small>{isPro && <span className="pro-badge">✓ PRO verified</span>}</div></div>
      <div className="account-menu-details"><div><small>Email</small><span>{user.email}</span></div>{user.phone && <div><small>Phone</small><span>{user.phone}</span></div>}{!isRecruiter && user.college && <div><small>College</small><span>{user.college}</span></div>}{!isRecruiter && user.degree && <div><small>Degree</small><span>{user.degree}{user.branch ? ` · ${user.branch}` : ""}</span></div>}{!isRecruiter && user.skills && <div><small>Skills</small><span>{user.skills}</span></div>}</div>
      <nav className="account-menu-links"><Link href={profileHref} onClick={() => setOpen(false)}><UserRound size={17} /> {isRecruiter ? "Company Profile" : "My Profile"}</Link>{isRecruiter && <Link href="/recruiter?tab=settings" onClick={() => setOpen(false)}><Settings size={17} /> Settings</Link>}{!isRecruiter && <Link href="/subscription" onClick={() => setOpen(false)}><BriefcaseBusiness size={17} /> {isPro ? "Manage Pro plan" : "Upgrade plan"}</Link>}<Link href="#notifications" onClick={() => setOpen(false)}><Bell size={17} /> Notifications</Link><Link href="#help" onClick={() => setOpen(false)}><CircleHelp size={17} /> Help Center</Link></nav>
      <div className="account-menu-theme"><ThemeToggle /></div>
      <div className="account-menu-logout"><button type="button" onClick={() => setLogoutOpen(true)}><LogOut size={17} /> Logout</button></div>
    </div>}
    {logoutOpen && <div className="confirm-backdrop" role="dialog" aria-modal="true" aria-labelledby="logout-title"><div className="confirm-dialog"><h2 id="logout-title">Log out of HireLytix?</h2><p className="muted">You can sign in again at any time to continue your workspace.</p><form action={logoutAction}><div className="confirm-actions"><button type="button" className="btn secondary" onClick={() => setLogoutOpen(false)}>Cancel</button><button type="submit" className="btn primary">Log out</button></div></form></div></div>}
  </div>;
}

import { currentUser } from "@/lib/auth";
import SidebarNav, { SidebarItem } from "./SidebarNav";

export default async function Sidebar() {
  const user = await currentUser();
  const isRecruiter = user?.role === "RECRUITER";
  const sections: { title: string; items: SidebarItem[] }[] = isRecruiter ? [
    { title: "Hiring", items: [
      { label: "Recruiter Dashboard", href: "/recruiter?tab=overview", icon: "gauge" },
      { label: "Search ID & Talent", href: "/search", icon: "search" },
      { label: "Manage Jobs", href: "/recruiter?tab=jobs", icon: "briefcase" },
      { label: "Candidates", href: "/recruiter?tab=candidates", icon: "users" },
      { label: "Applications", href: "/recruiter?tab=applications", icon: "applications" },
      { label: "Interviews", href: "/recruiter?tab=interviews", icon: "checklist" }
    ] },
    { title: "Insights", items: [
      { label: "Hiring Analytics", href: "/recruiter?tab=analytics", icon: "analytics" },
      { label: "Talent Pool", href: "/recruiter?tab=talent", icon: "user" }
    ] },
    { title: "Company", items: [
      { label: "Company Profile", href: "/recruiter?tab=company", icon: "building" }
    ] },
    { title: "Account", items: [
      { label: "Settings", href: "/recruiter?tab=settings", icon: "settings" }
    ] }
  ] : [
    { title: "Learning & Career", items: [
      { label: "Overview", href: "/dashboard", icon: "gauge" },
      { label: "Search ID & Companies", href: "/search", icon: "search" },
      { label: "Assessments", href: "/assessment", icon: "graduation" },
      { label: "Jobs & Internships", href: "/jobs", icon: "briefcase" },
      { label: "Applications", href: "/applications", icon: "applications" },
      { label: "Recruiter Connections", href: "/connections", icon: "handshake" },
      { label: "Leaderboard", href: "/leaderboard", icon: "trophy" },
    ] }
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img className="sidebar-brand-logo" src="/hirelytix-logo.svg" alt="HireLytix" width={34} height={34} />
        <span>HireLytix <em>{isRecruiter ? "Recruiter" : ""}</em></span>
      </div>
      <SidebarNav sections={sections} />
    </aside>
  );
}

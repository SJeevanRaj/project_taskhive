import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { logoutAction } from "./actions";

export default async function Navbar() {
  const user = await currentUser();
  return (
    <header className="nav">
      <Link href="/dashboard" className="brand">
        Hire<span>Lytix</span>
      </Link>
      <nav>
        {user?.role === "RECRUITER" ? (
          <>
            <Link href="/recruiter?tab=overview">Dashboard</Link>
            <Link href="/recruiter?tab=jobs">Jobs</Link>
            <Link href="/recruiter?tab=candidates">Candidates</Link>
            <Link href="/recruiter?tab=interviews">Interviews</Link>
            <Link href="/recruiter?tab=talent">Talent Pool</Link>
            <Link href="/recruiter?tab=leaderboard">Leaderboard</Link>
            <Link href="/recruiter?tab=company">Company Profile</Link>
            <Link href="/recruiter?tab=settings">Settings</Link>
          </>
        ) : (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/jobs">Jobs</Link>
            <Link href="/applications">Applications</Link>
            <Link href="/leaderboard">Leaderboard</Link>
            <Link href="/profile">Profile</Link>
          </>
        )}
      </nav>
      <div className="nav-user">
        <span style={{ fontWeight: 600 }}>{user?.name || "Guest"}</span>
        <form action={logoutAction}>
          <button className="ghost" style={{ fontSize: 12, padding: "6px 12px" }}>Logout</button>
        </form>
      </div>
    </header>
  );
}

import Link from "next/link";
import { loginAction } from "../server";
import { notFound } from "next/navigation";
import SocialLoginButtons from "./SocialLoginButtons";

type Role = "STUDENT" | "RECRUITER";

export default async function RoleLogin({ params, searchParams }: { params: Promise<{ role: string }>; searchParams: Promise<{ error?: string }> }) {
  const { role: routeRole } = await params;
  const role = routeRole === "recruiter" ? "RECRUITER" : routeRole === "student" ? "STUDENT" : null;
  if (!role) notFound();
  const query = await searchParams;
  const isRecruiter = role === "RECRUITER";

  return (
    <main className="auth">
      <div className="auth-box">
        <Link href="/" className="brand">HIRELYTIX</Link>
        <h1>{isRecruiter ? "Recruiter Login" : "Student Login"}</h1>
        <p className="muted">Sign in to your {isRecruiter ? "recruiter" : "student"} portal.</p>
        {query.error && <div className="error">{query.error}</div>}
        <form action={loginAction} className="form">
          <input type="hidden" name="role" value={role}/>
          <div className="field"><label>Email or phone number</label><input name="identifier" type="text" required placeholder="you@example.com or +91 98765 00000" autoComplete="username"/></div>
          <div className="field">
            <label>Password</label>
            <input name="password" type="password" required placeholder="Enter your password"/>
            <Link href={`/forgot-password?role=${role}`} className="field-link">Forgot password?</Link>
          </div>
          <button className="btn primary" style={{ width: "100%", marginTop: 10 }}>Login to {isRecruiter ? "Recruiter" : "Student"} Portal</button>
        </form>
        <SocialLoginButtons />
        <div className="auth-links">
          <Link href={`/register/${isRecruiter ? "recruiter" : "student"}`}>Create new account</Link>
          <Link href={isRecruiter ? "/login/student" : "/login/recruiter"}>{isRecruiter ? "Student login" : "Recruiter login"}</Link>
          <Link href="/">Back home</Link>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { registerAction } from "../server";
import { notFound } from "next/navigation";

export default async function RoleRegister({ params, searchParams }: { params: Promise<{ role: string }>; searchParams: Promise<{ error?: string }> }) {
  const { role: routeRole } = await params;
  const role = routeRole === "recruiter" ? "RECRUITER" : routeRole === "student" ? "STUDENT" : null;
  if (!role) notFound();
  const query = await searchParams;
  const isRecruiter = role === "RECRUITER";

  return (
    <main className="auth">
      <div className="auth-box">
        <Link href="/" className="brand">Task<span>Hive</span></Link>
        <h1>{isRecruiter ? "Create Recruiter Account" : "Create Student Account"}</h1>
        {query.error && <div className="error">{query.error}</div>}
        <form action={registerAction} className="form">
          <input type="hidden" name="role" value={role}/>
          <div className="field"><label>Full name</label><input name="name" required placeholder="e.g. Alex Johnson"/></div>
          <div className="field"><label>Email</label><input name="email" type="email" required placeholder="you@university.edu"/></div>
          <div className="field"><label>Password</label><input name="password" type="password" minLength={8} required placeholder="At least 8 characters"/></div>
          <div className="field"><label>Verified mobile number</label><input name="phone" type="tel" required placeholder="+91 98765 00000"/></div>
          {isRecruiter && <div className="field"><label>Company name</label><input name="companyName" required placeholder="e.g. Acme AI Labs"/></div>}
          <button className="btn primary" style={{ width: "100%", marginTop: 10 }}>Create Student / Recruiter Account</button>
        </form>
        <div className="auth-links">
          <Link href={`/login/${isRecruiter ? "recruiter" : "student"}`}>Already have an account? Login</Link>
          <Link href={isRecruiter ? "/register/student" : "/register/recruiter"}>{isRecruiter ? "Create student account" : "Create recruiter account"}</Link>
          <Link href="/">Back home</Link>
        </div>
      </div>
    </main>
  );
}

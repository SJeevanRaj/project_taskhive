import Link from "next/link";
import { requestResetCode, resetPassword } from "./server";

export default async function ForgotPassword({ searchParams }: { searchParams: Promise<{ role?: string; step?: string; email?: string; error?: string; sent?: string }> }) {
  const params = await searchParams;
  const role = params.role === "RECRUITER" ? "RECRUITER" : "STUDENT";
  const loginPath = role === "RECRUITER" ? "recruiter" : "student";
  const hasCodeStep = params.step === "verify" && params.email;

  return (
    <main className="auth">
      <div className="auth-box">
        <Link href="/" className="brand">Task<span>Hive</span></Link>
        <h1>Reset your password</h1>
        <p className="muted">Enter your current candidate name and phone number. We will send a six-digit code to your saved phone.</p>
        {params.error && <div className="error">{params.error}</div>}
        {params.sent && <div className="success">{params.sent}</div>}
        {!hasCodeStep ? (
          <form action={requestResetCode} className="form">
            <input type="hidden" name="role" value={role}/>
            <div className="field"><label>Full name</label><input name="name" type="text" required placeholder="e.g. Alex Johnson" autoComplete="name"/></div>
            <div className="field"><label>Phone number</label><input name="phone" type="tel" required placeholder="+91 98765 00000" autoComplete="tel"/></div>
            <button className="btn primary" style={{ width: "100%", marginTop: 10 }}>Send verification code</button>
          </form>
        ) : (
          <form action={resetPassword} className="form">
            <input type="hidden" name="role" value={role}/>
            <input type="hidden" name="email" value={params.email}/>
            <div className="field"><label>Verification code</label><input name="code" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} required placeholder="000000"/></div>
            <div className="field"><label>New password</label><input name="password" type="password" minLength={8} required placeholder="At least 8 characters"/></div>
            <button className="btn primary" style={{ width: "100%", marginTop: 10 }}>Reset password</button>
          </form>
        )}
        <div className="auth-links">
          <Link href={`/login/${loginPath}`}>Back to {role === "RECRUITER" ? "recruiter" : "student"} login</Link>
          <Link href="/">Back home</Link>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { chooseBasic, completeDemoPayment } from "./server";

const features = [
  ["Skill tests", "2 tests", "Unlimited"],
  ["Courses", "Limited courses", "All courses"],
  ["Applications", "Normal priority", "Priority visibility"],
  ["Resume tools", "Standard resume", "Advanced builder and templates"],
  ["Analytics", "Test results", "Complete history and analytics"],
  ["Support", "Standard", "Priority support"]
];

export default async function SubscriptionPage() {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") redirect("/login/student");
  const existing = await db.subscription.findUnique({ where: { userId: user.id } });
  if (existing?.plan === "PRO" && existing.status === "ACTIVE") redirect("/dashboard");

  return <main className="subscription-page">
    <header className="subscription-header"><Link href="/" className="brand">HIRELYTIX</Link><span>Welcome, {user.name}</span></header>
    <section className="subscription-hero"><span className="banner-kicker">Choose your path</span><h1>Unlock your career momentum.</h1><p className="muted">Pick a plan to enter your student dashboard. You can upgrade from Basic whenever you need more room to grow.</p></section>
    <section className="pricing-grid">
      <form action={chooseBasic} className="pricing-card"><span className="plan-label">STARTER</span><h2>Basic</h2><div className="price">Free</div><p className="muted">A focused starting point for building your profile.</p><button className="btn secondary" type="submit">Continue with Basic</button><ul><li>2 skill tests</li><li>Limited courses and basic analytics</li><li>Normal-priority applications</li><li>Profile, resume, jobs and notifications</li></ul></form>
      <div className="pricing-card pricing-card-pro"><span className="plan-label">MOST POPULAR</span><h2>Pro</h2><div className="price">$9.99 <small>/ month</small></div><p className="muted">Full access for serious career preparation.</p><form action={completeDemoPayment} className="demo-payment"><label>Billing cycle<select name="cycle"><option value="MONTHLY">Monthly - $9.99</option><option value="YEARLY">Yearly - $99.99</option></select></label><label>Demo payment method<select name="provider"><option>PhonePe</option><option>Google Pay</option><option>Paytm</option><option>UPI</option><option>Other UPI</option></select></label><button className="btn primary" type="submit">Pay demo &amp; activate Pro</button></form><p className="annual-price">Save with the $99.99 yearly plan.</p><ul><li>Unlimited tests and all courses</li><li>Advanced resume builder and templates</li><li>Priority applications and recruiter visibility</li><li>Complete analytics, priority support and ✓ PRO verified badge</li></ul></div>
    </section>
    <section className="comparison card"><h2>Plan comparison</h2><div className="comparison-table"><div className="comparison-row comparison-heading"><strong>Feature</strong><strong>Basic</strong><strong>Pro</strong></div>{features.map(([feature, basic, pro]) => <div className="comparison-row" key={feature}><span>{feature}</span><span>{basic}</span><span>{pro}</span></div>)}</div></section>
  </main>;
}
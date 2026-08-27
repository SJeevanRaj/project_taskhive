'use client';

import { useState } from "react";
import { deleteAccountAction } from "./actions";

export default function DeleteAccountControl({ error }: { error?: string }) {
  const [open, setOpen] = useState(false);

  return <>
    {error && <div className="error">{error}</div>}
    <button type="button" className="btn danger-button delete-account-trigger" onClick={() => setOpen(true)}>Delete account</button>
    {open && <div className="confirm-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
      <div className="confirm-dialog">
        <h2 id="delete-account-title">Delete your account?</h2>
        <p className="muted">This permanently removes your profile, applications, assessments, projects, certificates, and all other account data.</p>
        <form action={deleteAccountAction}>
          <div className="field"><label htmlFor="delete-password">Enter your password to continue</label><input id="delete-password" name="password" type="password" required autoFocus placeholder="Account password" /></div>
          <div className="confirm-actions"><button type="button" className="btn secondary" onClick={() => setOpen(false)}>Cancel</button><button type="submit" className="btn danger-button">Delete permanently</button></div>
        </form>
      </div>
    </div>}
  </>;
}

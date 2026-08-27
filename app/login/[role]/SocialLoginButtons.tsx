'use client';

import { useState } from "react";

const providers = ["GitHub", "Google", "LinkedIn", "Microsoft"];

export default function SocialLoginButtons() {
  const [message, setMessage] = useState("");

  return (
    <div className="social-login">
      <div className="social-divider"><span>or continue with</span></div>
      <div className="social-grid">
        {providers.map((provider) => (
          <button type="button" className="social-login-button" key={provider} onClick={() => setMessage(`${provider} sign-in requires OAuth provider configuration.`)}>
            <span className="social-login-icon">{provider.charAt(0)}</span>
            {provider}
          </button>
        ))}
      </div>
      {message && <p className="social-login-message" role="status">{message}</p>}
    </div>
  );
}

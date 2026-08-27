'use client';

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("hirelytix-theme");
    const prefersDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(prefersDark);
    document.documentElement.dataset.theme = prefersDark ? "dark" : "light";
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    window.localStorage.setItem("hirelytix-theme", nextDark ? "dark" : "light");
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
  }

  return <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
    {dark ? <Sun size={19} /> : <Moon size={19} />}
    <span>{dark ? "Light theme" : "Dark theme"}</span>
  </button>;
}

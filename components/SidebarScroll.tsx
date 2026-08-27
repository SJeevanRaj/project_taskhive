'use client';

import { useEffect, useState, type ReactNode } from "react";

export default function SidebarScroll({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let previousScrollY = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > previousScrollY + 8;
      const scrollingUp = currentScrollY < previousScrollY - 8;

      if (currentScrollY <= 12 || scrollingUp) setVisible(true);
      else if (scrollingDown) setVisible(false);

      previousScrollY = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <aside className={`sidebar ${visible ? "sidebar-visible" : "sidebar-hidden"}`}>{children}</aside>;
}

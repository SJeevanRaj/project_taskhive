'use client';

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { SidebarItem } from "./SidebarNav";

type Section = { title: string; items: SidebarItem[] };

export default function MobileNav({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="mobile-nav-trigger"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
      >
        <Menu size={21} />
      </button>
      {open && (
        <div className="mobile-nav-backdrop" onClick={() => setOpen(false)}>
          <aside className="mobile-nav-panel" onClick={(event) => event.stopPropagation()}>
            <div className="mobile-nav-header">
              <strong>HireLytix</strong>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation menu">
                <X size={21} />
              </button>
            </div>
            {sections.map((section) => (
              <div className="mobile-nav-section" key={section.title}>
                <div className="side-title">{section.title}</div>
                {section.items.map((item) => (
                  <Link href={item.href} key={item.label} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </aside>
        </div>
      )}
    </>
  );
}
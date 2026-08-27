'use client';

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { BarChart3, BriefcaseBusiness, Building2, ClipboardCheck, FileText, Gauge, GraduationCap, Handshake, Search, Settings, Sparkles, Trophy, UserRound, Users } from "lucide-react";

const icons = {
  analytics: BarChart3,
  applications: FileText,
  briefcase: BriefcaseBusiness,
  building: Building2,
  checklist: ClipboardCheck,
  gauge: Gauge,
  graduation: GraduationCap,
  handshake: Handshake,
  search: Search,
  settings: Settings,
  sparkles: Sparkles,
  trophy: Trophy,
  user: UserRound,
  users: Users
};

export type SidebarItem = { label: string; href: string; icon: keyof typeof icons };

function SidebarNavInner({ sections }: { sections: { title: string; items: SidebarItem[] }[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const currentTab = searchParams ? searchParams.get("tab") : null;

  return (
    <>
      {sections.map((section) => (
        <div className="sidebar-section" key={section.title}>
          <div className="side-title">{section.title}</div>
          {section.items.map(({ label, href, icon }) => {
            const Icon = icons[icon];
            const [pathWithQuery, targetHash] = href.split("#");
            const [targetPath, queryString] = pathWithQuery.split("?");
            const urlParams = new URLSearchParams(queryString || "");
            const targetTab = urlParams.get("tab");

            let active = false;
            if (targetTab) {
              if (pathname === targetPath) {
                if (currentTab) {
                  active = currentTab === targetTab;
                } else {
                  active = targetTab === "overview";
                }
              }
            } else if (targetHash) {
              active = pathname === targetPath && hash === `#${targetHash}`;
            } else {
              active = pathname === targetPath || (targetPath !== "/dashboard" && pathname.startsWith(`${targetPath}/`));
            }

            return (
              <Link
                href={href}
                className={active ? "sidebar-link-active" : ""}
                aria-current={active ? "page" : undefined}
                key={label}
              >
                <Icon size={18} strokeWidth={2} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}

export default function SidebarNav(props: { sections: { title: string; items: SidebarItem[] }[] }) {
  return (
    <Suspense fallback={null}>
      <SidebarNavInner {...props} />
    </Suspense>
  );
}

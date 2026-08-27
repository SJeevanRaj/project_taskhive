'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export default function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.12, rootMargin: "-5% 0px -5% 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const revealClass = mounted ? (visible ? "reveal reveal-visible" : "reveal reveal-hidden") : "reveal reveal-static";
  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties;

  return <div ref={elementRef} className={`${revealClass} ${className}`} style={style}>{children}</div>;
}

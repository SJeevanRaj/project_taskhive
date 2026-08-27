'use client';

export default function PrintCertificateBtn({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      className="btn primary"
      onClick={() => window.print()}
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      <span>🖨</span> {label}
    </button>
  );
}

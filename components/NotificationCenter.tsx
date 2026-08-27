'use client';

import { useState, useEffect, useRef } from "react";
import { Bell, Check, X, Building, User, ExternalLink, Clock, ShieldCheck, CheckCheck } from "lucide-react";
import Link from "next/link";

interface NotificationCenterProps {
  userRole?: "STUDENT" | "RECRUITER" | "ADMIN";
}

export default function NotificationCenter({ userRole }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setPendingInvitations(data.pendingInvitations || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s polling
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleMarkAllRead() {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }

  async function handleInvitationAction(invitationId: string, action: "ACCEPT" | "REJECT") {
    setActionInProgress(invitationId);
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        setPendingInvitations((prev) =>
          prev.filter((inv) => inv.id !== invitationId)
        );
        fetchNotifications();
      } else {
        alert("Failed to update invitation status.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setActionInProgress(null);
    }
  }

  const totalBadge = unreadCount + pendingInvitations.length;

  return (
    <div className="notification-center-wrap" ref={containerRef} style={{ position: "relative", zIndex: 90 }}>
      {/* Bell Launcher Button */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open && unreadCount > 0) {
            handleMarkAllRead();
          }
        }}
        aria-label="Notifications"
        style={{
          position: "relative",
          display: "grid",
          placeItems: "center",
          width: 40,
          height: 40,
          borderRadius: 10,
          background: open ? "var(--soft-indigo)" : "var(--surface)",
          border: "1px solid var(--border)",
          color: open ? "var(--indigo)" : "var(--text)",
          cursor: "pointer",
          transition: "all .2s ease",
          boxShadow: "0 2px 8px rgba(15,23,42,.04)"
        }}
      >
        <Bell size={18} />
        {totalBadge > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              padding: "0 4px",
              borderRadius: 99,
              background: "#E11D48",
              color: "#fff",
              fontSize: 10,
              fontWeight: 800,
              display: "grid",
              placeItems: "center",
              boxShadow: "0 2px 6px rgba(225,29,72,.35)",
              animation: "pulse 2s infinite"
            }}
          >
            {totalBadge > 9 ? "9+" : totalBadge}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Drawer */}
      {open && (
        <div
          className="notification-dropdown"
          style={{
            position: "absolute",
            right: 0,
            top: 48,
            width: "min(420px, 92vw)",
            maxHeight: "80vh",
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 16,
            boxShadow: "0 20px 60px rgba(15,23,42,.16)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            animation: "chat-open .2s ease both"
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 18px",
              background: "linear-gradient(135deg, var(--soft-indigo), var(--soft-cyan))",
              borderBottom: "1px solid var(--border)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bell size={16} color="var(--indigo)" />
              <strong style={{ fontSize: 14, color: "var(--ink)" }}>Notifications &amp; Invitations</strong>
              {totalBadge > 0 && (
                <span
                  className="tag"
                  style={{ background: "#FFF1F2", color: "#BE123C", border: "1px solid #FECDD3", fontSize: 10 }}
                >
                  {totalBadge} new
                </span>
              )}
            </div>

            {notifications.some((n) => !n.read) && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: "transparent",
                  border: 0,
                  color: "var(--indigo)",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <CheckCheck size={13} /> Mark read
              </button>
            )}
          </div>

          {/* Body List */}
          <div style={{ overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Pending Company Invitations (Highlighted for Students) */}
            {pendingInvitations.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--indigo)", letterSpacing: 0.5, padding: "2px 6px" }}>
                  OFFICIAL COMPANY INVITATIONS ({pendingInvitations.length})
                </div>

                {pendingInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    style={{
                      padding: 14,
                      background: "linear-gradient(135deg, #F8FAFC, #EEF2FF)",
                      border: "1px solid #C7D2FE",
                      borderRadius: 12,
                      boxShadow: "0 4px 14px rgba(79,70,229,.06)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <strong style={{ fontSize: 14, color: "var(--ink)" }}>{inv.companyName}</strong>
                          <span className="tag" style={{ fontSize: 9 }}>{inv.companyId}</span>
                        </div>
                        <span style={{ fontSize: 12, color: "var(--indigo)", fontWeight: 700 }}>
                          Role: {inv.roleTitle}
                        </span>
                      </div>
                      <span className="tag" style={{ background: "#FEF3C7", color: "#B45309", fontSize: 10 }}>
                        Pending
                      </span>
                    </div>

                    <p style={{ margin: "4px 0 10px", fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>
                      💬 &quot;{inv.message}&quot;
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E0E7FF", paddingTop: 8 }}>
                      <small style={{ color: "var(--muted)", fontSize: 10 }}>
                        From: {inv.recruiterName}
                      </small>

                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="btn primary"
                          disabled={actionInProgress === inv.id}
                          onClick={() => handleInvitationAction(inv.id, "ACCEPT")}
                          style={{ fontSize: 11, padding: "5px 12px", background: "#10B981 !important" }}
                        >
                          <Check size={13} style={{ marginRight: 3 }} /> Accept &amp; Connect
                        </button>
                        <button
                          type="button"
                          className="btn secondary"
                          disabled={actionInProgress === inv.id}
                          onClick={() => handleInvitationAction(inv.id, "REJECT")}
                          style={{ fontSize: 11, padding: "5px 10px", color: "#BE123C", borderColor: "#FECDD3" }}
                        >
                          <X size={13} style={{ marginRight: 3 }} /> Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Standard Notifications */}
            {notifications.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pendingInvitations.length > 0 && (
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", letterSpacing: 0.5, padding: "4px 6px 0" }}>
                    ACTIVITY &amp; UPDATES
                  </div>
                )}

                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "12px 14px",
                      background: n.read ? "var(--canvas)" : "linear-gradient(135deg, #fff, var(--soft-indigo))",
                      border: "1px solid",
                      borderColor: n.read ? "var(--border)" : "#C7D2FE",
                      borderRadius: 10,
                      transition: "background .2s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
                      <strong style={{ fontSize: 13, color: "var(--ink)" }}>{n.title}</strong>
                      <small style={{ color: "var(--muted)", fontSize: 10 }}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </small>
                    </div>

                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text)", lineHeight: 1.45 }}>
                      {n.message}
                    </p>

                    {n.link && (
                      <div style={{ marginTop: 6, textAlign: "right" }}>
                        <Link
                          href={n.link}
                          onClick={() => setOpen(false)}
                          style={{ fontSize: 11, color: "var(--indigo)", fontWeight: 700 }}
                        >
                          View Details →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : pendingInvitations.length === 0 ? (
              <div style={{ padding: "30px 16px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                🔔 No notifications or company invitations at this time.
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

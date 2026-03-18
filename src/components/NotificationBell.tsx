/**
 * NotificationBell.tsx
 * MonArk — In-App Notification System
 * 
 * Drop this into your Lovable project at:
 * src/components/NotificationBell.tsx
 * 
 * Usage: <NotificationBell userId={user.id} />
 * 
 * Requires:
 * - @supabase/supabase-js (already in your stack)
 * - Your Supabase client instance at src/integrations/supabase/client.ts
 */

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read_at: string | null;
  action_url: string | null;
  created_at: string;
}

interface NotificationBellProps {
  userId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    new_matches:    "✦",
    new_messages:   "◌",
    date_proposals: "◇",
    reengagement:   "○",
    rif_insights:   "△",
    safety_alerts:  "⬡",
    system_updates: "◈",
  };
  return icons[type] ?? "◌";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications]     = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]         = useState(0);
  const [isOpen, setIsOpen]                   = useState(false);
  const [isLoading, setIsLoading]             = useState(true);
  const panelRef                              = useRef<HTMLDivElement>(null);

  // ── Fetch notifications ────────────────────────────────────────────────────

  async function fetchNotifications() {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter((n) => !n.read_at).length);
    }
    setIsLoading(false);
  }

  // ── Mark single notification as read ──────────────────────────────────────

  async function markAsRead(id: string) {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  // ── Mark all as read ───────────────────────────────────────────────────────

  async function markAllAsRead() {
    const unread = notifications.filter((n) => !n.read_at).map((n) => n.id);
    if (!unread.length) return;

    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", unread);

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
    );
    setUnreadCount(0);
  }

  // ── Handle notification click ──────────────────────────────────────────────

  async function handleNotificationClick(notification: Notification) {
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  }

  // ── Realtime subscription ──────────────────────────────────────────────────

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event:  "INSERT",
          schema: "public",
          table:  "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // ── Close panel on outside click ──────────────────────────────────────────

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={panelRef}>

      {/* ── Bell trigger ── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        style={{
          position:        "relative",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          width:           "40px",
          height:          "40px",
          borderRadius:    "50%",
          border:          "1.5px solid #EDE6DF",
          background:      isOpen ? "#F2EDE8" : "transparent",
          cursor:          "pointer",
          transition:      "background 0.2s ease",
          outline:         "none",
        }}
      >
        {/* Bell SVG */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isOpen ? "#A08C6E" : "#3D3428"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position:       "absolute",
              top:            "4px",
              right:          "4px",
              minWidth:       "16px",
              height:         "16px",
              borderRadius:   "8px",
              background:     "#A08C6E",
              color:          "#F0EBE3",
              fontSize:       "10px",
              fontFamily:     "DM Sans, sans-serif",
              fontWeight:     "500",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              padding:        "0 4px",
              lineHeight:     "1",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Notification panel ── */}
      {isOpen && (
        <div
          style={{
            position:     "absolute",
            top:          "calc(100% + 8px)",
            right:        "0",
            width:        "340px",
            maxHeight:    "480px",
            background:   "#F2EDE8",
            borderRadius: "16px",
            border:       "1px solid #EDE6DF",
            boxShadow:    "0 8px 40px rgba(61,52,40,0.14)",
            overflow:     "hidden",
            zIndex:       1000,
            display:      "flex",
            flexDirection:"column",
          }}
        >
          {/* Panel header */}
          <div
            style={{
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "space-between",
              padding:         "18px 20px 14px",
              borderBottom:    "1px solid #EDE6DF",
            }}
          >
            <span
              style={{
                fontFamily:    "Playfair Display, serif",
                fontSize:      "16px",
                color:         "#3D3428",
                fontWeight:    "600",
              }}
            >
              Updates
            </span>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background:    "none",
                  border:        "none",
                  cursor:        "pointer",
                  fontFamily:    "DM Sans, sans-serif",
                  fontSize:      "11px",
                  color:         "#A08C6E",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding:       "0",
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{ overflowY: "auto", flex: "1" }}>
            {isLoading ? (
              <div
                style={{
                  padding:    "40px 20px",
                  textAlign:  "center",
                  color:      "#A08C6E",
                  fontFamily: "DM Sans, sans-serif",
                  fontSize:   "13px",
                }}
              >
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  padding:    "48px 24px",
                  textAlign:  "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "Playfair Display, serif",
                    fontSize:   "15px",
                    color:      "#3D3428",
                    marginBottom:"6px",
                  }}
                >
                  All quiet
                </div>
                <div
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize:   "13px",
                    color:      "#B89870",
                  }}
                >
                  Your updates will appear here.
                </div>
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    display:         "flex",
                    gap:             "12px",
                    padding:         "14px 20px",
                    cursor:          notif.action_url ? "pointer" : "default",
                    background:      notif.read_at ? "transparent" : "rgba(160,140,110,0.06)",
                    borderBottom:    index < notifications.length - 1
                                       ? "1px solid #EDE6DF"
                                       : "none",
                    transition:      "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      "rgba(160,140,110,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      notif.read_at ? "transparent" : "rgba(160,140,110,0.06)";
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width:          "32px",
                      height:         "32px",
                      borderRadius:   "50%",
                      background:     notif.read_at ? "#EDE6DF" : "#A08C6E",
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      fontSize:       "13px",
                      color:          notif.read_at ? "#A08C6E" : "#F0EBE3",
                      flexShrink:     0,
                    }}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily:  "DM Sans, sans-serif",
                        fontSize:    "13px",
                        fontWeight:  notif.read_at ? "400" : "500",
                        color:       "#3D3428",
                        marginBottom:"3px",
                        lineHeight:  "1.3",
                      }}
                    >
                      {notif.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "DM Sans, sans-serif",
                        fontSize:   "12px",
                        color:      "#B89870",
                        lineHeight: "1.4",
                        marginBottom:"4px",
                        overflow:   "hidden",
                        display:    "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {notif.message}
                    </div>
                    <div
                      style={{
                        fontFamily:    "DM Sans, sans-serif",
                        fontSize:      "10px",
                        color:         "#D9D0C5",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {timeAgo(notif.created_at)}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!notif.read_at && (
                    <div
                      style={{
                        width:       "6px",
                        height:      "6px",
                        borderRadius:"50%",
                        background:  "#A08C6E",
                        flexShrink:  0,
                        marginTop:   "6px",
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Panel footer */}
          {notifications.length > 0 && (
            <div
              style={{
                padding:      "12px 20px",
                borderTop:    "1px solid #EDE6DF",
                textAlign:    "center",
              }}
            >
              <span
                style={{
                  fontFamily:    "DM Sans, sans-serif",
                  fontSize:      "11px",
                  color:         "#A08C6E",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor:        "pointer",
                }}
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = "/notifications";
                }}
              >
                View all
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { X, Monitor } from "lucide-react";

// One-time notice shown to mobile visitors letting them know the desktop
// build is the richer experience. Dismissed state persists for the session
// so it doesn't nag on every scroll or route change.
const MobileNotice: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const dismissed = sessionStorage.getItem("mobileNoticeDismissed") === "1";
    if (isMobile && !dismissed) {
      // Small delay so it slides in after the page settles.
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("mobileNoticeDismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      style={{
        position: "fixed",
        left: "1rem",
        right: "1rem",
        bottom: "1rem",
        zIndex: 200,
        background: "#0d0d0d",
        border: "1px solid #2a2a2a",
        borderRadius: 10,
        padding: "0.9rem 1rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        fontFamily: "'JetBrains Mono', monospace",
        boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
        animation: "fadeUp 0.25s ease forwards",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 34,
          height: 34,
          borderRadius: 8,
          background: "#111",
          border: "1px solid #1e1e1e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Monitor size={16} color="#fff" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.68rem",
            color: "#fff",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Best on desktop
        </div>
        <p
          style={{
            fontSize: "0.7rem",
            color: "#888",
            lineHeight: 1.6,
            letterSpacing: "0.02em",
            margin: 0,
          }}
        >
          You&apos;re on the mobile version, which is a little limited. For the
          full experience, open this on a laptop or desktop.
        </p>
      </div>

      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          flexShrink: 0,
          background: "none",
          border: "none",
          color: "#555",
          cursor: "pointer",
          padding: 2,
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default MobileNotice;

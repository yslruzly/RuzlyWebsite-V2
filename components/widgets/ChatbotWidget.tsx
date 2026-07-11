"use client";

import { useState } from "react";
import { X, Bot } from "lucide-react";

// The floating chat button at the bottom right. The panel it opens is just
// a "coming soon" placeholder for now, the real assistant lives in the
// macbook terminal in the About section.
const ChatbotWidget: React.FC = () => {
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setChatOpen((o) => !o)}
        style={{
          position: "fixed", bottom: "5.5rem", right: "2rem", zIndex: 150,
          width: 48, height: 48, borderRadius: "50%",
          background: "#ffffff", color: "#000000",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.15), 0 8px 32px rgba(255,255,255,0.12)",
          transition: "transform 0.2s, box-shadow 0.2s",
          fontSize: "1.15rem",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        title="Chat"
      >
        {chatOpen ? <X size={18} /> : <Bot size={18} />}
      </button>

      {/* Chat window */}
      {chatOpen && (
        <div style={{
          position: "fixed", bottom: "10rem", right: "2rem", zIndex: 150,
          width: "min(320px, calc(100vw - 2.5rem))", height: 420,
          background: "#0d0d0d",
          border: "1px solid #2a2a2a",
          borderRadius: 10,
          display: "flex", flexDirection: "column",
          fontFamily: "'JetBrains Mono', monospace",
          boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
          animation: "fadeUp 0.2s ease forwards",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "0.85rem 1rem",
            borderBottom: "1px solid #1e1e1e",
            background: "#111",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", background: "#fff",
                boxShadow: "0 0 6px rgba(255,255,255,0.8), 0 0 14px rgba(255,255,255,0.4)",
                animation: "blink 2s ease-in-out infinite",
              }} />
              <div>
                <div style={{ fontSize: "0.68rem", color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Ruzly's Assistant
                </div>
                <div style={{ fontSize: "0.56rem", color: "#555", letterSpacing: "0.06em", marginTop: 1 }}>
                  Coming soon
                </div>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "1rem", lineHeight: 1, transition: "color 0.15s", display: "flex", alignItems: "center" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#555"; }}
            ><X size={16} /></button>
          </div>

          {/* Empty body */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", padding: "1.5rem" }}>
            <Bot size={32} color="#444" />
            <p style={{ fontSize: "0.7rem", color: "#444", textAlign: "center", lineHeight: 1.7, letterSpacing: "0.04em" }}>
              AI assistant coming soon.<br />Stay tuned.
            </p>
          </div>

          {/* Disabled input */}
          <div style={{ padding: "0.75rem", borderTop: "1px solid #1e1e1e", display: "flex", gap: "0.5rem", alignItems: "center", background: "#0d0d0d" }}>
            <input
              disabled
              placeholder="Ask me anything..."
              style={{
                flex: 1, background: "#1a1a1a", border: "1px solid #2a2a2a",
                color: "#555", borderRadius: 6,
                padding: "0.55rem 0.8rem",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem",
                outline: "none", cursor: "not-allowed",
              }}
            />
            <button disabled style={{
              background: "#222", color: "#444", border: "none",
              width: 34, height: 34, borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "not-allowed", fontSize: "0.8rem",
            }}>➤</button>
          </div>
          <div style={{ textAlign: "center", fontSize: "0.53rem", color: "#2a2a2a", padding: "0.3rem", letterSpacing: "0.08em", textTransform: "uppercase", background: "#0d0d0d" }}>
            still in development · portfolio assistant
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;

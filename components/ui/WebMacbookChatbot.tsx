"use client";

import { useState, useEffect, useRef } from "react";
import type { FC } from "react";

interface ChatLine {
  type: "input" | "output" | "system" | "error";
  text: string;
  id: number;
}

const BOT_REPLIES: Record<string, string> = {
  default: "Hey I'm Ruzly's assistant. Currently I'm still in development, so I might not understand everything. Try asking about his skills, projects, or experience!",
  help: "Available commands: skills · projects · experience · contact · hire · about · education · age · hobbies · work · where",
  hi: "Hey! 👋 Ask me anything about Ruzly.",
  hello: "Hello! What would you like to know about Ruzly?",
  skills: "Ruzly works with React, TypeScript, Next.js, Node.js, Python, PostgreSQL, Docker, and more.",
  project: "He's shipped a Crop Market Monitoring System, a Lab Monitoring System, and is building ResearchAI & ArchiBoardPH.",
  experience: "Currently, Ruzly is OJT at Onecore Consultancy - NextCore Technology From May 2026 – present.",
  contact: "Reach him at macatulajohnruzly@gmail.com or linkedin.com/in/ruzly-macatula.",
  hire: "Ruzly is open to opportunities! Email macatulajohnruzly@gmail.com.",
  about: "Aspiring software engineer, 3rd-year CS at UE Manila, passionate about clean thoughtful software.",
  education: "Ruzly is a 3rd-year Computer Science student at the University of the East Manila.",
  age: "Ruzly was developed in the year 2005. He's 20 years old.",
  hobbies: "he said sometimes he plays basketball, tennis, and goes to the gym and exploring new tech trends in his free time.",
  work: "Ruzly is currently OJT at Onecore Consultancy - NextCore Technology, where he contributes to web development projects and hones his skills in a professional setting. But he's open to work and new opportunities, so feel free to reach out!",
  where: "Ruzly is based in Manila PH, but he's open to remote opportunities worldwide!",
  gf: "Ruzly has a GF named Jasmine. She's super nice and supportive of his journey!",
  love: "Ruzly is currently in a relationship with his girlfriend Jasmine. They support each other a lot!",
  interest: "Ruzly is interested in software architecture, AI, cybersecurity, and more."

};

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  for (const key of Object.keys(BOT_REPLIES)) {
    if (key !== "default" && lower.includes(key)) return BOT_REPLIES[key];
  }
  return BOT_REPLIES.default;
}

const MacbookChatbot: FC = () => {
  const [lines, setLines] = useState<ChatLine[]>([
    { type: "system", text: "Last login: Fri Jul 1 09:00:00 on ttys001", id: 0 },
    { type: "system", text: "ruzly-assistant 1.0.0 — portfolio terminal", id: 1 },
    { type: "system", text: "Type 'help' for available commands.", id: 2 },
    { type: "output", text: "", id: 3 },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [cursorOn, setCursorOn] = useState(true);
  const [time, setTime] = useState("");
  const [termPos, setTermPos] = useState({ x: 40, y: 36 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(10);
  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleString("en-US", {
        weekday: "short", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
      }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Cursor blink
  useEffect(() => {
    const t = setInterval(() => setCursorOn(v => !v), 530);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll (only the terminal's own message box, never the page)
  useEffect(() => {
    const box = bottomRef.current?.parentElement;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, [lines, typing]);

  // Drag
  const onTitleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const desktop = desktopRef.current;
    if (!desktop) return;
    const rect = desktop.getBoundingClientRect();
    setDragging(true);
    setDragOffset({
      x: e.clientX - rect.left - termPos.x,
      y: e.clientY - rect.top - termPos.y,
    });
  };
  useEffect(() => {
    if (!dragging) return;
    const desktop = desktopRef.current;
    const onMove = (e: MouseEvent) => {
      if (!desktop) return;
      const rect = desktop.getBoundingClientRect();
      setTermPos({
        x: Math.max(0, e.clientX - rect.left - dragOffset.x),
        y: Math.max(28, e.clientY - rect.top - dragOffset.y),
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging, dragOffset]);

  const addLine = (type: ChatLine["type"], text: string) => {
    setLines(prev => [...prev, { type, text, id: idRef.current++ }]);
  };

  const send = () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    addLine("input", text);

    if (text.toLowerCase() === "help") {
      addLine("output", "Commands: skills · projects · experience · contact · hire · about · clear");
      return;
    }
    if (text.toLowerCase() === "clear") {
      setLines([{ type: "system", text: "Terminal cleared.", id: idRef.current++ }]);
      return;
    }

    setTyping(true);
    setTimeout(() => {
      addLine("output", getBotReply(text));
      setTyping(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }, 700);
  };

  // Terminal width/height as % of desktop — fills most of the screen
  const termW = "calc(100% - 80px)";
  const termH = "calc(100% - 74px)"; // leave room for menubar + padding

  return (
    <div style={{
      width: "100%",
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      userSelect: dragging ? "none" : "auto",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.6s ease",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes mbp-bounce {
          0%,60%,100%{transform:translateY(0);opacity:0.4}
          30%{transform:translateY(-5px);opacity:1}
        }
      `}</style>

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        filter: "drop-shadow(0 50px 70px rgba(0,0,0,0.85))",
      }}>

        {/* ══════════ LID ══════════ */}
        <div style={{
          width: "100%",
          background: "linear-gradient(160deg,#5c5c5e 0%,#3c3c3e 18%,#2c2c2e 55%,#1e1e20 100%)",
          borderRadius: "18px 18px 0 0",
          padding: "13px 13px 0",
          border: "1px solid #161618",
          borderBottom: "none",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.13)",
          position: "relative",
        }}>
          {/* brushed aluminum texture */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "18px 18px 0 0",
            background: "repeating-linear-gradient(135deg,transparent,transparent 3px,rgba(255,255,255,0.011) 3px,rgba(255,255,255,0.011) 6px)",
            pointerEvents: "none",
          }} />

          {/* BEZEL */}
          <div style={{
            background: "#060608",
            borderRadius: "10px 10px 0 0",
            border: "2px solid #090909",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
            overflow: "hidden",
          }}>

            {/* ── NOTCH ROW — menubar lives here, camera in centre ── */}
            <div style={{
              background: "rgba(14,14,16,0.96)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,0.055)",
              height: "30px",
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}>
              {/* LEFT menu items */}
              <div style={{
                display: "flex", alignItems: "center", gap: "13px",
                paddingLeft: "12px", zIndex: 2,
              }}>
                <span style={{ fontSize: "13px", color: "#fff", lineHeight: 1 }}>⌘</span>
                {["Finder", "File", "Edit", "View", "Go", "Window", "Help"].map((m, i) => (
                  <span key={m} style={{
                    fontSize: "11px",
                    color: i === 0 ? "#fff" : "rgba(255,255,255,0.78)",
                    fontWeight: i === 0 ? 600 : 400,
                    cursor: "default",
                    whiteSpace: "nowrap",
                  }}>{m}</span>
                ))}
              </div>

              {/* NOTCH pill — centred absolutely */}
              <div style={{
                position: "absolute", left: "50%", top: 0,
                transform: "translateX(-50%)",
                width: "130px", height: "30px",
                background: "#060608",
                borderRadius: "0 0 16px 16px",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid #111", borderTop: "none",
                zIndex: 3,
              }}>
                {/* camera dot */}
                <div style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "#0e1010",
                  border: "1.5px solid #1c2020",
                  boxShadow: "inset 0 0 3px rgba(0,0,0,0.9)",
                }} />
              </div>

              {/* RIGHT status icons + clock */}
              <div style={{
                marginLeft: "auto", display: "flex", alignItems: "center",
                gap: "10px", paddingRight: "12px", zIndex: 2,
              }}>
                <span style={{
                  fontSize: "10.5px", color: "rgba(255,255,255,0.82)",
                  letterSpacing: "0.015em", whiteSpace: "nowrap",
                }}>{time}</span>
              </div>
            </div>

            {/* ══════════ DESKTOP ══════════ */}
            <div
              ref={desktopRef}
              style={{
                width: "100%",
                height: "380px",
                background: "#000",
                position: "relative",
                overflow: "hidden",
                cursor: "default",
              }}
              onClick={() => inputRef.current?.focus()}
            >
              {/* starfield */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: `
                  radial-gradient(1px 1px at 8% 18%, rgba(255,255,255,0.45) 0%,transparent 100%),
                  radial-gradient(1px 1px at 22% 65%, rgba(255,255,255,0.3) 0%,transparent 100%),
                  radial-gradient(1px 1px at 38% 12%, rgba(255,255,255,0.5) 0%,transparent 100%),
                  radial-gradient(1.5px 1.5px at 52% 48%, rgba(255,255,255,0.2) 0%,transparent 100%),
                  radial-gradient(1px 1px at 67% 78%, rgba(255,255,255,0.35) 0%,transparent 100%),
                  radial-gradient(1px 1px at 80% 28%, rgba(255,255,255,0.4) 0%,transparent 100%),
                  radial-gradient(1px 1px at 91% 55%, rgba(255,255,255,0.28) 0%,transparent 100%),
                  radial-gradient(1px 1px at 14% 88%, rgba(255,255,255,0.38) 0%,transparent 100%),
                  radial-gradient(1px 1px at 75% 92%, rgba(255,255,255,0.32) 0%,transparent 100%)
                `,
              }} />
              {/* nebula glow */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse at 72% 28%,rgba(50,15,75,0.4) 0%,transparent 52%), radial-gradient(ellipse at 18% 75%,rgba(8,25,65,0.35) 0%,transparent 48%)",
              }} />

              {/* ══ TERMINAL WINDOW ══ */}
              <div
                style={{
                  position: "absolute",
                  left: termPos.x,
                  top: termPos.y,
                  width: termW,
                  height: termH,
                  borderRadius: "11px",
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08)",
                  display: "flex", flexDirection: "column",
                  zIndex: 10,
                  cursor: dragging ? "grabbing" : "default",
                  minWidth: "300px",
                  minHeight: "200px",
                }}
              >
                {/* title bar */}
                <div
                  onMouseDown={onTitleMouseDown}
                  style={{
                    background: "linear-gradient(180deg,#3c3c3e 0%,#303032 100%)",
                    padding: "8px 12px",
                    display: "flex", alignItems: "center", gap: "7px",
                    cursor: "grab",
                    flexShrink: 0,
                    borderBottom: "1px solid rgba(0,0,0,0.55)",
                    position: "relative",
                  }}
                >
                  {[
                    { c: "#ff5f57", s: "rgba(255,95,87,0.55)" },
                    { c: "#febc2e", s: "rgba(254,188,46,0.55)" },
                    { c: "#28c840", s: "rgba(40,200,64,0.55)" },
                  ].map((d, i) => (
                    <div key={i} style={{
                      width: "11px", height: "11px", borderRadius: "50%",
                      background: d.c, boxShadow: `0 0 5px ${d.s}`, flexShrink: 0,
                    }} />
                  ))}
                  <div style={{
                    position: "absolute", left: 0, right: 0, textAlign: "center",
                    fontSize: "11px", color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.04em", pointerEvents: "none",
                  }}>
                    zsh — ruzly@portfolio — 80×24
                  </div>
                </div>

                {/* body */}
                <div style={{
                  flex: 1, background: "rgba(11,11,13,0.98)",
                  display: "flex", flexDirection: "column",
                  fontFamily: "'JetBrains Mono','Menlo',monospace",
                  overflow: "hidden", position: "relative",
                }}>
                  {/* scanlines */}
                  <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
                    background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.032) 2px,rgba(0,0,0,0.032) 4px)",
                  }} />

                  {/* messages */}
                  <div style={{
                    flex: 1, overflowY: "auto", padding: "10px 14px 6px",
                    display: "flex", flexDirection: "column", gap: "1px",
                    scrollbarWidth: "none",
                  }}>
                    {lines.map(line => (
                      <div key={line.id} style={{
                        fontSize: "12px", lineHeight: 1.7,
                        whiteSpace: "pre-wrap", wordBreak: "break-word",
                        fontFamily: "'JetBrains Mono',monospace",
                        color: line.type === "system" ? "rgba(255,255,255,0.45)"
                          : line.type === "input" ? "#ffffff"
                            : line.type === "error" ? "#ff6b6b"
                              : "#ffffff",
                      }}>
                        {line.type === "input" && (
                          <span style={{ color: "#27c060", fontWeight: 700 }}>ruzly@portfolio ~ % </span>
                        )}
                        {line.type === "output" && line.text && (
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>→  </span>
                        )}
                        {line.text}
                      </div>
                    ))}
                    {typing && (
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono',monospace", fontSize: "12px" }}>→  </span>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{
                            width: "5px", height: "5px", borderRadius: "50%",
                            background: "#ffffff",
                            animation: `mbp-bounce 1.3s ease-in-out ${i * 0.2}s infinite`,
                          }} />
                        ))}
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* input */}
                  <div style={{
                    display: "flex", alignItems: "center",
                    padding: "5px 14px 9px",
                    borderTop: "1px solid rgba(255,255,255,0.04)",
                    background: "rgba(7,7,9,0.7)",
                    flexShrink: 0, zIndex: 6, position: "relative",
                  }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: "12px", color: "#27c060", fontWeight: 700,
                      whiteSpace: "nowrap", flexShrink: 0,
                    }}>ruzly@portfolio ~ % </span>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && send()}
                      disabled={typing}
                      placeholder="ask me about ruzly..."
                      style={{
                        flex: 1, background: "transparent",
                        border: "none", outline: "none",
                        color: "#ffffff",
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: "12px", caretColor: "transparent",
                        padding: "0 3px",
                      }}
                    />
                    <div style={{
                      width: "8px", height: "15px", background: "#ffffff",
                      borderRadius: "1px", flexShrink: 0,
                      opacity: cursorOn && !typing ? 1 : 0,
                      boxShadow: "0 0 8px rgba(255,255,255,0.5)",
                    }} />
                  </div>
                </div>
              </div>
              {/* end terminal */}

            </div>
            {/* end desktop */}

          </div>
          {/* end bezel */}
        </div>
        {/* end lid */}

        {/* BASE */}
        <div style={{
          width: "100%",
          background: "linear-gradient(180deg,#343436 0%,#262628 100%)",
          height: "24px",
          borderRadius: "0 0 9px 9px",
          border: "1px solid #161618", borderTop: "none",
          position: "relative",
          boxShadow: "0 10px 36px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}>
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: "96px", height: "9px",
            background: "linear-gradient(180deg,#1e1e20,#1a1a1c)",
            borderRadius: "0 0 7px 7px",
          }} />
        </div>

        {/* FEET */}
        <div style={{ width: "calc(100% - 50px)", display: "flex", justifyContent: "space-between" }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              width: "96px", height: "6px",
              background: "linear-gradient(180deg,#262628,#1c1c1e)",
              borderRadius: "0 0 5px 5px",
              boxShadow: "0 5px 18px rgba(0,0,0,0.7)",
            }} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default MacbookChatbot;

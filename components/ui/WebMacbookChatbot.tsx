"use client";

import { useState, useEffect, useRef } from "react";
import type { FC } from "react";

// The big macbook in the About section (desktop only). A fake macOS desktop
// with a draggable terminal that answers questions about me from the canned
// replies below. There's also a hidden typing test, type "keyboard" to try it.
interface ChatLine {
  type: "input" | "output" | "system" | "error";
  text: string;
  id: number;
}

const BOT_REPLIES: Record<string, string> = {
  default: "Hey I'm Ruzly's assistant. Currently I'm still in development, so I might not understand everything. Try asking about his skills, projects, or experience!",
  help: "Available commands: skills · clear · keyboard · projects · experience · contact · hire · about · education · age · hobbies · work · where",
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

/* ══════════ TYPING TEST CONFIG ══════════ */
const TEST_DURATION = 15;          // seconds
const HIGH_SCORE = 144;            // wpm
const HIGH_SCORE_HOLDER = "ruzly";

const WORD_POOL = [
  "the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "with",
  "as", "not", "on", "she", "at", "by", "this", "we", "you", "do", "but", "from", "or", "which",
  "one", "would", "all", "will", "there", "say", "who", "make", "when", "can", "more", "if",
  "no", "man", "out", "other", "so", "what", "time", "up", "go", "about", "than", "into",
  "could", "state", "only", "new", "year", "some", "take", "come", "these", "know", "see",
  "use", "get", "like", "then", "first", "any", "work", "now", "may", "such", "give", "over",
  "think", "most", "even", "find", "day", "also", "after", "way", "many", "must", "look",
  "before", "great", "back", "through", "long", "where", "much", "should", "well", "people",
  "down", "own", "just", "because", "good", "each", "those", "feel", "seem", "how", "high",
  "too", "place", "little", "world", "very", "still", "nation", "hand", "old", "life", "tell",
  "write", "become", "here", "show", "house", "both", "between", "need", "mean", "call",
  "develop", "under", "last", "right", "move", "thing", "general", "school", "never", "same",
  "another", "begin", "while", "number", "part", "turn", "real", "leave", "might", "want",
  "point", "form", "off", "child", "few", "small", "since", "against", "ask", "late", "home",
  "interest", "large", "person", "end", "open", "public", "follow", "during", "present",
  "without", "again", "hold", "govern", "around", "possible", "head", "consider", "word",
  "program", "problem", "however", "lead", "system", "set", "order", "eye", "plan", "run",
  "keep", "face", "fact", "group", "play", "stand", "increase", "early", "course", "change",
  "help", "line", "therefore", "always", "night", "live", "power", "though", "story", "young",
];

/* monkeytype-ish palette */
const MT_TEXT = "#d1d0c5";   // typed correct
const MT_SUB = "#646669";    // untyped
const MT_ERROR = "#ca4754";  // typed wrong
const MT_ACCENT = "#e2b714"; // caret / accent
const TIMER_COLOR = "#34d399"; // countdown
const LINE_H = 36;           // px per line of words
const VISIBLE_LINES = 3;

function makePassage(count = 70): string {
  const out: string[] = [];
  let prev = "";
  for (let i = 0; i < count; i++) {
    let w = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    while (w === prev) w = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    prev = w;
    out.push(w);
  }
  return out.join(" ");
}

type TestStatus = "ready" | "running" | "done";

const MacbookChatbot: FC = () => {
  const [lines, setLines] = useState<ChatLine[]>([
    { type: "system", text: "Last login: Fri Jul 1 09:00:00 on ttys001", id: 0 },
    { type: "system", text: "ruzly-assistant 1.0.0 — portfolio terminal", id: 1 },
    { type: "system", text: "Type 'help' for available commands.", id: 2 },
    { type: "output", text: "", id: 3 },
    { type: "system", text: "Type 'keyboard' to start the typing test.", id: 4 },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [cursorOn, setCursorOn] = useState(true);
  const [time, setTime] = useState("");
  const [termPos, setTermPos] = useState({ x: 40, y: 36 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  /* ── typing test state ── */
  const [testOpen, setTestOpen] = useState(false);
  const [testStatus, setTestStatus] = useState<TestStatus>("ready");
  const [passage, setPassage] = useState("");
  const [typed, setTyped] = useState("");
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [result, setResult] = useState<{ wpm: number; accuracy: number } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(10);
  const desktopRef = useRef<HTMLDivElement>(null);
  const testInputRef = useRef<HTMLInputElement>(null);
  const typedRef = useRef("");
  const passageRef = useRef("");
  const closeTestRef = useRef<() => void>(() => { });
  const caretRef = useRef<HTMLSpanElement>(null);
  const [lineShift, setLineShift] = useState(0);

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

  // auto scroll the terminal when new lines come in (just the message box, never the page)
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
      // clamp so the terminal can't be dragged out of the desktop — keeps the
      // title bar grabbable and the input on screen
      setTermPos({
        x: Math.min(Math.max(0, e.clientX - rect.left - dragOffset.x), rect.width - 120),
        y: Math.min(Math.max(28, e.clientY - rect.top - dragOffset.y), rect.height - 40),
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

  /* ══════════ TYPING TEST LOGIC ══════════ */
  const openTest = () => {
    const p = makePassage();
    passageRef.current = p;
    typedRef.current = "";
    setPassage(p);
    setTyped("");
    setLineShift(0);
    setTimeLeft(TEST_DURATION);
    setResult(null);
    setTestStatus("ready");
    setTestOpen(true);
    setTimeout(() => testInputRef.current?.focus({ preventScroll: true }), 80);
  };

  // keep the active line centred, monkeytype-style
  useEffect(() => {
    if (!testOpen) return;
    const el = caretRef.current;
    if (!el) return;
    setLineShift(Math.max(0, el.offsetTop - LINE_H));
  }, [typed, testOpen, passage]);

  // tab to restart (works during the run and on the result screen)
  useEffect(() => {
    if (!testOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        openTest();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeTestRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [testOpen]);

  // countdown + auto-finish
  useEffect(() => {
    if (testStatus !== "running") return;
    const started = Date.now();
    const id = setInterval(() => {
      const remaining = TEST_DURATION - (Date.now() - started) / 1000;
      if (remaining <= 0) {
        clearInterval(id);
        setTimeLeft(0);

        const t = typedRef.current;
        const p = passageRef.current;
        let correct = 0;
        for (let i = 0; i < t.length; i++) if (t[i] === p[i]) correct++;
        const wpm = Math.round((correct / 5) * (60 / TEST_DURATION));
        const accuracy = t.length ? Math.round((correct / t.length) * 100) : 0;

        setResult({ wpm, accuracy });
        setTestStatus("done");
      } else {
        setTimeLeft(remaining);
      }
    }, 50);
    return () => clearInterval(id);
  }, [testStatus]);

  const onTestChange = (v: string) => {
    if (testStatus === "done") return;
    if (testStatus === "ready" && v.length > 0) setTestStatus("running");
    const capped = v.slice(0, passageRef.current.length);
    typedRef.current = capped;
    setTyped(capped);
  };

  const closeTest = () => {
    setTestOpen(false);
    setTestStatus("ready");
    if (result) {
      if (result.wpm > HIGH_SCORE) {
        addLine("output", `🎉 ${result.wpm} WPM · ${result.accuracy}% accuracy — congrats, you beat ${HIGH_SCORE_HOLDER}'s ${HIGH_SCORE} WPM. New record holder.`);
      } else {
        addLine("output", `${result.wpm} WPM · ${result.accuracy}% accuracy — you didn't beat ${HIGH_SCORE_HOLDER}, ${HIGH_SCORE} WPM.`);
      }
    } else {
      addLine("system", "Typing test aborted.");
    }
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
  };
  closeTestRef.current = closeTest;

  const send = () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    addLine("input", text);

    // ── easter egg ──
    if (text.toLowerCase().includes("keyboard")) {
      addLine("system", `Launching typing test — ${TEST_DURATION}s. Record to beat: ${HIGH_SCORE_HOLDER} @ ${HIGH_SCORE} WPM.`);
      openTest();
      return;
    }

    if (text.toLowerCase() === "help") {
      addLine("output", BOT_REPLIES.help);
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
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
    }, 700);
  };

  // terminal size relative to the fake desktop, fills most of it
  const termW = "calc(100% - 80px)";
  const termH = "calc(100% - 74px)"; // leave room for menubar + padding

  const beatIt = !!result && result.wpm > HIGH_SCORE;

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
        @keyframes mbp-fadein {
          from{opacity:0;transform:scale(0.97)}
          to{opacity:1;transform:scale(1)}
        }
        @keyframes mbp-caret {
          0%,49%{opacity:1}
          50%,100%{opacity:0}
        }
        @keyframes mbp-twinkle {
          0%,100%{opacity:0.55}
          50%{opacity:1}
        }
        @keyframes mbp-twinkle-slow {
          0%,100%{opacity:0.85}
          50%{opacity:0.35}
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

            {/* ── NOTCH ROW: menubar lives here, camera in the middle ── */}
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

              {/* the notch pill, centered absolutely */}
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
                background: "radial-gradient(ellipse at 50% 30%, #10352a 0%, #0a2119 38%, #05120e 70%, #020806 100%)",
                position: "relative",
                // clip, not hidden: focusing the terminal input can programmatically
                // scroll an overflow:hidden box, which shifted the wallpaper when the
                // terminal was dragged near the edge. clip can never scroll.
                overflow: "clip",
                cursor: "default",
              }}
              onClick={() => (testOpen ? testInputRef : inputRef).current?.focus({ preventScroll: true })}
            >
              {/* star glow halos */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                animation: "mbp-twinkle 5.5s ease-in-out infinite",
                backgroundImage: `
                  radial-gradient(3px 3px at 8% 18%, rgba(150,255,205,0.30) 0%,transparent 70%),
                  radial-gradient(3px 3px at 38% 12%, rgba(170,255,215,0.32) 0%,transparent 70%),
                  radial-gradient(4px 4px at 52% 48%, rgba(120,235,185,0.22) 0%,transparent 70%),
                  radial-gradient(3px 3px at 80% 28%, rgba(160,255,210,0.28) 0%,transparent 70%),
                  radial-gradient(3px 3px at 14% 88%, rgba(150,255,205,0.26) 0%,transparent 70%),
                  radial-gradient(3.5px 3.5px at 67% 78%, rgba(140,245,195,0.24) 0%,transparent 70%)
                `,
              }} />
              {/* crisp stars */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                animation: "mbp-twinkle-slow 3.8s ease-in-out infinite",
                backgroundImage: `
                  radial-gradient(1px 1px at 8% 18%, rgba(235,255,245,0.95) 0%,transparent 100%),
                  radial-gradient(1px 1px at 22% 65%, rgba(210,255,235,0.6) 0%,transparent 100%),
                  radial-gradient(1px 1px at 38% 12%, rgba(255,255,255,1) 0%,transparent 100%),
                  radial-gradient(1.5px 1.5px at 52% 48%, rgba(200,255,230,0.5) 0%,transparent 100%),
                  radial-gradient(1px 1px at 67% 78%, rgba(230,255,242,0.7) 0%,transparent 100%),
                  radial-gradient(1px 1px at 80% 28%, rgba(240,255,248,0.85) 0%,transparent 100%),
                  radial-gradient(1px 1px at 91% 55%, rgba(205,255,232,0.55) 0%,transparent 100%),
                  radial-gradient(1px 1px at 14% 88%, rgba(235,255,245,0.8) 0%,transparent 100%),
                  radial-gradient(1px 1px at 75% 92%, rgba(215,255,238,0.65) 0%,transparent 100%),
                  radial-gradient(1px 1px at 45% 82%, rgba(225,255,240,0.6) 0%,transparent 100%),
                  radial-gradient(1px 1px at 60% 20%, rgba(245,255,250,0.75) 0%,transparent 100%),
                  radial-gradient(1px 1px at 30% 38%, rgba(200,250,228,0.5) 0%,transparent 100%)
                `,
              }} />
              {/* aurora glow */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse at 72% 28%,rgba(24,140,95,0.30) 0%,transparent 55%), radial-gradient(ellipse at 18% 78%,rgba(12,80,70,0.32) 0%,transparent 52%), radial-gradient(ellipse at 45% 100%,rgba(40,200,130,0.10) 0%,transparent 45%)",
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
                    {testOpen ? "typetest — ruzly@portfolio" : "zsh — ruzly@portfolio — 80×24"}
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
                      disabled={typing || testOpen}
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
                      opacity: cursorOn && !typing && !testOpen ? 1 : 0,
                      boxShadow: "0 0 8px rgba(255,255,255,0.5)",
                    }} />
                  </div>

                  {/* ══════════ TYPING TEST OVERLAY ══════════ */}
                  {testOpen && (
                    <div
                      onClick={() => testInputRef.current?.focus()}
                      style={{
                        position: "absolute", inset: 0, zIndex: 20,
                        background: "rgba(8,8,10,0.97)",
                        backdropFilter: "blur(3px)",
                        WebkitBackdropFilter: "blur(3px)",
                        display: "flex", flexDirection: "column",
                        padding: "14px 18px",
                        animation: "mbp-fadein 0.18s ease-out",
                        fontFamily: "'JetBrains Mono',monospace",
                      }}
                    >
                      {/* header */}
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        flexShrink: 0, marginBottom: "10px",
                      }}>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em" }}>
                          TYPING TEST · {TEST_DURATION}s
                        </span>
                      </div>

                      {testStatus !== "done" ? (
                        <>
                          <div style={{
                            display: "flex", alignItems: "baseline", gap: "10px",
                            marginBottom: "10px", flexShrink: 0,
                          }}>
                            <span style={{
                              fontSize: "26px", fontWeight: 700,
                              color: timeLeft <= 5 ? MT_ERROR : TIMER_COLOR,
                              lineHeight: 1,
                            }}>{Math.ceil(timeLeft)}</span>
                            <span style={{ fontSize: "11px", color: MT_SUB }}>
                              {testStatus === "ready" ? "start typing to begin…" : "go go go"}
                            </span>
                          </div>

                          {/* the passage, monkeytype style */}
                          <div style={{
                            height: `${LINE_H * VISIBLE_LINES}px`,
                            flexShrink: 0,
                            overflow: "hidden",
                            maskImage: "linear-gradient(180deg,#000 62%,transparent 100%)",
                            WebkitMaskImage: "linear-gradient(180deg,#000 62%,transparent 100%)",
                          }}>
                            <div style={{
                              position: "relative",
                              transform: `translateY(-${lineShift}px)`,
                              transition: "transform 0.18s ease",
                              fontSize: "19px",
                              lineHeight: `${LINE_H}px`,
                              letterSpacing: "0.01em",
                            }}>
                              {(() => {
                                let cursor = 0;
                                return passage.split(" ").map((word, wi, arr) => {
                                  const isLast = wi === arr.length - 1;
                                  const chunk = isLast ? word : word + " ";
                                  const start = cursor;
                                  cursor += chunk.length;
                                  return (
                                    <span
                                      key={wi}
                                      style={{
                                        display: "inline-block",
                                        whiteSpace: "pre",
                                      }}
                                    >
                                      {chunk.split("").map((ch, ci) => {
                                        const i = start + ci;
                                        const done = i < typed.length;
                                        const correct = done && typed[i] === ch;
                                        const isCaret = i === typed.length;
                                        const wrongSpace = done && !correct && ch === " ";
                                        return (
                                          <span
                                            key={i}
                                            ref={isCaret ? caretRef : undefined}
                                            style={{
                                              color: done ? (correct ? MT_TEXT : MT_ERROR) : MT_SUB,
                                              textDecoration: done && !correct ? "underline" : "none",
                                              textDecorationColor: MT_ERROR,
                                              background: wrongSpace ? "rgba(202,71,84,0.28)" : "transparent",
                                              borderLeft: isCaret ? `2px solid ${MT_ACCENT}` : "2px solid transparent",
                                              marginLeft: isCaret ? "-2px" : 0,
                                              animation: isCaret ? "mbp-caret 1s step-end infinite" : "none",
                                            }}
                                          >
                                            {ch}
                                          </span>
                                        );
                                      })}
                                    </span>
                                  );
                                });
                              })()}
                            </div>
                          </div>

                          {/* hidden capture input */}
                          <input
                            ref={testInputRef}
                            value={typed}
                            onChange={e => onTestChange(e.target.value)}
                            onPaste={e => e.preventDefault()}
                            autoComplete="off"
                            spellCheck={false}
                            style={{
                              position: "absolute", opacity: 0,
                              width: "1px", height: "1px",
                              bottom: 0, left: 0, border: "none", outline: "none",
                            }}
                          />

                          <div style={{
                            fontSize: "10px", color: MT_SUB,
                            flexShrink: 0, marginTop: "auto", paddingTop: "8px",
                          }}>
                            tab to restart · esc to quit
                          </div>
                        </>
                      ) : (
                        /* ── RESULT ── */
                        <div style={{
                          flex: 1, display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center", gap: "6px",
                          animation: "mbp-fadein 0.25s ease-out",
                        }}>
                          <div style={{
                            fontSize: "44px", fontWeight: 700, lineHeight: 1,
                            color: beatIt ? "#27c060" : "#ffffff",
                            textShadow: beatIt ? "0 0 24px rgba(39,192,96,0.45)" : "none",
                          }}>
                            {result?.wpm}<span style={{ fontSize: "15px", opacity: 0.5 }}> wpm</span>
                          </div>
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                            {result?.accuracy}% accuracy · {TEST_DURATION}s
                          </div>

                          <div style={{
                            marginTop: "10px", padding: "8px 16px",
                            borderRadius: "7px",
                            border: `1px solid ${beatIt ? "rgba(39,192,96,0.4)" : "rgba(255,95,87,0.35)"}`,
                            background: beatIt ? "rgba(39,192,96,0.08)" : "rgba(255,95,87,0.07)",
                            fontSize: "12px",
                            color: beatIt ? "#27c060" : "#ff8b84",
                            textAlign: "center",
                          }}>
                            {beatIt
                              ? `you beat ${HIGH_SCORE_HOLDER} — ${HIGH_SCORE} wpm 🏆`
                              : `you didn't beat ${HIGH_SCORE_HOLDER} — ${HIGH_SCORE} wpm`}
                          </div>

                          {beatIt && (
                            <div style={{
                              marginTop: "8px", fontSize: "11px",
                              color: "rgba(255,255,255,0.5)", textAlign: "center",
                            }}>
                              congrats — new record holder. those are some fast hands.
                            </div>
                          )}

                          <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                            <button
                              onClick={openTest}
                              style={{
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                color: "#fff", borderRadius: "6px",
                                padding: "6px 14px", fontSize: "11px", cursor: "pointer",
                                fontFamily: "'JetBrains Mono',monospace",
                              }}
                            >
                              retry
                            </button>
                            <button
                              onClick={closeTest}
                              style={{
                                background: "transparent",
                                border: "1px solid rgba(255,255,255,0.12)",
                                color: "rgba(255,255,255,0.6)", borderRadius: "6px",
                                padding: "6px 14px", fontSize: "11px", cursor: "pointer",
                                fontFamily: "'JetBrains Mono',monospace",
                              }}
                            >
                              back to terminal
                            </button>
                          </div>

                          <div style={{
                            fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "10px",
                          }}>
                            tab to restart · esc to quit
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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

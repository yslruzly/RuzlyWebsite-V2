"use client";

import { useState, useEffect, useRef } from "react";
import type { FC } from "react";

interface ChatMsg { from: "user" | "bot"; text: string; }

const BOT_REPLIES: Record<string, string> = {
  default: "Hey I'm Ruzly's assistant. Currently I'm still in development, so I might not understand everything.",
  help: "Available commands: skills · keyboard · projects · experience · contact · hire · about · education · age · hobbies · work · where · age",
  hi: "Hey! 👋 Ask me anything about Ruzly.",
  hello: "Hello! What would you like to know about Ruzly?",
  skills: "Ruzly works with React, TypeScript, Next.js, Node.js, Python, PostgreSQL, Docker, and more.",
  project: "He's shipped a Crop Market Monitoring System, a Lab Monitoring System, and is building ResearchAI & ArchiBoardPH.",
  experience: "Currently, Ruzly is OJT at Onecore Consultancy - NextCore Technology From May 2026 – present.",
  contact: "Reach him at macatulajohnruzly@gmail.com or linkedin.com/in/ruzly-macatula.",
  hire: "Ruzly is open to opportunities! Email macatulajohnruzly@gmail.com.",
  about: "Aspiring software engineer, 4th-year CS at UE Manila, passionate about clean thoughtful software.",
  education: "Ruzly is a 4th-year Computer Science student at the University of the East Manila.",
  age: "Ruzly was developed in the year 2005. He's 20 years old.",
  hobbies: "he said sometimes he plays basketball, tennis, and goes to the gym and exploring new tech trends in his free time.",
  work: "Ruzly is currently OJT at Onecore Consultancy - NextCore Technology, where he contributes to web development projects and hones his skills in a professional setting. But he's open to work and new opportunities, so feel free to reach out!",
  where: "Ruzly is based in Manila PH, but he's open to remote opportunities worldwide!",
  gf: "Ruzly has a GF named Jasmine. She's super nice and supportive of his journey!",
  love: "Ruzly is currently in a relationship with his girlfriend Jasmine. They support each other a lot!",
  interest: "Ruzly is interested in software architecture, AI, cybersecurity, and more.",
};

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  for (const key of Object.keys(BOT_REPLIES)) {
    if (key !== "default" && lower.includes(key)) return BOT_REPLIES[key];
  }
  return BOT_REPLIES.default;
}

const MacbookChatbot: FC = () => {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { from: "bot", text: "Hi! I'm Ruzly's assistant. This is a Mobile Macbook Chatbot. Type 'help' for available commands!." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [visible, setVisible] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const box = bottomRef.current?.parentElement;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text: getBotReply(text) }]);
    }, 900);
  };

  const css = `
    .mbp-wrap { display: flex; flex-direction: column; align-items: center; }
    .mbp-lid {
      width: 100%;
      background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 40%, #232325 100%);
      border-radius: 14px 14px 0 0;
      padding: 10px 10px 0;
      border: 1px solid #1a1a1c;
      border-bottom: none;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
    }
    .mbp-screen-bezel {
      background: #0a0a0b;
      border-radius: 8px 8px 0 0;
      overflow: hidden;
      border: 1.5px solid #111;
    }
    .mbp-notch-bar {
      background: #0a0a0b;
      display: flex; justify-content: center; align-items: center;
      padding: 5px 0 3px;
    }
    .mbp-notch {
      width: 120px; height: 20px;
      background: #0a0a0b;
      border-radius: 0 0 14px 14px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid #1a1a1c; border-top: none;
    }
    .mbp-camera {
      width: 7px; height: 7px; border-radius: 50%;
      background: #1c1c1e; border: 1px solid #2a2a2c; position: relative;
    }
    .mbp-camera::after {
      content: ''; position: absolute; top: 50%; left: 50%;
      transform: translate(-50%,-50%);
      width: 3px; height: 3px; border-radius: 50%; background: #111;
    }
    .mbp-screen {
      background: #0d0d0f; height: 320px;
      display: flex; flex-direction: column;
      font-family: 'JetBrains Mono', monospace;
    }
    .mbp-chat-bar {
      background: #111113; border-bottom: 1px solid #1e1e20;
      padding: 5px 10px; display: flex; align-items: center; gap: 6px;
    }
    .mbp-dot { width: 8px; height: 8px; border-radius: 50%; }
    .mbp-url {
      flex: 1; background: #1c1c1e; border-radius: 5px;
      padding: 2px 8px; margin-left: 6px;
      font-size: 11px; color: #555; letter-spacing: 0.04em;
      font-family: 'JetBrains Mono', monospace;
    }
    .mbp-chat-header {
      padding: 8px 14px; border-bottom: 1px solid #1a1a1c;
      display: flex; align-items: center; gap: 8px; background: #111113;
    }
    .mbp-status-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #fff; box-shadow: 0 0 5px rgba(255,255,255,0.7);
      flex-shrink: 0; animation: mbp-pulse 2s ease-in-out infinite;
    }
    @keyframes mbp-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .mbp-messages {
      flex: 1; overflow-y: auto; padding: 12px 14px;
      display: flex; flex-direction: column; gap: 9px;
      scrollbar-width: none;
    }
    .mbp-messages::-webkit-scrollbar { display: none; }
    .mbp-msg-row { display: flex; }
    .mbp-msg-row.user { justify-content: flex-end; }
    .mbp-msg-row.bot  { justify-content: flex-start; }
    .mbp-bubble {
      max-width: 75%; padding: 7px 11px;
      font-size: 11px; line-height: 1.6; border-radius: 12px;
    }
    .mbp-bubble.user {
      background: #fff; color: #000;
      border-radius: 12px 12px 3px 12px;
    }
    .mbp-bubble.bot {
      background: #1c1c1e; color: #d4d4d4;
      border: 1px solid #2a2a2c;
      border-radius: 12px 12px 12px 3px;
    }
    .mbp-typing {
      padding: 7px 11px; background: #1c1c1e;
      border: 1px solid #2a2a2c;
      border-radius: 12px 12px 12px 3px;
      display: flex; gap: 4px; align-items: center;
    }
    .mbp-typing span {
      width: 5px; height: 5px; border-radius: 50%;
      background: #555; animation: mbp-bounce 1.2s ease-in-out infinite;
    }
    .mbp-typing span:nth-child(2) { animation-delay: 0.2s; }
    .mbp-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes mbp-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
    .mbp-input-row {
      padding: 8px 10px; border-top: 1px solid #1a1a1c;
      display: flex; gap: 6px; align-items: center; background: #0d0d0f;
    }
    .mbp-input {
      flex: 1; background: #1c1c1e; border: 1px solid #2a2a2c;
      color: #f0f0f0; border-radius: 8px; padding: 6px 10px;
      font-family: 'JetBrains Mono', monospace; font-size: 11px; outline: none;
    }
    .mbp-input::placeholder { color: #444; }
    .mbp-send {
      width: 28px; height: 28px; border-radius: 7px;
      border: none; cursor: pointer; font-size: 11px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, color 0.15s; flex-shrink: 0;
    }
    .mbp-base {
      width: 100%;
      background: linear-gradient(180deg, #2c2c2e 0%, #252527 100%);
      height: 18px; border-radius: 0 0 6px 6px;
      border: 1px solid #1a1a1c; border-top: none;
      position: relative;
      box-shadow: 0 6px 24px rgba(0,0,0,0.6);
    }
    .mbp-hinge {
      position: absolute; top: 0; left: 50%; transform: translateX(-50%);
      width: 80px; height: 6px;
      background: #1c1c1e; border-radius: 0 0 4px 4px;
    }
    .mbp-feet-row {
      width: 100%; display: flex; justify-content: space-between; padding: 0 20px;
    }
    .mbp-foot {
      width: 80px; height: 5px;
      background: linear-gradient(180deg, #2a2a2c, #1e1e20);
      border-radius: 0 0 4px 4px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.4);
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div
        ref={wrapRef}
        className="mbp-wrap"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateX(30px)",
          transition: "opacity 0.7s ease 200ms, transform 0.7s ease 200ms",
        }}
      >
        {/* Lid + Screen */}
        <div className="mbp-lid">
          <div className="mbp-screen-bezel">
            {/* Notch */}
            <div className="mbp-notch-bar">
              <div className="mbp-notch">
                <div className="mbp-camera" />
              </div>
            </div>

            {/* Screen content */}
            <div className="mbp-screen">
              {/* Browser chrome */}
              <div className="mbp-chat-bar">
                <div className="mbp-dot" style={{ background: "#ff5f57" }} />
                <div className="mbp-dot" style={{ background: "#febc2e" }} />
                <div className="mbp-dot" style={{ background: "#28c840" }} />
                <div className="mbp-url">ruzly-macatula.vercel.app/chat</div>
              </div>

              {/* Chat header */}
              <div className="mbp-chat-header">
                <div className="mbp-status-dot" />
                <span style={{ fontSize: "11px", color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>Ruzly's Assistant</span>
                <span style={{ fontSize: "10px", color: "#444", marginLeft: "auto" }}>online</span>
              </div>

              {/* Messages */}
              <div className="mbp-messages">
                {messages.map((m, i) => (
                  <div key={i} className={`mbp-msg-row ${m.from}`}>
                    <div className={`mbp-bubble ${m.from}`}>{m.text}</div>
                  </div>
                ))}
                {typing && (
                  <div className="mbp-msg-row bot">
                    <div className="mbp-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="mbp-input-row">
                <input
                  className="mbp-input"
                  placeholder="Ask about Ruzly..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                />
                <button
                  className="mbp-send"
                  onClick={send}
                  disabled={!input.trim()}
                  style={{
                    background: input.trim() ? "#fff" : "#222",
                    color: input.trim() ? "#000" : "#555",
                    cursor: input.trim() ? "pointer" : "not-allowed",
                  }}
                >➤</button>
              </div>
            </div>
          </div>
        </div>

        {/* Base */}
        <div className="mbp-base">
          <div className="mbp-hinge" />
        </div>

        {/* Feet */}
        <div className="mbp-feet-row">
          <div className="mbp-foot" />
          <div className="mbp-foot" />
        </div>
      </div>
    </>
  );
};

export default MacbookChatbot;

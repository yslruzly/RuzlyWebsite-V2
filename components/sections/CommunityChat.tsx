"use client";

import { useEffect, useRef, useState } from "react";
import { MessagesSquare, Smartphone, Monitor } from "lucide-react";
import { supabase, type ChatMessage } from "@/lib/supabase";
import { Reveal } from "@/components/ui/motion-primitives";

// DiceBear generates a deterministic avatar from any seed string —
// same trick bryllim.com uses. Free, no key, returns an SVG.
const avatarFor = (name: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(
    name,
  )}&radius=50&backgroundColor=f1f1f1`;

function timeAgo(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - +new Date(iso)) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function CommunityChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewers, setViewers] = useState(1);
  const [name, setName] = useState("");
  const [confirmedName, setConfirmedName] = useState<string | null>(null);
  const [myCity, setMyCity] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ownerKey, setOwnerKey] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // owner mode: visiting the site once with #owner=SECRET saves the key in
  // this browser (then cleans the URL). a hash fragment never gets sent to
  // any server, so the secret can't end up in request logs. the old
  // ?owner= form still works just in case. visitors never see any of this
  useEffect(() => {
    const url = new URL(window.location.href);
    let key: string | null = null;

    const hashMatch = window.location.hash.match(/^#owner=(.+)$/);
    if (hashMatch) {
      key = hashMatch[1];
      url.hash = "";
    }
    const fromQuery = url.searchParams.get("owner");
    if (fromQuery) {
      key = key ?? fromQuery;
      url.searchParams.delete("owner");
    }

    if (key) {
      localStorage.setItem("chatOwnerKey", key);
      window.history.replaceState({}, "", url.toString());
    }
    const stored = localStorage.getItem("chatOwnerKey");
    if (stored) {
      setOwnerKey(stored);
      setConfirmedName("Ruzly");
    }
  }, []);

  // Initial load + realtime inserts.
  useEffect(() => {
    let active = true;

    supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (active && data) setMessages(data as ChatMessage[]);
      });

    const channel = supabase
      .channel("chat-inserts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) =>
          setMessages((prev) => [...prev, payload.new as ChatMessage]),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Live "viewing now" count via Supabase Presence.
  useEffect(() => {
    const channel = supabase.channel("portfolio-presence", {
      config: { presence: { key: crypto.randomUUID() } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        setViewers(Math.max(1, Object.keys(channel.presenceState()).length));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Keep the newest message in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    if (!confirmedName || !draft.trim() || sending) return;
    setSending(true);
    setError(null);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: confirmedName,
        message: draft.trim(),
        ...(ownerKey ? { ownerKey } : {}),
      }),
    });
    setSending(false);
    if (!res.ok) {
      setError("Message didn't send. Try again.");
      return;
    }
    setDraft("");
  }

  return (
    <section id="chat" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <p className="flex items-center gap-2 font-mono text-xs tracking-[0.3em] section-eyebrow uppercase">
              <MessagesSquare size={14} strokeWidth={1.5} aria-hidden="true" />
              Community
            </p>
            <h2 className="mt-4 text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.05] font-semibold tracking-tight">
              Leave a <span className="text-mist">message.</span>
            </h2>
            <p className="mt-6 max-w-md font-jet text-base text-mist">
              Say hi, leave a note, see who else is here. No account, no signup — just a name and a message.
            </p>
            <p className="mt-8 flex items-center gap-2.5 font-mono text-xs text-ash">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {viewers} {viewers === 1 ? "person" : "people"} viewing now
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex h-[440px] flex-col overflow-hidden rounded-xl border border-line bg-surface">
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[11px] text-ash">
                <span>💬 {messages.length} messages</span>
                <span>public · be kind</span>
              </div>

              <div
                ref={listRef}
                className="flex-1 space-y-4 overflow-y-auto p-4"
              >
                {messages.length === 0 && (
                  <p className="font-mono text-xs text-ash">
                    No messages yet. Be the first to say hi.
                  </p>
                )}
                {messages.map((m) => (
                  <div key={m.id} className="flex items-start gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.is_owner ? "/images/pfp.jpg" : avatarFor(m.name)}
                      alt=""
                      loading="lazy"
                      className="h-8 w-8 shrink-0 rounded-full bg-paper/10 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-mono text-[11px] text-ash">
                        <span className={m.is_owner ? "text-paper" : "text-mist"}>
                          {m.name}
                        </span>
                        {m.is_owner && (
                          <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-1.5 py-px text-[9px] tracking-wider text-emerald-400 uppercase">
                            owner
                          </span>
                        )}
                        {m.city && <span>· {m.city}</span>}
                        {m.device === "mobile" ? (
                          <Smartphone size={11} aria-label="mobile" />
                        ) : (
                          <Monitor size={11} aria-label="desktop" />
                        )}
                        <span>· {timeAgo(m.created_at)}</span>
                      </p>
                      <p className="mt-1 inline-block rounded-lg border border-line bg-ink/40 px-3 py-1.5 font-jet text-sm break-words">
                        {m.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-line px-4 py-3">
                {!confirmedName ? (
                  <form
                    className="flex items-center gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!name.trim()) return;
                      setConfirmedName(name.trim());
                      // Ask the server where this visitor is (IP-based,
                      // city-level). Only works in deployment; null locally.
                      fetch("/api/chat")
                        .then((r) => r.json())
                        .then((d) => setMyCity(d.city ?? null))
                        .catch(() => setMyCity(null));
                    }}
                  >
                    <label
                      htmlFor="chat-name"
                      className="font-mono text-xs whitespace-nowrap text-mist"
                    >
                      what&apos;s your name?
                    </label>
                    <input
                      id="chat-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={20}
                      placeholder="your name"
                      autoComplete="off"
                      className="min-w-0 flex-1 bg-transparent font-jet text-sm outline-none placeholder:text-ash"
                    />
                    <button
                      type="submit"
                      className="rounded-md border border-line px-3 py-1.5 font-mono text-[11px] text-ash transition-colors hover:border-mist hover:text-paper"
                    >
                      next ↵
                    </button>
                  </form>
                ) : (
                  <form
                    className="flex items-center gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      send();
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ownerKey ? "/images/pfp.jpg" : avatarFor(confirmedName)}
                      alt={`Posting as ${confirmedName}`}
                      className="h-6 w-6 rounded-full bg-paper/10 object-cover"
                    />
                    <span className="hidden font-mono text-[11px] whitespace-nowrap text-ash sm:inline">
                      {confirmedName}
                      {myCity ? ` · ${myCity}` : ""}
                    </span>
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      maxLength={160}
                      placeholder={`say something as ${confirmedName}…`}
                      autoComplete="off"
                      className="min-w-0 flex-1 bg-transparent font-jet text-sm outline-none placeholder:text-ash"
                    />
                    <button
                      type="submit"
                      disabled={sending}
                      className="rounded-md border border-line px-3 py-1.5 font-mono text-[11px] text-ash transition-colors hover:border-mist hover:text-paper disabled:opacity-50"
                    >
                      {sending ? "…" : "send ↵"}
                    </button>
                  </form>
                )}
                {error && (
                  <p className="mt-2 font-mono text-[11px] text-red-400">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

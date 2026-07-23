"use client";

import { useEffect, useRef, useState } from "react";
import { MessagesSquare, Smartphone, Monitor } from "lucide-react";
import { supabase, type ChatMessage } from "@/lib/supabase";
import { Reveal } from "@/components/ui/motion-primitives";

// The public guestbook. Anyone can leave a message, everyone sees the same
// list, and new ones show up live without a refresh. Messages are saved
// through /api/chat, not straight from here, so nobody can fake my badge.

// Gives every visitor a little cartoon avatar. The seed is the name plus a
// random id saved in their browser, so the same person always gets the same
// face but two different "Alex"es don't. Free, no signup, no key.
// docs: https://www.dicebear.com/how-to-use/http-api
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
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Bot traps, checked on the server. `website` is a decoy input hidden with
  // CSS that only a bot would ever fill in, and openedAt lets the server see
  // if a "message" was sent impossibly fast. See the notes in /api/chat.
  const [website, setWebsite] = useState("");
  const openedAt = useRef(Date.now());

  // How I log in as the owner. I visit the site once with #owner=MY_SECRET,
  // it saves the key into this browser and wipes it out of the address bar.
  // After that I just use the normal URL and my messages get the badge.
  //
  // It's a #hash on purpose: browsers never send the part after # to the
  // server, so my secret can't end up sitting in Vercel's request logs.
  // The old ?owner= version still works, just in case I use an old link.
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

    // A random id that sticks to this browser. It goes into the avatar seed
    // so two visitors who both type "Alex" still get different faces. Not an
    // identity, not tracking — it never leaves the avatar.
    let vid = localStorage.getItem("chatVisitorId");
    if (!vid) {
      vid = crypto.randomUUID();
      localStorage.setItem("chatVisitorId", vid);
    }
    setVisitorId(vid);
  }, []);

  // Grab the last 100 messages on load, then keep a socket open so anything
  // new anyone posts pops into the list on its own.
  useEffect(() => {
    let active = true;

    supabase
      .from("CommunityMessages")
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
        { event: "INSERT", schema: "public", table: "CommunityMessages" },
        (payload) =>
          setMessages((prev) => [...prev, payload.new as ChatMessage]),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // The "x people viewing now" counter. Every open tab announces itself on a
  // shared channel and counts how many others are there.
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

  // scroll to the bottom whenever a message arrives
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
        website,
        openedAt: openedAt.current,
        ...(visitorId ? { visitorId } : {}),
        ...(ownerKey ? { ownerKey } : {}),
      }),
    });
    setSending(false);
    if (!res.ok) {
      // use whatever reason the server gave (sending too fast, message too
      // long...) so people see something useful instead of a generic error
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Message didn't send. Try again.");
      return;
    }
    setError(null);
    setDraft("");
  }

  return (
    <section id="chat">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <p className="flex items-center gap-2 font-mono text-xs tracking-[0.3em] section-eyebrow uppercase">
              <MessagesSquare size={14} strokeWidth={1.5} aria-hidden="true" />
              Community
            </p>
            <h2 className="mt-4 text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.05] font-semibold tracking-tight">
              Leave a <span className="text-mist">message.</span>
            </h2>
            <p className="mt-6 max-w-md font-jet text-base text-mist">
              Say Hi, Drop your name and say something. Everyone who visits can see it.
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
            <div className="flex h-[70dvh] max-h-110 min-h-90 flex-col overflow-hidden rounded-xl border border-line bg-surface sm:h-110">
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[11px] text-ash">
                <span>💬 {messages.length} messages</span>
                <span>Public · be kind</span>
              </div>

              <div
                ref={listRef}
                className="flex-1 space-y-4 overflow-y-auto p-3 sm:p-4"
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
                      src={
                        m.is_owner
                          ? "/images/pfp.jpg"
                          : avatarFor(m.avatar_seed ?? m.name)
                      }
                      alt=""
                      loading="lazy"
                      className="h-8 w-8 shrink-0 rounded-full bg-paper/10 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[11px] text-ash">
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

              <div className="border-t border-line px-3 py-3 sm:px-4">
                {!confirmedName ? (
                  <form
                    className="flex items-center gap-2 sm:gap-3"
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
                      className="font-mono text-xs whitespace-nowrap text-mist max-sm:sr-only"
                    >
                      what&apos;s your name?
                    </label>
                    <input
                      id="chat-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={20}
                      placeholder="what's your name?"
                      autoComplete="off"
                      className="min-w-0 flex-1 bg-transparent font-jet text-base outline-none placeholder:text-ash sm:text-sm"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-md border border-line px-3 py-2 font-mono text-[11px] text-ash transition-colors hover:border-mist hover:text-paper sm:py-1.5"
                    >
                      next ↵
                    </button>
                  </form>
                ) : (
                  <form
                    className="flex items-center gap-2 sm:gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      send();
                    }}
                  >
                    {/* The bot trap. Hidden from people, and screen readers are
                        told to skip it, so only a script would ever fill it in.
                        tabIndex -1 keeps keyboard users from tabbing into it. */}
                    <input
                      type="text"
                      name="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="absolute left-[-9999px] h-0 w-0 opacity-0"
                    />

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        ownerKey
                          ? "/images/pfp.jpg"
                          : // same name#id seed the server saves, so the
                          // preview face matches the one that gets posted
                          avatarFor(
                            visitorId
                              ? `${confirmedName}#${visitorId}`
                              : confirmedName,
                          )
                      }
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
                      className="min-w-0 flex-1 bg-transparent font-jet text-base outline-none placeholder:text-ash sm:text-sm"
                    />
                    <button
                      type="submit"
                      disabled={sending}
                      className="shrink-0 rounded-md border border-line px-3 py-2 font-mono text-[11px] text-ash transition-colors hover:border-mist hover:text-paper disabled:opacity-50 sm:py-1.5"
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

import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ipFrom, ratelimit } from "@/lib/rate-limit";
import { hasLink, hasProfanity } from "@/lib/moderation";

// The server side of the community chat. GET tells the visitor what city
// they're in, POST saves a message.
//
// This route is the ONLY way a message can get into the database. The anon key
// used to be allowed to insert, which meant anyone could read it out of the
// site's JavaScript and POST straight to Supabase, skipping the rate limit, the
// honeypot and the profanity filter. So I took that permission away: the anon
// key can only read now, and everything below runs on the service role key.
// That key is server-only and never leaves this file's environment.

// .trim() because a stray newline once snuck into a key I pasted into Vercel
// and auth silently broke everywhere. Cheap insurance.
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const db = serviceKey
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(), serviceKey)
  : null;

const NAME_MAX = 20;
const MESSAGE_MAX = 160;

function locationFrom(req: NextRequest) {
  // Vercel fills these in from the visitor's IP once it's deployed. On
  // localhost they don't exist, so city just comes back null.
  const city = req.headers.get("x-vercel-ip-city");
  const country = req.headers.get("x-vercel-ip-country");
  return city
    ? `${decodeURIComponent(city)}, ${country ?? ""}`.replace(/, $/, "")
    : null;
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ city: locationFrom(req) });
}

export async function POST(req: NextRequest) {
  let body: {
    name?: string;
    message?: string;
    ownerKey?: string;
    website?: string;
    openedAt?: number;
    visitorId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim().slice(0, NAME_MAX);
  const message = body.message?.trim().slice(0, MESSAGE_MAX);

  if (!name || !message) {
    return NextResponse.json(
      { error: "Name and message are required." },
      { status: 400 },
    );
  }

  // Bot traps. Two of them:
  //
  // 1. "website" is a decoy field hidden with CSS. A real person never sees it
  //    so it always comes back empty. Bots read the raw HTML, see an input, and
  //    fill it in because that's what they do.
  // 2. openedAt is when the chat box loaded. Nobody types a name and a message
  //    in under a second, so anything that fast is a script.
  //
  // Either way I pretend it worked. If I returned an error the bot would know
  // it got caught and could adjust. Silently dropping it means the spammer
  // thinks they're posting into the void, which they are.
  const trapped =
    !!body.website?.trim() ||
    (typeof body.openedAt === "number" && Date.now() - body.openedAt < 1000);

  if (trapped) {
    return NextResponse.json({ ok: true });
  }

  // Owner mode. If the request carries my secret, the message gets my badge
  // and my photo. The check happens here on the server, so the secret never
  // ends up in anything a visitor can read.
  //
  // timingSafeEqual instead of === so the reply always takes the same amount
  // of time. A normal comparison bails early on the first wrong character,
  // and in theory you could measure that to guess the secret one letter at a
  // time. Very unlikely over the internet, but it's one line either way.
  const secret = process.env.CHAT_OWNER_SECRET?.trim();
  const guess = body.ownerKey?.trim();
  const isOwner =
    !!secret &&
    typeof guess === "string" &&
    guess.length === secret.length &&
    timingSafeEqual(Buffer.from(guess), Buffer.from(secret));

  // 5 messages a minute per IP. This runs after the owner check so I can never
  // lock myself out of my own guestbook, and after the name/message checks so
  // empty junk requests don't eat into the Upstash quota.
  if (!isOwner && ratelimit) {
    const { success, reset } = await ratelimit.limit(ipFrom(req));
    if (!success) {
      const seconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return NextResponse.json(
        { error: `Slow down a little — try again in ${seconds}s.` },
        { status: 429, headers: { "Retry-After": String(seconds) } },
      );
    }
  }

  // Keep it clean. Real people get a real reason here (unlike the bot traps,
  // which fail silently) because someone who swore at the guestbook should
  // know why their message didn't show up. I skip these checks for myself so
  // I can still post links to my own projects.
  if (!isOwner) {
    if (hasProfanity(message) || hasProfanity(name)) {
      return NextResponse.json(
        { error: "Let's keep it friendly — try rewording that." },
        { status: 400 },
      );
    }
    if (hasLink(message)) {
      return NextResponse.json(
        { error: "Links aren't allowed here, sorry." },
        { status: 400 },
      );
    }
  }

  if (!db) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not set, cannot save messages");
    return NextResponse.json(
      { error: "The chat isn't set up right now." },
      { status: 500 },
    );
  }

  const ua = req.headers.get("user-agent") ?? "";
  const device = /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop";

  // What the avatar gets drawn from. The browser sends a random id it made up
  // once and keeps in localStorage, so two visitors with the same name still
  // get different faces. Only [-a-zA-Z0-9] survives the cleanup — it's going
  // into a URL on everyone's screen, so anything fancier gets stripped. If a
  // visitor doesn't send one (old tab, script), the seed is just the name,
  // which is exactly the old behaviour.
  const vid = (body.visitorId ?? "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 36);
  const avatarSeed = vid ? `${name}#${vid}` : name;

  const { error } = await db.from("messages").insert({
    // my posts always show up as Ruzly, whatever name was typed in the box
    name: isOwner ? "Ruzly" : name,
    message,
    city: locationFrom(req),
    device,
    // owner posts use my photo, not a generated avatar, so no seed needed
    ...(isOwner ? {} : { avatar_seed: avatarSeed }),
    // only set this on my own posts, so normal messages still save fine even
    // if the is_owner column hasn't been added yet
    ...(isOwner ? { is_owner: true } : {}),
  });

  if (error) {
    // prints the real reason in the terminal (RLS blocked it, bad key, missing
    // column...). Visitors just get the friendly message below. This line has
    // saved me every single time the chat broke.
    console.error("chat insert failed:", error.message, error.details);
    return NextResponse.json(
      { error: "Could not save the message. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ipFrom, ratelimit } from "@/lib/rate-limit";

// The server side of the community chat. GET just tells the visitor what city
// they're in, POST saves a message. Messages go through here instead of
// straight to Supabase so the owner badge and the rate limit can't be faked
// from the browser.

// .trim() because a stray newline once snuck into a key I pasted into Vercel
// and auth silently broke everywhere. Cheap insurance.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
);

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

  // The database itself refuses to save an owner message from the public key,
  // which is what stops anyone from faking the badge. So my own messages need
  // the service role key, which is allowed to bypass that rule. Only built
  // when I'm actually the one posting.
  let client = supabase;
  if (isOwner) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!serviceKey) {
      console.error(
        "owner post attempted but SUPABASE_SERVICE_ROLE_KEY is not set",
      );
      return NextResponse.json(
        { error: "Owner mode is not configured on the server." },
        { status: 500 },
      );
    }
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(), serviceKey);
  }

  const ua = req.headers.get("user-agent") ?? "";
  const device = /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop";

  const { error } = await client.from("messages").insert({
    // my posts always show up as Ruzly, whatever name was typed in the box
    name: isOwner ? "Ruzly" : name,
    message,
    city: locationFrom(req),
    device,
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

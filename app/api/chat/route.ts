import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ipFrom, ratelimit } from "@/lib/rate-limit";

// Server-side path for the chat. GET returns the visitor's coarse location
// (from Vercel's IP geolocation headers); POST inserts a message.
// trim() so stray whitespace pasted into env vars can't break auth
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
);

const NAME_MAX = 20;
const MESSAGE_MAX = 160;

function locationFrom(req: NextRequest) {
  // Set automatically by Vercel in deployment; absent on localhost.
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
  let body: { name?: string; message?: string; ownerKey?: string };
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

  // owner mode: if the request carries my secret, the message gets the
  // owner badge. checked here on the server, so the secret never ships
  // to visitors. constant-time compare so response timing can't leak
  // how much of a guess matched
  const secret = process.env.CHAT_OWNER_SECRET?.trim();
  const guess = body.ownerKey?.trim();
  const isOwner =
    !!secret &&
    typeof guess === "string" &&
    guess.length === secret.length &&
    timingSafeEqual(Buffer.from(guess), Buffer.from(secret));

  // rate limit by IP: 5 messages a minute. checked after the owner test so
  // I'm never locked out of my own guestbook, and after validation so junk
  // requests don't burn quota
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

  // owner rows are blocked for the anon key by RLS, so they need the
  // service role client. only created when actually posting as owner
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
    // owner posts always show my name no matter what was typed
    name: isOwner ? "Ruzly" : name,
    message,
    city: locationFrom(req),
    device,
    // only sent for owner posts, so regular messages keep working even
    // before the is_owner migration has been run
    ...(isOwner ? { is_owner: true } : {}),
  });

  if (error) {
    // Shows the real reason in the dev-server terminal (RLS, bad key, etc.)
    console.error("chat insert failed:", error.message, error.details);
    return NextResponse.json(
      { error: "Could not save the message. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

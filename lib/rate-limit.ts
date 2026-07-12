import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limiter for the chat, backed by Upstash Redis over HTTP (Vercel's
// serverless functions can't hold the TCP connection a normal Redis client
// wants). Sliding window: 5 messages per minute per IP.
//
// If the Upstash env vars aren't set, this stays null and the API route
// just skips the check — so local dev and any deploy without Upstash keeps
// working instead of hard-failing.

const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

export const ratelimit =
  url && token
    ? new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        prefix: "chat",
        analytics: true,
      })
    : null;

// Vercel puts the real visitor IP here. Falls back to a constant locally,
// which is fine: it just means all local requests share one bucket.
export function ipFrom(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "local";
}

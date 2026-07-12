import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Stops anyone from flooding the community chat. Everyone gets 5 messages a
// minute, counted per IP, and the counters live in Upstash Redis.
//
// It's the REST version of Redis on purpose. Vercel functions spin up and die
// per request, so they can't keep a normal Redis connection open.
//
// If the Upstash keys are missing this just stays null and the chat skips the
// check entirely. I'd rather the guestbook keep working without a limiter than
// have the whole thing 500 because one env var didn't get set.

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

// Vercel sticks the visitor's real IP in this header. On localhost there
// isn't one, so everything falls back to sharing a single "local" bucket,
// which is fine for testing.
export function ipFrom(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "local";
}
